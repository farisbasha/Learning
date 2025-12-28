# Phase 063: Express.js + TypeScript Setup

## Overview

Welcome to **Part G** — the Express.js section! This is where your Node.js journey gets practical. Express.js is the most popular web framework for Node.js, and understanding it deeply is essential for any Node.js developer.

In this phase, we'll set up a production-ready Express.js project with TypeScript from scratch. We'll explore Express's history, understand why it became the de-facto standard, and configure a modern development workflow.

---

## What is Express.js?

### The Definition

Express.js is a **minimal, unopinionated web framework** for Node.js. It provides a thin layer of fundamental web application features without obscuring Node.js's native capabilities.

```typescript
// The simplest Express server
import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000);
```

### Why "Minimal and Unopinionated"?

Unlike Laravel (which is **opinionated** and provides structure for everything), Express gives you freedom:

| Aspect | Laravel (Opinionated) | Express (Unopinionated) |
|--------|----------------------|-------------------------|
| Folder structure | Defined (`app/`, `routes/`, `resources/`) | You decide |
| ORM | Eloquent (included) | Choose: Prisma, TypeORM, Sequelize, etc. |
| Template engine | Blade (included) | Choose: EJS, Pug, Handlebars, or none |
| Authentication | Built-in (Sanctum, Passport) | Choose: Passport.js, JWT, custom |
| Validation | Built-in rules | Choose: Zod, Joi, express-validator |
| Configuration | `.env` + `config/` | You decide |

**Key insight**: Express is more like a routing library with middleware support than a full framework. This is why many developers use **meta-frameworks** like NestJS (which we'll learn later) for large applications.

---

## Express History and Versions

Understanding Express's evolution helps you work with legacy codebases and understand why certain patterns exist.

### Timeline

```
2010 - Express created by TJ Holowaychuk
     - Inspired by Ruby's Sinatra framework
     - Node.js was only 1 year old!

2014 - Express 4.x released (MAJOR changes)
     - Middleware extracted to separate packages
     - Router improvements
     - This is what most tutorials still teach

2024 - Express 5.x released (after 10 years!)
     - Promise support in route handlers
     - Improved error handling
     - Better TypeScript support

2025 - Express 5.x is now recommended for new projects
```

### Version Differences That Matter

#### Express 3.x (Legacy - avoid)
```javascript
// Express 3 had built-in middleware
var express = require('express');
var app = express();

// These were built into Express 3
app.use(express.bodyParser());  // REMOVED in Express 4
app.use(express.cookieParser()); // REMOVED in Express 4
app.use(express.session());      // REMOVED in Express 4
```

#### Express 4.x (Current standard)
```typescript
// Express 4 extracted middleware to separate packages
import express from 'express';
import bodyParser from 'body-parser';  // Separate package
import cookieParser from 'cookie-parser'; // Separate package
import session from 'express-session'; // Separate package

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
```

**Note**: Since Express 4.16+, `express.json()` and `express.urlencoded()` are back as built-in, so you don't need `body-parser` for JSON/form parsing anymore.

#### Express 5.x (Modern - recommended)
```typescript
// Express 5 supports async/await natively
import express from 'express';

const app = express();

// Express 5: Async errors are automatically caught!
app.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id); // If this throws, Express catches it
    res.json(user);
});

// Express 4: You had to wrap everything manually
app.get('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        next(err); // Had to manually pass errors
    }
});
```

### Which Version Should You Use?

For **new projects in 2025**: Use Express 5.x
- Native async/await support
- Better error handling
- Improved TypeScript types

For **existing projects**: Check `package.json`
- If Express 4.x, understand the async wrapper pattern
- Consider migrating to 5.x for new features

---

## Installing Express with TypeScript

### Step 1: Initialize Your Project

```bash
# Create project directory
mkdir my-express-app
cd my-express-app

# Initialize package.json
npm init -y

# The -y flag accepts all defaults (like pressing Enter repeatedly)
```

### Step 2: Install Dependencies

```bash
# Core dependencies (production)
npm install express

# Development dependencies
npm install -D typescript @types/express @types/node tsx
```

Let's understand each package:

| Package | Type | Purpose |
|---------|------|---------|
| `express` | Production | The Express framework itself |
| `typescript` | Dev | TypeScript compiler |
| `@types/express` | Dev | TypeScript type definitions for Express |
| `@types/node` | Dev | TypeScript type definitions for Node.js APIs |
| `tsx` | Dev | Run TypeScript directly without compiling |

### Step 3: Initialize TypeScript Configuration

```bash
# Create tsconfig.json with sensible defaults
npx tsc --init
```

This creates a `tsconfig.json` with many options. Let's configure it for Express:

```json
{
  "compilerOptions": {
    // Output settings
    "target": "ES2022",              // Modern JavaScript output
    "module": "NodeNext",            // Node.js ESM module resolution
    "moduleResolution": "NodeNext",  // Required for NodeNext modules
    "outDir": "./dist",              // Compiled JS goes here
    "rootDir": "./src",              // Source files location

    // Strict type checking (KEEP THESE ON!)
    "strict": true,                  // Enable all strict checks
    "esModuleInterop": true,         // Allows: import express from 'express'
    "skipLibCheck": true,            // Skip type checking of .d.ts files (faster)
    "forceConsistentCasingInFileNames": true,

    // Source maps for debugging
    "sourceMap": true,
    "declaration": true,             // Generate .d.ts files

    // Additional helpful options
    "resolveJsonModule": true,       // Allow importing JSON files
    "noUnusedLocals": true,          // Error on unused variables
    "noUnusedParameters": true,      // Error on unused parameters
    "noImplicitReturns": true        // Error if not all paths return
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Key TypeScript Settings Explained

#### `esModuleInterop: true`
This is **critical** for Express. Without it:

```typescript
// Without esModuleInterop (DOESN'T WORK)
import express from 'express'; // Error!
import * as express from 'express'; // You'd have to do this

// With esModuleInterop (WORKS - preferred)
import express from 'express'; // Clean and standard
```

#### `module: "NodeNext"` vs `"CommonJS"`

```typescript
// NodeNext (ESM) - Modern, recommended
import express from 'express';
export const app = express();

// CommonJS - Legacy
const express = require('express');
module.exports = { app: express() };
```

For new projects, use NodeNext. But know that many tutorials still show CommonJS.

---

## Project Structure

### Minimal Structure (Starting Point)

```
my-express-app/
├── src/
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
└── .gitignore
```

### Recommended Structure (Scalable)

```
my-express-app/
├── src/
│   ├── index.ts          # App entry point
│   ├── app.ts            # Express app configuration
│   ├── routes/           # Route definitions
│   │   ├── index.ts      # Route aggregator
│   │   └── users.ts      # User routes
│   ├── controllers/      # Route handlers (business logic)
│   │   └── userController.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── services/         # Business logic (reusable)
│   │   └── userService.ts
│   ├── models/           # Data models / types
│   │   └── User.ts
│   ├── config/           # Configuration
│   │   └── index.ts
│   └── types/            # Custom TypeScript types
│       └── express.d.ts  # Express type extensions
├── dist/                 # Compiled JavaScript (gitignored)
├── tests/                # Test files
├── package.json
├── tsconfig.json
└── .gitignore
```

### Laravel Comparison

| Laravel | Express Equivalent |
|---------|-------------------|
| `routes/web.php`, `routes/api.php` | `src/routes/` |
| `app/Http/Controllers/` | `src/controllers/` |
| `app/Http/Middleware/` | `src/middleware/` |
| `app/Services/` | `src/services/` |
| `app/Models/` | `src/models/` |
| `config/` | `src/config/` |
| `public/` | `public/` or `static/` |

---

## Your First Express + TypeScript Server

### Basic Server (`src/index.ts`)

```typescript
import express, { Request, Response } from 'express';

// Create Express application instance
const app = express();

// Define the port (use environment variable or default)
const PORT = process.env.PORT || 3000;

// Basic route - responds to GET /
app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express + TypeScript!');
});

// Health check endpoint (common pattern)
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
```

### Understanding the Types

```typescript
import express, {
    Application,  // Type for the app object
    Request,      // Type for request object
    Response,     // Type for response object
    NextFunction  // Type for next() in middleware
} from 'express';

// Explicit typing (optional but educational)
const app: Application = express();

// Route handler with explicit types
app.get('/users/:id', (req: Request, res: Response): void => {
    const userId: string = req.params.id;
    res.json({ id: userId });
});

// Middleware with explicit types
const loggerMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.log(`${req.method} ${req.path}`);
    next();
};
```

**Note**: TypeScript can infer these types, so explicit typing is optional:

```typescript
// TypeScript infers req as Request, res as Response
app.get('/', (req, res) => {
    res.send('Types are inferred!');
});
```

---

## Development Workflow

### Option 1: Using `tsx` (Recommended for Development)

`tsx` is a modern alternative to `ts-node` that's faster and handles ESM better.

```bash
# Run once
npx tsx src/index.ts

# Watch mode (restarts on file changes)
npx tsx watch src/index.ts
```

**Why `tsx` over `ts-node`?**
- Faster startup (uses esbuild under the hood)
- Better ESM support
- No need for `tsconfig.json` tweaks
- Just works!

### Option 2: Using `nodemon` + `tsx`

```bash
# Install nodemon for more control over file watching
npm install -D nodemon
```

Create `nodemon.json`:
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "tsx src/index.ts"
}
```

### Option 3: Classic TypeScript Compilation

For production, you compile TypeScript to JavaScript:

```bash
# Compile TypeScript to JavaScript
npx tsc

# Run the compiled JavaScript
node dist/index.js
```

### Configure package.json Scripts

```json
{
  "name": "my-express-app",
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

**Script explanations**:
- `npm run dev` — Development with hot reload
- `npm run build` — Compile for production
- `npm start` — Run production build
- `npm run typecheck` — Check types without compiling

### Laravel Comparison

| Laravel Command | Express Equivalent |
|-----------------|-------------------|
| `php artisan serve` | `npm run dev` |
| (No equivalent - PHP is interpreted) | `npm run build` |
| `php artisan serve` (production) | `npm start` |
| (PHP doesn't need this) | `npm run typecheck` |

---

## Understanding the `@types/express` Package

### What Are Type Definitions?

Express is written in JavaScript, not TypeScript. The `@types/express` package provides TypeScript type information so you get:

1. **IntelliSense** — Autocomplete suggestions
2. **Type checking** — Catch errors at compile time
3. **Documentation** — Hover over methods to see docs

### Exploring the Types

```typescript
import { Request, Response, NextFunction, Application } from 'express';

// The Request object has many typed properties
app.get('/example', (req: Request, res: Response) => {
    // All of these are typed!
    req.params;       // { [key: string]: string }
    req.query;        // ParsedQs (query string parameters)
    req.body;         // any (we'll type this later!)
    req.headers;      // IncomingHttpHeaders
    req.cookies;      // { [key: string]: string }
    req.method;       // string
    req.path;         // string
    req.ip;           // string | undefined
    req.hostname;     // string

    // Response methods are typed too
    res.status(200);           // Returns Response (chainable)
    res.json({ ok: true });    // Accepts any
    res.send('text');          // Accepts various types
    res.redirect('/login');    // Accepts string
    res.render('view', {});    // For template engines
});
```

### Extending Express Types (Preview)

Later, you'll need to add custom properties to `Request` (like `req.user` after authentication). This is done with **declaration merging**:

```typescript
// src/types/express.d.ts
import { User } from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: User;  // Now req.user is typed!
        }
    }
}
```

We'll cover this in depth in the authentication phases.

---

## Complete Project Setup Walkthrough

Let's create a complete, production-ready project from scratch:

### Step 1: Create Project

```bash
mkdir express-ts-starter
cd express-ts-starter
npm init -y
```

### Step 2: Install Dependencies

```bash
# Production dependencies
npm install express

# Development dependencies
npm install -D typescript @types/express @types/node tsx
```

### Step 3: Create Configuration Files

**tsconfig.json**:
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
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "declaration": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json** (update):
```json
{
  "name": "express-ts-starter",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^5.0.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**.gitignore**:
```
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# TypeScript cache
*.tsbuildinfo
```

### Step 4: Create Source Files

**src/index.ts**:
```typescript
import express, { Request, Response, NextFunction } from 'express';

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware for parsing JSON bodies
app.use(express.json());

// Built-in middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Simple request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Express + TypeScript!',
        version: '1.0.0'
    });
});

app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`
    });
});

// Example POST endpoint
app.post('/echo', (req: Request, res: Response) => {
    res.json({
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// 404 handler (must be after all other routes)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        statusCode: 404
    });
});

// Error handler (must be last, with 4 parameters)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        statusCode: 500
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`
    ====================================
      Server is running!

      Local:   http://localhost:${PORT}
      Health:  http://localhost:${PORT}/health

      Press Ctrl+C to stop
    ====================================
    `);
});

export default app;
```

### Step 5: Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# Test it
curl http://localhost:3000
curl http://localhost:3000/health
curl -X POST http://localhost:3000/echo -H "Content-Type: application/json" -d '{"hello":"world"}'
```

---

## Hot Reloading Deep Dive

### Why Hot Reloading Matters

Without hot reloading:
```bash
# Make a change to your code
# Stop the server (Ctrl+C)
# Restart the server
npm run dev
# Repeat for every change...
```

With hot reloading:
```bash
# Start once
npm run dev
# Make changes - server restarts automatically!
```

### `tsx watch` vs `nodemon`

| Feature | `tsx watch` | `nodemon` |
|---------|-------------|-----------|
| Setup | Zero config | Requires config |
| Speed | Faster (esbuild) | Slower |
| Customization | Limited | Extensive |
| File patterns | Default TS | Highly configurable |
| Use case | Simple projects | Complex needs |

### Advanced nodemon Configuration

For more control, use `nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "node_modules"
  ],
  "exec": "tsx src/index.ts",
  "delay": "500",
  "env": {
    "NODE_ENV": "development"
  },
  "verbose": true
}
```

---

## Common Mistakes and Gotchas

### 1. Forgetting `type: "module"` in package.json

```json
// package.json
{
  "type": "module"  // Required for ESM imports!
}
```

**Symptom**: `SyntaxError: Cannot use import statement outside a module`

### 2. Wrong TypeScript Module Setting

```json
// tsconfig.json - WRONG for ESM
{
  "compilerOptions": {
    "module": "CommonJS"  // Use "NodeNext" instead!
  }
}
```

**Symptom**: Compiled code uses `require()` instead of `import`

### 3. Missing `esModuleInterop`

```json
// tsconfig.json
{
  "compilerOptions": {
    "esModuleInterop": true  // Required!
  }
}
```

**Symptom**: `import express from 'express'` doesn't work

### 4. Port Already in Use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Better solution**: Use a different port or implement port fallback:

```typescript
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${Number(PORT) + 1}...`);
        server.listen(Number(PORT) + 1);
    }
});
```

### 5. Not Exporting the App

```typescript
// WRONG - can't import app for testing
const app = express();
app.listen(3000);

// RIGHT - export for testing
const app = express();
export default app;

// Only listen if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(3000);
}
```

---

## PHP/Laravel Comparison Summary

| Concept | Laravel | Express + TypeScript |
|---------|---------|---------------------|
| Framework philosophy | Opinionated, batteries-included | Minimal, choose your tools |
| Project init | `laravel new app` | Manual setup |
| Dev server | `php artisan serve` | `npm run dev` (tsx watch) |
| Configuration | `.env` + `config/` | Environment variables |
| Route definition | `routes/web.php` | `app.get()`, `app.post()`, etc. |
| Middleware | `app/Http/Middleware/` | Functions with (req, res, next) |
| Request object | `$request` (Illuminate\Http\Request) | `req` (express.Request) |
| Response object | `response()` helper | `res` (express.Response) |
| JSON response | `return response()->json()` | `res.json()` |
| Static files | `public/` folder | `express.static()` middleware |
| Hot reload | Built into Vite | `tsx watch` or `nodemon` |

---

## Key Takeaways

1. **Express is minimal** — Unlike Laravel, you choose and configure everything yourself

2. **TypeScript setup requires several packages** — `typescript`, `@types/express`, `@types/node`, and `tsx`

3. **Use `tsx` for development** — It's the modern, fast way to run TypeScript

4. **ESM is the future** — Use `"type": "module"` and `"module": "NodeNext"`

5. **Express 5.x is recommended** — Native async/await support and better error handling

6. **Structure is up to you** — But follow conventions (routes/, controllers/, middleware/)

7. **The app should be exported** — For testing and modularity

8. **`esModuleInterop` is required** — For clean `import express from 'express'` syntax

---

## What's Next?

In the upcoming phases, we'll build on this foundation:
- **Phase 064**: Request and Response objects in depth
- **Phase 065**: Routing patterns (Express Router)
- **Phase 066**: Middleware fundamentals
- And much more through Phase 085!

Your Express + TypeScript journey has begun. This setup will be the foundation for everything else in Part G.
