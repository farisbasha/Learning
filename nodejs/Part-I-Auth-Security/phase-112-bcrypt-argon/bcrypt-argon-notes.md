# Phase 112: bcrypt & Argon2 Implementation

## Overview

Applying the concepts from Phase 111, this phase focuses on the hands-on implementation of password hashing in a Node.js environment. We will cover the industry-standard `bcrypt` and the modern powerhouse `argon2`, emphasizing the importance of **asynchronous** operations to keep the Node.js Event Loop responsive.

---

## 1. Using bcrypt

`bcrypt` is the most common choice due to its simplicity and platform support.

### Installation
```bash
npm install bcrypt
npm install -D @types/bcrypt
```
*Note: If you encounter installation issues on Windows/macOS, you can use `bcryptjs`, which is a pure JavaScript implementation (though slightly slower).*

### Salt Rounds (Work Factor)
Bcrypt uses **Rounds**. Each increment in rounds doubles the time it takes to compute a hash.
- **10**: Baseline (Standard).
- **12**: Recommended for modern hardware (takes ~100-200ms).
- **>14**: Often starts causing noticeable lag on the server.

### Implementation Pattern
```typescript
import bcrypt from 'bcrypt';

export class PasswordHasher {
    private static readonly ROUNDS = 12;

    static async hash(password: string): Promise<string> {
        // Generating the salt and hashing is combined into one step
        return bcrypt.hash(password, this.ROUNDS);
    }

    static async compare(password: string, hash: string): Promise<boolean> {
        // Automatically extracts the salt from the hash and compares
        return bcrypt.compare(password, hash);
    }
}
```

---

## 2. Using Argon2 (The Modern Recommendation)

Argon2 is more secure against specialized hardware (GPU/ASIC) attacks.

### Installation
```bash
npm install argon2
```

### Configuration
Argon2 has three main variants:
- `argon2d`: Maximizes resistance to GPU attacks (Good for crypto).
- `argon2i`: Maximizes resistance to side-channel attacks.
- **`argon2id`**: **Hybrid approach. Best for passwords.**

### Implementation Pattern
```typescript
import argon2 from 'argon2';

export class ArgonHasher {
    static async hash(password: string): Promise<string> {
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,        // Number of passes
            parallelism: 1      // Number of threads
        });
    }

    static async verify(hash: string, password: string): Promise<boolean> {
        return argon2.verify(hash, password);
    }
}
```

---

## 3. The Event Loop Warning (Async vs Sync)

**CRITICAL**: Never use the `bcrypt.hashSync()` or `bcrypt.compareSync()` methods in a production web server.
- Hashing is a CPU-intensive operation.
- If it takes 200ms, your server is **completely blocked** for 200ms.
- 10 concurrent logins would block your server for 2 seconds.
- **Always use the `async` versions.**

---

## 4. Migration Strategy

If you decide to move from `bcrypt` to `argon2`:
1. Use both libraries.
2. When a user logs in, try `argon2.verify()`.
3. If it fails, try `bcrypt.compare()`.
4. If `bcrypt` succeeds, immediately re-hash the password with `argon2` and save it to the database.
5. Over time, all active users will be migrated to the new algorithm.

---

## 5. Security & Error Handling

- **Error messages**: Always return generic message "Invalid email or password". Never tell an attacker "Password was correct but email was wrong" (this is called **Username Enumeration**).
- **Database Limits**: Some databases have limits on string length. Bcrypt hashes are usually ~60 characters; Argon2 can be longer depending on parameters.

---

## 6. PHP / Laravel Comparison

### Laravel Hash Facade
Laravel makes this extremely easy with the `Hash` facade, which defaults to `bcrypt` or `argon2` based on your `config/hashing.php`.

- **Laravel**: `Hash::make($password)`
- **Node**: `bcrypt.hash(password, rounds)`

The major difference is that in Node, you must explicitly handle the `async/await` because the CPU-intensive work is offloaded to the **Libuv Thread Pool** to prevent blocking the Event Loop.

---

## Key Takeaways

1. **Async Only**: Use asynchronous methods to protect the Event Loop.
2. **bcrypt** (12 rounds) is a solid, safe choice for most apps.
3. **Argon2id** is the elite choice for high-security applications.
4. **Abstraction**: Wrap your hashing in a service so you can swap it later.
5. **bcrypt Limit**: Remember standard bcrypt truncates after 72 characters.
