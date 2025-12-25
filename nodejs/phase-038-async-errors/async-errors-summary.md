# Phase 038: Async Errors — Summary Cheatsheet

## 🛡️ Best Practices

1. **Always `try/catch`** around `await` calls.
2. **Return results**, don't just log and continue.
3. Use **Custom Error Classes** to categorize failures.
4. Set up a **Global Handler** for `unhandledRejection`.

---

## 🏗️ The Professional Handler

```typescript
try {
  const result = await someTask();
} catch (err) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof AuthError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Generic fallback
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
```

---

## 🚨 The "Ghost" Rejection
```typescript
// ❌ WRONG: This will crash/log unhandled error
doAsyncTask(); 

// ✅ RIGHT
await doAsyncTask(); 
// OR
doAsyncTask().catch(handleError);
```

---

## 💡 Remember
- An error in an async function is just a **rejected Promise**.
- `throw` inside an async function is equivalent to `Promise.reject()`.
- Error handling is not just about catching crashes; it's about providing **meaningful feedback** to users and developers.
- **Part D Complete!** 🎉 You are now an Async Programming expert.
