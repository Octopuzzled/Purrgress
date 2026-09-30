import { ICONS } from './icons.js';

export function Icon({ name, size = 20, className = '', strokeWidth = 2 }) {
  const parts = ICONS[name] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {parts.map((p, i) => {
        if (typeof p === 'string') return <path key={i} d={p} />;
        if (p.c) return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} />;
        return <rect key={i} x={p.r[0]} y={p.r[1]} width={p.r[2]} height={p.r[3]} rx={p.r[4]} />;
      })}
    </svg>
  );
}
