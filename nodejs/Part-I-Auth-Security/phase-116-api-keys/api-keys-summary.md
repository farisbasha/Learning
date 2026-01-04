# Phase 116: API Key Patterns Summary

## 🛠️ Typical API Key Lifecycle

1. **Generation**: `key = sk_live_...`
2. **Hashing**: `hash = SHA256(key)`
3. **Storage**: Save `hash` in DB.
4. **Disclosure**: Show `key` to user (Once!).
5. **Validation**: Hash the incoming key from header and `findUnique` in DB.

## Header Standards

| Header | Example | Note |
| :--- | :--- | :--- |
| `X-API-KEY` | `sk_live_a1b2c3d4...` | Most common custom header. |
| `Authorization` | `Bearer sk_live_...` | Standard, but can conflict with User Auth. |
| `Link` | `?api_key=...` | **❌ AVOID**: Keys easily leak in server logs. |

## Implementation Checklist
- [ ] Random generation using `crypto`.
- [ ] SHA-256 hashing before DB storage.
- [ ] Secure header extraction logic.
- [ ] Deactivation/Revocation toggle in DB.
- [ ] Last-used timestamp logging.
- [ ] IP whitelisting (Optional but recommended).

## 🚀 Pro Tip: Key Prefixes
Use prefixes to help developers and tools:
- `pk_`: Public Key (safe to share in JS).
- `sk_`: Secret Key (must be kept secret).
- `test_`: Key for playground environments.

## 🤝 Relationship with Laravel
Laravel Sanctum’s API tokens are exactly the same concept:
- **Laravel**: `php artisan sanctum:install` -> `plainTextToken`
- **Node**: `sk_live_` + `crypto.randomBytes` -> `SHA256`
