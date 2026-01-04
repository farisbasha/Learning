# Phase 107: Passport.js Checksheet

## 1. Installation
```bash
npm install passport passport-local
npm install -D @types/passport @types/passport-local
```

## 2. Setup Flow
- [ ] **Configure Strategy**: Define how to check email/password.
- [ ] **Serializers**: Define `serializeUser` and `deserializeUser`.
- [ ] **App Config**: Initialize `passport` and `passport.session()`.
- [ ] **Routes**: Implement login and logout routes.
- [ ] **Guard**: Create an `isAuthenticated` middleware for protected routes.

## 3. Important Methods

| Method | Role |
| :--- | :--- |
| `passport.use(strategy)` | Register an auth method (Local, Google, etc). |
| `passport.initialize()` | Prepare Express for Passport. |
| `passport.session()` | Connect Passport to `express-session`. |
| `passport.authenticate()`| Middleware that triggers the login logic. |
| `req.login(user, cb)` | Log the user in manually (usually within authenticate). |
| `req.logout(cb)` | Removes session data and logs user out. |
| `req.isAuthenticated()` | Helper to check if a session exists. |

## 4. Implementation Snippet

```typescript
// Login Request
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true // requires connect-flash
}));

// Route Protection
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}
```

## 5. Laravel Comparison Table

| Node/Passport | Laravel |
| :--- | :--- |
| `req.user` | `Auth::user()` |
| `req.isAuthenticated()` | `Auth::check()` |
| `passport.authenticate('local')` | `Auth::attempt($credentials)` |
| `req.logout()` | `Auth::logout()` |
| `serializeUser` | Cookie Persistence Logic |
