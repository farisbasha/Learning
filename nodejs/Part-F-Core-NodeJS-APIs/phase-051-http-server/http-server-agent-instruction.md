# Phase 051: HTTP Server
## Agent Instructions

**Phase**: 051 | **Part**: F - Core Node APIs | **Language**: TypeScript

## Topics
1. `http.createServer()` — create server
2. `IncomingMessage` type — request
3. `ServerResponse` type — response
4. `req.method`, `req.url`, `req.headers`
5. `res.writeHead()`, `res.write()`, `res.end()`
6. Status codes and headers

## Example
```typescript
import http from 'http';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello!' }));
});

server.listen(3000);
```

## Content Instructions
**Notes**: Building HTTP server from scratch
**Summary**: HTTP module API reference
