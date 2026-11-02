// Turns CONFIG3 into concrete scene times. t = scene seconds, v = video seconds.
import {CONFIG3 as K} from "./config3";
import {targetCell} from "../gp/dancers3";

type Seg = {t0: number; t1: number; v0: number};
const segs: Seg[] = [];

export type ActionTimes = {
  say: string; v: number; cell: string; slow: boolean;
  pause: number; sayT: number; gap: number; click: number; clickAt: number; resume: number; end: number;
};

const recorded = K.actions.filter((a) => a.record);
export const ACTIONS: ActionTimes[] = [];

let t = K.playClick + 0.15;
let v = K.playStartV;
recorded.forEach((a, i) => {
  const dv = a.v - v;
  segs.push({t0: t, t1: t + dv, v0: v});
  t += dv;
  v = a.v;
  const P = i === 0 ? K.slow : K.fast;
  const pause = t;
  const sayT = pause + P.pause;
  const gap = sayT + P.say;
  const click = gap + P.gap;
  const clickAt = click + (i === 0 ? 0.95 : 0.6);
  const resume = click + P.click;
  const last = i === recorded.length - 1;
  const end = last ? resume : resume + P.resume;
  ACTIONS.push({say: a.say, v: a.v, cell: targetCell(a, K.actions), slow: i === 0, pause, sayT, gap, click, clickAt, resume, end});
  t = end + 0.15;
});

const afterActions = ACTIONS[ACTIONS.length - 1].end;
export const EV3 = {
  recClick: K.recClick,
  playClick: K.playClick,
  rule: afterActions,
  tip: afterActions + K.rule,
  endZone: afterActions + K.rule + K.tip,
  recap: afterActions + K.rule + K.tip + K.endZone,
  fadeOut: afterActions + K.rule + K.tip + K.endZone + K.recapDur,
  end: afterActions + K.rule + K.tip + K.endZone + K.recapDur + K.fadeOut,
};

export function video3At(tt: number) {
  let cur = {v: K.playStartV, playing: false};
  for (const s of segs) {
    if (tt < s.t0) break;
    if (tt <= s.t1) return {v: s.v0 + (tt - s.t0), playing: true};
    cur = {v: s.v0 + (s.t1 - s.t0), playing: false};
  }
  return cur;
}
