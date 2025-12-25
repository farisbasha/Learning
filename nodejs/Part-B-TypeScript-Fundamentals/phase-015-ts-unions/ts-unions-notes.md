# Phase 015: Union & Literal Types — Notes

In PHP 8, you might use Union Types like `string|int`. TypeScript takes this further with **Literal Types**, allowing you to define a type that is exactly a specific string or number.

---

## 1. Union Types (`|`)

A union type describes a value that can be one of several types.

```typescript
function printId(id: number | string) {
    console.log(`Your ID is: ${id}`);
}

printId(101);     // OK
printId("202");   // OK
// printId(false); // 🚨 Error!
```

---

## 2. Literal Types

You can restrict a variable to specific values. This is like an `enum` but much simpler.

```typescript
type Direction = "left" | "right" | "up" | "down";

let move: Direction = "left";
// move = "north"; // 🚨 Error: "north" is not in the allowed list.
```

---

## 3. Type Narrowing

When you have a union type, you often need to check which specific type you're dealing with before using it.

### Using `typeof`
```typescript
function padLeft(padding: number | string, input: string) {
    if (typeof padding === "number") {
        return " ".repeat(padding) + input; // TS knows padding is a number here
    }
    return padding + input; // TS knows padding is a string here
}
```

### Using property checks (`in`)
```typescript
interface Bird { fly: () => void }
interface Fish { swim: () => void }

function move(animal: Bird | Fish) {
    if ("fly" in animal) {
        animal.fly();
    } else {
        animal.swim();
    }
}
```

---

## 4. Discriminated Unions (The "Pattern of Champions")

This is one of the most powerful patterns in TypeScript. You give each type in the union a common property (a "discriminant") to tell them apart.

```typescript
interface Circle {
    kind: "circle"; // Discriminant
    radius: number;
}

interface Square {
    kind: "square"; // Discriminant
    length: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape) {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "square":
            return shape.length ** 2;
    }
}
```

---

## 5. Key Takeaways
1. **Unions**: Use `|` to allow multiple types.
2. **Safety**: Narrow your types with `if` or `switch` to access type-specific methods.
3. **Literals**: Use string literals instead of magic strings to prevent typos.
4. **Discrimination**: Use `kind` or `type` fields to make complex unions easy to manage.
5. **Node.js Use Case**: Great for handling different API response states (e.g., `{ status: "success", data: T }` vs `{ status: "error", error: string }`).
