# Phase 018: TypeScript Advanced Patterns
## Agent Instructions

**Phase**: 018 | **Part**: B - TypeScript Fundamentals | **Language**: TypeScript

## Topics
1. Mapped types: `{ [K in keyof T]: T[K] }`
2. Conditional types: `T extends U ? X : Y`
3. `infer` keyword — extract types
4. Template literal types: `` `${string}_id` ``
5. Index signatures: `[key: string]: any`
6. Type assertions: `value as Type`
7. Declaration files `.d.ts`
8. `@types/*` packages for third-party libs

## Code Example
```typescript
// Mapped type
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Conditional type
type ArrayElement<T> = T extends (infer E)[] ? E : never;
```

## Content Instructions
**Notes**: Advanced patterns with real-world examples
**Summary**: Advanced type syntax reference
