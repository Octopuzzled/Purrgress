/**
 * Sprachunabhängige Zeitanzeige für den Timer („4:59“, „+2:05“).
 * Sprachabhängiges (Dauer, Uhrzeit) liefert useI18n(): duration() und clock().
 */
export function fmtTimer(ms) {
  const over = ms < 0;
  const sec = over ? Math.floor(-ms / 1000) : Math.ceil(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const core = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  return over ? `+${core}` : core;
}
