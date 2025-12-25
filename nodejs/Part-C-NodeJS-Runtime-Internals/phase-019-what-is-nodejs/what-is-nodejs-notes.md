# Phase 019: What is Node.js — Notes

For a PHP developer, Node.js can feel like a complete inversion of how a server works. In PHP, the server (Apache/Nginx) is already there, and your code just handles a single request. In Node.js, **your code IS the server.**

---

## 1. What exactly is Node.js?

Node.js is **not** a programming language. It is a **JavaScript Runtime** built on Google Chrome's **V8 JavaScript Engine**.

### The "Anatomy" of Node.js:
1. **V8 Engine**: Developed by Google for Chrome. It compiles JavaScript directly to machine code.
2. **libuv**: A C++ library that gives Node.js its "asynchronous" powers. It manages the **Event Loop** and the **Worker Pool**.
3. **Bindings**: The bridge that connects JavaScript (V8) with the C++ background (libuv).

### Threads vs. Process:
- **One Process**: Node.js starts 1 process per application.
- **Main Thread**: This is where **ALL** your JavaScript runs.
- **Worker Pool (libuv threads)**: Background threads *inside the same process* that handle heavy tasks like File System (FS), Crypto (SSL), and DNS lookups.

> [!IMPORTANT]
> Even though Node.js uses background threads for heavy I/O, **Your JS code remains single-threaded.** This is why you must never block the main thread with heavy math.

---

## 2. The Architecture (High Level)

Think of Node.js as a high-performance engine:
- **Your Code (JS/TS)**: The steering wheel and pedals.
- **Node.js API (Built-in modules)**: The dashboard.
- **V8 + libuv**: The actual engine block under the hood.

Unlike PHP-FPM, which spawns a new process for every visitor, Node.js runs **one single process** and manages all visitors using an **Event Loop**.

---

## 3. Node.js vs. PHP: The Mental Shift

| Feature | PHP (Traditional) | Node.js |
|---------|-------------------|---------|
| **Threading** | Multi-process (PHP-FPM) | Single-threaded (mostly) |
| **I/O** | Blocking (Wait for DB) | Non-blocking (Continue while waiting) |
| **Lifetime** | Dies after every request | Persistent session/process |
| **Server** | Needs Apache/Nginx | Self-hosted (HTTP module) |

> [!KEY]
> **Persistent State**: In PHP, if you define a global variable, it resets on the next refresh. In Node.js, a global variable lives as long as the server is running. This is great for caching but requires careful memory management!

---

## 4. Why use Node.js?

- **Real-time Apps**: Chat, gaming, live dashboards (WebSockets are native and fast).
- **I/O Intensive**: If your app calls 5 different APIs and a database, Node.js can do them all at once.
- **One Language**: Same language for Frontend (React/Vue) and Backend (Node.js).
- **Tooling**: Most modern web tools (npm, webpack, vite) are built on Node.js.

---

## 5. Setting up a TypeScript Node Project

### 1. Install nvm (Node Version Manager)
Never install Node directly. Use `nvm` to switch versions easily.
```bash
nvm install 20
nvm use 20
```

### 2. Initialize Project
```bash
mkdir my-node-app && cd my-node-app
npm init -y
```

### 3. Setup TypeScript
```bash
npm install typescript tsx @types/node -D
npx tsc --init
```

### 4. Professional Script
In your `package.json`, add:
```json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc"
}
```

---

## 6. Key Takeaways
1. **Node is a container**: It lets JavaScript run on your computer/server instead of just inside a browser.
2. **Asynchronous by default**: While PHP waits for a file to read, Node starts the read and moves to the next line immediately.
3. **Single Thread**: You only have ONE main thread. If you do a heavy calculation (like crypto or image processing), you block **everyone**.
4. **V8**: Understand that your JS code is being compiled to native machine code for performance.
