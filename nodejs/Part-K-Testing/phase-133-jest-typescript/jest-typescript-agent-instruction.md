# Phase 133: Jest with TypeScript
## Agent Instructions

**Phase**: 133 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. ts-jest for TypeScript
2. @types/jest for types
3. Configuration for TypeScript
4. Path mapping in tests
5. Typed mocks
6. jest.mock with types
7. Vitest as alternative
8. ESM support
9. Performance optimization
10. CI configuration

## Example
```typescript
// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: ['src/**/*.ts'],
    coverageThreshold: {
        global: { branches: 80, functions: 80, lines: 80 }
    }
};
```

## Content Instructions
**Notes**: Jest TypeScript configuration guide
**Summary**: Jest TS setup checklist
