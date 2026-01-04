# Phase 107: Passport.js Local Strategy (Legacy)

## Overview

**Passport.js** is arguably the most recognizable name in Node.js authentication. Since its release in 2012, it has dominated the ecosystem through its "Strategy" pattern—the idea that you can swap authentication methods (Local, Google, JWT) while keeping the same application glue.

While modern developers sometimes prefer lighter, more explicit alternatives (like direct Zod + JWT), Passport is an **essential skill** for professional Node.js developers as it powers thousands of existing production applications.

---

## 1. What is Passport?

Passport is authentication middleware for Node.js. It does NOT handle session management or password hashing; it strictly handles the **authentication logic** (taking credentials and returning a user object).

### The Strategy Pattern
Passport uses modular "Strategies" to handle different types of logins:
- `passport-local`: Username/password.
- `passport-google-oauth20`: Google login.
- `passport-jwt`: Token-based API auth.

---

## 2. Core Concepts: Initialize, Serialize, Deserialize

For Passport to work with sessions, it needs to know how to store the user in the session and how to get them back.

### Initialization
```typescript
app.use(passport.initialize());
app.use(passport.session()); // Plugs into express-session
```

### 1. Serialize User
Decides which pieces of info to save in the session (usually just the ID).
```typescript
passport.serializeUser((user, done) => {
    done(null, user.id);
});
```

### 2. Deserialize User
Takes the ID from the session and looks up the full user in the database. Passport then attaches this to `req.user`.
```typescript
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});
```

---

## 3. Implementing Local Strategy (`passport-local`)

The Local Strategy handles traditional email/password login.

### Setup
```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Tell passport we use 'email' instead of 'username'
    async (email, password, done) => {
        try {
            // 1. Find user
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            // 2. Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            // 3. Identification success
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
```

---

## 4. The Request Lifecycle

1. **User submits login form**: `POST /login`.
2. **Passport Authenticates**: `passport.authenticate('local')` runs the strategy.
3. **Success**: Passport runs `serializeUser`, stores `id` in session, and redirects.
4. **Next Request**: Browser sends `sid` cookie.
5. **Session Middleware**: Looks up the session in the store.
6. **Passport Middleware**: Calls `deserializeUser(id)` and attaches the user to **`req.user`**.

---

## 5. Route Protection

Passport provides an easy way to check if a user is logged in using the automatically added `req.isAuthenticated()` method.

### Custom Middleware
```typescript
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Application
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.json({ user: req.user });
});
```

---

## 6. PHP / Laravel Comparison

### Laravel Auth
In Laravel, `Auth::attempt()` combined with sessions is very similar to how Passport works.
- **`serializeUser`** is handled by Laravel's internal cookie/session logic.
- **`deserializeUser`** is equivalent to Laravel's "User provider" looking up the user from the ID in the session.
- **`req.user`** is equivalent to **`Auth::user()`**.
- **`ensureAuthenticated`** is equivalent to the **`auth`** middleware in Laravel.

---

## 7. TypeScript Tips

When using Passport with TypeScript, you need to extend the Express Request and User interfaces.

```typescript
// types/express/index.d.ts
import { User as AppUser } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}
```

This allows you to access `req.user.email` without TypeScript errors.

---

## Key Takeaways

1. **Passport** is the "industrial standard" for Node.js authentication.
2. The **Local Strategy** is for standard username/password logins.
3. **Serialization** (saving ID to session) and **Deserialization** (loading User from ID) are the core session-linking mechanisms.
4. **`req.user`** is where the authenticated user lives after middleware processing.
5. **Middleware order matters**: `session()` must come before `passport.session()`.
