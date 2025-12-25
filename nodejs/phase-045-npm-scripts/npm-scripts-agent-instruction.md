# Phase 045: npm Scripts & Development Tools
## Agent Instructions

**Phase**: 045 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. Defining scripts in package.json
2. `npm run <script>` — run scripts
3. TypeScript build scripts
4. Watch mode: `tsc --watch`
5. `nodemon` — restart on changes
6. `ts-node` vs `tsx` — run TS directly
7. Concurrent scripts: `concurrently`, `npm-run-all`
8. `npx` — run packages without install

## Common Scripts
```json
{
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "lint": "eslint src/",
        "test": "jest"
    }
}
```

## Content Instructions
**Notes**: Development workflow with scripts
**Summary**: npm scripts patterns
