# Phase 013: Interfaces & Type Aliases — Notes

In PHP, you use **Classes** to define the structure of objects. In TypeScript, we have two lighter-weight ways to define "shapes" of data: **Interfaces** and **Type Aliases**.

---

## 1. Object Type Annotations (The Inline Way)

Before using Interfaces, you could just write the type directly when declaring an object:
```typescript
const user: { name: string; age: number } = {
    name: "John",
    age: 30
};
```
But this is messy the second you want to reuse it.

---

## 2. Type Aliases (`type`)

A Type Alias is essentially a nickname for a type. You can use it for objects, primitives, or unions.

```typescript
type UserID = string | number; // Alias for a union

type User = {
    readonly id: number; // Cannot be changed after creation
    name: string;
    age?: number; // Optional property (PHP equivalent: ?int $age)
};

const user: User = { id: 1, name: "Basha" }; // age is optional
```

---

## 3. Interfaces (`interface`)

An Interface is strictly for defining the **shape of an object**. It is the most powerful tool for defining contracts in TypeScript.

```typescript
interface User {
    id: number;
    name: string;
}

// Extending an interface (Inheritance)
interface Admin extends User {
    role: "admin" | "superadmin";
}

const boss: Admin = {
    id: 1,
    name: "John",
    role: "admin"
};
```

---

## 4. Interface vs. Type: Which to use?

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| Objects | ✅ Great | ✅ Great |
| Primitives | ❌ No | ✅ Yes |
| Unions | ❌ No | ✅ Yes |
| Extending | `extends` | `&` (Intersection) |
| Merging | ✅ Automatic | ❌ No |

> [!TIP]
> **Rule of Thumb**: Use `interface` for your object data models (like Eloquent models in Laravel). Use `type` for everything else (unions, complex combinations, etc.).

---

## 5. Intersection Types (`&`)

If you use `type`, you "merge" them using the ampersand.

```typescript
type Name = { name: string };
type Age = { age: number };

type Person = Name & Age; // Must have both
```

---

## 6. PHP ↔ TypeScript Comparison

In PHP, if you want a "shape," you might use an associative array or a class.
- **PHP Class**: Forces you to instantiate an object.
- **TS Interface**: Only checks the **shape**. If the object has the right keys, it passes, even if it's just a plain `{}` literal.

---

## 7. Key Takeaways
1. **Optional (`?`)**: Use this for fields that aren't always present.
2. **Readonly**: Use for IDs or timestamps you don't want to accidentally overwrite.
3. **Interfaces**: These are the "standard" for object-oriented design in TS.
4. **Consistency**: Pick one style for your project and stick to it.
5. **No semicolon**: You can use either `;` or `,` between fields, but `;` is the standard for interfaces.
6. **No "actual" code**: Interfaces and types are **completely removed** during compilation. They don't exist in the final `.js` file.
7. **Next Step**: We'll apply these to Functions in the next phase!
8. **Summary Reference**: Check `ts-interfaces-summary.md` for a quick syntax map.
