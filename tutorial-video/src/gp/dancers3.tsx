// Abstract dancers with clear, separate moves (hands up, step left, spin, jump) driven by video time.
import React from "react";
import {Studio} from "../scene2/Player";
import {cellAt, SRC_H, SRC_W} from "./layout3";

export type MoveKind = "handsUp" | "stepLeft" | "spin" | "jump";
export type Move = {kind: MoveKind; v: number; dancer: number};

type Look = {x: number; scale: number; shirt: string; pants: string; skin: string; hair: string};
export const LOOKS: Look[] = [
  {x: 0.2, scale: 1.08, shirt: "#22252b", pants: "#b9bec6", skin: "#e2b48f", hair: "#3a2a20"},
  {x: 0.42, scale: 0.92, shirt: "#2d3036", pants: "#9aa0a8", skin: "#c99572", hair: "#2a1e18"},
  {x: 0.64, scale: 1.1, shirt: "#8a4b32", pants: "#6f7562", skin: "#f0c7a6", hair: "#d9b57c"},
  {x: 0.83, scale: 0.94, shirt: "#e8e6e1", pants: "#4a4d52", skin: "#d8a982", hair: "#2a1e18"},
];
const BASE_Y = SRC_H * 0.9;
const BEAT = 0.5;

const sm = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
/** 0 → 1 rising to the peak, holds briefly, falls back. */
export const envelope = (v: number, peak: number) => {
  if (v < peak - 0.55) return 0;
  if (v < peak) return sm((v - (peak - 0.55)) / 0.55);
  if (v < peak + 0.18) return 1;
  return 1 - sm((v - peak - 0.18) / 0.45);
};

type Pose = {armsUp: number; step: number; spin: number; jump: number; bounce: number};

function poseFor(i: number, v: number, moves: Move[]): Pose {
  const p: Pose = {armsUp: 0, step: 0, spin: 1, jump: 0, bounce: 0};
  const ph = ((v % BEAT) + BEAT) % BEAT / BEAT;
  p.bounce = Math.exp(-ph * 4) * 0.6;
  for (const m of moves) {
    if (m.dancer !== i) continue;
    const e = envelope(v, m.v);
    if (m.kind === "handsUp") p.armsUp = Math.max(p.armsUp, e);
    if (m.kind === "stepLeft") p.step = Math.max(p.step, e);
    if (m.kind === "jump") { p.jump = Math.max(p.jump, e); p.armsUp = Math.max(p.armsUp, e * 0.55); }
    if (m.kind === "spin") {
      const t = (v - (m.v - 0.4)) / 0.8;
      if (t > 0 && t < 1) p.spin = Math.cos(2 * Math.PI * sm(t));
    }
  }
  return p;
}

const limb = (x: number, y: number, len: number, a: number) => ({x: x + Math.sin(a) * len, y: y + Math.cos(a) * len});

function joints(p: Pose) {
  const lift = p.jump * 95;
  const dy = p.bounce * 12 * (1 - p.jump);
  const sx = -p.step * 40;
  const hipY = -165 + dy - lift, shY = -280 + dy * 0.9 - lift, headY = -322 + dy * 0.85 - lift;
  const tuck = p.jump * 40;
  const lFoot = {x: -34 - p.step * 85, y: -6 - lift + tuck * 0.4};
  const rFoot = {x: 34 + sx * 0.3, y: -6 - lift + tuck * 0.4};
  const lKnee = {x: (sx - 16 + lFoot.x) / 2 - 16, y: (hipY + lFoot.y) / 2 - tuck * 0.3};
  const rKnee = {x: (sx + 16 + rFoot.x) / 2 + 16, y: (hipY + rFoot.y) / 2 - tuck * 0.3};
  const a = p.armsUp;
  const lSh = {x: -34 + sx, y: shY + 6}, rSh = {x: 34 + sx, y: shY + 6};
  const lEl = limb(lSh.x, lSh.y, 62, -(0.3 + a * 2.55));
  const lHand = limb(lEl.x, lEl.y, 58, -(0.15 + a * 2.95));
  const rEl = limb(rSh.x, rSh.y, 62, 0.3 + a * 2.55);
  const rHand = limb(rEl.x, rEl.y, 58, 0.15 + a * 2.95);
  return {sx, hipY, shY, headY, lFoot, rFoot, lKnee, rKnee, lSh, rSh, lEl, lHand, rEl, rHand};
}

/** Source-space point of the body part an action is about, at video time v. */
export function targetPoint(m: Move, moves: Move[]) {
  const L = LOOKS[m.dancer];
  const j = joints(poseFor(m.dancer, m.v, moves));
  const local =
    m.kind === "handsUp" ? {x: (j.lHand.x + j.rHand.x) / 2, y: Math.min(j.lHand.y, j.rHand.y)}
    : m.kind === "stepLeft" ? j.lFoot
    : {x: j.sx, y: j.headY};
  return {x: L.x * SRC_W + local.x * L.scale, y: BASE_Y + local.y * L.scale};
}
export const targetCell = (m: Move, moves: Move[]) => {
  const p = targetPoint(m, moves);
  return cellAt(p.x, p.y);
};

export const Figure: React.FC<{i: number; v: number; moves: Move[]; scale?: number; x?: number}> = ({i, v, moves, scale, x}) => {
  const L = LOOKS[i];
  const p = poseFor(i, v, moves);
  const j = joints(p);
  const legs = (h: {x: number; y: number}, k: {x: number; y: number}, f: {x: number; y: number}) =>
    `M${h.x} ${h.y} L${k.x} ${k.y} L${f.x} ${f.y}`;
  return (
    <g transform={`translate(${(x ?? L.x) * SRC_W}, ${BASE_Y}) scale(${scale ?? L.scale})`}>
      <ellipse cx={0} cy={0} rx={70 * (1 - p.jump * 0.4)} ry={10} fill="rgba(0,0,0,.25)" />
      <g transform={`translate(${j.sx}, 0) scale(${p.spin}, 1) translate(${-j.sx}, 0)`}>
        <path d={legs({x: j.sx - 16, y: j.hipY}, j.lKnee, j.lFoot)} stroke={L.pants} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={legs({x: j.sx + 16, y: j.hipY}, j.rKnee, j.rFoot)} stroke={L.pants} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x={j.lFoot.x - 18} y={j.lFoot.y - 6} width={30} height={12} rx={6} fill="#1d1d1f" />
        <rect x={j.rFoot.x - 12} y={j.rFoot.y - 6} width={30} height={12} rx={6} fill="#1d1d1f" />
        <path d={`M${j.lSh.x} ${j.lSh.y} L${j.lEl.x} ${j.lEl.y} L${j.lHand.x} ${j.lHand.y}`} stroke={L.skin} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${j.rSh.x} ${j.rSh.y} L${j.rEl.x} ${j.rEl.y} L${j.rHand.x} ${j.rHand.y}`} stroke={L.skin} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${j.sx - 44} ${j.shY} L${j.sx + 44} ${j.shY} L${j.sx + 34} ${j.hipY + 8} L${j.sx - 34} ${j.hipY + 8} Z`} fill={L.shirt} stroke={L.shirt} strokeWidth={14} strokeLinejoin="round" />
        <rect x={j.sx - 8} y={j.headY + 18} width={16} height={22} fill={L.skin} />
        <circle cx={j.sx} cy={j.headY} r={27} fill={L.skin} />
        <path d={`M${j.sx - 28} ${j.headY - 2} a28 28 0 0 1 56 0 q-10 -12 -28 -10 q-18 -2 -28 10z`} fill={L.hair} />
      </g>
    </g>
  );
};

/** The whole video picture (studio + 4 dancers), in source space. Put it in an <svg viewBox="0 0 1360 765">. */
export const DanceScene: React.FC<{v: number; moves: Move[]}> = ({v, moves}) => (
  <>
    <Studio />
    {LOOKS.map((_, i) => <Figure key={i} i={i} v={v} moves={moves} />)}
  </>
);

/** A single dancer on a plain background, for thumbnails. */
export const DancerThumb: React.FC<{i: number; v: number; moves: Move[]; w: number; h: number}> = ({i, v, moves, w, h}) => (
  <svg width={w} height={h} viewBox={`${LOOKS[i].x * SRC_W - 200} ${BASE_Y - 520} 400 550`} preserveAspectRatio="xMidYMid meet" style={{display: "block", background: "#a99d92"}}>
    <rect x={0} y={0} width={SRC_W} height={SRC_H} fill="#a99d92" />
    <rect x={0} y={SRC_H * 0.66} width={SRC_W} height={SRC_H} fill="#8b5d3f" />
    <Figure i={i} v={v} moves={moves} />
  </svg>
);
