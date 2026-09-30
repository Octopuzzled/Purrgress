import { useEffect, useRef, useState } from 'react';
import { uid } from '../lib/id.js';

const CONFETTI_COLORS = ['#c4b5fd', '#a7f3d0', '#fed7aa', '#fbcfe8', '#fde68a', '#bae6fd'];

/**
 * Alles, was sich nach Belohnung anfühlt: Konfetti, XP-Popups,
 * der jubelnde Held und seine Sprechblase.
 */
export function useCelebration({ reduceMotion }) {
  const [fx, setFx] = useState([]);
  const [cheering, setCheering] = useState(false);
  const [cheerTick, setCheerTick] = useState(0);
  const [heroLine, setHeroLine] = useState(null);
  const cheerTimer = useRef(null);

  useEffect(() => {
    if (!heroLine) return undefined;
    const t = setTimeout(() => setHeroLine(null), 7000);
    return () => clearTimeout(t);
  }, [heroLine]);

  useEffect(() => () => clearTimeout(cheerTimer.current), []);

  const cheer = () => {
    setCheerTick((t) => t + 1);
    setCheering(true);
    clearTimeout(cheerTimer.current);
    cheerTimer.current = setTimeout(() => setCheering(false), 1100);
  };

  const say = (text) => setHeroLine({ id: uid(), text });

  /** Konfetti und schwebende Texte an einer Bildschirmposition. */
  const burst = (pt, labels, withConfetti = true) => {
    const id = uid();
    const items = [];
    const x = Math.min(Math.max(pt.x, 80), window.innerWidth - 80);
    if (withConfetti && !reduceMotion) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 40 + Math.random() * 55;
        items.push({
          id: `${id}-p${i}`, type: 'p', x: pt.x, y: pt.y,
          dx: Math.round(Math.cos(a) * dist), dy: Math.round(Math.sin(a) * dist - 18),
          rot: Math.round(Math.random() * 360), color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], round: i % 3 === 0,
        });
      }
    }
    labels.forEach((l, i) => {
      items.push({ id: `${id}-l${i}`, type: 'l', x, y: pt.y - 22 + i * 30, text: l.text, tone: l.tone, delay: i * 120 });
    });
    setFx((f) => [...f, ...items]);
    setTimeout(() => setFx((f) => f.filter((it) => !it.id.startsWith(id))), 1700);
  };

  return { fx, burst, cheering, cheerTick, cheer, heroLine: heroLine ? heroLine.text : null, say };
}
