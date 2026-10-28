/**
 * Drei-Wege-Abgleich zwischen zwei Geräten.
 *
 * base   = Stand beim letzten erfolgreichen Abgleich (auf diesem Gerät gespeichert)
 * local  = Stand auf diesem Gerät jetzt
 * remote = Stand auf dem Server jetzt
 *
 * Grundregel: Was sich nur auf einer Seite geändert hat, wird übernommen.
 * Zähler (XP, Münzen, Verlauf) werden addiert, damit Fortschritt von beiden Geräten zählt.
 * Haben sich beide Seiten geändert, gewinnt dieses Gerät – außer Löschen gegen Bearbeiten:
 * dann bleibt die bearbeitete Fassung erhalten.
 */

/** JSON mit sortierten Schlüsseln – für verlässliche Vergleiche. */
export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

export function equal(a, b) {
  return stableStringify(a) === stableStringify(b);
}

/** Zähler: Server-Wert plus das, was auf diesem Gerät seit dem letzten Abgleich dazukam. */
function mergeNumber(base, local, remote) {
  return Math.max(0, (Number(remote) || 0) + ((Number(local) || 0) - (Number(base) || 0)));
}

function mergeCounters(base = {}, local = {}, remote = {}) {
  const out = {};
  for (const key of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
    const value = mergeNumber(base[key], local[key], remote[key]);
    if (value !== 0 || key in remote || key in local) out[key] = value;
  }
  return out;
}

/** Einzelwert: hat dieses Gerät ihn geändert, gilt er – sonst der vom Server. */
function mergeValue(base, local, remote) {
  return equal(local, base) ? remote : local;
}

function mergeValueMap(base = {}, local = {}, remote = {}) {
  const out = {};
  for (const key of new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)])) {
    const value = mergeValue(base[key], local[key], remote[key]);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** Menge (z. B. gekaufte Teile): lokal Hinzugefügtes kommt dazu, lokal Entferntes fällt weg. */
function mergeSet(base = [], local = [], remote = []) {
  const b = new Set(base);
  const l = new Set(local);
  const removed = new Set(base.filter((x) => !l.has(x)));
  const added = local.filter((x) => !b.has(x));
  const result = remote.filter((x) => !removed.has(x));
  for (const x of added) if (!result.includes(x)) result.push(x);
  return result;
}

function sameOrder(a, b) {
  const inB = new Set(b.map((x) => x.id));
  const inA = new Set(a.map((x) => x.id));
  const ids = (list, other) => list.filter((x) => other.has(x.id)).map((x) => x.id).join('|');
  return ids(a, inB) === ids(b, inA);
}

/** Liste von Objekten mit id (Aufgaben, eigene Vorlagen). */
export function mergeById(base = [], local = [], remote = []) {
  const mapB = new Map(base.map((x) => [x.id, x]));
  const mapL = new Map(local.map((x) => [x.id, x]));
  const mapR = new Map(remote.map((x) => [x.id, x]));
  const kept = new Map();

  for (const id of new Set([...mapB.keys(), ...mapL.keys(), ...mapR.keys()])) {
    const b = mapB.get(id);
    const l = mapL.get(id);
    const r = mapR.get(id);
    let value;
    if (!b) {
      value = l || r; // neu auf mindestens einer Seite; auf beiden Seiten neu: dieses Gerät gewinnt
    } else {
      const localChanged = !equal(l, b);
      const remoteChanged = !equal(r, b);
      if (!localChanged) value = r;
      else if (!remoteChanged) value = l;
      else value = l || r; // beide geändert: lokal gewinnt, aber Bearbeiten schlägt Löschen
    }
    if (value) kept.set(id, value);
  }

  // Reihenfolge: hat dieses Gerät umsortiert, gilt seine Reihenfolge, sonst die vom Server.
  // Neue Einträge der anderen Seite kommen nach oben – dort landen neue Aufgaben ohnehin.
  const backbone = sameOrder(local, base) ? remote : local;
  const other = backbone === remote ? local : remote;
  const inBackbone = new Set(backbone.map((x) => x.id));
  const result = [];
  for (const x of other) if (!inBackbone.has(x.id) && kept.has(x.id)) result.push(kept.get(x.id));
  for (const x of backbone) if (kept.has(x.id)) result.push(kept.get(x.id));
  return result;
}

export function merge3(base, local, remote) {
  return {
    v: remote.v,
    xp: mergeNumber(base.xp, local.xp, remote.xp),
    coins: mergeNumber(base.coins, local.coins, remote.coins),
    stats: mergeCounters(base.stats, local.stats, remote.stats),
    history: mergeCounters(base.history, local.history, remote.history),
    focusLog: mergeCounters(base.focusLog, local.focusLog, remote.focusLog),
    goalBonusDay: mergeValue(base.goalBonusDay, local.goalBonusDay, remote.goalBonusDay),
    owned: mergeSet(base.owned, local.owned, remote.owned),
    hero: {
      name: mergeValue(base.hero.name, local.hero.name, remote.hero.name),
      equip: mergeValueMap(base.hero.equip, local.hero.equip, remote.hero.equip),
    },
    tasks: mergeById(base.tasks, local.tasks, remote.tasks),
    customTemplates: mergeById(base.customTemplates, local.customTemplates, remote.customTemplates),
    dailyGoal: mergeValue(base.dailyGoal, local.dailyGoal, remote.dailyGoal),
    energy: mergeValue(base.energy ?? null, local.energy ?? null, remote.energy ?? null),
  };
}
