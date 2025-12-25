# Phase 016: Generics
## Agent Instructions

**Phase**: 016 | **Part**: B - TypeScript Fundamentals | **Language**: TypeScript

## Topics
1. What are generics — type parameters
2. Generic functions: `function identity<T>(arg: T): T`
3. Generic interfaces: `interface Box<T> { value: T }`
4. Generic classes: `class Container<T> { }`
5. Generic constraints: `<T extends SomeType>`
6. Default type parameters: `<T = string>`
7. Multiple type parameters: `<K, V>`

## Code Example
```typescript
function firstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

const num = firstElement([1, 2, 3]); // type: number
const str = firstElement(["a", "b"]); // type: string
```

## Content Instructions
**Notes**: Generics explained with practical examples
**Summary**: Generic syntax patterns
