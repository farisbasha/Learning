# Phase 044: package.json Deep Dive
## Agent Instructions

**Phase**: 044 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. All important fields explained
2. `scripts` section — custom commands
3. `engines` — Node version requirements
4. `main` vs `module` vs `exports`
5. `types` — TypeScript declaration entry
6. Semantic versioning: `^`, `~`, `*`
7. `peerDependencies`

## Example
```json
{
    "name": "my-app",
    "version": "1.0.0",
    "type": "module",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js"
    },
    "engines": {
        "node": ">=18.0.0"
    }
}
```

## Content Instructions
**Notes**: All package.json fields explained
**Summary**: package.json field reference
