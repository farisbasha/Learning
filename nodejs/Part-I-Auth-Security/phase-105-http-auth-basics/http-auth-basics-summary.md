# Phase 105: Authentication Methods Comparison

## Comparison Chart

| Feature | Basic Auth | Session-based | Token-based (JWT) |
| :--- | :--- | :--- | :--- |
| **State** | Stateless (must send creds) | Stateful (Server remembers) | Stateless (Self-contained) |
| **Storage (Client)** | Browser Cache | Cookie (connect.sid) | LocalStorage/Cookie |
| **Storage (Server)** | None (checked vs DB) | Session Store (Redis/DB/RAM) | None (Signature verification) |
| **Revocation** | Impossible (until browser close) | Easy (Delete session) | Hard (Wait for expiry/Blacklist) |
| **Scalability** | Good | Moderate (needs shared store) | Excellent |
| **Security** | Minimal (requires HTTPS) | Good (protect vs XSS/CSRF) | Good (protect vs XSS) |
| **Standard Header** | `Authorization: Basic ...` | `Cookie: connect.sid=...` | `Authorization: Bearer ...` |

## Authentication vs Authorization Checklist

- [ ] **Authentication**: verify user identity (username, password, fingerprint, OAuth).
- [ ] **Authorization**: verify access rights (admin, editor, viewer, guest).
- [ ] **Identification**: the claim of identity (e.g., username).
- [ ] **Verification**: confirming the claim (e.g., checking the password).

## Security Essentials

1. **HTTPS**: Absolute requirement.
2. **Password Hashing**: Use `bcrypt` or `Argon2`.
3. **No Plain Text**: Never log or store passwords in plain text.
4. **Rate Limiting**: Prevent brute force attacks.
