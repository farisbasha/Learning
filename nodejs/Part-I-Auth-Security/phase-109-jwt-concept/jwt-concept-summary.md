# Phase 109: JWT Anatomy Summary

## Token Structure

```text
[Header].[Payload].[Signature]
```

### 1. Header (Metadata)
- `alg`: The algorithm used (e.g., `HS256`).
- `typ`: Fixed as `JWT`.

### 2. Payload (The Data)
Contains **Claims**:
- **Reserved Claims**: `sub` (ID), `exp` (Expiry), `iat` (Issued at).
- **Public/Private Claims**: Your own data like `role`, `email`, `name`.

### 3. Signature (The Verification)
Calculated using:
`Algorithm( Base64(Header) + "." + Base64(Payload), SECRET_KEY )`

---

## JWT Lifecycle

1. **User Login**: Sends credentials.
2. **Token Injection**: Server creates JWT signed with its Private Secret.
3. **Storage**: Client receives token and puts it in `Authorization: Bearer <TOKEN>`.
4. **Requests**: Client sends token every time.
5. **Verification**: Server checks the signature using its Secret. If valid, server Trusts the Payload data immediately.

---

## Security Red-Flags 🚩

- [ ] **Storing Sensitive Data**: Never put passwords in a JWT.
- [ ] **Long Expiration**: Don't issue tokens that last for weeks.
- [ ] **Ignoring the Claims**: Always check `iss` (Issuer) and `aud` (Audience).
- [ ] **Using weak Secrets**: Use long, random strings for `HS256`.

## JWT vs Session Quick Comparison

| Metric | Session | JWT |
| :--- | :--- | :--- |
| **Logout** | Delete from Store | Wait for Expiry |
| **Perf** | Read DB/Redis | CPU Verification |
| **Trust** | By Server State | By Math Signature |
| **Scalability**| Vertical | Horizontal |
