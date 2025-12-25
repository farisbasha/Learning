# Phase 041: TypeScript Module Resolution
## Agent Instructions

**Phase**: 041 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. `moduleResolution` options: `node`, `node16`, `bundler`
2. Path mapping with `paths` in tsconfig
3. `baseUrl` configuration
4. Barrel exports (`index.ts`)
5. Importing JSON: `import data from './data.json'`
6. Declaration files `.d.ts`
7. Import aliases: `@/` prefix

## tsconfig Example
```json
{
    "compilerOptions": {
        "baseUrl": "./src",
        "paths": {
            "@/*": ["./*"],
            "@/utils/*": ["utils/*"]
        }
    }
}
```

## Content Instructions
**Notes**: TypeScript module resolution configuration
**Summary**: tsconfig paths cheatsheet
