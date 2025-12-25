# Phase 053: HTTP Client — Notes

While `http.createServer` lets you **receive** calls, an HTTP Client lets you **make** calls to other APIs. In modern Node.js, we have three main ways to do this.

---

## 1. Native `fetch` (Recommended)

Since Node.js v18, the standard Browser `fetch` API is built-in. This is the cleanest and most standard way to make calls.

```typescript
interface User { id: number; name: string; }

async function getUser() {
    const response = await fetch('https://api.example.com/users/1');
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    const user: User = await response.json();
    return user;
}
```

---

## 2. Axios (Popular Library)

Axios is a very popular 3rd-party library. Many teams prefer it because it has better defaults and handles JSON parsing automatically.

```bash
npm install axios
```

```typescript
import axios from 'axios';

const { data } = await axios.get<User>('https://api.example.com/users/1');
console.log(data.name);
```

---

## 3. Legacy `http.request` (Avoid)

The original Node.js way. It is very verbose and uses streams instead of Promises. You will only see this in old maintenance code. **Avoid using it for new projects.**

---

## 4. Generic Fetch Wrapper in TypeScript

To keep your code clean, you often wrap fetch in a typed function.

```typescript
async function apiGet<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API failed");
    return res.json() as T;
}

const user = await apiGet<User>('/url');
```

---

## 5. Comparison to PHP

- **PHP**: Usually uses `curl` or a library like `Guzzle`.
- **Node.js**: `fetch` is the native standard; `Axios` is the community standard.

---

## 6. Key Takeaways
1. **Parallel Calls**: Use `Promise.all()` (Phase 034) with fetch to call multiple APIs at the same time.
2. **Error Handling**: `fetch` only throws an error on network failure. It does **not** throw on a 401 or 500 error—you must check `response.ok`.
3. **Environment**: `fetch` is available globally in Node 18+; you don't even need to import it.
4. **Conclusion**: Between `fs` for local files and `fetch` for remote APIs, you can now handle all your application's data needs.
