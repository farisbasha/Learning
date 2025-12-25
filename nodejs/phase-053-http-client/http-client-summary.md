# Phase 053: HTTP Client — Summary Cheatsheet

## 🌐 Native fetch (Node 18+)

```typescript
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (res.ok) {
  const data = await res.json();
}
```

---

## 📦 Axios Shortcut

```typescript
import axios from 'axios';
const { data } = await axios.post<User>(url, payload);
```

---

## 🥊 Comparison

| Feature | fetch | Axios |
|---------|-------|-------|
| **Standard** | Web standard. | 3rd Party. |
| **JSON** | Manual parsing. | Automatic. |
| **Error** | Only on network fail.| Fails on non-200. |
| **Interceptors**| No. | Yes. |

---

## 💡 Remember
- Use **`response.ok`** to verify success with `fetch`.
- `fetch` exists in browsers too—so your knowledge is 100% portable.
- For most simple Node tasks, native `fetch` is all you need.
