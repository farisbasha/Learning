# Phase 052: HTTP Routing & Body — Notes

When building a raw HTTP server without a framework, you have to manually handle path differentiation and incoming data (request bodies). This phase shows you the complexity that a library like Express handles for you.

---

## 1. Manual Routing

Since Node only gives you the full URL, you have to use a `switch` or `if` statement to decide what code to run.

```typescript
const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (url === '/' && method === 'GET') {
        res.end("Welcome Home");
    } else if (url === '/api/user' && method === 'GET') {
        res.end(JSON.stringify({ name: "Basha" }));
    } else {
        res.statusCode = 404;
        res.end("Not Found");
    }
});
```

---

## 2. Handling Request Bodies (Streams)

In Node.js, the request body doesn't arrive all at once. It arrives in "chunks" (streams). You have to collect these chunks and combine them.

```typescript
const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = '';

        // Listen for chunks of data
        req.on('data', chunk => {
            body += chunk.toString();
        });

        // Finished receiving data
        req.on('end', () => {
            const data = JSON.parse(body);
            console.log("Received:", data);
            res.end("Data received!");
        });
    }
});
```

---

## 3. Parsing Query Strings

For URLs like `/api/search?q=node`, you need the `URL` class (Phase 050) to extract the values.

```typescript
const myUrl = new URL(req.url, `http://${req.headers.host}`);
const query = myUrl.searchParams.get('q');
```

---

## 4. Why this is difficult

1. **Complexity**: You have to manually handle streaming, encoding, and error checking for every route.
2. **Scalability**: An application with 50 routes would have a massive, unreadable `switch` statement.
3. **Middleware**: Adding a "middleware" (code that runs before every request, like Auth) would require manual function wrapping.

---

## 5. Key Takeaways
1. **Streams**: Understand that request data is a stream. You don't "have" it until the `end` event fires.
2. **Encapsulation**: This manual process is why frameworks like Express were invented—to provide a clean API for routing and body parsing.
3. **Status Codes**: Always explicitly set a 404 if no route matches.
4. **Summary**: Now you know the "hard way." This will help you appreciate how easy Express makes your life.
