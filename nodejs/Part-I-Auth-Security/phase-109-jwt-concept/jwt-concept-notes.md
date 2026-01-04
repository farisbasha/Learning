# Phase 109: JWT Concept (JSON Web Token)

## Overview

JSON Web Tokens (JWT) are the industry standard for **stateless authentication**. Unlike sessions, where the server "remembers" the user in a database or memory, a JWT allows the user to carry their own identity in an encoded string.

This phase covers the theoretical structure of a JWT, how it ensures data integrity through digital signatures, and the trade-offs compared to traditional session-based systems.

---

## 1. What is a JWT?

A JWT is a compact, URL-safe means of representing claims to be transferred between two parties. It is most commonly used as a "Bearer Token" in the `Authorization` header.

### The Key Characteristic: Statelessness
A JWT contains all the necessary information about a user. When a server receives a JWT, it doesn't need to look up a database to know who the user is; it only needs to **verify the signature**.

---

## 2. Structure of a JWT

A JWT consists of three parts separated by dots (`.`):
`header.payload.signature`

### I. Header
Contains metadata about the token, typically the algorithm used and the type of token.
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
*Encoded (Base64Url)*: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### II. Payload (Claims)
Contains the actual data (claims). Claims are statements about an entity (typically, the user) and additional metadata.
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1516239022
}
```
*Encoded (Base64Url)*: `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ`

### III. Signature
Used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.
- **HMAC (HS256)**: Symmetric key (Secret).
- **RSA (RS256)**: Asymmetric keys (Public/Private).

---

## 3. Standard Claims (Reserved)

While you can add custom data, these registered claims are recommended for interoperability:

| Claim | Full Name | Purpose |
| :--- | :--- | :--- |
| **iss** | Issuer | Who created the token. |
| **sub** | Subject | Usually the User ID. |
| **aud** | Audience | Who the token is intended for. |
| **exp** | Expiration Time | When the token becomes invalid (TIMESTAMP). |
| **iat** | Issued At | When the token was created. |
| **nbf** | Not Before | The time before which the token is not yet valid. |

---

## 4. JWT vs. Sessions: When to Use?

| Feature | Sessions | JWT |
| :--- | :--- | :--- |
| **Storage** | Server (Redis/Database) | Client (LocalStorage/Cookie) |
| **Scalability** | Harder (Needs shared store) | Excellent (Stateless) |
| **Size** | Small (just the ID) | Larger (carries data) |
| **Revocation** | Easy (delete from DB) | Complex (needs Blacklisting or high frequency checks) |
| **Complexity** | Low | Moderate |

**Rule of Thumb**:
- Use **Sessions** for traditional web applications (SSR) where security revocation is paramount.
- Use **JWT** for Single Page Applications (SPAs), Mobile Apps, and Microservices architecture.

---

## 5. Security Realities (Common Misconceptions)

### 1. Encoding is NOT Encryption
A JWT is **Base64Url encoded**, not encrypted. Anyone who has the token can "decode" it on sites like `jwt.io` and read your payload.
- ❌ **DANGER**: Never put passwords, API keys, or sensitive PII in the JWT payload.

### 2. The Signature protects Integrity
The signature ensures that the payload hasn't been tampered with. If an attacker changes the `role` from "user" to "admin", the signature will no longer match, and the server will reject the token.

### 3. Signing Algorithms
- **HS256 (HMAC with SHA256)**: Shared secret. Good for internal use.
- **RS256 (RSA with SHA256)**: Public/Private keys. Best for distributed systems (e.g., Auth0, Firebase).

---

## 6. JWT Pros and Cons

### Pros
- **Decoupled**: Authentication server don't need to be the API server.
- **Reduced Latency**: No database lookup for every request.
- **Mobile Friendly**: Works where cookies might be difficult to manage.

### Cons
- **Cannot Logout Instantly**: Since the server doesn't "store" the token, you can't easily force someone to log out without extra complexity (Blacklisting).
- **Token Size**: Becomes a burden on bandwidth if payload is too large.
- **Stale Data**: If user permissions change in the DB, the token's payload might remain "admin" until it expires.

---

## Key Takeaways

1. **JWT** is a compact, stateless way to carry user identity.
2. Structure: **Header** (Metadata), **Payload** (Data), **Signature** (Security).
3. JWT is **publicly readable** (Encoded), but **digitally protected** (Signed).
4. **Statelessness** means better scalability but harder user revocation.
5. Always use **short expiration times** for security if using stateless JWTs.
