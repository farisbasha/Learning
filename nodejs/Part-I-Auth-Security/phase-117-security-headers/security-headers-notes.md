# Phase 117: Security Headers (Helmet)

## Overview

A large portion of web security happens within the browser. However, the browser needs instructions from the server on what security policies to enforce. These instructions are sent via **HTTP Security Headers**.

This phase covers how to use the **Helmet** package to automatically set these headers and protect your application against common vulnerabilities like Clickjacking, Cross-Site Scripting (XSS), and MIME-sniffing.

---

## 1. Why Security Headers Matter

Security headers act as a "first line of defense". They tell the browser:
- "Don't allow this site to be embedded in an iframe" (Prevents Clickjacking).
- "Only load scripts from these trusted domains" (Prevents XSS).
- "Only communicate with this server over HTTPS" (Prevents Man-in-the-Middle).

---

## 2. Implementing Helmet

**Helmet** is a collection of 15 smaller middleware functions that set security-related HTTP headers.

### Installation
```bash
npm install helmet
```

### Basic Usage
```typescript
import express from 'express';
import helmet from 'helmet';

const app = express();

// Set default security headers
app.use(helmet());
```

---

## 3. Key Headers Explained

| Header | Purpose | Strategy |
| :--- | :--- | :--- |
| **Content-Security-Policy (CSP)** | Prevents XSS and Data Injection. | Restricts where scripts/styles/images can be loaded from. |
| **X-Frame-Options** | Prevents Clickjacking. | Disallows the site from being rendered in an `<iframe\>`. |
| **Strict-Transport-Security (HSTS)** | Enforces HTTPS. | Browser remembers to only use HTTPS for this domain. |
| **X-Content-Type-Options** | Prevents MIME-sniffing. | Forces browser to respect the `Content-Type` header (e.g., don't execute a .txt as .js). |
| **Referrer-Policy** | Privacy. | Controls how much information is sent in the `Referer` header. |

---

## 4. Deep Dive: Content Security Policy (CSP)

CSP is the most powerful and complex header. It prevents XSS by declaring which dynamic resources are allowed to load.

### Custom Configuration
```typescript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            // Default: only allow resources from our own origin
            defaultSrc: ["'self'"],
            
            // Allow scripts from our origin and a trusted CDN
            scriptSrc: ["'self'", "cdn.jsdelivr.net"],
            
            // Allow styles from our origin and Google Fonts
            styleSrc: ["'self'", "fonts.googleapis.com"],
            
            // Allow images from our origin and S3
            imgSrc: ["'self'", "data:", "*.amazonaws.com"],
            
            // Upgrade insecure requests (HTTP -> HTTPS)
            upgradeInsecureRequests: [],
        },
    },
}));
```

---

## 5. Clickjacking Protection

Clickjacking is an attack where a user is tricked into clicking something on a malicious site while a transparent iframe of your site is layered over it.

**Helmet Solution**: `X-Frame-Options: DENY` or `SAMEORIGIN`.
```typescript
app.use(helmet.frameguard({ action: 'deny' }));
```

---

## 6. Referrer-Policy

When a user clicks a link from your site to another site, the browser sends your URL in the `Referer` header. This can leak sensitive data (like IDs in the URL).

```typescript
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
```

---

## 7. Performance & Verification

- **Verification**: You can check your site's headers using [securityheaders.com](https://securityheaders.com).
- **Overhead**: Helmet adds negligible overhead to your application but provides significant security gains.

---

## 8. PHP / Laravel Comparison

### Laravel Security Headers
Laravel doesn't include security headers "out of the box" in a way that maps specifically to Helmet. Usually, Laravel developers use packages like `spatie/laravel-csp` or manually configure headers in the `App\Http\Middleware\TrustProxies` or a custom middleware.

In Node.js, **Helmet** is the 100% standard way to handle this, making it more streamlined for Node.js developers.

---

## Key Takeaways

1. **Helmet** is mandatory for any production Express app.
2. **CSP** is your strongest weapon against XSS but requires careful configuration.
3. **MIME-sniffing** protection prevent browsers from interpreting non-JS files as JS.
4. **HSTS** ensures users stay on HTTPS once they've visited.
5. Use **`securityheaders.com`** to audit your implementation.
6. **Start with defaults**, then customize CSP as your app grows.
