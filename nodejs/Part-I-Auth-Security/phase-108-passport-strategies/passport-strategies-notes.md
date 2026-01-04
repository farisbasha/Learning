# Phase 108: Passport.js Social & OAuth Strategies

## Overview

In the modern web, users expect "Single Sign-On" (SSO) options like **Login with Google** or **GitHub**. This is accomplished using **OAuth 2.0**. Passport.js shines here because it has over 500+ strategies, allowing you to add social login to your application with minimal code change.

This phase covers the OAuth 2.0 flow, setting up the Google strategy, and managing profile data.

---

## 1. OAuth 2.0 Flow (Conceptual)

OAuth 2.0 is an authorization framework that lets a user grant a website access to their information on another website (like Google) without giving away their password.

1. **Redirect**: Your app redirects the user to Google: "Hey, can this app look at your email?"
2. **Consent**: User says "Yes" on Google's page.
3. **Authorization Code**: Google redirects back to your site with a temporary code.
4. **Exchange**: Your server sends that code back to Google in exchange for an **Access Token**.
5. **Fetch Data**: Your server uses the Access Token to get the user's Profile/Email from Google's API.
6. **Application Identity**: Your app finds/creates the user in your DB and logs them in.

---

## 2. Setting up Google Strategy

### Installation
```bash
npm install passport-google-oauth20
npm install -D @types/passport-google-oauth20
```

### Configuration
You first need to create a project in the [Google Cloud Console](https://console.cloud.google.com/) to get your `CLIENT_ID` and `CLIENT_SECRET`.

```typescript
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Look up the user by their googleId
        let user = await prisma.user.findUnique({
            where: { googleId: profile.id }
        });

        if (!user) {
            // If they don't exist, create them
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails?.[0].value!,
                    name: profile.displayName,
                    avatar: profile.photos?.[0].value
                }
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
  }
));
```

---

## 3. The Auth Routes

OAuth requires two routes: one to start the flow and one for the callback.

```typescript
// 1. Kick off the Google flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. The callback route Google redirects back to
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to home.
    res.redirect('/');
  }
);
```

---

## 4. Normalizing Profile Data

Different providers (Google, GitHub, Facebook) return data in different formats. Passport attempts to normalize these into a common format:
- `id`: Unique provider ID.
- `displayName`: Full name.
- `emails`: Array of email objects.
- `photos`: Array of image objects.

Always check the documentation for the specific strategy you are using, as small Differences exist.

---

## 5. Multiple Providers (Account Linking)

A common production challenge is when a user logs in with Google and then later tries to log in with GitHub. You typically want them to be the same user account.

**Strategy**:
1. Check if the user is already logged in (`req.user`).
2. If so, link the new provider ID to the existing user record in the DB.
3. If not logged in, check if a user with that email already exists.
4. link the IDs.

```typescript
// Conceptual Logic
const user = await prisma.user.findFirst({
    where: {
        OR: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
        ]
    }
});
```

---

## 6. PHP / Laravel Comparison

### Laravel Socialite
If you've used **Laravel Socialite**, the transition to Passport strategies is very intuitive.
- **`Socialite::driver('google')->redirect()`** is equivalent to **`passport.authenticate('google')`**.
- **`Socialite::driver('google')->user()`** is equivalent to the **callback function** in the Strategy configuration.

Laravel Socialite handles the "normalizing" of user data more strictly than Passport, but the overall flow is identical.

---

## 7. Security Considerations

- **State Parameter**: OAuth 2.0 implementations should use a `state` parameter to prevent CSRF. Most Passport strategies handle this automatically, but ensure it's enabled if adding custom logic.
- **Client Secret**: NEVER commit your Client Secret to version control. Use `.env` files.
- **Scope Creep**: Only ask for the scopes you absolutely need (`profile` and `email` are standard).

---

## Key Takeaways

1. **OAuth 2.0** is about access delegation, not password sharing.
2. **Strategies** handle the heavy lifting of the OAuth handshake.
3. **Normalize** data from different providers to maintain a clean database schema.
4. **Account Linking** is crucial for a good user experience.
5. **Callback URLs** must exactly match the ones configured in the Provider's dashboard (Google/GitHub/etc).
