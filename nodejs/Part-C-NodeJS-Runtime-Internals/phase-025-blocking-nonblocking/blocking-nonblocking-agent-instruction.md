# Phase 025: Blocking vs Non-Blocking
## Agent Instructions

**Phase**: 025 | **Part**: C - Node.js Runtime | **Language**: TypeScript

## Topics
1. What is blocking code — waits for operation to complete
2. What is non-blocking — returns immediately, callback later
3. I/O bound vs CPU bound operations
4. Examples of blocking: `fs.readFileSync`, heavy loops, crypto
5. Why blocking is catastrophic in Node
6. How to identify blocking code
7. How to fix blocking: async APIs, worker threads
8. PHP comparison: blocking is normal and safe

## Key Rule
> NEVER block the main thread in Node.js
> Every ms you block = every user waits

## Examples
```typescript
// BLOCKING — BAD!
const data = fs.readFileSync('file.txt');

// NON-BLOCKING — GOOD!
const data = await fs.promises.readFile('file.txt');
```

## Content Instructions
**Notes**: Why blocking is dangerous, how to avoid
**Summary**: Blocking vs Non-blocking patterns
