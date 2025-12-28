# Phase 073: Custom Middleware

## Overview

Custom middleware is where you implement **your own application-specific logic** that runs between requests and responses. This is one of Express's most powerful features - you can create reusable middleware for authentication, logging, validation, rate limiting, and more.

---

## What is Custom Middleware?

Middleware is just a function with this signature:

```typescript
(req: Request, res: Response, next: NextFunction) => void
```

**Your middleware can:**
- Modify `req` and `res` objects
- End the request-response cycle
- Call the next middleware in the stack
- Execute any code

---

## Creating Custom Middleware

### Basic Pattern

```typescript
import { Request, Response, NextFunction } from 'express';

export const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Do something
    console.log('Middleware executed');
    
    // Pass control to next middleware
    next();
};

// Usage
app.use(myMiddleware);
```

### Middleware That Modifies Request

```typescript
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
    // Add unique ID to every request
    req.id = crypto.randomUUID();
    
    // Also add to response headers
    res.setHeader('X-Request-Id', req.id);
    
    next();
};

// Extend Request type
declare global {
    namespace Express {
        interface Request {
            id: string;
        }
    }
}
```

### Middleware That Ends Request

```typescript
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        // End request here - don't call next()
        return res.status(401).json({ error: 'API key required' });
    }
    
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Valid - continue
    next();
};
```

---

## Common Custom Middleware Patterns

### 1. Request Logging

```typescript
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};
```

### 2. Request Timing

```typescript
export const requestTimer = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    
    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000; // Convert to ms
        
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    });
    
    next();
};
```

### 3. Authentication Middleware

```typescript
import jwt from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        
        // Attach user to request
        req.user = await getUserById(decoded.userId);
        
        if (!req.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Extend Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}
```

### 4. Authorization Middleware

```typescript
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Forbidden',
                message: `Requires one of: ${allowedRoles.join(', ')}`
            });
        }
        
        next();
    };
};

// Usage
app.delete('/users/:id', authenticate, authorize('admin', 'superadmin'), deleteUser);
```

### 5. Rate Limiting (Simple)

```typescript
interface RateLimitStore {
    [ip: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export const rateLimit = (options: {
    windowMs: number;
    max: number;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        
        // Clean up old entries
        if (store[ip] && store[ip].resetTime < now) {
            delete store[ip];
        }
        
        // Initialize or increment
        if (!store[ip]) {
            store[ip] = {
                count: 1,
                resetTime: now + options.windowMs
            };
        } else {
            store[ip].count++;
        }
        
        // Check limit
        if (store[ip].count > options.max) {
            const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: `${retryAfter}s`
            });
        }
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', options.max.toString());
        res.setHeader('X-RateLimit-Remaining', (options.max - store[ip].count).toString());
        res.setHeader('X-RateLimit-Reset', new Date(store[ip].resetTime).toISOString());
        
        next();
    };
};

// Usage
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### 6. CORS Middleware (Simple)

```typescript
export const cors = (options?: {
    origin?: string | string[];
    credentials?: boolean;
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin;
        
        // Set CORS headers
        if (options?.origin) {
            if (Array.isArray(options.origin)) {
                if (origin && options.origin.includes(origin)) {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                }
            } else {
                res.setHeader('Access-Control-Allow-Origin', options.origin);
            }
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        
        if (options?.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.status(204).send();
        }
        
        next();
    };
};
```

### 7. Request Validation Middleware

```typescript
import { z } from 'zod';

export const validateBody = <T extends z.ZodSchema>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        
        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.error.flatten()
            });
        }
        
        // Replace body with validated data
        req.body = result.data;
        next();
    };
};

// Usage
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

app.post('/users', validateBody(createUserSchema), createUser);
```

### 8. Error Catching Wrapper

```typescript
type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Usage - no try-catch needed!
app.get('/users', asyncHandler(async (req, res) => {
    const users = await db.user.findMany();
    res.json(users);  // Errors automatically forwarded
}));
```

### 9. Content Negotiation

```typescript
export const contentNegotiation = (req: Request, res: Response, next: NextFunction) => {
    const acceptHeader = req.headers.accept || '';
    
    // Helper methods
    req.wantsJSON = () => acceptHeader.includes('application/json');
    req.wantsHTML = () => acceptHeader.includes('text/html');
    req.wantsXML = () => acceptHeader.includes('application/xml');
    
    next();
};

// Extend Request
declare global {
    namespace Express {
        interface Request {
            wantsJSON(): boolean;
            wantsHTML(): boolean;
            wantsXML(): boolean;
        }
    }
}
```

### 10. Cache Control

```typescript
export const cacheControl = (maxAge: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        next();
    };
};

// Usage
app.get('/api/public-data', cacheControl(3600), getPublicData);
```

---

## Middleware Factory Pattern

Create configurable middleware:

```typescript
interface LoggerOptions {
    format?: 'simple' | 'detailed';
    includeBody?: boolean;
}

export const createLogger = (options: LoggerOptions = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            
            if (options.format === 'detailed') {
                console.log({
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                    duration: `${duration}ms`,
                    ...(options.includeBody && { body: req.body })
                });
            } else {
                console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
            }
        });
        
        next();
    };
};

// Usage
app.use(createLogger({ format: 'detailed', includeBody: true }));
```

---

## Middleware Composition

Combine multiple middleware:

```typescript
export const composeMiddleware = (...middleware: RequestHandler[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let index = 0;
        
        const dispatch = (i: number): any => {
            if (i >= middleware.length) {
                return next();
            }
            
            const fn = middleware[i];
            return fn(req, res, () => dispatch(i + 1));
        };
        
        dispatch(0);
    };
};

// Usage
const authStack = composeMiddleware(
    authenticate,
    authorize('admin'),
    validateBody(schema)
);

app.post('/admin/users', authStack, createUser);
```

---

## Testing Custom Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

describe('authenticate middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>;
    
    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });
    
    it('should call next() with valid token', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid-token'
        };
        
        await authenticate(mockReq as Request, mockRes as Response, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toBeDefined();
    });
    
    it('should return 401 without token', async () => {
        await authenticate(mockReq as Request, mockRes as Response, mockNext);
        
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });
});
```

---

## Key Takeaways

1. **Middleware is just a function** — `(req, res, next) => void`
2. **Call next() to continue** — Or send response to end
3. **Modify req/res freely** — Attach data for downstream handlers
4. **Factory pattern for config** — Return middleware from function
5. **Always handle errors** — Try-catch in async middleware
6. **Type extensions** — Use declaration merging for custom properties
7. **Test middleware independently** — Mock req, res, next
