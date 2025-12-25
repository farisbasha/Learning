# Phase 053: HTTP Client
## Agent Instructions

**Phase**: 053 | **Part**: F - Core Node APIs | **Language**: TypeScript

## Topics
1. Native `fetch()` (Node 18+)
2. Typing fetch responses
3. Generic fetch wrapper
4. Error handling
5. `axios` with TypeScript
6. Response type inference

## Example
```typescript
interface User {
    id: number;
    name: string;
}

const response = await fetch('https://api.example.com/users/1');
const user: User = await response.json();
```

## Content Instructions
**Notes**: HTTP client patterns with types
**Summary**: fetch and axios patterns
