import { describe, expect, it } from 'vitest';
import { FREE_ITEMS, SHOP, SLOTS, isUnlocked } from '../src/constants/shop.js';

const items = SLOTS.flatMap((s) => SHOP[s].items);

describe('Umkleide', () => {
  it('hat in jedem Bereich ein kostenloses Startteil', () => {
    for (const slot of SLOTS) expect(SHOP[slot].items.some((i) => i.price === 0)).toBe(true);
    expect(FREE_ITEMS).toHaveLength(SLOTS.length);
  });

  it('bietet schon am ersten Tag etwas zum Kaufen (Startguthaben 50)', () => {
    expect(items.some((i) => i.price > 0 && i.price <= 50 && !i.minLevel)).toBe(true);
  });

  it('schaltet besondere Teile erst ab ihrem Level frei', () => {
    const krone = SHOP.kopf.items.find((i) => i.id === 'kopf-krone');
    expect(isUnlocked(krone, 11)).toBe(false);
    expect(isUnlocked(krone, 12)).toBe(true);
    expect(isUnlocked(SHOP.kopf.items[1], 1)).toBe(true);
  });

  it('hat für jedes gesperrte Teil einen höheren Preis als die freien Teile im selben Bereich', () => {
    for (const slot of SLOTS) {
      const open = SHOP[slot].items.filter((i) => !i.minLevel).map((i) => i.price);
      for (const locked of SHOP[slot].items.filter((i) => i.minLevel)) expect(locked.price >= Math.max(...open)).toBe(true);
    }
  });
});
