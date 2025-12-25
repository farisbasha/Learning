# Phase 045: npm Scripts & Development Tools — Notes

In Node.js, we don't usually run raw `node` or `tsc` commands manually. Instead, we define **Scripts** in `package.json`. This creates a standard interface for everyone working on the project.

---

## 1. The `scripts` Section

Think of these like **Artisan Commands** in Laravel. They are short names for long, complex commands.

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "jest"
}
```

### Usage:
- `npm run dev`
- `npm run build`
- `npm test` (Special case: `run` is optional for `test` and `start`).

---

## 2. Development Tooling

### `npx` (Node Package Executor)
Run a package without installing it permanently to your machine.
- `npx tsc --init`
- `npx prisma migrate dev`

### `tsx` (The Modern Runner)
`tsx` is the current best way to run TypeScript files directly during development without a manual build step. It handles ESM and CJS automatically.

### `watch` mode
Tools like `tsc --watch` or `tsx watch` keep running in the background and re-compile/re-run your code every time you save a file.

---

## 3. Chaining Scripts

You can use standard shell operators to chain commands:
- **`&&`**: Run sequentially (Stop if first fails). 
- **`&`**: Run in parallel (Running two things at once).
- **`pre` and `post` hooks**: If you have a `test` script, defining `pretest` will run it automatically **before** the test.

---

## 4. Concurrent execution

If you want to run your Frontend (React) and Backend (Node) at the same time with one command, we use a utility like `concurrently`.

```json
"dev": "concurrently \"npm run dev:api\" \"npm run dev:client\""
```

---

## 5. Key Takeaways
1. **Automation**: If you find yourself typing the same long command twice, put it in a script.
2. **NPM Path**: Scripts automatically include `node_modules/.bin` in their path. You can run `tsc` inside a script even if you haven't installed it globally.
3. **Environment**: You can set environment variables inside scripts (e.g., `NODE_ENV=production node index.js`), though `cross-env` is safer for cross-platform (Windows/Mac) support.
4. **Conclusion**: A good `package.json` with clear scripts makes onboarding a new developer as easy as typing `npm install` and `npm run dev`.
