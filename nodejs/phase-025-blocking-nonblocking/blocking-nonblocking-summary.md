# Phase 025: Blocking vs. Non-Blocking — Summary Cheatsheet

## 🥊 The Fight

| Type | Analogy | Node Status |
|------|---------|-------------|
| **Blocking** | Standing in line until you get your coffee. | ❌ BAD for servers. |
| **Non-Blocking** | Getting a buzzer that rings when coffee is ready. | ✅ GOOD (Standard). |

---

## 🔎 How to spot Blocking Code

1. Any function ending in **`Sync`** (e.g., `fs.readFileSync`).
2. Heavy loops (thousands of items with complex logic).
3. Large `JSON.parse` or `JSON.stringify` calls.
4. Synchronous Cryptography (`bcrypt.hashSync`).
5. Large regular expressions on large strings.

---

## 🛠️ The Solution Strategy

- **I/O Task?** Use `await` and `Promises`.
- **CPU Task?** 
  - Offload to a **Worker Thread**.
  - Move to a **Microservice** (using another language or a background worker).
  - Use `setImmediate()` to break it into chunks.

---

## 💡 Remember
- In Node, "Fast code" is code that finishes quickly and yields control back to the Event Loop.
- One bad user can crash/freeze your server if you allow them to trigger a blocking operation.
- Always check the documentation: If an API doesn't mention a callback or returning a Promise, it's likely blocking!
