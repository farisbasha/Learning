# Per-topic briefs (deeper internals beyond each note)

Every topic agent gets: `docs/SCENE-GUIDE.md`, the 8.1 reference topic, its source note
(`Part-08-The-JVM/<id>-*.md`), and the list below. Real tool output (JDK 17) wherever possible.
Scratch work goes in the session scratchpad, never in the repo.

## 8.1 From source to bytecode ✅
Operand stack/locals step by step, constant pool resolution, vtable/itable dispatch,
`invokedynamic` + LambdaMetafactory bootstrap, string concat via indy.

## 8.2 Class loading
Load → verify → prepare → resolve → init timeline (defaults in prepare, real values in `<clinit>`),
parent-delegation walk, `Foo` ≠ `Foo` ClassCastException with two loaders,
`ExceptionInInitializerError` → `NoClassDefFoundError`, exact init triggers and non-triggers,
`-Xlog:class+load/init`, verification as a security boundary, custom loader, unloading.

## 8.3 Runtime memory areas
Per-thread (PC, JVM stack, native stack) vs shared (heap, metaspace, code cache) with two threads,
frames pushing/popping live, eden/survivors/old, TLABs, metaspace contents, which area throws which
error (real `StackOverflowError` depths with `-Xss`, heap OOM, metaspace OOM), escape-analysis teaser.

## 8.4 How an object is laid out
Mark word states (hash, age, lock, forwarding), class pointer, field reordering + padding on a byte
ruler, compressed oops (shift by 3 + base → 32 GB limit), compressed class pointers, `Integer[]` vs
`int[]` and cache lines, compact object headers (JEP 450/519), Valhalla. Real JOL output.

## 8.5 Garbage collection: the theory
Roots and marking through a graph, cycles vs reference counting, generational hypothesis histogram,
mark-sweep / mark-compact / copying side by side, ages and promotion, premature promotion, card table +
write barrier, safepoints and counted loops, TLAB pointer bump, the three-way trade, leaks.

## 8.6 The collectors
Serial and Parallel (stop-the-world, threads), G1: regions, remembered sets, SATB marking, young /
mixed collections, humongous objects, pause-time goal; ZGC: coloured pointers, load barriers,
concurrent relocation with forwarding tables, generational ZGC (JDK 21, default mode in 23+);
Shenandoah briefly; CMS removed; reading a real GC log line by line; the tuning rule; choosing.
Real `-Xlog:gc*` output from each collector on JDK 17.

## 8.7 References and reachability
Strong / soft / weak / phantom under a GC cycle, `ReferenceQueue` delivery, `WeakHashMap` entry
expunging, `finalize()` resurrection and why it was a mistake, `Cleaner`, try-with-resources,
all seven leak shapes animated (static collections, listeners, ThreadLocal in pools, inner classes,
unclosed resources, mutated map keys, caches without eviction), why `System.gc()` is not a tool.

## 8.8 JIT compilation
Invocation and back-edge counters, tiers 0 → 4 (interpreter, C1 variants, C2) with real
`-XX:+PrintCompilation` output, inlining (size limits, why it unlocks everything), escape analysis
and scalar replacement, inline caches: monomorphic / bimorphic / megamorphic, OSR, deoptimisation
(uncommon traps, class loading invalidating assumptions), other opts (loop unrolling, range-check
elimination, lock elision), why `nanoTime` benchmarks lie and what JMH does, Graal JIT.

## 8.9 Observing a running JVM
`jps`/`jcmd`/`jstat`/`jinfo` with real output, reading a thread dump and spotting a deadlock by eye,
heap dumps: shallow vs retained size and the dominator tree, JFR recording and events, sampling vs
instrumenting, safepoint bias, how to read a flame graph (async-profiler), `PrintFlagsFinal`,
JMX/MBeans, native memory tracking, the triage playbook as a decision flow.

## 8.10 Startup, packaging and AOT
Startup timeline broken down (JVM init, class loading/verification, interpretation, warm-up),
CDS/AppCDS archive mapping, Project Leyden AOT cache (JDK 24 class loading/linking, 25 method
profiling: check exact JEPs), `jlink` trimmed runtime, `jpackage`, GraalVM native image (closed-world
points-to analysis, build-time initialisation, reflection config) and its real costs, decision guide.
Real `-Xshare`, `-Xlog:startuptime`/`-Xlog:class+load` timings where possible.
