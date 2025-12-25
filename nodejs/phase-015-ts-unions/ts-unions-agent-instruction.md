# Phase 015: Union & Literal Types
## Agent Instructions

**Phase**: 015 | **Part**: B - TypeScript Fundamentals | **Language**: TypeScript

## Topics
1. Union types: `string | number`
2. Literal types: `"success" | "error" | "pending"`
3. Type narrowing with `typeof`
4. Type narrowing with `in` operator
5. Discriminated unions (tagged unions)
6. `never` type in exhaustive checks
7. Type guards

## Code Example
```typescript
type Status = "pending" | "success" | "error";

function handleStatus(status: Status) {
    switch (status) {
        case "pending": return "Loading...";
        case "success": return "Done!";
        case "error": return "Failed!";
    }
}
```

## Content Instructions
**Notes**: Union patterns and type narrowing techniques
**Summary**: Union syntax and narrowing cheatsheet
