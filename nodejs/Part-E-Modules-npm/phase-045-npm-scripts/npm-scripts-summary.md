# Phase 045: npm Scripts — Summary Cheatsheet

## 🏃 Execution Commands

- **`npm run <name>`**: Run a custom script.
- **`npm test`**: Shorthand for `npm run test`.
- **`npm start`**: Shorthand for `npm run start`.
- **`npx <cmd>`**: Run a package immediately (one-time use).

---

## 🛠️ The Standard Dev Suite

```json
"scripts": {
  "dev": "tsx watch src/index.ts",   // Fast development
  "build": "tsc",                   // Compile for production
  "start": "node dist/index.js",    // Run production build
  "lint": "eslint .",               // Find code errors
  "format": "prettier --write ."     // Clean up code style
}
```

---

## ⛓️ Sequential vs Parallel

| Operator | Usage | Purpose |
|----------|-------|---------|
| **`&&`** | `cmd1 && cmd2` | Run 2 then 1 (only if 1 succeeds). |
| **`&`** | `cmd1 & cmd2` | Run both at the same time. |
| **`pre`**| `prebuild` | Runs automatically BEFORE `build`. |
| **`post`**| `postbuild` | Runs automatically AFTER `build`. |

---

## 💡 Remember
- Scripts run in a **Shell** environment.
- Use `cross-env` if you need to set platform-independent variables.
- Use `npx` for CLI tools so you don't pollute your global system.
- Always check the `scripts` section of a new project to see how to run it.
