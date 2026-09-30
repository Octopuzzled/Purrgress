export function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

export function systemPrefersDark() {
  const dt = document.documentElement.getAttribute('data-theme');
  if (dt === 'dark') return true;
  if (dt === 'light') return false;
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; }
}
