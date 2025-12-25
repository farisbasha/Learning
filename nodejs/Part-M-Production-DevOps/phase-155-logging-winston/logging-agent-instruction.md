# Phase 155: Logging with Winston
## Agent Instructions

**Phase**: 155 | **Part**: M - Production & DevOps | **Language**: TypeScript

## Topics
1. Why structured logging matters
2. Winston logger setup
3. Log levels: error, warn, info, debug
4. Log formats: json, simple
5. Transports: console, file, external
6. Daily rotating files
7. Request logging
8. Error logging
9. Log aggregation services
10. Laravel comparison: Log facade

## Example
```typescript
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d'
        })
    ]
});

// Usage
logger.info('Server started', { port: 3000 });
logger.error('Database error', { error: err, query });
```

## Content Instructions
**Notes**: Winston logging configuration
**Summary**: Logging setup checklist
