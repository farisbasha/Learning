# Animated Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A generic, offline animated-notes framework (video + notes page per topic), with Part 08 The JVM (8.1–8.10) as its first content.

**Architecture:** JSX sources compiled by esbuild into IIFE scripts. `lib/an-engine.js` defines `window.AN` (timeline math, player, visual kit, notes page, hub). Each topic is one source file that calls `AN.registerTopic({...})`. Each topic HTML page is a thin shell: it loads React, the engine and the topic script, then calls `AN.mountTopic(id)`. Scenes are pure functions of local time `t`, so the same scene renders in the video and as a mini animation in the notes.

**Tech Stack:** React 18 UMD (vendored), esbuild, node:test, playwright-core driving the installed Google Chrome, @fontsource fonts (vendored woff2).

**Spec:** `docs/specs/2026-10-05-animated-notes-design.md`

## Global Constraints

- Must work when opened over `file://` with no network: no fetch, no CDN, no ES modules.
- Stage is 1920×1080 authored coordinates, scaled to fit.
- Visual language matches the Streams tutorial: bg `#0b0d11`, flow `#56d4c4`, pull `#f2b84b`, bad `#f07a6a`, IBM Plex Sans + JetBrains Mono.
- Every `localStorage` access is wrapped in try/catch, and the page must work without it.
- A new topic must be addable with only: `src/topics/<id>.jsx`, a manifest entry, and a generated HTML page (no engine edits).
- Content: HotSpot, with Java 25 as the baseline; version-specific features are tagged.

## Review Focus

1. Opening a page by double-click (`file://`): it must render (scripts are local, there are no module imports). Covered by the smoke test, which loads via file URL.
2. A scene throws at some `t`: the player must not white-screen. A per-scene error boundary shows the error text in the stage. Smoke test: zero page errors at all caption times.
3. `localStorage` unavailable or throwing: everything still works. Guarded by the `store` helper; unit-tested with a throwing stub.
4. Seeking or jumping across chapter boundaries while "pause at chapter end" is on: no spurious pause after a seek. Only natural playback that crosses a boundary pauses. Unit-tested via `crossedBoundary(prev, next, cues, seeking)`.
5. Narrow window: the stage scales down, there is no horizontal page scroll, and notes reflow. Smoke test at a 900px viewport.

---

### Task 1: Scaffold and build pipeline

**Files:** `package.json`, `.gitignore`, `build.mjs`, `manifest.js`, `tools/vendor.mjs`, `tools/gen-pages.mjs`, `lib/` (generated)

- [ ] `npm i -D esbuild playwright-core react@18 react-dom@18 @fontsource/ibm-plex-sans @fontsource/jetbrains-mono`
- [ ] `tools/vendor.mjs`: copies the React UMD production builds to `lib/react.js` and `lib/react-dom.js`, copies latin woff2 files (400/500/600/700, plus mono italic 400) to `lib/fonts/`, and writes `lib/fonts.css`.
- [ ] `build.mjs`: esbuild bundles `src/engine/index.jsx` → `lib/an-engine.js` and each `src/topics/*.jsx` → `lib/topics/<id>.js` (format iife, `jsxFactory: React.createElement`, `jsxFragment: React.Fragment`, target es2020). Then it runs `gen-pages`.
- [ ] `manifest.js`: `window.AN_MANIFEST = { parts: [{ id:'08', title:'The JVM', dir:'part-08', topics:[{ id:'8.1', slug:'from-source-to-bytecode', title:'From source to bytecode', status:'building' }, …] }] }`.
- [ ] `tools/gen-pages.mjs`: for every manifest topic whose `lib/topics/<id>.js` exists, writes `<dir>/<id>-<slug>.html` (a shell that loads `../lib/fonts.css`, react, react-dom, `../manifest.js`, `../lib/an-engine.js`, `../lib/topics/<id>.js`, then calls `AN.mountTopic('<id>')`).
- [ ] Verify: `node build.mjs` exits 0 and produces the files.

### Task 2: Timeline core (pure, unit-tested)

**Files:** `src/engine/timeline.js`, `test/timeline.test.mjs`

**Produces:** `deriveCues(scenes) -> {starts:number[], total:number, byName:{[name]:start}}`; `sceneAt(cues, T) -> index`; `chapterSpans(scenes, chapterCount) -> [{ch, start, end}]`; `chapterAt(spans, T)`; `crossedBoundary(prevT, nextT, spans, seeking) -> span|null`; `captionsFor(scenes, captions, cues) -> [{at, until, text}]`; `store.get(key, fallback)` / `store.set(key, value)`.

- [ ] Write tests: cue sums; sceneAt at exact boundaries and at total; chapter spans merge consecutive scenes with the same `ch`; crossedBoundary returns null when seeking and the span when playback crosses its end; caption `until` = next caption or scene end − 0.3; store survives a throwing localStorage.
- [ ] `node --test test/` → fail; implement; → pass.

### Task 3: Visual kit

**Files:** `src/engine/kit.jsx`

**Produces (on `AN`):** `MOTION{enter,move,pop}`, `lerp, lin, win, pulse, countAt, track, track1, hlAt, hexA, clamp, Easing`, `usePal()`, `useT()` (global clock seconds), `hiJava(s)`, `fmt(text)` (backtick → mono), and components `Txt, Panel, Box, Chip, Val, Code, Console, HArrow, VArrow, Arrow (SVG path, draw 0..1, label), Dot, Mark, Card, Stat, Node, Badge, Callout, Bytes (row of byte cells), StackView (vertical slots with push/pop), Table, Grid, Backdrop, Header, Brace`.

- [ ] Port the Streams primitives with the same props. Add the new ones (props documented in `docs/SCENE-GUIDE.md`).

### Task 4: Player

**Files:** `src/engine/player.jsx`

**Consumes:** timeline, kit. **Produces:** `<TopicVideo topic/>`.

- [ ] Stage: 1920×1080 scaled to its container width (16:9), clock via rAF × speed, `SceneGate` with fade in/out and a per-scene error boundary, captions overlay, scrubber with chapter ticks and hover time, controls (play, ±5 s, prev/next chapter, speed 0.75/1/1.25/1.5, CC, pause-at-chapter-end, fullscreen), and keyboard shortcuts while the page has focus (Space, ←/→, [ ], c, f).
- [ ] Chapter rail above the stage: click to jump, progress fill, ✓ for watched chapters (a chapter counts as watched when playback reaches its end).
- [ ] Pause-at-chapter-end overlay: "Chapter N done · ▶ Continue · Read notes ↓".
- [ ] URL: `#t=SEC` seeks; `?shot=SEC` renders only the stage, paused, without chrome (for screenshots). Resume position from the store.

### Task 5: Notes page and topic page

**Files:** `src/engine/notes.jsx`, `src/engine/topic.jsx`, `src/engine/index.jsx`

**Produces:** `AN.registerTopic(def)`, `AN.mountTopic(id)`. A topic def has this shape:

```js
{ id, part, title, kicker, chapters:[title…],
  scenes:[{name, dur, ch, title, C}],
  captions:{[sceneName]: [[t, text]…]},
  notes:[{ch, title, blocks:[{p}|{mini:{scene, from?, to?}}|{code, title?}|{tryit:{cmd, out}}|{callout:{tone, text}}|{list:[…]}|{table:{head, rows}}]}],
  traps:[text], recap:[text], quiz:[{q, options:[…], answer, why}] }
```

- [ ] Topic page: header (breadcrumb ← hub, title), the video, notes sections (anchors match chapters, with a "▶ watch this chapter" button that seeks the video and scrolls up), Traps, Recap, Quiz (select → reveal correct/why, score saved), and a "Mark topic learned" toggle.
- [ ] `Mini`: a 16:9 box rendering one scene with its own clock: play/pause/replay, scrub, autoplay once on first scroll into view (IntersectionObserver).

### Task 6: Hub

**Files:** `src/engine/hub.jsx`, `index.html`

- [ ] Renders AN_MANIFEST: parts → topic cards (status pill, chapters watched x/y, quiz score, learned ✓, "continue at m:ss"). Planned and building topics are dimmed and not linked. Overall progress bar.

### Task 7: Smoke and screenshot tooling

**Files:** `tools/shoot.mjs`, `test/smoke.test.mjs`

- [ ] `tools/shoot.mjs <id> [--times a,b,c]`: launches Chrome (`/Applications/Google Chrome.app/...`) via playwright-core, opens `file://…?shot=T` at 1920×1080 for each caption time (default), saves to `shots/<id>/<T>.png`, and fails on any page error or console error. Also takes a full-page screenshot of the notes page, and one at 900px width.
- [ ] `test/smoke.test.mjs`: hub plus every ready/building topic page loads with zero errors.

### Task 8: Scene guide

**Files:** `docs/SCENE-GUIDE.md`. Covers the topic contract, kit props, layout grid (margins 96px, header zone y<200, caption zone y>960), timing rules, the caption style, the notes block types, the quiz style, and the verification steps. This is the brief for background agents.

### Task 9: Topic 8.1 — From source to bytecode (reference topic)

**Files:** `src/topics/8.1.jsx`. Content source: `../Part-08-The-JVM/8.1-from-source-to-bytecode.md` plus the deeper internals in the spec.

- [ ] Script the chapters and scenes, build, shoot, inspect every frame, fix, then write the notes, traps, recap and quiz. Mark it `ready` in the manifest and tick the checklist.

### Tasks 10–18: Topics 8.2 … 8.10

Each topic follows the same steps as Task 9, with its source note and the internals list from the spec. They may be built by background agents (2 at a time) following `docs/SCENE-GUIDE.md` and using `src/topics/8.1.jsx` as the reference. The lead reviews the screenshots and content before setting `status:'ready'`.
