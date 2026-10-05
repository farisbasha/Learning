// Notes page building blocks: Mini (scene with its own clock), content blocks, quiz.
import { deriveCues, captionsFor, store } from './timeline.js';
import { PAL, MOTION, clamp, fmt, highlight, ClockCtx, Backdrop } from './kit.jsx';
import { StageBox, SceneLayer, kickerFor, fmtTime } from './player.jsx';

// Keeps one broken block from blanking the whole page.
export class Safe extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error('[notes block]', err); }
  render() {
    if (this.state.err) return <div className="an-callout bad"><div className="lbl">couldn't render this part</div><div>{String(this.state.err && this.state.err.message)}</div></div>;
    return this.props.children;
  }
}

export function Mini({ topic, scene: name, from = 0, to, caption }) {
  const scene = topic.scenes.find((s) => s.name === name);
  const [t, setT] = React.useState(from);
  const [playing, setPlaying] = React.useState(false);
  const ref = React.useRef(null);
  const tRef = React.useRef(from);
  const started = React.useRef(false);
  const end = to == null ? (scene ? scene.dur : 1) : to;
  tRef.current = t;
  const caps = React.useMemo(() => {
    if (!scene) return [];
    return captionsFor([scene], topic.captions || {}, deriveCues([scene]));
  }, [scene]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > 0.6 && !started.current) { started.current = true; setPlaying(true); }
      if (e.intersectionRatio < 0.1) setPlaying(false);
    }, { threshold: [0, 0.1, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  React.useEffect(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const n = tRef.current + dt;
      if (n >= end) { setT(end); setPlaying(false); return; }
      setT(n);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, end]);

  if (!scene) return <div className="an-callout bad">Missing scene “{name}”</div>;
  const toggle = () => { started.current = true; if (t >= end - 0.05) setT(from); setPlaying((p) => !p); };
  const poster = !started.current && !playing && t === from;
  const rt = poster ? Math.max(from, end - 0.6) : t; // poster = the finished diagram
  const cap = poster ? null : caps.find((c) => t >= c.at && t < c.until);
  return (
    <figure className="an-mini" ref={ref}>
      <StageBox onClick={toggle} style={{ cursor: 'pointer', borderRadius: 12 }}>
        <ClockCtx.Provider value={rt}>
          <Backdrop />
          <SceneLayer scene={scene} t={rt} kicker={kickerFor(topic, scene)} fade={false} />
          {cap && <div style={{ position: 'absolute', left: '6%', right: '6%', bottom: 30, textAlign: 'center', font: `500 38px 'IBM Plex Sans', sans-serif`, color: PAL.ink, textShadow: '0 2px 18px rgba(0,0,0,0.9)', opacity: MOTION.enter(t, cap.at, 0.25), textWrap: 'balance' }}>{fmt(cap.text)}</div>}
        </ClockCtx.Provider>
      </StageBox>
      <div className="an-mini-bar">
        <button className="an-btn" onClick={toggle} title="Play/pause">{playing ? '❚❚' : t >= end - 0.05 ? '⟲' : '▶'}</button>
        <div className="an-scrub small" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setT(from + clamp((e.clientX - r.left) / r.width, 0, 1) * (end - from)); }}>
          <div className="track"><div className="fill" style={{ width: `${((t - from) / (end - from)) * 100}%` }}></div></div>
        </div>
        <span className="an-time">{fmtTime(t - from)} / {fmtTime(end - from)}</span>
      </div>
      {caption && <figcaption>{fmt(caption)}</figcaption>}
    </figure>
  );
}

export function CodeBlock({ code, title, lang = 'java' }) {
  const [copied, setCopied] = React.useState(false);
  const lines = String(code).replace(/\n$/, '').split('\n');
  const copy = () => {
    const txt = lang === 'shell' ? lines.filter((l) => /^\s*\$/.test(l)).map((l) => l.replace(/^\s*\$\s?/, '')).join('\n') || code : code;
    try { navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }, () => {}); } catch (e) { /* clipboard unavailable */ }
  };
  return (
    <div className="an-code">
      <div className="hd"><span>{title || (lang === 'bytecode' ? 'javap -c' : lang === 'shell' ? 'terminal' : 'java')}</span><button onClick={copy}>{copied ? 'copied ✓' : 'copy'}</button></div>
      <pre>{lines.map((l, i) => <div key={i}>{highlight(l, lang)}{l === '' ? ' ' : null}</div>)}</pre>
    </div>
  );
}

export function Block({ b, topic }) {
  if (b.p) return <p>{fmt(b.p)}</p>;
  if (b.h) return <h3>{fmt(b.h)}</h3>;
  if (b.mini) return <Mini topic={topic} {...b.mini} />;
  if (b.code) return <CodeBlock code={b.code} title={b.title} lang={b.lang} />;
  if (b.tryit) {
    return (
      <div className="an-try">
        <div className="lbl">Try it</div>
        {b.tryit.note && <p>{fmt(b.tryit.note)}</p>}
        <CodeBlock code={b.tryit.cmd} lang="shell" title="run this" />
        {b.tryit.out && <CodeBlock code={b.tryit.out} lang={b.tryit.outLang || 'plain'} title="you should see" />}
      </div>
    );
  }
  if (b.callout) return <div className={'an-callout ' + (b.callout.tone || 'pull')}>{b.callout.title && <div className="lbl">{b.callout.title}</div>}<div>{fmt(b.callout.text)}</div></div>;
  if (b.list) return <ul>{b.list.map((x, i) => <li key={i}>{fmt(x)}</li>)}</ul>;
  if (b.steps) return <ol>{b.steps.map((x, i) => <li key={i}>{fmt(x)}</li>)}</ol>;
  if (b.table) {
    return (
      <div className="an-table"><table>
        {b.table.head && <thead><tr>{b.table.head.map((h, i) => <th key={i}>{fmt(h)}</th>)}</tr></thead>}
        <tbody>{b.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{fmt(c)}</td>)}</tr>)}</tbody>
      </table></div>
    );
  }
  return null;
}

export function Quiz({ topic }) {
  const K = topic.id + ':quiz';
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
  return (
    <section className="an-quiz" id="quiz">
      <h2><span className="num">✓</span>Self-check</h2>
      <p className="muted">Pick an answer to see why it's right or wrong. Your score is saved.</p>
      {qs.map((q, i) => {
        const a = ans[i];
        return (
          <div key={i} className={'q' + (a != null ? (a === q.answer ? ' ok' : ' no') : '')}>
            <div className="qt"><span className="qn">{i + 1}</span><span>{fmt(q.q)}</span></div>
            {q.code && <CodeBlock code={q.code} lang={q.lang || 'java'} />}
            <div className="opts">
              {q.options.map((o, j) => {
                const cls = a == null ? '' : j === q.answer ? ' correct' : j === a ? ' wrong' : ' dim';
                return <button key={j} className={'opt' + cls} onClick={() => pick(i, j)}><span className="ol">{String.fromCharCode(65 + j)}</span><span>{fmt(o)}</span></button>;
              })}
            </div>
            {a != null && <div className="why">{a === q.answer ? '✓ Correct. ' : '✗ Not quite. '}{fmt(q.why)}</div>}
          </div>
        );
      })}
      <div className="score">
        <span>Score: <b>{right}</b> / {qs.length}{answered < qs.length ? ` · ${qs.length - answered} unanswered` : ''}</span>
        {answered > 0 && <button className="an-ghost" onClick={() => { setAns({}); store.set(K, {}); }}>Reset quiz</button>}
      </div>
    </section>
  );
}
