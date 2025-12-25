# Phase 017: Utility Types
## Agent Instructions

**Phase**: 017 | **Part**: B - TypeScript Fundamentals | **Language**: TypeScript

## Topics
1. `Partial<T>` — all properties optional
2. `Required<T>` — all properties required
3. `Readonly<T>` — all properties readonly
4. `Pick<T, K>` — select specific properties
5. `Omit<T, K>` — exclude specific properties
6. `Record<K, V>` — construct object type
7. `ReturnType<T>` — extract function return type
8. `Parameters<T>` — extract function parameters

## Code Example
```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

type UserUpdate = Partial<User>; // All optional
type UserPreview = Pick<User, "id" | "name">; // Only id and name
```

## Content Instructions
**Notes**: Each utility type with real use cases
**Summary**: Utility types quick reference
