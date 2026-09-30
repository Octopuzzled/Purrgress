export function xpForLevel(level) { return 80 + level * 20; }

export function levelInfo(totalXp) {
  let level = 1;
  let rest = Math.max(0, totalXp);
  let need = xpForLevel(1);
  while (rest >= need) { rest -= need; level += 1; need = xpForLevel(level); }
  return { level, current: rest, need, pct: rest / need };
}

export function statLevel(points) {
  return { stufe: Math.floor(points / 10) + 1, pct: (points % 10) / 10 };
}
