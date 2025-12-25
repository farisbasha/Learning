# Phase 051: HTTP Server — Summary Cheatsheet

## 🏗️ Core API

```typescript
const server = http.createServer((req, res) => {
  // req = Request (Incoming info)
  // res = Response (Outgoing info)
});
server.listen(3000);
```

---

## 📥 Request Data (`req`)

- **`req.url`**: String path (e.g. `/api/users`).
- **`req.method`**: HTTP Verb (`GET`, `POST`, etc.).
- **`req.headers`**: Key-value pairs of sent headers.

---

## 📤 Response Data (`res`)

- **`res.statusCode = 200;`**
- **`res.setHeader('Key', 'Value');`**
- **`res.writeHead(200, { 'Content-Type': 'text/html' });`**
- **`res.write('Chunk');`**
- **`res.end('Last chunk and close');`**

---

## 💡 Remember
- `http.createServer` creates the server object.
- `server.listen` actually opens the port.
- Always include a `Content-Type` header so browsers know how to render your data.
- **Next Up**: Learn how to handle different URLs and request bodies manually (Phase 052).
