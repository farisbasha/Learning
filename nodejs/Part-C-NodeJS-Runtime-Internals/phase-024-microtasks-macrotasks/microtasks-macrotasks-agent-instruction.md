# Phase 024: Microtasks vs Macrotasks
## Agent Instructions

**Phase**: 024 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. Macrotasks: `setTimeout`, `setInterval`, `setImmediate`, I/O
2. Microtasks: `Promise.then`, `process.nextTick`, `queueMicrotask`
3. `process.nextTick()` — highest priority microtask
4. Promise callbacks as microtasks
5. `setImmediate()` vs `setTimeout(fn, 0)`
6. Execution order puzzles with examples
7. Microtask starvation problems
8. Best practices

## Key Rule
> Microtasks run BETWEEN event loop phases
> All microtasks drain before next phase

## Code Example
```typescript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');
// Output: 1, 5, 4, 3, 2
```

## Content Instructions
**Notes**: Execution order explained with puzzles
**Summary**: Microtask vs Macrotask cheatsheet
