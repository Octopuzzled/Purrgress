/**
 * Vorlagen-Bibliothek: Aufbau und Spielwerte.
 * Titel, Beschreibungen und Mini-Schritte stehen in src/i18n/locales (library.*).
 * Richtwert: höchstens 8 Vorlagen pro Gruppe – zu viel Auswahl lähmt.
 */
export const LIBRARY = [
  {
    id: 'adhs', icon: 'sparkles',
    tone: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200',
    items: [
      { id: 't-5min', minutes: 5, category: 'routine', difficulty: 'leicht' },
      { id: 't-bodydouble', category: 'fokus', difficulty: 'leicht' },
      { id: 't-dopamin', minutes: 5, category: 'fokus', difficulty: 'leicht' },
      { id: 't-impuls', minutes: 10, category: 'fokus', difficulty: 'mittel' },
      { id: 't-2min', minutes: 2, category: 'routine', difficulty: 'leicht' },
      { id: 't-braindump', minutes: 5, category: 'fokus', difficulty: 'leicht' },
      { id: 't-startrampe', when: 'abends', minutes: 5, category: 'routine', difficulty: 'leicht' },
      { id: 't-erstersatz', minutes: 5, category: 'fokus', difficulty: 'leicht' },
    ],
  },
  {
    id: 'autismus', icon: 'anchor',
    tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
    items: [
      { id: 't-sensorik', minutes: 5, category: 'pflege', difficulty: 'leicht' },
      { id: 't-anker', when: 'morgens', category: 'routine', difficulty: 'mittel', repeat: 'daily' },
      { id: 't-abend', when: 'abends', category: 'routine', difficulty: 'mittel', repeat: 'daily' },
      { id: 't-recharge', category: 'sozial', difficulty: 'mittel' },
      { id: 't-erholung', category: 'pflege', difficulty: 'leicht' },
      { id: 't-planung', when: 'abends', minutes: 10, category: 'fokus', difficulty: 'mittel' },
      { id: 't-reizfilter', category: 'pflege', difficulty: 'leicht' },
      { id: 't-uebergang', minutes: 5, category: 'routine', difficulty: 'leicht' },
    ],
  },
  {
    id: 'alltag', icon: 'home',
    tone: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
    items: [
      { id: 't-post', minutes: 10, category: 'routine', difficulty: 'mittel' },
      { id: 't-anruf', category: 'sozial', difficulty: 'schwer' },
      { id: 't-skript', minutes: 10, category: 'sozial', difficulty: 'mittel' },
      { id: 't-waesche', minutes: 5, category: 'routine', difficulty: 'leicht' },
      { id: 't-chaos', minutes: 5, category: 'routine', difficulty: 'leicht' },
      { id: 't-rechnung', minutes: 15, category: 'fokus', difficulty: 'mittel' },
    ],
  },
  {
    id: 'wohl', icon: 'heart',
    tone: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-200',
    items: [
      { id: 't-wasser', when: 'morgens', category: 'pflege', difficulty: 'leicht', repeat: 'daily' },
      { id: 't-lueften', minutes: 5, category: 'pflege', difficulty: 'leicht' },
      { id: 't-tageslicht', when: 'morgens', minutes: 10, category: 'pflege', difficulty: 'leicht' },
      { id: 't-spaziergang', minutes: 15, category: 'pflege', difficulty: 'mittel' },
      { id: 't-dehnen', minutes: 2, category: 'pflege', difficulty: 'leicht' },
      { id: 't-essen', category: 'pflege', difficulty: 'mittel' },
      { id: 't-herzensthema', minutes: 20, category: 'pflege', difficulty: 'leicht' },
      { id: 't-nachricht', category: 'sozial', difficulty: 'leicht' },
    ],
  },
];

/** Pseudo-Gruppe für selbst gespeicherte Vorlagen (Inhalt kommt aus dem Spielstand). */
export const CUSTOM_GROUP = {
  id: 'eigene', icon: 'bookmark',
  tone: 'bg-pink-100 text-pink-800 dark:bg-pink-400/15 dark:text-pink-200',
};
