# Phase 063: Express.js + TypeScript Setup
## Agent Instructions

**Phase**: 063 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. What is Express.js — the de-facto Node.js web framework
2. Express history and versions (v3 → v4 → v5)
3. Installing Express with TypeScript
4. `@types/express` package
5. Basic project structure
6. tsconfig.json for Express projects
7. Development workflow with `tsx`
8. Hot reloading with `nodemon` or `tsx watch`
9. Laravel comparison: `artisan serve` vs `npm run dev`

## Example
```typescript
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello from Express + TypeScript!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

## Content Instructions
**Notes**: Complete Express + TS setup guide with project scaffold
**Summary**: Express setup checklist
