# Phase 018: Advanced Patterns — Notes

This is the "Black Belt" of TypeScript. These patterns allow you to write extremely dynamic types that adapt to your data. While you won't write these every day, you will see them in almost every major Node.js library (like NestJS or Prisma).

---

## 1. Mapped Types

Allows you to create a new type by iterating over keys of an existing type.

```typescript
type MyOptions = {
    color: string;
    size: number;
};

// Turn every property into a boolean
type OptionsFlags<T> = {
    [K in keyof T]: boolean;
};

type MyFlags = OptionsFlags<MyOptions>; // { color: boolean, size: boolean }
```

---

## 2. Conditional Types

Like a ternary operator (`a ? b : c`) for types.

```typescript
type IsString<T> = T extends string ? "YES" : "NO";

type A = IsString<string>; // "YES"
type B = IsString<number>; // "NO"
```

---

## 3. The `infer` Keyword

Used inside conditional types to "extract" a hidden type from another type.

```typescript
// Extract the type of elements inside an array
type UnboxArray<T> = T extends (infer Element)[] ? Element : T;

type Str = UnboxArray<string[]>; // string
type Num = UnboxArray<number>;   // number (stays as is)
```

---

## 4. Template Literal Types

Construct types based on string patterns. This is incredibly powerful for things like events or CSS classes.

```typescript
type Color = "red" | "blue";
type Intensity = "light" | "dark";

type ColorPalette = `${Intensity}-${Color}`;
// Result: "light-red" | "dark-red" | "light-blue" | "dark-blue"
```

---

## 5. Indexed Access Types (`T[K]`)

Access the type of a specific property in another type.

```typescript
interface User { id: number; profile: { avatar: string } }

type AvatarType = User["profile"]["avatar"]; // string
```

---

## 6. Type Assertions (`as`)

Sometimes you know better than TypeScript what a type is. Use this sparingly.

```typescript
const input = document.getElementById("my-input") as HTMLInputElement;
// You are telling TS: "Trust me, I know this is an Input element"
```

---

## 7. Declaration Files (`.d.ts`)

In Node.js, many older libraries are written in plain JavaScript. To use them in TypeScript, we need "Declaration Files" that describe their types.
- **Internal**: You create `.d.ts` files for your own JS code.
- **External**: You install `@types/library-name` from npm.

---

## 8. Key Takeaways
1. **Dynamic Types**: Advanced patterns help you write types that automatically update when your data structures change.
2. **`keyof`**: This is the magic key for iteration. It returns a union of all keys in an object.
3. **Complexity**: Don't use these unless you are building a library or a shared utility. Keep application code simple!
4. **Graduation**: You have finished **Part B**! Your "TypeScript foundation" is complete. Next, we look at how Node.js actually works under the hood.
5. **Summary Reference**: Check `ts-advanced-summary.md` for a quick syntax map.
