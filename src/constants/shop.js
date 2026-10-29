/**
 * Alle Teile der Umkleide mit Preisen und Farben. Preis 0 = von Anfang an im Schrank.
 *
 * Preiskurve: Grundteile 20–60, mittlere Teile 80–150, besondere Teile 150–400.
 * minLevel: Besondere Teile werden erst ab diesem Level freigeschaltet (Anprobieren geht immer).
 *   Ab Level 15 gibt es alle fünf Level ein Meilenstein-Teil (15, 20, 25, 30).
 * surprise: 'common' | 'rare' – nicht zu kaufen, nur als Überraschung beim Abhaken (lib/surprise.js).
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
    { id: 'fell-karamell', price: 120, fill: '#f3d2a6', shade: '#d9a86c', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-salbei', price: 120, fill: '#dbe8d3', shade: '#adc79f', eye: '#3b3550', hl: '#ffffff' },
    { id: 'fell-nacht', price: 250, minLevel: 8, fill: '#454c64', shade: '#2d3346', eye: '#f8fafc', hl: '#454c64' },
    { id: 'fell-sternenstaub', price: 450, minLevel: 15, fill: '#5b5f97', shade: '#3f4378', eye: '#f8fafc', hl: '#5b5f97', speckle: '#fde68a' },
  ]},
  augen: { items: [
    { id: 'augen-klassisch', price: 0 },
    { id: 'augen-verschlafen', price: 20 },
    { id: 'augen-froh', price: 40 },
    { id: 'augen-herz', price: 100 },
    { id: 'augen-funkeln', price: 150, minLevel: 5 },
  ]},
  kopf: { items: [
    { id: 'kopf-nichts', price: 0 },
    { id: 'kopf-muetze', price: 40 },
    { id: 'kopf-stirnband', price: 45 },
    { id: 'kopf-party', price: 60 },
    { id: 'kopf-blumen', price: 100 },
    { id: 'kopf-baskenmuetze', price: 140 },
    { id: 'kopf-frosch', price: 150 },
    { id: 'kopf-hexe', price: 300, minLevel: 8 },
    { id: 'kopf-krone', price: 400, minLevel: 12 },
    { id: 'kopf-mond', price: 550, minLevel: 20 },
    { id: 'kopf-schmetterling', price: 0, surprise: 'common' },
    { id: 'kopf-heiligenschein', price: 0, surprise: 'rare' },
  ]},
  kleidung: { items: [
    { id: 'kleidung-nichts', price: 0 },
    { id: 'kleidung-schal', price: 30 },
    { id: 'kleidung-pulli', price: 80, sleeve: '#bfe0ff' },
    { id: 'kleidung-latzhose', price: 120 },
    { id: 'kleidung-weste', price: 140 },
    { id: 'kleidung-hoodie', price: 150, sleeve: '#a9e7cb' },
    { id: 'kleidung-regenjacke', price: 180, sleeve: '#fde68a' },
    { id: 'kleidung-umhang', price: 300, minLevel: 8 },
  ]},
  extra: { items: [
    { id: 'extra-nichts', price: 0 },
    { id: 'extra-bluemchen', price: 25 },
    { id: 'extra-pflaster', price: 30 },
    { id: 'extra-schleife', price: 30 },
    { id: 'extra-brille', price: 60 },
    { id: 'extra-tee', price: 100 },
    { id: 'extra-buch', price: 120 },
    { id: 'extra-kopfhoerer', price: 120 },
    { id: 'extra-stab', price: 250, minLevel: 5 },
    { id: 'extra-laterne', price: 650, minLevel: 25 },
    { id: 'extra-kleeblatt', price: 0, surprise: 'common' },
  ]},
  hintergrund: { items: [
    { id: 'bg-minze', price: 0 },
    { id: 'bg-lavendel', price: 20 },
    { id: 'bg-pfirsich', price: 20 },
    { id: 'bg-wolken', price: 100 },
    { id: 'bg-herbst', price: 150 },
    { id: 'bg-abendrot', price: 180 },
    { id: 'bg-sterne', price: 200, minLevel: 5 },
    { id: 'bg-regenbogen', price: 350, minLevel: 12 },
    { id: 'bg-nordlicht', price: 800, minLevel: 30 },
    { id: 'bg-seifenblasen', price: 0, surprise: 'common' },
    { id: 'bg-sternschnuppe', price: 0, surprise: 'rare' },
  ]},
};

export const SLOTS = ['fell', 'augen', 'kopf', 'kleidung', 'extra', 'hintergrund'];

export const DEFAULT_EQUIP = {
  fell: 'fell-vanille', augen: 'augen-klassisch', kopf: 'kopf-nichts',
  kleidung: 'kleidung-nichts', extra: 'extra-nichts', hintergrund: 'bg-minze',
};

export const FREE_ITEMS = SLOTS.flatMap((s) => SHOP[s].items.filter((i) => i.price === 0 && !i.surprise).map((i) => i.id));

/** Lässt sich ein Teil kaufen? Überraschungsteile gibt es nur geschenkt. */
export function isBuyable(item) {
  return !item.surprise;
}

export function findItem(slot, id) {
  const s = SHOP[slot];
  if (!s) return null;
  return s.items.find((i) => i.id === id) || s.items[0];
}

/** Ist ein Teil für dieses Level schon freigeschaltet? */
export function isUnlocked(item, level) {
  return !item.minLevel || level >= item.minLevel;
}
