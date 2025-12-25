# Phase 026: The `process` Object
## Agent Instructions

**Phase**: 026 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. `process.env` — environment variables (+ typing in TS)
2. `process.argv` — command line arguments
3. `process.cwd()` — current working directory
4. `process.exit(code)` — terminate process
5. `process.on('exit')` — cleanup handlers
6. `process.on('uncaughtException')` — error handling
7. `process.on('unhandledRejection')` — Promise errors
8. `process.memoryUsage()` — memory stats
9. Creating type-safe env config in TypeScript

## TypeScript Pattern
```typescript
// Type-safe env
const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    dbUrl: process.env.DATABASE_URL!,
};
```

## Content Instructions
**Notes**: Each process property with examples
**Summary**: process object quick reference
