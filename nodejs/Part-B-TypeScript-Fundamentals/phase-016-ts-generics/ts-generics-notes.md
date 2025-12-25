# Phase 016: Generics — Notes

In PHP, you might use `mixed` or untyped arrays. In TypeScript, **Generics** allow you to write reusable code that works with **any** type while still being **strictly checked**.

---

## 1. What are Generics?

Think of Generics as **variables for types**. Instead of hardcoding a type, you use a placeholder (usually `<T>`).

```typescript
// Without Generics (returns any, loses type info)
function getFirst(arr: any[]): any {
    return arr[0];
}

// With Generics (preserves type info)
function getFirst<T>(arr: T[]): T {
    return arr[0];
}

const num = getFirst<number>([1, 2, 3]); // num is number
const str = getFirst<string>(["a", "b"]); // str is string
```

---

## 2. Generic Interfaces

You can make your data structures generic too.

```typescript
interface ApiResponse<T> {
    data: T;
    status: number;
}

const userResponse: ApiResponse<{ name: string }> = {
    data: { name: "Basha" },
    status: 200
};
```

---

## 3. Generic Constraints (`extends`)

Sometimes you want a generic, but you want to limit it to certain shapes.

```typescript
// T must have a .length property
function logLength<T extends { length: number }>(arg: T): void {
    console.log(arg.length);
}

logLength("hello"); // OK
logLength([1, 2]);  // OK
// logLength(123);  // 🚨 Error: number doesn't have .length
```

---

## 4. Default Type Parameters

Just like function arguments, type parameters can have defaults.

```typescript
interface Box<T = string> {
    content: T;
}

const stringBox: Box = { content: "Hi" }; // T defaults to string
const numberBox: Box<number> = { content: 123 };
```

---

## 5. Multiple Type Parameters

You can use as many as you need, separated by commas.

```typescript
function pair<K, V>(key: K, value: V): [K, V] {
    return [key, value];
}

const result = pair("id", 101); // K is string, V is number
```

---

## 6. PHP Comparison

PHP 8.2 has started introducing "Generic-like" comments for static analysis tools (like PHPStan), but they aren't built into the language itself.
- **PHP**: `/** @return array<string> */`
- **TS**: `(): string[]` (Native and enforced)

---

## 7. Key Takeaways
1. **Reuse**: Use generics to avoid repeating code for different types.
2. **Retention**: Generics keep the "type information" alive as it flows through your functions.
3. **Convention**: `<T>` (Type), `<K>` (Key), `<V>` (Value), `<E>` (Element).
4. **Library Use**: Many Node.js libraries (like Prisma or Express) use generics heavily to type-check your database results or request bodies.
5. **Constraint**: If you need to access a property inside a generic function, you **must** use `extends`.
