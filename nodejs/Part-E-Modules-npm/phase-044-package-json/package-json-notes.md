# Phase 044: package.json Deep Dive — Notes

The `package.json` file is more than just a list of dependencies. It's the **Identity Card** of your project. It controls how your app is built, which scripts run, and how other tools interact with your code.

---

## 1. Metadata Fields

- **`name`**: The unique identifier for your project (must be lowercase).
- **`version`**: Follows Semantic Versioning (1.2.3).
- **`description` / `author` / `license`**: Standard metadata.

---

## 2. Modern Entry Points

- **`main`**: The primary entry point for CommonJS (e.g., `index.js`).
- **`module`**: The primary entry point for ES Modules.
- **`types`**: Tells TypeScript where your `.d.ts` declaration file is.
- **`type`**: Set to `"module"` to enable ES Modules project-wide.

---

## 3. Semantic Versioning (SemVer)

When you see a version like `^1.2.3`, what do the symbols mean?
- **Exactly `1.2.3`**: No symbol. 
- **Caret (`^`)**: Update to any version in the same **Major** range. (`^1.2.3` allows `1.5.0` but not `2.0.0`). This is the default.
- **Tilde (`~`)**: Update to any version in the same **Minor** range. (`~1.2.3` allows `1.2.9` but not `1.3.0`).
- **Wildcard (`*`)**: Update to anything. (🚨 **DANGER**: Don't use this).

---

## 4. The `engines` Field

Specify which versions of Node.js or npm your app is compatible with. This prevents teammates or servers from running the app on the wrong version.

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
}
```

---

## 5. Peer Dependencies (`peerDependencies`)

Used by library authors. It says: *"My library needs 'react' to work, but I want YOU to install it yourself so we don't have two copies."*

---

## 6. Key Takeaways
1. **The Source of Truth**: This file defines what your app is.
2. **Deterministic Builds**: Always use `^` (caret) and let `package-lock.json` handle the exact pinning.
3. **Scripts**: We'll dive into the `scripts` section in Phase 045, but know that it's the dashboard for your project.
4. **Validation**: If your `package.json` is invalid JSON (e.g., has a missing comma), Node will crash before your code even runs.
