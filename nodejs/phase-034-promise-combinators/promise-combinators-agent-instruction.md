# Phase 034: Promise Combinators
## Agent Instructions

**Phase**: 034 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. `Promise.all<T>([])` — all must succeed, fail-fast
2. `Promise.allSettled()` — wait for all regardless
3. `Promise.race<T>([])` — first to complete wins
4. `Promise.any()` — first to succeed wins
5. Use cases for each combinator
6. Error handling with combinators
7. Performance: parallel execution

## Examples
```typescript
// All parallel
const [users, orders] = await Promise.all([
    fetchUsers(),
    fetchOrders()
]);

// Timeout pattern
const result = await Promise.race([
    fetchData(),
    timeout(5000)
]);
```

## Content Instructions
**Notes**: Each combinator with use cases
**Summary**: Promise combinators quick reference
