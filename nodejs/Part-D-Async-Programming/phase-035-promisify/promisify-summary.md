# Phase 035: Promisify — Summary Cheatsheet

## 🛠️ The Standard Tool

```typescript
import { promisify } from 'util';
import { someCallbackFn } from 'older-library';

const someAsyncFn = promisify(someCallbackFn);

// Use it!
const result = await someAsyncFn(params);
```

---

## 🏗️ Manual Pattern

```typescript
const myPromisifiedFn = (arg) => {
  return new Promise((resolve, reject) => {
    legacyFn(arg, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};
```

---

## 📦 Core Node Modules

Always check for the `/promises` import first:
- `import fs from 'fs/promises';`
- `import dns from 'dns/promises';`
- `import readline from 'readline/promises';`

---

## 💡 Remember
- You can't promisify a function if it calls the callback multiple times (like an event or a stream).
- If the callback arguments don't follow the `(err, data)` pattern, `util.promisify` won't work correctly.
- Promisification is a **one-way bridge** from the past to the future.
