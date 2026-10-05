(() => {
  // src/topics/8.3/common.jsx
  var { PAL, MOTION, track, pulse, hexA, toneColor, MONO, Txt, Box, clamp } = window.AN;
  var E = MOTION.enter;
  var USERS_SRC = [
    "record User(String name, int age) {}",
    "static User makeUser(String name) {",
    "    int age = 30;",
    "    User u = new User(name, age);",
    "    return u;",
    "}",
    "public static void main(String[] args) {",
    '    User ana = makeUser("Ana");',
    '    makeUser("Bob");        // result dropped',
    "    System.out.println(ana.name());",
    "}"
  ];
  function Tok({ t, keys, text, tone = "flow", from, until, w = 180, h = 46, fs = 20, glowAt, wKeys }) {
    if (wKeys) w = window.AN.track1(t, wKeys);
    const start = from == null ? keys[0][0] : from;
    if (t < start) return null;
    const [x, y] = track(t, keys);
    let a = E(t, start, 0.25);
    if (until != null) a *= 1 - E(t, until, 0.3);
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    const g = glowAt != null ? pulse(t, [glowAt], 1) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: 10, opacity: a, background: hexA(c, 0.16), border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", font: `600 ${fs}px ${MONO}`, color: PAL.ink, boxShadow: g > 0.01 ? `0 0 ${26 * g}px ${hexA(c, 0.7 * g)}` : "none", whiteSpace: "nowrap" } }, text);
  }
  function frameA(t, push, pop) {
    const ain = E(t, push, 0.5), aout = pop == null ? 0 : E(t, pop, 0.5);
    return { a: ain * (1 - aout), dy: (1 - ain) * -36 - aout * 36 };
  }
  function Frame({ t, x, y, w, h, title, right, push, pop, tone = "flow", children, glow = 0 }) {
    const { a, dy } = frameA(t, push, pop);
    if (a <= 0.01) return null;
    const c = toneColor(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y + dy, width: w, height: h, opacity: clamp(a, 0, 1), boxSizing: "border-box", borderRadius: 12, border: `2px solid ${hexA(c, glow > 0.01 ? 1 : 0.75)}`, background: hexA(c, 0.06), boxShadow: glow > 0.01 ? `0 0 ${28 * glow}px ${hexA(c, 0.5 * glow)}` : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 16, top: 8, font: `600 19px ${MONO}`, color: c, whiteSpace: "nowrap" } }, title), right && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: 16, top: 10, font: `400 17px ${MONO}`, color: PAL.ink3, whiteSpace: "nowrap" } }, right), children);
  }
  function Slot({ x, y, w = 150, h = 72, idx, name, value, tone = "flow", a = 1, glow = 0, fs = 20 }) {
    if (a <= 5e-3) return null;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt, { x: x + w / 2, y: y - 26, anchor: "mid", mono: true, fs: 16, color: PAL.ink3, a }, `slot ${idx}`), /* @__PURE__ */ React.createElement(Box, { x, y, w, h, label: value, sub: name, tone, a, glow, fs, sfs: 17 }));
  }
  function Gauge({ x, y, w, h, frac, tone = "violet", a = 1, label, capLabel, glow = 0 }) {
    if (a <= 5e-3) return null;
    const c = toneColor(tone);
    const f = clamp(frac, 0, 1);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: w, height: h, opacity: clamp(a, 0, 1), boxSizing: "border-box", border: `2px solid ${hexA(c, 0.7)}`, borderRadius: 10, background: PAL.panel2, overflow: "hidden", boxShadow: glow > 0.01 ? `0 0 ${30 * glow}px ${hexA(c, 0.6 * glow)}` : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 0, height: `${f * 100}%`, background: `linear-gradient(0deg, ${hexA(c, 0.55)}, ${hexA(c, 0.25)})` } }), capLabel && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 0, height: 3, background: PAL.bad } }), label && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", font: `600 18px ${MONO}`, color: PAL.ink } }, label));
  }
  function RealTag({ x, y, a = 1, text = "real output \xB7 JDK 17" }) {
    if (a <= 0.01) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, opacity: a, font: `600 16px ${MONO}`, color: PAL.ink3, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" } }, text);
  }

  // src/topics/8.3/scenes1.jsx
  var {
    PAL: PAL2,
    MOTION: MOTION2,
    lin,
    lerp,
    win,
    pulse: pulse2,
    step,
    track: track2,
    hlAt,
    clamp: clamp2,
    hexA: hexA2,
    MONO: MONO2,
    SANS,
    Txt: Txt2,
    Panel,
    Box: Box2,
    Code,
    Console,
    HArrow,
    VArrow,
    Arrow,
    Dot,
    Card,
    Node,
    Badge,
    Callout,
    Table,
    Mark,
    Val,
    Brace,
    toneColor: toneColor2
  } = window.AN;
  var E2 = MOTION2.enter;
  var M = MOTION2.move;
  var POP = MOTION2.pop;
  function SIntro({ t }) {
    const Y = 480;
    const lines = USERS_SRC.slice(1);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 150, mono: true, fs: 22, weight: 600, color: PAL2.pull, a: E2(t, 0.3), style: { letterSpacing: "0.14em" } }, "PART 08 \xB7 THE JVM \xB7 8.3"), /* @__PURE__ */ React.createElement(Txt2, { x: 92, y: 192, fs: 118, weight: 700, lh: 1, a: E2(t, 0.6, 0.9), style: { letterSpacing: "-0.03em", transform: `translateY(${(1 - E2(t, 0.6, 0.9)) * 24}px)` } }, "Runtime memory areas"), /* @__PURE__ */ React.createElement(Txt2, { x: 96, y: 338, fs: 36, color: PAL2.ink2, a: E2(t, 1.4, 0.8) }, "Where your objects, your variables and your classes actually live."), /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 96,
        y: Y,
        w: 620,
        h: 365,
        fs: 17,
        lh: 27,
        title: "Users.java",
        a: E2(t, 2),
        lines,
        hl: 6,
        hlA: win(t, 6, 16)
      }
    ), /* @__PURE__ */ React.createElement(Txt2, { x: 406, y: Y + 380, anchor: "mid", fs: 20, color: PAL2.ink2, a: E2(t, 22) }, "the running example"), /* @__PURE__ */ React.createElement(Panel, { x: 760, y: Y, w: 330, h: 365, title: "stack", right: "per thread", tone: "flow", a: E2(t, 2.6) }), /* @__PURE__ */ React.createElement(Box2, { x: 782, y: Y + 200, w: 286, h: 64, label: "makeUser", sub: "name \xB7 age \xB7 u", tone: "flow", a: win(t, 7, 11.5), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 782, y: Y + 276, w: 286, h: 64, label: "main", sub: "args \xB7 ana", tone: "flow", a: E2(t, 6.4), fs: 19, sfs: 17, glow: pulse2(t, [9], 1.2) }), /* @__PURE__ */ React.createElement(Panel, { x: 1130, y: Y, w: 420, h: 365, title: "heap", right: "shared", tone: "pull", a: E2(t, 3) }), /* @__PURE__ */ React.createElement(Node, { x: 1160, y: Y + 70, w: 360, h: 110, kind: "Users$User", rows: [["name", '"Ana"'], ["age", "30"]], tone: "pull", a: E2(t, 8) }), /* @__PURE__ */ React.createElement(Box2, { x: 1160, y: Y + 220, w: 360, h: 90, label: 'User "Bob"', sub: "nothing points here", tone: "bad", dashed: true, a: E2(t, 10.5), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1070, Y + 308], [1110, Y + 308], [1110, Y + 125], [1156, Y + 125]], draw: M(t, 9, 0.7), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Panel, { x: 1590, y: Y, w: 234, h: 365, title: "metaspace", tone: "violet", a: E2(t, 3.4) }), /* @__PURE__ */ React.createElement(Box2, { x: 1610, y: Y + 70, w: 194, h: 90, label: "class User", sub: "Klass", tone: "violet", a: E2(t, 13), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 1610, y: Y + 176, w: 194, h: 70, label: "bytecode", tone: "violet", a: E2(t, 13.5), fs: 18 }), /* @__PURE__ */ React.createElement(Box2, { x: 1610, y: Y + 262, w: 194, h: 70, label: "constants", tone: "violet", a: E2(t, 14), fs: 18 }), /* @__PURE__ */ React.createElement(Badge, { x: 925, y: Y + 400, text: "StackOverflowError", tone: "bad", a: POP(t, 17.2), fs: 17 }), /* @__PURE__ */ React.createElement(Badge, { x: 1340, y: Y + 400, text: "OOM: Java heap space", tone: "bad", a: POP(t, 17.8), fs: 17 }), /* @__PURE__ */ React.createElement(Badge, { x: 1707, y: Y + 400, text: "OOM: Metaspace", tone: "bad", a: POP(t, 18.4), fs: 17 }));
  }
  var MK_PCS = [0, 2, 3, 6, 7, 8, 9, 12, 13];
  function SProcessMap({ t }) {
    const cols = [{ x: 126, name: "main", who: '"Ana"', ph: 0 }, { x: 496, name: "worker", who: '"Bob"', ph: 4 }];
    const merged = M(t, 26, 1);
    const pcOf = (ph) => t < 12 ? 0 : MK_PCS[(Math.floor((t - 12) / 0.9) + ph) % MK_PCS.length];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 190, w: 1728, h: 740, title: "one JVM = one OS process", right: "java TwoThreads", a: E2(t, 0.4) }), /* @__PURE__ */ React.createElement(Txt2, { x: 126, y: 252, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 2.5) }, "PER THREAD"), /* @__PURE__ */ React.createElement(Txt2, { x: 880, y: 252, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 3) }, "SHARED BY ALL THREADS"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 862, top: 250, width: 2, height: 650, background: PAL2.line2, opacity: E2(t, 3) } }), cols.map((c, i) => {
      const a0 = E2(t, 6.4 + i * 0.5);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: c.name }, /* @__PURE__ */ React.createElement(Txt2, { x: c.x + 170, y: 282, anchor: "mid", mono: true, fs: 20, weight: 600, color: PAL2.flow, a: a0 }, `thread ${c.name}`), /* @__PURE__ */ React.createElement(Box2, { x: c.x, y: 320, w: 340, h: 64, label: `pc = ${pcOf(c.ph)}`, sub: "PC register", tone: "flow", a: E2(t, 12 + i * 0.4), fs: 22, sfs: 17, glow: win(t, 12, 19) * 0.5 }), /* @__PURE__ */ React.createElement(Panel, { x: c.x, y: 404, w: 340, h: 330, title: "JVM stack", tone: "flow", a: E2(t, 19 + i * 0.4) }), i === 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box2, { x: c.x + 16, y: 470, w: 308, h: 118, label: 'makeUser("Ana")', sub: "name \xB7 age=30 \xB7 u", tone: "flow", a: E2(t, 20), fs: 19, sfs: 17, align: "left" }), /* @__PURE__ */ React.createElement(Box2, { x: c.x + 16, y: 600, w: 308, h: 110, label: "main", sub: "args \xB7 ana", tone: "flow", a: E2(t, 19.6), fs: 19, sfs: 17, align: "left" })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box2, { x: c.x + 16, y: 470, w: 308, h: 118, label: 'makeUser("Bob")', sub: "name \xB7 age=30 \xB7 u", tone: "flow", a: E2(t, 20.4), fs: 19, sfs: 17, align: "left" }), /* @__PURE__ */ React.createElement(Box2, { x: c.x + 16, y: 600, w: 308, h: 50, label: "lambda$main$0", tone: "flow", a: E2(t, 20.2), fs: 17, align: "left" }), /* @__PURE__ */ React.createElement(Box2, { x: c.x + 16, y: 660, w: 308, h: 50, label: "Thread.run", tone: "flow", a: E2(t, 20), fs: 17, align: "left" })), /* @__PURE__ */ React.createElement(Box2, { x: c.x, y: lerp(756, 738, merged), w: 340, h: 70, label: "native method stack", sub: merged > 0.5 ? "same OS stack in HotSpot" : "JVM spec", tone: "pink", dashed: merged < 0.5, a: E2(t, 26), fs: 17, sfs: 17 }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: c.x - 8, top: 400, width: 356, height: 424, borderRadius: 16, border: `2px dashed ${PAL2.ink2}`, opacity: E2(t, 27.2) * 0.8, boxSizing: "border-box" } }), /* @__PURE__ */ React.createElement(Txt2, { x: c.x + 170, y: 840, anchor: "mid", mono: true, fs: 17, color: PAL2.ink2, a: E2(t, 27.4) }, "one OS thread stack \xB7 2 MB"));
    }), /* @__PURE__ */ React.createElement(Panel, { x: 880, y: 280, w: 914, h: 330, title: "heap", tone: "pull", a: E2(t, 32.5), glow: win(t, 33, 39) * 0.6 }), /* @__PURE__ */ React.createElement(Node, { x: 930, y: 360, w: 320, h: 120, kind: "Users$User", name: '"Ana"', rows: [["age", "30"]], tone: "pull", a: POP(t, 33.4), glow: pulse2(t, [52], 1.4) }), /* @__PURE__ */ React.createElement(Node, { x: 1300, y: 360, w: 320, h: 120, kind: "Users$User", name: '"Bob"', rows: [["age", "30"]], tone: "pull", a: POP(t, 34) }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[466, 530], [481, 530], [481, 393], [926, 393]], draw: M(t, 34.4, 0.9), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[836, 545], [858, 545], [858, 560], [1460, 560], [1460, 484]], draw: M(t, 35, 0.9), color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[836, 505], [900, 505], [900, 450], [926, 450]], draw: M(t, 51.5, 0.8), color: PAL2.pull, dashed: true }), /* @__PURE__ */ React.createElement(Badge, { x: 1110, y: 520, text: "worker \u2192 Ana too", tone: "pull", a: E2(t, 52.4), fs: 17 }), /* @__PURE__ */ React.createElement(Panel, { x: 880, y: 640, w: 440, h: 200, title: "metaspace", tone: "violet", a: E2(t, 39.5), glow: win(t, 40, 45.5) * 0.6 }), /* @__PURE__ */ React.createElement(Box2, { x: 904, y: 704, w: 392, h: 84, label: "Users$User", sub: "Klass \xB7 methods \xB7 constant pool", tone: "violet", a: E2(t, 40), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Txt2, { x: 1100, y: 800, anchor: "mid", mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 41) }, "loaded once, used by every thread"), /* @__PURE__ */ React.createElement(Panel, { x: 1354, y: 640, w: 440, h: 200, title: "code cache", tone: "blue", a: E2(t, 45.5), glow: win(t, 46, 51) * 0.6 }), /* @__PURE__ */ React.createElement(Box2, { x: 1378, y: 704, w: 392, h: 84, label: "makeUser \u2192 machine code", sub: "once the JIT compiles it (8.8)", tone: "blue", a: E2(t, 46), fs: 19, sfs: 17 }), /* @__PURE__ */ React.createElement(Callout, { x: 880, y: 862, w: 914, tone: "flow", a: E2(t, 56), fs: 19, text: "**Private stacks, shared heap.** That split explains pass-by-value, and why threads can race on one object (Part 09)." }));
  }
  var NMT = [
    // label, reserved KB, committed KB, tone, at, note
    ["Java Heap", 2097152, 133120, "pull", 11, "2 GB reserved \xB7 130 MB committed"],
    ["Class (metaspace)", 1048672, 224, "violet", 19, "1 GB reserved \xB7 224 KB committed"],
    ["Thread \xB7 19 threads", 39187, 39187, "flow", 27, "38 MB: about 2 MB of stack each"],
    ["Code (code cache)", 247747, 7635, "blue", 35, "242 MB reserved \xB7 7.5 MB committed"],
    ["GC (bookkeeping)", 128172, 55324, "ink", 35.6, "125 MB reserved \xB7 54 MB committed"]
  ];
  function SNmt({ t }) {
    const X0 = 940, W = 860, S = W / 2097152;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Console, { x: 96, y: 190, w: 800, h: 560, t, a: E2(t, 0.4), fs: 17, lh: 27, title: "terminal \xB7 output condensed", items: [
      { at: 5.5, text: "java -XX:NativeMemoryTracking=summary Live &", kind: "cmd" },
      { at: 6.5, text: "jcmd 874 VM.native_memory summary", kind: "cmd" },
      { at: 7.5, text: "Total: reserved=3646439KB, committed=251495KB" },
      { at: 11, text: "-  Java Heap (reserved=2097152KB, committed=133120KB)", kind: t >= 11 && t < 19 ? "ok" : void 0 },
      { at: 19, text: "-      Class (reserved=1048672KB, committed=224KB)", kind: t >= 19 && t < 27 ? "ok" : void 0 },
      { at: 19.2, text: "             (classes #668)", kind: "dim" },
      { at: 27, text: "-     Thread (reserved=39187KB, committed=39187KB)", kind: t >= 27 && t < 35 ? "ok" : void 0 },
      { at: 27.2, text: "             (thread #19)", kind: "dim" },
      { at: 35, text: "-       Code (reserved=247747KB, committed=7635KB)", kind: t >= 35 ? "ok" : void 0 },
      { at: 35.6, text: "-         GC (reserved=128172KB, committed=55324KB)" },
      { at: 36, text: "-  Shared class space (reserved=16384KB, committed=12032KB)", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 96, y: 766, a: E2(t, 7.5), text: "real output \xB7 JDK 17 \xB7 macOS arm64 \xB7 8 GB" }), /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: 196, mono: true, fs: 17, color: PAL2.ink3, a: E2(t, 1.5) }, "RESERVED (outline) vs COMMITTED (filled)"), NMT.map(([label, res, com, tone, at, note], i) => {
      const y = 240 + i * 132, a = E2(t, at), c = toneColor2(tone);
      const rw = Math.max(6, res * S * M(t, at, 1)), cw = Math.max(3, com * S * M(t, at + 0.6, 1));
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: label }, /* @__PURE__ */ React.createElement(Txt2, { x: X0, y, fs: 22, weight: 600, color: PAL2.ink, a: Math.max(E2(t, 1.5 + i * 0.2) * 0.45, a) }, label), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X0, top: y + 38, width: rw, height: 40, opacity: a, boxSizing: "border-box", border: `2px dashed ${hexA2(c, 0.8)}`, borderRadius: 6 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X0, top: y + 38, width: cw, height: 40, opacity: a, background: hexA2(c, 0.75), borderRadius: 6 } }), /* @__PURE__ */ React.createElement(Txt2, { x: X0, y: y + 88, mono: true, fs: 17, color: c, a: E2(t, at + 0.8) }, note));
    }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 810, w: 800, tone: "pull", a: E2(t, 37), fs: 19, text: "**Reserve big, commit as needed.** Reserved is address space; committed is real memory." }));
  }
  var MAIN_BC = [' 0: ldc           #12  // "Ana"', " 2: invokestatic  #14  // makeUser", " 5: astore_1           // ana", ' 6: ldc           #20  // "Bob"', " 8: invokestatic  #14  // makeUser", "11: pop                // dropped!"];
  function SFrames({ t }) {
    const [hl, hA] = hlAt(t, [[4.5, 6], [9.5, 7], [12, 1], [17, 2], [22, 3], [30, 4], [34, 7], [43, 8], [45.5, 3], [48.5, 4], [50, 8], [63.5, 9], [67, 10], [70, -1]]);
    const [bh, bA] = hlAt(t, [[9.5, 0], [11, 1], [34, 2], [43, 3], [44, 4], [50, 5], [63.5, -1]]);
    const MF = { x: 800, y: 740, w: 480, h: 170 }, KF = { x: 800, y: 450, w: 480, h: 260 };
    const ana = frameA(t, 9.6, 31), bob = frameA(t, 43.6, 51.2), mainF = frameA(t, 4.5, 67);
    const bobDead = t >= 51.5, anaDead = t >= 67.6;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code, { x: 96, y: 190, w: 640, h: 420, title: "Users.java", a: E2(t, 0.4), fs: 19, lh: 32, hl, hlA: hA, lines: USERS_SRC }), /* @__PURE__ */ React.createElement(Code, { x: 96, y: 630, w: 640, h: 260, title: "javap -c Users \xB7 main", lang: "bytecode", a: E2(t, 1), fs: 18, lh: 32, hl: bh, hlA: bA, lines: MAIN_BC }), /* @__PURE__ */ React.createElement(Panel, { x: 780, y: 190, w: 520, h: 740, title: "stack \xB7 thread main", tone: "flow", a: E2(t, 0.6) }), /* @__PURE__ */ React.createElement(Frame, { t, ...MF, title: "main", right: "max_locals 2", push: 4.5, pop: 67 }, /* @__PURE__ */ React.createElement(Slot, { x: 20, y: 70, w: 200, idx: 0, name: "args", value: "String[]", tone: "ink" }), /* @__PURE__ */ React.createElement(Slot, { x: 260, y: 70, w: 200, idx: 1, name: "ana", value: t >= 31.6 ? "\u2192 User" : "", tone: "flow", glow: pulse2(t, [31.6], 1.2) })), /* @__PURE__ */ React.createElement(Frame, { t, ...KF, title: 'makeUser("Ana")', right: "max_locals 3", push: 9.6, pop: 31 }, /* @__PURE__ */ React.createElement(Slot, { x: 20, y: 80, w: 140, idx: 0, name: "name", value: '\u2192 "Ana"', fs: 18 }), /* @__PURE__ */ React.createElement(Slot, { x: 175, y: 80, w: 140, idx: 1, name: "age", value: t >= 17.4 ? "30" : "", tone: "pull", glow: pulse2(t, [17.4], 1.2) }), /* @__PURE__ */ React.createElement(Slot, { x: 330, y: 80, w: 130, idx: 2, name: "u", value: t >= 24 ? "\u2192 User" : "", fs: 18, glow: pulse2(t, [24], 1.2) }), /* @__PURE__ */ React.createElement(Txt2, { x: 20, y: 196, mono: true, fs: 17, color: PAL2.ink3 }, "primitives by value \xB7 objects by reference")), /* @__PURE__ */ React.createElement(Frame, { t, ...KF, title: 'makeUser("Bob")', right: "max_locals 3", push: 43.6, pop: 51.2 }, /* @__PURE__ */ React.createElement(Slot, { x: 20, y: 80, w: 140, idx: 0, name: "name", value: '\u2192 "Bob"', fs: 18 }), /* @__PURE__ */ React.createElement(Slot, { x: 175, y: 80, w: 140, idx: 1, name: "age", value: t >= 45 ? "30" : "", tone: "pull" }), /* @__PURE__ */ React.createElement(Slot, { x: 330, y: 80, w: 130, idx: 2, name: "u", value: t >= 47.6 ? "\u2192 User" : "", fs: 18 })), /* @__PURE__ */ React.createElement(Tok, { t, text: "\u2192 User", keys: [[30.2, 1195, 570], [31.4, 1160, 850]], until: 31.5, w: 130, h: 56, fs: 18 }), /* @__PURE__ */ React.createElement(Tok, { t, text: "\u2192 User", keys: [[49.6, 1195, 570], [50.6, 1040, 690]], until: 50.9, w: 130, h: 56, fs: 18, tone: "bad" }), /* @__PURE__ */ React.createElement(Badge, { x: 1040, y: 300, text: "stdout: Ana", tone: "flow", a: E2(t, 64.5), fs: 20 }), /* @__PURE__ */ React.createElement(Callout, { x: 800, y: 380, w: 480, tone: "flow", a: E2(t, 69), fs: 20, text: "**Stack**: freed instantly, just by popping frames." }), /* @__PURE__ */ React.createElement(Callout, { x: 800, y: 500, w: 480, tone: "pull", a: E2(t, 70.5), fs: 20, text: "**Heap**: objects stay until the GC finds them unreachable." }), /* @__PURE__ */ React.createElement(Panel, { x: 1350, y: 190, w: 474, h: 740, title: "heap \xB7 shared", tone: "pull", a: E2(t, 0.8) }), /* @__PURE__ */ React.createElement(Box2, { x: 1380, y: 260, w: 170, h: 64, label: '"Ana"', sub: "String", tone: "pink", a: E2(t, 9.5), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Node, { x: 1380, y: 350, w: 420, h: 130, kind: "Users$User \xB7 24 bytes", rows: [["name", '\u2192 "Ana"'], ["age", "30"]], tone: anaDead ? "dim" : "pull", a: POP(t, 22.6), glow: pulse2(t, [22.6], 1.2) }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1802, 410], [1814, 410], [1814, 292], [1556, 292]], draw: M(t, 23.4, 0.6), color: PAL2.pink }), /* @__PURE__ */ React.createElement(Box2, { x: 1380, y: 560, w: 170, h: 64, label: '"Bob"', sub: "String", tone: "pink", a: E2(t, 43.4), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Node, { x: 1380, y: 650, w: 420, h: 130, kind: "Users$User \xB7 24 bytes", rows: [["name", '\u2192 "Bob"'], ["age", "30"]], tone: "pull", bad: bobDead, a: POP(t, 46.8), shake: t > 51.5 && t < 52.3 ? Math.sin(t * 60) * 5 : 0 }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1802, 710], [1814, 710], [1814, 592], [1556, 592]], draw: M(t, 47.4, 0.6), color: PAL2.pink }), /* @__PURE__ */ React.createElement(Badge, { x: 1590, y: 812, text: "unreachable \xB7 garbage", tone: "bad", a: E2(t, 56), fs: 17 }), /* @__PURE__ */ React.createElement(Badge, { x: 1590, y: 510, text: "unreachable once main returns", tone: "dim", a: E2(t, 68), fs: 17 }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1262, 570], [1310, 570], [1310, 415], [1376, 415]], draw: M(t, 24.2, 0.7), a: ana.a, color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1262, 850], [1325, 850], [1325, 440], [1376, 440]], draw: M(t, 31.8, 0.8), a: mainF.a, color: PAL2.flow }), /* @__PURE__ */ React.createElement(Arrow, { pts: [[1262, 570], [1310, 570], [1310, 715], [1376, 715]], draw: M(t, 47.8, 0.7), a: bob.a, color: PAL2.flow }));
  }
  function SFrameAnatomy({ t }) {
    const nat = t >= 38.5 ? "ok" : void 0;
    const ops = [["\u2192 User", "flow", "new"], ["\u2192 User", "flow", "dup"], ['\u2192 "Ana"', "pink", "aload_0"], ["30", "pull", "iload_1"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel, { x: 96, y: 190, w: 800, h: 560, title: 'frame \xB7 makeUser("Ana")', tone: "flow", a: E2(t, 0.4) }), /* @__PURE__ */ React.createElement(Txt2, { x: 126, y: 252, mono: true, fs: 17, color: PAL2.flow, a: E2(t, 4) }, "1 \xB7 LOCAL VARIABLES"), /* @__PURE__ */ React.createElement(Slot, { x: 126, y: 316, w: 220, idx: 0, name: "name", value: '\u2192 "Ana"', a: E2(t, 4.4) }), /* @__PURE__ */ React.createElement(Slot, { x: 366, y: 316, w: 220, idx: 1, name: "age", value: "30", tone: "pull", a: E2(t, 4.8) }), /* @__PURE__ */ React.createElement(Slot, { x: 606, y: 316, w: 250, idx: 2, name: "u", value: "(not yet)", tone: "ink", a: E2(t, 5.2) }), /* @__PURE__ */ React.createElement(Txt2, { x: 126, y: 418, mono: true, fs: 17, color: PAL2.pull, a: E2(t, 10.5) }, "2 \xB7 OPERAND STACK  ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL2.ink3 } }, "bottom \u2192 top")), ops.map(([v, tone, op], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box2, { x: 126 + i * 184, y: 456, w: 168, h: 58, label: v, tone, a: E2(t, 11 + i * 0.8), fs: 19, glow: pulse2(t, [11 + i * 0.8], 1) }), /* @__PURE__ */ React.createElement(Txt2, { x: 210 + i * 184, y: 522, anchor: "mid", mono: true, fs: 16, color: PAL2.ink3, a: E2(t, 11.2 + i * 0.8) }, `after ${op}`))), /* @__PURE__ */ React.createElement(Txt2, { x: 126, y: 572, mono: true, fs: 17, color: PAL2.violet, a: E2(t, 17.5) }, "3 \xB7 FRAME DATA"), /* @__PURE__ */ React.createElement(Box2, { x: 126, y: 608, w: 350, h: 84, label: "return address", sub: "back to main, pc 5", tone: "violet", a: E2(t, 18), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Box2, { x: 496, y: 608, w: 370, h: 84, label: "constant pool link", sub: "\u2192 Users, in metaspace", tone: "violet", a: E2(t, 18.6), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Callout, { x: 96, y: 780, w: 800, tone: "pull", a: E2(t, 24), fs: 20, text: "Size fixed before the call: `max_locals = 3`, `max_stack = 4`, straight from the class file (8.1)." }), /* @__PURE__ */ React.createElement(
      Code,
      {
        x: 940,
        y: 190,
        w: 884,
        h: 428,
        title: "javap -c Users \xB7 makeUser",
        lang: "bytecode",
        a: win(t, 0.8, 29.6),
        fs: 20,
        lh: 36,
        hl: hlAt(t, [[11, 2], [11.8, 3], [12.6, 4], [13.4, 5], [24, -1]])[0],
        hlA: hlAt(t, [[11, 2], [11.8, 3], [12.6, 4], [13.4, 5], [24, -1]])[1],
        lines: [
          " 0: bipush        30",
          " 2: istore_1                 // age = 30",
          " 3: new           #7   // class Users$User",
          " 6: dup",
          " 7: aload_0                  // name",
          " 8: iload_1                  // age",
          " 9: invokespecial #9   // User.<init>   \u2190 next",
          "12: astore_2                 // u",
          "13: aload_2",
          "14: areturn"
        ]
      }
    ), /* @__PURE__ */ React.createElement(Callout, { x: 940, y: 640, w: 884, tone: "pull", a: win(t, 14, 29.6), fs: 19, text: "`<init>` will pop all four. The leftover `dup` copy is then stored in `u` by `astore_2`." }), /* @__PURE__ */ React.createElement(Console, { x: 940, y: 190, w: 884, h: 560, t, a: E2(t, 30), fs: 17, lh: 27, title: "terminal", items: [
      { at: 30.4, text: "jcmd <pid> Thread.print", kind: "cmd" },
      { at: 31, text: '"main" #1 prio=5 os_prio=31 \u2026 [0x000000016fa46000]' },
      { at: 31.2, text: "   java.lang.Thread.State: TIMED_WAITING (sleeping)", kind: "dim" },
      { at: 31.4, text: "    at java.lang.Thread.sleep(java.base@17.0.17/Native Method)", kind: nat },
      { at: 31.6, text: "    at TwoThreads.makeUser(TwoThreads.java:7)" },
      { at: 31.8, text: "    at TwoThreads.main(TwoThreads.java:16)" },
      { at: 32.4, text: '"worker" #14 prio=5 os_prio=31 \u2026 [0x0000000172036000]' },
      { at: 32.6, text: "   java.lang.Thread.State: TIMED_WAITING (sleeping)", kind: "dim" },
      { at: 32.8, text: "    at java.lang.Thread.sleep(java.base@17.0.17/Native Method)", kind: nat },
      { at: 33, text: "    at TwoThreads.makeUser(TwoThreads.java:7)" },
      { at: 33.2, text: "    at TwoThreads.lambda$main$0(TwoThreads.java:13)" },
      { at: 33.4, text: "    at TwoThreads$$Lambda$1/0x0000007001000a08.run(Unknown Source)" },
      { at: 33.6, text: "    at java.lang.Thread.run(java.base@17.0.17/Thread.java:840)" }
    ] }), /* @__PURE__ */ React.createElement(Callout, { x: 940, y: 780, w: 884, tone: t >= 38.5 ? "pink" : "flow", a: E2(t, 34), fs: 19, text: t >= 38.5 ? "Top frame: `Thread.sleep` is a **native** method. Its frame sits on the same OS thread stack, above the Java frames." : "TwoThreads.java: `makeUser` with a `Thread.sleep` inside, called by `main` and by a `worker` thread. Two stacks, two addresses." }));
  }

  // src/topics/8.3/scenes2.jsx
  var {
    PAL: PAL3,
    MOTION: MOTION3,
    lin: lin2,
    lerp: lerp2,
    win: win2,
    pulse: pulse3,
    step: step2,
    track: track3,
    hlAt: hlAt2,
    clamp: clamp3,
    hexA: hexA3,
    MONO: MONO3,
    SANS: SANS2,
    Txt: Txt3,
    Panel: Panel2,
    Box: Box3,
    Code: Code2,
    Console: Console2,
    HArrow: HArrow2,
    VArrow: VArrow2,
    Arrow: Arrow2,
    Dot: Dot2,
    Card: Card2,
    Node: Node2,
    Badge: Badge2,
    Callout: Callout2,
    Table: Table2,
    Mark: Mark2,
    Val: Val2,
    Brace: Brace2,
    toneColor: toneColor3
  } = window.AN;
  var E3 = MOTION3.enter;
  var M2 = MOTION3.move;
  var POP2 = MOTION3.pop;
  var fmtN = (n) => Math.round(n).toLocaleString("en-US");
  var XSS = [["-Xss256k", "1,479"], ["-Xss512k", "4,210"], ["-Xss1m", "9,671"], ["-Xss2m  (default here)", "20,594"], ["-Xss4m", "42,439"]];
  function SOverflow({ t }) {
    const BX = 870, BW = 320, TOP = 340, BOT = 910;
    const fill = lin2(t, 16, 6.2);
    const hitT = 22.3;
    const depth = t < 6 ? 0 : t < 16 ? Math.min(4, 1 + Math.floor((t - 6) / 2)) : Math.round(lerp2(4, 20594, fill));
    const hit = t >= hitT;
    const shake = t > hitT && t < hitT + 0.8 ? Math.sin(t * 70) * 6 : 0;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 190, w: 720, h: 368, title: "Deep.java", a: E3(t, 0.4), fs: 18, lh: 30, hl: 2, hlA: win2(t, 5, 16), lines: [
      "public class Deep {",
      "    static int depth = 0;",
      "    static void down() { depth++; down(); }",
      "    public static void main(String[] args) {",
      "        try { down(); }",
      "        catch (StackOverflowError e) {",
      '            System.out.println("depth = " + depth);',
      "        }",
      "    }",
      "}"
    ] }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 590, w: 720, h: 340, t, a: E3(t, 22.5), fs: 17, lh: 28, items: [
      { at: 23, text: "java -Xint Deep", kind: "cmd" },
      { at: 23.6, text: "depth = 20594", kind: "ok" },
      { at: 45.5, text: "java Boom", kind: "cmd" },
      { at: 46.1, text: 'Exception in thread "main" java.lang.StackOverflowError', kind: "err" },
      { at: 46.4, text: "    at Boom.count(Boom.java:2)" },
      { at: 46.6, text: "    at Boom.count(Boom.java:2)" },
      { at: 46.8, text: "    at Boom.count(Boom.java:2)" },
      { at: 47.4, text: '    \u2026 1,024 "at" lines in all, then it stops', kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: shake, top: 0 } }, /* @__PURE__ */ React.createElement(Panel2, { x: BX, y: 190, w: BW, h: 740, title: "main's stack", right: "2 MB", tone: hit ? "bad" : "flow", a: E3(t, 3), glow: Math.max(pulse3(t, [hitT], 1.5), pulse3(t, [10.6], 1.2)) }), /* @__PURE__ */ React.createElement(Txt3, { x: BX + BW / 2, y: 250, anchor: "mid", mono: true, fs: 24, weight: 600, color: hit ? PAL3.bad : PAL3.ink, a: E3(t, 5) }, `depth ${fmtN(depth)}`), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: BX + 16, top: 290, width: BW - 32, height: 44, opacity: E3(t, 22), borderRadius: 8, background: `repeating-linear-gradient(45deg, ${hexA3(PAL3.pull, 0.5)} 0 8px, ${hexA3(PAL3.bad, 0.35)} 8px 16px)`, border: `2px solid ${hit ? PAL3.bad : PAL3.pull}` } }), /* @__PURE__ */ React.createElement(Txt3, { x: BX + BW / 2, y: 301, anchor: "mid", mono: true, fs: 17, weight: 600, color: PAL3.ink, a: E3(t, 22) }, "guard pages"), /* @__PURE__ */ React.createElement(Box3, { x: BX + 16, y: BOT - 54, w: BW - 32, h: 46, label: "main", tone: "flow", a: E3(t, 4) * (1 - E3(t, 16, 0.4)), fs: 18 }), [0, 1, 2, 3].map((k) => /* @__PURE__ */ React.createElement(Box3, { key: k, x: BX + 16, y: BOT - 108 - k * 54, w: BW - 32, h: 46, label: "down()", tone: "flow", a: E3(t, 6 + k * 2) * (1 - E3(t, 16, 0.4)), fs: 18 })), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: BX + 16, top: BOT - (BOT - TOP) * fill, width: BW - 32, height: (BOT - TOP) * fill, opacity: E3(t, 16, 0.3), borderRadius: 8, background: `repeating-linear-gradient(0deg, ${hexA3(PAL3.flow, 0.45)} 0 4px, ${hexA3(PAL3.flow, 0.12)} 4px 7px)`, border: `2px solid ${hexA3(PAL3.flow, 0.7)}`, boxSizing: "border-box" } }), /* @__PURE__ */ React.createElement(Badge2, { x: BX + BW / 2, y: 376, text: "StackOverflowError", tone: "bad", solid: true, a: POP2(t, hitT), fs: 18 }), /* @__PURE__ */ React.createElement(Txt3, { x: BX + BW / 2, y: 600, anchor: "mid", mono: true, fs: 17, color: PAL3.ink, a: win2(t, 16.5, 22) }, "~100 bytes per frame")), /* @__PURE__ */ React.createElement(
      Table2,
      {
        x: 1230,
        y: 214,
        cols: [340, 254],
        head: ["stack size", "depth (-Xint)"],
        rows: XSS,
        a: E3(t, 29),
        rowA: XSS.map((_, i) => E3(t, 29.4 + i * 0.6)),
        fs: 20,
        rh: 52,
        colColors: [PAL3.flow, PAL3.ink],
        marks: { 3: ["flow", 1] }
      }
    ), /* @__PURE__ */ React.createElement(Box3, { x: 1230, y: 540, w: 594, h: 96, label: "JIT on, -Xss2m, three runs", sub: "55,115 \xB7 47,594 \xB7 44,664", tone: "pull", a: E3(t, 38), fs: 20, sfs: 20 }), /* @__PURE__ */ React.createElement(Txt3, { x: 1230, y: 654, fs: 19, w: 594, color: PAL3.ink2, a: E3(t, 39) }, "Compiled frames are smaller than interpreted ones, and the JIT kicks in at a different moment each run."), /* @__PURE__ */ React.createElement(RealTag, { x: 1230, y: 192, a: E3(t, 29) }), /* @__PURE__ */ React.createElement(Callout2, { x: 1230, y: 760, w: 594, tone: "flow", a: E3(t, 53), fs: 20, title: "the real fix", text: "A base case, or a loop. A bigger `-Xss` only moves the wall." }));
  }
  function SThreadCost({ t }) {
    const n = t < 6 ? 1 : t < 12 ? Math.round(lerp2(1, 1e3, M2(t, 6, 3))) : Math.round(lerp2(1e3, 1e6, M2(t, 12, 3)));
    const gb = n * 2 / 1e3;
    const sizeTxt = gb < 1 ? `${fmtN(n * 2)} MB` : gb < 1e3 ? `${gb < 10 ? gb.toFixed(1).replace(".0", "") : Math.round(gb)} GB` : `${(gb / 1e3).toFixed(1).replace(".0", "")} TB`;
    const bars = 40, shown = Math.min(bars, Math.ceil(lin2(t, 1, 12) * bars));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 190, w: 860, h: 370, title: "platform threads", right: "1 OS thread each", tone: "flow", a: E3(t, 0.4) }), Array.from({ length: shown }).map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 126 + i % 20 * 40, top: 256 + Math.floor(i / 20) * 110, width: 30, height: 96, boxSizing: "border-box", borderRadius: 5, border: `2px solid ${hexA3(PAL3.flow, 0.8)}`, background: `linear-gradient(0deg, ${hexA3(PAL3.flow, 0.5)} 0 14%, transparent 14%)` } })), /* @__PURE__ */ React.createElement(Txt3, { x: 126, y: 490, mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 2) }, "each bar: a 2 MB stack reserved \xB7 only the used bottom part is real memory"), /* @__PURE__ */ React.createElement(Card2, { x: 990, y: 190, w: 834, h: 170, a: E3(t, 6), tone: n >= 1e6 ? "bad" : "flow", num: `${fmtN(n)} threads \xD7 2 MB`, title: `= ${sizeTxt} of address space`, tfs: 40, glow: n >= 1e6 ? win2(t, 15, 19) : 0 }), /* @__PURE__ */ React.createElement(Txt3, { x: 990, y: 380, fs: 20, w: 834, color: PAL3.ink2, a: E3(t, 13) }, "On Linux x64 the default is 1 MB, so a million threads would be 1 TB. Either way: no."), /* @__PURE__ */ React.createElement(Panel2, { x: 990, y: 440, w: 834, h: 120, title: "virtual threads \xB7 Java 21", tone: "green", a: E3(t, 32.5) }), [60, 34, 90, 22, 48, 70, 30, 54, 40, 26, 80, 36].map((w, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: 1010 + i * 66, top: 500 + i % 2 * 22, width: Math.min(58, w * 0.7), height: 18, borderRadius: 4, background: hexA3(PAL3.green, 0.55), opacity: E3(t, 33 + i * 0.12) } })), /* @__PURE__ */ React.createElement(Txt3, { x: 1010, y: 566, mono: true, fs: 17, color: PAL3.green, a: E3(t, 34.5) }, "stack chunks: small heap objects that grow as needed"), /* @__PURE__ */ React.createElement(Badge2, { x: 1400, y: 620, text: "millions of them \xB7 a few carrier threads \xB7 Part 09", tone: "green", a: E3(t, 39.5), fs: 17 }), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 660, w: 1728, h: 240, t, a: E3(t, 19), fs: 17, lh: 30, items: [
      { at: 19.5, text: "java Threads          # start sleeping threads until something breaks", kind: "cmd" },
      { at: 21, text: '[0.105s][warning][os,thread] Failed to start thread "Unknown thread" - pthread_create failed (EAGAIN) for attributes: stacksize: 2048k, guardsize: 16k, detached.', kind: "dim" },
      { at: 22.5, text: "started 2026 threads, then: java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached", kind: "err" },
      { at: 26, text: "# macOS: kern.num_taskthreads = 2048 per process (the JVM already runs ~20 of its own)", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 96, y: 910, a: E3(t, 21) }));
  }
  var GEN = [["eden", 34944, "pull"], ["S0", 4352, "flow"], ["S1", 4352, "flow"], ["tenured (old)", 87424, "green"]];
  function SGenerations({ t }) {
    const X = 96, W = 1728, Y = 300, H = 110, TOT = 131072;
    let x = X;
    const segs = GEN.map(([l, kb, tone], i) => {
      const w = kb / TOT * W;
      const s = { l, kb, tone, x, w, i };
      x += w;
      return s;
    });
    const ats = [12, 19.5, 19.5, 25];
    const used = lin2(t, 41, 4) * 0.54;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: X + 2, top: Y, width: W - 4, height: H, boxSizing: "border-box", borderRadius: 10, opacity: win2(t, 1, 12.2, 0.5), border: `2px solid ${hexA3(PAL3.pull, 0.8)}`, background: hexA3(PAL3.pull, 0.06), display: "flex", alignItems: "center", justifyContent: "center", font: `600 24px ${MONO3}`, color: PAL3.ink } }, "heap (-Xmx256m): one big pool?"), /* @__PURE__ */ React.createElement(Brace2, { x: segs[0].x, y: 262, w: segs[0].w + segs[1].w + segs[2].w, above: true, label: "young generation \xB7 43,648 K", tone: "pull", a: E3(t, 12) }), /* @__PURE__ */ React.createElement(Brace2, { x: segs[3].x + 4, y: 262, w: segs[3].w - 4, above: true, label: "old generation \xB7 87,424 K", tone: "green", a: E3(t, 25) }), segs.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.l, style: { position: "absolute", left: s.x + 2, top: Y, width: s.w - 4, height: H, boxSizing: "border-box", borderRadius: 10, opacity: E3(t, s.i === 3 ? 25 : 12), border: `2px solid ${hexA3(toneColor3(s.tone), 0.85)}`, background: hexA3(toneColor3(s.tone), 0.1), boxShadow: s.i === 0 && win2(t, 12, 19) > 0.5 || s.i > 0 && s.i < 3 && win2(t, 19.5, 25) > 0.5 ? `0 0 26px ${hexA3(toneColor3(s.tone), 0.5)}` : "none", display: "flex", alignItems: "center", justifyContent: "center", font: `600 22px ${MONO3}`, color: PAL3.ink, overflow: "hidden" } }, s.i === 0 ? "" : s.l)), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: segs[0].x + 6, top: Y + 6, width: (segs[0].w - 12) * used, height: H - 12, borderRadius: 6, background: `repeating-linear-gradient(90deg, ${hexA3(PAL3.pull, 0.55)} 0 10px, ${hexA3(PAL3.pull, 0.2)} 10px 13px)`, opacity: E3(t, 41) } }), /* @__PURE__ */ React.createElement(Txt3, { x: segs[0].x + segs[0].w / 2, y: Y + H / 2, anchor: "center", mono: true, fs: 22, weight: 600, a: E3(t, 12) }, "eden"), /* @__PURE__ */ React.createElement(Txt3, { x: segs[0].x + segs[0].w / 2, y: Y + H + 14, anchor: "mid", mono: true, fs: 17, color: PAL3.pull, a: E3(t, 12.5) }, t >= 41 ? "34,944 K \xB7 54% used" : "34,944 K"), /* @__PURE__ */ React.createElement(Txt3, { x: segs[2].x, y: Y + H + 14, anchor: "mid", mono: true, fs: 17, color: PAL3.flow, a: E3(t, 19.5) }, "4,352 K each"), /* @__PURE__ */ React.createElement(Txt3, { x: segs[3].x + segs[3].w / 2, y: Y + H + 14, anchor: "mid", mono: true, fs: 17, color: PAL3.green, a: E3(t, 25.5) }, "87,424 K"), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 480, w: 1e3, h: 300, t, a: E3(t, 5.5), fs: 17, lh: 28, title: "terminal \xB7 addresses trimmed", items: [
      { at: 6, text: "java -XX:+UseSerialGC -Xmx256m Live &", kind: "cmd" },
      { at: 6.6, text: "jcmd 913 GC.heap_info", kind: "cmd" },
      { at: 7.4, text: " def new generation   total 39296K, used 18952K" },
      { at: 7.6, text: "  eden space 34944K,  54% used", kind: t >= 41 ? "ok" : void 0 },
      { at: 7.8, text: "  from space 4352K,   0% used" },
      { at: 8, text: "  to   space 4352K,   0% used" },
      { at: 8.2, text: " tenured generation   total 87424K, used 0K" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 96, y: 792, a: E3(t, 7) }), /* @__PURE__ */ React.createElement(Box3, { x: 1140, y: 480, w: 684, h: 90, label: "-XX:SurvivorRatio=8", sub: "eden : S0 : S1 = 8 : 1 : 1", tone: "flow", a: E3(t, 19.5), fs: 22, sfs: 18 }), /* @__PURE__ */ React.createElement(Box3, { x: 1140, y: 590, w: 684, h: 90, label: "-XX:NewRatio=2", sub: "old : young = 2 : 1", tone: "green", a: E3(t, 25.5), fs: 22, sfs: 18 }), /* @__PURE__ */ React.createElement(Callout2, { x: 1140, y: 700, w: 684, tone: "pull", a: E3(t, 33), fs: 20, title: "why split by age", text: "Most objects die young. Collect only the young part, and nearly everything you look at is garbage: cheap." }));
  }
  var LIVE_A = [3, 17, 29];
  var LIVE_B = [8, 22];
  var cellXY = (i) => [116 + i % 10 * 88, 262 + Math.floor(i / 10) * 66];
  var survXY = (side, k) => [(side === 0 ? 1046 : 1316) + 36 + k % 2 * 100, 262 + Math.floor(k / 2) * 66];
  var oldXY = (k) => [130 + k * 100, 650];
  function Cell({ x, y, a = 1, tone = "pull", dead, label, sub, glow = 0 }) {
    if (a <= 0.01) return null;
    const c = dead ? PAL3.ink3 : toneColor3(tone);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: x, top: y, width: 78, height: 56, boxSizing: "border-box", borderRadius: 8, opacity: a * (dead ? 0.45 : 1), border: `2px ${dead ? "dashed" : "solid"} ${hexA3(c, 0.85)}`, background: hexA3(c, dead ? 0.05 : 0.16), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", font: `600 17px ${MONO3}`, color: dead ? PAL3.ink3 : PAL3.ink, boxShadow: glow > 0.01 ? `0 0 ${22 * glow}px ${hexA3(c, 0.6 * glow)}` : "none" } }, /* @__PURE__ */ React.createElement("div", null, label), sub && /* @__PURE__ */ React.createElement("div", { style: { font: `500 16px ${MONO3}`, color: c } }, sub));
  }
  function SMinorGC({ t }) {
    const ffT = (g2) => 44 + (g2 - 2) * 0.6;
    let g = -1;
    if (t >= 14) g = 0;
    if (t >= 30) g = 1;
    for (let k = 2; k <= 14; k++) if (t >= ffT(k)) g = k;
    if (t >= 52.5) g = 15;
    const cells = [];
    for (let i = 0; i < 40; i++) {
      const at = 4 + i * 0.12;
      if (LIVE_A.includes(i)) continue;
      cells.push(/* @__PURE__ */ React.createElement(Cell, { key: "a" + i, x: cellXY(i)[0], y: cellXY(i)[1], label: "User", a: E3(t, at, 0.2) * (1 - E3(t, 19.6, 0.5)), dead: t >= 9.6 + i * 0.03 }));
    }
    for (let i = 0; i < 40; i++) {
      const at = 24 + i * 0.12;
      if (LIVE_B.includes(i)) continue;
      cells.push(/* @__PURE__ */ React.createElement(Cell, { key: "b" + i, x: cellXY(i)[0], y: cellXY(i)[1], label: "User", a: E3(t, at, 0.2) * (1 - E3(t, 31.4, 0.5)), dead: t >= 28.9 + i * 0.02 }));
    }
    const survA = LIVE_A.map((i, k) => {
      const keys = [[4 + i * 0.12, ...cellXY(i)], [14, ...cellXY(i)], [15, ...survXY(0, k)]];
      if (i !== 17) {
        const kk = i === 3 ? 0 : 1;
        keys.push([30, ...survXY(0, k)], [31, ...survXY(1, kk)]);
        for (let gg = 2; gg <= 14; gg++) keys.push([ffT(gg), ...survXY((gg + 1) % 2, kk)], [ffT(gg) + 0.4, ...survXY(gg % 2, kk)]);
        keys.push([52.5, ...survXY(0, kk)], [53.6, ...oldXY(kk)]);
      }
      const [x, y] = track3(t, keys.map((q) => [q[0], q[1], q[2]]));
      const age = g < 0 ? null : Math.min(g + 1, 15);
      const dead17 = i === 17 && t >= 27;
      const a = E3(t, 4 + i * 0.12, 0.2) * (i === 17 ? 1 - E3(t, 30.4, 0.5) : 1);
      return /* @__PURE__ */ React.createElement(Cell, { key: "sa" + i, x, y, label: "User", sub: age ? t >= 53.6 ? "old" : `age ${age}` : null, tone: t >= 53.6 ? "green" : "flow", dead: dead17, a, glow: pulse3(t, [14.2, 30.2, 52.7], 0.8) });
    });
    const survB = LIVE_B.map((i, k) => {
      const keys = [[24 + i * 0.12, ...cellXY(i)], [30, ...cellXY(i)], [31, ...survXY(1, 2 + k)]];
      for (let gg = 2; gg <= 14; gg++) keys.push([ffT(gg), ...survXY((gg + 1) % 2, 2 + k)], [ffT(gg) + 0.4, ...survXY(gg % 2, 2 + k)]);
      keys.push([52.5, ...survXY(0, 2 + k)], [53.2, ...survXY(1, 2 + k)]);
      const [x, y] = track3(t, keys);
      const age = g < 1 ? null : Math.min(g, 15);
      return /* @__PURE__ */ React.createElement(Cell, { key: "sb" + i, x, y, label: "User", sub: age ? `age ${age}` : null, tone: "flow", a: E3(t, 24 + i * 0.12, 0.2), glow: pulse3(t, [30.2], 0.8) });
    });
    const gcs = g + 1;
    const gLate = (() => {
      let q = -1;
      if (t >= 14.6) q = 0;
      if (t >= 30.6) q = 1;
      for (let k = 2; k <= 14; k++) if (t >= ffT(k) + 0.25) q = k;
      if (t >= 53) q = 15;
      return q;
    })();
    const sideNow = gLate < 0 ? -1 : gLate % 2;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 200, w: 920, h: 350, title: "eden", right: t >= 19.6 && t < 24 ? "empty" : "new objects", tone: "pull", a: E3(t, 0.4), glow: pulse3(t, [14, 30], 1.2) }), /* @__PURE__ */ React.createElement(Panel2, { x: 1046, y: 200, w: 250, h: 350, title: "S0", right: sideNow === 0 ? "in use" : sideNow === 1 ? "empty" : "", tone: "flow", a: E3(t, 0.8) }), /* @__PURE__ */ React.createElement(Panel2, { x: 1316, y: 200, w: 250, h: 350, title: "S1", right: sideNow === 1 ? "in use" : sideNow === 0 ? "empty" : "", tone: "flow", a: E3(t, 1) }), /* @__PURE__ */ React.createElement(Panel2, { x: 1596, y: 200, w: 228, h: 350, title: "counters", a: E3(t, 1.2) }), /* @__PURE__ */ React.createElement(Txt3, { x: 1710, y: 262, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 1.4) }, "minor GCs"), /* @__PURE__ */ React.createElement(Txt3, { x: 1710, y: 290, anchor: "mid", mono: true, fs: 56, weight: 700, color: PAL3.ink, a: E3(t, 1.4) }, String(Math.max(0, gcs))), /* @__PURE__ */ React.createElement(Txt3, { x: 1710, y: 390, anchor: "mid", mono: true, fs: 17, color: PAL3.ink3, a: E3(t, 44) }, "MaxTenuringThreshold"), /* @__PURE__ */ React.createElement(Txt3, { x: 1710, y: 418, anchor: "mid", mono: true, fs: 40, weight: 700, color: PAL3.green, a: E3(t, 44) }, "15"), /* @__PURE__ */ React.createElement(Badge2, { x: 556, y: 530, text: "cleared in one step: dead objects are never touched", tone: "pull", a: win2(t, 19.6, 24), fs: 17 }), /* @__PURE__ */ React.createElement(Badge2, { x: 1306, y: 530, text: "S0 \u21C4 S1 swap every GC", tone: "flow", a: win2(t, 38, 52), fs: 17 }), /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 580, w: 1728, h: 140, title: "old generation", right: "tenured \xB7 collected rarely", tone: "green", a: E3(t, 1.6), glow: pulse3(t, [53.6], 1.4) }), /* @__PURE__ */ React.createElement(Badge2, { x: 460, y: 676, text: "promoted at age 15", tone: "green", a: E3(t, 54), fs: 17 }), cells, survA, survB, /* @__PURE__ */ React.createElement(Txt3, { x: 96, y: 752, mono: true, fs: 18, color: PAL3.ink2, a: E3(t, 4) * (1 - E3(t, 58, 0.4)) }, "legend:  ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL3.pull } }, "\u25A0 new object"), "   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL3.flow } }, "\u25A0 still referenced (from a stack slot, a static\u2026)"), "   ", /* @__PURE__ */ React.createElement("span", { style: { color: PAL3.ink3 } }, "\u25A2 garbage: nothing points to it")), /* @__PURE__ */ React.createElement(Console2, { x: 96, y: 736, w: 1728, h: 196, t, a: E3(t, 58.5), fs: 17, lh: 30, items: [
      { at: 59, text: "java -XX:+UseSerialGC -Xmx64m -Xlog:gc,gc+heap=info Churn", kind: "cmd" },
      { at: 59.8, text: "[0.075s][info][gc,heap] GC(0) DefNew: 17472K(19648K)->582K(19648K) Eden: 17472K(17472K)->0K(17472K) From: 0K(2176K)->582K(2176K)" },
      { at: 60.4, text: "[0.075s][info][gc     ] GC(0) Pause Young (Allocation Failure) 17M->0M(61M) 0.822ms", kind: "ok" },
      { at: 66.5, text: "[0.137s][info][gc,heap] GC(15) Tenured: 0K(43712K)->581K(43712K)", kind: "ok" }
    ] }));
  }
  var MAIN_ALLOCS = Array.from({ length: 13 }, (_, k) => 17 + k * 1.05);
  var WORK_ALLOCS = Array.from({ length: 13 }, (_, k) => 24 + k * 0.55);
  var MAIN2_ALLOCS = Array.from({ length: 9 }, (_, k) => 34 + k * 0.5);
  function STLAB({ t }) {
    const SY = 290, SH = 100, OW = 30, OG = 2;
    const A = { x: 136, w: 420 }, B = { x: 576, w: 420 }, A2 = { x: 1016, w: 420 };
    const nA = MAIN_ALLOCS.filter((s) => t >= s).length, nB = WORK_ALLOCS.filter((s) => t >= s).length, nA2 = MAIN2_ALLOCS.filter((s) => t >= s).length;
    const edenTop = t < 11.5 ? 136 : t < 32 ? lerp2(996, 1016, 1) : lerp2(1016, 1436, M2(t, 32, 0.6));
    const tlab = (r, tone, label, a, n, times, retired) => {
      const c = toneColor3(tone);
      const top = r.x + 4 + n * (OW + OG);
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: r.x, top: SY, width: r.w, height: SH, opacity: a * (retired ? 0.5 : 1), boxSizing: "border-box", borderRadius: 8, border: `2px solid ${hexA3(c, 0.9)}`, background: hexA3(c, 0.06) } }), /* @__PURE__ */ React.createElement(Txt3, { x: r.x + 6, y: SY - 30, mono: true, fs: 16, weight: 600, color: c, a }, label), times.map((s, k) => t >= s && /* @__PURE__ */ React.createElement("div", { key: k, style: { position: "absolute", left: r.x + 4 + k * (OW + OG), top: SY + 10, width: OW, height: SH - 20, borderRadius: 4, opacity: a * (retired ? 0.5 : 1) * E3(t, s, 0.2), background: hexA3(c, 0.55), boxShadow: pulse3(t, [s], 0.5) > 0.01 ? `0 0 16px ${c}` : "none" } })), !retired && a > 0.5 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: top - 1, top: SY - 6, width: 3, height: SH + 12, background: c, opacity: a } }), /* @__PURE__ */ React.createElement(Txt3, { x: top, y: SY + SH + 10, anchor: "mid", mono: true, fs: 16, color: c, a }, "top")));
    };
    const naive = win2(t, 5, 11.3);
    const reset = 1 - E3(t, 55.5, 0.6);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel2, { x: 96, y: 200, w: 1728, h: 230, title: "eden", right: "shared by all threads", tone: "pull", a: E3(t, 0.4) }), naive > 0.01 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Badge2, { x: 300, y: 262, text: "main", tone: "flow", a: naive, fs: 17 }), /* @__PURE__ */ React.createElement(Badge2, { x: 560, y: 262, text: "worker", tone: "pink", a: naive, fs: 17 }), /* @__PURE__ */ React.createElement(Arrow2, { from: [300, 276], to: [140, 330], curve: -20, a: naive, color: PAL3.flow }), /* @__PURE__ */ React.createElement(Arrow2, { from: [560, 276], to: [146, 336], curve: 30, a: naive, color: PAL3.pink }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 134, top: SY - 6, width: 4, height: SH + 12, background: PAL3.bad, opacity: naive } }), /* @__PURE__ */ React.createElement(Badge2, { x: 760, y: 340, text: "one shared top: every new needs an atomic CAS", tone: "bad", a: naive, fs: 17, s: 1 + 0.05 * pulse3(t, [6, 7, 8, 9, 10], 0.5) })), tlab(A, "flow", "TLAB \xB7 main", E3(t, 11.5) * reset, Math.min(nA, 13), MAIN_ALLOCS, t >= 31.4), tlab(B, "pink", "TLAB \xB7 worker", E3(t, 12.2) * reset, nB, WORK_ALLOCS, false), tlab(A2, "flow", "new TLAB \xB7 main", E3(t, 32.4) * reset, nA2, MAIN2_ALLOCS, false), /* @__PURE__ */ React.createElement(Badge2, { x: 960, y: 340, text: "minor GC: eden is empty again, TLABs start fresh", tone: "pull", a: E3(t, 56), fs: 18, solid: true }), t >= 11.5 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: edenTop + 18, top: SY - 6, width: 3, height: SH + 12, background: PAL3.pull, opacity: E3(t, 13) * reset } }), /* @__PURE__ */ React.createElement(Txt3, { x: edenTop + 30, y: SY + 36, mono: true, fs: 17, color: PAL3.pull, a: E3(t, 13) * reset }, "eden top (shared)")), /* @__PURE__ */ React.createElement(Badge2, { x: 1226, y: 262, text: "CAS: grab 349 KB", tone: "pull", a: win2(t, 31.6, 36), fs: 17, solid: true }), /* @__PURE__ */ React.createElement(Badge2, { x: 346, y: 262, text: "full \xB7 retired", tone: "dim", a: E3(t, 31.4) * reset, fs: 17 }), /* @__PURE__ */ React.createElement(Code2, { x: 96, y: 460, w: 860, h: 324, title: "allocation fast path (simplified HotSpot logic)", a: E3(t, 11.5), fs: 18, lh: 32, hl: hlAt2(t, [[17.5, 1], [18.5, 2], [19.5, 3], [31, 7], [38, -1]])[0], hlA: hlAt2(t, [[17.5, 1], [18.5, 2], [19.5, 3], [31, 7], [38, -1]])[1], lines: [
      "// new User(name, age), per thread",
      "obj = tlab.top;",
      "if (obj + 24 <= tlab.end) {       // fits?",
      "    tlab.top = obj + 24;          // bump: no lock",
      "    write header, zero the fields;",
      "    return obj;",
      "}",
      "slow path: retire TLAB, CAS a new chunk from eden"
    ] }), /* @__PURE__ */ React.createElement(Callout2, { x: 96, y: 810, w: 860, tone: "flow", a: E3(t, 48), fs: 20, text: "A handful of instructions. That's why small objects are cheap to **create**; the GC decides what they cost to **keep**." }), /* @__PURE__ */ React.createElement(
      Table2,
      {
        x: 1e3,
        y: 460,
        cols: [520, 304],
        head: ["per eden fill \xB7 Serial \xB7 -Xmx64m", ""],
        a: E3(t, 39),
        fs: 19,
        rh: 46,
        colColors: [PAL3.ink2, PAL3.ink],
        rows: [["objects allocated (User+String+byte[])", "\u2248 750,000"], ["TLAB size (desired_size)", "349 KB"], ["TLAB refills", "\u2248 51"], ["slow allocations", "0"], ["wasted space", "0.3%"]],
        rowA: [0, 1, 2, 3, 4].map((i) => E3(t, 39.4 + i * 0.6)),
        marks: { 2: ["pull", win2(t, 41, 48)] }
      }
    ), /* @__PURE__ */ React.createElement(Console2, { x: 1e3, y: 748, w: 824, h: 116, t, a: E3(t, 42), fs: 17, lh: 26, title: "-Xlog:gc+tlab=debug", items: [
      { at: 42.4, text: "GC(1) TLAB totals: thrds: 1  refills: 52 \u2026 slow allocs: 0 \u2026 waste:  0.3%" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 1e3, y: 874, a: E3(t, 42), text: "real output \xB7 numbers per GC from the log" }));
  }

  // src/topics/8.3/scenes3.jsx
  var {
    PAL: PAL4,
    MOTION: MOTION4,
    lin: lin3,
    lerp: lerp3,
    win: win3,
    pulse: pulse4,
    step: step3,
    track: track4,
    hlAt: hlAt3,
    clamp: clamp4,
    hexA: hexA4,
    MONO: MONO4,
    SANS: SANS3,
    Txt: Txt4,
    Panel: Panel3,
    Box: Box4,
    Code: Code3,
    Console: Console3,
    HArrow: HArrow3,
    VArrow: VArrow3,
    Arrow: Arrow3,
    Dot: Dot3,
    Card: Card3,
    Node: Node3,
    Badge: Badge3,
    Callout: Callout3,
    Table: Table3,
    Mark: Mark3,
    Val: Val3,
    Brace: Brace3,
    toneColor: toneColor4
  } = window.AN;
  var E4 = MOTION4.enter;
  var M3 = MOTION4.move;
  var POP3 = MOTION4.pop;
  var fmtN2 = (n) => Math.round(n).toLocaleString("en-US");
  var EDEN_A = [1, 2, 3, 5, 6, 9, 10, 12, 17, 18, 20, 21, 24, 27, 28, 30, 33, 35, 38, 40, 41, 44, 47];
  var ORDER = Array.from({ length: 62 }, (_, i) => i).sort((a, b) => a * 29 % 62 - b * 29 % 62);
  var EDEN_B = ORDER.filter((i) => i !== 13).slice(0, 37);
  var HUM = (() => {
    for (let i = 0; i < 61; i++) if (![i, i + 1].some((j) => EDEN_B.includes(j) || j === 13) && i % 16 !== 15) return [i, i + 1];
    return [60, 61];
  })();
  var regXY = (i) => [96 + i % 16 * 72, 236 + Math.floor(i / 16) * 72];
  function SG1Regions({ t }) {
    const role = (i) => {
      if ((i === 62 || i === 63) && t >= 13) return ["A", "ink"];
      if (HUM.includes(i) && t >= 34.4) return ["H", "pink"];
      if (i === 13 && t >= 20.6) return ["S", "flow"];
      if (t >= 13 && t < 20.4 && EDEN_A.includes(i) && t >= 13 + EDEN_A.indexOf(i) * 0.08) return ["E", "pull"];
      if (t >= 27 && EDEN_B.includes(i) && t >= 27 + EDEN_B.indexOf(i) * 0.05) return ["E", "pull"];
      return null;
    };
    const sx = regXY(13);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, Array.from({ length: 64 }).map((_, i) => {
      const [x, y] = regXY(i);
      const r = role(i);
      const c = r ? toneColor4(r[1]) : PAL4.line2;
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { position: "absolute", left: x, top: y, width: 64, height: 64, boxSizing: "border-box", borderRadius: 8, opacity: E4(t, 7 + i % 16 * 0.03 + Math.floor(i / 16) * 0.1), border: `2px solid ${r ? hexA4(c, 0.9) : PAL4.line2}`, background: r ? hexA4(c, 0.2) : PAL4.panel2, display: "flex", alignItems: "center", justifyContent: "center", font: `700 22px ${MONO4}`, color: r ? PAL4.ink : PAL4.ink3 } }, r ? r[0] : "");
    }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: regXY(HUM[0])[0] - 4, top: regXY(HUM[0])[1] - 4, width: 144, height: 72, borderRadius: 10, border: `2px dashed ${PAL4.pink}`, opacity: E4(t, 34.6), boxSizing: "border-box" } }), EDEN_A.slice(0, 8).map((i, k) => {
      const p = M3(t, 19.6 + k * 0.06, 0.8);
      const [x, y] = regXY(i);
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot3, { key: k, x: lerp3(x + 32, sx[0] + 32, p), y: lerp3(y + 32, sx[1] + 32, p), r: 7, color: PAL4.flow }) : null;
    }), [["eden", 600, "pull"], ["S0", 80, "flow"], ["S1", 80, "flow"], ["old", 944, "green"]].map(([l, w, tone], i, arr) => {
      const x = 96 + arr.slice(0, i).reduce((q, a) => q + a[1] + 8, 0);
      return /* @__PURE__ */ React.createElement(Box4, { key: l, x, y: 300, w, h: 110, label: l, tone, a: win3(t, 0.6 + i * 0.2, 6.8, 0.5), fs: 22 });
    }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 440, mono: true, fs: 18, color: PAL4.ink3, a: win3(t, 1.4, 6.8, 0.5) }, "Serial and Parallel: one contiguous range per space, fixed proportions"), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 196, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 7) }, "-Xmx64m \xB7 64 regions of 1 MB (G1HeapRegionSize = 1048576)"), [["E", "eden", "pull"], ["S", "survivor", "flow"], ["O", "old", "green"], ["H", "humongous (old)", "pink"], ["A", "archive (CDS)", "ink"], ["", "free", null]].map(([k, l, tone], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 1290, top: 236 + i * 46, width: 36, height: 36, boxSizing: "border-box", borderRadius: 6, border: `2px solid ${tone ? toneColor4(tone) : PAL4.line2}`, background: tone ? hexA4(toneColor4(tone), 0.2) : PAL4.panel2, opacity: E4(t, 13 + i * 0.15), display: "flex", alignItems: "center", justifyContent: "center", font: `700 17px ${MONO4}`, color: PAL4.ink } }, k), /* @__PURE__ */ React.createElement(Txt4, { x: 1342, y: 242 + i * 46, mono: true, fs: 19, color: PAL4.ink2, a: E4(t, 13 + i * 0.15) }, l))), /* @__PURE__ */ React.createElement(Badge3, { x: 1560, y: 530, text: t >= 27 ? "eden target: 37 regions" : t >= 20.6 ? "eden 23 \u2192 0 \xB7 survivor 0 \u2192 1" : "eden: 23 regions", tone: "pull", a: E4(t, 13.5), fs: 17 }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 526, mono: true, fs: 17, color: PAL4.pink, a: E4(t, 35) }, "one array bigger than a region \u2192 contiguous humongous regions"), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 556, w: 1728, h: 244, t, a: E4(t, 19), fs: 17, lh: 25, items: [
      { at: 19.4, text: "java -Xmx64m -Xlog:gc,gc+heap=info Churn", kind: "cmd" },
      { at: 20, text: "[0.047s][info][gc,heap] GC(0) Eden regions: 23->0(37)", kind: "ok" },
      { at: 20.4, text: "[0.047s][info][gc,heap] GC(0) Survivor regions: 0->1(3)" },
      { at: 20.8, text: "[0.047s][info][gc,heap] GC(0) Archive regions: 2->2", kind: "dim" },
      { at: 21.2, text: "[0.047s][info][gc     ] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 23M->1M(64M) 0.567ms" },
      { at: 34.4, text: "java -Xmx256m -Xlog:gc,gc+heap=info Huge      # keeps 300 arrays of 600 KB", kind: "cmd" },
      { at: 35, text: "[0.021s][info][gc     ] GC(0) Pause Young (Concurrent Start) (G1 Humongous Allocation) 57M->57M(130M) 0.328ms", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 818, w: 1728, tone: "pull", a: E4(t, 41), fs: 19, text: "`NewRatio` and `SurvivorRatio` describe the classic fixed layout. G1 resizes young every cycle to meet its pause goal, `-XX:MaxGCPauseMillis` (200 ms by default). 8.6 compares the collectors." }));
  }
  var FLAGS = [
    ["-Xmx", "2 GB", "max heap \xB7 25% of RAM"],
    ["-Xms", "128 MB", "initial heap \xB7 1/64 of RAM"],
    ["-XX:NewRatio", "2", "old : young"],
    ["-XX:SurvivorRatio", "8", "eden : one survivor"],
    ["-XX:MaxTenuringThreshold", "15", "age before promotion"],
    ["-XX:MaxRAMPercentage", "25", "what -Xmx defaults to"]
  ];
  var CONT = [["4 GB", 4096, 1024, "1 GB"], ["1 GB", 1024, 256, "256 MB"], ["512 MB", 512, 128, "128 MB"], ["256 MB", 256, 128, "128 MB \xB7 50%"], ["128 MB", 128, 64, "64 MB \xB7 50%"]];
  function SSizing({ t }) {
    const S = 1e3 / 4096;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Table3,
      {
        x: 96,
        y: 196,
        cols: [340, 190, 470],
        head: ["flag", "default here", "meaning"],
        rows: FLAGS,
        a: E4(t, 0.5),
        fs: 20,
        rh: 54,
        rowA: FLAGS.map((_, i) => E4(t, [6, 12.5, 20, 20.4, 20.8, 25.5][i])),
        colColors: [PAL4.flow, PAL4.pull, PAL4.ink2],
        marks: { 0: ["pull", win3(t, 6, 12.3)], 1: ["pull", win3(t, 12.5, 20)], 5: ["pull", win3(t, 25.5, 40)] }
      }
    ), /* @__PURE__ */ React.createElement(Console3, { x: 1140, y: 196, w: 684, h: 380, t, a: E4(t, 1), fs: 17, lh: 28, title: "terminal \xB7 columns trimmed", items: [
      { at: 1.5, text: "java -XX:+PrintFlagsFinal -version | grep \u2026", kind: "cmd" },
      { at: 2.2, text: "  size_t MaxHeapSize          = 2147483648" },
      { at: 2.4, text: "  size_t InitialHeapSize      = 134217728" },
      { at: 2.6, text: "   uintx NewRatio             = 2" },
      { at: 2.8, text: "   uintx SurvivorRatio        = 8" },
      { at: 3, text: "   uintx MaxTenuringThreshold = 15" },
      { at: 3.2, text: "  double MaxRAMPercentage     = 25.000000" },
      { at: 3.4, text: "# this Mac: 8 GB RAM", kind: "dim" }
    ] }), (() => {
      const a = win3(t, 6, 25, 0.5);
      if (a < 0.01) return null;
      const RW = 1600;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 612, mono: true, fs: 17, color: PAL4.ink3, a }, "THIS MAC \xB7 8 GB RAM"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 650, width: RW, height: 56, boxSizing: "border-box", border: `2px dashed ${PAL4.ink3}`, borderRadius: 8, opacity: a } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 650, width: RW * 0.25 * M3(t, 6.5, 1), height: 56, background: hexA4(PAL4.pull, 0.35), border: `2px solid ${PAL4.pull}`, boxSizing: "border-box", borderRadius: 8, opacity: a } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 96, top: 650, width: Math.max(4, RW / 64) * E4(t, 12.5), height: 56, background: hexA4(PAL4.pull, 0.85), borderRadius: 6, opacity: a } }), /* @__PURE__ */ React.createElement(Txt4, { x: 96 + RW * 0.25 + 16, y: 664, mono: true, fs: 20, color: PAL4.pull, a: a * E4(t, 7) }, "-Xmx default: 2 GB = 25%"), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 724, mono: true, fs: 20, color: PAL4.pull, a: a * E4(t, 12.8) }, "-Xms default: 128 MB = 1/64, grown on demand up to -Xmx"), /* @__PURE__ */ React.createElement(Txt4, { x: 96 + RW - 8, y: 664, anchor: "right", mono: true, fs: 20, color: PAL4.ink3, a }, "8 GB"));
    })(), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 604, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 25.5) }, "CONTAINER LIMIT \u2192 DEFAULT MAX HEAP \xB7 simulated with -XX:MaxRAM \xB7 real PrintFlagsFinal values"), CONT.map(([l, mb, heap, ht], i) => {
      const y = 642 + i * 54, a = E4(t, 26 + i * 0.5);
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: l }, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: y + 8, mono: true, fs: 19, color: PAL4.ink, a }, l), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 260, top: y, width: mb * S, height: 40, opacity: a, boxSizing: "border-box", border: `2px dashed ${PAL4.ink3}`, borderRadius: 6 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 260, top: y, width: heap * S * M3(t, 26.5 + i * 0.5, 0.8), height: 40, opacity: a, background: hexA4(PAL4.pull, 0.7), borderRadius: 6 } }), /* @__PURE__ */ React.createElement(Txt4, { x: 260 + Math.max(mb * S, 80) + 16, y: y + 8, mono: true, fs: 19, color: PAL4.pull, a }, `heap ${ht}`));
    }), /* @__PURE__ */ React.createElement(Card3, { x: 1460, y: 642, w: 364, h: 130, a: E4(t, 31.5), tone: "bad", title: "1 GB container \u2192 256 MB heap", sub: "set `-Xmx` or `-XX:MaxRAMPercentage`", tfs: 22, sfs: 18, glow: win3(t, 31.5, 40) }), /* @__PURE__ */ React.createElement(Badge3, { x: 1642, y: 810, text: "1 CPU \u2192 Serial GC is chosen", tone: "pull", a: E4(t, 40.5), fs: 17 }));
  }
  function SMetaspace({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box4, { x: 96, y: 232, w: 320, h: 96, label: "Users$User.class", sub: "1,254 bytes on disk", tone: "ink", a: E4(t, 0.6), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 420, x2: 466, y: 280, a: E4(t, 1.4), color: PAL4.violet }), /* @__PURE__ */ React.createElement(Txt4, { x: 256, y: 344, anchor: "mid", mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 1.4) }, "loaded by a class loader"), /* @__PURE__ */ React.createElement(Panel3, { x: 470, y: 190, w: 760, h: 460, title: "metaspace", right: "native memory \xB7 outside the heap", tone: "violet", a: E4(t, 1) }), /* @__PURE__ */ React.createElement(Node3, { x: 500, y: 244, w: 340, h: 216, kind: "Klass", name: "Users$User", tone: "violet", a: E4(t, 6), glow: win3(t, 6, 13) * 0.8, rows: [["super", "java.lang.Record"], ["fields", "name \xB7 age"], ["vtable", "toString, equals, \u2026"], ["mirror", "\u2192 Class (heap)"]] }), /* @__PURE__ */ React.createElement(Node3, { x: 870, y: 244, w: 330, h: 216, kind: "Method \xD7 6", name: "+ their bytecode", tone: "violet", a: E4(t, 13), glow: win3(t, 13, 17.5) * 0.8, nfs: 20, rows: [["<init>", "15 bytes"], ["name() \xB7 age()", ""], ["toString \xB7 equals", ""], ["hashCode", ""]] }), /* @__PURE__ */ React.createElement(Box4, { x: 500, y: 494, w: 700, h: 126, label: "runtime constant pool \xB7 60 entries", sub: "names, descriptors, string literals + resolved-entry cache (8.1)", tone: "violet", a: E4(t, 17.5), fs: 20, sfs: 17, glow: win3(t, 17.5, 23) * 0.8 }), /* @__PURE__ */ React.createElement(Panel3, { x: 1270, y: 190, w: 554, h: 460, title: "heap", tone: "pull", a: E4(t, 23) }), /* @__PURE__ */ React.createElement(Node3, { x: 1300, y: 250, w: 494, h: 150, kind: "instance \xB7 24 bytes", name: 'User "Ana"', tone: "pull", a: E4(t, 23.4), rows: [["header \xB7 klass", "\u2192 Klass", PAL4.violet, win3(t, 23.5, 31)], ["name \xB7 age", '\u2192 "Ana" \xB7 30']] }), /* @__PURE__ */ React.createElement(Node3, { x: 1300, y: 430, w: 494, h: 190, kind: "java.lang.Class \xB7 the mirror", name: "User.class", tone: "pull", a: E4(t, 31), glow: win3(t, 31, 40) * 0.7, rows: [["describes", "Users$User"], ["static fields", "stored here"], ["returned by", "getClass()"]] }), /* @__PURE__ */ React.createElement(Arrow3, { pts: [[1298, 340], [1250, 340], [1250, 477], [670, 477], [670, 464]], draw: M3(t, 24, 0.9), color: PAL4.violet }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 680, w: 860, h: 250, t, a: E4(t, 40), fs: 17, lh: 28, items: [
      { at: 40.4, text: "jcmd 1730 GC.class_histogram | grep -E 'java.lang.Class$|Live\\$User'", kind: "cmd" },
      { at: 41, text: "   3:         20000         480000  Live$User" },
      { at: 41.3, text: "   4:          1461         179968  java.lang.Class (java.base@17.0.17)", kind: "ok" },
      { at: 47, text: "java -XX:+PrintFlagsFinal -version | grep MaxMetaspaceSize", kind: "cmd" },
      { at: 47.6, text: "   size_t MaxMetaspaceSize = 18446744073709551615", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 1e3, y: 680, w: 824, tone: "pull", a: win3(t, 41, 47), fs: 19, title: "proof", text: "`Class` objects are counted in the **heap** histogram like any other object. The note's \u201Cloaded Class objects live in metaspace\u201D is not quite right: the **Klass** does." }), /* @__PURE__ */ React.createElement(Callout3, { x: 1e3, y: 680, w: 824, tone: "violet", a: E4(t, 47.2), fs: 19, title: "no limit by default", text: "2\u2076\u2074 \u2212 1: metaspace grows until the machine runs out. `-XX:MaxMetaspaceSize=256m` makes a runaway **fail fast** instead." }), /* @__PURE__ */ React.createElement(Badge3, { x: 1412, y: 860, text: "MetaspaceSize = 21 MB: only the first GC trigger", tone: "violet", a: E4(t, 55), fs: 17 }));
  }
  function SPermGen({ t }) {
    const fillP = lin3(t, 8, 5);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 200, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 0.5) }, "JAVA 7 AND EARLIER"), /* @__PURE__ */ React.createElement(Box4, { x: 96, y: 240, w: 250, h: 130, label: "young", tone: "pull", a: E4(t, 0.8) }), /* @__PURE__ */ React.createElement(Box4, { x: 356, y: 240, w: 300, h: 130, label: "old", tone: "green", a: E4(t, 1) }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 666, top: 240, width: 234, height: 130, boxSizing: "border-box", borderRadius: 12, border: `2px dashed ${PAL4.bad}`, background: PAL4.panel2, opacity: E4(t, 1.4), overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: 0, height: `${20 + fillP * 80}%`, background: hexA4(PAL4.violet, 0.4) } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", font: `600 22px ${MONO4}`, color: PAL4.ink } }, "PermGen"), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, top: 56, textAlign: "center", font: `400 17px ${MONO4}`, color: PAL4.ink2 } }, "fixed size")), /* @__PURE__ */ React.createElement(Brace3, { x: 96, y: 384, w: 804, label: "all managed by the GC as one heap", tone: "ink", a: E4(t, 2) }), /* @__PURE__ */ React.createElement(Box4, { x: 666, y: 440, w: 234, h: 52, label: "classes", tone: "violet", a: E4(t, 2.5), fs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 666, y: 500, w: 234, h: 52, label: "interned strings", tone: "pink", a: E4(t, 3), fs: 17, strike: t > 14.5 }), /* @__PURE__ */ React.createElement(Box4, { x: 666, y: 560, w: 234, h: 52, label: "static fields", tone: "pink", a: E4(t, 3.5), fs: 17, strike: t > 14.5 }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 452, fs: 20, w: 540, color: PAL4.ink2, a: E4(t, 7) }, "Sized with `-XX:MaxPermSize`. App servers that redeployed a few times filled it."), /* @__PURE__ */ React.createElement(Badge3, { x: 366, y: 560, text: "OutOfMemoryError: PermGen space", tone: "bad", a: POP3(t, 12.5), fs: 18, solid: true }), /* @__PURE__ */ React.createElement(Txt4, { x: 96, y: 620, fs: 19, w: 540, color: PAL4.pink, a: E4(t, 14.5) }, "Java 7: interned strings and statics moved to the normal heap."), /* @__PURE__ */ React.createElement(Txt4, { x: 1e3, y: 200, mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 19.5) }, "JAVA 8 AND LATER"), /* @__PURE__ */ React.createElement(Box4, { x: 1e3, y: 240, w: 330, h: 130, label: "young", tone: "pull", a: E4(t, 19.8) }), /* @__PURE__ */ React.createElement(Box4, { x: 1340, y: 240, w: 484, h: 130, label: "old", sub: "+ interned strings, Class mirrors, statics", tone: "green", a: E4(t, 20), sfs: 17 }), /* @__PURE__ */ React.createElement(Brace3, { x: 1e3, y: 384, w: 824, label: "Java heap", tone: "ink", a: E4(t, 20.3) }), /* @__PURE__ */ React.createElement(Panel3, { x: 1e3, y: 440, w: 824, h: 200, title: "metaspace", right: "native memory \xB7 grows on demand", tone: "violet", a: E4(t, 21), glow: win3(t, 21, 25) * 0.6 }), /* @__PURE__ */ React.createElement(Box4, { x: 1030, y: 510, w: 360, h: 90, label: "class metadata", sub: "Klass \xB7 methods \xB7 constant pools", tone: "violet", a: E4(t, 21.5), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(Box4, { x: 1420, y: 510, w: 374, h: 90, label: "no fixed size", sub: "cap it: -XX:MaxMetaspaceSize", tone: "violet", a: E4(t, 22), fs: 20, sfs: 17 }), /* @__PURE__ */ React.createElement(HArrow3, { x1: 910, x2: 990, y: 540, a: E4(t, 19.5), color: PAL4.violet, label: "Java 8", lfs: 17 }), /* @__PURE__ */ React.createElement(Callout3, { x: 96, y: 700, w: 1728, tone: "bad", a: E4(t, 25.5), fs: 21, text: "The **leak** that filled PermGen still exists in metaspace. Only the error message changed. Let's cause it on purpose." }));
  }
  function SClassLoaderLeak({ t }) {
    const leakN = t < 5 ? 0 : t < 19.5 ? Math.floor(lerp3(1, 6, lin3(t, 5, 12))) : Math.round(lerp3(6, 5e3, lin3(t, 19.5, 5.5)));
    const fixed = t >= 41;
    const deploys = fixed ? Math.round(lerp3(1, 2e5, lin3(t, 42, 6))) : leakN;
    const gaugeLeak = t < 19.5 ? lerp3(0.05, 0.12, lin3(t, 5, 14)) : lerp3(0.12, 1, lin3(t, 19.5, 5.5));
    const saw = 0.12 + 0.1 * ((t - 42) * 1.3 % 1);
    const frac = fixed ? lerp3(1, saw, M3(t, 41, 1)) : gaugeLeak;
    const rows = Math.min(6, Math.max(0, leakN));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code3, { x: 96, y: 190, w: 860, h: 292, title: fixed ? "Redeploy2.java: the same loop without the list" : "Redeploy.java (core)", a: E4(t, 0.4), fs: 19, lh: 32, hl: hlAt3(t, [[5, 3], [12, 4], [41, -1]])[0], hlA: hlAt3(t, [[5, 3], [12, 4], [41, -1]])[1], lines: [
      { s: "static List<Object> leaked = new ArrayList<>();", tone: fixed ? "bad" : void 0 },
      "",
      "for (int deploy = 1; ; deploy++) {",
      "    Class<?> c = new AppLoader().load(bytes);",
      { s: "    leaked.add(c);       // the leak", tone: fixed ? "bad" : void 0 },
      "}",
      '// AppLoader.load: defineClass("Users$User", bytes, \u2026)'
    ] }), /* @__PURE__ */ React.createElement(Panel3, { x: 1e3, y: 190, w: 440, h: 520, title: "heap", right: "class loaders", tone: "pull", a: E4(t, 4.5) }), /* @__PURE__ */ React.createElement(Box4, { x: 1030, y: 250, w: 380, h: 60, label: fixed ? "leaked (removed)" : "static List leaked", tone: fixed ? "dim" : "bad", strike: fixed, a: E4(t, 12), fs: 18, glow: win3(t, 12, 19) * 0.7 }), Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ React.createElement(Box4, { key: i, x: 1030, y: 330 + i * 58, w: 380, h: 48, label: `AppLoader #${i + 1}  \u2192 User copy`, tone: fixed ? "dim" : "pull", dashed: fixed, fs: 17, a: (i < rows ? E4(t, 5 + i * 2.2, 0.4) : 0) * (fixed ? 1 - E4(t, 42.5 + i * 0.15, 0.5) : 1) })), /* @__PURE__ */ React.createElement(Txt4, { x: 1220, y: 680, anchor: "mid", mono: true, fs: 17, color: fixed ? PAL4.flow : PAL4.ink2, a: E4(t, 19.5) }, fixed ? "old loaders \u2192 garbage \u2192 classes unloaded" : `+ ${fmtN2(Math.max(0, leakN - 6))} more, all still reachable`), /* @__PURE__ */ React.createElement(Txt4, { x: 1632, y: 196, anchor: "mid", mono: true, fs: 18, color: PAL4.ink3, a: E4(t, 5) }, "deploys"), /* @__PURE__ */ React.createElement(Txt4, { x: 1632, y: 222, anchor: "mid", mono: true, fs: 40, weight: 700, color: fixed ? PAL4.flow : t >= 25 ? PAL4.bad : PAL4.ink, a: E4(t, 5) }, fmtN2(deploys) + (!fixed && t >= 25 ? "+" : "")), /* @__PURE__ */ React.createElement(Gauge, { x: 1500, y: 322, w: 264, h: 470, frac, tone: "violet", a: E4(t, 5), capLabel: true, label: fixed ? "reused" : "metaspace", glow: pulse4(t, [25], 1.5) }), /* @__PURE__ */ React.createElement(Txt4, { x: 1632, y: 292, anchor: "mid", mono: true, fs: 17, color: PAL4.bad, a: E4(t, 19.5) }, "MaxMetaspaceSize = 32 MB"), /* @__PURE__ */ React.createElement(Badge3, { x: 1632, y: 830, text: "OutOfMemoryError: Metaspace", tone: "bad", solid: true, a: POP3(t, 25) * (1 - E4(t, 41, 0.4)), fs: 17 }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 510, w: 860, h: 420, t, a: E4(t, 19.5), fs: 17, lh: 25, items: [
      { at: 19.6, text: "java -XX:MaxMetaspaceSize=32m Redeploy", kind: "cmd" },
      { at: 20.4, text: "deploy 1000" },
      { at: 21.4, text: "deploy 2000" },
      { at: 22.4, text: "deploy 3000" },
      { at: 23.4, text: "deploy 4000" },
      { at: 24.4, text: "deploy 5000" },
      { at: 25, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Metaspace', kind: "err" },
      { at: 25.3, text: "    at java.base/java.lang.ClassLoader.defineClass1(Native Method)", kind: "err" },
      { at: 32, text: "java -XX:MaxMetaspaceSize=32m -Xlog:gc+metaspace Redeploy", kind: "cmd" },
      { at: 32.8, text: "\u2026 GC(15) Metaspace: 12724K(32768K)->12724K(32768K) NonClass: \u2026", kind: "ok" },
      { at: 42, text: "java -XX:MaxMetaspaceSize=32m Redeploy2", kind: "cmd" },
      { at: 46, text: "deploy 150000" },
      { at: 47.4, text: "deploy 200000" },
      { at: 48, text: "done: no leak, metaspace was reclaimed", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Callout3, { x: 1e3, y: 740, w: 440, tone: "violet", a: win3(t, 32.5, 41), fs: 17, text: "**12.7 MB used, 32 MB committed.** Each loader owns its own metaspace chunks, mostly empty." }), /* @__PURE__ */ React.createElement(Callout3, { x: 1e3, y: 740, w: 440, tone: "flow", a: E4(t, 50), fs: 18, text: "**OOM: Metaspace \u2248 a class loader leak**, not \u201Ctoo many classes\u201D." }));
  }
  var SEGS = [["non-nmethods", 5712, 1085, "ink", "interpreter, stubs"], ["profiled nmethods", 120016, 206, "pull", "C1 code, still profiling"], ["non-profiled nmethods", 120032, 86, "flow", "C2 code, fully optimised"]];
  function SCodeCache({ t }) {
    const X = 126, W = 1668, TOT = 245760;
    let x = X;
    const segs = SEGS.map(([l, kb, used, tone, d], i) => {
      const w = kb / TOT * W;
      const s = { l, kb, used, tone, d, x, w, i };
      x += w + (i === 0 ? 0 : 0);
      return s;
    });
    const jit = (k) => {
      const s = 2.5 + k * 0.6;
      const p = M3(t, s, 1);
      const tx = k % 2 ? segs[2].x + 40 + k * 22 : segs[1].x + 40 + k * 22;
      return p > 0 && p < 1 ? /* @__PURE__ */ React.createElement(Dot3, { key: k, x: lerp3(1600, tx, p), y: lerp3(456, 320, p), r: 8, color: k % 2 ? PAL4.flow : PAL4.pull }) : null;
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel3, { x: 96, y: 190, w: 1728, h: 300, title: "code cache", right: "ReservedCodeCacheSize = 240 MB \xB7 shared", tone: "blue", a: E4(t, 0.5) }), segs.map((s) => /* @__PURE__ */ React.createElement(React.Fragment, { key: s.l }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: s.x + 2, top: 280, width: s.w - 4, height: 80, boxSizing: "border-box", borderRadius: 8, border: `2px solid ${hexA4(toneColor4(s.tone), 0.85)}`, background: hexA4(toneColor4(s.tone), 0.08), opacity: E4(t, 1.5 + s.i * 0.3) } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: Math.max(3, s.used / s.kb * (s.w - 4)), background: hexA4(toneColor4(s.tone), 0.7), borderRadius: 6 } })), /* @__PURE__ */ React.createElement(Txt4, { x: s.i === 0 ? s.x : s.x + 14, y: s.i === 0 ? 372 : 372, mono: true, fs: 17, weight: 600, color: toneColor4(s.tone), a: E4(t, 1.8 + s.i * 0.3) }, s.i === 0 ? "" : s.l), /* @__PURE__ */ React.createElement(Txt4, { x: s.x + 14, y: 400, mono: true, fs: 17, color: PAL4.ink2, a: E4(t, 7 + s.i * 0.5) }, s.i === 0 ? "" : `${fmtN2(s.kb)} KB \xB7 ${s.d}`))), /* @__PURE__ */ React.createElement(Txt4, { x: segs[0].x, y: 244, mono: true, fs: 17, color: PAL4.ink2, a: E4(t, 7) }, "non-nmethods \xB7 5,712 KB \xB7 interpreter, stubs \u2193"), [0, 1, 2, 3, 4, 5, 6, 7].map(jit), /* @__PURE__ */ React.createElement(Badge3, { x: 1680, y: 456, text: "JIT: C1 \xB7 C2", tone: "blue", a: E4(t, 2), fs: 17 }), /* @__PURE__ */ React.createElement(Txt4, { x: 126, y: 440, mono: true, fs: 17, color: PAL4.ink3, a: E4(t, 13.5) }, "filled bars: used by a small running program (1,085 KB \xB7 206 KB \xB7 86 KB)"), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 506, w: 1728, h: 218, t, a: E4(t, 13.5), fs: 17, lh: 25, title: "terminal \xB7 bounds lines trimmed", items: [
      { at: 13.8, text: "jcmd 1700 Compiler.codecache", kind: "cmd" },
      { at: 14.4, text: "CodeHeap 'non-profiled nmethods': size=120032Kb used=86Kb max_used=86Kb free=119946Kb" },
      { at: 14.6, text: "CodeHeap 'profiled nmethods': size=120016Kb used=206Kb max_used=206Kb free=119809Kb" },
      { at: 14.8, text: "CodeHeap 'non-nmethods': size=5712Kb used=1085Kb max_used=1115Kb free=4626Kb" },
      { at: 15, text: " total_blobs=545 nmethods=175 adapters=287" },
      { at: 15.2, text: " compilation: enabled", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(Console3, { x: 96, y: 740, w: 1100, h: 200, t, a: E4(t, 19), fs: 17, lh: 25, title: "terminal \xB7 abridged \xB7 Many.java: 3,000 small methods, each called once", items: [
      { at: 19.4, text: "java -Xcomp -XX:ReservedCodeCacheSize=2496k \\", kind: "cmd" },
      { at: 19.6, text: "     -XX:-UseCodeCacheFlushing -XX:-SegmentedCodeCache Many", kind: "dim" },
      { at: 26, text: "[0.688s][warning][codecache] CodeCache is full. Compiler has been disabled.", kind: "err" },
      { at: 27.4, text: " compilation: disabled (not enough contiguous free space left)", kind: "dim" },
      { at: 32, text: "done 1738101675", kind: "ok" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 1228, y: 906, a: E4(t, 26) }), /* @__PURE__ */ React.createElement(Callout3, { x: 1228, y: 740, w: 596, tone: "blue", a: E4(t, 32.5), fs: 19, text: "**No exception.** The app keeps running, interpreted. Fix: a bigger `-XX:ReservedCodeCacheSize`." }));
  }

  // src/topics/8.3/scenes4.jsx
  var {
    PAL: PAL5,
    MOTION: MOTION5,
    lin: lin4,
    lerp: lerp4,
    win: win4,
    pulse: pulse5,
    step: step4,
    track: track5,
    hlAt: hlAt4,
    clamp: clamp5,
    hexA: hexA5,
    MONO: MONO5,
    SANS: SANS4,
    Txt: Txt5,
    Panel: Panel4,
    Box: Box5,
    Code: Code4,
    Console: Console4,
    HArrow: HArrow4,
    VArrow: VArrow4,
    Arrow: Arrow4,
    Dot: Dot4,
    Card: Card4,
    Node: Node4,
    Badge: Badge4,
    Callout: Callout4,
    Table: Table4,
    Mark: Mark4,
    Val: Val4,
    Brace: Brace4,
    toneColor: toneColor5
  } = window.AN;
  var E5 = MOTION5.enter;
  var M4 = MOTION5.move;
  var POP4 = MOTION5.pop;
  function SOffHeap({ t }) {
    const n = t < 6 ? 0 : t < 26 ? Math.min(2, Math.floor((t - 6) / 2) + 1) : Math.min(16, 2 + Math.floor((t - 26) / 0.3));
    const failed = t >= 30.6;
    const blk = (i) => [910 + i % 8 * 112, 268 + Math.floor(i / 8) * 100];
    const chip = (i) => [126 + i % 8 * 80, 330 + Math.floor(i / 8) * 60];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Panel4, { x: 96, y: 190, w: 700, h: 420, title: "heap", tone: "pull", a: E5(t, 0.5) }), /* @__PURE__ */ React.createElement(Txt5, { x: 126, y: 252, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 6) }, "List keep \u2192 DirectByteBuffer objects (small)"), Array.from({ length: 16 }).map((_, i) => /* @__PURE__ */ React.createElement(Box5, { key: i, x: chip(i)[0], y: chip(i)[1], w: 66, h: 44, label: "DBB", tone: "pull", fs: 17, a: i < n ? E5(t, i < 2 ? 6 + i * 2 : 26 + (i - 2) * 0.3, 0.2) : 0 })), /* @__PURE__ */ React.createElement(Box5, { x: chip(16)[0], y: chip(16)[1], w: 66, h: 44, label: "DBB", tone: "bad", dashed: true, fs: 17, a: E5(t, 30.4) * (1 - E5(t, 31.4)) }), /* @__PURE__ */ React.createElement(Panel4, { x: 880, y: 190, w: 944, h: 420, title: "native memory \xB7 off-heap", right: t >= 19.5 ? "MaxDirectMemorySize = 16 MB" : "", tone: "pink", a: E5(t, 0.8) }), Array.from({ length: 16 }).map((_, i) => /* @__PURE__ */ React.createElement(Box5, { key: i, x: blk(i)[0], y: blk(i)[1], w: 100, h: 84, label: "1 MB", tone: "pink", fs: 18, a: i < n ? E5(t, i < 2 ? 6.4 + i * 2 : 26.2 + (i - 2) * 0.3, 0.2) : 0, glow: i < 2 ? win4(t, 13, 19) * 0.6 : 0 })), /* @__PURE__ */ React.createElement(Box5, { x: 910, y: 468, w: 100, h: 84, label: "1 MB?", tone: "bad", dashed: true, fs: 18, a: E5(t, 30.6), strike: true }), /* @__PURE__ */ React.createElement(Mark4, { x: 1e3, y: 476, ok: false, a: E5(t, 30.8) }), /* @__PURE__ */ React.createElement(Arrow4, { pts: [[159, 328], [159, 304], [850, 304], [850, 310], [906, 310]], draw: M4(t, 7, 0.8), color: PAL5.pink }), /* @__PURE__ */ React.createElement(Txt5, { x: 520, y: 280, anchor: "mid", mono: true, fs: 17, color: PAL5.pink, a: E5(t, 7.6) }, "owns"), /* @__PURE__ */ React.createElement(Badge4, { x: 1352, y: 510, text: "kernel reads/writes here directly \xB7 no copy", tone: "pink", a: win4(t, 13, 26), fs: 17 }), /* @__PURE__ */ React.createElement(Badge4, { x: 1420, y: 510, text: "16 MB allocated = 16 MB limit", tone: "bad", a: E5(t, 30.6), fs: 17, solid: true }), /* @__PURE__ */ React.createElement(Txt5, { x: 126, y: 500, fs: 19, w: 640, color: PAL5.ink2, a: E5(t, 38.5) }, "A buffer's native block is freed only when its tiny heap object is collected. The heap can look healthy while native memory runs out."), /* @__PURE__ */ React.createElement(Console4, { x: 96, y: 640, w: 1728, h: 210, t, a: E5(t, 26), fs: 17, lh: 30, items: [
      { at: 26.2, text: "java -XX:MaxDirectMemorySize=16m Direct      # keep allocateDirect(1 MB) in a list", kind: "cmd" },
      { at: 30.8, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 16777216, limit: 16777216)', kind: "err" },
      { at: 31.2, text: "    at java.base/java.nio.Bits.reserveMemory(Bits.java:178)" },
      { at: 31.4, text: "    at java.base/java.nio.DirectByteBuffer.<init>(DirectByteBuffer.java:121)" }
    ] }), /* @__PURE__ */ React.createElement(RealTag, { x: 96, y: 862, a: E5(t, 31) }));
  }
  var ERRS = [
    [5, "StackOverflowError", "stack", "deep or endless recursion", 0, 'Exception in thread "main" java.lang.StackOverflowError'],
    [11, "OOM: Java heap space", "heap", "a leak (8.7), or -Xmx too small", 1, 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space'],
    [18, "OOM: GC overhead limit exceeded", "heap", "a leak; Parallel GC gives up early", 1, 'Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded'],
    [27, "OOM: Metaspace", "metaspace", "class loader leak (8.2)", 2, 'Exception in thread "main" java.lang.OutOfMemoryError: Metaspace'],
    [33, "OOM: Cannot reserve \u2026 direct buffer memory", "direct", "buffers never released", 3, "java.lang.OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 16777216, limit: 16777216)"],
    [39.5, "OOM: unable to create native thread", "OS threads", "too many threads, or OS limits", 4, "java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached"],
    [46.5, "OOM: Requested array size exceeds VM limit", "heap", "length near Integer.MAX_VALUE", 1, 'Exception in thread "main" java.lang.OutOfMemoryError: Requested array size exceeds VM limit'],
    [54, "warning: CodeCache is full", "code cache", "JIT output outgrew the cache", 5, "OpenJDK 64-Bit Server VM warning: CodeCache is full. Compiler has been disabled."]
  ];
  var AREAS = [["thread stacks", "flow"], ["heap", "pull"], ["metaspace", "violet"], ["direct memory", "pink"], ["OS threads", "ink"], ["code cache", "blue"]];
  function SErrorMap({ t }) {
    const cur = ERRS.filter((e) => t >= e[0]).length - 1;
    const live = cur >= 0 && t < 61 ? ERRS[cur] : null;
    const marks = {};
    if (live) marks[cur] = [cur === 7 ? "blue" : "bad", 1];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      Table4,
      {
        x: 96,
        y: 196,
        cols: [600, 200, 520],
        head: ["message", "area", "usual cause"],
        a: E5(t, 0.5),
        fs: 18,
        rh: 60,
        rows: ERRS.map((e) => [e[1], e[2], e[3]]),
        rowA: ERRS.map((e) => E5(t, e[0])),
        marks,
        colColors: [PAL5.ink, PAL5.pull, PAL5.ink2]
      }
    ), AREAS.map(([l, tone], i) => {
      const on = live && live[4] === i;
      return /* @__PURE__ */ React.createElement(Box5, { key: l, x: 1470, y: 196 + i * 90, w: 354, h: 74, label: l, tone, a: E5(t, 1 + i * 0.15), glow: on ? 1 : 0, s: on ? 1.04 : 1, fs: 21, fill: on ? true : void 0 });
    }), /* @__PURE__ */ React.createElement(
      Console4,
      {
        x: 96,
        y: 760,
        w: 1728,
        h: 110,
        t,
        a: E5(t, 5) * (1 - E5(t, 61, 0.4)),
        fs: 17,
        lh: 30,
        title: "the message, exactly as printed (JDK 17)",
        items: ERRS.map((e, i) => ({ at: e[0] + 0.3, text: e[5], kind: i === 7 ? "ok" : "err" }))
      }
    ), /* @__PURE__ */ React.createElement(Callout4, { x: 96, y: 760, w: 1728, tone: "bad", a: E5(t, 61.2), fs: 22, text: "**Read the message, not just the class name.** Seven messages, six areas, different causes and fixes. \u201CWe got an OOM\u201D is not a diagnosis." }));
  }
  function SReadTheMessage({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: 192, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 0.5) }, 'Overhead.java: map.put(i, "v" + i) forever, -Xmx64m'), /* @__PURE__ */ React.createElement(Console4, { x: 96, y: 226, w: 880, h: 190, t, a: E5(t, 1), fs: 17, lh: 30, title: "Parallel GC", items: [
      { at: 5, text: "java -XX:+UseParallelGC -Xmx64m Overhead", kind: "cmd" },
      { at: 6.5, text: 'Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded', kind: "err" },
      { at: 7, text: "# after 2.5 s: 98% of time in GC, under 2% freed", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Console4, { x: 992, y: 226, w: 832, h: 190, t, a: E5(t, 1.4), fs: 17, lh: 30, title: "G1 (the default)", items: [
      { at: 13, text: "java -Xmx64m Overhead", kind: "cmd" },
      { at: 14, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space', kind: "err" },
      { at: 14.5, text: "# after 0.4 s: G1 has no overhead limit on JDK 17", kind: "dim" }
    ] }), /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: 446, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 19) }, "BigArray.java: new long[n], -Xmx64m"), /* @__PURE__ */ React.createElement(Console4, { x: 96, y: 480, w: 1728, h: 190, t, a: E5(t, 19), fs: 17, lh: 30, items: [
      { at: 19.4, text: "java -Xmx64m BigArray 2147483645", kind: "cmd" },
      { at: 20, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Java heap space', kind: "err" },
      { at: 25, text: "java -Xmx64m BigArray 2147483646", kind: "cmd" },
      { at: 25.6, text: 'Exception in thread "main" java.lang.OutOfMemoryError: Requested array size exceeds VM limit', kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Badge4, { x: 1500, y: 612, text: "Integer.MAX_VALUE \u2212 1: no heap size helps", tone: "bad", a: E5(t, 26), fs: 17 }), /* @__PURE__ */ React.createElement(Txt5, { x: 96, y: 700, mono: true, fs: 17, color: PAL5.ink3, a: E5(t, 32) }, "Leak.java (the User cache) under G1, -Xmx32m"), /* @__PURE__ */ React.createElement(Console4, { x: 96, y: 734, w: 1728, h: 160, t, a: E5(t, 32), fs: 17, lh: 30, items: [
      { at: 32.4, text: "java -Xmx32m Leak", kind: "cmd" },
      { at: 33, text: "300000 users cached" },
      { at: 33.8, text: 'Exception: java.lang.OutOfMemoryError thrown from the UncaughtExceptionHandler in thread "main"', kind: "err" }
    ] }), /* @__PURE__ */ React.createElement(Badge4, { x: 1500, y: 706, text: "even reporting the error needed memory", tone: "bad", a: E5(t, 35), fs: 17 }));
  }
  function SEscapeAnalysis({ t }) {
    const offN = Math.max(0, Math.min(10, Math.floor((t - 12) / 0.55) + 1));
    const cyc = t >= 25.5 ? (t - 25.5) % 3.2 / 3.2 : -1;
    const [hl, hA] = hlAt4(t, [[6, 5], [18, 5], [25.5, 6], [33, -1]]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Code4, { x: 96, y: 190, w: 820, h: 428, title: "Escape.java", a: E5(t, 0.4), fs: 18, lh: 30, hl, hlA: hA, lines: [
      "record Point(int x, int y) {}",
      "",
      "static long sum(int n) {",
      "    long total = 0;",
      "    for (int i = 0; i < n; i++) {",
      "        var p = new Point(i, i + 1);   // allocate?",
      "        total += p.x() + p.y();",
      "    }",
      "    return total;",
      "}",
      "// main: warm up, then measure sum(100_000_000)",
      "//   with ThreadMXBean.getThreadAllocatedBytes"
    ] }), /* @__PURE__ */ React.createElement(Panel4, { x: 960, y: 190, w: 864, h: 200, title: "interpreted, or -XX:-DoEscapeAnalysis", tone: "bad", a: E5(t, 12) }), Array.from({ length: 10 }).map((_, k) => /* @__PURE__ */ React.createElement(Box5, { key: k, x: 990 + k * 80, y: 262, w: 70, h: 64, label: "Point", sub: "24 B", tone: k < offN - 3 ? "dim" : "pull", fs: 17, sfs: 16, a: k < offN ? E5(t, 12 + k * 0.55, 0.2) : 0 })), /* @__PURE__ */ React.createElement(Txt5, { x: 990, y: 344, mono: true, fs: 17, color: PAL5.ink2, a: E5(t, 13) }, "a real heap object every iteration \xB7 garbage one line later"), /* @__PURE__ */ React.createElement(Panel4, { x: 960, y: 420, w: 864, h: 200, title: "C2 + escape analysis (the default)", tone: "flow", a: E5(t, 18) }), /* @__PURE__ */ React.createElement(Txt5, { x: 990, y: 480, mono: true, fs: 17, color: PAL5.ink2, a: win4(t, 18.5, 25.5) }, "does p escape? stored in a field? returned? passed on?"), /* @__PURE__ */ React.createElement(Badge4, { x: 1392, y: 530, text: "no: p never leaves sum()", tone: "flow", a: win4(t, 21.5, 25.5), fs: 18 }), cyc >= 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box5, { x: 990, y: 490, w: 160, h: 70, label: "new Point", tone: "pull", dashed: true, fs: 18, a: (1 - lin4(cyc, 0.2, 0.25)) * E5(t, 25.5), strike: cyc > 0.15 }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 1160, x2: 1310, y: 525, a: E5(t, 26), color: PAL5.flow, label: "scalar replaced", lfs: 17 }), /* @__PURE__ */ React.createElement(Box5, { x: 1320, y: 480, w: 230, h: 44, label: "x \u2192 register", tone: "flow", fs: 17, a: E5(t, 26.2), glow: pulse5(t, [26.4], 1) }), /* @__PURE__ */ React.createElement(Box5, { x: 1320, y: 534, w: 230, h: 44, label: "y \u2192 register", tone: "flow", fs: 17, a: E5(t, 26.4), glow: pulse5(t, [26.6], 1) }), /* @__PURE__ */ React.createElement(Txt5, { x: 1576, y: 512, mono: true, fs: 17, color: PAL5.flow, a: E5(t, 27) }, "no object \xB7 no GC")), /* @__PURE__ */ React.createElement(
      Table4,
      {
        x: 96,
        y: 650,
        cols: [480, 360, 340],
        head: ["JDK 17 run", "bytes allocated", "young GCs (whole run)"],
        a: E5(t, 33),
        fs: 20,
        rh: 56,
        colColors: [PAL5.ink, PAL5.pull, PAL5.ink2],
        rows: [["default \xB7 escape analysis on", "0", "0"], ["-XX:-DoEscapeAnalysis", "2,400,000,000", "19"], ["-Xint \xB7 no JIT at all", "2,400,000,000", "32"]],
        rowA: [E5(t, 33.4), E5(t, 40), E5(t, 42)],
        marks: { 0: ["flow", win4(t, 33.4, 40)], 1: ["bad", win4(t, 40, 48)] }
      }
    ), /* @__PURE__ */ React.createElement(RealTag, { x: 96, y: 882, a: E5(t, 33.4), text: "real output \xB7 100,000,000 Points \xB7 24 bytes each" }), /* @__PURE__ */ React.createElement(Callout4, { x: 1316, y: 650, w: 508, tone: "flow", a: E5(t, 48), fs: 19, title: "semantics", text: "\u201CObjects live on the heap\u201D is the right model for sharing and pass-by-value." }), /* @__PURE__ */ React.createElement(Callout4, { x: 1316, y: 790, w: 508, tone: "pull", a: E5(t, 54.5), fs: 19, title: "performance", text: "It's the wrong model for cost. Measure before you avoid `new` (8.8)." }));
  }
  var TRAPS = [
    [3, "\u201CWe got an OOM\u201D", "Which one? Each message names a different area, cause and fix."],
    [9, "\u201COOM: Metaspace means too many classes\u201D", "Almost always a **class loader leak**: old loaders that never die."],
    [15, "\u201CThe container\u2019s memory is my heap\u201D", "By default it is **25%**: a 1 GB container gets a 256 MB heap."],
    [21, "\u201CThe stack is garbage collected\u201D", "Frames just pop. Only heap objects wait for the GC."],
    [27, "\u201CEvery `new` allocates on the heap\u201D", "Escape analysis can delete the object entirely."],
    [33, "\u201CCatch OutOfMemoryError and carry on\u201D", "The handler needs memory too, and state may be half-updated. Let it die; restart."]
  ];
  function STraps({ t }) {
    return TRAPS.map(([at, myth, real], i) => {
      const y = 196 + i * 120;
      return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement(Box5, { x: 96, y, w: 760, h: 104, label: myth, mono: false, fs: 22, tone: "bad", a: E5(t, at), strike: t > at + 2 }), /* @__PURE__ */ React.createElement(HArrow4, { x1: 870, x2: 940, y: y + 52, a: E5(t, at + 1.5), color: PAL5.flow }), /* @__PURE__ */ React.createElement(Card4, { x: 956, y, w: 868, h: 104, a: E5(t, at + 1.6), tone: "flow", title: real, tfs: 22 }));
    });
  }
  var RECAP = [
    [3, "1", "The map", "Per thread: PC register + stack. Shared: heap, metaspace, code cache."],
    [8.5, "2", "The stack", "Frames push and pop. Fixed size \u2192 `StackOverflowError`. 1\u20132 MB per platform thread."],
    [14, "3", "The heap", "Every object. Eden \u2192 survivors \u2192 old. TLABs make `new` a pointer bump."],
    [19.5, "4", "Metaspace", "Class metadata in native memory, unlimited by default. Leak \u2192 `OOM: Metaspace`."],
    [25, "5", "Read the message", "Each `OutOfMemoryError` names the area that ran out."],
    [30, "6", "A useful lie", "Escape analysis can remove an allocation entirely."]
  ];
  function SRecap({ t }) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, RECAP.map(([at, n, title, sub], i) => /* @__PURE__ */ React.createElement(Card4, { key: n, x: 96 + i % 3 * 584, y: 210 + Math.floor(i / 3) * 290, w: 560, h: 260, num: n, title, sub, tfs: 34, sfs: 23, a: E5(t, at), tone: i === 4 ? "pull" : void 0, glow: i === 4 ? win4(t, 25, 40) : 0 })));
  }

  // src/topics/8.3.jsx
  var chapters = ["Intro", "The map", "The stack", "The heap", "Metaspace", "Other regions", "Which error?", "A useful lie", "Traps", "Recap"];
  var scenes = [
    { name: "Intro", dur: 26, ch: 0, title: "", C: SIntro },
    { name: "ProcessMap", dur: 60, ch: 1, title: "One process, two kinds of memory", C: SProcessMap },
    { name: "Nmt", dur: 42, ch: 1, title: "The map, measured", C: SNmt },
    { name: "Frames", dur: 78, ch: 2, title: "Frames push and pop as the program runs", C: SFrames },
    { name: "FrameAnatomy", dur: 46, ch: 2, title: "What's inside a frame", C: SFrameAnatomy },
    { name: "Overflow", dur: 62, ch: 2, title: "StackOverflowError: the stack has a size", C: SOverflow },
    { name: "ThreadCost", dur: 46, ch: 2, title: "Why a million platform threads don't fit", C: SThreadCost },
    { name: "Generations", dur: 50, ch: 3, title: "The heap is split by age", C: SGenerations },
    { name: "MinorGC", dur: 78, ch: 3, title: "A minor GC, step by step", C: SMinorGC },
    { name: "TLAB", dur: 62, ch: 3, title: "TLABs: why `new` is cheap", C: STLAB },
    { name: "G1Regions", dur: 48, ch: 3, title: "G1: the same generations, in regions", C: SG1Regions },
    { name: "Sizing", dur: 48, ch: 3, title: "Sizing the heap, and the container trap", C: SSizing },
    { name: "Metaspace", dur: 62, ch: 4, title: "Metaspace: where classes live", C: SMetaspace },
    { name: "PermGen", dur: 30, ch: 4, title: "Before Java 8: PermGen", C: SPermGen },
    { name: "ClassLoaderLeak", dur: 58, ch: 4, title: "OutOfMemoryError: Metaspace", C: SClassLoaderLeak },
    { name: "CodeCache", dur: 44, ch: 5, title: "The code cache: where JIT output lives", C: SCodeCache },
    { name: "OffHeap", dur: 44, ch: 5, title: "Off-heap on purpose: direct buffers", C: SOffHeap },
    { name: "ErrorMap", dur: 70, ch: 6, title: "Which error comes from which area", C: SErrorMap },
    { name: "ReadTheMessage", dur: 42, ch: 6, title: "Same program, different messages", C: SReadTheMessage },
    { name: "EscapeAnalysis", dur: 64, ch: 7, title: "\u201CEverything is on the heap\u201D is a useful lie", C: SEscapeAnalysis },
    { name: "Traps", dur: 42, ch: 8, title: "Traps", C: STraps },
    { name: "Recap", dur: 38, ch: 9, title: "Recap", C: SRecap }
  ];
  var captions = {
    Intro: [[0.8, "Every Java program splits its memory into a few areas, each with its own job."], [6, "Objects live on a shared **heap**. The variables pointing at them live on a private **stack**."], [12.5, "The classes themselves live somewhere else again: **metaspace**."], [17, "Each area fails in its own way. Know which one ran out, and you know what kind of bug you have."], [22, 'One small program carries us through: `makeUser("Ana")`.']],
    ProcessMap: [[0.5, "A running JVM is one operating-system process. Inside it, memory splits two ways."], [6, "Some areas belong to **one thread**. Here are two: `main`, and a `worker` thread."], [12, "Each thread has a **PC register**: the bytecode offset it is executing right now. Each moves on its own."], [19, "And each has its own **JVM stack**. Both threads are inside `makeUser`, with separate frames and locals."], [26, "The JVM spec also lists a native method stack. HotSpot runs both on one OS thread stack."], [32.5, "Everything else is **shared**. The **heap** holds every object, whichever thread made it."], [39.5, "**Metaspace** holds the classes: `User` is loaded once, for all threads."], [45.5, "The **code cache** holds machine code compiled by the JIT. Shared too."], [51, "Private stacks, shared heap. Hand the worker a reference to Ana, and both threads see one object."]],
    Nmt: [[0.5, "Don't take the map on trust. HotSpot can account for every byte it uses."], [5.5, "Start the JVM with `-XX:NativeMemoryTracking=summary`, then ask it with `jcmd`."], [11, "Java Heap: 2 GB **reserved**, the default maximum here. Only 130 MB **committed**: backed by real memory."], [19, "Class is metaspace. It reserves 1 GB of address space for compressed class pointers, and uses a few hundred KB."], [27, "Thread: 19 threads with about 2 MB of stack each. The JVM made most of them for itself: GC, JIT, signals."], [35, "Code is the code cache: 242 MB reserved, 7.5 MB in use. The pattern everywhere: reserve big, commit as needed."]],
    Frames: [[0.5, "Our running example. Watch the stack of thread `main` while it runs."], [4.5, "`main` starts: the JVM pushes a frame for it, with a slot for `args`."], [9.5, 'Calling `makeUser("Ana")` pushes a new frame on top. Its parameter `name` refers to the string "Ana".'], [17, "`int age = 30` is a primitive: the value 30 itself sits in the frame."], [22, "`new User(name, age)` allocates the object on the heap. The local `u` holds only a reference to it."], [30, "`return u` copies that reference to the caller. The `makeUser` frame is popped: its slots are gone."], [37, "The object survives, because `main`'s local `ana` still points at it."], [43, 'Now `makeUser("Bob")`. Another frame, another User on the heap.'], [50, "But `main` drops the result: the bytecode is a `pop`. That frame pops too."], [56, "Bob is still in the heap, but nothing points at it. It is **unreachable**: garbage, waiting for the GC."], [63.5, "`println(ana.name())` prints Ana. Then `main` returns and its frame pops."], [69, "Stack memory is reclaimed instantly by popping. Heap memory waits for the garbage collector."]],
    FrameAnatomy: [[0.5, "Zoom into one frame. It holds three things."], [4, "**Local variable slots**: parameters and locals. Primitives by value, objects by reference."], [10.5, "The **operand stack**: scratch space for the bytecode. Here, halfway through `new User(name, age)`."], [17.5, "**Frame data**: where to return to in the caller, and a link to the class's constant pool."], [24, "Its size is fixed before the call: `max_locals` and `max_stack` come from the class file."], [30, "See real stacks with `jcmd <pid> Thread.print`. Two threads, two separate stacks, both inside `makeUser`."], [38.5, "Look at the top frame: `Thread.sleep` is a native method, running on the very same thread stack."]],
    Overflow: [[0.5, "A thread stack has a fixed maximum size. Recursion with no end finds it fast."], [5, "`down()` calls itself forever. Every call pushes one more frame."], [10.5, "This thread has a 2 MB stack: the default on this Mac. On Linux x64 it is 1 MB."], [16, "Frames pile up, about 100 bytes each for this tiny method when interpreted."], [22, "At the top sit guard pages. Touching them makes the JVM throw `StackOverflowError`."], [29, "Real runs with `-Xint`: double `-Xss` and the depth roughly doubles. 1,479 frames at 256 KB, 42,439 at 4 MB."], [38, "With the JIT on, depth wobbles from run to run: compiled frames are smaller than interpreted ones."], [45.5, "Endless recursion prints the same line again and again. HotSpot keeps only the top 1,024 frames."], [53, "The fix is almost never a bigger `-Xss`. It is a base case, or a loop instead of recursion."]],
    ThreadCost: [[0.5, "Every platform thread is an OS thread, and the OS reserves its whole stack up front."], [6, "Here that is 2 MB each. A thousand threads reserve 2 GB of address space."], [12, "A million would need 2 TB, or 1 TB with Linux's 1 MB. That is why a million platform threads never fit."], [19, "Try it: start sleeping threads until something breaks. This Mac stopped at 2,026."], [25.5, "`unable to create native thread`: the OS said no. macOS caps a process at 2,048 threads."], [32.5, "**Virtual threads** (Java 21) keep their frames in small heap chunks that grow only as needed."], [39.5, "Millions of them share a few carrier threads. That is Part 09."]],
    Generations: [[0.5, "The heap is not one big pool. HotSpot splits it by the age of its objects."], [5.5, "A real layout: the Serial collector with `-Xmx256m`, read with `jcmd GC.heap_info`."], [12, "The **young generation**: **eden**, where every new object is born, plus two **survivor** spaces."], [19.5, "Eden is 8 times the size of one survivor space: `-XX:SurvivorRatio=8`."], [25, "The **old generation** holds objects that survived a while. It is twice the young: `-XX:NewRatio=2`."], [33, "Why split? Most objects die young, so collecting just the young part finds mostly garbage. Cheap."], [41, "Our Users are born in eden, which is 54% full right now. What happens when it fills?"]],
    MinorGC: [[0.5, "A minor GC, step by step. Eden fills up with new objects."], [4, "Allocation is fast: each new User goes right after the previous one."], [9.5, "Most of them are garbage already: their frames have popped. Only three are still referenced."], [14, "Eden is full, so a **minor GC** runs. It copies the live objects into survivor space S0, with age 1."], [19.5, "Then it declares all of eden empty, garbage included, without ever visiting the dead objects."], [24, "Eden fills again."], [30, "Next minor GC: live objects from eden **and** S0 are copied into S1. Those that survived again are now age 2."], [38, "So one survivor space is always empty. The two swap roles on every collection."], [44, "Each survival adds one to the age. At `MaxTenuringThreshold`, 15 by default\u2026"], [52, "\u2026the object is **promoted**: copied into the old generation, which is collected far less often."], [59, "Real log, Serial GC: 17 MB of eden collected down to almost nothing in under a millisecond."], [66.5, "And at GC 15 the first batch reached age 15: the tenured space jumped from 0 K to 581 K."], [71.5, "A minor GC's cost depends on what survives, not on how much garbage there is."]],
    TLAB: [[0.5, "Every thread allocates into the same eden. Do they have to queue for it?"], [5, "If all threads bumped one shared pointer, every `new` would need an atomic operation, and threads would collide."], [11.5, "So each thread gets its own chunk of eden: a **TLAB**, a thread-local allocation buffer."], [17, "Allocating is now a pointer bump: the object goes at `top`, and `top` moves past it."], [24, "The worker bumps its own pointer at the same moment. No lock, no atomic, no sharing."], [31, "When a TLAB is full, the thread retires it and grabs a fresh chunk: one atomic step on eden's shared top."], [39, "Real numbers: each TLAB here is 349 KB. Filling eden, about 750,000 objects, took only about 51 refills."], [48, "So `new` is usually a handful of instructions: bump, write the header, zero the fields."], [55, "And freeing is free: after a minor GC, eden and all its TLABs simply start again from empty."]],
    G1Regions: [[0.5, "That fixed layout is the classic picture. The default collector, **G1**, keeps the generations but not the layout."], [7, "It cuts the heap into equal **regions**: 1 MB each here. A 64 MB heap is 64 regions."], [13, "Each region gets a role. Right before the first GC, 23 are eden; 2 hold the CDS archive."], [19.5, "A young GC evacuates eden into a survivor region. Real log: eden 23 \u2192 0, survivor 0 \u2192 1."], [27, "Then G1 picks a new eden size, 37 regions, to meet its pause-time goal. No fixed ratio."], [34, "An object of half a region or more is **humongous**: it gets its own run of regions, counted as old."], [41, "Same ideas, young and old, copy the survivors, in a flexible layout. 8.6 compares the collectors."]],
    Sizing: [[0.5, "You size these areas with a handful of flags. Here are the defaults this JVM picked."], [6, "`-Xmx` is the maximum heap. Unset, it is 25% of RAM: 2 GB on this 8 GB Mac."], [12.5, "`-Xms` is the starting size, 128 MB here. Servers often set it equal to `-Xmx` to skip resizing."], [20, "Then the ratios and the tenuring age you have already seen."], [25.5, "In a container the JVM reads the cgroup limit, not the host's RAM, and still takes 25%."], [31.5, "A 1 GB container gets a 256 MB heap by default. Often far too small: set `-Xmx` or `-XX:MaxRAMPercentage`."], [40, "Tiny limits get 50% instead, and with a single CPU the JVM even picks the Serial collector."]],
    Metaspace: [[0.5, "When a class loads, its description goes into **metaspace**: memory outside the Java heap."], [6, "For `User` that is a **Klass**: the VM's own structure, with its superclass, field layout and vtable."], [13, "Its **methods**, and their bytecode."], [17.5, "And its **runtime constant pool**: 60 entries for this little record."], [23, "Every User in the heap starts with a header pointing at that Klass. That is how an object knows its class."], [31, "The `java.lang.Class` object from `User.class` is different: an ordinary heap object, a mirror. Static fields live in it."], [40, "Proof: a heap histogram lists `java.lang.Class` like any other object, 1,461 of them here."], [47, "Metaspace is native memory with no limit by default: `MaxMetaspaceSize` is the largest 64-bit number."], [55, "Set `-XX:MaxMetaspaceSize`, and a runaway fails fast instead of eating the machine."]],
    PermGen: [[0.5, "Before Java 8, class metadata lived in **PermGen**: a fixed-size area managed together with the heap."], [7, "You sized it with `-XX:MaxPermSize`, and often guessed wrong. Redeploy an app a few times and it filled up."], [14, "Java 7 moved interned strings and static fields out of PermGen into the normal heap."], [19.5, "Java 8 removed PermGen. Class metadata moved to **metaspace**, in native memory, with no fixed size."], [25.5, "The leak that filled PermGen still exists, though. Let's cause it on purpose."]],
    ClassLoaderLeak: [[0.5, "Simulate an app server that redeploys the same app again and again."], [5, "Each deploy creates a fresh class loader, which loads its own copy of `User` into metaspace."], [12, "A class can only be unloaded when its loader is unreachable. But a static list holds on to every one."], [19.5, "So metaspace only grows. With `-XX:MaxMetaspaceSize=32m`\u2026"], [25, "\u2026the JVM gives up after about 5,000 deploys: `OutOfMemoryError: Metaspace`."], [32, "The GC tried: metaspace stuck at 12.7 MB used, 32 MB committed. Every loader owns its own chunks."], [41, "Now remove the leak. Old loaders become garbage, their classes are unloaded, and metaspace is reused."], [48, "200,000 deploys, no error. **OOM: Metaspace almost always means a class loader leak**, not too many classes."]],
    CodeCache: [[0.5, "When the JIT compiles a hot method, the machine code lands in the **code cache**: shared, outside the heap."], [7, "HotSpot splits it in three: VM stubs, C1 code that still profiles, and fully optimised C2 code."], [13.5, "This JVM reserves 240 MB for it. A small program uses a few hundred KB."], [19, "Shrink it to 2.5 MB, compile 3,000 methods eagerly with `-Xcomp`, turn flushing off: it fills."], [26, "No exception. Only a warning: `CodeCache is full. Compiler has been disabled.`"], [32, "The program finishes, but whatever is not compiled yet stays interpreted. In a server, throughput quietly collapses."], [39, "Watch your logs for that warning. The fix is a bigger `-XX:ReservedCodeCacheSize`."]],
    OffHeap: [[0.5, "Some memory belongs to your program but sits outside the heap on purpose: **direct buffers**."], [6, "`ByteBuffer.allocateDirect` creates a small object on the heap that owns a block of native memory."], [13, "The OS can read and write that block directly, with no copy. NIO, Netty and many drivers rely on it."], [19.5, "The total is capped by `-XX:MaxDirectMemorySize`. Its default, 0, means: as big as the max heap."], [26, "Keep 1 MB buffers with the cap at 16 MB, and the 17th one fails."], [32, "JDK 17 spells it out: allocated 16 MB of a 16 MB limit. Older JDKs just said `Direct buffer memory`."], [38.5, "The native block is freed only when its small heap object is collected. Tiny on heap, huge off it."]],
    ErrorMap: [[0.5, "The practical payoff: every out-of-memory message names the area that ran out."], [5, "`StackOverflowError`: one thread's stack. Deep or endless recursion."], [11, "`Java heap space`: the heap. A real leak, or `-Xmx` simply too small for the workload."], [18, "`GC overhead limit exceeded`: the heap again. 98% of time in GC, under 2% freed. On JDK 17 only Parallel GC throws it."], [27, "`Metaspace`: class metadata. Almost always a class loader leak."], [33, "`Cannot reserve \u2026 direct buffer memory`: off-heap NIO buffers that are never released."], [39.5, "`unable to create native thread`: the OS refused another thread. Too many threads, or a ulimit."], [46.5, "`Requested array size exceeds VM limit`: an array length near `Integer.MAX_VALUE`, whatever the heap size."], [54, "A full code cache is not an error at all, only a warning. That makes it easy to miss."], [61, 'Same exception class, seven messages, six areas, different fixes. "We got an OOM" is not a diagnosis.']],
    ReadTheMessage: [[0.5, "The message depends on more than your code. Here is one leak under two collectors."], [5, "Parallel GC notices it is collecting constantly for almost nothing, and gives up: `GC overhead limit exceeded`."], [12.5, "G1, the default, keeps going until an allocation truly fails: `Java heap space`."], [19, "Array lengths: 2,147,483,645 longs is simply too big for a 64 MB heap."], [25, "One more, and it is beyond what this VM can ever allocate: `Requested array size exceeds VM limit`."], [32, "And sometimes the error cannot even be printed: the default handler ran out of memory reporting it."], [37.5, "That is why catching `OutOfMemoryError` to recover rarely works."]],
    EscapeAnalysis: [[0.5, "The standard teaching: primitives and references on the stack, objects on the heap. Mostly true."], [6, "Take this loop: it makes a hundred million `Point`s, each used once and dropped."], [12, "Interpreted, every `new Point` really is a 24-byte heap object, garbage one line later."], [18, "But C2 runs **escape analysis**: does `p` ever leave this method? Stored in a field, returned, passed on?"], [25.5, "It never does. So C2 applies **scalar replacement**: no object at all, just `x` and `y` in registers."], [33, "Measured on JDK 17: escape analysis on, zero bytes allocated and zero GCs."], [40, "Turn it off with `-XX:-DoEscapeAnalysis`: 2.4 billion bytes and 19 young GCs for the same answer."], [48, '"Objects live on the heap" is the right model for **semantics**: sharing between threads, pass-by-value.'], [54.5, "It is the wrong model for **performance**. Small short-lived objects can be free. Measure; 8.8 goes deeper."]],
    Traps: [[0.5, "Six traps worth avoiding."], [3, '"We got an OOM" is not a diagnosis. Which message? Each names a different area.'], [9, "`OOM: Metaspace` almost never means too many classes. Look for a class loader leak."], [15, "In a container the default heap is a quarter of the limit, not all of it."], [21, "The stack is not garbage collected. Frames pop the moment a method returns."], [27, "Not every `new` allocates: escape analysis can remove the object."], [33, "And catching `OutOfMemoryError` to carry on is a gamble: the handler needs memory too."]],
    Recap: [[0.5, "Recap."], [3, "Per thread: a PC register and a stack. Shared: heap, metaspace and code cache."], [8.5, "Frames push and pop. A stack has a fixed size, and each platform thread reserves one."], [14, "The heap holds every object, split by age. TLABs make allocation a pointer bump."], [19.5, "Metaspace holds class metadata in native memory. Its classic failure is a class loader leak."], [25, "Read the error message: it names the area that ran out."], [30, "And remember the useful lie: the JIT can make an allocation vanish."]]
  };
  var USERS = 'public class Users {\n    record User(String name, int age) {}\n\n    static User makeUser(String name) {\n        int age = 30;\n        User u = new User(name, age);\n        return u;\n    }\n\n    public static void main(String[] args) {\n        User ana = makeUser("Ana");\n        makeUser("Bob");                  // result dropped\n        System.out.println(ana.name());\n    }\n}';
  var notes = [
    { ch: 1, blocks: [
      { p: "A running JVM is **one OS process**. Its memory splits two ways: areas that belong to **one thread**, and areas **shared by every thread**. That split is the whole explanation of pass-by-value (1.5), of why two threads can race on the same object (Part 09), and of which `OutOfMemoryError` you are looking at." },
      { mini: { scene: "ProcessMap" } },
      { table: { head: ["area", "whose", "holds", "runs out as"], rows: [
        ["**PC register**", "one per thread", "the bytecode offset being executed (undefined while in a native method)", "(never)"],
        ["**JVM stack**", "one per thread", "frames: locals, operand stack, return info", "`StackOverflowError`"],
        ["**Heap**", "shared", "every object and array; young (eden + survivors) and old", "`OutOfMemoryError: Java heap space`"],
        ["**Metaspace**", "shared", "class metadata: Klass, methods, bytecode, constant pools", "`OutOfMemoryError: Metaspace`"],
        ["**Code cache**", "shared", "machine code from the JIT", "warning: `CodeCache is full`"],
        ["**Direct memory**", "shared", "`ByteBuffer.allocateDirect` blocks", "`Cannot reserve \u2026 direct buffer memory`"]
      ] } },
      { callout: { tone: "violet", title: "deeper: spec vs HotSpot", text: 'The JVM specification names six run-time data areas: the pc register, JVM stacks, heap, method area, run-time constant pool and native method stacks. HotSpot implements the **method area** (with each class\'s run-time constant pool) as **metaspace**, and runs Java frames and native frames on **one OS thread stack**, so the "native method stack" is not a separate region. You can see it in any thread dump: `Thread.sleep(\u2026 Native Method)` sits right on top of the Java frames.' } },
      { h: "Measure it: Native Memory Tracking" },
      { mini: { scene: "Nmt" } },
      { tryit: { note: "Real output (condensed: only the main categories) from a small program holding 20,000 Users, on an 8 GB Mac.", cmd: "$ java -XX:NativeMemoryTracking=summary Live &\n$ jcmd <pid> VM.native_memory summary", out: "Total: reserved=3646439KB, committed=251495KB\n-                 Java Heap (reserved=2097152KB, committed=133120KB)\n-                     Class (reserved=1048672KB, committed=224KB)\n                            (classes #668)\n-                    Thread (reserved=39187KB, committed=39187KB)\n                            (thread #19)\n-                      Code (reserved=247747KB, committed=7635KB)\n-                        GC (reserved=128172KB, committed=55324KB)\n-        Shared class space (reserved=16384KB, committed=12032KB)" } },
      { p: "**Reserved** means address space set aside; **committed** means backed by real memory. The JVM reserves the maximum of each area up front (2 GB of heap here) and commits pages only as they are needed. That is why `top` or Activity Monitor shows a Java process far smaller than its `-Xmx`, and why the virtual size looks enormous." }
    ] },
    { ch: 2, blocks: [
      { p: "Our running example for the whole topic:" },
      { code: USERS, title: 'Users.java  (prints "Ana")' },
      { mini: { scene: "Frames" } },
      { code: " 0: ldc           #12   // String Ana\n 2: invokestatic  #14   // Method makeUser:(Ljava/lang/String;)LUsers$User;\n 5: astore_1            // ana = the returned reference\n 6: ldc           #20   // String Bob\n 8: invokestatic  #14   // Method makeUser:(Ljava/lang/String;)LUsers$User;\n11: pop                 // the result is discarded\n12: getstatic     #22   // Field java/lang/System.out:Ljava/io/PrintStream;\n15: aload_1\n16: invokevirtual #28   // Method Users$User.name:()Ljava/lang/String;\n19: invokevirtual #32   // Method java/io/PrintStream.println:(Ljava/lang/String;)V\n22: return", lang: "bytecode", title: "javap -c Users \xB7 main (real output)" },
      { list: ["Each call pushes a **frame**; each return pops it. Popping is the only way stack memory is reclaimed, and it is instant: no GC is involved.", 'A local of a primitive type holds the **value** (`age = 30`). A local of a reference type holds a **reference**; the object itself is always on the heap (until 7: "A useful lie").', "`return u` copies the **reference**, not the object. That is pass-by-value of a reference (1.5).", 'After `makeUser("Bob")`, `pop` discards the only reference: the Bob `User` is unreachable. It still occupies heap memory until a GC notices.'] },
      { callout: { tone: "violet", title: "deeper", text: 'The **string** `"Bob"` is not garbage: string literals are interned, and the class\'s constant pool keeps them reachable. Only the `User` object is unreachable. Likewise, once `main` returns, the Ana `User` becomes unreachable too; the JVM simply exits before any GC bothers.' } },
      { h: "Inside a frame" },
      { mini: { scene: "FrameAnatomy" } },
      { table: { head: ["part", "holds", "sized by"], rows: [["local variable slots", "parameters and locals (`this` in slot 0 for instance methods)", "`max_locals` (3 for `makeUser`)"], ["operand stack", "temporary values the bytecode pushes and pops", "`max_stack` (4 for `makeUser`)"], ["frame data", "return address in the caller, link to the class's constant pool, saved registers", "fixed by the VM"]] } },
      { tryit: { note: "TwoThreads.java runs `makeUser` (with a `Thread.sleep` inside) on `main` and on a `worker` thread. Two stacks, at two different addresses:", cmd: "$ java TwoThreads &\n$ jcmd <pid> Thread.print", out: '"main" #1 prio=5 os_prio=31 cpu=17.37ms elapsed=2.29s tid=0x0000000100e1af30 nid=0x1403 waiting on condition  [0x000000016fa46000]\n   java.lang.Thread.State: TIMED_WAITING (sleeping)\n	at java.lang.Thread.sleep(java.base@17.0.17/Native Method)\n	at TwoThreads.makeUser(TwoThreads.java:7)\n	at TwoThreads.main(TwoThreads.java:16)\n\n"worker" #14 prio=5 os_prio=31 cpu=0.05ms elapsed=2.27s tid=0x00000008e4e10600 nid=0x8003 waiting on condition  [0x0000000172036000]\n   java.lang.Thread.State: TIMED_WAITING (sleeping)\n	at java.lang.Thread.sleep(java.base@17.0.17/Native Method)\n	at TwoThreads.makeUser(TwoThreads.java:7)\n	at TwoThreads.lambda$main$0(TwoThreads.java:13)\n	at TwoThreads$$Lambda$1/0x0000007001000a08.run(Unknown Source)\n	at java.lang.Thread.run(java.base@17.0.17/Thread.java:840)' } },
      { h: "StackOverflowError" },
      { mini: { scene: "Overflow" } },
      { tryit: { note: "With `-Xint` (interpreter only) the depth is identical on every run:", cmd: "$ java -Xint -Xss256k Deep\n$ java -Xint -Xss1m Deep\n$ java -Xint Deep          # default -Xss here: 2 MB\n$ java -Xint -Xss4m Deep", out: "depth = 1479\ndepth = 9671\ndepth = 20594\ndepth = 42439" } },
      { table: { head: ["stack size", "depth, -Xint", "depth, JIT on (3 runs)"], rows: [["256 KB", "1,479", "1,479 \xB7 1,479 \xB7 1,479"], ["512 KB", "4,210", "6,838 \xB7 5,372 \xB7 5,166"], ["1 MB", "9,671", "18,554 \xB7 18,498 \xB7 18,538"], ["2 MB (default here)", "20,594", "55,115 \xB7 47,594 \xB7 44,664"], ["4 MB", "42,439", "175,177 \xB7 97,102 \xB7 172,673"]] } },
      { p: 'Doubling `-Xss` roughly doubles the interpreted depth: about **100 bytes per frame** for this tiny method. With the JIT on, the numbers wobble: once `down()` is compiled, its frames get smaller, and the moment that happens differs from run to run. `-Xss` below 208 KB is refused on this JVM ("The Java thread stack size specified is too small. Specify at least 208k").' },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note gives the default stack as "~512KB\u20131MB". It is platform-specific: `ThreadStackSize` is **1 MB on Linux x64**, but **2 MB on this macOS arm64 JDK 17** (`java -XX:+PrintFlagsFinal -version | grep ThreadStackSize` \u2192 `2048`). Check yours rather than assuming.' } },
      { callout: { tone: "violet", title: "deeper: guard pages", text: "HotSpot protects the end of each thread stack with **guard zones** (`StackYellowPages`, `StackRedPages`, `StackReservedPages`). Touching the yellow zone makes the VM throw `StackOverflowError` in a controlled way; the red zone is the last resort before a hard crash. The printed trace is capped at `MaxJavaStackTraceDepth` = **1,024** frames, which is why an endless recursion prints exactly 1,024 `at` lines." } },
      { h: "What threads cost" },
      { mini: { scene: "ThreadCost" } },
      { tryit: { note: "Start daemon threads that sleep, until thread creation fails (macOS caps a process at 2,048 threads):", cmd: "$ java Threads", out: '[0.105s][warning][os,thread] Failed to start thread "Unknown thread" - pthread_create failed (EAGAIN) for attributes: stacksize: 2048k, guardsize: 16k, detached.\nstarted 2026 threads, then: java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached' } },
      { callout: { tone: "pull", title: "why virtual threads exist", text: "A platform thread is an OS thread with a stack **reserved** up front: 1 MB on Linux, 2 MB here. A million of them is 1\u20132 TB of address space, plus kernel limits. Most of that is never committed, but you still hit OS limits long before a million. **Virtual threads** (final in Java 21, 9.11) store their frames in small stack chunks on the **heap** that grow and shrink as needed, and run on a handful of carrier threads." } }
    ] },
    { ch: 3, blocks: [
      { p: "The heap is **shared by all threads** and holds every object. HotSpot divides it by **age**, because most objects die young (the generational hypothesis, 8.5)." },
      { mini: { scene: "Generations" } },
      { tryit: { note: "The classic layout, with the Serial collector (addresses trimmed):", cmd: "$ java -XX:+UseSerialGC -Xmx256m Live &\n$ jcmd <pid> GC.heap_info", out: " def new generation   total 39296K, used 18952K\n  eden space 34944K,  54% used\n  from space 4352K,   0% used\n  to   space 4352K,   0% used\n tenured generation   total 87424K, used 0K\n Metaspace       used 424K, committed 576K, reserved 1114112K\n  class space    used 25K, committed 128K, reserved 1048576K" } },
      { p: '`34944 : 4352 : 4352` is 8 : 1 : 1 (`-XX:SurvivorRatio=8`), and `87424 : 43648` is 2 : 1 (`-XX:NewRatio=2`). "from" and "to" are the two survivor spaces S0 and S1.' },
      { h: "A minor GC" },
      { mini: { scene: "MinorGC" } },
      { steps: ['Eden fills up; an allocation fails ("Allocation Failure").', "The collector finds the live objects, starting from roots (stack slots, statics, \u2026).", "It **copies** live objects from eden and the occupied survivor space into the empty survivor space, adding 1 to each object's age.", "Objects that reach `MaxTenuringThreshold` (15) are copied into the old generation instead: **promotion**.", "Eden and the old survivor space are declared empty in one step. Dead objects are never visited."] },
      { tryit: { note: "Churn.java makes 20 million Users and keeps one in a thousand:", cmd: "$ java -XX:+UseSerialGC -Xmx64m -Xlog:gc,gc+heap=info Churn", out: "[0.075s][info][gc,heap] GC(0) DefNew: 17472K(19648K)->582K(19648K) Eden: 17472K(17472K)->0K(17472K) From: 0K(2176K)->582K(2176K)\n[0.075s][info][gc     ] GC(0) Pause Young (Allocation Failure) 17M->0M(61M) 0.822ms\n\u2026\n[0.137s][info][gc,heap] GC(15) Tenured: 0K(43712K)->581K(43712K)\n\u2026\n[0.336s][info][gc     ] GC(79) Pause Young (Allocation Failure) 19M->2M(61M) 0.204ms" } },
      { p: '80 minor GCs in a third of a second, each under a millisecond: **the cost of a copying collection is proportional to what survives**, not to the garbage. The tenuring threshold is adaptive: if survivors overflow their space, the JVM lowers it and promotes earlier (`-Xlog:gc+age=trace` prints "new threshold \u2026 (max threshold 15)" and the age table).' },
      { callout: { tone: "violet", title: "deeper: big objects", text: "An object too large for the young generation can be allocated straight into the old one. Serial and Parallel have `-XX:PretenureSizeThreshold` (0 = off by default). In G1, any object of **half a region or more** is **humongous** and goes directly into dedicated old regions." } },
      { h: "TLABs: why allocation is cheap" },
      { mini: { scene: "TLAB" } },
      { p: "Each thread allocates into its own **thread-local allocation buffer**, a private chunk of eden. The fast path of `new` is: read `top`, check it against `end`, add the object size, write the header, zero the fields. No lock, no atomic instruction, no sharing between threads. Only when a TLAB runs out does the thread take the slow path and claim a new chunk from eden with a single atomic compare-and-swap." },
      { tryit: { cmd: "$ java -XX:+UseSerialGC -Xmx64m -Xlog:gc+tlab=trace Churn", out: "[0.007s][trace][gc,tlab] TLAB: fill thread: 0x0000000100cab240 [id: 4867] desired_size: 349KB slow allocs: 0  refill waste: 5584B alloc: 0.99999      349KB refills: 1 waste  0.0% gc: 0B slow: 0B\n[0.101s][debug][gc,tlab] GC(1) TLAB totals: thrds: 1  refills: 52 max: 52 slow allocs: 0 max 0 waste:  0.3% gc: 0B max: 0B slow: 53280B max: 53280B" } },
      { callout: { tone: "violet", title: "deeper", text: 'TLAB size adapts per thread to its allocation rate (`-XX:+ResizeTLAB`, on by default; minimum `MinTLABSize` = 2 KB). An object that does not fit in the remaining TLAB space either triggers a refill or, if large, is allocated directly in eden (a "slow alloc"). A retired TLAB\'s unused tail is filled with a dummy object so the heap stays walkable: that is the "waste".' } },
      { h: "G1: regions" },
      { mini: { scene: "G1Regions" } },
      { tryit: { cmd: "$ java -Xmx64m -Xlog:gc,gc+heap=info Churn", out: "[0.004s][info][gc] Using G1\n[0.047s][info][gc,heap] GC(0) Eden regions: 23->0(37)\n[0.047s][info][gc,heap] GC(0) Survivor regions: 0->1(3)\n[0.047s][info][gc,heap] GC(0) Old regions: 0->0\n[0.047s][info][gc,heap] GC(0) Archive regions: 2->2\n[0.047s][info][gc,heap] GC(0) Humongous regions: 0->0\n[0.047s][info][gc     ] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 23M->1M(64M) 0.567ms" } },
      { p: "The note's picture (one eden, S0, S1, one old space) is the **Serial/Parallel** layout. G1, the default collector, splits the heap into equal regions (1 MB here, `G1HeapRegionSize`) and labels each one eden, survivor, old or humongous. The generations are logical, sized afresh each cycle to meet `-XX:MaxGCPauseMillis` (200 ms by default), so `NewRatio`/`SurvivorRatio` are only loose guides there." },
      { h: "Sizing" },
      { mini: { scene: "Sizing" } },
      { code: "-Xmx4g                     # maximum heap\n-Xms4g                     # initial heap: equal to -Xmx on servers avoids resizing\n-Xmn1g                     # young generation size (overrides NewRatio)\n-XX:NewRatio=2             # old : young\n-XX:SurvivorRatio=8        # eden : one survivor space\n-XX:MaxTenuringThreshold=15\n-XX:MaxRAMPercentage=75    # default -Xmx as a % of RAM / container limit (default 25)", lang: "shell" },
      { tryit: { note: "Simulate container limits with `-XX:MaxRAM` (real values from this JVM):", cmd: '$ java -XX:MaxRAM=1g -XX:+PrintFlagsFinal -version | grep " MaxHeapSize "', out: "   size_t MaxHeapSize                              = 268435456                                 {product} {ergonomic}" } },
      { table: { head: ["memory limit", "default max heap"], rows: [["8 GB (this Mac)", "2 GB"], ["4 GB", "1 GB"], ["1 GB", "256 MB"], ["512 MB", "128 MB"], ["256 MB", "128 MB (50%: `MinRAMPercentage`)"], ["128 MB", "64 MB"]] } },
      { callout: { tone: "pull", title: "containers", text: "The JVM reads the cgroup memory limit (`UseContainerSupport`, on by default) and applies `MaxRAMPercentage` = 25% to it. A service in a 1 GB container gets a **256 MB** heap unless you say otherwise. With one CPU available it also picks the **Serial** collector (`-XX:MaxRAM=1g -XX:ActiveProcessorCount=1` \u2192 `UseSerialGC = true`). Set `-Xmx` or `-XX:MaxRAMPercentage` explicitly, leaving room for metaspace, thread stacks, code cache and direct memory." } }
    ] },
    { ch: 4, blocks: [
      { p: "**Metaspace** holds class metadata, in **native memory**, outside the Java heap. It replaced PermGen in Java 8." },
      { mini: { scene: "Metaspace" } },
      { table: { head: ["in metaspace (native)", "in the heap"], rows: [["the **Klass**: superclass, field layout, vtable/itable, flags", "the `java.lang.Class` **mirror** (what `User.class` and `getClass()` return)"], ["**methods** and their bytecode", "**static fields** (stored in the mirror, since Java 7)"], ["the **runtime constant pool** and its resolution cache (8.1)", "interned **strings** (since Java 7)"], ["annotations, method counters, profiling data", "every **instance**, whose header points at its Klass"]] } },
      { callout: { tone: "bad", title: "correction to the source note", text: 'The note lists "the loaded `Class` objects" as metaspace contents. The `java.lang.Class` objects are ordinary **heap** objects: a heap histogram counts them (`1461 instances, 179968 bytes` in the run below). What lives in metaspace is the VM\'s internal **Klass** structure that each mirror describes.' } },
      { tryit: { cmd: "$ jcmd <pid> GC.class_histogram | grep -E 'java.lang.Class$|Live\\$User'", out: "   3:         20000         480000  Live$User\n   4:          1461         179968  java.lang.Class (java.base@17.0.17)" } },
      { p: "Note `480000 / 20000 = 24`: each `User` record is 24 bytes (a 12-byte header with a compressed class pointer, a 4-byte reference, a 4-byte int, padded to 8). Object layout is 8.4." },
      { tryit: { note: 'How much metaspace? Most JDK classes come pre-parsed from the CDS archive ("Shared class space"), so a small program uses little. Without it:', cmd: "$ jcmd <pid> VM.metaspace | head -3\n$ java -Xshare:off Live &   # then GC.heap_info", out: "Total Usage - 20 loaders, 668 classes (623 shared):\n\u2026\n Metaspace       used 5199K, committed 5376K, reserved 1114112K\n  class space    used 407K, committed 512K, reserved 1048576K" } },
      { callout: { tone: "violet", title: "deeper", text: "**Class space** is a separate part of metaspace (1 GB reserved, `CompressedClassSpaceSize`) holding just the Klass structures, so that object headers can use 32-bit compressed class pointers. `MetaspaceSize` (21 MB) is **not** a starting size: it is the high-water mark that triggers the first metaspace-induced GC. Metaspace is allocated in **chunks per class loader**, and a loader's chunks are freed all at once when the loader is collected." } },
      { h: "Before Java 8: PermGen" },
      { mini: { scene: "PermGen" } },
      { p: 'PermGen ("permanent generation") was a fixed-size region managed with the heap and sized by `-XX:MaxPermSize`. `OutOfMemoryError: PermGen space` was a rite of passage on app servers, where each redeploy loaded a fresh copy of every class. Java 7 moved interned strings and static fields into the normal heap; Java 8 removed PermGen and moved class metadata to metaspace in native memory. The flags `-XX:PermSize`/`MaxPermSize` are gone.' },
      { h: "The class loader leak" },
      { mini: { scene: "ClassLoaderLeak" } },
      { code: 'import java.nio.file.*;\nimport java.util.*;\n\npublic class Redeploy {\n    // Each "deploy" gets a fresh class loader that loads its own copy of User.\n    static class AppLoader extends ClassLoader {\n        Class<?> load(byte[] b) { return defineClass("Users$User", b, 0, b.length); }\n    }\n    static List<Object> leaked = new ArrayList<>();   // something still holds every old app\n\n    public static void main(String[] args) throws Exception {\n        byte[] bytes = Files.readAllBytes(Path.of("Users$User.class"));\n        for (int deploy = 1; ; deploy++) {\n            Class<?> c = new AppLoader().load(bytes);\n            leaked.add(c);                              // the leak: old loaders never die\n            if (deploy % 1000 == 0) System.out.println("deploy " + deploy);\n        }\n    }\n}', title: "Redeploy.java" },
      { tryit: { cmd: "$ java -XX:MaxMetaspaceSize=32m Redeploy\n$ java -XX:MaxMetaspaceSize=64m Redeploy\n$ java -XX:MaxMetaspaceSize=32m Redeploy2    # same loop, no list", out: 'deploy 1000 \u2026 deploy 5000\nException in thread "main" java.lang.OutOfMemoryError: Metaspace\n	at java.base/java.lang.ClassLoader.defineClass1(Native Method)\n\u2026\ndeploy 1000 \u2026 deploy 10000\nException in thread "main" java.lang.OutOfMemoryError: Metaspace\n\u2026\ndeploy 50000 \u2026 deploy 200000\ndone: no leak, metaspace was reclaimed' } },
      { p: "A class can be unloaded only when its **defining class loader** is unreachable, and a loader stays reachable as long as anything reachable refers to it or to any class or object it loaded. Real-world culprits: a `ThreadLocal` on a pooled thread holding an app object, a JDBC driver registered in `DriverManager`, a thread the app started and never stopped, a static cache in a parent loader, a shutdown hook. Doubling `MaxMetaspaceSize` only doubles the deploys before the crash: **OOM: Metaspace is a leak, not a sizing problem**." }
    ] },
    { ch: 5, blocks: [
      { mini: { scene: "CodeCache" } },
      { tryit: { cmd: "$ jcmd <pid> Compiler.codecache", out: "CodeHeap 'non-profiled nmethods': size=120032Kb used=86Kb max_used=86Kb free=119946Kb\n bounds [0x000000011e960000, 0x000000011ebd0000, 0x0000000125e98000]\nCodeHeap 'profiled nmethods': size=120016Kb used=206Kb max_used=206Kb free=119809Kb\n bounds [0x0000000116e98000, 0x0000000117108000, 0x000000011e3cc000]\nCodeHeap 'non-nmethods': size=5712Kb used=1085Kb max_used=1115Kb free=4626Kb\n bounds [0x000000011e3cc000, 0x000000011e63c000, 0x000000011e960000]\n total_blobs=545 nmethods=175 adapters=287\n compilation: enabled" } },
      { tryit: { note: "Force it full: a 2.5 MB cache, `-Xcomp` (compile every method on first call), flushing off, and a class with 3,000 small methods.", cmd: "$ java -Xcomp -XX:ReservedCodeCacheSize=2496k -XX:-UseCodeCacheFlushing -XX:-SegmentedCodeCache Many", out: "[0.688s][warning][codecache] CodeCache is full. Compiler has been disabled.\n[0.688s][warning][codecache] Try increasing the code cache size using -XX:ReservedCodeCacheSize=\nOpenJDK 64-Bit Server VM warning: CodeCache is full. Compiler has been disabled.\nOpenJDK 64-Bit Server VM warning: Try increasing the code cache size using -XX:ReservedCodeCacheSize=\nCodeCache: size=2496Kb used=2479Kb max_used=2487Kb free=16Kb\n\u2026\n compilation: disabled (not enough contiguous free space left)\n\u2026\ndone 1738101675" } },
      { p: "Since Java 9 the code cache is **segmented** (JEP 197): non-method code (interpreter, stubs), profiled C1 code and fully optimised C2 code live in separate heaps, which reduces fragmentation. A full code cache throws nothing. The JIT stops, new hot methods stay interpreted, and throughput falls with no exception to alert you. Normally the JVM also flushes cold compiled code (`UseCodeCacheFlushing`) to make room." },
      { h: "Direct buffers" },
      { mini: { scene: "OffHeap" } },
      { tryit: { cmd: "$ java -XX:MaxDirectMemorySize=16m Direct", out: 'Exception in thread "main" java.lang.OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 16777216, limit: 16777216)\n	at java.base/java.nio.Bits.reserveMemory(Bits.java:178)\n	at java.base/java.nio.DirectByteBuffer.<init>(DirectByteBuffer.java:121)\n	at java.base/java.nio.ByteBuffer.allocateDirect(ByteBuffer.java:332)' } },
      { callout: { tone: "bad", title: "correction to the source note", text: "The note gives the message as `OutOfMemoryError: Direct buffer memory`. That is the old wording (Java 8/11). JDK 17 prints `Cannot reserve N bytes of direct buffer memory (allocated: \u2026, limit: \u2026)`. Search your logs for both." } },
      { table: { head: ["region", "holds", "limit flag", "failure"], rows: [["code cache", "JIT machine code (8.8)", "`-XX:ReservedCodeCacheSize` (240 MB here)", "warning: `CodeCache is full. Compiler has been disabled.`"], ["thread stacks", "Java **and** native frames, one OS stack per thread", "`-Xss` / `ThreadStackSize`", "`unable to create native thread` (creating) \xB7 `StackOverflowError` (using)"], ["direct buffers", "`ByteBuffer.allocateDirect`: NIO, Netty (10.4)", "`-XX:MaxDirectMemorySize` (0 = same as `-Xmx`)", "`Cannot reserve \u2026 direct buffer memory`"]] } },
      { callout: { tone: "violet", title: "deeper: thread native stacks", text: 'The note lists "thread native stacks: native frames for JNI/FFM calls" as their own region failing with `unable to create native thread`. In HotSpot, native frames run on the same OS thread stack as Java frames, and `unable to create native thread` is about **creating** a thread at all (the OS refused another stack or thread: `pthread_create failed (EAGAIN)`), not about native frames running out.' } }
    ] },
    { ch: 6, blocks: [
      { mini: { scene: "ErrorMap" } },
      { table: { head: ["message (JDK 17)", "area", "usual cause", "first move"], rows: [
        ["`StackOverflowError`", "thread stack", "endless or very deep recursion", "read the repeating frames; add a base case or iterate"],
        ["`OutOfMemoryError: Java heap space`", "heap", "a leak (8.7), or `-Xmx` too small", "heap dump: `-XX:+HeapDumpOnOutOfMemoryError`"],
        ["`OutOfMemoryError: GC overhead limit exceeded`", "heap", "a leak; Parallel GC giving up early", "same as heap space"],
        ["`OutOfMemoryError: Metaspace`", "metaspace", "class loader leak (8.2)", "count loaders: `jcmd VM.classloader_stats`"],
        ["`OutOfMemoryError: Cannot reserve \u2026 direct buffer memory`", "direct memory", "buffers never released", "NMT, or the buffer pool MXBean"],
        ["`OutOfMemoryError: unable to create native thread`", "OS threads", "too many threads, or `ulimit`/OS caps", "count threads; use a pool or virtual threads"],
        ["`OutOfMemoryError: Requested array size exceeds VM limit`", "heap (any size)", "array length near `Integer.MAX_VALUE`", "fix the size computation"],
        ["warning: `CodeCache is full`", "code cache", "more JIT code than fits", "raise `ReservedCodeCacheSize`"]
      ] } },
      { callout: { tone: "bad", title: "correction: GC overhead limit", text: "The overhead limit (`UseGCOverheadLimit`: >98% of time in GC with <2% of the heap recovered) is enforced by the **Parallel** collector. On JDK 17, the same leak under **G1** (the default) ends with `Java heap space` instead. Verified below." } },
      { callout: { tone: "bad", title: "correction: requested array size", text: 'The note says "Array > ~2\xB3\xB9 elements". A Java array can never have more than 2\xB3\xB9\u22121 elements: its length is an `int`. The error appears for lengths just **below** `Integer.MAX_VALUE`. On this JVM, `new long[2147483646]` and `new long[2147483647]` give "Requested array size exceeds VM limit" whatever `-Xmx` is, while `new long[2147483645]` gives plain "Java heap space" with a small heap (and succeeds with a large one).' } },
      { h: "Same program, different messages" },
      { mini: { scene: "ReadTheMessage" } },
      { tryit: { cmd: "$ java -XX:+UseParallelGC -Xmx64m Overhead\n$ java -Xmx64m Overhead\n$ java -Xmx64m BigArray 2147483645\n$ java -Xmx64m BigArray 2147483646", out: 'Exception in thread "main" java.lang.OutOfMemoryError: GC overhead limit exceeded\nException in thread "main" java.lang.OutOfMemoryError: Java heap space\nException in thread "main" java.lang.OutOfMemoryError: Java heap space\nException in thread "main" java.lang.OutOfMemoryError: Requested array size exceeds VM limit' } },
      { code: 'import java.util.*;\npublic class Overhead {\n    public static void main(String[] args) {\n        Map<Integer, String> map = new HashMap<>();\n        for (int i = 0; ; i++) map.put(i, "v" + i);\n    }\n}', title: "Overhead.java" }
    ] },
    { ch: 7, blocks: [
      { p: 'The standard teaching, "primitives and references on the stack, objects on the heap", is the right model for **semantics**. It is not a promise about what the machine does.' },
      { mini: { scene: "EscapeAnalysis" } },
      { code: 'import java.lang.management.*;\npublic class Escape {\n    record Point(int x, int y) {}\n\n    static long sum(int n) {\n        long total = 0;\n        for (int i = 0; i < n; i++) {\n            var p = new Point(i, i + 1);     // does this allocate?\n            total += p.x() + p.y();\n        }\n        return total;\n    }\n\n    public static void main(String[] args) {\n        var mx = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();\n        long tid = Thread.currentThread().getId();\n        for (int warm = 0; warm < 5; warm++) sum(1_000_000);   // let the JIT compile sum()\n        long before = mx.getThreadAllocatedBytes(tid);\n        long r = sum(100_000_000);\n        long after = mx.getThreadAllocatedBytes(tid);\n        System.out.printf("100,000,000 Points, allocated %,d bytes (result %d)%n", after - before, r);\n    }\n}', title: "Escape.java" },
      { tryit: { cmd: "$ java Escape\n$ java -XX:-DoEscapeAnalysis Escape\n$ java -Xint Escape", out: "100,000,000 Points, allocated 0 bytes (result 10000000000000000)\n100,000,000 Points, allocated 2,400,000,000 bytes (result 10000000000000000)\n100,000,000 Points, allocated 2,400,000,000 bytes (result 10000000000000000)" } },
      { p: "**Escape analysis** asks whether an object can be seen outside the method (or the inlined region) that created it: stored in a field or array, returned, passed to code that might keep it, or used for locking by another thread. If not, C2 can apply **scalar replacement**: the object is never built, and its fields become plain local values, usually in registers. No heap allocation, no header, nothing for the GC. With `-Xlog:gc`, the default run shows **0** GCs; with escape analysis off, **19**." },
      { list: ["It only happens in **C2-compiled** code: interpreted and C1 code always allocate.", "It depends on **inlining**: if `p` is passed to a method C2 did not inline, it escapes.", 'That is why allocation micro-benchmarks often measure nothing, and why "never create objects in a loop" is dated advice without a measurement.'] },
      { callout: { tone: "pull", title: "keep both models", text: 'For **reasoning about behaviour** (pass-by-value, what two threads share), "objects live on the heap" is exactly right. For **reasoning about cost**, it is wrong: small, short-lived objects can be free. 8.8 shows the JIT in detail.' } }
    ] }
  ];
  var traps = [
    '"We got an OOM" is not a diagnosis. **Which message?** Heap space, Metaspace, direct buffer, native thread and array size each point at a different area, cause and fix.',
    '`OutOfMemoryError: Metaspace` almost never means "too many classes". It means old class loaders are still reachable: a **class loader leak**. Raising `MaxMetaspaceSize` only delays it.',
    "In a container, the default max heap is **25%** of the memory limit (a 1 GB container gets 256 MB), not the whole limit. Set `-Xmx` or `-XX:MaxRAMPercentage`.",
    "The stack is **not** garbage collected. Frames pop when methods return; only heap objects wait for the GC.",
    "Not every `new` allocates: C2's escape analysis can scalar-replace an object that never escapes.",
    "Catching `OutOfMemoryError` to recover is a gamble: the handler needs memory too (in our G1 run, even the default handler failed), and data structures may be half-updated.",
    "The default thread stack size is platform-specific: 1 MB on Linux x64, 2 MB on macOS arm64. Check `ThreadStackSize` instead of assuming.",
    "`java.lang.Class` objects and static fields live in the **heap**. Metaspace holds the VM's internal Klass, methods and constant pools."
  ];
  var recap = [
    "**Per thread**: PC register + JVM stack (frames: locals, operand stack, frame data). **Shared**: heap, metaspace, code cache, direct memory.",
    "**Stack**: frames push and pop, no GC. Fixed size per thread (`-Xss`; 1 MB Linux, 2 MB macOS arm64) \u2192 `StackOverflowError`. Platform threads reserve a whole stack each: why virtual threads exist.",
    "**Heap**: every object. Classic layout eden + S0 + S1 \u2192 old (`SurvivorRatio=8`, `NewRatio=2`, tenure at 15); G1 does the same with regions. Minor GC cost scales with what survives.",
    "**TLABs**: each thread bump-allocates in its own chunk of eden: `new` is a few instructions, no lock.",
    "**Metaspace**: Klass, methods, bytecode, constant pools in native memory, unlimited by default (`MaxMetaspaceSize`). Replaced PermGen in Java 8. OOM: Metaspace = class loader leak.",
    "**Code cache** (JIT output; full = a warning) and **direct buffers** (off-heap, `MaxDirectMemorySize`).",
    "**Read the message**: each `OutOfMemoryError` names its area. `GC overhead limit` is Parallel-only on JDK 17.",
    '**Useful lie**: "objects live on the heap" is right for semantics; escape analysis can make allocations vanish.'
  ];
  var quiz = [
    { q: "A service fails with `OutOfMemoryError: Metaspace` after its 15th hot redeploy. What is the most likely bug?", options: ["The app simply has too many classes; raise MaxMetaspaceSize", "A class loader leak: something still references the old deployments, so their classes cannot be unloaded", "The heap is too small, so classes spill into metaspace", "The JIT has filled the code cache"], answer: 1, why: "Classes are unloaded only when their loader is unreachable. Each redeploy adds a full copy of the app's classes; if anything (a ThreadLocal, a registered driver, a static cache) still points at the old loader, metaspace grows deploy after deploy. Raising the limit only delays the crash." },
    { q: "In `makeUser`, `int age = 30` and `User u = new User(name, age)`. What is stored in `makeUser`'s frame?", options: ["The value 30 and a reference to a User object on the heap", "The value 30 and the whole User object", "References to both 30 and the User, which live on the heap", "Nothing: locals live in metaspace"], answer: 0, why: "Primitive locals hold their value in the frame. Reference locals hold only a reference; the object itself is allocated on the shared heap (unless escape analysis removes it)." },
    { q: 'After `main` runs `makeUser("Bob")` and discards the result (`pop`), what happens to the Bob `User`?', options: ["It is freed when makeUser's frame pops", "It moves to the old generation", "It is freed immediately by the pop instruction", "It stays on the heap, unreachable, until a GC reclaims it"], answer: 3, why: "Popping a frame reclaims stack slots only. The object stays in the heap; once nothing references it, it is garbage, and its memory is reclaimed by the next collection that covers it." },
    { q: "Two threads call `makeUser` at the same moment. Which of these do they share?", options: ["Their `name`, `age` and `u` locals", "Their PC registers", "The heap objects and the `User` class metadata", "Nothing: each thread gets a private heap"], answer: 2, why: "Stacks and PC registers are per thread, so each call has its own locals. The heap, metaspace and code cache are shared: both threads allocate into the same heap and use the one loaded `User` class." },
    { q: "Why is `new` cheap even with many threads allocating at once?", options: ["Each thread bump-allocates in its own TLAB, a private chunk of eden, with no lock or atomic operation", "The JVM takes a global lock, but it is very fast", "Objects are allocated on the stack", "The OS allocates each object with malloc"], answer: 0, why: "In the fast path, a thread adds the object size to its own TLAB's `top`. Only refilling a TLAB touches shared state, with a single compare-and-swap. In our run, about 51 refills served an entire eden fill." },
    { q: "A minor GC runs on a full 17 MB eden where almost everything is garbage. What mostly determines its cost?", options: ["The 17 MB of garbage that must be freed object by object", "The size of the old generation", "The number of classes loaded", "The amount of live data that must be copied to a survivor space or promoted"], answer: 3, why: "A copying collector touches only live objects; eden is then declared empty in one step. That is why the Serial log shows 17M->0M in well under a millisecond." },
    { q: "A recursive method overflows at depth \u2248 9,700 with `-Xss1m` (interpreted). Roughly what happens with `-Xss2m`?", options: ["The depth stays the same: -Xss only affects new threads", "The heap grows instead", "Roughly double the depth, about 20,000", "The JVM refuses to start"], answer: 2, why: "Frame size is fixed for a given method, so depth scales with stack size: the real runs gave 9,671 at 1 MB and 20,594 at 2 MB. A bigger stack moves the wall; a base case removes it." },
    { q: "The same leaking program dies with `GC overhead limit exceeded` under `-XX:+UseParallelGC`, but with `Java heap space` under the default collector on JDK 17. Why?", options: ["G1 has a larger heap", "Only the Parallel collector enforces the GC overhead limit; G1 keeps going until an allocation truly fails", "G1 does not use the heap", "The program behaves differently under G1"], answer: 1, why: "Both are heap exhaustion from the same leak. Parallel GC gives up early when >98% of time goes to GC with <2% recovered; on JDK 17, G1 has no such check and reports the failed allocation." },
    { q: "Where does the `java.lang.Class` object returned by `User.class` live?", options: ["In metaspace, next to the bytecode", "In the code cache", "On the stack of the thread that loaded it", "On the heap, as a mirror of the Klass that lives in metaspace"], answer: 3, why: "The Class object is an ordinary heap object (a heap histogram counts them) and holds the static fields. The VM's internal Klass, methods and constant pool are in metaspace." },
    { q: "A 1 GB container, no heap flags: why does the heap stop at about 256 MB?", options: ["The JVM defaults -Xmx to 25% of the container memory limit", "Containers cap the heap at 256 MB", "Metaspace takes the other 768 MB", "The JVM ignores container limits and uses host RAM"], answer: 0, why: "`MaxRAMPercentage` defaults to 25, applied to the cgroup limit: 1 GB \u2192 256 MB (verified with -XX:MaxRAM=1g). Set -Xmx or -XX:MaxRAMPercentage, leaving room for non-heap memory." }
  ];
  window.AN.registerTopic({
    id: "8.3",
    part: "08",
    title: "Runtime memory areas",
    kicker: "Part 08 \xB7 The JVM",
    lede: "Where your objects, your variables and your classes actually live. Each area fails in its own way: know which one ran out and you know what kind of bug you have, before you open a profiler.",
    chapters,
    scenes,
    captions,
    notes,
    traps,
    recap,
    quiz
  });
})();
