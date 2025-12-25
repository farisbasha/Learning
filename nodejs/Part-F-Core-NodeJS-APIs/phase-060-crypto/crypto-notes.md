# Phase 060: Crypto Module — Notes

Security is not something you should build yourself. Node.js provides a robust, battle-tested `crypto` module built on top of OpenSSL for all your encryption, hashing, and signature needs.

---

## 1. Hashing (One-Way)

Hashing is used to create a "fingerprint" of data. Important: **Never use these for simple passwords** (use `bcrypt` or `argon2` instead).

```typescript
import crypto from 'crypto';

const hash = crypto.createHash('sha256')
                 .update('your data here')
                 .digest('hex');

console.log(hash); // 64-character hexadecimal string
```

---

## 2. HMACS (Signed Hashes)

An HMAC is a hash that requires a "Secret Key." It's used to verify that data hasn't been tampered with and that it was sent by someone who knows the key.

```typescript
const hmac = crypto.createHmac('sha256', 'SECRET_KEY')
                   .update('some message')
                   .digest('hex');
```

---

## 3. Random Data & UUIDs

Computers are naturally predictable. `crypto` provides "Cryptographically Secure" random numbers that are safe for tokens and IDs.

### Random Bytes
```typescript
const token = crypto.randomBytes(32).toString('hex');
```

### UUIDs (Standard Unique IDs)
```typescript
const id = crypto.randomUUID(); // '550e8400-e29b-41d4-a716-446655440000'
```

---

## 4. Encryption (Two-Way)

Node supports both Symmetric (one key) and Asymmetric (Public/Private keys) encryption. This is complex and usually handled by higher-level wrapper libraries in a real app.

---

## 5. Why no Passwords here?

The `crypto` module is low-level and optimized for speed. Passwords need to be hashed using algorithms that are **deliberately slow** (to prevent brute-force attacks). 
- ❌ `crypto.createHash('sha256')` -> Too fast.
- ✅ `bcrypt` or `scrypt` -> Secure.

---

## 6. Key Takeaways
1. **Sha256**: The industry standard for data verification.
2. **hex vs base64**: Always decide on an encoding for your digests.
3. **Randomness**: Always use `crypto.randomBytes`, never `Math.random()`, for security tokens.
4. **Summary**: The `crypto` module makes your app professional and secure. Next, we'll look at **Zod**, the modern way to ensure your data matches your types.
