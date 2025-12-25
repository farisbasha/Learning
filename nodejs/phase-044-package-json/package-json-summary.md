# Phase 044: package.json — Summary Cheatsheet

## 📁 Key Fields Anatomy

| Field | Purpose | Example |
|-------|---------|---------|
| **`name`** | Project ID (lowercase-hyphen). | `"my-cool-app"` |
| **`main`** | Entry point for CJS. | `"dist/index.js"` |
| **`types`** | Entry point for TS types. | `"dist/index.d.ts"` |
| **`type`** | Switch to ES Modules. | `"module"` |
| **`scripts`**| Command shortcuts. | See Phase 045. |
| **`engines`**| Required Node version. | `">=20.0.0"` |

---

## 🔢 SemVer Quick Logic

- **`^1.2.3`** (Caret): "Don't break the **First Non-Zero** number." (Safe for minor updates).
- **`~1.2.3`** (Tilde): "Don't break the **Minor** number." (Only patch updates).
- **`1.2.3`** (Exact): "Don't change anything."

---

## 🛡️ Peer vs Dev

- **`dependencies`**: My app **runs** on this.
- **`devDependencies`**: My app **is built/tested** with this.
- **`peerDependencies`**: I expect **you** to have this already installed.

---

## 💡 Remember
- Comments are **NOT** allowed in `package.json` (it's strict JSON).
- The `type: module` setting changes how `.js` files are perceived by Node.
- Keep your `scripts` names consistent: `dev`, `build`, `test`, `start`.
