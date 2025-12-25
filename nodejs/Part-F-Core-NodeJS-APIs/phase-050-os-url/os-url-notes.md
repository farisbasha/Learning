# Phase 050: OS & URL Modules — Notes

These two modules are your utility kit for identifying the environment you're running in and for parsing the complex strings that drive web communication.

---

## 1. The `os` Module (Hardware & System)

Useful for analytics, dynamic scaling, or writing installers.

### A. Checking Hardware
```typescript
import os from 'os';

console.log("OS:", os.platform()); // 'darwin' (mac), 'linux', 'win32'
console.log("Hostname:", os.hostname());
console.log("CPU Cores:", os.cpus().length);
```

### B. Memory & Directories
```typescript
const freeGB = os.freemem() / 1024 / 1024 / 1024;
console.log(`Free RAM: ${freeGB.toFixed(2)} GB`);

console.log("Home Folder:", os.homedir());
console.log("Temp Folder:", os.tmpdir());
```

---

## 2. The `URL` Class (Modern Web)

Never use Regex to parse a URL. Use the built-in `URL` class. It is available globally (you don't even need to import it in modern Node).

```typescript
const myUrl = new URL('https://example.com:8080/search?q=node&user=basha#results');

console.log(myUrl.hostname); // 'example.com'
console.log(myUrl.port);     // '8080'
console.log(myUrl.pathname); // '/search'
```

### Query Parameters (`URLSearchParams`)
The `searchParams` property is an object that makes it easy to read and edit query strings.

```typescript
console.log(myUrl.searchParams.get('q')); // 'node'

myUrl.searchParams.append('page', '1');
console.log(myUrl.toString()); 
// https://example.com:8080/search?q=node&user=basha&page=1#results
```

---

## 3. PHP Comparison

- **PHP**: `$_GET['q']` is automatic. In Node, you must parse the URL to get the search params yourself (until you use a framework like Express).
- **PHP**: `get_current_user()` and `sys_get_temp_dir()`.
- **Node**: `os.userInfo()` and `os.tmpdir()`.

---

## 4. Key Takeaways
1. **Safety**: The `URL` class handles special characters (like spaces or emojis) and encoding for you.
2. **Clustering**: You often use `os.cpus().length` to decide how many child processes to spawn (Phase 059).
3. **Cross-platform**: Use `os.tmpdir()` instead of hardcoding `/tmp` to ensure your app works on Windows.
4. **Summary**: These utilities are "low-frequency" but "high-importance" for building robust system tools.
