// Tiny synthesized SFX for Squad Battle -- generated with the Web Audio API
// instead of shipping audio files, since these are short arcade-style
// blips rather than anything that needs real production. Browsers require
// a user gesture before audio can play; every call site here is inside a
// click handler, so that's satisfied automatically.
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const Ctx = window.AudioContext ?? w.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, volume: number, delay = 0) {
  const ctx = getContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

export function playAttackSound() {
  tone(220, 0.1, "square", 0.15);
}

export function playHitSound() {
  tone(110, 0.16, "sawtooth", 0.2);
}

export function playBlockSound() {
  tone(500, 0.06, "square", 0.12);
}

export function playHealSound() {
  tone(523, 0.09, "sine", 0.13);
  tone(784, 0.12, "sine", 0.13, 0.07);
}

export function playFaintSound() {
  const ctx = getContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.45);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

export function playSwitchSound() {
  tone(440, 0.09, "sine", 0.12);
  tone(660, 0.1, "sine", 0.12, 0.09);
}

export function playWinSound() {
  tone(523, 0.12, "sine", 0.15);
  tone(659, 0.12, "sine", 0.15, 0.12);
  tone(784, 0.2, "sine", 0.15, 0.24);
}

export function playLossSound() {
  tone(300, 0.2, "sawtooth", 0.15);
  tone(220, 0.3, "sawtooth", 0.15, 0.18);
}
