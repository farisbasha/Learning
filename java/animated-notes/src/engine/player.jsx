// Video player: 1920×1080 stage scaled to fit, rAF clock, chapter rail, controls, captions,
// pause-at-chapter-end, keyboard, #t= deep links, ?shot= frozen frames, resume.
import { deriveCues, sceneAt, chapterSpans, chapterAt, crossedBoundary, captionsFor, store } from './timeline.js';
import { PAL, SANS, MONO, MOTION, clamp, hexA, fmt, ClockCtx, Backdrop, Header } from './kit.jsx';

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const PAUSE_LEAD = 0.7; // pause this long before a chapter's end, before the scene fades out

class SceneBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error('[scene ' + this.props.name + ']', err); }
  render() {
    if (this.state.err) {
      return <div style={{ position: 'absolute', left: 96, top: 300, right: 96, padding: 32, border: `2px solid ${PAL.bad}`, borderRadius: 14, background: hexA(PAL.bad, 0.08), font: `500 26px ${MONO}`, color: PAL.bad, whiteSpace: 'pre-wrap' }}>Scene “{this.props.name}” failed to render:{'\n'}{String(this.state.err && this.state.err.message)}</div>;
    }
    return this.props.children;
  }
}

// Scales a 1920×1080 canvas into its box. fit: 'width' (box height follows) | 'contain'.
export function StageBox({ children, fit = 'width', bg = PAL.bg, style, onClick }) {
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
  const s = fit === 'contain' ? Math.min(box.w / 1920, box.h / 1080) : box.w / 1920;
  const outer = fit === 'contain' ? { position: 'relative', width: '100%', height: '100%' } : { position: 'relative', width: '100%', aspectRatio: '16 / 9' };
  return (
    <div ref={ref} onClick={onClick} style={{ ...outer, overflow: 'hidden', background: bg, ...style }}>
      <div style={{ position: 'absolute', left: (box.w - 1920 * s) / 2, top: fit === 'contain' ? (box.h - 1080 * s) / 2 : 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'hidden', background: bg, fontFamily: SANS, color: PAL.ink }}>
        {children}
      </div>
    </div>
  );
}

// One scene at local time t, with fade in/out and optional header.
export function SceneLayer({ scene, t, kicker, header = true, fade = true }) {
  const d = scene.dur;
  const a = fade ? Math.min(MOTION.enter(t, 0, 0.6), 1 - MOTION.enter(t, d - 0.6, 0.6)) : 1;
  const C = scene.C;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      {header && <Header kicker={kicker} title={scene.title} />}
      <SceneBoundary key={scene.name} name={scene.name}><C t={t} d={d} /></SceneBoundary>
    </div>
  );
}

export const kickerFor = (topic, scene) => `${String(scene.ch).padStart(2, '0')} · ${topic.chapters[scene.ch] || ''}`;

function CaptionLine({ caps, T }) {
  const c = caps.find((x) => T >= x.at && T < x.until);
  if (!c) return null;
  const a = Math.min(MOTION.enter(T, c.at, 0.25), 1 - MOTION.enter(T, c.until - 0.2, 0.2));
  return (
    <div style={{ position: 'absolute', left: '8%', right: '8%', bottom: 34, textAlign: 'center', opacity: a, font: `500 32px ${SANS}`, lineHeight: 1.3, color: PAL.ink, textShadow: '0 2px 18px rgba(0,0,0,0.8)', textWrap: 'balance' }}>{fmt(c.text)}</div>
  );
}

function useQuery() {
  return React.useMemo(() => {
    const q = new URLSearchParams(location.search);
    const h = new URLSearchParams(location.hash.replace(/^#/, ''));
    const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
    return { shot: q.has('shot') ? num(q.get('shot')) : null, t: h.has('t') ? num(h.get('t')) : null };
  }, []);
}

const Btn = ({ onClick, title, children, on, wide }) => (
  <button className={'an-btn' + (on ? ' on' : '')} title={title} onClick={onClick} style={wide ? { padding: '0 12px' } : null}>{children}</button>
);

export function TopicVideo({ topic, apiRef, onWatched }) {
  const scenes = topic.scenes;
  const cues = React.useMemo(() => deriveCues(scenes), [scenes]);
  const spans = React.useMemo(() => chapterSpans(scenes), [scenes]);
  const pauseSpans = React.useMemo(() => spans.map((s) => ({ ...s, end: s.end - PAUSE_LEAD })), [spans]);
  const caps = React.useMemo(() => captionsFor(scenes, topic.captions || {}, cues), [scenes, cues]);
  const q = useQuery();
  const K = topic.id;

  const [initial] = React.useState(() => q.shot != null ? q.shot : q.t != null ? q.t : (() => { const p = Number(store.get(K + ':pos', 0)) || 0; return p > cues.total - 3 ? 0 : p; })());
  const [T, setT] = React.useState(() => clamp(initial, 0, cues.total));
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(() => store.get('speed', 1));
  const [cc, setCc] = React.useState(() => store.get('cc', true));
  const [stopAtCh, setStopAtCh] = React.useState(() => store.get('stopAtCh', true));
  const [done, setDone] = React.useState(null); // span index just finished (overlay)
  const [watched, setWatched] = React.useState(() => new Set(store.get(K + ':watched', [])));
  const [hover, setHover] = React.useState(null);
  const [started, setStarted] = React.useState(initial > 0.05);
  const [isFs, setIsFs] = React.useState(false);
  React.useEffect(() => {
    const on = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const tRef = React.useRef(T);
  const wrapRef = React.useRef(null);
  const visRef = React.useRef(true);
  tRef.current = T;

  const watchedRef = React.useRef(watched);
  const markWatched = React.useCallback((i) => {
    if (watchedRef.current.has(i)) return;
    const n = new Set(watchedRef.current); n.add(i);
    watchedRef.current = n;
    setWatched(n);
    store.set(K + ':watched', [...n]);
    onWatched && onWatched(n);
  }, [K]);

  // clock
  React.useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const prev = tRef.current;
      let next = prev + dt * speed;
      const crossed = crossedBoundary(prev, next, pauseSpans, false);
      if (crossed) {
        const i = pauseSpans.indexOf(crossed);
        markWatched(i);
        if (stopAtCh) { tRef.current = crossed.end; setT(crossed.end); setPlaying(false); setDone(i); return; }
      }
      if (next >= cues.total) { next = cues.total; markWatched(spans.length - 1); setT(next); setPlaying(false); return; }
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, stopAtCh, pauseSpans, cues.total]);

  // persist position (every ~2 s of change)
  const q2 = Math.floor(T / 2);
  React.useEffect(() => { if (q.shot == null) store.set(K + ':pos', T); }, [q2]);

  const seek = (x) => { setDone(null); setStarted(true); const v = clamp(x, 0, cues.total); tRef.current = v; setT(v); };
  const chStart = (i) => spans[clamp(i, 0, spans.length - 1)].start + 0.02;
  const curCh = chapterAt(spans, T);
  const toggle = () => {
    if (done != null) { seek(spans[done + 1] ? spans[done + 1].start + 0.02 : T); setPlaying(true); return; }
    if (T >= cues.total - 0.05) seek(0);
    setStarted(true);
    setPlaying((p) => !p);
  };
  const prevCh = () => seek(T - spans[curCh].start > 2 || curCh === 0 ? chStart(curCh) : chStart(curCh - 1));
  const nextCh = () => { if (curCh + 1 < spans.length) seek(chStart(curCh + 1)); };
  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen && el.requestFullscreen();
  };

  if (apiRef) apiRef.current = { seekChapter: (ch) => { const i = spans.findIndex((s) => s.ch === ch); if (i >= 0) { seek(chStart(i)); setPlaying(true); } }, pause: () => setPlaying(false) };

  // keyboard (only while the video is substantially visible)
  React.useEffect(() => {
    const el = wrapRef.current;
    const io = new IntersectionObserver(([e]) => { visRef.current = e.intersectionRatio > 0.4; }, { threshold: [0, 0.4, 1] });
    if (el) io.observe(el);
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!visRef.current && !document.fullscreenElement) return;
      const k = e.key;
      if (e.repeat && (k === ' ' || k === 'k' || k === 'c' || k === 'f')) return;
      if (k === ' ' || k === 'k') { e.preventDefault(); toggleRef.current(); }
      else if (k === 'ArrowLeft') { e.preventDefault(); seekRef.current(tRef.current - 5); }
      else if (k === 'ArrowRight') { e.preventDefault(); seekRef.current(tRef.current + 5); }
      else if (k === '[') prevRef.current();
      else if (k === ']') nextRef.current();
      else if (k === 'c') setCc((v) => { store.set('cc', !v); return !v; });
      else if (k === 'f') fullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); io.disconnect(); };
  }, []);
  const toggleRef = React.useRef(toggle), seekRef = React.useRef(seek), prevRef = React.useRef(prevCh), nextRef = React.useRef(nextCh);
  toggleRef.current = toggle; seekRef.current = seek; prevRef.current = prevCh; nextRef.current = nextCh;

  const poster = !started && !playing && q.shot == null && T < 0.05;
  const RT = poster ? (topic.poster != null ? topic.poster : Math.max(0, scenes[0].dur - 2)) : T;
  const si = sceneAt(cues, RT);
  const scene = scenes[si];
  const stage = (
    <ClockCtx.Provider value={RT}>
      <Backdrop />
      <SceneLayer scene={scene} t={RT - cues.starts[si]} kicker={kickerFor(topic, scene)} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: 'linear-gradient(rgba(5,6,8,0), rgba(5,6,8,0.82))', pointerEvents: 'none' }}></div>
      {cc && !poster && <CaptionLine caps={caps} T={T} />}
    </ClockCtx.Provider>
  );

  if (q.shot != null) {
    window.__anSeek = (x) => seek(x);
    window.__anTimes = () => ({ total: cues.total, caps: caps.map((c) => [c.at, c.until, c.text]), scenes: scenes.map((s, i) => [s.name, cues.starts[i], s.dur]) });
    return <div style={{ position: 'fixed', inset: 0, background: PAL.bg }}><StageBox fit="contain">{stage}</StageBox></div>;
  }

  const total = cues.total;
  return (
    <div ref={wrapRef} className="an-video">
      <div className="an-rail">
        {spans.map((s, i) => {
          const on = i === curCh;
          const p = clamp((T - s.start) / (s.end - s.start), 0, 1);
          return (
            <button key={i} className={'an-chip' + (on ? ' on' : '')} title={`${topic.chapters[s.ch]} · ${fmtTime(s.start)}`} onClick={() => seek(chStart(i))}>
              <span className="n">{watched.has(i) ? '✓' : String(s.ch).padStart(2, '0')}</span>
              <span>{topic.chapters[s.ch]}</span>
              <span className="bar" style={{ width: `${p * 100}%` }}></span>
            </button>
          );
        })}
      </div>
      <div className="an-stage">
        <StageBox key={isFs ? 'fs' : 'n'} fit={isFs ? 'contain' : 'width'} onClick={toggle} style={{ cursor: 'pointer' }}>{stage}</StageBox>
        {!playing && done == null && (
          <div className="an-bigplay" onClick={toggle}><div>▶</div></div>
        )}
        {done != null && (
          <div className="an-done">
            <div className="k">Chapter {String(spans[done].ch).padStart(2, '0')} done</div>
            <div className="t">{topic.chapters[spans[done].ch]}</div>
            <div className="row">
              <button className="an-cta" onClick={toggle}>▶ Continue: {topic.chapters[spans[done + 1] ? spans[done + 1].ch : 0]}</button>
              <button className="an-ghost" onClick={() => { seek(chStart(done)); setPlaying(true); }}>⟲ Replay chapter</button>
              <a className="an-ghost" href={'#notes-ch' + spans[done].ch} onClick={() => setDone(null)}>Read notes ↓</a>
            </div>
          </div>
        )}
      </div>
      <div className="an-controls">
        <Btn onClick={toggle} title="Play/pause (Space)">{playing ? '❚❚' : '▶'}</Btn>
        <Btn onClick={prevCh} title="Previous chapter ([)">⏮</Btn>
        <Btn onClick={() => seek(T - 5)} title="Back 5s (←)">−5</Btn>
        <Btn onClick={() => seek(T + 5)} title="Forward 5s (→)">+5</Btn>
        <Btn onClick={nextCh} title="Next chapter (])">⏭</Btn>
        <span className="an-time">{fmtTime(T)} / {fmtTime(total)}</span>
        <div className="an-scrub" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(clamp((e.clientX - r.left) / r.width, 0, 1) * total); }} onMouseLeave={() => setHover(null)}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(clamp((e.clientX - r.left) / r.width, 0, 1) * total); }}>
          <div className="track"><div className="fill" style={{ width: `${(T / total) * 100}%` }}></div></div>
          {spans.slice(1).map((s, i) => <div key={i} className="tick" style={{ left: `${(s.start / total) * 100}%` }}></div>)}
          <div className="knob" style={{ left: `${(T / total) * 100}%` }}></div>
          {hover != null && <div className="tip" style={{ left: `${(hover / total) * 100}%` }}>{fmtTime(hover)} · {topic.chapters[spans[chapterAt(spans, hover)].ch]}</div>}
        </div>
        <select className="an-sel" value={speed} title="Speed" onChange={(e) => { const v = parseFloat(e.target.value); setSpeed(v); store.set('speed', v); e.target.blur(); }}>
          {[0.75, 1, 1.25, 1.5].map((v) => <option key={v} value={v}>{v}×</option>)}
        </select>
        <Btn on={cc} onClick={() => setCc((v) => { store.set('cc', !v); return !v; })} title="Captions (c)" wide>CC</Btn>
        <Btn on={stopAtCh} onClick={() => setStopAtCh((v) => { store.set('stopAtCh', !v); return !v; })} title="Pause at the end of each chapter" wide>⏸ ch</Btn>
        <Btn onClick={fullscreen} title="Fullscreen (f)">⛶</Btn>
      </div>
    </div>
  );
}
