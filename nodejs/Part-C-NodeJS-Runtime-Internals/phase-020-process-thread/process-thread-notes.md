# Phase 020: Process vs. Thread — Notes

To understand why Node.js is fast (and why it can be dangerous), you must understand the difference between a **Process** and a **Thread**.

---

## 1. The Analogy: The Restaurant

- **Computer (Hardware)**: The Restaurant building.
- **CPU Cores**: The number of Tables that can be served simultaneously.
- **PROCESS**: A distinct Kitchen. It has its own fridge (memory), its own tools, and its own staff. Kitchen A cannot touch the food in Kitchen B's fridge.
- **THREAD**: A Chef inside the kitchen. All chefs in the same Kitchen share the same fridge and the same counter space.

---

## 2. What is a Process?

A **Process** is a container for your application. It is an independent instance of a program in execution.
- **Memory**: It has its own dedicated memory space.
- **Isolation**: If Process A crashes, Process B keeps running.
- **Communication**: Processes cannot talk to each other directly (they need "Inter-Process Communication" or IPC).
- **Cost**: Starting a process is "heavy" and slow.

---

## 3. What is a Thread?

A **Thread** is the actual sequence of programmed instructions that can be managed by an OS scheduler.
- **Shared Memory**: All threads in a process share the same memory. This makes data sharing easy but dangerous (one thread can "corrupt" data another thread is using).
- **Cost**: Threads are "lightweight" and fast to create.
- **Concurrency**: Multiple threads can run on different CPU cores at the same time.

---

## 4. PHP-FPM: The Multi-Process Model

In PHP-FPM, when a request comes in:
1. A **new process** (or a free pre-spawned process) is grabbed.
2. That process handles the request from start to finish.
3. If the Code waits for a Database (I/O), that **entire process sits idle**, doing nothing.
4. To handle 100 simultaneous users, you need 100 processes.

---

## 5. Node.js: The Single-Threaded Model

Node.js runs **one process** and **one main thread**.
1. Your JavaScript code runs on this main thread.
2. When code hits a Database call (I/O), Node.js sends the request to the OS/Worker Pool and **continues** to handle the next user.
3. This is why one Node process can handle thousands of connections while a PHP-FPM setup might struggle.

> [!CAUTION]
> **The Downside**: Since there is only ONE thread, if you do a very heavy math calculation (e.g., `for (let i=0; i < 1billion; i++)`), you stop the entire kitchen! No other users can be served until that chef is finished.

---

## 6. Context Switching

When an OS has more threads than CPU cores, it has to swap them in and out. This is called **Context Switching**.
- Context switching has a "cost" in time.
- Node.js minimizes context switching by staying on one thread and using event-based callbacks.

---

## 7. Key Takeaways
1. **Node is Multi-Threaded Under the Hood**: While your JS code is single-threaded, Node uses a "Worker Pool" (via libuv) for heavy tasks like file reading or crypto.
2. **Memory**: All your Node.js code shares the same memory space. One bad update to a global variable affects every user.
3. **Scalability**: Scaling Node.js means running **multiple processes** (one per CPU core) using tools like `PM2` (Phase 127).
4. **Isolations**: PHP isolation is safer (one user's crash doesn't kill others); Node is faster but riskier.
