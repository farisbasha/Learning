# Phase 034: Promise Combinators — Summary Cheatsheet

## 🚀 The Multi-Taskers

### `Promise.all([p1, p2])`
- **Wait for**: All success.
- **Fail on**: First error.
- **Result**: Array of values.

### `Promise.allSettled([p1, p2])`
- **Wait for**: All to finish.
- **Fail on**: Never.
- **Result**: Array of objects with `status` and `value`/`reason`.

### `Promise.race([p1, p2])`
- **Wait for**: First one to settle.
- **Result**: First value or First error.

### `Promise.any([p1, p2])`
- **Wait for**: First success.
- **Fail on**: Only if ALL fail.
- **Result**: First successful value.

---

## ⏱️ Parallel Performance
Do not do this:
```javascript
const a = await getA();
const b = await getB(); // Total time = timeA + timeB
```
Do this:
```javascript
const [a, b] = await Promise.all([getA(), getB()]); // Total time = max(timeA, timeB)
```

---

## 💡 Remember
- Correct error handling is essential with `Promise.all()`.
- Use `allSettled()` if you don't care if some tasks fail (e.g. sending different notification emails).
- `race()` is your go-to for implementing maximum execution timeouts.
- **Part D Progression**: Callbacks → Events → Promises → **Combining Promises** → Async/Await (Next!)
