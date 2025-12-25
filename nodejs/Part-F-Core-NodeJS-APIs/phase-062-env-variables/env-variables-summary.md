# Phase 062: Environment Variables — Summary Cheatsheet

## 🛠️ Setup Flow

1. **Install**: `npm i dotenv zod`
2. **Create**: `.env` file with `KEY=VALUE`.
3. **Load**: `dotenv.config()` at the top of your app.
4. **Use**: `process.env.KEY`.

---

## 🛡️ Professional Pattern (Env Validation)

```typescript
import { z } from 'zod';

const schema = z.object({
  PORT: z.string().transform(Number),
  SECURE_KEY: z.string().min(10)
});

export const env = schema.parse(process.env);
```

---

## ⚠️ Security Checklist
- [ ] Added `.env` to `.gitignore`.
- [ ] No hardcoded secrets in the code.
- [ ] Use defaults for non-sensitive local development.
- [ ] App crashes if mandatory secrets are missing (Fail Fast).

---

## 💡 Remember
- `process.env` is a global object provided by Node.js.
- All values in `.env` are read as **Strings**.
- Environment variables are the standard way to deploy Node apps to the cloud.
- **Part F Complete!** 🎉 You are ready for Milestone 3.
