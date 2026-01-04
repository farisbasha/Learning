# Phase 112: Password Hashing implementation Summary

## 🛠️ bcrypt Patterns

```typescript
import bcrypt from 'bcrypt';

// 1. To Hash (usually in User Service / Registration)
const hash = await bcrypt.hash(password, 12);

// 2. To Verify (usually in Login Controller)
const isMatch = await bcrypt.compare(password, storedHash);
```

## 🛠️ Argon2 Patterns

```typescript
import argon2 from 'argon2';

// 1. To Hash
const hash = await argon2.hash(password);

// 2. To Verify
const isMatch = await argon2.verify(storedHash, password);
```

---

## Hashing Configuration Cheat-Sheet

| Setting | Recommended Value | Why? |
| :--- | :--- | :--- |
| **bcrypt Rounds** | 12 | Balance of security and performance. |
| **Argon2 Type** | `argon2id` | Best protection against all attacks. |
| **Argon2 Memory** | 64 MB (`2**16`) | Harder for GPUs to parallelize. |

## ❌ Anti-Patterns (Don't do these!)
- **Sync methods**: `hashSync` will kill your server's throughput.
- **Short Salts**: Never manage salts yourself; let the library do it.
- **Hardcoded Rounds**: Don't hardcode them in components; use a config/env.

## 🤝 PHP/Laravel Equivalence

```php
// Laravel
$hash = Hash::make($password);
$check = Hash::check($password, $hash);

// Node
const hash = await bcrypt.hash(password, 12);
const check = await bcrypt.compare(password, hash);
```
*Remember: Node always needs `await`!*
