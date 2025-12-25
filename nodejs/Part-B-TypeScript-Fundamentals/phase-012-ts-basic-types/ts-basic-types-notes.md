# Phase 012: TypeScript Basic Types — Notes

Now that we know *why* we use TypeScript, let's look at the basic building blocks. Because JavaScript is "loosely typed," TypeScript provides a strict set of types to cover every scenario.

---

## 1. Primitive Types

The same primitives from Phase 002, but with enforced safety.

```typescript
let name: string = "John";
let age: number = 30; // Works for both int and float
let isDone: boolean = false;

// null and undefined are their own types
let nothing: null = null;
let empty: undefined = undefined;
```

---

## 2. Array Types

In TypeScript, you can specify exactly what type of items an array should hold.

### Method A (Square Brackets - Preferred)
```typescript
let list: number[] = [1, 2, 3];
// list.push("hello"); // 🚨 Error! Only numbers allowed.
```

### Method B (Generic Template)
```typescript
let list: Array<number> = [1, 2, 3];
```

---

## 3. Tuples

A **Tuple** is an array with a fixed number of elements whose types are known. Think of it like a strict row in a database.

```typescript
// Define a [string, number] pair
let user: [string, number] = ["Basha", 101];

// user = [101, "Basha"]; // 🚨 Error: Wrong order!
```

---

## 4. Special Types: `any` and `unknown`

### `any` (The "Escape Hatch")
This turns off type checking. It makes the variable behave like plain JavaScript.
> [!CAUTION]
> **Avoid `any`**. It defeats the purpose of TypeScript. If you use `any`, you're just writing JavaScript with more steps.

### `unknown` (The "Safe `any`")
Similar to `any`, but you can't use it until you "check" what it is.
```typescript
let input: unknown = "hello";

// console.log(input.toUpperCase()); // 🚨 Error: Type is unknown.

if (typeof input === "string") {
    console.log(input.toUpperCase()); // ✅ Works! Type is narrowed.
```

---

## 5. `void` and `never`

- **`void`**: Used for functions that **return nothing**.
- **`never`**: Used for functions that **always crash** or run forever (rare).

```typescript
function log(msg: string): void {
    console.log(msg);
}
```

---

## 6. Type Inference: TS is Smart

You don't always have to write the type. If you assign a value immediately, TypeScript "infers" the type.

```typescript
let score = 100; // TypeScript knows this is a number!
// score = "A";   // 🚨 Error: Type 'string' is not assignable to 'number'.
```

---

## 7. PHP vs. TypeScript: Type Map

| PHP Type | TypeScript Type |
|----------|-----------------|
| `string` | `string` |
| `int`, `float` | `number` |
| `bool` | `boolean` |
| `array` | `type[]` |
| `mixed` | `any` / `unknown` |
| `null` | `null` |

---

## 8. Key Takeaways
1. **Numbers**: Only one type for both integers and decimals.
2. **Strict Arrays**: Always define what's inside your array.
3. **Inference**: Use it! If the type is obvious, let TS do the work.
4. **Any**: Only use as a temporary last resort. Let's aim for 0% `any` in this course!
