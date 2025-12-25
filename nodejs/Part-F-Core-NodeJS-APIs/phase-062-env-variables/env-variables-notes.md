# Phase 062: Environment Variables — Notes

Your application needs configuration (DB passwords, API keys) that changes between Development and Production. We store these in **Environment Variables** to keep secrets out of our code.

---

## 1. Using `.env` Files

We use the `dotenv` package to load variables from a file named `.env` into `process.env`.

```bash
npm install dotenv
```

```env
# .env
PORT=3000
DATABASE_URL="postgres://..."
```

---

## 2. Type-Safe Config (The Professional Way)

In a raw Node project, `process.env.KEY` is always `string | undefined`. This results in `if (!process.env.KEY)` checks everywhere. Instead, we use **Zod** (from Phase 061) to validate our environment at startup.

```typescript
// src/config/env.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  DB_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

// This will CRASH the app immediately if a secret is missing.
// Much better than failing silently deep in the code!
export const env = envSchema.parse(process.env);
```

---

## 3. Multiple Environments

- **`.env.development`**: For your local machine.
- **`.env.test`**: For running Jest/Vitest.
- **`.env.production`**: Usually injected by your host (Heroku, AWS, DigitalOcean) and **never** committed to Git.

---

## 4. PHP Comparison

| PHP | Node.js |
|-----|---------|
| `$_ENV['DB_URL']` | `process.env.DB_URL` |
| `env('PORT')` | `process.env.PORT` |
| `dotenv` PHP library | `dotenv` npm library |

---

## 5. Key Takeaways
1. **Security**: Add `.env` to your `.gitignore` immediately!
2. **Early Failure**: Validate your env variables as the **first line** of your application.
3. **Types**: Use Zod to transform "3000" into a number `3000`.
4. **Conclusion**: You have completed **Part F: Core Node.js APIs**! You now have a deep understanding of files, networking, scaling, security, and configuration.
5. **Next Step**: We enter **Milestone 3**, where we stop building things from scratch and start using the world's most popular framework: **Express**.
