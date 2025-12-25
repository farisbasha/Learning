# Phase 037: Advanced Async Patterns
## Agent Instructions

**Phase**: 037 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. Async iterators: `for await...of`
2. Async generators: `async function*`
3. Retry patterns with backoff
4. Timeout patterns
5. Debouncing/throttling async operations
6. Typed async utilities
7. Concurrency control (limiting parallel operations)

## Examples
```typescript
// Retry with exponential backoff
async function retry<T>(
    fn: () => Promise<T>,
    attempts: number = 3
): Promise<T> {
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === attempts - 1) throw err;
            await sleep(Math.pow(2, i) * 1000);
        }
    }
    throw new Error('Unreachable');
}
```

## Content Instructions
**Notes**: Advanced patterns with implementations
**Summary**: Async utility patterns
