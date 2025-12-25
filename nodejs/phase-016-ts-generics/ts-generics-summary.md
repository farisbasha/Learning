# Phase 016: Generics — Summary Cheatsheet

## 🧬 Basic Generic Syntax

```typescript
// Generic Function
function identity<T>(arg: T): T {
  return arg;
}

// Generic Arrow Function
const identity = <T>(arg: T): T => arg;
```

---

## 🏗️ Structure Patterns

### Generic Interface
```typescript
interface Container<T> {
  value: T;
}
```

### Generic Class
```typescript
class Box<T> {
  private _val: T;
  constructor(v: T) { this._val = v; }
}
```

---

## 🛠️ Advanced Operations

| Syntax | Name | Use Case |
|--------|------|----------|
| `<T extends U>` | **Constraint** | Force T to have certain properties. |
| `<T = string>` | **Default** | Make T optional when using the structure. |
| `<K, V>` | **Multi-param** | For Mappings or Pairs. |

---

## 💡 Remember
- Generics work for functions, interfaces, types, and classes.
- If you use generics, VS Code will give you perfect autocomplete for the specific type you passed in.
- Don't over-engineer! If a function only ever handles `string`, don't make it generic.
