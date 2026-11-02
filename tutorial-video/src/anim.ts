import {spring} from "remotion";
import {CONFIG, sec} from "./config";

// 0 → 1 spring that starts at `startSec` and settles in about `durSec`.
export const ease = (frame: number, startSec: number, durSec = 1, damping = 200) =>
  spring({
    frame: frame - sec(startSec),
    fps: CONFIG.fps,
    durationInFrames: sec(durSec),
    config: {damping, mass: 1, stiffness: 100},
  });

// Pop-in spring with a tiny overshoot.
export const pop = (frame: number, startSec: number) =>
  spring({frame: frame - sec(startSec), fps: CONFIG.fps, config: {damping: 13, stiffness: 160, mass: 0.7}});

export type Key<T extends Record<string, number>> = {at: number; dur: number; v: T; arc?: number};

// Chains springs between keyframes: each key blends from "where we are" to its value.
// `arc` bends straight-line movement into a soft curve (nice for cursors).
export function track<T extends Record<string, number>>(frame: number, initial: T, keys: Key<T>[]): T {
  let cur = {...initial};
  for (const k of keys) {
    const p = ease(frame, k.at, k.dur);
    if (p <= 0) continue;
    const next = {} as Record<string, number>;
    for (const key of Object.keys(k.v)) next[key] = cur[key] + (k.v[key] - cur[key]) * p;
    if (k.arc && "x" in k.v && "y" in k.v) {
      const dx = k.v.x - cur.x, dy = k.v.y - cur.y;
      const len = Math.hypot(dx, dy) || 1;
      const bend = Math.sin(Math.PI * p) * k.arc * len;
      next.x += (-dy / len) * bend;
      next.y += (dx / len) * bend;
    }
    cur = next as T;
  }
  return cur;
}

// 1 between `from` and `to`, with soft edges.
export const window01 = (frame: number, from: number, to: number, fadeIn = 0.4, fadeOut = 0.35) => {
  const a = ease(frame, from, fadeIn + 0.3);
  const b = ease(frame, to - fadeOut, fadeOut + 0.2);
  return Math.max(0, a - b);
};
