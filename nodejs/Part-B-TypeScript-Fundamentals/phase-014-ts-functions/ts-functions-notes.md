# Phase 014: Functions in TypeScript — Notes

You already know how to write functions in JS. In TypeScript, we add **Type Safety** to both what goes in (parameters) and what comes out (return value).

---

## 1. Typed Parameters & Return Values

The syntax is very similar to modern PHP 8.

```typescript
// PHP: function add(int $a, int $b): int
function add(a: number, b: number): number {
    return a + b;
}
```

If you omit the return type, TypeScript will try to guess (infer) it, but it's **best practice** to explicitly define it for public APIs.

---

## 2. Optional & Default Parameters

### Optional (`?`)
In TS, optional parameters must come **last**.
```typescript
function greet(name: string, greeting?: string): string {
    return `${greeting ?? "Hello"}, ${name}`;
}
```

### Default Values
Identical to JS/PHP. TS will infer the type from the default value.
```typescript
function greet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}`;
}
```

---

## 3. Function Type Expressions

Sometimes you want to store a function in a variable or pass it to another function. You can define the "shape" of that function.

```typescript
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;
```

---

## 4. Rest Parameters

Rest parameters are automatically checked as arrays.

```typescript
function sum(...nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0);
}
```

---

## 5. Function Overloads (Advanced)

TypeScript allows you to define multiple ways to call a single function. This is great for APIs that accept either a single value or an array.

```typescript
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
    if (d !== undefined && y !== undefined) {
        return new Date(y, mOrTimestamp, d);
    } else {
        return new Date(mOrTimestamp);
    }
}
```

---

## 6. PHP ↔ TypeScript Function Map

| PHP Feature | TypeScript Equivalent |
|-------------|-----------------------|
| `string $s` | `s: string` |
| `: void` | `: void` |
| `: int` | `: number` |
| `$p = "val"`| `p: string = "val"` |
| `(?string $s)` | `(s: string | null)` or `(s?: string)` |
| `callable` | Function type expression `(a: number) => void` |

---

## 7. Key Takeaways
1. **Be Explicit**: Always type your parameters.
2. **Explicit Returns**: Even though TS can infer returns, writing `: type` makes your code much better documentation.
3. **Optional Parameters**: Remember they must always be the last arguments.
4. **Callbacks**: When passing functions as callbacks, use the `() => type` syntax to define what the callback should look like.
5. **Node.js Context**: In Express routes, we usually don't need to type the `req` and `res` because the library does it for us (we'll see this in Part G).
6. **Summary Reference**: Check `ts-functions-summary.md` for a quick syntax map.
