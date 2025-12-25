# Phase 134: Unit Testing
## Agent Instructions

**Phase**: 134 | **Part**: K - Testing | **Language**: TypeScript

## Topics
1. What is a unit test
2. Testing pure functions
3. Testing class methods
4. Isolation principles
5. Arrange-Act-Assert pattern
6. Test naming conventions
7. Edge cases
8. Boundary testing
9. Testing error conditions
10. Test organization

## Example
```typescript
// src/utils/calculator.ts
export const add = (a: number, b: number): number => a + b;
export const divide = (a: number, b: number): number => {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
};

// src/utils/calculator.test.ts
describe('Calculator', () => {
    describe('add', () => {
        test('adds positive numbers', () => {
            expect(add(2, 3)).toBe(5);
        });
        
        test('adds negative numbers', () => {
            expect(add(-2, -3)).toBe(-5);
        });
    });
    
    describe('divide', () => {
        test('divides numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });
        
        test('throws on division by zero', () => {
            expect(() => divide(10, 0)).toThrow('Division by zero');
        });
    });
});
```

## Content Instructions
**Notes**: Unit testing patterns and practices
**Summary**: Unit test patterns reference
