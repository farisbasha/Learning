# Phase 078: Static File Serving
## Agent Instructions

**Phase**: 078 | **Part**: G - Express.js | **Language**: TypeScript

## Topics
1. `express.static()` middleware
2. Serving public assets (CSS, JS, images)
3. Multiple static directories
4. Virtual path prefix
5. Options: `maxAge`, `etag`, `index`
6. Cache control headers
7. Security considerations
8. Serving SPA build files
9. Fallback for client-side routing
10. Laravel comparison: `public/` folder

## Example
```typescript
// Basic static serving
app.use(express.static('public'));

// With virtual prefix
app.use('/assets', express.static('public'));

// SPA fallback
app.use(express.static('dist'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Content Instructions
**Notes**: Static file serving patterns for APIs and SPAs
**Summary**: Static middleware configuration
