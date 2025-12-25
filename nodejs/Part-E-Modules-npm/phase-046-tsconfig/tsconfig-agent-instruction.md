# Phase 046: TypeScript Project Configuration
## Agent Instructions

**Phase**: 046 | **Part**: E - Modules & npm | **Language**: TypeScript

## Topics
1. `tsconfig.json` complete guide
2. `target` — output JS version
3. `lib` — included type definitions
4. `strict` mode and its options
5. `outDir` and `rootDir`
6. Source maps
7. `include` and `exclude`
8. Recommended configurations for Node.js

## Recommended tsconfig
```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "outDir": "dist",
        "rootDir": "src",
        "declaration": true,
        "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

## Content Instructions
**Notes**: Complete tsconfig.json guide for Node
**Summary**: tsconfig options quick reference
