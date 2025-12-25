# Phase 051: HTTP Server — Notes

In the Node.js world, your code **is** the server. You don't need Apache or Nginx to run a basic application. The `http` module provides the core functionality to listen for requests and send responses.

---

## 1. Creating a Basic Server

The `createServer` method takes a callback with two objects: `IncomingMessage` (Request) and `ServerResponse` (Response).

```typescript
import http from 'http';

const server = http.createServer((req, res) => {
    // 1. Set headers
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    
    // 2. Send body
    res.write("Hello from Node.js!");
    
    // 3. Close connection
    res.end();
});

// Start listening
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

---

## 2. Request Object (`req`)

The request object tells you what the user wants.
- **`req.url`**: The path (e.g., `/home`).
- **`req.method`**: GET, POST, PUT, DELETE.
- **`req.headers`**: Cookies, Auth tokens, User-Agent.

---

## 3. Response Object (`res`)

The response object is what you send back.
- **`res.statusCode`**: Set the HTTP code (200, 404, 500).
- **`res.setHeader(name, value)`**: Set one header at a time.
- **`res.writeHead(code, headers)`**: Set code and headers at once.
- **`res.end(data)`**: Finish the response and optionally send the last bit of data.

---

## 4. Headers and Content Types

If you want to send JSON (most common for APIs), you must set the `Content-Type`.

```typescript
const data = { id: 1, name: "Basha" };

res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify(data));
```

---

## 5. Persistence

Unlike PHP, where a script starts and dies per request, this `server` object stays in memory. If you define a variable outside the `createServer` callback, it is **global to all users** and stays alive until you stop the server.

---

## 6. Key Takeaways
1. **`res.end()` is mandatory**: If you forget to call it, the browser will just spin forever until it times out.
2. **One Response only**: You cannot call `res.end()` twice. After the first call, the connection is closed.
3. **Event based**: Listening for a request is an event. Your main thread stays open and ready for the next one.
4. **Summary**: This is the "naked" way to build a server. It is powerful but tedious, which is why we usually use a framework like **Express** (Phase 063).
