# Phase 116: API Keys
## Agent Instructions

**Phase**: 116 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. API keys vs JWT — different use cases
2. When to use API keys
3. Generating secure API keys
4. Storing API keys (hashed!)
5. API key middleware
6. Rate limiting per API key
7. API key scopes/permissions
8. Key rotation
9. Dashboard for key management
10. Laravel comparison: API tokens

## Example
```typescript
import crypto from 'crypto';

// Generate API key
const generateApiKey = (): { key: string; hash: string } => {
    const key = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    return { key, hash };
};

// Verify API key middleware
const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }
    
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyRecord = await prisma.apiKey.findUnique({ where: { hash } });
    
    if (!keyRecord) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    
    req.apiKey = keyRecord;
    next();
};
```

## Content Instructions
**Notes**: API key authentication implementation
**Summary**: API key patterns reference
