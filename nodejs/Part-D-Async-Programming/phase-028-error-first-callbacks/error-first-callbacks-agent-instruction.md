# Phase 028: Error-First Callback Convention
## Agent Instructions

**Phase**: 028 | **Part**: D - Async Programming | **Language**: JavaScript (Legacy)

## Topics
1. The Node.js convention: `(err, data) => {}`
2. Why error comes first
3. Checking for errors before using data
4. Propagating errors
5. Real examples with `fs.readFile`
6. Legacy codebase patterns

## Key Pattern
```javascript
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log(data);
});
```

## Rule
> Always check `err` before using `data`!

## Content Instructions
**Notes**: Error-first convention explained
**Summary**: Error-first callback cheatsheet
