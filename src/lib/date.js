export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function lastDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push({ key: dayKey(d), weekday: d.getDay(), isToday: i === 0 });
  }
  return out;
}

export function streakFrom(history) {
  let count = 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (!(history[dayKey(d)] > 0)) d.setDate(d.getDate() - 1);
  while (history[dayKey(d)] > 0) { count += 1; d.setDate(d.getDate() - 1); }
  return count;
}
