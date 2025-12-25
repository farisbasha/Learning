# Phase 011: TypeScript Introduction — Notes

Welcome to **Part B**! This is where we start building "professional grade" Node.js. In JavaScript, anything is possible, which means anything can break. **TypeScript** is the solution to that.

---

## 1. What is TypeScript?

TypeScript is a **superset** of JavaScript. This means:
- All valid JavaScript code is also valid TypeScript code.
- TypeScript adds **Static Typing** to the language.
- TypeScript code **cannot** run directly in Node.js or a browser. It must be **compiled** (transpiled) into plain JavaScript first.

---

## 2. Why TypeScript for PHP Developers?

As a PHP/Laravel developer, you are used to some level of type safety:
- **PHP**: `function save(User $user) { ... }`
- **TypeScript**: `function save(user: User) { ... }`

The main benefit is **Compile-Time Checking**. In PHP, if you pass a string where an object is expected, it crashes at **runtime** (on the server). In TypeScript, the compiler tells you it's wrong **before you even run the code**.

---

## 3. Installation & Setup

To use TypeScript globally:
```bash
npm install -g typescript
```

This gives you the `tsc` (TypeScript Compiler) command.

### Your First Program
Create `hello.ts`:
```typescript
let message: string = "Hello TypeScript";
console.log(message);
```

Compile it:
```bash
tsc hello.ts
```
This generates `hello.js` which you can run with `node hello.js`.

---

## 4. Modern Tools: `ts-node` & `tsx`

In development, we don't want to manually compile every 5 seconds. We use tools that compile in memory:
- **`ts-node`**: The classic way to run TS in Node.
- **`tsx`**: A newer, faster alternative.

```bash
npx tsx hello.ts
```

---

## 5. Basic Syntax: Type Annotations

The core power of TS is the **colon (`:`)** syntax.

```javascript
// JavaScript
let name = "John";

// TypeScript
let name: string = "John";
```

If you try to do `name = 42;` in TypeScript, it will red-underline the code immediately.

---

## 6. PHP ↔ TypeScript Comparison

| Feature | PHP | TypeScript |
|---------|-----|------------|
| Type Hint | `(string $s)` | `(s: string)` |
| Return Type | `: int` | `: number` |
| Complexity | Optional | Highly recommended |
| Execution | Direct | Needs build step (`tsc`) |

---

## 7. Key Takeaways
1. **Safety First**: TypeScript catches your bugs early.
2. **Setup**: You need a `tsconfig.json` (Phase 046) for real projects.
3. **JS is OK**: You can slowly migrate JS projects to TS by renaming files to `.ts`.
4. **Tooling**: IDEs (like VS Code) give you incredible autocomplete and documentation once you use types.
