// Generates two royalty-free kick drum samples (pure synthesis, no external audio).
// Run: node scripts/make-kicks.mjs  → public/audio/kick.wav, public/audio/kick-accent.wav
import {writeFileSync} from "node:fs";

const RATE = 44100;

function kick({gain, len = 0.35, f0 = 150, f1 = 48, click = 0.25}) {
  const n = Math.floor(RATE * len);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = f1 + (f0 - f1) * Math.exp(-t * 28); // pitch sweep down
    phase += (2 * Math.PI * f) / RATE;
    const body = Math.sin(phase) * Math.exp(-t * 9);
    const tick = (Math.random() * 2 - 1) * Math.exp(-t * 400) * click; // short attack click
    out[i] = Math.tanh((body + tick) * 1.6) * gain;
  }
  return out;
}

function wav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, 44 + i * 2));
  return buf;
}

writeFileSync(new URL("../public/audio/kick.wav", import.meta.url), wav(kick({gain: 0.55})));
writeFileSync(new URL("../public/audio/kick-accent.wav", import.meta.url), wav(kick({gain: 0.85, f0: 170, click: 0.4})));
console.log("wrote public/audio/kick.wav and kick-accent.wav");
