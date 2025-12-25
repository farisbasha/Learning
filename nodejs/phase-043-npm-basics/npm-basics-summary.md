# Phase 043: npm Fundamentals — Summary Cheatsheet

## 🛠️ Essential Commands

| Command | Action |
|---------|--------|
| **`npm init -y`** | Start a new project from scratch. |
| **`npm i <pkg>`** | Install a production dependency. |
| **`npm i -D <pkg>`**| Install a development tool. |
| **`npm i`** | Install everything listed in `package.json`. |
| **`npm uninstall <pkg>`** | Remove a dependency. |
| **`npm list -g`** | See globally installed packages. |

---

## 📦 The "Big Three" Files

1. **`package.json`**: Your project manifest. (MANDATORY).
2. **`package-lock.json`**: Exact version history. (MANDATORY).
3. **`node_modules/`**: The giant folder of local code. (Ignore in `.gitignore`).

---

## 🔎 TypeScript Pattern
If a package shows 🚨 "Could not find a declaration file...", run:
```bash
npm i -D @types/<package-name>
```

---

## 💡 Remember
- `npm i` is shorthand for `npm install`.
- Always use `-D` for tools like `typescript`, `eslint`, and `jest`.
- Use `npx <pkg>` to run a package once without permanently installing it.
- **Milestone Check**: npm is the gateway to using the millions of libraries available in the ecosystem.
