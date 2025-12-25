# Phase 033: Promise Chaining
## Agent Instructions

**Phase**: 033 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. Sequential async operations
2. Returning values from `.then()`
3. Returning Promises from `.then()`
4. Flat chains vs nested callbacks
5. Error handling in chains
6. Breaking chains early
7. Debugging Promise chains

## Example
```typescript
getUser(1)
    .then(user => getOrders(user.id))
    .then(orders => getOrderDetails(orders[0].id))
    .then(details => console.log(details))
    .catch(err => console.error(err));
```

## vs Callback Hell
Callbacks = nested pyramid
Promises = flat chain

## Content Instructions
**Notes**: Chaining patterns and error handling
**Summary**: Promise chain patterns
