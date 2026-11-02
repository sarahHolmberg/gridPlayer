// Turns CONFIG2 into concrete times: when the video plays, at what speed, and when every beat lands.
// "t" = seconds of the scene, "v" = seconds of the (fake) dance video.
import {CONFIG2 as K} from "./config2";

export const BEAT = 60 / K.bpm; // seconds per beat (video time)
export const beatV = (k: number) => K.firstBeat + k * BEAT; // video time of beat k (0-based)
export const OUT_BEAT = K.fullEights * 8 + K.outCount - 1; // 0-based index of the OUT beat
export const OUT_V = beatV(OUT_BEAT);
export const START_V = K.firstBeat - K.listenLead;

type Seg = {t0: number; t1: number; v0: number; rate: number; replay?: boolean};

const segs: Seg[] = [];
let t = K.playClick + 0.15;
let v = START_V;
const push = (dv: number, rate: number, replay = false) => {
  const dt = dv / rate;
  segs.push({t0: t, t1: t + dt, v0: v, rate, replay});
  t += dt;
  v += dv;
};
push(K.listenLead, 1);
for (let i = 0; i < K.fullEights; i++) push(8 * BEAT, K.eightSpeeds[i] ?? 1);
push((K.outCount - 1) * BEAT, 1);
const tOut = t;

// slow-motion replay of the last counts
const replayStartV = beatV(OUT_BEAT - K.replayCounts + 1) - K.replayLead;
t = tOut + K.holdAfterOut;
v = replayStartV;
const tReplay = t;
push(OUT_V - replayStartV, K.replaySpeed, true);
const tReplayEnd = t;

export const SEGMENTS = segs;

export const EV = {
  play: K.playClick,
  out: tOut,
  replay: tReplay,
  replayEnd: tReplayEnd,
  confirm: tReplayEnd,
  trim: tReplayEnd + K.confirm,
  success: tReplayEnd + K.confirm + K.trim,
  fadeOut: tReplayEnd + K.confirm + K.trim + K.success,
  end: tReplayEnd + K.confirm + K.trim + K.success + K.fadeOut,
  beat1: 0,
  fifth: 0,
  eightStarts: [] as number[],
};

// Scene time of every beat in the normal pass, and in the replay.
const segFor = (vv: number, replay: boolean) =>
  segs.find((s) => !!s.replay === replay && vv >= s.v0 - 1e-6 && vv <= s.v0 + (s.t1 - s.t0) * s.rate + 1e-6);
const toT = (vv: number, replay: boolean) => {
  const s = segFor(vv, replay)!;
  return s.t0 + (vv - s.v0) / s.rate;
};

export const BEATS: {t: number; k: number; replay: boolean}[] = [];
for (let k = 0; k <= OUT_BEAT; k++) BEATS.push({t: toT(beatV(k), false), k, replay: false});
for (let k = OUT_BEAT - K.replayCounts + 1; k <= OUT_BEAT; k++) BEATS.push({t: toT(beatV(k), true), k, replay: true});

EV.beat1 = BEATS[0].t;
EV.fifth = BEATS[K.fullEights * 8].t;
for (let i = 0; i < K.fullEights; i++) EV.eightStarts.push(BEATS[i * 8].t);

/** Video state at scene time t. */
export function videoAt(tt: number) {
  let cur = {v: START_V, playing: false, rate: 1, replay: false};
  for (const s of segs) {
    if (tt < s.t0) break;
    if (tt <= s.t1) return {v: s.v0 + (tt - s.t0) * s.rate, playing: true, rate: s.rate, replay: !!s.replay};
    cur = {v: s.v0 + (s.t1 - s.t0) * s.rate, playing: false, rate: 1, replay: false};
  }
  return cur;
}

/** Beat position from a video time: k = beat index (0-based, -1 before beat 1), count 1..8, eight 0-based. */
export function beatAt(vv: number) {
  const k = Math.floor((vv - K.firstBeat) / BEAT + 1e-4);
  return {k, count: k >= 0 ? (k % 8) + 1 : 0, eight: k >= 0 ? Math.floor(k / 8) : -1, phase: (vv - K.firstBeat) / BEAT - k};
}

/** 1 right on a beat, decaying to 0 (in scene time, so it looks the same at any speed). */
export function beatPulse(tt: number) {
  let last = -Infinity;
  for (const b of BEATS) if (b.t <= tt && b.t > last) last = b.t;
  return Math.exp(-(tt - last) * 5);
}

export const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
