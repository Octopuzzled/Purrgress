import { useRef } from 'react';
import { DEFAULT_EQUIP, findItem } from '../../constants/shop.js';
import { starPoints } from '../../lib/geometry.js';
import { Background, ClothBack, ClothBody, ClothFront, Extra, Eyes, Hat } from './parts.jsx';
import { useI18n } from '../../i18n/useI18n.js';

/** Kleine Requisiten, wenn Mochi während einer Zeitbox mitarbeitet. Sitzen vor dem Bauch. */
function Activity({ activity, fur }) {
  switch (activity) {
    case 'read':
      return (
        <g>
          <path d="M64 140 L100 147 L136 140 L136 167 L100 174 L64 167 Z" fill="#a78bfa" stroke={fur.shade} strokeWidth="2" strokeLinejoin="round" />
          <path d="M68 141 Q85 138 100 145 L100 169 Q85 163 68 165 Z" fill="#ffffff" />
          <path d="M132 141 Q115 138 100 145 L100 169 Q115 163 132 165 Z" fill="#ffffff" />
          <g stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round">
            <path d="M74 148 L94 151" /><path d="M74 154 L94 157" /><path d="M126 148 L106 151" /><path d="M126 154 L106 157" />
          </g>
          <path className="anim-page" d="M132 141 Q115 138 100 145 L100 169 Q115 163 132 165 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        </g>
      );
    case 'knit':
      return (
        <g>
          <rect x="84" y="148" width="30" height="16" rx="4" fill="#93c5fd" stroke={fur.shade} strokeWidth="2" />
          <path d="M88 154 L110 154 M88 159 L110 159" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
          <g className="anim-knit">
            <path d="M80 134 L108 160" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
            <path d="M118 134 L90 160" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="132" cy="163" r="10" fill="#f9a8d4" stroke={fur.shade} strokeWidth="2" />
          <path d="M125 158 Q132 165 139 158 M124 165 Q132 171 140 165" fill="none" stroke="#ec4899" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M122 163 Q114 166 112 160" fill="none" stroke="#f9a8d4" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case 'write':
      return (
        <g>
          <rect x="68" y="146" width="56" height="24" rx="3" fill="#ffffff" stroke={fur.shade} strokeWidth="2" />
          <g stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round"><path d="M74 153 L112 153" /><path d="M74 159 L106 159" /><path d="M74 165 L96 165" /></g>
          <g className="anim-write">
            <path d="M96 164 L110 142" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M96 164 L98.5 160" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/**
 * mood: 'idle' | 'cheer'. activity (während einer Zeitbox): 'read' | 'knit' | 'write' | 'doze'.
 * Beim Dösen sind die Augen zu, ein „z“ steigt auf.
 */
export function Avatar({ equip, mood = 'idle', title, still = false, activity = null }) {
  const { t } = useI18n();
  const idRef = useRef('av' + Math.random().toString(36).slice(2, 9));
  const id = idRef.current;
  const e = { ...DEFAULT_EQUIP, ...(equip || {}) };
  const fur = findItem('fell', e.fell);
  const cloth = findItem('kleidung', e.kleidung);
  const armFill = cloth.sleeve || fur.fill;
  const cheer = mood === 'cheer';
  const motionClass = cheer ? 'anim-cheer' : (still ? '' : 'anim-bob');

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label={title || t('hero.yours')} className="block">
      <defs>
        <clipPath id={`${id}-bg`}><circle cx="100" cy="100" r="96" /></clipPath>
        <clipPath id={`${id}-body`}><ellipse cx="100" cy="118" rx="58" ry="52" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-bg)`}>
        <Background id={e.hintergrund} />
        <ellipse cx="100" cy="181" rx="48" ry="7" fill="#334155" opacity="0.12" />
        <g className={motionClass}>
          <ClothBack id={e.kleidung} />
          {/* Schwanz */}
          <path d="M146 158 Q182 152 172 116" fill="none" stroke={fur.shade} strokeWidth="12" strokeLinecap="round" />
          {/* Ohren */}
          <path d="M50 92 L56 40 L92 68 Z" fill={fur.fill} stroke={fur.shade} strokeWidth="3" strokeLinejoin="round" />
          <path d="M150 92 L144 40 L108 68 Z" fill={fur.fill} stroke={fur.shade} strokeWidth="3" strokeLinejoin="round" />
          <path d="M61 80 L63 54 L80 69 Z" fill="#f9c0cc" opacity="0.85" />
          <path d="M139 80 L137 54 L120 69 Z" fill="#f9c0cc" opacity="0.85" />
          {/* Körper */}
          <ellipse cx="100" cy="118" rx="58" ry="52" fill={fur.fill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="100" cy="146" rx="30" ry="19" fill="#ffffff" opacity="0.35" />
          {fur.speckle && (
            <g fill={fur.speckle}>
              {[[70, 96, 2.2], [132, 100, 1.8], [60, 146, 2], [142, 150, 2.4], [104, 166, 1.6], [84, 84, 1.4], [120, 82, 1.6]].map(([x, y, r], i) => (
                <polygon key={i} points={starPoints(x, y, r * 1.8, r * 0.75)} opacity="0.85" />
              ))}
            </g>
          )}
          <g clipPath={`url(#${id}-body)`}><ClothBody id={e.kleidung} /></g>
          <ClothFront id={e.kleidung} />
          {/* Füße & Arme */}
          <ellipse cx="80" cy="169" rx="15" ry="9" fill={fur.fill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="120" cy="169" rx="15" ry="9" fill={fur.fill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="45" cy="140" rx="10" ry="13" transform="rotate(22 45 140)" fill={armFill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="155" cy="140" rx="10" ry="13" transform="rotate(-22 155 140)" fill={armFill} stroke={fur.shade} strokeWidth="3" />
          {/* Gesicht */}
          <ellipse cx="66" cy="127" rx="8.5" ry="5" fill="#f7a1b5" opacity="0.55" />
          <ellipse cx="134" cy="127" rx="8.5" ry="5" fill="#f7a1b5" opacity="0.55" />
          {activity === 'doze' ? (
            <g>
              <g fill="none" stroke={fur.eye} strokeWidth="3.2" strokeLinecap="round">
                <path d="M73 113 Q80 119 87 113" /><path d="M113 113 Q120 119 127 113" />
              </g>
              <text className="anim-zzz" x="150" y="88" fontSize="16" fontWeight="700" fill={fur.eye} fontFamily="Fredoka, Nunito, sans-serif">z</text>
              <text className="anim-zzz" x="162" y="72" fontSize="11" fontWeight="700" fill={fur.eye} fontFamily="Fredoka, Nunito, sans-serif" style={{ animationDelay: '1.2s' }}>z</text>
            </g>
          ) : <Eyes id={cheer ? 'augen-froh' : e.augen} fur={fur} still={still} />}
          {cheer
            ? <path d="M93 123 Q100 135 107 123 Z" fill="#e8798f" stroke={fur.eye} strokeWidth="2" strokeLinejoin="round" />
            : <path d="M93 123 Q96.5 127.5 100 123 Q103.5 127.5 107 123" fill="none" stroke={fur.eye} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
          {!cheer && <Activity activity={activity} fur={fur} />}
          <Hat id={e.kopf} />
          <Extra id={e.extra} fur={fur} />
          {cheer && (
            <g>
              <polygon className="anim-sparkle" points={starPoints(34, 70, 7, 3)} fill="#fde68a" />
              <polygon className="anim-sparkle" points={starPoints(168, 58, 6, 2.5)} fill="#fbcfe8" style={{ animationDelay: '120ms' }} />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
