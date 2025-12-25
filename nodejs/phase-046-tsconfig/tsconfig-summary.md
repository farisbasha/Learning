# Phase 046: tsconfig.json — Summary Cheatsheet

## 📁 Paths Anatomy

- **`rootDir`**: Location of your `.ts` files (usually `src`).
- **`outDir`**: Location for your `.js` output (usually `dist` or `build`).

---

## ⚙️ Key Compiler Flags

| Flag | Recommended | Purpose |
|------|-------------|---------|
| **`target`** | `ES2022` | Output JS version compatible with Node. |
| **`strict`** | `true` | Enables all safety checks. (MANDATORY). |
| **`module`** | `NodeNext` | Use modern ESM logic. |
| **`esModuleInterop`** | `true` | Makes importing CJS modules easy. |
| **`sourceMap`** | `true` | Allows debugging of TS files. |

---

## 🛠️ Essential Commands

- **`npx tsc --init`**: Create a new `tsconfig.json`.
- **`npx tsc`**: Compile the whole project based on the config.
- **`npx tsc --watch`**: Keep compiling as you save.

---

## 💡 Remember
- TypeScript does **not** exist at runtime. The `tsconfig` only controls the **TRANSFORMATION** to JavaScript.
- If you change `tsconfig.json`, you usually need to restart your development server.
- The `NodeNext` setting is the current gold standard for new projects.
- **Part E Complete!** 🎉 You are now a master of Node.js project architecture.
