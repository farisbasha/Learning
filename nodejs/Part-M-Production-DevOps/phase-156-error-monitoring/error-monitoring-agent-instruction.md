# Phase 156: Error Monitoring
## Agent Instructions

**Phase**: 156 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Why error monitoring is essential
2. Sentry integration
3. Setting up @sentry/node
4. Capturing errors
5. Adding context (user, request)
6. Performance monitoring
7. Source maps for stack traces
8. Alert configuration
9. Other options: LogRocket, Bugsnag
10. Laravel comparison: Exception handling

## Example
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1
});

// Express error handler
app.use((err, req, res, next) => {
    Sentry.captureException(err, {
        user: { id: req.user?.id, email: req.user?.email },
        extra: { path: req.path, method: req.method }
    });
    
    res.status(500).json({ error: 'Internal server error' });
});

// Manual capture
try {
    await riskyOperation();
} catch (err) {
    Sentry.captureException(err);
    throw err;
}
```

## Content Instructions
**Notes**: Error monitoring with Sentry
**Summary**: Sentry setup checklist
