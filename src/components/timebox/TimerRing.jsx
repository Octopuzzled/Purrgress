export function TimerRing({ size, stroke, progress, over, running, children }) {
  const r = 50 - stroke / 2 - 1;
  const C = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const color = over ? '#fdba74' : running ? '#c4b5fd' : '#cbd5e1';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth={stroke} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="ring-track"
          strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 50 50)" />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center text-center">{children}</div>}
    </div>
  );
}
