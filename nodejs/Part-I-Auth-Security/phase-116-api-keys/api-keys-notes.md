# Phase 116: API Key Authentication

## Overview

While Users log in with a username and password, **Developers** and **Services** communicate with your API using **API Keys**. API Keys are long-lived, machine-readable strings that identify a specific application rather than a human user.

This phase covers the implementation of a secure API key system, including hashing, storage, and middleware-based validation.

---

## 1. API Keys vs. JWTs: When to use what?

| Feature | JWT (User Auth) | API Keys (Service Auth) |
| :--- | :--- | :--- |
| **Intended For** | Humans (Browsers/Mobile). | Machines (Scripts/Other servers). |
| **Lifetime** | Short-lived. | Long-lived (Months/Forever). |
| **Authentication** | Username/Password once. | Sent with **every** request. |
| **Revocation** | Moderate complexity. | Easy (Delete from DB). |
| **Examples** | Authorization: Bearer <JWT> | X-API-KEY: <secret_key> |

---

## 2. Security: Hashing API Keys

**The Golden Rule**: Never store API Keys in plain text.
Just like passwords, if your database is leaked, you don't want the attacker to have thousands of active keys to your API.

### Storage Strategy
In the database, we store a **hash** of the API key, not the key itself.
1. **Generation**: Create a random string (e.g., `sk_live_...`).
2. **Hashing**: Store the SHA-256 hash in the database.
3. **Disclosure**: Show the plain text key to the user **ONLY ONCE** (just like AWS or GitHub).

---

## 3. Implementation Pattern

### Generation Logic
```typescript
import crypto from 'crypto';

export class ApiKeyService {
    static generate() {
        // Use a prefix to make keys identifiable (e.g., Stripe's 'sk_live_')
        const key = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
        
        // Hash it for secure storage
        const hash = crypto.createHash('sha256').update(key).digest('hex');
        
        return { key, hash };
    }
}
```

### Authentication Middleware
```typescript
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get key from header
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
        return res.status(401).json({ error: 'Authentication required: X-API-KEY header missing.' });
    }

    // 2. Hash the incoming key to compare with the DB
    const incomingHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // 3. Look up in DB
    const keyRecord = await prisma.apiKey.findUnique({
        where: { hash: incomingHash },
        include: { user: true } // Identify which user this key belongs to
    });

    if (!keyRecord || !keyRecord.active) {
        return res.status(401).json({ error: 'Invalid or deactivated API key.' });
    }

    // 4. Attach metadata to request
    req.apiKey = keyRecord;
    req.user = keyRecord.user; // If the key maps to a user

    next();
};
```

---

## 4. Key Management: Quotas and Expiry

Advanced API key systems often include:
- **Scopes**: Restricted access (e.g., `read_only`, `write_billing`).
- **Whitelists**: Restricting keys to specific IP addresses.
- **Quotas**: Allowing only 1000 requests per month.
- **Rotation**: Automatically deactivating keys after a certain period if used.

---

## 5. Security Best Practices

- **Identifier Prefixes**: Use strings like `sk_` or `pk_`. This allows automated tools (like GitHub's secret scanner) to find leaked keys in code.
- **Last Used Field**: Update a `lastUsedAt` timestamp in your DB to help users see if their keys are being used (and where).
- **Constant Time Checks**: For high security, use `crypto.timingSafeEqual` if you aren't using hashing for primary lookup.

---

## 6. PHP / Laravel Comparison

### Laravel Sanctum (Tokens)
Laravel Sanctum's "API Tokens" are essentially API Keys.
- When you call `$user->createToken('token-name')`, it generates a random string.
- Laravel stores a `SHA-256` hash of that string in the `personal_access_tokens` table.
- Validation is handled by the `auth:sanctum` guard.

The Node.js logic we've built matches **exactly** how Laravel Sanctum handles its machine-to-machine tokens.

---

## Key Takeaways

1. **API Keys** are for machine-to-machine communication.
2. **Never store keys in plain text** (store SHA-256 hashes).
3. Provide **identifiable prefixes** (e.g., `sk_live_`).
4. Support **scopes** and **revocation** for better control.
5. Provide a dashboard where users can manage their keys safely.
6. **HTTPS** is mandatory; otherwise, keys can be intercepted by anyone on the network.
