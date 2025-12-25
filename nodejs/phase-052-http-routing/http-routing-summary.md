# Phase 052: HTTP Routing — Summary Cheatsheet

## 🛣️ Basic Routing Pattern
```typescript
if (req.url === '/users') { ... }
else if (req.url === '/orders') { ... }
else { res.statusCode = 404; }
```

---

## 📥 Collecting Body Chunks
```typescript
let buffer = [];
req.on('data', chunk => buffer.push(chunk));
req.on('end', () => {
  const body = Buffer.concat(buffer).toString();
  // Body is ready here
});
```

---

## 🔎 Extracts

| Need | Code |
|------|------|
| **Method** | `req.method` (GET, POST, etc.) |
| **Path** | `new URL(req.url, host).pathname` |
| **Params**| `new URL(req.url, host).searchParams` |

---

## 💡 Remember
- Express uses the same `req` and `res` objects under the hood.
- Managing bodies manually is error-prone and tedious.
- Always check the `method` AND the `url` to identify a route uniquely.
