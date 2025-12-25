# Phase 059: Cluster Module — Notes

Your server probably has 4, 8, or 16 CPU cores. By default, Node.js only uses **one**. The `cluster` module allows you to launch multiple copies of your web server—one for each core—and have them share the same port.

---

## 1. How it works

The Cluster system has a **Primary** (Master) process and multiple **Worker** processes.
1. The Primary process listens on port 3000.
2. When a request comes in, the Primary "hands it over" to one of the Workers.
3. This is like having 4 waiters instead of 1 in the restaurant.

---

## 2. Basic Implementation

```typescript
import cluster from 'cluster';
import http from 'http';
import os from 'os';

if (cluster.isPrimary) {
    // 1. We are the Master! Start one worker per CPU
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // 2. We are a Worker! Start a server.
    http.createServer((req, res) => {
        res.end(`Handled by worker ${process.pid}`);
    }).listen(3000);
}
```

---

## 3. Resilience (Self-Healing)

Workers can crash. In the Primary process, you can listen for the `exit` event and start a new worker immediately to replace the one that died.

```typescript
cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
});
```

---

## 4. Zero-Downtime Reloads

Because you have multiple workers, you can kill and restart them one by one when you deploy a new version of your code. Your users will never see a "502 Bad Gateway" error.

---

## 5. Cluster vs. PM2

In the professional world, developers rarely use the `cluster` module manually. Instead, they use a process manager called **PM2**. It handles the clustering, restarting, and logging automatically.

```bash
# PM2 does everything Phase 059 taught you with one command:
pm2 start app.js -i max
```

---

## 6. Key Takeaways
1. **Shared Port**: Multiple workers can listen on the same port because the OS handles the distribution.
2. **Statelessness**: Because requests are distributed randomly, your app **must** be stateless. Don't store sessions in local variables; use Redis or a Database.
3. **Primary doesn't work**: The Primary process should only coordinate. It shouldn't do logic itself.
4. **Summary**: Clustering is how you scale a Node.js app to handle millions of requests on a single multi-core server.
