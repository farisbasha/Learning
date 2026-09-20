# Part 09 — Concurrency

> **Read this before starting.**

This is the only topic in the roadmap that can make a program **that passes every test and
runs fine for months** be fundamentally broken.

Java's concurrency support is the best of any mainstream language and also the most
demanding to use correctly. **Take this part slowly and in order.**

---

## ⚠️ Coming from JavaScript, this will feel alien in a specific way

In Node you have **one thread**, and concurrency is **cooperative**. Two pieces of your
code never run at literally the same instant — `await` yields at a point you can see, and
between two statements nothing else touches your data.

**In Java they do run at the same instant.** On a multi-core machine, two threads execute
your code simultaneously, on different cores, with different CPU caches.

> **Every assumption that a multi-step operation is uninterruptible is wrong.**

```javascript
// Node — safe. Nothing runs between these two lines.
count = count + 1;
```
```java
// Java — a race. Three operations, and another thread can interleave at any point.
count = count + 1;
```

---

## ⚠️ You cannot learn this part by experiment

This is the part that matters most, and it's why 9.2 and 9.3 come before any of the tools.

**A broken concurrent program usually works.** It works when you run it. It works in your
tests. It works under light load. It works on your laptop, which has a stronger memory
model than the server. Then it fails once a month in production, in a way you cannot
reproduce.

| What you'd normally do | Why it fails here |
|---|---|
| "Run it and see" | A race that happens 1 in 10⁶ times won't show up |
| "The test passes" | Unit tests give **false confidence** (9.12) |
| "It works on my machine" | x86 reorders far less than ARM. Your Mac is not the server |
| "I added `synchronized` and it stopped" | You may have only changed the timing |

> **The theory in 9.2 and 9.3 is not optional background. It is the only way to know
> whether code is correct** — because testing cannot tell you.

---

## The order

| Step | |
|---|---|
| **9.1** | Threads — the primitive |
| **9.2** | ⭐ What actually goes wrong — atomicity, visibility, reordering |
| **9.3** | ⭐ The Java Memory Model — happens-before |
| 9.4 | `synchronized` |
| 9.5 | Explicit locks |
| 9.6 | Atomics and CAS |
| 9.7 | Concurrent collections |
| 9.8 | Executors and thread pools |
| 9.9 | `CompletableFuture` |
| 9.10 | Coordination primitives |
| **9.11** | ⭐ Virtual threads — the biggest change since 2004 |
| 9.12 | Structured concurrency, scoped values, and proving it works |

---

## ⭐ The one thing to take away before you start

If you read nothing else in this part, read this — it's also how 9.12 ends:

> **Confine state to one thread, or make it immutable.**
>
> **Most correct concurrent Java has very few locks in it.**

Every technique in 9.4–9.10 is for the cases where you genuinely cannot do that. Reach for
them second, not first.
