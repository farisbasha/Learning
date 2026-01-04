# Phase 119: CSRF Protection (Cross-Site Request Forgery)

## Overview

**Cross-Site Request Forgery (CSRF)** is a vulnerability where an attacker tricks a user's browser into performing an unwanted action on a different website where the user is already authenticated.

This phase covers how CSRF works, when you are at risk (and when you are not), and modern strategies for preventing it, including the movement away from traditional CSRF tokens towards **SameSite cookies**.

---

## 1. What is CSRF? (The Attack)

CSRF works because browsers **automatically include cookies** matching a domain when sending a request to that domain.

1. **Victim**: Logged into `bank.com` with a session cookie.
2. **Attacker**: Tricks victim into visiting `evil-site.com`.
3. **Evil Request**: `evil-site.com` contains a hidden form that POSTs to `bank.com/transfer?to=attacker`.
4. **The Trap**: The victim's browser sends the request AND the authentic `bank.com` cookie.
5. **The Server**: Sees a valid cookie and processes the transfer.

---

## 2. When do you need CSRF protection?

- **REQUIRED**: If you use **Cookies** for authentication (Express-session).
- **NOT REQUIRED**: If you use **Stateless JWTs** stored in `Authorization: Bearer` headers (because the browser doesn't automatically send those).
- **NOT REQUIRED**: For `GET`, `HEAD`, `OPTIONS` requests (which should be "safe" operations).

---

## 3. The Modern Solution: SameSite Cookies

The most effective and simplest way to block CSRF today is setting the `SameSite` attribute on your session cookie. This tells the browser: "Only send this cookie if the request originates from my own site."

### Configuration
```typescript
app.use(session({
    cookie: {
        sameSite: 'lax',   // or 'strict'
        secure: true,      // Required for 'none' and best for all
        httpOnly: true,
    }
}));
```

- **`lax`**: Default in most browsers. Cookies are sent when navigating to the site (clicks), but NOT on cross-site POST requests.
- **`strict`**: Cookies are NEVER sent from a third-party site. Even clicking a link from Google won't log you in.

---

## 4. The Classic Solution: CSRF Tokens (Double Submit)

If you need to support old browsers or have very complex sub-domain requirements, you use a **CSRF Token**.

**The Pattern**:
1. Server generates a random secret token and sends it to the client.
2. The client must include this token in a custom header (e.g., `X-CSRF-TOKEN`) for every `POST/PUT/DELETE`.
3. The server compares the token in the header with the one it expects.

### Double Submit Cookie Pattern
This is common for SPAs (React/Vue).
1. Server sets a cookie `csrf-token=XYZ`.
2. Frontend reads that cookie (using JS) and puts it in the `X-CSRF-TOKEN` header.
3. Server verifies that `Header === Cookie`.
4. An attacker on `evil.com` cannot read the cookie due to **Same-Origin Policy**, so they cannot set the header correctly.

---

## 5. Security & Frameworks

The `csurf` package was the standard for years, but it is now **deprecated**. Modern Express apps should:
1. Use **`SameSite: lax`** as the primary defense.
2. Verify the **Host** and **Origin** headers for state-changing requests.
3. If using an SPA, implement a custom token check as shown above.

---

## 6. PHP / Laravel Comparison

### Laravel @csrf
Laravel is famous for making CSRF protection effortless.
- **Blade**: Every form needs `@csrf` which injects a hidden input field.
- **Middleware**: The `VerifyCsrfToken` middleware checks every POST request automatically.

In Node.js, since we often build APIs or SPAs, the "form injection" approach is rarer. We typically rely on **SameSite** cookies or **Header validation**. Laravel's approach is more tightly integrated into the View engine, whereas Node.js requires you to explicitly configure these policies in your session middleware.

---

## Key Takeaways

1. **SameSite: Lax** is your first and best defense.
2. CSRF only affects **Cookie-based** authentication.
3. **GET requests** must be side-effect-free (don't delete data in a GET).
4. For SPAs, verify the **Origin** header to ensure requests come from your approved domain.
5. In modern Node.js dev, you rarely need the complexity of a specialized CSRF token library if your cookies are configured correctly.
6. **HTTPS** is required for `SameSite=None` or `Secure` cookies.
