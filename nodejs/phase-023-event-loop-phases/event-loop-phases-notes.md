# Phase 023: Event Loop Phases Deep Dive — Notes

The Event Loop is organized into **Phases**, each with its own queue. Understanding these phases is critical for debugging timing issues.

---

## 1. The Six Phases

```
   ┌───────────────────────────┐
┌─>│        ⏰ TIMERS          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │    📬 PENDING CALLBACKS   │  ← System I/O errors
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
│  │     🔧 IDLE, PREPARE      │  ← Internal only
│  └─────────────┬─────────────┘      
│                ↓
│  ┌─────────────┴─────────────┐
│  │         📥 POLL           │  ← fs.readFile, http.get, db.query
│  └─────────────┬─────────────┘      (THE HEART ❤️)
│                ↓
│  ┌─────────────┴─────────────┐
│  │         ✅ CHECK          │  ← setImmediate
│  └─────────────┬─────────────┘
│                ↓
│  ┌─────────────┴─────────────┐
└──┤    🚪 CLOSE CALLBACKS     │  ← socket.on('close')
   └───────────────────────────┘
```

| Phase | What Goes Here | Example |
| :--- | :--- | :--- |
| **Timers** | setTimeout, setInterval callbacks | `setTimeout(fn, 100)` |
| **Pending** | OS-level errors | TCP connection errors |
| **Idle, Prepare** | Internal Node.js use | Nothing from your code |
| **Poll** | I/O callbacks (files, network, db) | `fs.readFile(callback)` |
| **Check** | setImmediate callbacks | `setImmediate(fn)` |
| **Close** | Cleanup callbacks | `socket.on('close', fn)` |

---

## 2. The Poll Phase Decision Tree

This is the most important phase. Here's exactly what it checks:

```
┌─────────────────────────────────────────────────────────────┐
│  📥 POLL PHASE                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Is Poll Queue empty?                                       │
│  │                                                          │
│  ├── NO  → Run all callbacks in queue                       │
│  │                                                          │
│  └── YES → Check next:                                      │
│            │                                                │
│            ├── setImmediate scheduled?                      │
│            │   └── YES → Move to CHECK phase                │
│            │                                                │
│            ├── Any Timers ready?                            │
│            │   └── YES → Continue loop to reach TIMERS      │
│            │                                                │
│            └── Nothing?                                     │
│                └── WAIT HERE for I/O events                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Key Rules

### Rule 1: Loop NEVER Skips Phases
The loop **always** goes in order: `Timers → Pending → Idle → Poll → Check → Close → Timers...`

Empty phases are passed through instantly (0ms), but never skipped.

### Rule 2: Microtasks Run Between Phases
After **every callback** (and between phases), Node.js checks:
1. `process.nextTick()` queue (VIP)
2. `Promise.then()` queue (Microtasks)

### Rule 3: setImmediate vs setTimeout(0)
- **At root level**: Order is unpredictable
- **Inside I/O callback**: `setImmediate` ALWAYS runs first

---

## 4. 🎯 THE ONE EXAMPLE THAT COVERS EVERYTHING

```javascript
const fs = require('fs');

console.log('1: Sync Start');

// Timers Phase
setTimeout(() => console.log('2: setTimeout 0ms'), 0);
setTimeout(() => console.log('3: setTimeout 100ms'), 100);

// Check Phase
setImmediate(() => console.log('4: setImmediate'));

// Poll Phase (I/O)
fs.readFile(__filename, () => {
    console.log('5: File read complete');
    
    // Inside I/O callback - setImmediate ALWAYS beats setTimeout
    setTimeout(() => console.log('6: setTimeout inside I/O'), 0);
    setImmediate(() => console.log('7: setImmediate inside I/O'));
    
    // Microtasks inside I/O
    process.nextTick(() => console.log('8: nextTick inside I/O'));
    Promise.resolve().then(() => console.log('9: Promise inside I/O'));
});

// Microtasks (run before any phase)
process.nextTick(() => console.log('10: nextTick'));
Promise.resolve().then(() => console.log('11: Promise'));

console.log('12: Sync End');
```

---

## 5. Step-by-Step Execution

### STEP 1: Run Synchronous Code
```
Output: "1: Sync Start"

Queues populated:
  Timers:    [callback-2 (0ms), callback-3 (100ms)]
  Check:     [callback-4]
  nextTick:  [callback-10]
  Microtask: [callback-11]
  
Worker Pool: Reading file in background...

Output: "12: Sync End"
```

### STEP 2: Call Stack Empty → Run Microtasks
```
Check nextTick queue → Run callback-10
Output: "10: nextTick"

Check microtask queue → Run callback-11
Output: "11: Promise"
```

### STEP 3: Enter TIMERS Phase
```
Is callback-2 (0ms) ready? → YES
Output: "2: setTimeout 0ms"

Check microtasks → None

Is callback-3 (100ms) ready? → NO (only 1ms passed)
Move to next phase
```

### STEP 4: Enter POLL Phase
```
Poll queue empty? YES
setImmediate scheduled? YES → Move to CHECK phase
(Don't wait, don't check timers)
```

### STEP 5: Enter CHECK Phase
```
Run callback-4
Output: "4: setImmediate"

Check microtasks → None
Move to CLOSE phase
```

### STEP 6: Enter CLOSE Phase
```
Queue empty → Pass through (0ms)
Loop back to TIMERS
```

### STEP 7: Back to TIMERS Phase (Loop 2)
```
Is callback-3 (100ms) ready? → NO (still waiting)
Move to POLL phase
```

### STEP 8: POLL Phase (Loop 2)
```
Poll queue empty? YES
setImmediate scheduled? NO
Timers ready? NO

→ WAIT HERE for I/O...
```

### STEP 9: File Read Completes! (Let's say at 15ms)
```
OS wakes Event Loop
Poll queue now has: [callback-5]

Run callback-5:
  Output: "5: File read complete"
  
  Inside callback:
    - setTimeout(6) added to Timers queue
    - setImmediate(7) added to Check queue
    - nextTick(8) added to nextTick queue
    - Promise(9) added to microtask queue
    
  Callback-5 sync code done
```

### STEP 10: After I/O Callback → Run Microtasks
```
Check nextTick queue → Run callback-8
Output: "8: nextTick inside I/O"

Check microtask queue → Run callback-9
Output: "9: Promise inside I/O"
```

### STEP 11: Continue to CHECK Phase
```
(We were in POLL, next is CHECK)

Run callback-7
Output: "7: setImmediate inside I/O"

Check microtasks → None
```

### STEP 12: CLOSE Phase → TIMERS Phase
```
CLOSE: Empty → Pass through

TIMERS: 
  callback-6 (0ms) ready? YES
  Output: "6: setTimeout inside I/O"
  
  callback-3 (100ms) ready? NO (only ~15ms passed)
```

### STEP 13: Loop continues... (at 100ms)
```
Eventually callback-3 becomes ready
Output: "3: setTimeout 100ms"

No more callbacks → Process exits
```

---

## 6. Final Output

```
1: Sync Start
12: Sync End
10: nextTick
11: Promise
2: setTimeout 0ms
4: setImmediate
5: File read complete
8: nextTick inside I/O
9: Promise inside I/O
7: setImmediate inside I/O
6: setTimeout inside I/O
3: setTimeout 100ms
```

---

## 7. Key Observations

| Observation | Why |
| :--- | :--- |
| `1, 12` first | Sync code always runs first |
| `10` before `11` | nextTick has higher priority than Promise |
| `2` before `4` | At root level, order can vary (here setTimeout won) |
| `4` before `5` | setImmediate ran before file completed |
| `8, 9` after `5` | Microtasks run right after callback ends |
| `7` before `6` | **Inside I/O**, setImmediate ALWAYS beats setTimeout |
| `3` last | Had to wait for 100ms timer |

---

## 8. Quick Reference

| Code | Queue | Phase |
| :--- | :--- | :--- |
| `setTimeout(fn, ms)` | Timers | TIMERS |
| `setInterval(fn, ms)` | Timers | TIMERS |
| `setImmediate(fn)` | Check | CHECK |
| `fs.readFile(callback)` | Poll | POLL |
| `http.get(callback)` | Poll | POLL |
| `process.nextTick(fn)` | nextTick | Between ALL phases |
| `Promise.then(fn)` | Microtask | Between ALL phases |
