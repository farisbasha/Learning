# Course Index — The Java Route

**14 parts · 97 steps.** The order is load-bearing. A few steps look like they belong
earlier than they are, and they don't:

- **Generics come after objects** — generics are about types, and you need types to be
  real to you first.
- **The JVM comes after the language** — you cannot appreciate what the JIT does to your
  loop until you have written the loop.
- **Concurrency comes near the end** — it is the only topic that can quietly ruin a
  program you believed was correct.

Tick steps off as you finish them.

---

## Part 00 · Orientation and history — *read once, then start*
📁 `Part-00-Orientation/` — **notes written**

- [ ] **0.1** What the words mean — JVM, JRE, JDK, Java SE, OpenJDK, distributions
- [ ] **0.2** The history, as a story of what got fixed
- [ ] **0.3** What is alive and what is a corpse
- [ ] **0.4** Running code without a project — `javac`, `java`, JShell, compact source files

## Part 01 · The language, procedurally — *the floor*
📁 `Part-01-Language-Procedurally/` — **notes written**

- [ ] **1.1** Types, values, variables — primitives, references, `var`, wrappers, `null`
- [ ] **1.2** Operators and control flow — integer division, switch expressions
- [ ] **1.3** Strings and text — immutability, the pool, text blocks, formatting
- [ ] **1.4** Arrays — the odd one out in the type system, array covariance
- [ ] **1.5** Methods and the call stack — **pass-by-value**, overloading, stack traces
- [ ] **1.6** Packages, the classpath, and visibility — the layer IDEs hide
- [ ] **1.7** What the compiler is actually doing — compile time vs runtime

## Part 02 · Objects, properly — *the core*
📁 `Part-02-Objects-Properly/` — **notes written**

- [ ] **2.1** Classes, fields and constructors — initialisation order
- [ ] **2.2** `static`, and what it really means
- [ ] **2.3** Inheritance and polymorphism — dynamic dispatch, why composition wins
- [ ] **2.4** Interfaces, in their modern form — default, static, private methods
- [ ] **2.5** The Object contract — `toString`, `equals`, `hashCode`
- [ ] **2.6** Records — the feature that deleted the 60-line data class
- [ ] **2.7** Enums — full classes, not integer aliases
- [ ] **2.8** Sealed types — Java's discriminated union
- [ ] **2.9** Nested, inner and anonymous classes
- [ ] **2.10** Designing with objects — immutability, composition, builders, SOLID honestly

---

## Part 03 · Generics — *the type system* ⬜
> Coming from TypeScript this feels familiar until **erasure**, at which point it will not.

- [ ] **3.1** The problem generics solve — pre-Java-5 code, `ClassCastException`
- [ ] **3.2** Writing generic types and methods — bounds, inference
- [ ] **3.3** **Type erasure** — the single most important idea here
- [ ] **3.4** Wildcards and variance — `? extends`, `? super`, PECS
- [ ] **3.5** The edges — generic arrays, `Class<T>` tokens, super type tokens

## Part 04 · Exceptions and failure — *failure* ⬜

- [ ] **4.1** The hierarchy — `Throwable`, `Error`, `Exception`, `RuntimeException`
- [ ] **4.2** Checked versus unchecked — the argument, and where it landed
- [ ] **4.3** The mechanics — try/catch/finally, try-with-resources, suppressed exceptions
- [ ] **4.4** Designing with failure — what to throw, what to wrap, what to let fly

## Part 05 · Collections and data structures — *the daily library* ⬜

- [ ] **5.1** The map of the framework
- [ ] **5.2** Lists — `ArrayList` vs `LinkedList` and why one almost always wins
- [ ] **5.3** Maps, and how hashing actually works
- [ ] **5.4** Sets, queues and deques
- [ ] **5.5** Ordering — `Comparable`, `Comparator`
- [ ] **5.6** Iteration and modification — `ConcurrentModificationException`
- [ ] **5.7** Immutable, unmodifiable and sequenced collections
- [ ] **5.8** Choosing by cost — Big-O in practice

## Part 06 · Functional Java — *the 2014 revolution* ⬜

- [ ] **6.1** Lambdas — what they compile to (not anonymous classes)
- [ ] **6.2** Method references — the four forms
- [ ] **6.3** The functional interface catalogue — `Function`, `Predicate`, `Supplier`…
- [ ] **6.4** Streams: the model — lazy, single-use, source/intermediate/terminal
- [ ] **6.5** The operation surface — `map`, `filter`, `flatMap`, `reduce`
- [ ] **6.6** Collectors — including `groupingBy`
- [ ] **6.7** `Optional` — what it is for, and the ways people misuse it
- [ ] **6.8** Parallel streams, and **gatherers** `Java 24`

## Part 07 · Pattern matching and modern style — *the language as it is now* ⬜

- [ ] **7.1** Type patterns — `instanceof` with a binding
- [ ] **7.2** Pattern matching for `switch` `Java 21`
- [ ] **7.3** Record patterns — destructuring
- [ ] **7.4** The combined idiom — sealed + records + switch = the modern style
- [ ] **7.5** In flight, and dead — string templates were removed; they do not exist

## Part 08 · The JVM: memory and execution — *the machine* ⬜

- [ ] **8.1** From source to bytecode
- [ ] **8.2** Class loading
- [ ] **8.3** Runtime memory areas — heap, stack, metaspace
- [ ] **8.4** How an object is laid out — headers, padding, compact headers `Java 25`
- [ ] **8.5** Garbage collection: the theory
- [ ] **8.6** The collectors — G1, ZGC, Parallel, Serial
- [ ] **8.7** References and reachability — weak, soft, phantom
- [ ] **8.8** JIT compilation — C1, C2, tiered, deoptimisation
- [ ] **8.9** Observing a running JVM — JFR, `jcmd`, heap dumps
- [ ] **8.10** Startup, packaging and AOT

## Part 09 · Concurrency — *the hard part* ⬜
> The only topic that can quietly ruin a program you believed was correct.

- [ ] **9.1** Threads
- [ ] **9.2** What actually goes wrong — races, visibility, deadlock
- [ ] **9.3** The Java Memory Model — happens-before
- [ ] **9.4** `synchronized`
- [ ] **9.5** Explicit locks
- [ ] **9.6** Atomics and compare-and-swap
- [ ] **9.7** Concurrent collections
- [ ] **9.8** Executors and thread pools
- [ ] **9.9** `CompletableFuture`
- [ ] **9.10** Coordination primitives — latches, barriers, semaphores
- [ ] **9.11** **Virtual threads** `Java 21`
- [ ] **9.12** Structured concurrency, scoped values, and proving it works

## Part 10 · I/O, files, networking — *the outside world* ⬜

- [ ] **10.1** Streams and readers — the byte/char split
- [ ] **10.2** Character encoding — UTF-8 is the default since 18
- [ ] **10.3** Files and paths — NIO.2 `Path` / `Files`
- [ ] **10.4** Buffers and channels
- [ ] **10.5** Serialization — and why you should not use it
- [ ] **10.6** Networking — sockets, the modern `HttpClient`

## Part 11 · The platform library — *the rest of the standard library* ⬜

- [ ] **11.1** Dates and times — `java.time`
- [ ] **11.2** Numbers and maths — `BigDecimal` for money
- [ ] **11.3** Regular expressions
- [ ] **11.4** Text, locale and formatting
- [ ] **11.5** Randomness and cryptography basics
- [ ] **11.6** Reflection
- [ ] **11.7** Annotations
- [ ] **11.8** Method handles and `invokedynamic`
- [ ] **11.9** Foreign functions and memory — the JNI replacement
- [ ] **11.10** The module system

## Part 12 · Tools you cannot avoid — *deliberately thin* ⬜

- [ ] **12.1** The JDK's own tools — `javap`, `jcmd`, `jshell`, `jlink`
- [ ] **12.2** Build tools, at the minimum — Maven, Gradle
- [ ] **12.3** Testing — JUnit 5
- [ ] **12.4** Debugging
- [ ] **12.5** Code quality and conventions

## Part 13 · Reading real Java — *consolidation* ⬜

- [ ] **13.1** Read the JDK's own source
- [ ] **13.2** The accumulated wisdom — *Effective Java*, and what it gets right
- [ ] **13.3** Where to go after this — *now* frameworks make sense
