/**
 * Level und Werte.
 *
 * Bis Level 10 braucht jedes Level 20 XP mehr als das vorige. Danach wird es zusätzlich
 * Stück für Stück länger – damit spätere Level auch bei vielen Aufgaben am Tag etwas Besonderes bleiben.
 */
export const CURVE_FROM = 10;
const CURVE_STEEP = 4;

export function xpForLevel(level) {
  return 80 + level * 20 + (level > CURVE_FROM ? CURVE_STEEP * (level - CURVE_FROM) ** 2 : 0);
}

/** Kurve bis Version 1.6 – nur noch für den einmaligen Ausgleich (curveBonus). */
function linearXpForLevel(level) {
  return 80 + level * 20;
}

function levelWith(xpFor, totalXp) {
  let level = 1;
  let rest = Math.max(0, totalXp);
  let need = xpFor(1);
  while (rest >= need) { rest -= need; level += 1; need = xpFor(level); }
  return { level, current: rest, need, pct: rest / need };
}

export function levelInfo(totalXp) {
  return levelWith(xpForLevel, totalXp);
}

/** Gesamt-XP, mit dem ein Level erreicht ist. */
function xpAtLevel(level) {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpForLevel(l);
  return sum;
}

/**
 * Einmaliger Ausgleich beim Wechsel zur neuen Kurve: so viele Bonus-XP, dass Level und
 * Fortschrittsbalken genau gleich bleiben. Niemand rutscht durch ein Update ein Level zurück.
 */
export function curveBonus(xp) {
  const old = levelWith(linearXpForLevel, xp);
  const target = xpAtLevel(old.level) + Math.floor(old.pct * xpForLevel(old.level));
  return Math.max(0, target - Math.max(0, xp));
}

/** XP, nach denen sich das Level richtet (verdiente XP plus Ausgleich). */
export function totalXp(state) {
  return (Number(state.xp) || 0) + (Number(state.xpBonus) || 0);
}

export function statLevel(points) {
  return { stufe: Math.floor(points / 10) + 1, pct: (points % 10) / 10 };
}
