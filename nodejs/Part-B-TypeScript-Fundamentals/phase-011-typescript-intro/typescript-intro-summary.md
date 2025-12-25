# Phase 011: TypeScript Intro — Summary Cheatsheet

## 🚀 Setup & Running

- **Install**: `npm install -g typescript`
- **Init Project**: `tsc --init` (Creates `tsconfig.json`)
- **Compile Single File**: `tsc filename.ts`
- **Watch Mode**: `tsc -w`
- **Quick Run**: `npx tsx filename.ts`

---

## ⌨️ Basic Type Syntax

```typescript
// Variables
let username: string = "basha";
let age: number = 30;
let isLoaded: boolean = true;

// Functions
function multiply(a: number, b: number): number {
  return a * b;
}
```

---

## ⚖️ JS vs. TS

| Feature | JavaScript | TypeScript |
|---------|------------|------------|
| Typing | Dynamic (Runtime) | Static (Compile-time) |
| Errors | Found by Users | Found by Developer |
| Refactoring| Risky | Safe & Automated |
| Files | `.js` | `.ts` |

---

## 🔄 PHP Developer Cheat
If you like PHP type-hints, you will LOVE TypeScript.
- Instead of `$name`, just use `name`.
- Instead of `string $name`, use `name: string`.
- Instead of `: void`, use `: void`.

---

## 💡 Remember
- TypeScript **disappears** after compilation. It is only for you, the developer, during writing. The browser/server only sees plain JavaScript.
- Don't fight the compiler; if it's complaining, there's usually a potential bug in your logic.
