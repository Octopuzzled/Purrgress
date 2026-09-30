export function FxLayer({ items }) {
  return (
    <div aria-hidden="true">
      {items.map((it) => (it.type === 'p'
        ? <span key={it.id} className="fx-particle" style={{
            left: it.x, top: it.y, background: it.color, borderRadius: it.round ? '999px' : '3px',
            '--dx': `${it.dx}px`, '--dy': `${it.dy}px`, '--rot': `${it.rot}deg`,
          }} />
        : <span key={it.id} className={`fx-pop ${it.tone === 'coin' ? 'fx-coin' : 'fx-xp'}`}
            style={{ left: it.x, top: it.y, animationDelay: `${it.delay || 0}ms` }}>{it.text}</span>
      ))}
    </div>
  );
}
