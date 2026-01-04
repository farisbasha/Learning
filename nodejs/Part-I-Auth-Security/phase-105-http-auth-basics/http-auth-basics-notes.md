# Phase 105: HTTP Authentication Basics

## Overview

Authentication is the process of verifying **who** a user is. In the early days of the web, this was simple, but as HTTP is a **stateless** protocol, maintaining that identity across multiple requests became the core challenge of web security.

This phase covers the fundamental concepts of authentication, the stateless nature of HTTP, and the legacy methods that paved the way for modern token-based and session-based systems.

---

## 1. Authentication vs. Authorization

It is critical to distinguish between these two "Auth" concepts:

| Concept | Question | Definition | Example |
| :--- | :--- | :--- | :--- |
| **Authentication (AuthN)** | Who are you? | Verification of identity (Login). | Checking a username/password or a social login. |
| **Authorization (AuthZ)** | What can you do? | Verification of permissions (Access Control). | Determining if a user can delete a post or access the admin panel. |

---

## 2. The Challenge: HTTP is Stateless

By design, HTTP doesn't "remember" anything.
- Request 1: "I am John, here is my password." -> Server: "OK, welcome."
- Request 2: "Show me my profile." -> Server: "Who are you?"

Because every request is a fresh start, we must send some form of "proof of identity" with **every single request** that requires authentication.

---

## 3. Legacy Authentication Methods

### Basic Authentication
The oldest and simplest form of authentication. The credentials are sent in the `Authorization` header.

- **Mechanism**: `Authorization: Basic [Base64(username:password)]`
- **Example**: If credentials are `admin:password`, the string is `admin:password` -> `YWRtaW46cGFzc3dvcmQ=`
- **Header**: `Authorization: Basic YWRtaW46cGFzc3dvcmQ=`

**❌ Cons:**
- Credentials are NOT encrypted (Base64 is NOT encryption).
- Credentials must be sent with every request.
- No way to "logout" (the browser caches the credentials until closed).
- Vulnerable to Man-in-the-Middle (MitM) attacks without HTTPS.

### Digest Authentication
An improvement over Basic Auth that avoids sending passwords in plain text.

- **Mechanism**: The server sends a "nonce" (number used once). The client hashes the password + nonce + other info.
- **Header**: `Authorization: Digest username="admin", realm="Restricted", nonce="..." ...`

**❌ Cons**: Still not ideal for modern web apps; superseded by Session and Token systems.

---

## 4. Modern Architecture: Session-based vs. Token-based

To solve the statelessness problem, two dominant patterns emerged:

### Pattern A: Session-based (Stateful)
*The server remembers you.*

1. User logs in.
2. Server creates a **Session ID** and stores it in memory or a database.
3. Server sends the ID to the client via a **Set-Cookie** header.
4. Browser stores the cookie and sends it automatically with every future request.
5. Server looks up the ID in its store to find the user.

**Best for**: Traditional web apps, server-rendered apps (SSR), monoliths.

### Pattern B: Token-based (Stateless)
*You carry your own identity.*

1. User logs in.
2. Server creates a signed **Token** (usually a JWT) containing user data.
3. Server sends the token to the client.
4. Client stores the token (LocalStorage, SessionStorage, or Cookie).
5. Client sends the token manually in the `Authorization: Bearer <TOKEN>` header.
6. Server verifies the token's signature (no database lookup required).

**Best for**: Single Page Applications (SPAs), Mobile apps, Microservices, Scalable APIs.

---

## 5. Authentication Flows

### The Standard Login Flow
1. **Identification**: User provides credentials (email/password).
2. **Verification**: Server checks against the database.
3. **Issuance**: Server issues a Session ID or a Token.
4. **Maintenance**: Client includes proof (Cookie or Header) in subsequent requests.
5. **Validation**: Server validates the proof before executing the request.

---

## 6. Security Foundations

- **HTTPS is Mandatory**: Never handle credentials over HTTP.
- **Password Hashing**: NEVER store plain-text passwords. Use algorithms like `bcrypt` or `Argon2`.
- **Salting**: Adding a random string to each password before hashing to prevent rainbow table attacks.
- **Brute Force Protection**: Implement rate limiting and account lockouts.

---

## 7. PHP / Laravel Comparison

### Laravel Auth
If you are coming from Laravel, you are used to a high-level abstraction:
- **`Auth::attempt($credentials)`**: Handles identification and verification.
- **Sessions**: handled automatically by the `web` middleware group.
- **Tokens**: handled by Laravel Sanctum or Passport.

In Node.js/Express, none of this is built-in. You have to explicitly choose and configure:
1. A validation library (Zod).
2. A password hashing library (bcrypt).
3. A session manager (`express-session`) or JWT library (`jsonwebtoken`).
4. Middleware to protect routes.

---

## Key Takeaways

1. **Authentication** is identity; **Authorization** is permissions.
2. **Statelessness** means we must prove identity on every request.
3. **Basic/Digest Auth** are legacy and rarely used in modern web apps.
4. **Sessions** store state on the server; **Tokens** store state in the token itself.
5. **HTTPS** is the non-negotiable foundation of all authentication systems.
