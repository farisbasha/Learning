# Phase 119: CSRF Prevention Checklist

## 1. Cookie Configuration

The single most important step for Express apps:

```typescript
app.use(session({
  cookie: {
    sameSite: 'lax', // Mandatory defense
    httpOnly: true,  // Prevents XSS theft
    secure: true     // Recommended
  }
}));
```

## 2. API Header Check (For SPAs)

Ensure that requests are coming from your frontend:

```typescript
const verifyOrigin = (req, res, next) => {
    const origin = req.get('origin');
    if (origin !== 'https://my-app.com') {
        return res.status(403).json({ error: 'Invalid Origin' });
    }
    next();
};
```

## 3. CSRF Vulnerability Matrix

| Auth Method | Vulnerable? | Solution |
| :--- | :--- | :--- |
| **Sessions (Cookies)** | ✅ YES | `SameSite: Lax` + CSRF Tokens |
| **JWT (Cookies)** | ✅ YES | `SameSite: Lax` |
| **JWT (Header)** | ❌ NO | Safe (Auth Header isn't automatic) |
| **Basic Auth** | ❌ NO | Authorization Header is manual |

## 4. Key Rules for Developers
- [ ] **Method Choice**: Never use `GET` for actions that change data (Delete, Update).
- [ ] **SameSite**: Use `lax` or `strict`. Avoid `none`.
- [ ] **Headers**: Use custom headers (like `X-Requested-With`) which triggers a CORS pre-flight and prevents CSRF.

## 🤝 Relationship with Laravel
In Laravel, CSRF protection is active by default for all "web" routes. In Express, you must remember to set the `sameSite` attribute in your session configuration, or use specific middleware if building a traditional multi-page app (MPA).
