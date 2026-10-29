/** Einzelteile von Mochi als SVG: Hintergründe, Hüte, Kleidung, Extras, Augen. */
import { starPoints } from '../../lib/geometry.js';

export function Background({ id }) {
  switch (id) {
    case 'bg-lavendel': return <rect width="200" height="200" fill="#ece5ff" />;
    case 'bg-pfirsich': return <rect width="200" height="200" fill="#ffe7da" />;
    case 'bg-wolken':
      return (
        <g>
          <rect width="200" height="200" fill="#dcecff" />
          <g fill="#ffffff" opacity="0.95">
            <ellipse cx="42" cy="54" rx="22" ry="9" /><ellipse cx="54" cy="47" rx="13" ry="9" />
            <ellipse cx="152" cy="40" rx="20" ry="8" /><ellipse cx="162" cy="34" rx="11" ry="7" />
            <ellipse cx="168" cy="150" rx="17" ry="7" /><ellipse cx="30" cy="140" rx="14" ry="6" />
          </g>
        </g>
      );
    case 'bg-sterne':
      return (
        <g>
          <rect width="200" height="200" fill="#2f3553" />
          {[[34, 50, 1.6], [58, 28, 1.2], [150, 76, 1.4], [178, 116, 1.1], [26, 120, 1.3], [60, 160, 1], [140, 168, 1.4], [178, 150, 1], [96, 20, 1.1]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#fef3c7" opacity={0.6 + (i % 3) * 0.13} />
          ))}
          <polygon points={starPoints(40, 86, 5, 2)} fill="#fde68a" />
          <polygon points={starPoints(176, 84, 4, 1.6)} fill="#fde68a" />
          <circle cx="148" cy="36" r="13" fill="#fef3c7" />
          <circle cx="154" cy="31" r="11" fill="#2f3553" />
        </g>
      );
    case 'bg-regenbogen':
      return (
        <g>
          <rect width="200" height="200" fill="#fff4ea" />
          {[['#fbc8c8', 92], ['#fde0b8', 82], ['#fdf1b0', 72], ['#cdeedb', 62], ['#cfe0ff', 52], ['#e3d6ff', 42]].map(([c, r], i) => (
            <path key={i} d={`M${100 - r} 160 A${r} ${r} 0 0 1 ${100 + r} 160`} fill="none" stroke={c} strokeWidth="10" />
          ))}
        </g>
      );
    default: return <rect width="200" height="200" fill="#d6f5e7" />;
  }
}

const FLOWERS = [[56, 84, '#fbcfe8'], [70, 74, '#fde68a'], [85, 68, '#c4b5fd'], [100, 65, '#fbcfe8'], [115, 68, '#fed7aa'], [130, 74, '#bbf7d0'], [144, 84, '#c4b5fd']];

export function Petals({ x, y, color, dist = 5, r = 4.2, center = '#fbbf24' }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
        return <circle key={k} cx={x + Math.cos(a) * dist} cy={y + Math.sin(a) * dist} r={r} fill={color} />;
      })}
      <circle cx={x} cy={y} r={r * 0.75} fill={center} opacity="0.9" />
    </g>
  );
}

export function Hat({ id }) {
  switch (id) {
    case 'kopf-muetze':
      return (
        <g>
          <path d="M46 92 Q44 30 100 28 Q156 30 154 92 Z" fill="#cbbaf7" />
          <path d="M72 40 Q74 60 72 82 M100 30 L100 82 M128 40 Q126 60 128 82" stroke="#bba6f2" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="42" y="80" width="116" height="16" rx="8" fill="#b19bf0" />
          <circle cx="100" cy="26" r="11" fill="#fdf4ff" />
        </g>
      );
    case 'kopf-party':
      return (
        <g transform="rotate(10 100 74)">
          <path d="M78 76 L102 18 L124 76 Z" fill="#fbcfe8" stroke="#f5a8cf" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="96" cy="60" r="3.5" fill="#fde68a" />
          <circle cx="108" cy="44" r="3" fill="#a5f3fc" />
          <circle cx="112" cy="66" r="3" fill="#c4b5fd" />
          <circle cx="102" cy="31" r="2.5" fill="#fde68a" />
          <path d="M78 76 Q101 82 124 76" stroke="#f5a8cf" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="102" cy="17" r="7" fill="#a5f3fc" />
        </g>
      );
    case 'kopf-blumen':
      return (
        <g>
          <path d="M52 90 Q60 70 85 66 Q100 62 115 66 Q140 70 148 90" fill="none" stroke="#9ed9a9" strokeWidth="4" strokeLinecap="round" />
          {FLOWERS.map(([x, y, c], i) => <Petals key={i} x={x} y={y} color={c} />)}
        </g>
      );
    case 'kopf-frosch':
      return (
        <g>
          <path d="M46 94 Q44 40 100 38 Q156 40 154 94 Q100 84 46 94 Z" fill="#aee6bd" />
          <circle cx="72" cy="42" r="14" fill="#aee6bd" />
          <circle cx="128" cy="42" r="14" fill="#aee6bd" />
          <circle cx="72" cy="42" r="8" fill="#ffffff" />
          <circle cx="128" cy="42" r="8" fill="#ffffff" />
          <circle cx="73.5" cy="43" r="4" fill="#334155" />
          <circle cx="129.5" cy="43" r="4" fill="#334155" />
          <path d="M84 70 Q100 79 116 70" fill="none" stroke="#6fc58a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="64" cy="74" r="4" fill="#f9a8c0" opacity="0.7" />
          <circle cx="136" cy="74" r="4" fill="#f9a8c0" opacity="0.7" />
        </g>
      );
    case 'kopf-hexe':
      return (
        <g>
          <path d="M70 74 L94 22 Q100 10 113 14 Q104 20 106 30 L132 74 Z" fill="#7a68ad" />
          <path d="M77 58 L123 58 L127 65 L74 65 Z" fill="#f7a8cc" />
          <polygon points={starPoints(100, 42, 6, 2.6)} fill="#fde68a" />
          <ellipse cx="100" cy="77" rx="60" ry="10" fill="#655493" />
        </g>
      );
    case 'kopf-krone':
      return (
        <g>
          <path d="M70 76 L64 44 L84 60 L100 36 L116 60 L136 44 L130 76 Z" fill="#fcd34d" stroke="#f0b53b" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="64" cy="44" r="3.5" fill="#fcd34d" />
          <circle cx="100" cy="36" r="4" fill="#fcd34d" />
          <circle cx="136" cy="44" r="3.5" fill="#fcd34d" />
          <circle cx="100" cy="64" r="4.5" fill="#f9a8d4" />
          <circle cx="82" cy="68" r="3" fill="#a5b4fc" />
          <circle cx="118" cy="68" r="3" fill="#6ee7b7" />
        </g>
      );
    default: return null;
  }
}

export function ClothBack({ id }) {
  if (id === 'kleidung-umhang') {
    return <path d="M60 128 Q30 168 44 186 Q100 196 156 186 Q170 168 140 128 Z" fill="#b8a5ec" />;
  }
  return null;
}

export function ClothBody({ id }) {
  switch (id) {
    case 'kleidung-pulli':
      return (
        <g>
          <rect x="38" y="134" width="124" height="46" fill="#bfe0ff" />
          <path d="M42 134 Q100 147 158 134" fill="none" stroke="#a6d0fa" strokeWidth="5" />
          <path d="M100 164 C89 156 89 147 95 147 C98 147 100 150 100 150 C100 150 102 147 105 147 C111 147 111 156 100 164 Z" fill="#f7a1b5" />
        </g>
      );
    case 'kleidung-hoodie':
      return (
        <g>
          <rect x="38" y="132" width="124" height="48" fill="#a9e7cb" />
          <path d="M58 133 Q100 152 142 133" fill="none" stroke="#8fd9b6" strokeWidth="6" strokeLinecap="round" />
          <path d="M93 142 L92 150 M107 142 L108 150" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="92" cy="151" r="2" fill="#ffffff" />
          <circle cx="108" cy="151" r="2" fill="#ffffff" />
          <rect x="77" y="154" width="46" height="14" rx="7" fill="#95dcbc" />
        </g>
      );
    case 'kleidung-latzhose':
      return (
        <g>
          <rect x="38" y="150" width="124" height="30" fill="#a9c4f5" />
          <rect x="80" y="136" width="40" height="20" rx="5" fill="#a9c4f5" />
          <path d="M85 139 L72 128 M115 139 L128 128" stroke="#a9c4f5" strokeWidth="5" strokeLinecap="round" />
          <circle cx="86" cy="143" r="2.4" fill="#fde68a" />
          <circle cx="114" cy="143" r="2.4" fill="#fde68a" />
          <rect x="92" y="142" width="16" height="9" rx="2.5" fill="#94b3ee" />
        </g>
      );
    default: return null;
  }
}

export function ClothFront({ id }) {
  switch (id) {
    case 'kleidung-schal':
      return (
        <g>
          <path d="M50 128 Q100 150 150 128 L148 142 Q100 164 52 142 Z" fill="#fdb99b" stroke="#f59e7c" strokeWidth="2" strokeLinejoin="round" />
          <path d="M116 146 L124 178 L110 180 L104 150 Z" fill="#fdb99b" stroke="#f59e7c" strokeWidth="2" strokeLinejoin="round" />
          <path d="M108 164 L121 162" stroke="#fde2d2" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'kleidung-umhang':
      return (
        <g>
          <path d="M76 130 L100 140 L86 148 Z" fill="#a592e6" />
          <path d="M124 130 L100 140 L114 148 Z" fill="#a592e6" />
          <circle cx="100" cy="140" r="5" fill="#fde68a" stroke="#f5c542" strokeWidth="1.5" />
        </g>
      );
    default: return null;
  }
}

export function Extra({ id, fur }) {
  switch (id) {
    case 'extra-bluemchen':
      return <Petals x={68} y={76} color="#ffffff" dist={6} r={5} center="#fcd34d" />;
    case 'extra-schleife':
      return (
        <g>
          <path d="M130 78 L114 69 L115 88 Z" fill="#f9a8c9" stroke="#f9a8c9" strokeWidth="4" strokeLinejoin="round" />
          <path d="M130 78 L146 69 L145 88 Z" fill="#f9a8c9" stroke="#f9a8c9" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="130" cy="78" r="5" fill="#f472b6" />
        </g>
      );
    case 'extra-brille':
      return (
        <g fill="none" stroke={fur.eye} strokeWidth="3">
          <circle cx="80" cy="112" r="12" fill="#ffffff" fillOpacity="0.18" />
          <circle cx="120" cy="112" r="12" fill="#ffffff" fillOpacity="0.18" />
          <path d="M92 110 Q100 105 108 110" />
        </g>
      );
    case 'extra-kopfhoerer':
      return (
        <g>
          <path d="M44 112 Q42 50 100 48 Q158 50 156 112" fill="none" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
          <rect x="33" y="97" width="19" height="30" rx="9" fill="#f9a8c9" />
          <rect x="148" y="97" width="19" height="30" rx="9" fill="#f9a8c9" />
        </g>
      );
    case 'extra-stab':
      return (
        <g>
          <path d="M152 150 L174 110" stroke="#d6b48c" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points={starPoints(176, 105, 12, 5)} fill="#fde68a" stroke="#f5c542" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="186" cy="90" r="2" fill="#fde68a" />
          <circle cx="164" cy="90" r="1.6" fill="#fde68a" />
        </g>
      );
    default: return null;
  }
}

export function Eyes({ id, fur, still }) {
  const c = fur.eye;
  const hl = fur.hl;
  switch (id) {
    case 'augen-froh':
      return (
        <g fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round">
          <path d="M73 115 Q80 105 87 115" />
          <path d="M113 115 Q120 105 127 115" />
        </g>
      );
    case 'augen-verschlafen':
      return (
        <g>
          <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
            <path d="M73 112 Q80 118 87 112" />
            <path d="M113 112 Q120 118 127 112" />
          </g>
          <text x="160" y="96" fontSize="14" fontWeight="700" fill={c} opacity="0.45" fontFamily="Fredoka, Nunito, sans-serif">z</text>
          <text x="170" y="82" fontSize="10" fontWeight="700" fill={c} opacity="0.35" fontFamily="Fredoka, Nunito, sans-serif">z</text>
        </g>
      );
    case 'augen-funkeln':
      return (
        <g>
          <polygon points={starPoints(80, 112, 9, 4)} fill={c} strokeLinejoin="round" />
          <polygon points={starPoints(120, 112, 9, 4)} fill={c} strokeLinejoin="round" />
          <circle cx="83" cy="108" r="1.8" fill={hl} />
          <circle cx="123" cy="108" r="1.8" fill={hl} />
        </g>
      );
    default:
      return (
        <g>
          <g className={still ? '' : 'eye-blink'}>
            <ellipse cx="80" cy="112" rx="6" ry="8" fill={c} />
            <circle cx="82.2" cy="108.8" r="2.2" fill={hl} />
          </g>
          <g className={still ? '' : 'eye-blink'}>
            <ellipse cx="120" cy="112" rx="6" ry="8" fill={c} />
            <circle cx="122.2" cy="108.8" r="2.2" fill={hl} />
          </g>
        </g>
      );
  }
}
