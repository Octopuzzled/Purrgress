/**
 * Sanfte Töne und braunes Rauschen über die Web Audio API – ganz ohne Audiodateien.
 * Browser erlauben Ton erst nach einer Nutzerinteraktion; vorher bleibt alles still.
 */
let audioCtx = null;

export function getAudio() {
  try {
    if (!audioCtx) {
      // Ohne vorherigen Klick darf der Browser keinen Ton abspielen – dann still bleiben
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch { return null; }
}

const SOUNDS = {
  done: [659.25, 987.77],
  step: [880],
  level: [523.25, 659.25, 783.99, 1046.5],
  buy: [587.33, 880, 1174.66],
  timer: [783.99, 659.25, 783.99],
  chime: [1046.5],
};

export function playSound(kind) {
  const ctx = getAudio();
  if (!ctx) return;
  const notes = SOUNDS[kind] || SOUNDS.done;
  const gap = kind === 'level' ? 0.11 : 0.09;
  const peak = kind === 'step' ? 0.05 : kind === 'chime' ? 0.035 : 0.09;
  notes.forEach((f, i) => {
    const t = ctx.currentTime + 0.01 + i * gap;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.65);
  });
}

/* Braunes Rauschen: sanftes Hintergrundrauschen für die Zeitbox */

let noise = null;

export function startNoise() {
  const ctx = getAudio();
  if (!ctx || noise) return;
  try {
    const len = ctx.sampleRate * 6;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      ch[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.2);
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    noise = { src, g, ctx };
  } catch { noise = null; }
}

export function stopNoise() {
  if (!noise) return;
  const { src, g, ctx } = noise;
  noise = null;
  try {
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0002), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    src.stop(t + 0.65);
  } catch { /* ignorieren */ }
}
