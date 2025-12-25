# Phase 031: Promises Introduction
## Agent Instructions

**Phase**: 031 | **Part**: D - Async Programming | **Language**: TypeScript

## Topics
1. What is a Promise — object representing future value
2. Promise states: pending, fulfilled, rejected
3. Creating Promises: `new Promise<T>((resolve, reject) => {})`
4. `resolve(value)` — success
5. `reject(error)` — failure
6. Why Promises were invented (solve callback hell)
7. Promise vs Callback mental model

## TypeScript
```typescript
const fetchData = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve('Data loaded!'), 1000);
    });
};
```

## Content Instructions
**Notes**: Promise concept and creation
**Summary**: Promise basics cheatsheet
