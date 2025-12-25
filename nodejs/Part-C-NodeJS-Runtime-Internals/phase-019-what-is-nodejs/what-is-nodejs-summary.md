# Phase 019: What is Node.js — Summary Cheatsheet

## 🏗️ The Core Components
- **V8 Engine**: JavaScript → Machine Code (Speed).
- **libuv**: Handles the Event Loop & Async I/O (Concurrency).
- **Modules**: File system (`fs`), Network (`http`), etc.

---

## ⚖️ Node vs. PHP Overview

| Property | PHP | Node.js |
|----------|-----|---------|
| **Model** | Sync / Blocking | Async / Non-blocking |
| **Concurrency**| Multi-process / Workers | Single-process / Event Loop |
| **Reliability**| Safe (Isolated processes)| Risk (One crash = all users) |
| **Performance**| Moderate | Extremely High (I/O) |

---

## 🚀 Setup Checklist (Professional)

1. [ ] Install Node.js via **`nvm`**.
2. [ ] Check version: `node -v` (Aim for LTS version).
3. [ ] Check npm: `npm -v`.
4. [ ] Install dev tools: `npm i -D typescript tsx @types/node`.
5. [ ] Init TS: `npx tsc --init`.

---

## 🛠️ Usage Patterns

### Running JavaScript
```bash
node app.js
```

### Running TypeScript (Dev)
```bash
npx tsx app.ts
```

### Compiling to JavaScript (Prod)
```bash
npx tsc
node dist/app.js
```

---

## 💡 Remember
- Node is **event-driven**.
- Blocking the event loop is the #1 performance killer.
- Global variables do **not** clear between requests.
- Node handles HTTP requests directly without needing a separate web server for basic functionality.
