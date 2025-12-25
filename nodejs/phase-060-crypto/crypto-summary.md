# Phase 060: Crypto — Summary Cheatsheet

## 🔒 Common Operations

| Goal | Method |
|------|--------|
| **Unique ID** | `crypto.randomUUID()` |
| **Secure Token**| `crypto.randomBytes(32).toString('hex')` |
| **File Fingerprint**| `crypto.createHash('sha256').update(data).digest('hex')` |
| **Tamper Check** | `crypto.createHmac('sha256', key).update(data).digest('hex')` |

---

## 🚨 Password Rule
**Do not use the native crypto module for user passwords.**
Use a dedicated library like `bcrypt`:
`npm i bcrypt`

---

## 💡 Remember
- Hashing is one-way (cannot be undone).
- HMAC is a hash + a secret key.
- `randomBytes` is synchronous by default, but has an async callback version if you need it.
- **Part F Progression**: Scaling → **Security** → Validation.
