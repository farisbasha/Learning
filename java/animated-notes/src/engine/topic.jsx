// Topic page = header + video + notes + traps + recap + quiz. Topics self-register.
import { deriveCues, chapterSpans, store } from './timeline.js';
import { fmt } from './kit.jsx';
import { TopicVideo, fmtTime } from './player.jsx';
import { Block, Quiz, Safe } from './notes.jsx';

const REG = {};
export function registerTopic(def) {
  REG[def.id] = def;
  return def;
}
export const getTopic = (id) => REG[id];

export function findInManifest(id) {
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
  const [learned, setLearned] = React.useState(store.get(K + ':learned', false));
  const [watchedN, setWatchedN] = React.useState(store.get(K + ':watched', []).length);
  const spans = React.useMemo(() => chapterSpans(topic.scenes), [topic]);
  const total = React.useMemo(() => deriveCues(topic.scenes).total, [topic]);
  const loc = findInManifest(K);

  React.useEffect(() => {
    store.set(K + ':meta', { chapters: spans.length, quiz: (topic.quiz || []).length, duration: total });
    document.title = `${topic.id} ${topic.title}`;
  }, []);

  const nav = (() => {
    if (!loc) return {};
    const ok = (t) => t && t.status === 'ready';
    const prev = loc.part.topics[loc.i - 1], next = loc.part.topics[loc.i + 1];
    const href = (t) => `${t.id}-${t.slug}.html`;
    return { prev: ok(prev) ? { ...prev, href: href(prev) } : null, next: ok(next) ? { ...next, href: href(next) } : null };
  })();

  const watch = (ch) => { apiRef.current && apiRef.current.seekChapter(ch); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="an-page">
      <header className="an-top">
        <a className="back" href="../index.html">← All topics</a>
        <div className="crumb">{topic.kicker}</div>
        <div className="grow"></div>
        <span className="muted small">{fmtTime(total)} · {watchedN}/{spans.length} chapters watched</span>
        <button className={'an-learned' + (learned ? ' on' : '')} onClick={() => { setLearned(!learned); store.set(K + ':learned', !learned); }}>{learned ? '✓ Learned' : 'Mark as learned'}</button>
      </header>
      <h1 className="an-h1"><span className="id">{topic.id}</span>{topic.title}</h1>
      {topic.lede && <p className="an-lede">{fmt(topic.lede)}</p>}
      <TopicVideo topic={topic} apiRef={apiRef} onWatched={(s) => setWatchedN(s.size)} />
      <div className="an-hint">Space play/pause · ← → 5s · [ ] chapters · c captions · f fullscreen</div>

      <nav className="an-toc">
        {(topic.notes || []).map((n) => <a key={n.ch} href={'#notes-ch' + n.ch}><span>{String(n.ch).padStart(2, '0')}</span>{n.title || topic.chapters[n.ch]}</a>)}
        {topic.traps && <a href="#traps"><span>⚠</span>Traps</a>}
        {topic.recap && <a href="#recap"><span>★</span>Recap</a>}
        {topic.quiz && <a href="#quiz"><span>✓</span>Self-check</a>}
      </nav>

      <main className="an-notes">
        {(topic.notes || []).map((n) => (
          <section key={n.ch} id={'notes-ch' + n.ch}>
            <h2><span className="num">{String(n.ch).padStart(2, '0')}</span>{fmt(n.title || topic.chapters[n.ch])}
              <button className="an-watch" onClick={() => watch(n.ch)}>▶ watch this chapter</button></h2>
            {(n.blocks || []).map((b, i) => <Safe key={i}><Block b={b} topic={topic} /></Safe>)}
          </section>
        ))}
        {topic.traps && (
          <section id="traps" className="an-traps">
            <h2><span className="num">⚠</span>Traps</h2>
            <ul>{topic.traps.map((t, i) => <li key={i}>{fmt(t)}</li>)}</ul>
          </section>
        )}
        {topic.recap && (
          <section id="recap" className="an-recap">
            <h2><span className="num">★</span>Recap</h2>
            <ol>{topic.recap.map((t, i) => <li key={i}>{fmt(t)}</li>)}</ol>
          </section>
        )}
        {topic.quiz && <Safe><Quiz topic={topic} /></Safe>}
      </main>

      <footer className="an-foot">
        {nav.prev ? <a href={nav.prev.href}>← {nav.prev.id} {nav.prev.title}</a> : <span></span>}
        <a href="../index.html">All topics</a>
        {nav.next ? <a href={nav.next.href}>{nav.next.id} {nav.next.title} →</a> : <span></span>}
      </footer>
    </div>
  );
}

export function mountTopic(id) {
  const topic = REG[id];
  const root = ReactDOM.createRoot(document.getElementById('root'));
  if (!topic) { root.render(<div style={{ padding: 40, color: '#f07a6a', font: '20px monospace' }}>Topic {id} is not registered.</div>); return; }
  const shot = new URLSearchParams(location.search).has('shot');
  if (shot) document.body.classList.add('an-shot');
  root.render(shot ? <TopicVideo topic={topic} /> : <TopicPage topic={topic} />);
}
