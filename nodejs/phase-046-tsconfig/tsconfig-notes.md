# Phase 046: TypeScript Project Configuration — Notes

The `tsconfig.json` file is the brain of your TypeScript project. It tells the compiler which files to process, where to put the results, and how strictly to enforce types.

---

## 1. Essential Compiler Options

### `target`
Which version of JavaScript should the output be? 
- For modern Node.js, use **`ES2022`** or **`ESNext`**.

### `module` and `moduleResolution`
Crucial for making Imports work.
- **`NodeNext`**: The current standard for modern Node.js development.

### `outDir` and `rootDir`
Organizes your project.
- `rootDir: "src"`: Your TypeScript source code.
- `outDir: "dist"`: Where the generated JavaScript will go.

---

## 2. The Power of Strict Mode (`strict`)

Always set `"strict": true`. This enables a suite of checks that prevent the most common JavaScript bugs:
- **`noImplicitAny`**: Prevents you from forgetting to type a variable.
- **`strictNullChecks`**: Forces you to handle `null` or `undefined` before using a variable.

---

## 3. Developer Experience (DX)

### `sourceMap`
Generates `.map` files. This allows you to debug your TypeScript code directly in Chrome or VS Code, even though Node.js is actually running the generated JavaScript.

### `declaration`
Generates `.d.ts` files. If you're building a library, this allows other people to see your types when they import your code.

---

## 4. Include vs Exclude

- **`include`**: Tell TS exactly which folders to watch (e.g., `["src/**/*"]`).
- **`exclude`**: Tell TS to ignore certain folders (e.g., `["node_modules", "dist"]`).

---

## 5. Recommended Node.js Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 6. Key Takeaways
1. **The Standard**: Use `npx tsc --init` to generate a base file, then customize it.
2. **NodeNext**: This is the "magic" setting that makes modern Node.js imports work correctly.
3. **Strictness**: Don't be afraid of strict mode—it's your best friend for long-term project health.
4. **Graduation**: You have finished **Part E: Modules & npm Fundamentals**! You now know how to build, organize, and manage a professional Node.js project.
5. **Next Step**: We enter **Part F: Core Node.js APIs**, where we learn to talk to the Operating System, the File System, and the Network.
