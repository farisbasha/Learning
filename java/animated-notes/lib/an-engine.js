(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/engine/timeline.js
  var timeline_exports = {};
  __export(timeline_exports, {
    captionsFor: () => captionsFor,
    chapterAt: () => chapterAt,
    chapterSpans: () => chapterSpans,
    crossedBoundary: () => crossedBoundary,
    deriveCues: () => deriveCues,
    makeStore: () => makeStore,
    sceneAt: () => sceneAt,
    store: () => store
  });
  function deriveCues(scenes) {
    const starts = [];
    const byName = {};
    let acc = 0;
    for (const s of scenes) {
      starts.push(acc);
      if (!(s.name in byName)) byName[s.name] = acc;
      acc += s.dur;
    }
    return { starts, total: acc, byName };
  }
  function sceneAt(cues, T) {
    const { starts } = cues;
    let i = 0;
    while (i + 1 < starts.length && T >= starts[i + 1]) i++;
    return i;
  }
  function chapterSpans(scenes) {
    const spans = [];
    let acc = 0;
    scenes.forEach((s, i) => {
      const last = spans[spans.length - 1];
      if (last && last.ch === s.ch) last.end = acc + s.dur;
      else spans.push({ ch: s.ch, start: acc, end: acc + s.dur, first: i });
      acc += s.dur;
    });
    return spans;
  }
  function chapterAt(spans, T) {
    for (let i = 0; i < spans.length; i++) if (T < spans[i].end) return i;
    return spans.length - 1;
  }
  function crossedBoundary(prevT, nextT, spans, seeking) {
    if (seeking) return null;
    for (let i = 0; i < spans.length - 1; i++) {
      const e = spans[i].end;
      if (prevT < e && nextT >= e) return spans[i];
    }
    return null;
  }
  function captionsFor(scenes, captions, cues) {
    const out = [];
    scenes.forEach((s, i) => {
      const list = captions[s.name] || [];
      const st = cues.starts[i];
      const en = st + s.dur - 0.3;
      list.forEach(([at, text], j) => {
        const next = j + 1 < list.length ? st + list[j + 1][0] : en;
        out.push({ at: st + at, until: Math.round(Math.min(next, en) * 1e3) / 1e3, text });
      });
    });
    return out;
  }
  function makeStore(getLS) {
    const ls = () => {
      try {
        return getLS();
      } catch (e) {
        return void 0;
      }
    };
    return {
      get(key, fallback) {
        try {
          const raw = ls()?.getItem("an:" + key);
          return raw == null ? fallback : JSON.parse(raw);
        } catch (e) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          ls()?.setItem("an:" + key, JSON.stringify(value));
        } catch (e) {
        }
      }
    };
  }
  var store = makeStore(() => globalThis.localStorage);

  // src/engine/kit.jsx
  var kit_exports = {};
  __export(kit_exports, {
    Arrow: () => Arrow,
    Backdrop: () => Backdrop,
    Badge: () => Badge,
    Box: () => Box,
    Brace: () => Brace,
    Bytes: () => Bytes,
    Callout: () => Callout,
    Card: () => Card,
    Chip: () => Chip,
    ClockCtx: () => ClockCtx,
    Code: () => Code,
    Console: () => Console,
    Dot: () => Dot,
    Easing: () => Easing,
    HArrow: () => HArrow,
    Header: () => Header,
    MONO: () => MONO,
    MOTION: () => MOTION,
    Mark: () => Mark,
    Mover: () => Mover,
    Node: () => Node,
    PAL: () => PAL,
    Panel: () => Panel,
    SANS: () => SANS,
    StackView: () => StackView,
    Stat: () => Stat,
    Table: () => Table,
    Txt: () => Txt,
    VArrow: () => VArrow,
    Val: () => Val,
    clamp: () => clamp,
    countAt: () => countAt,
    fmt: () => fmt,
    hexA: () => hexA,
    hiByte: () => hiByte,
    hiJava: () => hiJava,
    hiShell: () => hiShell,
    highlight: () => highlight,
    hlAt: () => hlAt,
    lerp: () => lerp,
    lin: () => lin,
    markA: () => markA,
    pulse: () => pulse,
    step: () => step,
    toneColor: () => toneColor,
    track: () => track,
    track1: () => track1,
    usePal: () => usePal,
    useT: () => useT,
    win: () => win
  });
  var SANS = "'IBM Plex Sans', system-ui, sans-serif";
  var MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
  var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  var Easing = {
    linear: (t) => t,
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutBack: (t) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
  };
  var ramp = (t, s, d, ease) => d <= 0 ? t >= s ? 1 : 0 : ease(clamp((t - s) / d, 0, 1));
  var MOTION = {
    enter: (t, s, d = 0.6) => ramp(t, s, d, Easing.easeOutCubic),
    move: (t, s, d = 0.8) => ramp(t, s, d, Easing.easeInOutCubic),
    pop: (t, s, d = 0.5) => ramp(t, s, d, Easing.easeOutBack)
  };
  var lerp = (a, b, p) => a + (b - a) * p;
  var lin = (t, s, d) => clamp((t - s) / d, 0, 1);
  var win = (t, a, b, d = 0.4) => Math.min(MOTION.enter(t, a, d), 1 - MOTION.enter(t, b - d, d));
  var pulse = (t, times, d = 0.6) => times.reduce((m, ti) => t >= ti && t < ti + d ? Math.max(m, 1 - (t - ti) / d) : m, 0);
  var countAt = (t, times) => times.filter((ti) => t >= ti).length;
  function track(t, keys) {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) {
        const p = b[3] === "lin" ? lin(t, a[0], b[0] - a[0]) : MOTION.move(t, a[0], b[0] - a[0]);
        return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  }
  function track1(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t < keys[i + 1][0]) return lerp(keys[i][1], keys[i + 1][1], MOTION.move(t, keys[i][0], keys[i + 1][0] - keys[i][0]));
    }
    return keys[keys.length - 1][1];
  }
  function step(t, keys, initial) {
    let v = initial;
    for (const [ti, val] of keys) if (t >= ti) v = val;
    return v;
  }
  function hlAt(t, steps) {
    let cur = -2, prev = -2, at = -Infinity, lastValid = -1;
    for (const [ti, li] of steps) {
      if (t >= ti) {
        prev = cur;
        cur = li;
        at = ti;
        if (li >= 0) lastValid = li;
      }
    }
    if (cur === -2) return [-1, 0];
    if (cur === -1) return [lastValid, 1 - MOTION.enter(t, at, 0.25)];
    if (prev < 0) return [cur, MOTION.enter(t, at, 0.25)];
    return [lerp(prev, cur, MOTION.move(t, at, 0.3)), 1];
  }
  function hexA(hex, a) {
    let m = String(hex).replace("#", "");
    if (m.length === 3) m = m.split("").map((c) => c + c).join("");
    const n = parseInt(m.slice(0, 6), 16) || 0;
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  var PAL = {
    bg: "#0b0d11",
    panel: "#10131a",
    panel2: "#171b23",
    line: "rgba(255,255,255,0.08)",
    line2: "rgba(255,255,255,0.17)",
    ink: "#eceef2",
    ink2: "#a6adb9",
    ink3: "#6b7280",
    flow: "#56d4c4",
    pull: "#f2b84b",
    bad: "#f07a6a",
    str: "#e8a99f",
    violet: "#b29cff",
    blue: "#7cb4ff",
    green: "#a6dc6e",
    pink: "#f08bb4"
  };
  var usePal = () => PAL;
  var toneColor = (tone) => ({ bad: PAL.bad, pull: PAL.pull, dim: PAL.ink3, ink: PAL.ink2, violet: PAL.violet, blue: PAL.blue, green: PAL.green, pink: PAL.pink, flow: PAL.flow })[tone] || PAL.flow;
  var ClockCtx = React.createContext(0);
  var useT = () => React.useContext(ClockCtx);
  function fmt(text, codeColor = PAL.flow) {
    const out = [];
    String(text).split("`").forEach((part, i) => {
      if (i % 2) {
        out.push(/* @__PURE__ */ React.createElement("span", { key: "c" + i, style: { font: `500 0.9em ${MONO}`, color: codeColor } }, part));
        return;
      }
      part.split("**").forEach((q, j) => {
        out.push(j % 2 ? /* @__PURE__ */ React.createElement("b", { key: i + "-" + j, style: { color: PAL.ink, fontWeight: 600 } }, q) : /* @__PURE__ */ React.createElement(React.Fragment, { key: i + "-" + j }, q));
      });
    });
    return out;
  }
  var KW = new Set("new return try var for if else break continue void boolean long int double float char byte short interface throws throw class record static public private protected final null true false while do this super extends implements import package abstract enum switch case default catch finally instanceof synchronized volatile transient native sealed permits yield when".split(" "));
  function hiJava(s) {
    const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|('(?:[^'\\]|\\.)*'?)|(@\w+)|(\b\d[\d_.]*[LlFfDd]?\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
    const out = [];
    let m, k = 0;
    while (m = re.exec(s)) {
      let color = PAL.ink, w = 400, fs;
      if (m[1]) {
        color = PAL.ink3;
        fs = "italic";
      } else if (m[2] || m[3]) color = PAL.str;
      else if (m[4]) color = PAL.violet;
      else if (m[5]) color = PAL.bad;
      else if (m[6]) {
        if (KW.has(m[6])) color = PAL.pull;
        else if (/^[A-Z]/.test(m[6])) color = PAL.flow;
        else if (s[re.lastIndex] === "(") {
          color = PAL.ink;
          w = 600;
        } else color = "#cfd4dc";
      } else if (m[8]) color = PAL.ink2;
      out.push(/* @__PURE__ */ React.createElement("span", { key: k++, style: { color, fontWeight: w, fontStyle: fs } }, m[0]));
    }
    return out;
  }
  function hiByte(s) {
    const re = /(\/\/.*$)|(^\s*\d+:)|(#\d+)|(\b[a-z][a-z0-9_]*\b)|(-?\b\d+\b)|([\s\S])/g;
    const out = [];
    let m, k = 0, sawOp = false;
    while (m = re.exec(s)) {
      let color = PAL.ink2, w = 400, fs;
      if (m[1]) {
        color = PAL.ink3;
        fs = "italic";
      } else if (m[2]) color = PAL.ink3;
      else if (m[3]) color = PAL.violet;
      else if (m[4]) {
        if (!sawOp) {
          color = PAL.pull;
          w = 600;
          sawOp = true;
        } else color = PAL.ink;
      } else if (m[5]) color = PAL.bad;
      out.push(/* @__PURE__ */ React.createElement("span", { key: k++, style: { color, fontWeight: w, fontStyle: fs } }, m[0]));
    }
    return out;
  }
  function hiShell(s) {
    if (/^\s*[$>]/.test(s)) {
      const i = s.indexOf(s.trim()[0]) + 1;
      return [/* @__PURE__ */ React.createElement("span", { key: "p", style: { color: PAL.ink3 } }, s.slice(0, i)), /* @__PURE__ */ React.createElement("span", { key: "c", style: { color: PAL.ink, fontWeight: 500 } }, s.slice(i))];
    }
    if (/^\s*#/.test(s)) return [/* @__PURE__ */ React.createElement("span", { key: "c", style: { color: PAL.ink3, fontStyle: "italic" } }, s)];
    return [/* @__PURE__ */ React.createElement("span", { key: "o", style: { color: PAL.ink2 } }, s)];
  }
  var highlight = (s, lang) => lang === "bytecode" ? hiByte(s) : lang === "shell" ? hiShell(s) : lang === "plain" ? [/* @__PURE__ */ React.createElement("span", { key: "p" }, s)] : hiJava(s);
  function Txt({ x, y, children, fs = 22, color, mono, w, a = 1, weight = 400, align = "left", anchor, lh = 1.3, style }) {
    if (a <= 5e-3) return null;
    const tr = anchor === "center" ? "translate(-50%, -50%)" : anchor === "mid" ? "translateX(-50%)" : anchor === "right" ? "translateX(-100%)" : anchor === "left-center" ? "translateY(-50%)" : "none";
    const kids = typeof children === "string" ? fmt(children) : children;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, transform: tr, opacity: clamp(a, 0, 1), font: `${weight} ${fs}px ${mono ? MONO : SANS}`, lineHeight: lh, color: color || PAL.ink, textAlign: align, whiteSpace: w ? "normal" : "nowrap", textWrapStyle: w ? "pretty" : void 0, ...style } }, kids);
  }
  function Panel({ x, y, w, h, title, right, a = 1, tone, dashed, glow = 0, children, titleColor, fill }) {
    if (a <= 5e-3) return null;
    const tc = tone ? toneColor(tone) : null;
    const bc = glow > 0.01 && tc ? tc : tc ? hexA(tc, 0.75) : PAL.line2;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 14}px)`, background: fill || PAL.panel, border: `1.5px ${dashed ? "dashed" : "solid"} ${bc}`, borderRadius: 14, boxSizing: "border-box", overflow: "hidden", boxShadow: glow > 0.01 && tc ? `0 0 ${36 * glow}px ${hexA(tc, 0.4 * glow)}` : "0 14px 40px rgba(0,0,0,0.35)" } }, title != null && /* @__PURE__ */ React.createElement("div", { style: { height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 18px", borderBottom: `1px solid ${PAL.line}`, font: `500 19px ${MONO}`, color: titleColor || (tc ? tc : PAL.ink2), whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", null, title), right != null ? /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, right) : null), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, children));
  }
  function Box({ x, y, w, h, a = 1, label, sub, tone, fill, dashed, glow = 0, r = 12, fs = 22, sfs = 17, mono = true, align = "center", children, s = 1, strike, labelColor, style }) {
    if (a <= 5e-3) return null;
    const c = tone ? toneColor(tone) : null;
    const bg = fill === true && c ? hexA(c, 0.14) : fill || PAL.panel2;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", borderRadius: r, opacity: clamp(a, 0, 1), transform: `scale(${s * (0.94 + 0.06 * clamp(a, 0, 1))})`, background: bg, border: `2px ${dashed ? "dashed" : "solid"} ${c ? glow > 0.01 ? c : hexA(c, 0.8) : PAL.line2}`, boxShadow: glow > 0.01 && c ? `0 0 ${30 * glow}px ${hexA(c, 0.55 * glow)}` : "none", display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "center", justifyContent: "center", padding: align === "left" ? "0 16px" : 0, textAlign: align, overflow: "hidden", ...style } }, label != null && /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${fs}px ${mono ? MONO : SANS}`, color: labelColor || (c && tone !== "ink" ? PAL.ink : PAL.ink), whiteSpace: "nowrap", textDecoration: strike ? "line-through" : "none" } }, typeof label === "string" ? fmt(label) : label), sub != null && /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${sfs}px ${mono ? MONO : SANS}`, color: c || PAL.ink2, marginTop: 3, whiteSpace: "nowrap" } }, typeof sub === "string" ? fmt(sub, PAL.ink) : sub), children);
  }
  function Chip({ x, y, text, tone, o = 1, s = 1, ghost, glow = 0, fs = 22, h = 48, mono }) {
    if (o <= 0.01) return null;
    const c = ghost ? PAL.ink3 : toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: clamp(o, 0, 1), display: "flex", alignItems: "center", height: h, padding: "0 16px", borderRadius: h / 2, boxSizing: "border-box", background: ghost ? "rgba(11,13,17,0.6)" : PAL.panel2, border: `2px ${ghost ? "dashed" : "solid"} ${c}`, boxShadow: glow > 0.01 ? `0 0 ${26 * glow}px ${hexA(c, 0.6 * glow)}` : "0 4px 14px rgba(0,0,0,0.35)", color: ghost ? PAL.ink3 : PAL.ink, font: `600 ${fs}px ${mono ? MONO : SANS}`, whiteSpace: "nowrap" } }, text);
  }
  var valStyle = (tone, ghost, glow, fs, h) => {
    const c = ghost ? PAL.ink3 : toneColor(tone);
    return { height: h, minWidth: h, padding: "0 14px", boxSizing: "border-box", borderRadius: h / 2, display: "flex", alignItems: "center", justifyContent: "center", background: ghost ? "transparent" : PAL.panel2, border: `2px ${ghost ? "dashed" : "solid"} ${c}`, font: `600 ${fs}px ${MONO}`, color: ghost ? PAL.ink3 : PAL.ink, whiteSpace: "nowrap", boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA(c, 0.6 * glow)}` : "none" };
  };
  function Val({ x, y, text, tone, o = 1, s = 1, glow = 0, fs = 22, h = 44, ghost }) {
    if (o <= 0.01) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: clamp(o, 0, 1), ...valStyle(tone, ghost, glow, fs, h) } }, text);
  }
  function Mover({ t, keys, text, tone, fadeAt, s = 1, glowAt, fs, h }) {
    if (t < keys[0][0]) return null;
    const [x, y] = track(t, keys);
    let o = MOTION.enter(t, keys[0][0], 0.15);
    if (fadeAt != null) o *= 1 - MOTION.enter(t, fadeAt, 0.3);
    if (o <= 0.01) return null;
    return /* @__PURE__ */ React.createElement(Val, { x, y, text, tone, o, s, glow: glowAt != null ? pulse(t, [glowAt], 1) : 0, fs: fs || 22, h: h || 44 });
  }
  function Code({ x, y, w, h, title = "Main.java", right, lines, t = 99, a = 1, hl = -1, hlA = 0, fs = 22, lh = 36, cps = 55, lang = "java", tone, hlTone = "pull" }) {
    if (a <= 5e-3) return null;
    const hc = toneColor(hlTone);
    return /* @__PURE__ */ React.createElement(Panel, { x, y, w, h, title, right, a, tone }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 12 + hl * lh, height: lh, background: hexA(hc, 0.13), borderLeft: `3px solid ${hc}`, opacity: hl < 0 ? 0 : hlA } }), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 22px", position: "relative" } }, lines.map((ln, i) => {
      const L = typeof ln === "string" ? { s: ln } : ln;
      let txt = L.s, caret = false, op = 1;
      if (L.at != null) {
        const n = Math.floor(clamp((t - L.at) * (L.cps || cps), 0, L.s.length));
        op = t >= L.at ? 1 : 0;
        txt = L.s.slice(0, n);
        caret = t >= L.at && n < L.s.length;
      }
      if (L.o != null) op *= L.o;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { height: lh, display: "flex", alignItems: "center", whiteSpace: "pre", font: `400 ${fs}px ${MONO}`, color: PAL.ink, opacity: op, background: L.tone ? hexA(toneColor(L.tone), 0.12 * (L.toneA == null ? 1 : L.toneA)) : "transparent", margin: "0 -22px", padding: "0 22px" } }, highlight(txt, L.lang || lang), caret && /* @__PURE__ */ React.createElement("span", { style: { width: 2, height: fs * 1.1, background: PAL.pull, marginLeft: 1 } }));
    })));
  }
  function Console({ x, y, w, h, items, t, a = 1, fs = 20, lh = 32, title = "terminal" }) {
    if (a <= 5e-3) return null;
    const vis = items.filter((it) => t >= it.at);
    const max = Math.max(1, Math.floor((h - 44 - 24) / lh));
    const shown = vis.slice(-max);
    const blink = Math.floor(t * 2) % 2 === 0;
    return /* @__PURE__ */ React.createElement(Panel, { x, y, w, h, title, a }, /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 20px" } }, shown.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: it.at + ":" + i, style: { height: lh, display: "flex", alignItems: "center", gap: 10, whiteSpace: "pre", font: `${it.kind === "cmd" ? 500 : 400} ${fs}px ${MONO}`, color: it.kind === "err" ? PAL.bad : it.kind === "dim" ? PAL.ink3 : it.kind === "ok" ? PAL.flow : PAL.ink, opacity: MOTION.enter(t, it.at, 0.3) } }, it.kind === "cmd" ? /* @__PURE__ */ React.createElement("span", { style: { color: PAL.ink3 } }, "$") : null, /* @__PURE__ */ React.createElement("span", null, it.text))), shown.length < max && /* @__PURE__ */ React.createElement("div", { style: { height: lh, display: "flex", alignItems: "center", font: `400 ${fs}px ${MONO}`, color: PAL.ink3 } }, blink ? "\u258D" : " ")));
  }
  function Mark({ x, y, ok, a }) {
    if (a <= 0.01) return null;
    const c = ok ? PAL.flow : PAL.bad;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - 20, top: y - 20, width: 40, height: 40, borderRadius: 20, background: c, color: PAL.bg, display: "flex", alignItems: "center", justifyContent: "center", font: `700 24px ${SANS}`, transform: `scale(${a})`, opacity: clamp(a, 0, 1) } }, ok ? "\u2713" : "\u2717");
  }
  var markA = (t, at, hold = 1) => MOTION.pop(t, at, 0.4) * (1 - MOTION.enter(t, at + hold, 0.3));
  function HArrow({ x1, x2, y, a = 1, color, label, dashed, labelBelow, lfs = 18 }) {
    if (a <= 5e-3) return null;
    const c = color || PAL.ink2;
    const left = Math.min(x1, x2), w = Math.abs(x2 - x1), r = x2 >= x1;
    const head = r ? { right: 0, borderLeft: `12px solid ${c}` } : { left: 0, borderRight: `12px solid ${c}` };
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left, top: y - 10, width: w, height: 20, opacity: a } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: r ? 0 : 10, right: r ? 10 : 0, top: 9, borderTop: `2px ${dashed ? "dashed" : "solid"} ${c}` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 3, width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", ...head } }), label && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "50%", transform: "translateX(-50%)", top: labelBelow ? 22 : -26, font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: "nowrap" } }, label));
  }
  function VArrow({ x, y1, y2, a = 1, color, label, lfs = 18 }) {
    if (a <= 5e-3) return null;
    const c = color || PAL.ink2;
    const top = Math.min(y1, y2), h = Math.abs(y2 - y1), d = y2 >= y1;
    const head = d ? { bottom: 0, borderTop: `12px solid ${c}` } : { top: 0, borderBottom: `12px solid ${c}` };
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - 10, top, width: 20, height: h, opacity: a } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 9, top: d ? 0 : 10, bottom: d ? 10 : 0, borderLeft: `2px solid ${c}` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 3, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", ...head } }), label && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", font: `500 ${lfs}px ${MONO}`, color: c, whiteSpace: "nowrap" } }, label));
  }
  function Arrow({ pts, from, to, curve = 0, draw = 1, a = 1, color, width = 2.5, dashed, label, lx, ly, lfs = 18, head = true, tone }) {
    const id = React.useId().replace(/:/g, "");
    if (a <= 5e-3 || draw <= 1e-3) return null;
    const P = pts || [from, to];
    const c = color || (tone ? toneColor(tone) : PAL.ink2);
    let d;
    let end = P[P.length - 1], prev = P[P.length - 2];
    if (P.length === 2 && curve) {
      const [x1, y1] = P[0], [x2, y2] = P[1];
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1) || 1;
      const cx = mx - (y2 - y1) / len * curve, cy = my + (x2 - x1) / len * curve;
      d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
      prev = [cx, cy];
    } else d = "M" + P.map((p) => p.join(",")).join(" L");
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    const hs = 13;
    const hp = `${end[0]},${end[1]} ${end[0] - hs * Math.cos(ang - 0.42)},${end[1] - hs * Math.sin(ang - 0.42)} ${end[0] - hs * Math.cos(ang + 0.42)},${end[1] - hs * Math.sin(ang + 0.42)}`;
    return /* @__PURE__ */ React.createElement("svg", { width: "1920", height: "1080", viewBox: "0 0 1920 1080", style: { position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp(a, 0, 1), pointerEvents: "none" } }, dashed && draw < 1 && /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("mask", { id: "m" + id }, /* @__PURE__ */ React.createElement("path", { d, pathLength: "1", fill: "none", stroke: "#fff", strokeWidth: width + 6, strokeDasharray: "1", strokeDashoffset: 1 - draw }))), /* @__PURE__ */ React.createElement(
      "path",
      {
        d,
        fill: "none",
        stroke: c,
        strokeWidth: width,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        pathLength: dashed ? void 0 : 1,
        strokeDasharray: dashed ? "8 7" : "1",
        strokeDashoffset: dashed ? 0 : 1 - draw,
        mask: dashed && draw < 1 ? `url(#m${id})` : void 0
      }
    ), head && draw > 0.97 && /* @__PURE__ */ React.createElement("polygon", { points: hp, fill: c }), label && /* @__PURE__ */ React.createElement("text", { x: lx, y: ly, fill: c, style: { font: `500 ${lfs}px ${MONO}` }, textAnchor: "middle" }, label));
  }
  function Dot({ x, y, a = 1, color, r = 10 }) {
    if (a <= 0.01) return null;
    const c = color || PAL.flow;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, background: c, boxShadow: `0 0 20px ${c}`, opacity: a } });
  }
  function Card({ x, y, w, h, a = 1, num, title, sub, glow = 0, tone, tfs = 32, sfs = 23 }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", padding: "26px 28px", opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 16}px)`, background: PAL.panel, borderRadius: 14, border: `1.5px solid ${glow > 0.01 ? c : PAL.line2}`, boxShadow: glow > 0.01 ? `0 0 ${36 * glow}px ${hexA(c, 0.35 * glow)}` : "0 14px 40px rgba(0,0,0,0.35)" } }, num != null && /* @__PURE__ */ React.createElement("div", { style: { font: `600 20px ${MONO}`, color: tone ? c : PAL.pull } }, num), /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${tfs}px ${SANS}`, color: PAL.ink, marginTop: num != null ? 10 : 0, lineHeight: 1.15 } }, typeof title === "string" ? fmt(title) : title), sub && /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${sfs}px ${SANS}`, color: PAL.ink2, marginTop: 12, lineHeight: 1.35, textWrap: "pretty" } }, typeof sub === "string" ? fmt(sub) : sub));
  }
  function Stat({ x, y, label, value, color, a = 1, w = 600, fs = 28 }) {
    if (a <= 5e-3) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: a, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", { style: { font: `400 22px ${SANS}`, color: PAL.ink2 } }, label), /* @__PURE__ */ React.createElement("span", { style: { font: `600 ${fs}px ${MONO}`, color: color || PAL.ink } }, value));
  }
  function Node({ x, y, w, h, kind, name, rows = [], a = 1, glow = 0, tone, nfs = 24, rfs = 19, shake = 0, bad }) {
    if (a <= 5e-3) return null;
    const c = bad ? PAL.bad : toneColor(tone);
    const lit = glow > 0.01 || bad;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", opacity: clamp(a, 0, 1), transform: `translateX(${shake}px) scale(${0.9 + 0.1 * clamp(a, 0, 1)})`, background: PAL.panel, borderRadius: 14, border: `1.5px solid ${lit ? c : tone ? hexA(c, 0.7) : PAL.line2}`, boxShadow: lit ? `0 0 ${30 * Math.max(glow, bad ? 1 : 0)}px ${hexA(c, 0.45)}` : "0 14px 40px rgba(0,0,0,0.35)", padding: "14px 18px" } }, kind && /* @__PURE__ */ React.createElement("div", { style: { font: `500 17px ${MONO}`, color: PAL.ink2, letterSpacing: "0.03em", whiteSpace: "nowrap" } }, kind), name && /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${nfs}px ${MONO}`, color: tone ? c : PAL.ink, marginTop: kind ? 4 : 0, whiteSpace: "nowrap" } }, name), rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: i ? 5 : 12, font: `400 ${rfs}px ${MONO}`, color: PAL.ink2, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement("span", null, r[0]), /* @__PURE__ */ React.createElement("span", { style: { color: r[2] || PAL.ink, background: r[3] ? hexA(PAL.pull, 0.25 * r[3]) : "transparent", borderRadius: 4, padding: "0 4px" } }, r[1]))));
  }
  function Badge({ x, y, text, tone = "pull", a = 1, s = 1, fs = 17, anchor = "center", solid }) {
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    const tr = anchor === "center" ? "translate(-50%, -50%)" : anchor === "left" ? "translateY(-50%)" : "none";
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, transform: `${tr} scale(${s})`, opacity: clamp(a, 0, 1), padding: "4px 12px", borderRadius: 999, background: solid ? c : hexA(c, 0.14), border: `1.5px solid ${hexA(c, 0.7)}`, color: solid ? PAL.bg : c, font: `600 ${fs}px ${MONO}`, letterSpacing: "0.04em", whiteSpace: "nowrap" } }, text);
  }
  function Callout({ x, y, w, text, title, tone = "pull", a = 1, fs = 22 }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", opacity: clamp(a, 0, 1), transform: `translateY(${(1 - clamp(a, 0, 1)) * 10}px)`, background: hexA(c, 0.08), borderLeft: `4px solid ${c}`, borderRadius: "0 12px 12px 0", padding: "14px 20px" } }, title && /* @__PURE__ */ React.createElement("div", { style: { font: `600 16px ${MONO}`, color: c, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 } }, title), /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${fs}px ${SANS}`, color: PAL.ink, lineHeight: 1.4, textWrap: "pretty" } }, typeof text === "string" ? fmt(text) : text));
  }
  function Brace({ x, y, w, label, a = 1, tone, above, fs = 18 }) {
    if (a <= 5e-3) return null;
    const c = tone ? toneColor(tone) : PAL.ink2;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: 14, opacity: clamp(a, 0, 1) } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: above ? 12 : 0, height: 2, background: c } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, top: 0, width: 2, height: 14, background: c } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: 0, top: 0, width: 2, height: 14, background: c } }), label && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "50%", transform: "translateX(-50%)", top: above ? -28 : 20, font: `500 ${fs}px ${MONO}`, color: c, whiteSpace: "nowrap" } }, typeof label === "string" ? fmt(label, c) : label));
  }
  function Bytes({ x, y, cells, unit = 40, h = 70, a = 1, ruler = true, fs = 18, sfs = 15 }) {
    if (a <= 5e-3) return null;
    let off = 0;
    const marks = [0];
    const out = cells.map((c, i) => {
      const left = off * unit, w = c.n * unit;
      off += c.n;
      marks.push(off);
      const ca = c.a == null ? 1 : c.a;
      const col = c.tone ? toneColor(c.tone) : PAL.ink3;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left, top: 0, width: w, height: h, boxSizing: "border-box", opacity: ca, background: c.pad ? `repeating-linear-gradient(45deg, transparent 0 7px, ${hexA(PAL.ink3, 0.25)} 7px 9px)` : hexA(col, 0.16), border: `2px ${c.dashed || c.pad ? "dashed" : "solid"} ${hexA(col, 0.85)}`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: c.glow ? `0 0 ${24 * c.glow}px ${hexA(col, 0.6 * c.glow)}` : "none" } }, c.label && /* @__PURE__ */ React.createElement("div", { style: { font: `600 ${fs}px ${MONO}`, color: c.pad ? PAL.ink3 : PAL.ink, whiteSpace: "nowrap" } }, c.label), c.sub && /* @__PURE__ */ React.createElement("div", { style: { font: `400 ${sfs}px ${MONO}`, color: c.pad ? PAL.ink3 : col, whiteSpace: "nowrap", marginTop: 2 } }, c.sub));
    });
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: off * unit, height: h, opacity: clamp(a, 0, 1) } }, out, ruler && marks.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: "r" + i, style: { position: "absolute", left: m * unit, top: h + 6, transform: "translateX(-50%)", font: `400 15px ${MONO}`, color: PAL.ink3 } }, m)));
  }
  function StackView({ x, y, w, h, title, items, slotH = 54, a = 1, gap = 8, fs = 22, empty = "empty", tone, right }) {
    if (a <= 5e-3) return null;
    const vis = items.filter((it) => (it.a == null ? 1 : it.a) > 0.01);
    return /* @__PURE__ */ React.createElement(Panel, { x, y, w, h, title, a, tone, right }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, height: h - 44 } }, items.map((it, i) => {
      const ia = it.a == null ? 1 : it.a;
      if (ia <= 0.01) return null;
      const c = toneColor(it.tone);
      const bottom = 14 + i * (slotH + gap) + (1 - ia) * 30;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 16, right: 16, bottom, height: slotH, boxSizing: "border-box", opacity: clamp(ia, 0, 1), borderRadius: 10, background: hexA(c, 0.14), border: `2px solid ${hexA(c, 0.85)}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", font: `600 ${fs}px ${MONO}`, color: PAL.ink, whiteSpace: "nowrap", boxShadow: it.glow ? `0 0 ${24 * it.glow}px ${hexA(c, 0.6 * it.glow)}` : "none" } }, /* @__PURE__ */ React.createElement("span", null, it.text), it.sub != null && /* @__PURE__ */ React.createElement("span", { style: { font: `400 ${fs - 5}px ${MONO}`, color: c } }, it.sub));
    }), vis.length === 0 && empty && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", font: `400 18px ${MONO}`, color: PAL.ink3 } }, empty)));
  }
  function Table({ x, y, cols, head, rows, a = 1, rowA, hl = -1, hlA = 1, fs = 20, rh = 48, tone = "pull", mono = true, colColors = [], marks = {} }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    const W = cols.reduce((s, v) => s + v, 0);
    const cell = (txt, j, isHead) => /* @__PURE__ */ React.createElement("div", { key: j, style: { width: cols[j], flex: "none", padding: "0 16px", boxSizing: "border-box", font: `${isHead ? 600 : 400} ${isHead ? fs - 3 : fs}px ${mono && !isHead ? MONO : isHead ? MONO : SANS}`, color: isHead ? PAL.ink3 : colColors[j] || PAL.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: isHead ? "0.06em" : 0, textTransform: isHead ? "uppercase" : "none" } }, typeof txt === "string" ? fmt(txt) : txt);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: W, opacity: clamp(a, 0, 1), background: PAL.panel, border: `1.5px solid ${PAL.line2}`, borderRadius: 12, overflow: "hidden" } }, head && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", height: rh - 6, borderBottom: `1px solid ${PAL.line2}` } }, head.map((h, j) => cell(h, j, true))), rows.map((r, i) => {
      const ra = rowA ? rowA[i] == null ? 1 : rowA[i] : 1;
      const mk = marks[i];
      const mc = mk ? toneColor(mk[0]) : c, ma = mk ? mk[1] : i === hl ? hlA : 0;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", height: rh, opacity: ra, borderTop: i ? `1px solid ${PAL.line}` : "none", background: ma > 0.01 ? hexA(mc, 0.15 * ma) : "transparent", boxShadow: ma > 0.01 ? `inset 4px 0 0 ${hexA(mc, ma)}` : "none" } }, r.map((v, j) => cell(v, j, false)));
    }));
  }
  function Backdrop() {
    const T = useT();
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.7px)", backgroundSize: "40px 40px", backgroundPosition: `${-T * 4 % 40}px ${-T * 2 % 40}px` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)" } }));
  }
  function Header({ kicker, title }) {
    if (!title) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 58 } }, /* @__PURE__ */ React.createElement("div", { style: { font: `600 20px ${MONO}`, color: PAL.pull, letterSpacing: "0.14em", textTransform: "uppercase" } }, kicker), /* @__PURE__ */ React.createElement("div", { style: { font: `600 54px ${SANS}`, color: PAL.ink, marginTop: 8, letterSpacing: "-0.01em" } }, fmt(title)));
  }

  // src/engine/player.jsx
  var fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  var PAUSE_LEAD = 0.7;
  var SceneBoundary = class extends React.Component {
    constructor(p) {
      super(p);
      this.state = { err: null };
    }
    static getDerivedStateFromError(err) {
      return { err };
    }
    componentDidCatch(err) {
      console.error("[scene " + this.props.name + "]", err);
    }
    render() {
      if (this.state.err) {
        return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 300, right: 96, padding: 32, border: `2px solid ${PAL.bad}`, borderRadius: 14, background: hexA(PAL.bad, 0.08), font: `500 26px ${MONO}`, color: PAL.bad, whiteSpace: "pre-wrap" } }, "Scene \u201C", this.props.name, "\u201D failed to render:", "\n", String(this.state.err && this.state.err.message));
      }
      return this.props.children;
    }
  };
  function StageBox({ children, fit = "width", bg = PAL.bg, style, onClick }) {
    const ref = React.useRef(null);
    const [box, setBox] = React.useState({ w: 960, h: 540 });
    React.useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);
    const s = fit === "contain" ? Math.min(box.w / 1920, box.h / 1080) : box.w / 1920;
    const outer = fit === "contain" ? { position: "relative", width: "100%", height: "100%" } : { position: "relative", width: "100%", aspectRatio: "16 / 9" };
    return /* @__PURE__ */ React.createElement("div", { ref, onClick, style: { ...outer, overflow: "hidden", background: bg, ...style } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: (box.w - 1920 * s) / 2, top: fit === "contain" ? (box.h - 1080 * s) / 2 : 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0", overflow: "hidden", background: bg, fontFamily: SANS, color: PAL.ink } }, children));
  }
  function SceneLayer({ scene, t, kicker, header = true, fade = true }) {
    const d = scene.dur;
    const a = fade ? Math.min(MOTION.enter(t, 0, 0.6), 1 - MOTION.enter(t, d - 0.6, 0.6)) : 1;
    const C = scene.C;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, opacity: a } }, header && /* @__PURE__ */ React.createElement(Header, { kicker, title: scene.title }), /* @__PURE__ */ React.createElement(SceneBoundary, { key: scene.name, name: scene.name }, /* @__PURE__ */ React.createElement(C, { t, d })));
  }
  var kickerFor = (topic, scene) => `${String(scene.ch).padStart(2, "0")} \xB7 ${topic.chapters[scene.ch] || ""}`;
  function CaptionLine({ caps, T }) {
    const c = caps.find((x) => T >= x.at && T < x.until);
    if (!c) return null;
    const a = Math.min(MOTION.enter(T, c.at, 0.25), 1 - MOTION.enter(T, c.until - 0.2, 0.2));
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "8%", right: "8%", bottom: 34, textAlign: "center", opacity: a, font: `500 32px ${SANS}`, lineHeight: 1.3, color: PAL.ink, textShadow: "0 2px 18px rgba(0,0,0,0.8)", textWrap: "balance" } }, fmt(c.text));
  }
  function useQuery() {
    return React.useMemo(() => {
      const q = new URLSearchParams(location.search);
      const h = new URLSearchParams(location.hash.replace(/^#/, ""));
      const num = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : null;
      };
      return { shot: q.has("shot") ? num(q.get("shot")) : null, t: h.has("t") ? num(h.get("t")) : null };
    }, []);
  }
  var Btn = ({ onClick, title, children, on, wide }) => /* @__PURE__ */ React.createElement("button", { className: "an-btn" + (on ? " on" : ""), title, onClick, style: wide ? { padding: "0 12px" } : null }, children);
  function TopicVideo({ topic, apiRef, onWatched }) {
    const scenes = topic.scenes;
    const cues = React.useMemo(() => deriveCues(scenes), [scenes]);
    const spans = React.useMemo(() => chapterSpans(scenes), [scenes]);
    const pauseSpans = React.useMemo(() => spans.map((s) => ({ ...s, end: s.end - PAUSE_LEAD })), [spans]);
    const caps = React.useMemo(() => captionsFor(scenes, topic.captions || {}, cues), [scenes, cues]);
    const q = useQuery();
    const K = topic.id;
    const [initial] = React.useState(() => q.shot != null ? q.shot : q.t != null ? q.t : (() => {
      const p = Number(store.get(K + ":pos", 0)) || 0;
      return p > cues.total - 3 ? 0 : p;
    })());
    const [T, setT] = React.useState(() => clamp(initial, 0, cues.total));
    const [playing, setPlaying] = React.useState(false);
    const [speed, setSpeed] = React.useState(() => store.get("speed", 1));
    const [cc, setCc] = React.useState(() => store.get("cc", true));
    const [stopAtCh, setStopAtCh] = React.useState(() => store.get("stopAtCh", true));
    const [done, setDone] = React.useState(null);
    const [watched, setWatched] = React.useState(() => new Set(store.get(K + ":watched", [])));
    const [hover, setHover] = React.useState(null);
    const [started, setStarted] = React.useState(initial > 0.05);
    const [isFs, setIsFs] = React.useState(false);
    React.useEffect(() => {
      const on = () => setIsFs(document.fullscreenElement === wrapRef.current);
      document.addEventListener("fullscreenchange", on);
      return () => document.removeEventListener("fullscreenchange", on);
    }, []);
    const tRef = React.useRef(T);
    const wrapRef = React.useRef(null);
    const visRef = React.useRef(true);
    tRef.current = T;
    const watchedRef = React.useRef(watched);
    const markWatched = React.useCallback((i) => {
      if (watchedRef.current.has(i)) return;
      const n = new Set(watchedRef.current);
      n.add(i);
      watchedRef.current = n;
      setWatched(n);
      store.set(K + ":watched", [...n]);
      onWatched && onWatched(n);
    }, [K]);
    React.useEffect(() => {
      if (!playing) return;
      let raf, last = performance.now();
      const tick = (now) => {
        const dt = Math.min(0.1, (now - last) / 1e3);
        last = now;
        const prev = tRef.current;
        let next = prev + dt * speed;
        const crossed = crossedBoundary(prev, next, pauseSpans, false);
        if (crossed) {
          const i = pauseSpans.indexOf(crossed);
          markWatched(i);
          if (stopAtCh) {
            tRef.current = crossed.end;
            setT(crossed.end);
            setPlaying(false);
            setDone(i);
            return;
          }
        }
        if (next >= cues.total) {
          next = cues.total;
          markWatched(spans.length - 1);
          setT(next);
          setPlaying(false);
          return;
        }
        tRef.current = next;
        setT(next);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [playing, speed, stopAtCh, pauseSpans, cues.total]);
    const q2 = Math.floor(T / 2);
    React.useEffect(() => {
      if (q.shot == null) store.set(K + ":pos", T);
    }, [q2]);
    const seek = (x) => {
      setDone(null);
      setStarted(true);
      const v = clamp(x, 0, cues.total);
      tRef.current = v;
      setT(v);
    };
    const chStart = (i) => spans[clamp(i, 0, spans.length - 1)].start + 0.02;
    const curCh = chapterAt(spans, T);
    const toggle = () => {
      if (done != null) {
        seek(spans[done + 1] ? spans[done + 1].start + 0.02 : T);
        setPlaying(true);
        return;
      }
      if (T >= cues.total - 0.05) seek(0);
      setStarted(true);
      setPlaying((p) => !p);
    };
    const prevCh = () => seek(T - spans[curCh].start > 2 || curCh === 0 ? chStart(curCh) : chStart(curCh - 1));
    const nextCh = () => {
      if (curCh + 1 < spans.length) seek(chStart(curCh + 1));
    };
    const fullscreen = () => {
      const el = wrapRef.current;
      if (!el) return;
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen && el.requestFullscreen();
    };
    if (apiRef) apiRef.current = { seekChapter: (ch) => {
      const i = spans.findIndex((s) => s.ch === ch);
      if (i >= 0) {
        seek(chStart(i));
        setPlaying(true);
      }
    }, pause: () => setPlaying(false) };
    React.useEffect(() => {
      const el = wrapRef.current;
      const io = new IntersectionObserver(([e]) => {
        visRef.current = e.intersectionRatio > 0.4;
      }, { threshold: [0, 0.4, 1] });
      if (el) io.observe(el);
      const onKey = (e) => {
        if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
        if (!visRef.current && !document.fullscreenElement) return;
        const k = e.key;
        if (e.repeat && (k === " " || k === "k" || k === "c" || k === "f")) return;
        if (k === " " || k === "k") {
          e.preventDefault();
          toggleRef.current();
        } else if (k === "ArrowLeft") {
          e.preventDefault();
          seekRef.current(tRef.current - 5);
        } else if (k === "ArrowRight") {
          e.preventDefault();
          seekRef.current(tRef.current + 5);
        } else if (k === "[") prevRef.current();
        else if (k === "]") nextRef.current();
        else if (k === "c") setCc((v) => {
          store.set("cc", !v);
          return !v;
        });
        else if (k === "f") fullscreen();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        io.disconnect();
      };
    }, []);
    const toggleRef = React.useRef(toggle), seekRef = React.useRef(seek), prevRef = React.useRef(prevCh), nextRef = React.useRef(nextCh);
    toggleRef.current = toggle;
    seekRef.current = seek;
    prevRef.current = prevCh;
    nextRef.current = nextCh;
    const poster = !started && !playing && q.shot == null && T < 0.05;
    const RT = poster ? topic.poster != null ? topic.poster : Math.max(0, scenes[0].dur - 2) : T;
    const si = sceneAt(cues, RT);
    const scene = scenes[si];
    const stage = /* @__PURE__ */ React.createElement(ClockCtx.Provider, { value: RT }, /* @__PURE__ */ React.createElement(Backdrop, null), /* @__PURE__ */ React.createElement(SceneLayer, { scene, t: RT - cues.starts[si], kicker: kickerFor(topic, scene) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 0, height: 140, background: "linear-gradient(rgba(5,6,8,0), rgba(5,6,8,0.82))", pointerEvents: "none" } }), cc && !poster && /* @__PURE__ */ React.createElement(CaptionLine, { caps, T }));
    if (q.shot != null) {
      window.__anSeek = (x) => seek(x);
      window.__anTimes = () => ({ total: cues.total, caps: caps.map((c) => [c.at, c.until, c.text]), scenes: scenes.map((s, i) => [s.name, cues.starts[i], s.dur]) });
      return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, background: PAL.bg } }, /* @__PURE__ */ React.createElement(StageBox, { fit: "contain" }, stage));
    }
    const total = cues.total;
    return /* @__PURE__ */ React.createElement("div", { ref: wrapRef, className: "an-video" }, /* @__PURE__ */ React.createElement("div", { className: "an-rail" }, spans.map((s, i) => {
      const on = i === curCh;
      const p = clamp((T - s.start) / (s.end - s.start), 0, 1);
      return /* @__PURE__ */ React.createElement("button", { key: i, className: "an-chip" + (on ? " on" : ""), title: `${topic.chapters[s.ch]} \xB7 ${fmtTime(s.start)}`, onClick: () => seek(chStart(i)) }, /* @__PURE__ */ React.createElement("span", { className: "n" }, watched.has(i) ? "\u2713" : String(s.ch).padStart(2, "0")), /* @__PURE__ */ React.createElement("span", null, topic.chapters[s.ch]), /* @__PURE__ */ React.createElement("span", { className: "bar", style: { width: `${p * 100}%` } }));
    })), /* @__PURE__ */ React.createElement("div", { className: "an-stage" }, /* @__PURE__ */ React.createElement(StageBox, { key: isFs ? "fs" : "n", fit: isFs ? "contain" : "width", onClick: toggle, style: { cursor: "pointer" } }, stage), !playing && done == null && /* @__PURE__ */ React.createElement("div", { className: "an-bigplay", onClick: toggle }, /* @__PURE__ */ React.createElement("div", null, "\u25B6")), done != null && /* @__PURE__ */ React.createElement("div", { className: "an-done" }, /* @__PURE__ */ React.createElement("div", { className: "k" }, "Chapter ", String(spans[done].ch).padStart(2, "0"), " done"), /* @__PURE__ */ React.createElement("div", { className: "t" }, topic.chapters[spans[done].ch]), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("button", { className: "an-cta", onClick: toggle }, "\u25B6 Continue: ", topic.chapters[spans[done + 1] ? spans[done + 1].ch : 0]), /* @__PURE__ */ React.createElement("button", { className: "an-ghost", onClick: () => {
      seek(chStart(done));
      setPlaying(true);
    } }, "\u27F2 Replay chapter"), /* @__PURE__ */ React.createElement("a", { className: "an-ghost", href: "#notes-ch" + spans[done].ch, onClick: () => setDone(null) }, "Read notes \u2193")))), /* @__PURE__ */ React.createElement("div", { className: "an-controls" }, /* @__PURE__ */ React.createElement(Btn, { onClick: toggle, title: "Play/pause (Space)" }, playing ? "\u275A\u275A" : "\u25B6"), /* @__PURE__ */ React.createElement(Btn, { onClick: prevCh, title: "Previous chapter ([)" }, "\u23EE"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => seek(T - 5), title: "Back 5s (\u2190)" }, "\u22125"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => seek(T + 5), title: "Forward 5s (\u2192)" }, "+5"), /* @__PURE__ */ React.createElement(Btn, { onClick: nextCh, title: "Next chapter (])" }, "\u23ED"), /* @__PURE__ */ React.createElement("span", { className: "an-time" }, fmtTime(T), " / ", fmtTime(total)), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "an-scrub",
        onMouseMove: (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(clamp((e.clientX - r.left) / r.width, 0, 1) * total);
        },
        onMouseLeave: () => setHover(null),
        onClick: (e) => {
          const r = e.currentTarget.getBoundingClientRect();
          seek(clamp((e.clientX - r.left) / r.width, 0, 1) * total);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "track" }, /* @__PURE__ */ React.createElement("div", { className: "fill", style: { width: `${T / total * 100}%` } })),
      spans.slice(1).map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "tick", style: { left: `${s.start / total * 100}%` } })),
      /* @__PURE__ */ React.createElement("div", { className: "knob", style: { left: `${T / total * 100}%` } }),
      hover != null && /* @__PURE__ */ React.createElement("div", { className: "tip", style: { left: `${hover / total * 100}%` } }, fmtTime(hover), " \xB7 ", topic.chapters[spans[chapterAt(spans, hover)].ch])
    ), /* @__PURE__ */ React.createElement("select", { className: "an-sel", value: speed, title: "Speed", onChange: (e) => {
      const v = parseFloat(e.target.value);
      setSpeed(v);
      store.set("speed", v);
      e.target.blur();
    } }, [0.75, 1, 1.25, 1.5].map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v, "\xD7"))), /* @__PURE__ */ React.createElement(Btn, { on: cc, onClick: () => setCc((v) => {
      store.set("cc", !v);
      return !v;
    }), title: "Captions (c)", wide: true }, "CC"), /* @__PURE__ */ React.createElement(Btn, { on: stopAtCh, onClick: () => setStopAtCh((v) => {
      store.set("stopAtCh", !v);
      return !v;
    }), title: "Pause at the end of each chapter", wide: true }, "\u23F8 ch"), /* @__PURE__ */ React.createElement(Btn, { onClick: fullscreen, title: "Fullscreen (f)" }, "\u26F6")));
  }

  // src/engine/notes.jsx
  var Safe = class extends React.Component {
    constructor(p) {
      super(p);
      this.state = { err: null };
    }
    static getDerivedStateFromError(err) {
      return { err };
    }
    componentDidCatch(err) {
      console.error("[notes block]", err);
    }
    render() {
      if (this.state.err) return /* @__PURE__ */ React.createElement("div", { className: "an-callout bad" }, /* @__PURE__ */ React.createElement("div", { className: "lbl" }, "couldn't render this part"), /* @__PURE__ */ React.createElement("div", null, String(this.state.err && this.state.err.message)));
      return this.props.children;
    }
  };
  function Mini({ topic, scene: name, from = 0, to, caption }) {
    const scene = topic.scenes.find((s) => s.name === name);
    const [t, setT] = React.useState(from);
    const [playing, setPlaying] = React.useState(false);
    const ref = React.useRef(null);
    const tRef = React.useRef(from);
    const started = React.useRef(false);
    const end = to == null ? scene ? scene.dur : 1 : to;
    tRef.current = t;
    const caps = React.useMemo(() => {
      if (!scene) return [];
      return captionsFor([scene], topic.captions || {}, deriveCues([scene]));
    }, [scene]);
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(([e]) => {
        if (e.intersectionRatio > 0.6 && !started.current) {
          started.current = true;
          setPlaying(true);
        }
        if (e.intersectionRatio < 0.1) setPlaying(false);
      }, { threshold: [0, 0.1, 0.6] });
      io.observe(el);
      return () => io.disconnect();
    }, []);
    React.useEffect(() => {
      if (!playing) return;
      let raf, last = performance.now();
      const tick = (now) => {
        const dt = Math.min(0.1, (now - last) / 1e3);
        last = now;
        const n = tRef.current + dt;
        if (n >= end) {
          setT(end);
          setPlaying(false);
          return;
        }
        setT(n);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [playing, end]);
    if (!scene) return /* @__PURE__ */ React.createElement("div", { className: "an-callout bad" }, "Missing scene \u201C", name, "\u201D");
    const toggle = () => {
      started.current = true;
      if (t >= end - 0.05) setT(from);
      setPlaying((p) => !p);
    };
    const poster = !started.current && !playing && t === from;
    const rt = poster ? Math.max(from, end - 0.6) : t;
    const cap = poster ? null : caps.find((c) => t >= c.at && t < c.until);
    return /* @__PURE__ */ React.createElement("figure", { className: "an-mini", ref }, /* @__PURE__ */ React.createElement(StageBox, { onClick: toggle, style: { cursor: "pointer", borderRadius: 12 } }, /* @__PURE__ */ React.createElement(ClockCtx.Provider, { value: rt }, /* @__PURE__ */ React.createElement(Backdrop, null), /* @__PURE__ */ React.createElement(SceneLayer, { scene, t: rt, kicker: kickerFor(topic, scene), fade: false }), cap && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "6%", right: "6%", bottom: 30, textAlign: "center", font: `500 38px 'IBM Plex Sans', sans-serif`, color: PAL.ink, textShadow: "0 2px 18px rgba(0,0,0,0.9)", opacity: MOTION.enter(t, cap.at, 0.25), textWrap: "balance" } }, fmt(cap.text)))), /* @__PURE__ */ React.createElement("div", { className: "an-mini-bar" }, /* @__PURE__ */ React.createElement("button", { className: "an-btn", onClick: toggle, title: "Play/pause" }, playing ? "\u275A\u275A" : t >= end - 0.05 ? "\u27F2" : "\u25B6"), /* @__PURE__ */ React.createElement("div", { className: "an-scrub small", onClick: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setT(from + clamp((e.clientX - r.left) / r.width, 0, 1) * (end - from));
    } }, /* @__PURE__ */ React.createElement("div", { className: "track" }, /* @__PURE__ */ React.createElement("div", { className: "fill", style: { width: `${(t - from) / (end - from) * 100}%` } }))), /* @__PURE__ */ React.createElement("span", { className: "an-time" }, fmtTime(t - from), " / ", fmtTime(end - from))), caption && /* @__PURE__ */ React.createElement("figcaption", null, fmt(caption)));
  }
  function CodeBlock({ code, title, lang = "java" }) {
    const [copied, setCopied] = React.useState(false);
    const lines = String(code).replace(/\n$/, "").split("\n");
    const copy = () => {
      const txt = lang === "shell" ? lines.filter((l) => /^\s*\$/.test(l)).map((l) => l.replace(/^\s*\$\s?/, "")).join("\n") || code : code;
      try {
        navigator.clipboard.writeText(txt).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }, () => {
        });
      } catch (e) {
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "an-code" }, /* @__PURE__ */ React.createElement("div", { className: "hd" }, /* @__PURE__ */ React.createElement("span", null, title || (lang === "bytecode" ? "javap -c" : lang === "shell" ? "terminal" : "java")), /* @__PURE__ */ React.createElement("button", { onClick: copy }, copied ? "copied \u2713" : "copy")), /* @__PURE__ */ React.createElement("pre", null, lines.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: i }, highlight(l, lang), l === "" ? " " : null))));
  }
  function Block({ b, topic }) {
    if (b.p) return /* @__PURE__ */ React.createElement("p", null, fmt(b.p));
    if (b.h) return /* @__PURE__ */ React.createElement("h3", null, fmt(b.h));
    if (b.mini) return /* @__PURE__ */ React.createElement(Mini, { topic, ...b.mini });
    if (b.code) return /* @__PURE__ */ React.createElement(CodeBlock, { code: b.code, title: b.title, lang: b.lang });
    if (b.tryit) {
      return /* @__PURE__ */ React.createElement("div", { className: "an-try" }, /* @__PURE__ */ React.createElement("div", { className: "lbl" }, "Try it"), b.tryit.note && /* @__PURE__ */ React.createElement("p", null, fmt(b.tryit.note)), /* @__PURE__ */ React.createElement(CodeBlock, { code: b.tryit.cmd, lang: "shell", title: "run this" }), b.tryit.out && /* @__PURE__ */ React.createElement(CodeBlock, { code: b.tryit.out, lang: b.tryit.outLang || "plain", title: "you should see" }));
    }
    if (b.callout) return /* @__PURE__ */ React.createElement("div", { className: "an-callout " + (b.callout.tone || "pull") }, b.callout.title && /* @__PURE__ */ React.createElement("div", { className: "lbl" }, b.callout.title), /* @__PURE__ */ React.createElement("div", null, fmt(b.callout.text)));
    if (b.list) return /* @__PURE__ */ React.createElement("ul", null, b.list.map((x, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(x))));
    if (b.steps) return /* @__PURE__ */ React.createElement("ol", null, b.steps.map((x, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(x))));
    if (b.table) {
      return /* @__PURE__ */ React.createElement("div", { className: "an-table" }, /* @__PURE__ */ React.createElement("table", null, b.table.head && /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, b.table.head.map((h, i) => /* @__PURE__ */ React.createElement("th", { key: i }, fmt(h))))), /* @__PURE__ */ React.createElement("tbody", null, b.table.rows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, r.map((c, j) => /* @__PURE__ */ React.createElement("td", { key: j }, fmt(c))))))));
    }
    return null;
  }
  function Quiz({ topic }) {
    const K = topic.id + ":quiz";
    const [ans, setAns] = React.useState(() => store.get(K, {}) || {});
    const qs = topic.quiz || [];
    const pick = (i, j) => {
      if (ans[i] != null) return;
      const n = { ...ans, [i]: j };
      setAns(n);
      store.set(K, n);
    };
    const answered = Object.keys(ans).length;
    const right = qs.filter((q, i) => ans[i] === q.answer).length;
    return /* @__PURE__ */ React.createElement("section", { className: "an-quiz", id: "quiz" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "num" }, "\u2713"), "Self-check"), /* @__PURE__ */ React.createElement("p", { className: "muted" }, "Pick an answer to see why it's right or wrong. Your score is saved."), qs.map((q, i) => {
      const a = ans[i];
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "q" + (a != null ? a === q.answer ? " ok" : " no" : "") }, /* @__PURE__ */ React.createElement("div", { className: "qt" }, /* @__PURE__ */ React.createElement("span", { className: "qn" }, i + 1), /* @__PURE__ */ React.createElement("span", null, fmt(q.q))), q.code && /* @__PURE__ */ React.createElement(CodeBlock, { code: q.code, lang: q.lang || "java" }), /* @__PURE__ */ React.createElement("div", { className: "opts" }, q.options.map((o, j) => {
        const cls = a == null ? "" : j === q.answer ? " correct" : j === a ? " wrong" : " dim";
        return /* @__PURE__ */ React.createElement("button", { key: j, className: "opt" + cls, onClick: () => pick(i, j) }, /* @__PURE__ */ React.createElement("span", { className: "ol" }, String.fromCharCode(65 + j)), /* @__PURE__ */ React.createElement("span", null, fmt(o)));
      })), a != null && /* @__PURE__ */ React.createElement("div", { className: "why" }, a === q.answer ? "\u2713 Correct. " : "\u2717 Not quite. ", fmt(q.why)));
    }), /* @__PURE__ */ React.createElement("div", { className: "score" }, /* @__PURE__ */ React.createElement("span", null, "Score: ", /* @__PURE__ */ React.createElement("b", null, right), " / ", qs.length, answered < qs.length ? ` \xB7 ${qs.length - answered} unanswered` : ""), answered > 0 && /* @__PURE__ */ React.createElement("button", { className: "an-ghost", onClick: () => {
      setAns({});
      store.set(K, {});
    } }, "Reset quiz")));
  }

  // src/engine/topic.jsx
  var REG = {};
  function registerTopic(def) {
    REG[def.id] = def;
    return def;
  }
  var getTopic = (id) => REG[id];
  function findInManifest(id) {
    const m = window.AN_MANIFEST || { parts: [] };
    for (const part of m.parts) {
      const i = part.topics.findIndex((t) => t.id === id);
      if (i >= 0) return { part, i, entry: part.topics[i] };
    }
    return null;
  }
  function TopicPage({ topic }) {
    const apiRef = React.useRef(null);
    const K = topic.id;
    const [learned, setLearned] = React.useState(store.get(K + ":learned", false));
    const [watchedN, setWatchedN] = React.useState(store.get(K + ":watched", []).length);
    const spans = React.useMemo(() => chapterSpans(topic.scenes), [topic]);
    const total = React.useMemo(() => deriveCues(topic.scenes).total, [topic]);
    const loc = findInManifest(K);
    React.useEffect(() => {
      store.set(K + ":meta", { chapters: spans.length, quiz: (topic.quiz || []).length, duration: total });
      document.title = `${topic.id} ${topic.title}`;
    }, []);
    const nav = (() => {
      if (!loc) return {};
      const ok = (t) => t && t.status === "ready";
      const prev = loc.part.topics[loc.i - 1], next = loc.part.topics[loc.i + 1];
      const href = (t) => `${t.id}-${t.slug}.html`;
      return { prev: ok(prev) ? { ...prev, href: href(prev) } : null, next: ok(next) ? { ...next, href: href(next) } : null };
    })();
    const watch = (ch) => {
      apiRef.current && apiRef.current.seekChapter(ch);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "an-page" }, /* @__PURE__ */ React.createElement("header", { className: "an-top" }, /* @__PURE__ */ React.createElement("a", { className: "back", href: "../index.html" }, "\u2190 All topics"), /* @__PURE__ */ React.createElement("div", { className: "crumb" }, topic.kicker), /* @__PURE__ */ React.createElement("div", { className: "grow" }), /* @__PURE__ */ React.createElement("span", { className: "muted small" }, fmtTime(total), " \xB7 ", watchedN, "/", spans.length, " chapters watched"), /* @__PURE__ */ React.createElement("button", { className: "an-learned" + (learned ? " on" : ""), onClick: () => {
      setLearned(!learned);
      store.set(K + ":learned", !learned);
    } }, learned ? "\u2713 Learned" : "Mark as learned")), /* @__PURE__ */ React.createElement("h1", { className: "an-h1" }, /* @__PURE__ */ React.createElement("span", { className: "id" }, topic.id), topic.title), topic.lede && /* @__PURE__ */ React.createElement("p", { className: "an-lede" }, fmt(topic.lede)), /* @__PURE__ */ React.createElement(TopicVideo, { topic, apiRef, onWatched: (s) => setWatchedN(s.size) }), /* @__PURE__ */ React.createElement("div", { className: "an-hint" }, "Space play/pause \xB7 \u2190 \u2192 5s \xB7 [ ] chapters \xB7 c captions \xB7 f fullscreen"), /* @__PURE__ */ React.createElement("nav", { className: "an-toc" }, (topic.notes || []).map((n) => /* @__PURE__ */ React.createElement("a", { key: n.ch, href: "#notes-ch" + n.ch }, /* @__PURE__ */ React.createElement("span", null, String(n.ch).padStart(2, "0")), n.title || topic.chapters[n.ch])), topic.traps && /* @__PURE__ */ React.createElement("a", { href: "#traps" }, /* @__PURE__ */ React.createElement("span", null, "\u26A0"), "Traps"), topic.recap && /* @__PURE__ */ React.createElement("a", { href: "#recap" }, /* @__PURE__ */ React.createElement("span", null, "\u2605"), "Recap"), topic.quiz && /* @__PURE__ */ React.createElement("a", { href: "#quiz" }, /* @__PURE__ */ React.createElement("span", null, "\u2713"), "Self-check")), /* @__PURE__ */ React.createElement("main", { className: "an-notes" }, (topic.notes || []).map((n) => /* @__PURE__ */ React.createElement("section", { key: n.ch, id: "notes-ch" + n.ch }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "num" }, String(n.ch).padStart(2, "0")), fmt(n.title || topic.chapters[n.ch]), /* @__PURE__ */ React.createElement("button", { className: "an-watch", onClick: () => watch(n.ch) }, "\u25B6 watch this chapter")), (n.blocks || []).map((b, i) => /* @__PURE__ */ React.createElement(Safe, { key: i }, /* @__PURE__ */ React.createElement(Block, { b, topic }))))), topic.traps && /* @__PURE__ */ React.createElement("section", { id: "traps", className: "an-traps" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "num" }, "\u26A0"), "Traps"), /* @__PURE__ */ React.createElement("ul", null, topic.traps.map((t, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(t))))), topic.recap && /* @__PURE__ */ React.createElement("section", { id: "recap", className: "an-recap" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "num" }, "\u2605"), "Recap"), /* @__PURE__ */ React.createElement("ol", null, topic.recap.map((t, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(t))))), topic.quiz && /* @__PURE__ */ React.createElement(Safe, null, /* @__PURE__ */ React.createElement(Quiz, { topic }))), /* @__PURE__ */ React.createElement("footer", { className: "an-foot" }, nav.prev ? /* @__PURE__ */ React.createElement("a", { href: nav.prev.href }, "\u2190 ", nav.prev.id, " ", nav.prev.title) : /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("a", { href: "../index.html" }, "All topics"), nav.next ? /* @__PURE__ */ React.createElement("a", { href: nav.next.href }, nav.next.id, " ", nav.next.title, " \u2192") : /* @__PURE__ */ React.createElement("span", null)));
  }
  function mountTopic(id) {
    const topic = REG[id];
    const root = ReactDOM.createRoot(document.getElementById("root"));
    if (!topic) {
      root.render(/* @__PURE__ */ React.createElement("div", { style: { padding: 40, color: "#f07a6a", font: "20px monospace" } }, "Topic ", id, " is not registered."));
      return;
    }
    const shot = new URLSearchParams(location.search).has("shot");
    if (shot) document.body.classList.add("an-shot");
    root.render(shot ? /* @__PURE__ */ React.createElement(TopicVideo, { topic }) : /* @__PURE__ */ React.createElement(TopicPage, { topic }));
  }

  // src/engine/hub.jsx
  function TopicCard({ part, t }) {
    const meta = store.get(t.id + ":meta", null);
    const watched = store.get(t.id + ":watched", []).length;
    const quiz = store.get(t.id + ":quiz", {}) || {};
    const answered = Object.keys(quiz).length;
    const learned = store.get(t.id + ":learned", false);
    const pos = store.get(t.id + ":pos", 0);
    const live = t.status === "ready";
    const pct = meta ? Math.round(watched / meta.chapters * 100) : 0;
    const inner = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "row1" }, /* @__PURE__ */ React.createElement("span", { className: "id" }, t.id), /* @__PURE__ */ React.createElement("span", { className: "pill " + t.status }, t.status === "ready" ? "Ready" : t.status === "building" ? "In progress" : "Planned"), learned && /* @__PURE__ */ React.createElement("span", { className: "pill learned" }, "\u2713 Learned")), /* @__PURE__ */ React.createElement("div", { className: "title" }, t.title), live && meta ? /* @__PURE__ */ React.createElement("div", { className: "prog" }, /* @__PURE__ */ React.createElement("div", { className: "bar" }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%" } })), /* @__PURE__ */ React.createElement("div", { className: "meta" }, /* @__PURE__ */ React.createElement("span", null, watched, "/", meta.chapters, " chapters"), /* @__PURE__ */ React.createElement("span", null, fmtTime(meta.duration)), answered > 0 && /* @__PURE__ */ React.createElement("span", null, "quiz ", answered, "/", meta.quiz), pos > 5 && pos < meta.duration - 3 && /* @__PURE__ */ React.createElement("span", { className: "cont" }, "continue at ", fmtTime(pos)))) : /* @__PURE__ */ React.createElement("div", { className: "prog" }, /* @__PURE__ */ React.createElement("div", { className: "meta" }, /* @__PURE__ */ React.createElement("span", null, live ? "Not started" : t.status === "building" ? "Being built now" : "Planned"))));
    return live ? /* @__PURE__ */ React.createElement("a", { className: "an-card" + (learned ? " learned" : ""), href: `${part.dir}/${t.id}-${t.slug}.html` }, inner) : /* @__PURE__ */ React.createElement("div", { className: "an-card planned" }, inner);
  }
  function Hub() {
    const m = window.AN_MANIFEST || { parts: [] };
    const all = m.parts.flatMap((p) => p.topics);
    const learnedN = all.filter((t) => store.get(t.id + ":learned", false)).length;
    const readyN = all.filter((t) => t.status === "ready").length;
    return /* @__PURE__ */ React.createElement("div", { className: "an-page an-hub" }, /* @__PURE__ */ React.createElement("h1", { className: "an-h1" }, m.title || "Animated notes"), /* @__PURE__ */ React.createElement("p", { className: "an-lede" }, "Watch each topic, then revise from its notes. Progress is saved in this browser."), /* @__PURE__ */ React.createElement("div", { className: "an-overall" }, /* @__PURE__ */ React.createElement("div", { className: "bar" }, /* @__PURE__ */ React.createElement("div", { style: { width: `${learnedN / Math.max(1, all.length) * 100}%` } })), /* @__PURE__ */ React.createElement("span", null, learnedN, " of ", all.length, " learned \xB7 ", readyN, " available")), m.parts.map((p) => /* @__PURE__ */ React.createElement("section", { key: p.id, className: "an-part" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "num" }, p.id), p.title), p.sub && /* @__PURE__ */ React.createElement("p", { className: "muted" }, p.sub), /* @__PURE__ */ React.createElement("div", { className: "an-grid" }, p.topics.map((t) => /* @__PURE__ */ React.createElement(TopicCard, { key: t.id, part: p, t }))))));
  }
  function mountHub() {
    ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Hub, null));
  }

  // src/engine/index.jsx
  window.AN = { ...kit_exports, ...timeline_exports, TopicVideo, StageBox, SceneLayer, fmtTime, Mini, CodeBlock, registerTopic, mountTopic, getTopic, mountHub };
})();
