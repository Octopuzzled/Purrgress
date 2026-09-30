import { useRef } from 'react';
import { DEFAULT_EQUIP, findItem } from '../../constants/shop.js';
import { starPoints } from '../../lib/geometry.js';
import { renderBackground, renderClothBack, renderClothBody, renderClothFront, renderExtra, renderEyes, renderHat } from './parts.jsx';
import { useI18n } from '../../i18n/useI18n.js';

export function Avatar({ equip, mood = 'idle', title, still = false }) {
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
        {renderBackground(e.hintergrund)}
        <ellipse cx="100" cy="181" rx="48" ry="7" fill="#334155" opacity="0.12" />
        <g className={motionClass}>
          {renderClothBack(e.kleidung)}
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
          <g clipPath={`url(#${id}-body)`}>{renderClothBody(e.kleidung)}</g>
          {renderClothFront(e.kleidung)}
          {/* Füße & Arme */}
          <ellipse cx="80" cy="169" rx="15" ry="9" fill={fur.fill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="120" cy="169" rx="15" ry="9" fill={fur.fill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="45" cy="140" rx="10" ry="13" transform="rotate(22 45 140)" fill={armFill} stroke={fur.shade} strokeWidth="3" />
          <ellipse cx="155" cy="140" rx="10" ry="13" transform="rotate(-22 155 140)" fill={armFill} stroke={fur.shade} strokeWidth="3" />
          {/* Gesicht */}
          <ellipse cx="66" cy="127" rx="8.5" ry="5" fill="#f7a1b5" opacity="0.55" />
          <ellipse cx="134" cy="127" rx="8.5" ry="5" fill="#f7a1b5" opacity="0.55" />
          {renderEyes(cheer ? 'augen-froh' : e.augen, fur, still)}
          {cheer
            ? <path d="M93 123 Q100 135 107 123 Z" fill="#e8798f" stroke={fur.eye} strokeWidth="2" strokeLinejoin="round" />
            : <path d="M93 123 Q96.5 127.5 100 123 Q103.5 127.5 107 123" fill="none" stroke={fur.eye} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
          {renderHat(e.kopf)}
          {renderExtra(e.extra, fur)}
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
