# Phase 071: Built-in Middleware
## Agent Instructions

**Phase**: 071 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. `express.json()` — JSON body parsing
2. `express.urlencoded()` — form data parsing
3. `extended: true` vs `extended: false`
4. `express.static()` — serving static files
5. `express.raw()` — raw body for webhooks
6. `express.text()` — text body
7. Configuration options for each
8. Order of middleware registration
9. Laravel comparison: Built-in methods in Laravel

## Example
```typescript
// Common middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
```

## Content Instructions
**Notes**: Complete guide to Express built-in middleware
**Summary**: Built-in middleware quick reference
