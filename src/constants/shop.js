/**
 * Alle Teile der Umkleide mit Preisen und Farben. Preis 0 = von Anfang an im Schrank.
 *
 * Preiskurve: Grundteile 20–60, mittlere Teile 80–150, besondere Teile 150–400.
 * minLevel: Besondere Teile werden erst ab diesem Level freigeschaltet (Anprobieren geht immer).
 * Namen stehen in src/i18n/locales (shop.*).
 */
export const SHOP = {
  fell: { items: [
    { id: 'fell-vanille', price: 0, fill: '#fdf1dc', shade: '#ecd3aa', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-pfirsich', price: 30, fill: '#ffdcc8', shade: '#f2b596', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-lavendel', price: 40, fill: '#e6dcff', shade: '#c3b1f2', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-minze', price: 40, fill: '#cff3e2', shade: '#9fdcc0', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-himmel', price: 80, fill: '#d6eaff', shade: '#a8ccf2', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-wolke', price: 80, fill: '#e8e9ee', shade: '#c4c7d1', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-nacht', price: 250, minLevel: 8, fill: '#454c64', shade: '#2d3346', eye: '#f8fafc', hl: '#454c64' },
  ]},
  augen: { items: [
    { id: 'augen-klassisch', price: 0 },
    { id: 'augen-verschlafen', price: 20 },
    { id: 'augen-froh', price: 40 },
    { id: 'augen-funkeln', price: 150, minLevel: 5 },
  ]},
  kopf: { items: [
    { id: 'kopf-nichts', price: 0 },
    { id: 'kopf-muetze', price: 40 },
    { id: 'kopf-party', price: 60 },
    { id: 'kopf-blumen', price: 100 },
    { id: 'kopf-frosch', price: 150 },
    { id: 'kopf-hexe', price: 300, minLevel: 8 },
    { id: 'kopf-krone', price: 400, minLevel: 12 },
  ]},
  kleidung: { items: [
    { id: 'kleidung-nichts', price: 0 },
    { id: 'kleidung-schal', price: 30 },
    { id: 'kleidung-pulli', price: 80, sleeve: '#bfe0ff' },
    { id: 'kleidung-latzhose', price: 120 },
    { id: 'kleidung-hoodie', price: 150, sleeve: '#a9e7cb' },
    { id: 'kleidung-umhang', price: 300, minLevel: 8 },
  ]},
  extra: { items: [
    { id: 'extra-nichts', price: 0 },
    { id: 'extra-bluemchen', price: 25 },
    { id: 'extra-schleife', price: 30 },
    { id: 'extra-brille', price: 60 },
    { id: 'extra-kopfhoerer', price: 120 },
    { id: 'extra-stab', price: 250, minLevel: 5 },
  ]},
  hintergrund: { items: [
    { id: 'bg-minze', price: 0 },
    { id: 'bg-lavendel', price: 20 },
    { id: 'bg-pfirsich', price: 20 },
    { id: 'bg-wolken', price: 100 },
    { id: 'bg-sterne', price: 200, minLevel: 5 },
    { id: 'bg-regenbogen', price: 350, minLevel: 12 },
  ]},
};

export const SLOTS = ['fell', 'augen', 'kopf', 'kleidung', 'extra', 'hintergrund'];

export const DEFAULT_EQUIP = {
  fell: 'fell-vanille', augen: 'augen-klassisch', kopf: 'kopf-nichts',
  kleidung: 'kleidung-nichts', extra: 'extra-nichts', hintergrund: 'bg-minze',
};

export const FREE_ITEMS = SLOTS.flatMap((s) => SHOP[s].items.filter((i) => i.price === 0).map((i) => i.id));

export function findItem(slot, id) {
  const s = SHOP[slot];
  if (!s) return null;
  return s.items.find((i) => i.id === id) || s.items[0];
}

/** Ist ein Teil für dieses Level schon freigeschaltet? */
export function isUnlocked(item, level) {
  return !item.minLevel || level >= item.minLevel;
}
