# Phase 112: bcrypt & Argon2
## Agent Instructions

**Phase**: 112 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. bcrypt implementation
2. `bcrypt.hash()` and `bcrypt.compare()`
3. Salt rounds configuration
4. Argon2 as modern alternative
5. argon2id variant
6. Memory and time cost
7. Choosing between bcrypt and argon2
8. Async hashing (don't block!)
9. Migration between algorithms
10. Testing password hashing

## Example
```typescript
import bcrypt from 'bcrypt';
import argon2 from 'argon2';

// bcrypt
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// argon2 (more secure, newer)
async function hashWithArgon2(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
    });
}

async function verifyArgon2(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
}
```

## Content Instructions
**Notes**: bcrypt and argon2 implementation guide
**Summary**: Password hashing code patterns
