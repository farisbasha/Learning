# Phase 027: Callbacks — The Original Pattern
## Agent Instructions

**Phase**: 027 | **Part**: D - Async Programming | **Language**: JavaScript (Legacy)

## Topics
1. What is a callback — function passed as argument
2. Synchronous vs asynchronous callbacks
3. Passing functions as arguments
4. Callback execution context
5. Simple callback examples
6. Why callbacks exist in Node.js
7. Reading legacy callback code

## Why Learn This (Legacy)
> Many older Node.js codebases still use callbacks.
> You'll encounter them in job switches and maintain legacy code.

## Example
```javascript
function fetchData(callback) {
    setTimeout(() => {
        callback('Data loaded!');
    }, 1000);
}

fetchData((result) => {
    console.log(result);
});
```

## Content Instructions
**Notes**: Callback concept with legacy examples
**Summary**: Callback patterns reference
