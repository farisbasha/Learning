# Phase 107: Passport.js Local Strategy (Legacy)
## Agent Instructions

**Phase**: 107 | **Part**: I - Auth & Security | **Language**: TypeScript

## Why Learn Passport.js (Legacy Context)
> Passport.js has been THE authentication library since ~2012.
> You'll find it in most existing Node.js codebases.
> Modern alternatives exist, but Passport is still widely used.

## Topics
1. What is Passport.js — authentication middleware
2. Strategy pattern
3. passport-local for username/password
4. passport.initialize(), passport.session()
5. serializeUser, deserializeUser
6. Local strategy implementation
7. Login/logout flow
8. Protecting routes
9. Flash messages for errors
10. TypeScript typing for Passport

## Example
```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !await bcrypt.compare(password, user.password)) {
                return done(null, false, { message: 'Invalid credentials' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
});
```

## Content Instructions
**Notes**: Passport.js local authentication setup
**Summary**: Passport setup checklist
