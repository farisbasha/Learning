# Animated notes: build checklist

**Open:** double-click `index.html` (Chrome recommended: progress is shared across pages there).
Each topic is a video plus a notes page with mini animations, try-it commands, traps, recap and a quiz.
Player keys: `Space` play/pause · `← →` 5 s · `[ ]` chapters · `c` captions · `f` fullscreen.
The **⏸ ch** button pauses at the end of every chapter (on by default).

Legend: ✅ done · 🔨 in progress · ⬜ not started.
Per topic: **script** (chapters + captions) → **scenes** (animated) → **notes** → **quiz** → **verified** (every caption frame screenshotted and reviewed, notes page checked, smoke test green).

## Framework

- ✅ Engine: timeline, player, captions, chapter rail, pause-at-chapter, deep links, resume
- ✅ Visual kit (ported from the Streams tutorial + JVM primitives)
- ✅ Notes page: mini players, code, try-it, callouts, tables, quiz with saved score
- ✅ Hub with per-topic progress
- ✅ Offline: React and fonts copied into `lib/`, works over `file://`
- ✅ Tests: timeline unit tests + headless smoke test (`npm test`)
- ✅ Screenshot reviewer (`node tools/shoot.mjs <id>`)
- ✅ Scene guide for new topics (`docs/SCENE-GUIDE.md`) and per-topic briefs (`docs/BRIEFS.md`)
- ✅ Independent engine review done; fixes covered by browser tests (`test/engine.test.mjs`)

## Part 08: The JVM

| Topic | Script | Scenes | Notes | Quiz | Verified | Length |
|---|---|---|---|---|---|---|
| 8.1 From source to bytecode | ✅ | ✅ | ✅ | ✅ | ✅ | 16:26 |
| 8.2 Class loading | ✅ | ✅ | ✅ | ✅ | ✅ | 18:00 |
| 8.3 Runtime memory areas | ✅ | ✅ | ✅ | ✅ | ✅ | 19:00 |
| 8.4 How an object is laid out | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.5 Garbage collection: the theory | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.6 The collectors | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.7 References and reachability | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.8 JIT compilation | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.9 Observing a running JVM | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |
| 8.10 Startup, packaging and AOT | 🔨 | 🔨 | ⬜ | ⬜ | ⬜ | |

## Polish queue

- ⬜ Readability pass on 8.1–8.3 (built before the 17px minimum): raise text ≤14px and terminal output to the minimum, re-shoot and review.

## Adding a topic later (any part)

1. Add it to `manifest.js` (`status: 'building'`; add a new part block if needed).
2. Write `src/topics/<id>.jsx` (+ `src/topics/<id>/` scenes) following `docs/SCENE-GUIDE.md`.
3. `node build.mjs <id>` → `node tools/shoot.mjs <id>` → review → `npm test`.
4. Set `status: 'ready'` and tick this table.

## Corrections found while building

- 8.1: the notes say a string `switch` compiles to `lookupswitch` + `tableswitch`. javac chooses per switch; for the 2-case example JDK 17 emits two `lookupswitch`es.
- 8.1: the `Signature` attribute is read by javac **and by reflection** (`getGenericReturnType`), not only the compiler. Execution ignores it.
- 8.1: plain `javap` shows package-private members too (its default is `-package`), not only public ones.
- 8.2: `-Xverify:none` is deprecated on JDK 17, not removed: it warns and still disables verification.
- 8.2: `java.xml` and `java.logging` are bootstrap-loader modules, not platform-loader ones (their `getClassLoader()` is `null`).
- 8.2: JDK 9+ built-in loaders delegate straight to the loader of the module that owns the package, rather than strictly "parent first".
- 8.2: only exceptions thrown in `<clinit>` are wrapped in `ExceptionInInitializerError`; an `Error` is rethrown as is.
- 8.3: default thread stack is 1 MB on Linux x64 but **2 MB** on macOS arm64 (JDK 17), not "~512 KB–1 MB".
- 8.3: `java.lang.Class` objects live on the **heap**; metaspace holds the VM's internal Klass structures. Statics and interned strings are on the heap since Java 7.
- 8.3: JDK 17's direct-buffer OOM message is `Cannot reserve N bytes of direct buffer memory (allocated: …, limit: …)`.
- 8.3: `GC overhead limit exceeded` comes only from the Parallel collector; the same leak under G1 ends in `Java heap space`.
- 8.3: `Requested array size exceeds VM limit` appears for lengths just below `Integer.MAX_VALUE`, regardless of `-Xmx` (a Java array can never exceed 2³¹−1 elements).
- 8.3: `unable to create native thread` is about thread creation (`pthread_create` EAGAIN), not a separate native-stack region.
