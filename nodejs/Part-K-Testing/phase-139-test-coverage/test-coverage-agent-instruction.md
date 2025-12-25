# Phase 139: Test Coverage
## Agent Instructions

**Phase**: 139 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is code coverage
2. Coverage metrics: lines, branches, functions, statements
3. Jest coverage reporting
4. Coverage thresholds
5. Coverage in CI/CD
6. Codecov, Coveralls integration
7. Coverage vs quality
8. Ignoring files from coverage
9. Coverage reports interpretation
10. Improving coverage

## Example
```javascript
// jest.config.js
module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/types/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

```bash
# Run with coverage
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

## Content Instructions
**Notes**: Test coverage configuration and interpretation
**Summary**: Coverage configuration reference
