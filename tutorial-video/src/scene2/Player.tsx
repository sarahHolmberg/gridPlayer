// The fake video player: an abstract dance studio with flat geometric dancers that move on the beat,
// and browser-style video controls.
import React from "react";
import {CONFIG2} from "./config2";
import {beatAt, fmtClock, OUT_V} from "./timeline";
import {CONTROLS_H, PROGRESS, VIDEO} from "./layout2";
import {STAGE} from "../layout";
import {KebabIcon} from "../icons";

/* ───────────── Dancers ───────────── */

type Look = {x: number; scale: number; shirt: string; pants: string; skin: string; hair: string; mirror: 1 | -1; delay: number};
const DANCERS: Look[] = [
  {x: 0.2, scale: 1.08, shirt: "#22252b", pants: "#b9bec6", skin: "#e2b48f", hair: "#3a2a20", mirror: 1, delay: 0},
  {x: 0.42, scale: 0.86, shirt: "#2d3036", pants: "#9aa0a8", skin: "#c99572", hair: "#2a1e18", mirror: -1, delay: 0.04},
  {x: 0.64, scale: 1.12, shirt: "#8a4b32", pants: "#6f7562", skin: "#f0c7a6", hair: "#d9b57c", mirror: 1, delay: 0.02},
  {x: 0.83, scale: 0.9, shirt: "#e8e6e1", pants: "#4a4d52", skin: "#d8a982", hair: "#2a1e18", mirror: -1, delay: 0.06},
];

const limb = (x1: number, y1: number, len: number, angle: number) => ({x: x1 + Math.sin(angle) * len, y: y1 + Math.cos(angle) * len});

const Dancer: React.FC<{d: Look; v: number}> = ({d, v}) => {
  const b = beatAt(v - d.delay);
  const dancing = b.k >= 0;
  const ph = dancing ? b.phase : 0;
  // crouch hits ON the beat, then springs back up
  const crouch = dancing ? Math.exp(-ph * 4) * (b.count === 1 || b.count === 5 ? 1.25 : 1) : 0.15 + 0.1 * Math.sin(v * 3);
  const wave = dancing ? Math.sin(Math.PI * (b.k + ph)) : Math.sin(v * 1.5) * 0.25; // side-to-side over 2 beats
  const armsUp = dancing && (b.count === 1 || b.count === 5) ? Math.exp(-ph * 2.5) : 0;
  const m = d.mirror;

  const dy = crouch * 16;
  const sx = wave * 14 * m;
  const hipY = -165 + dy, shY = -280 + dy * 0.9, headY = -320 + dy * 0.85;
  const kneeOut = 14 + crouch * 14;
  const lKnee = {x: -22 - kneeOut + sx * 0.4, y: -85 + dy * 0.5};
  const rKnee = {x: 22 + kneeOut + sx * 0.4, y: -85 + dy * 0.5};
  const lFoot = {x: -34 + (wave > 0 ? -6 : 0), y: -6};
  const rFoot = {x: 34 + (wave < 0 ? 6 : 0), y: -6};

  const armA = 0.35 + 0.35 * wave * m;
  const lEl = limb(-34 + sx, shY + 6, 62, -(armA + armsUp * 2.4));
  const lHand = limb(lEl.x, lEl.y, 58, -(armA * 0.6 + armsUp * 2.9 + 0.3));
  const rEl = limb(34 + sx, shY + 6, 62, armA * 0.8 + armsUp * 2.4 + 0.2);
  const rHand = limb(rEl.x, rEl.y, 58, armA * 1.2 + armsUp * 2.9 - 0.3);

  return (
    <g transform={`translate(${d.x * VIDEO.w}, ${VIDEO.h * 0.9}) scale(${d.scale})`}>
      <ellipse cx={0} cy={0} rx={70} ry={10} fill="rgba(0,0,0,.25)" />
      {/* legs (wide pants) */}
      <path d={`M${-16 + sx * 0.6} ${hipY} L${lKnee.x} ${lKnee.y} L${lFoot.x} ${lFoot.y}`} stroke={d.pants} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${16 + sx * 0.6} ${hipY} L${rKnee.x} ${rKnee.y} L${rFoot.x} ${rFoot.y}`} stroke={d.pants} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x={lFoot.x - 18} y={-12} width={30} height={12} rx={6} fill="#1d1d1f" />
      <rect x={rFoot.x - 12} y={-12} width={30} height={12} rx={6} fill="#1d1d1f" />
      {/* arms */}
      <path d={`M${-34 + sx} ${shY + 6} L${lEl.x} ${lEl.y} L${lHand.x} ${lHand.y}`} stroke={d.skin} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${34 + sx} ${shY + 6} L${rEl.x} ${rEl.y} L${rHand.x} ${rHand.y}`} stroke={d.skin} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* torso */}
      <path d={`M${-44 + sx} ${shY} L${44 + sx} ${shY} L${34 + sx * 0.6} ${hipY + 8} L${-34 + sx * 0.6} ${hipY + 8} Z`} fill={d.shirt} stroke={d.shirt} strokeWidth={14} strokeLinejoin="round" />
      {/* head */}
      <rect x={-8 + sx} y={headY + 18} width={16} height={22} fill={d.skin} />
      <circle cx={sx * 1.05} cy={headY} r={27} fill={d.skin} />
      <path d={`M${-28 + sx} ${headY - 2} a28 28 0 0 1 56 0 q-10 -12 -28 -10 q-18 -2 -28 10z`} fill={d.hair} />
    </g>
  );
};

const Studio: React.FC = () => {
  const {w, h} = VIDEO;
  const floorY = h * 0.66;
  return (
    <>
      <rect width={w} height={floorY} fill="#a99d92" />
      {/* windows with blinds */}
      {[0.12, 0.5, 0.86].map((cx) => (
        <g key={cx} transform={`translate(${cx * w - 120}, ${h * 0.22})`}>
          <rect width={240} height={190} rx={4} fill="#5c4434" />
          <rect x={10} y={10} width={220} height={170} fill="#2a3a52" />
          {Array.from({length: 14}).map((_, i) => <rect key={i} x={10} y={14 + i * 12} width={220} height={4} fill="#3f5372" />)}
        </g>
      ))}
      {/* lamps */}
      {[0.06, 0.34, 0.66, 0.94].map((cx) => (
        <g key={cx}><rect x={cx * w - 40} y={0} width={80} height={36} fill="#efe4c6" /><rect x={cx * w - 40} y={36} width={80} height={6} fill="#c8b68f" /></g>
      ))}
      <rect y={floorY - 40} width={w} height={40} fill="#d9d6cf" />
      <rect y={floorY} width={w} height={h - floorY} fill="#8b5d3f" />
      {Array.from({length: 9}).map((_, i) => <rect key={i} y={floorY + 8 + i * i * 4.4} width={w} height={2} fill="#7a4f34" />)}
    </>
  );
};

/* ───────────── Controls ───────────── */

const PlayIcon: React.FC<{playing: boolean}> = ({playing}) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="#fff">
    {playing ? <><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></> : <path d="M7 4.5v15l12-7.5z" />}
  </svg>
);
const VolumeIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" fill="#fff"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" /></svg>
);
const FullscreenIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
);

export const VideoPlayer: React.FC<{
  v: number; playing: boolean; playPress: number; outMarker: number; outPulse: number;
}> = ({v, playing, playPress, outMarker, outPulse}) => {
  const dur = CONFIG2.content.videoDuration;
  const frac = v / dur;
  const outFrac = OUT_V / dur;
  const local = (x: number) => x - VIDEO.x;
  return (
    <div style={{position: "absolute", left: 0, top: VIDEO.y - STAGE.y, width: VIDEO.w, height: VIDEO.h}}>
      <svg width={VIDEO.w} height={VIDEO.h} style={{position: "absolute", inset: 0}}>
        <Studio />
        {DANCERS.map((d, i) => <Dancer key={i} d={d} v={v} />)}
      </svg>
      {/* controls gradient */}
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: CONTROLS_H + 60, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.65))"}} />
      {/* progress bar */}
      <div style={{position: "absolute", left: local(PROGRESS.x), top: PROGRESS.y - VIDEO.y, width: PROGRESS.w, height: 6, borderRadius: 3, background: "rgba(255,255,255,.35)"}}>
        <div style={{width: `${frac * 100}%`, height: "100%", borderRadius: 3, background: "#fff"}} />
        <div style={{position: "absolute", left: `${frac * 100}%`, top: -5, width: 16, height: 16, marginLeft: -8, borderRadius: "50%", background: "#fff"}} />
        {/* red OUT marker on the progress bar */}
        <div style={{
          position: "absolute", left: `${outFrac * 100}%`, top: -18, width: 6, marginLeft: -3, height: 42, borderRadius: 3,
          background: "#ef4444", opacity: Math.min(1, outMarker), transformOrigin: "50% 100%",
          transform: `translateY(${(1 - outMarker) * -30}px) scaleY(${0.6 + 0.4 * outMarker})`,
          boxShadow: `0 0 ${8 + 14 * outPulse}px rgba(239,68,68,${0.6 + 0.4 * outPulse})`,
        }} />
      </div>
      {/* buttons row */}
      <div style={{position: "absolute", left: 18, right: 22, bottom: 12, height: 54, display: "flex", alignItems: "center", gap: 18, color: "#fff"}}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `rgba(255,255,255,${0.12 + 0.2 * playPress})`, transform: `scale(${1 - 0.1 * playPress})`,
        }}>
          <PlayIcon playing={playing} />
        </div>
        <span style={{fontSize: 22, fontWeight: 500}}>{fmtClock(v)} / {fmtClock(dur)}</span>
        <div style={{flex: 1}} />
        <VolumeIcon />
        <FullscreenIcon />
        <KebabIcon color="#fff" />
      </div>
    </div>
  );
};
