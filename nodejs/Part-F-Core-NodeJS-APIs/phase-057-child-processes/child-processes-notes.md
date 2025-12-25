# Phase 057: Child Processes — Notes

Sometimes Node.js isn't enough. You might need to run a Python script, an ImageMagick command, or another Node process. The `child_process` module allows you to "spawn" these external commands from your code.

---

## 1. The Four Horsemen

There are four main ways to start a child process, depending on what you need.

### A. `exec()` (The Easy Way)
Runs a command in a **shell** and buffers the entire output. Best for simple, short commands.

```typescript
import { exec } from 'child_process';

exec('ls -lh', (error, stdout, stderr) => {
    if (error) return console.error(error);
    console.log(stdout);
});
```

### B. `spawn()` (The Pro Way)
Does **not** use a shell and returns **streams**. Best for long-running commands or large amounts of data.

```typescript
import { spawn } from 'child_process';

const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => console.log(`Output: ${data}`));
ls.on('close', (code) => console.log(`Finished with code ${code}`));
```

### C. `execFile()`
Specifically for running executable files directly without a shell (faster and more secure than `exec`).

### D. `fork()` (The Node Way)
A special version of `spawn` designed specifically for starting **another Node.js process**. It creates a communication channel (IPC) between the parent and the child.

```typescript
// parent.ts
import { fork } from 'child_process';
const child = fork('child.ts');
child.on('message', (msg) => console.log('Child said:', msg));
child.send({ hello: 'world' });
```

---

## 2. PHP Comparison

| Action | PHP | Node.js |
|--------|-----|---------|
| Run & Get output | `exec('ls')` | `exec('ls', (err, out) => ...)` |
| Run shell | `shell_exec('ls')` | `execSync('ls')` |
| Streaming | `passthru()` | `spawn('ls').stdout.pipe(process.stdout)` |

---

## 3. Security Warning

Never pass unsanitized user input into `exec()`.
- **❌ DANGEROUS**: `exec("rm " + userInput)` -> User could enter `file.txt; rm -rf /`.
- **✅ SAFE**: `spawn("rm", [userInput])` -> The OS treats the input as a single argument, not a command.

---

## 4. Key Takeaways
1. **Streaming vs Buffering**: Use `spawn` for big outputs to avoid "max buffer exceeded" errors.
2. **IPC**: `fork` is the easiest way to offload a heavy Node.js task to another process.
3. **Synchronous**: Node has `execSync` and `spawnSync` for scripts that only run once (like a build script). Don't use them in a web server!
4. **Summary**: Child processes are how Node.js interacts with the rest of the Operating System.
