// Farbschema vor dem ersten Rendern setzen, damit nichts aufblitzt.
// Liegt als eigene Datei vor, damit die Content-Security-Policy keine Inline-Skripte erlauben muss.
(function () {
  try {
    // Muss zu STORAGE_KEY in src/constants/game.js passen
    var saved = JSON.parse(localStorage.getItem('purrgress-v1') || 'null');
    var theme = (saved && saved.settings && saved.settings.theme) || 'system';
    var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'dark' : 'light');
  } catch {
    /* ohne Speicher einfach hell starten */
  }
})();
