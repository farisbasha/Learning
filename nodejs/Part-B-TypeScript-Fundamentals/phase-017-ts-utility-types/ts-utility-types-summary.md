# Phase 017: Utility Types — Summary Cheatsheet

## 🛠️ Property Modifiers

| Utility | Result | Use Case |
|---------|--------|----------|
| **`Partial<T>`** | Makes all fields `?` | Update/Patch requests. |
| **`Required<T>`**| Removes all `?` | Ensuring data is complete. |
| **`Readonly<T>`**| Adds `readonly` to all | Configs, fixed constants. |

---

## ✂️ Selection Utilities

### `Pick<T, "key1" | "key2">`
Only include these specific properties.
```typescript
type NameOnly = Pick<User, "firstName" | "lastName">;
```

### `Omit<T, "key1">`
Include everything EXCEPT these properties.
```typescript
type UserWithoutPassword = Omit<User, "password">;
```

---

## 🗺️ Mapping Utilities

### `Record<Keys, Value>`
```typescript
type PageMeta = Record<string, string | number>;
const meta: PageMeta = { title: "Home", views: 50 };
```

---

## 🧪 Function Extraction

- **`ReturnType<typeof fn>`**: Get what a function returns.
- **`Parameters<typeof fn>`**: Get an array (tuple) of the args.

---

## 💡 Remember
- These are **Generics**. They take the target type inside `<brackets>`.
- You can chain them: `Readonly<Partial<User>>`.
- They are only for development—they don't add any performance overhead to your running code.
