# Phase 064: Express Basics
## Agent Instructions

**Phase**: 064 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. Creating the Express application instance
2. `Application` type from Express
3. `app.listen()` and callback
4. Basic HTTP methods: `app.get()`, `app.post()`, `app.put()`, `app.delete()`
5. Route handler functions
6. `Request` and `Response` objects introduction
7. Sending responses: `res.send()`, `res.json()`
8. Laravel comparison: Route definition patterns

## Example
```typescript
import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello World!' });
});

app.listen(3000);
```

## Content Instructions
**Notes**: Express fundamentals with type annotations
**Summary**: Express basics quick reference
