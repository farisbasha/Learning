# Phase 131: Mocha & Chai (Legacy)
## Agent Instructions

**Phase**: 131 | **Part**: K - Testing | **Language**: JavaScript/TypeScript

## Why Learn This (Legacy Context)
> Mocha + Chai was THE testing combination before Jest took over.
> You'll find it in many existing codebases from 2014-2018.

## Topics
1. Mocha test runner
2. Chai assertion library
3. describe, it, before, after, beforeEach, afterEach
4. Chai expect, should, assert styles
5. Async tests with done callback
6. Async tests with promises
7. Sinon for mocking
8. NYC for coverage
9. Running tests
10. Comparison: Mocha vs Jest

## Example
```javascript
const { expect } = require('chai');

describe('Calculator', () => {
    describe('add', () => {
        it('should add two numbers', () => {
            expect(add(2, 3)).to.equal(5);
        });
        
        it('should handle negative numbers', () => {
            expect(add(-1, 1)).to.equal(0);
        });
    });
});
```

## Content Instructions
**Notes**: Mocha + Chai testing guide
**Summary**: Mocha/Chai API reference
