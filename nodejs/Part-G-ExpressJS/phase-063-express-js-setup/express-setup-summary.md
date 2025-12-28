# Phase 063: Express.js + TypeScript Setup — Cheatsheet

## Quick Reference

| Task | Command/Code |
|------|--------------|
| Initialize project | `npm init -y` |
| Install Express | `npm install express` |
| Install TypeScript deps | `npm install -D typescript @types/express @types/node tsx` |
| Initialize tsconfig | `npx tsc --init` |
| Run dev server | `npm run dev` (tsx watch) |
| Build for production | `npm run build` (tsc) |
| Start production | `npm start` (node dist/index.js) |

---

## Express Versions Quick Guide

| Version | Status | Key Feature |
|---------|--------|-------------|
| 3.x | Legacy (avoid) | Built-in middleware |
| 4.x | Current standard | Middleware extracted |
| 5.x | Modern (recommended) | Native async/await |

---

## Package.json Setup

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## tsconfig.json (Essential Settings)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Minimal Express Server

```typescript
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello World!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

---

## Project Structure

```
my-app/
├── src/
│   ├── index.ts           # Entry point
│   ├── app.ts             # Express config
│   ├── routes/            # Route definitions
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── types/             # Custom types
├── dist/                  # Compiled JS
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## Express Type Imports

```typescript
import express, {
    Application,   // Type for app
    Request,       // Type for req
    Response,      // Type for res
    NextFunction   // Type for next()
} from 'express';
```

---

## Common Middleware Setup

```typescript
// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Custom logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
```

---

## Error Handlers

```typescript
// 404 - Not Found (place after all routes)
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// 500 - Error handler (must have 4 params)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
```

---

## Laravel vs Express Quick Map

| Laravel | Express |
|---------|---------|
| `php artisan serve` | `npm run dev` |
| `Route::get()` | `app.get()` |
| `$request->input()` | `req.body` |
| `$request->query()` | `req.query` |
| `return response()->json()` | `res.json()` |
| `return redirect()` | `res.redirect()` |
| Middleware class | `(req, res, next) => {}` |

---

## Hot Reload Options

| Tool | Command | Best For |
|------|---------|----------|
| tsx watch | `tsx watch src/index.ts` | Quick setup |
| nodemon + tsx | `nodemon --exec tsx` | Custom config |
| ts-node-dev | `ts-node-dev src/index.ts` | Legacy |

---

## Critical Settings Checklist

- [ ] `"type": "module"` in package.json
- [ ] `"esModuleInterop": true` in tsconfig.json
- [ ] `"module": "NodeNext"` in tsconfig.json
- [ ] `"moduleResolution": "NodeNext"` in tsconfig.json
- [ ] `@types/express` installed
- [ ] `@types/node` installed

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot use import statement` | Add `"type": "module"` to package.json |
| `import express` doesn't work | Enable `esModuleInterop` |
| Port already in use | `lsof -i :3000` then `kill -9 <PID>` |
| Types not found | Install `@types/express` |

---

## Useful cURL Commands for Testing

```bash
# GET request
curl http://localhost:3000

# POST with JSON
curl -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# POST with form data
curl -X POST http://localhost:3000/api \
  -d "key=value"
```

---

## Remember

- Express is **minimal** — you choose the structure
- Always use **TypeScript** for new projects
- **tsx** is faster than ts-node for development
- Export your **app** for testing
- Express 5 catches **async errors** automatically
- Place **404 handler** after all routes
- Place **error handler** last (needs 4 params)
