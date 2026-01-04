# Phase 108: Social Auth Configuration Reference

## 1. Popular Strategy Packages

| Provider | NPM Package | Scope Examples |
| :--- | :--- | :--- |
| **Google** | `passport-google-oauth20` | `profile`, `email` |
| **GitHub** | `passport-github2` | `user:email`, `read:user` |
| **Facebook** | `passport-facebook` | `email`, `public_profile` |
| **LinkedIn** | `passport-linkedin-oauth2`| `r_emailaddress`, `r_liteprofile` |

## 2. Configuration Pattern

```typescript
passport.use(new Strategy({
    clientID: process.env.ID,
    clientSecret: process.env.SECRET,
    callbackURL: "/auth/callback"
  }, (token, refreshToken, profile, done) => {
    // Database Logic: findOrCreateUser
    return done(null, user);
  }
));
```

## 3. Account Linking Logic

```typescript
// 1. Is user logged in? Link.
if (req.user) {
    await prisma.user.update({
        where: { id: req.user.id },
        data: { googleId: profile.id }
    });
}
// 2. Not logged in? Find by email.
const user = await prisma.user.findUnique({ 
    where: { email: profile.emails[0].value } 
});
```

## 4. OAuth Setup Checklist
- [ ] Create Developer Account (Google/GitHub/etc).
- [ ] Configure Authorized Redirect URIs (e.g., `http://localhost:3000/auth/google/callback`).
- [ ] Save Client ID and Secret to `.env`.
- [ ] Implement the Start Route (`/auth/google`).
- [ ] Implement the Callback Route (`/auth/google/callback`).
- [ ] Test with a real social account.

## 5. Comparison: Laravel Socialite

| Action | Laravel Socialite | Passport.js |
| :--- | :--- | :--- |
| Start Auth | `return Socialite::driver('google')->redirect();` | `app.get('/auth/google', passport.authenticate('google'));` |
| Callback | `Socialite::driver('google')->user();` | Callback function in `GoogleStrategy` definition |
| Data | `$user->getEmail()` | `profile.emails[0].value` |
| Drivers | Configured in `services.php` | Registered via `passport.use()` |
