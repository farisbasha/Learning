# Phase 050: OS & URL — Summary Cheatsheet

## 🖥️ OS Module Quick Reference

- **`os.platform()`**: `darwin`, `linux`, `win32`.
- **`os.cpus()`**: Array of CPU core details.
- **`os.totalmem()`**: Total capacity in bytes.
- **`os.homedir()`**: Current user's home directory.
- **`os.networkInterfaces()`**: IP addresses and Network info.

---

## 🌐 URL Patterns

```typescript
const link = new URL('https://site.com/p/123?v=1');

link.origin;   // "https://site.com"
link.pathname; // "/p/123"
link.search;   // "?v=1"

// Query Params
link.searchParams.get('v');    // "1"
link.searchParams.set('v', '2');
```

---

## 💡 Remember
- The `URL` class is **Global**. No import needed in modern Node.
- `os.cpus()` is heavy; don't call it inside a fast loop.
- Use `URL` to safely combine paths for API calls instead of template strings.
- **Next Up**: Now that we understand the system, we can start building our first **HTTP Server** (Phase 051).
