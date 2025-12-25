# Phase 035: Converting Callbacks to Promises — Notes

Since most modern Node.js code uses Promises, but many older APIs still use Callbacks, you need a way to travel between these two worlds. This is called **Promisification**.

---

## 1. Manual Promisification

You can wrap any callback-based function in a Promise manually. This is useful for understanding how things work under the hood.

```typescript
import fs from 'fs';

function readFileAsync(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) return reject(err); // First arg (error)
            resolve(data);               // Second arg (result)
        });
    });
}
```

---

## 2. The `util.promisify()` Utility

Node.js has a built-in helper that does the wrapping for you automatically, as long as the function follows the **Error-First Callback** convention (Phase 028).

```typescript
import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);

// Now you can use it like a Promise!
readFile('test.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

---

## 3. Native Promise APIs (The Best Way)

Since Node.js v10+, most core modules have a built-in `.promises` sub-module. You should almost always use this instead of manual promisification.

```typescript
// ✅ BEST PRACTICE
import fs from 'fs/promises';

async function run() {
    const data = await fs.readFile('test.txt', 'utf8');
}
```

---

## 4. Why Promisify?

1. **Async/Await**: You cannot `await` a callback. You *can* `await` a promise.
2. **Readability**: Promisified code is flat and easier to follow.
3. **Consistency**: It’s better to have one async style in your whole project.

---

## 5. Key Takeaways
1. **Convention required**: `util.promisify` only works if the callback is the **last** argument and it's **error-first**.
2. **No need for `new Promise`**: If a library is old, try the `util.promisify` shortcut first.
3. **Check the version**: Before you promisify a core Node module, check if it already has a `/promises` version.
4. **Transition**: Now that we can turn everything into Promises, we are ready for the final, most beautiful form of async: **Async/Await**.
