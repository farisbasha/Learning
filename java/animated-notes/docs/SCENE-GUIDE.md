# Writing a topic: the scene guide

Read this, then read the reference topic **`src/topics/8.1.jsx` + `src/topics/8.1/*.jsx`** before
writing anything. Copy its structure exactly.

## What a topic is

One animated video (≈ 10–18 min, no cap) + a notes page under it. The learner watches the
video, then revises from the notes, then takes the quiz. **Goal: real understanding of
internals**, driven by one simple running example per topic that every chapter reuses.

## Files you own (and only these)

```
src/topics/<id>.jsx          topic definition: chapters, scenes, captions, notes, traps, recap, quiz
src/topics/<id>/scenes1.jsx  scene components (split into 2–4 files, ~400 lines each)
src/topics/<id>/scenes2.jsx
```

Never edit `src/engine/*`, `manifest.js`, `build.mjs`, `tools/*`, or another topic. If you need a new
visual primitive, define it at the top of your own scenes file (see `Tok`/`Slot` in 8.1 scenes2).

## The contract

```js
window.AN.registerTopic({
  id: '8.2', part: '08', title: 'Class loading', kicker: 'Part 08 · The JVM',
  lede: 'one or two sentences shown under the title',
  chapters: ['Intro', 'Three phases', …, 'Traps', 'Recap'],        // index = ch
  scenes: [{ name: 'Intro', dur: 22, ch: 0, title: '', C: SIntro }, …], // title '' = no header
  captions: { Intro: [[0.8, 'text'], [5.5, 'text']], … },          // times are scene-local seconds
  notes: [{ ch: 1, blocks: [...] }, …],                             // one entry per content chapter
  traps: ['…'], recap: ['…'], quiz: [{ q, options: [4], answer: index, why }],
});
```

A scene is a pure function of local time: `function SName({ t, d }) { return <>…</>; }`.
**Never** use state, effects, timers or `Date`. Everything is computed from `t`, so scrubbing,
pausing and the notes' mini players all work for free.

## Kit (all on `window.AN`; destructure at the top of each scenes file like 8.1)

Motion: `MOTION.enter/move/pop(t, start, dur)` → 0..1 · `win(t, a, b, fade)` visible between a and b ·
`pulse(t, [times], d)` flash · `track(t, [[time,x,y],…])` → [x,y] · `track1(t, [[time,v],…])` ·
`step(t, [[time,v]…], initial)` · `hlAt(t, [[time,line]…])` → [line, alpha] for `Code` highlight ·
`lerp`, `lin`, `clamp`, `hexA(color, alpha)`, `toneColor(tone)`.

Tones: `flow` (teal, the main thing), `pull` (amber, focus/action), `bad` (red), `violet`
(metadata/indirection), `pink`, `green`, `blue`, `ink` (neutral), `dim`.

Primitives (positions are 1920×1080 stage px; every one takes `a` = appearance 0..1):

| | key props |
|---|---|
| `Txt` | `x y fs color mono w weight anchor('center'/'mid'/'right'/'left-center')`; string children get `` `code` `` and `**bold**` formatting |
| `Panel` | `x y w h title right tone glow dashed` (title bar is 44px tall) |
| `Box` | `x y w h label sub tone fill dashed glow fs sfs align('left') strike s` |
| `Code` | `x y w h title lines lang('java'/'bytecode'/'shell'/'plain') fs lh hl hlA t`; a line can be `{s, at (types it in), tone, toneA, lang}`. Height needed = 44 + 24 + lines × lh |
| `Console` | `x y w h t items:[{at, text, kind:'cmd'/'err'/'ok'/'dim'}]` |
| `Table` | `x y cols:[widths] head rows rowA marks:{row:[tone, alpha]} colColors fs rh` (head row = rh−6) |
| `Bytes` | `x y unit(px per byte) h cells:[{n, label, sub, tone, pad, glow, a}] ruler` |
| `StackView` | ready-made stack panel; for animated push/pop prefer your own tokens (8.1 `Tok`) |
| `Arrow` | `pts:[[x,y]…]` or `from to curve` · `draw` 0..1 · `color/tone dashed label lx ly` |
| `HArrow` `VArrow` | straight arrows with optional `label` (keep labels shorter than the arrow, or `lfs` 15–16) |
| `Card` `Callout` `Badge` `Brace` `Node` `Val` `Chip` `Dot` `Mark` `Stat` | see 8.1 usage |

## Layout grid

- Margins: x 96 → 1824. Header (kicker + title) occupies y < 180: start content at **y ≥ 190**.
- Captions live at the bottom: keep content **above y ≈ 940**.
- Leave ≥ 16px between neighbouring elements. Check every label fits its container: mono
  text is ≈ 0.6 × font-size px per character.
- Arrows must not cut through text or other boxes: route them through gaps (polyline `pts`).
- Minimum readable size on the 1920 stage: **17px** for any text, including terminal output. If real output is long, show the relevant lines (mark it "abridged") rather than shrinking the font.
- Prefer 2–3 big regions per scene (code | machine state | explanation) over many small ones.

## Timing and captions

- One caption = one idea, ≤ ~110 characters, plain words. Use `` `code` `` for identifiers.
- Give each caption 4–8 s. The visual change it describes should start at (or just after) its time.
- Build scenes up progressively. Things that leave should fade out (`win`), not pop.
- A scene's first ~0.6 s and last ~0.6 s are faded by the engine; don't put key moments there.
- Typical scene: 30–75 s. Split longer ideas into several scenes in the same chapter.
- Write captions in a friendly teacher voice. Avoid em dashes; use colons, commas or full stops.

## Content standard

- **One simple running example** per topic (8.1 used `Calc.add(2, 3)`), reused in most scenes.
- Animate the mechanism, not just the conclusion: values move, slots fill, pointers redirect,
  counters tick, errors shake. Every claim should be *visible*.
- Cover everything in the source note (`Part-08-The-JVM/<id>-*.md`) **plus the deeper internals**
  listed for your topic in the brief. HotSpot, Java 25 baseline; tag version-specific features.
- **Use real output wherever possible.** JDK 17 is installed (`javac`, `java`, `javap`, `jcmd`,
  `jstat`, `jfr` are on PATH). Compile your examples in the scratchpad and use actual
  `javap`/`jcmd`/GC-log output; say "JDK 17 output" where it differs from 25. Never invent
  numbers that look like tool output.
- Correct the source note if it is wrong (8.1 found the string switch's second switch is a
  `lookupswitch`), and mention it in your report.

## Notes blocks

`{p}` paragraph · `{h}` subheading · `{mini: {scene, from?, to?, caption?}}` replayable scene ·
`{code, title?, lang?}` · `{tryit: {note?, cmd, out?, outLang?}}` (cmd lines start with `$ `) ·
`{callout: {tone, title?, text}}` (tone `violet` + title `deeper` for extra internals) ·
`{list: []}` · `{steps: []}` · `{table: {head, rows}}`.
Every content chapter gets a notes section with at least one `mini`. Notes add detail the video
can't fit; they are not a transcript.

## Quiz

8–10 multiple-choice questions, 4 options, one correct, each with a `why` that teaches. Test
understanding ("why does…", "what happens if…"), not trivia. Plausible distractors.

## Gotchas already hit (don't repeat)

- JSX attribute strings can't contain `\"`: use `text={'…"…'}`.
- Hooks (e.g. `React.useId`) must run before any early `return`.
- Panel content needs `h` ≥ 44 + padding + content, or the last line clips.
- A label between two panels gets covered by them: shorten it or widen the gap.

## Build and verify (all must pass before you report)

```bash
cd /Users/basha/Documents/Learning/java/animated-notes
node build.mjs <id>                      # builds only your topic (never run plain `node build.mjs`)
node tools/shoot.mjs <id>                # one frame per caption → shots/<id>/sheet-NN.png (6 per sheet)
node tools/shoot.mjs <id> --scene Name   # re-shoot one scene after a fix
node tools/shoot.mjs <id> --notes        # notes page → shots/<id>/notes-NN.png
```

`shoot.mjs` exits non-zero on any page/console error. **Look at every sheet** (Read the PNG) and fix
overlaps, clipping, off-stage elements, unreadable text, arrows through text, empty-looking frames.
Iterate until clean. Then check the notes page segments, including the quiz.

Your topic page is `part-08/<id>-<slug>.html` (it only exists if the manifest has the topic).

## Report back

Scene list with durations and total length, which deeper internals you covered, any corrections
to the source note, anything you were unsure about (facts), and confirmation that every sheet
was reviewed.
