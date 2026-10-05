# Animated Notes — design

**Date:** 2026-10-05 · **First part:** Part 08 — The JVM · **Status:** approved

## Goal

Understand JVM internals deeply through animated, example-driven notes. Each topic
gets an animated video plus a scrollable notes page. Content covers the existing markdown
notes **plus deeper internals** the notes only mention. The framework is generic so later
parts/topics (e.g. Part 09 Concurrency) slot in without engine changes.

## Decisions (from the user)

| Question | Answer |
|---|---|
| Format | Video on top + notes page below (mini replayable animations, code, Try-it, traps, quiz) |
| Depth | Notes + deeper internals |
| Delivery | Local folder, offline, double-click to open (`file://`) |
| Length | As long as needed |
| Build | Learn-while-building: 8.1 first, then the rest; background agents allowed after 8.1 |
| Future | More topics may be added later — keep it generic |

## Layout

```
java/animated-notes/
  index.html               hub, rendered from manifest
  BUILD-CHECKLIST.md       build tracker (per topic: script → scenes → notes → quiz → verified)
  manifest.js              window.AN_MANIFEST = parts → topics {id, title, file, status}
  lib/                     react, react-dom (UMD, vendored), fonts, compiled engine + topics
  src/engine/              player.jsx (timeline/player/captions/rail), kit.jsx (visual primitives),
                           notes.jsx (notes page, mini stage, code, try-it, quiz), hub.jsx
  src/topics/<id>.jsx      one file per topic: SCENES, CAP, CHAPTERS, NOTES, QUIZ
  build.mjs                esbuild: JSX → lib/*.js (IIFE, globals)
  <part>/<id>-<slug>.html  thin page: loads lib/ scripts, mounts TopicPage
  docs/                    specs, plans, scene-writing guide
```

## Engine

- **Timeline:** scenes `{name, dur}`; cue table derived by summing; every scene is a pure
  function `({t}) => JSX` of seconds since its start. 1920×1080 stage scaled to fit.
- **Player:** play/pause (Space), ←/→ ±5 s, `[`/`]` chapter prev/next, speed 0.75–1.5×,
  captions toggle, *pause at end of chapter* toggle, fullscreen, scrubber with chapter
  ticks, `#t=` deep link, `?shot=` frozen frame for screenshots, resume position.
- **Chapter rail:** above the video, click to jump, progress fill, ✓ when chapter watched.
- **Kit:** ported from the Streams tutorial visual language (dark, teal `flow` / amber `pull`,
  red `bad`, IBM Plex Sans + JetBrains Mono), plus JVM-oriented primitives: Box/Panel, Code
  with line highlight + typing, Console, Arrow (curved, labelled, animated draw), Memory
  strip/table, Stack (push/pop), Chip, Badge, Callout, Grid.
- **Notes page:** sections per chapter; `Mini` embeds any scene with its own clock
  (play/replay/scrub); Prose (inline-code formatting), Code (highlight + copy), TryIt
  (command + expected output), Trap, Recap, Quiz (MCQ with explanations; score saved).
- **Persistence:** `localStorage` (try/catch everywhere; page works without it): position,
  watched chapters, quiz scores, “learned” ticks.

## Hub

Parts → topic cards: number, title, status (Ready / Building / Planned), progress (chapters
watched, quiz score, learned tick). Planned topics are visible but not clickable.

## Content standard (every topic)

- One simple running example, reused across chapters.
- Every claim visual: memory/stack/bytes/arrows move; nothing is just text on screen.
- Captions are short, one idea each; ~2.5–6 s per caption.
- Ends with Recap scene; notes end with Traps, Recap, Quiz (6–10 questions).
- Facts cross-checked against the topic's markdown notes; extra internals stated precisely
  (HotSpot, Java 25 baseline; version-specific features tagged).

## Verification per topic

1. `node build.mjs` succeeds.
2. Headless Chromium (Playwright cache) loads the page with zero console errors.
3. Screenshot at each caption timestamp (`?shot=`) and inspect: no overlap, clipping, or
   off-stage elements; captions readable.
4. Notes page full-page screenshot; quiz interactive.
5. Mark topic Ready in manifest + tick BUILD-CHECKLIST.

## Out of scope

Voice narration, video export, mobile-first layout (desktop learning; must not break on narrow
widths), editing notes markdown.
