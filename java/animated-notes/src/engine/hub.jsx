// Hub: every part and topic from the manifest, with the learner's progress.
import { store } from './timeline.js';
import { fmtTime } from './player.jsx';

function TopicCard({ part, t }) {
  const meta = store.get(t.id + ':meta', null);
  const watched = store.get(t.id + ':watched', []).length;
  const quiz = store.get(t.id + ':quiz', {}) || {};
  const answered = Object.keys(quiz).length;
  const learned = store.get(t.id + ':learned', false);
  const pos = store.get(t.id + ':pos', 0);
  const live = t.status === 'ready';
  const pct = meta ? Math.round((watched / meta.chapters) * 100) : 0;
  const inner = (
    <React.Fragment>
      <div className="row1">
        <span className="id">{t.id}</span>
        <span className={'pill ' + t.status}>{t.status === 'ready' ? 'Ready' : t.status === 'building' ? 'In progress' : 'Planned'}</span>
        {learned && <span className="pill learned">✓ Learned</span>}
      </div>
      <div className="title">{t.title}</div>
      {live && meta ? (
        <div className="prog">
          <div className="bar"><div style={{ width: pct + '%' }}></div></div>
          <div className="meta">
            <span>{watched}/{meta.chapters} chapters</span>
            <span>{fmtTime(meta.duration)}</span>
            {answered > 0 && <span>quiz {answered}/{meta.quiz}</span>}
            {pos > 5 && pos < meta.duration - 3 && <span className="cont">continue at {fmtTime(pos)}</span>}
          </div>
        </div>
      ) : <div className="prog"><div className="meta"><span>{live ? 'Not started' : t.status === 'building' ? 'Being built now' : 'Planned'}</span></div></div>}
    </React.Fragment>
  );
  return live
    ? <a className={'an-card' + (learned ? ' learned' : '')} href={`${part.dir}/${t.id}-${t.slug}.html`}>{inner}</a>
    : <div className="an-card planned">{inner}</div>;
}

function Hub() {
  const m = window.AN_MANIFEST || { parts: [] };
  const all = m.parts.flatMap((p) => p.topics);
  const learnedN = all.filter((t) => store.get(t.id + ':learned', false)).length;
  const readyN = all.filter((t) => t.status === 'ready').length;
  return (
    <div className="an-page an-hub">
      <h1 className="an-h1">{m.title || 'Animated notes'}</h1>
      <p className="an-lede">Watch each topic, then revise from its notes. Progress is saved in this browser.</p>
      <div className="an-overall">
        <div className="bar"><div style={{ width: `${(learnedN / Math.max(1, all.length)) * 100}%` }}></div></div>
        <span>{learnedN} of {all.length} learned · {readyN} available</span>
      </div>
      {m.parts.map((p) => (
        <section key={p.id} className="an-part">
          <h2><span className="num">{p.id}</span>{p.title}</h2>
          {p.sub && <p className="muted">{p.sub}</p>}
          <div className="an-grid">{p.topics.map((t) => <TopicCard key={t.id} part={p} t={t} />)}</div>
        </section>
      ))}
    </div>
  );
}

export function mountHub() {
  ReactDOM.createRoot(document.getElementById('root')).render(<Hub />);
}
