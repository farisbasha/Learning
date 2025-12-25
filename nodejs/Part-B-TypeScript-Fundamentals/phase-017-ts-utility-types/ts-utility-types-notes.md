# Phase 017: Utility Types — Notes

TypeScript provides built-in "shortcut" types that take an existing type and transform it into something new. These are called **Utility Types**. Instead of writing new interfaces, you can modify existing ones on the fly.

---

## 1. Modifying Property Visibility

### `Partial<T>`
Makes all properties in a type **optional**. Perfect for "Update" operations in an API.
```typescript
interface User { id: number; name: string; email: string; }

// PHP: Only provide what you want to change
function updateUser(id: number, fields: Partial<User>) {
    // fields.name is optional here
}
```

### `Required<T>`
The opposite of `Partial`. Makes everything mandatory.

### `Readonly<T>`
Makes all properties immutable.
```typescript
const config: Readonly<{ theme: string }> = { theme: "dark" };
// config.theme = "light"; // 🚨 Error!
```

---

## 2. Picking and Omitting Fields

### `Pick<T, Keys>`
Creates a new type by selecting only the specified keys from an interface.
```typescript
type UserPreview = Pick<User, "id" | "name">;
// { id: number, name: string }
```

### `Omit<T, Keys>`
Creates a new type by removing specific keys from an interface.
```typescript
type UserWithoutEmail = Omit<User, "email">;
// { id: number, name: string }
```

---

## 3. Creating Mappings with `Record<K, V>`

Use this for dictionaries or maps where the keys are predictable.

```typescript
type Role = "admin" | "editor" | "guest";

const permissions: Record<Role, string[]> = {
    admin: ["all"],
    editor: ["read", "write"],
    guest: ["read"]
};
```

---

## 4. Extracting Types from Functions

### `ReturnType<T>`
Extracts the type returned by a function.
```typescript
function getUser() { return { id: 1, name: "Basha" }; }

type UserFromFn = ReturnType<typeof getUser>; 
// { id: number, name: string }
```

### `Parameters<T>`
Extracts the parameter types of a function as a tuple.

---

## 5. Key Takeaways
1. **DRY (Don't Repeat Yourself)**: Use utility types to avoid creating dozens of similar interfaces.
2. **`Partial`**: Your best friend for "patch/update" requests in Node.js.
3. **`Omit`**: Useful for removing sensitive data (like `password`) from a database model before sending it to the client.
4. **`Pick`**: Great for creating "summary" versions of large items.
5. **Node.js Use Case**: When working with ORMs like Prisma, utility types help you handle partial updates or selected queries perfectly.
6. **Summary Reference**: Check `ts-utility-types-summary.md` for a quick map of all utilities.
