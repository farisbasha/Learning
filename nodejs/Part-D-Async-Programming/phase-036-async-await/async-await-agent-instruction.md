# Phase 036: Async/Await
## Agent Instructions

**Phase**: 036 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. `async` function declaration — always returns Promise
2. `await` keyword — pause until Promise resolves
3. Return types: `async function(): Promise<T>`
4. Error handling: `try/catch`
5. Sequential vs parallel execution
6. Top-level await (ES Modules)
7. **Common mistake: forgetting await!**

## Key Examples
```typescript
// Async function
async function getUser(id: number): Promise<User> {
    const response = await fetch(`/users/${id}`);
    return response.json();
}

// Error handling
try {
    const user = await getUser(1);
} catch (error) {
    console.error('Failed:', error);
}

// Parallel execution
const [users, orders] = await Promise.all([
    getUsers(),
    getOrders()
]);
```

## PHP Comparison
> Async/await makes async code LOOK synchronous
> PHP code is actually synchronous

## Content Instructions
**Notes**: Complete async/await guide
**Summary**: Async/await patterns cheatsheet
