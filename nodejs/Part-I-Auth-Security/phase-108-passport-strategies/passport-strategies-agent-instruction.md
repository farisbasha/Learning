# Phase 108: Passport.js Strategies
## Agent Instructions

**Phase**: 108 | **Part**: I - Auth & Security | **Language**: TypeScript

## Topics
1. OAuth strategies overview
2. passport-google-oauth20
3. passport-facebook
4. passport-github2
5. passport-jwt for API auth
6. Multiple strategies in one app
7. Strategy configuration
8. Callback handling
9. Profile data normalization
10. Linking multiple providers to one user

## Example
```typescript
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    let user = await prisma.user.findUnique({
        where: { googleId: profile.id }
    });
    
    if (!user) {
        user = await prisma.user.create({
            data: {
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName
            }
        });
    }
    
    return done(null, user);
}));
```

## Content Instructions
**Notes**: Passport OAuth strategies guide
**Summary**: Strategy configurations reference
