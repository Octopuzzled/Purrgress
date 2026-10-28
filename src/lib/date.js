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

/** Ist das ein Tagesschlüssel wie „2026-10-28“? */
export function isDayKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDayKey(value).getTime());
}

/** Tagesschlüssel → Datum (12 Uhr mittags, damit Zeitumstellungen nicht stören). */
export function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key, n) {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

/** Wie viele Tage liegt `to` nach `from`? (negativ, wenn davor) */
export function daysBetween(from, to) {
  return Math.round((parseDayKey(to) - parseDayKey(from)) / 86400000);
}
