# Phase 111: Hashing Algorithms Comparison

## Comparison Chart

| Algorithm | Type | Strategy | Recommendation |
| :--- | :--- | :--- | :--- |
| **MD5 / SHA-1** | Hash | Fast Hashing | **❌ DANGEROUS** (Obsolete) |
| **SHA-256** | Hash | Fast (General) | **❌ NOT for passwords** |
| **bcrypt** | Adaptive | CPU Cost (Rounds) | **✅ RECOMMENDED** (Standard) |
| **scrypt** | Adaptive | Memory + CPU Cost | **✅ EXCELLENT** |
| **Argon2id** | Adaptive | Memory + Time + Parallelism | **✨ GOLD STANDARD** (OWASP) |

## The Hashing Formula

```text
Hash = Algorithm(Password + Salt + WorkFactor)
```

## Security Best Practices Checklist

- [ ] **Hash only**: Never store plain text or encrypted passwords.
- [ ] **Strong Salt**: Use a unique, random salt for every user (managed by lib).
- [ ] **Adjustable Cost**: Increase the work factor as CPUs get faster (bcrypt rounds 10-12).
- [ ] **Async only**: Never use synchronous hashing in Node.js (it blocks the Event Loop).
- [ ] **Rate Limiting**: Apply at the login endpoint.

## Why slow hashing matters

| Speed | 1000 combinations | 1 Billion combinations |
| :--- | :--- | :--- |
| **MD5 (Fast)** | < 1 millisecond | ~1 minute |
| **bcrypt (Slow)** | ~2 minutes | **~3,100 Years** |

*Note: For a single user logging in, 100ms is instantaneous. For an attacker, it's a brick wall.*
