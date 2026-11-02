// Instructional overlays for Scene 2, all in world coordinates.
// Colour code: BLUE = listening / counting, RED = trim point / Out, GREEN = success.
import React from "react";
import {CONFIG2} from "./config2";
import {BEAT, beatAt, beatV, OUT_BEAT, OUT_V} from "./timeline";
import {COUNT, CUBES, DECK, Rect, VIDEO} from "./layout2";
import {CheckIcon} from "../icons";
import {monoFamily} from "../shared";

export const BLUE = "#3b82f6", BLUE_L = "#60a5fa", BLUE_D = "#1d4ed8";
export const RED = "#ef4444", RED_D = "#b91c1c";
export const GREEN = "#22c55e", GREEN_D = "#15803d";

const glass: React.CSSProperties = {
  background: "rgba(9,13,24,.84)", border: "1px solid rgba(96,165,250,.35)", borderRadius: 16,
  boxShadow: "0 18px 40px rgba(0,0,0,.45)", boxSizing: "border-box",
};
const at = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h});

/* ───────────── Icons ───────────── */
const EarIcon: React.FC<{color: string}> = ({color}) => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <path d="M6 9a6 6 0 1 1 12 0c0 3-2 4-3 5.5S14 18 12 19.5c-1.5 1.1-3.5.4-4-1.3" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.4-1.2 2-1.8 2.8" />
  </svg>
);
export const TargetIcon: React.FC<{size?: number; color?: string}> = ({size = 22, color = RED}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);
const FlagIcon: React.FC<{color: string}> = ({color}) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill={color}><path d="M5 3v18h2v-7h11l-2.5-3.5L18 7H7V3z" /></svg>
);

/* ───────────── Beat track (DJ deck) ───────────── */
const PX = 150; // px per second of video
const TX = 96; // track starts here inside the deck
const TW = DECK.w - TX - 18;
const TY = 36, TH = 92;
const PH = TW * 0.3; // playhead x inside the track

const hash = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};
const amp = (tv: number) => {
  if (tv < CONFIG2.firstBeat - 0.03) return 0.05 + 0.06 * hash(Math.round(tv * 25));
  const k = Math.floor((tv - CONFIG2.firstBeat) / BEAT + 1e-6);
  const dt = tv - beatV(k);
  const env = Math.exp(-dt * 13) * (k % 8 === 0 ? 1 : 0.72);
  return Math.min(1, 0.07 + 0.06 * hash(Math.round(tv * 25)) + 0.88 * env);
};

export type DeckState = {
  v: number; slide: number; listen: number; pulse: number; beat1Flash: number; flag: number;
  fifth: number; outDrop: number; outPulse: number; confirm: number;
};

export const BeatDeck: React.FC<{s: DeckState}> = ({s}) => {
  const xOf = (tv: number) => PH + (tv - s.v) * PX;
  const vis = (x: number) => x > -40 && x < TW + 40;

  const bars: React.ReactNode[] = [];
  const dtBar = 6 / PX;
  const n0 = Math.floor((s.v - PH / PX) / dtBar);
  for (let n = n0; n < n0 + TW / 6 + 2; n++) {
    const tb = n * dtBar;
    const x = xOf(tb);
    if (x < 0 || x > TW) continue;
    const a = amp(tb) * (TH / 2 - 6);
    bars.push(<rect key={n} x={x - 2} y={TH / 2 - a} width={4} height={2 * a} rx={2} fill={x <= PH ? BLUE_L : "rgba(96,165,250,.32)"} />);
  }

  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < CONFIG2.fullEights; i++) {
    const x0 = xOf(beatV(i * 8)), x1 = xOf(beatV(i * 8 + 8));
    if (x1 < 0 || x0 > TW) continue;
    blocks.push(<rect key={i} x={x0} y={0} width={x1 - x0} height={TH} fill={i % 2 ? "rgba(59,130,246,.07)" : "rgba(59,130,246,.15)"} />);
    blocks.push(<text key={`l${i}`} x={x0 + 8} y={-8} fill={BLUE_L} fontSize={14} fontWeight={700}>8 #{i + 1}</text>);
  }
  // fifth 8: only up to the OUT count
  const f0 = xOf(beatV(CONFIG2.fullEights * 8));
  blocks.push(
    <g key="fifth" opacity={s.fifth}>
      <rect x={f0} y={1} width={xOf(OUT_V) - f0} height={TH - 2} fill="rgba(239,68,68,.08)" stroke={RED} strokeDasharray="6 5" strokeWidth={1.5} />
      <text x={f0 + 8} y={-8} fill="#fca5a5" fontSize={14} fontWeight={700}>8 #{CONFIG2.fullEights + 1}</text>
    </g>,
  );

  const ticks: React.ReactNode[] = [];
  for (let k = 0; k <= OUT_BEAT + 6; k++) {
    const x = xOf(beatV(k));
    if (!vis(x)) continue;
    const count = (k % 8) + 1;
    const past = x <= PH + 0.5;
    const after = k > OUT_BEAT;
    const col = after ? "rgba(255,255,255,.15)" : past ? "#fff" : "rgba(255,255,255,.45)";
    ticks.push(
      <g key={k}>
        <line x1={x} x2={x} y1={count === 1 ? 0 : TH * 0.62} y2={TH} stroke={col} strokeWidth={count === 1 ? 2.5 : 1.5} />
        <text x={x} y={TH + 17} textAnchor="middle" fill={after ? "rgba(255,255,255,.2)" : past ? BLUE_L : "rgba(255,255,255,.5)"} fontSize={13} fontWeight={700} fontFamily={monoFamily}>{count}</text>
      </g>,
    );
  }

  const b1x = xOf(beatV(0));
  const ox = xOf(OUT_V);
  const earPulse = s.listen * (0.5 + 0.5 * s.pulse);

  return (
    <div style={{...at(DECK), ...glass, opacity: s.slide, transform: `translateY(${(1 - s.slide) * 70}px)`}}>
      {/* listen icon */}
      <div style={{position: "absolute", left: 14, top: 30, width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center"}}>
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: "absolute", inset: -10 * (i + 1) * earPulse, borderRadius: "50%",
            border: `2px solid rgba(96,165,250,${(0.7 - 0.3 * i) * earPulse})`,
          }} />
        ))}
        <div style={{width: 60, height: 60, borderRadius: "50%", background: `rgba(59,130,246,${0.15 + 0.35 * earPulse})`, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <EarIcon color={s.listen > 0.3 ? "#fff" : BLUE_L} />
        </div>
      </div>
      <div style={{position: "absolute", left: 0, width: TX, top: 108, textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: BLUE_L, opacity: 0.4 + 0.6 * s.listen}}>LISTEN</div>
      <div style={{position: "absolute", right: 18, top: 8, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.55)", fontFamily: monoFamily}}>{CONFIG2.bpm} BPM</div>

      <svg width={TW} height={TH + 60} viewBox={`0 -30 ${TW} ${TH + 60}`} style={{position: "absolute", left: TX, top: TY - 30, overflow: "visible"}}>
        <defs><clipPath id="trk"><rect x={0} y={-30} width={TW} height={TH + 60} /></clipPath></defs>
        <g clipPath="url(#trk)">
          <rect x={0} y={0} width={TW} height={TH} rx={6} fill="rgba(255,255,255,.03)" />
          {blocks}
          <line x1={0} x2={TW} y1={TH / 2} y2={TH / 2} stroke="rgba(96,165,250,.18)" />
          {bars}
          {ticks}
          {/* BEAT 1 flash + flag */}
          <rect x={0} y={0} width={TW} height={TH} fill={`rgba(96,165,250,${0.45 * s.beat1Flash})`} />
          {s.flag > 0 && vis(b1x) && (
            <g transform={`translate(${b1x}, 0)`} opacity={Math.min(1, s.flag)}>
              <line y1={-26} y2={TH} stroke={BLUE_L} strokeWidth={3} />
              <g transform={`translate(0, -26) scale(${s.flag})`}>
                <rect x={0} y={-2} width={78} height={24} rx={5} fill={BLUE} />
                <foreignObject x={5} y={2} width={16} height={16}><FlagIcon color="#fff" /></foreignObject>
                <text x={25} y={15} fill="#fff" fontSize={13} fontWeight={800}>BEAT 1</text>
              </g>
            </g>
          )}
          {/* target before OUT is set */}
          {vis(ox) && s.fifth > 0 && (
            <g transform={`translate(${ox}, 0)`} opacity={s.fifth * (1 - s.outDrop)}>
              <line y1={0} y2={TH} stroke={RED} strokeWidth={2} strokeDasharray="5 4" />
              <foreignObject x={-13} y={TH / 2 - 13} width={26} height={26}><TargetIcon size={26} /></foreignObject>
            </g>
          )}
          {/* OUT marker */}
          {vis(ox) && s.outDrop > 0 && (
            <g transform={`translate(${ox}, ${(1 - s.outDrop) * -60})`} opacity={Math.min(1, s.outDrop * 2)}>
              <line y1={-26} y2={TH} stroke={RED} strokeWidth={4} style={{filter: `drop-shadow(0 0 ${4 + 8 * s.outPulse}px ${RED})`}} />
              <rect x={-30} y={-28} width={60} height={24} rx={5} fill={RED} />
              <text x={0} y={-11} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={800}>OUT</text>
            </g>
          )}
          {/* playhead */}
          <line x1={PH} x2={PH} y1={-4} y2={TH + 2} stroke="#fff" strokeWidth={2.5} />
          <path d={`M${PH - 8} -10 h16 l-8 9z`} fill="#fff" />
          {s.confirm > 0 && (
            <g transform={`translate(${PH}, ${TH / 2})`} opacity={1 - Math.max(0, s.confirm - 0.6) / 0.4}>
              <circle r={14 + 40 * s.confirm} fill="none" stroke={GREEN} strokeWidth={4} opacity={1 - s.confirm} />
              <circle r={20} fill={GREEN} />
              <foreignObject x={-11} y={-11} width={22} height={22}><CheckIcon size={22} /></foreignObject>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

/* ───────────── Big count display ───────────── */
export const CountDisplay: React.FC<{v: number; show: number; pulse: number; outSet: number; confirm: number}> = ({v, show, pulse, outSet, confirm}) => {
  const b = beatAt(v);
  const fifth = b.eight >= CONFIG2.fullEights;
  const nums = fifth ? Array.from({length: CONFIG2.outCount}, (_, i) => i + 1) : [1, 2, 3, 4, 5, 6, 7, 8];
  const slot = fifth ? 150 : COUNT.w / 8;
  const x0 = fifth ? (COUNT.w - slot * nums.length) / 2 : 0;
  return (
    <div style={{...at(COUNT), ...glass, opacity: show, transform: `scale(${0.9 + 0.1 * show})`}}>
      <div style={{position: "absolute", left: 16, top: 8, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: fifth ? "#fca5a5" : BLUE_L}}>
        {fifth ? `8 #${CONFIG2.fullEights + 1}` : b.eight >= 0 ? `8 #${b.eight + 1}` : ""}
      </div>
      {nums.map((n, i) => {
        const current = b.count === n && b.k >= 0;
        const done = b.count > n;
        const isOut = fifth && n === CONFIG2.outCount;
        const base = isOut ? RED : BLUE_L;
        const col = current ? (isOut ? (confirm > 0.5 ? GREEN : RED) : "#fff") : done ? base : "rgba(255,255,255,.22)";
        const sc = current ? 1 + 0.55 * pulse + (isOut ? 0.15 * outSet : 0) : 1;
        return (
          <React.Fragment key={n}>
            {fifth && i > 0 && <div style={{position: "absolute", left: x0 + slot * i - 12, top: 22, fontSize: 36, color: "rgba(255,255,255,.35)"}}>–</div>}
            <div style={{
              position: "absolute", left: x0 + slot * i, width: slot, top: 8, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 52, fontWeight: 800, color: col, transform: `scale(${sc})`,
              textShadow: current ? `0 0 ${18 + 20 * pulse}px ${isOut ? RED : BLUE}` : "none",
            }}>{n}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ───────────── 3D 8-count blocks ───────────── */
const SW = 180, SH = 40, SD = 64, GAP = 8;

const Slab: React.FC<{i: number; drop: number; lit: number; complete: number; fifth?: boolean; pulse: number; outSet: number; confirm: number}> = ({
  i, drop, lit, complete, fifth, pulse, outSet, confirm,
}) => {
  if (drop <= 0) return null;
  const solid = complete;
  const face = (w: number, h: number, transform: string, bg: string, children?: React.ReactNode) => (
    <div style={{position: "absolute", left: -w / 2, top: -h / 2, width: w, height: h, transform, background: bg, border: `1.5px solid rgba(147,197,253,${0.5 + 0.3 * solid})`, boxSizing: "border-box"}}>{children}</div>
  );
  const cells = Array.from({length: 8}, (_, c) => {
    const hidden = fifth && c >= CONFIG2.outCount;
    const isOut = fifth && c === CONFIG2.outCount - 1;
    const on = c < lit;
    const newest = c === lit - 1;
    const onCol = isOut ? (confirm > 0.5 ? GREEN : RED) : BLUE_L;
    return (
      <div key={c} style={{
        position: "absolute", left: 3 + c * ((SW - 6) / 8), top: 4, width: (SW - 6) / 8 - 3, height: SH - 8, borderRadius: 3,
        boxSizing: "border-box", opacity: hidden ? 0 : 1,
        border: `2px solid ${isOut ? RED : on ? onCol : "rgba(147,197,253,.75)"}`,
        background: on ? onCol : solid > 0.5 ? "rgba(255,255,255,.15)" : "rgba(37,99,235,.12)",
        boxShadow: on && newest ? `0 0 ${10 + 14 * pulse}px ${onCol}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isOut && !on && <TargetIcon size={16} />}
      </div>
    );
  });
  const frontBg = fifth ? "rgba(15,23,42,.55)" : `rgba(${Math.round(30 + 7 * solid)},${Math.round(58 + 41 * solid)},${Math.round(138 + 97 * solid)},${0.35 + 0.65 * solid})`;
  return (
    <div style={{
      position: "absolute", left: 0, top: 0, transformStyle: "preserve-3d",
      transform: `translate3d(0, ${-i * (SH + GAP) - (1 - drop) * 260}px, 0)`, opacity: Math.min(1, drop * 3),
    }}>
      {face(SW, SH, `translateZ(${SD / 2}px)`, frontBg, cells)}
      {face(SW, SD, `rotateX(90deg) translateZ(${SH / 2}px)`, fifth ? "rgba(30,41,59,.5)" : solid > 0.5 ? "#60a5fa" : "rgba(59,130,246,.25)")}
      {face(SD, SH, `rotateY(90deg) translateZ(${SW / 2}px)`, fifth ? "rgba(15,23,42,.6)" : solid > 0.5 ? BLUE_D : "rgba(29,78,216,.35)")}
    </div>
  );
};

export const CubeStack: React.FC<{v: number; t: number; show: number; drops: number[]; fifthDrop: number; pulse: number; outSet: number; confirm: number}> = ({
  v, show, drops, fifthDrop, pulse, outSet, confirm,
}) => {
  const b = beatAt(v);
  const full = CONFIG2.fullEights;
  const current = Math.min(b.eight + 1, full);
  return (
    <div style={{...at(CUBES), ...glass, opacity: show}}>
      <div style={{position: "absolute", left: 18, top: 14, fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,.6)"}}>8-COUNTS</div>
      <div style={{position: "absolute", left: 18, top: 36, fontSize: 34, fontWeight: 800, color: "#fff", fontFamily: monoFamily}}>
        8s: <span style={{color: BLUE_L}}>{Math.max(0, current)}</span>/{full}
        {b.eight >= full && <span style={{color: BLUE_L, fontSize: 26}}> ✓</span>}
      </div>
      <div style={{
        position: "absolute", left: 18, top: 84, fontSize: 16, fontWeight: 700, color: "#fca5a5", opacity: fifthDrop,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <TargetIcon size={18} /> + 1 2 3 {CONFIG2.outCount} → Out
      </div>
      <div style={{position: "absolute", left: CUBES.w / 2 - 6, top: CUBES.h - 60, perspective: 900}}>
        <div style={{transformStyle: "preserve-3d", transform: "rotateX(-24deg) rotateY(-34deg)"}}>
          {drops.map((d, i) => {
            const lit = b.eight > i ? 8 : b.eight === i ? b.count : 0;
            return <Slab key={i} i={i} drop={d} lit={lit} complete={b.eight > i ? 1 : 0} pulse={b.eight === i ? pulse : 0} outSet={0} confirm={0} />;
          })}
          <Slab i={full} drop={fifthDrop} fifth lit={b.eight >= full ? b.count : 0} complete={0} pulse={pulse} outSet={outSet} confirm={confirm} />
        </div>
      </div>
    </div>
  );
};

/* ───────────── Badges on the video ───────────── */
export const VideoBadge: React.FC<{show: number; x: number; y: number; children: React.ReactNode; color?: string}> = ({show, x, y, children, color = "rgba(9,13,24,.84)"}) =>
  show <= 0 ? null : (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translateX(-50%) scale(${0.85 + 0.15 * show})`, opacity: show,
      background: color, color: "#fff", borderRadius: 999, padding: "10px 22px", fontSize: 26, fontWeight: 800,
      boxShadow: "0 10px 30px rgba(0,0,0,.4)", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap",
    }}>{children}</div>
  );

export const VIDEO_TOP = {x: VIDEO.x + VIDEO.w / 2, y: VIDEO.y + 22};
export const VIDEO_TR = {x: VIDEO.x + VIDEO.w - 110, y: VIDEO.y + 22};

/* ───────────── Keyboard keycap ───────────── */
export const Keycap: React.FC<{label: string; x: number; y: number; show: number; press: number; color: string; w?: number}> = ({
  label, x, y, show, press, color, w = 96,
}) => {
  if (show <= 0) return null;
  const h = 96, depth = 14;
  return (
    <div style={{position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h + depth, opacity: Math.min(1, show), transform: `scale(${show}) perspective(500px) rotateX(18deg)`}}>
      <div style={{position: "absolute", left: 0, top: depth, width: w, height: h, borderRadius: 18, background: "#9ca3af", boxShadow: "0 18px 30px rgba(0,0,0,.45)"}} />
      <div style={{
        position: "absolute", left: 0, top: press * (depth - 3), width: w, height: h, borderRadius: 18, boxSizing: "border-box",
        background: "linear-gradient(#ffffff, #e5e7eb)", border: `3px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: label.length > 1 ? 30 : 48, fontWeight: 800, color: "#111827",
        boxShadow: `0 ${depth - press * (depth - 3)}px 0 #6b7280, 0 0 ${24 * press}px ${color}`,
      }}>{label}</div>
    </div>
  );
};

/* ───────────── Spotlight (dims + blurs everything except the holes) ───────────── */
const roundRect = (r: Rect, rad: number) => {
  const R = Math.max(0, Math.min(rad, r.w / 2, r.h / 2));
  if (r.w <= 1 || r.h <= 1) return "";
  // counter-clockwise, so with nonzero fill it cuts a hole
  return `M${r.x + R} ${r.y} a${R} ${R} 0 0 0 ${-R} ${R} v${r.h - 2 * R} a${R} ${R} 0 0 0 ${R} ${R} h${r.w - 2 * R} a${R} ${R} 0 0 0 ${R} ${-R} v${-(r.h - 2 * R)} a${R} ${R} 0 0 0 ${-R} ${-R} Z`;
};

// Renders `children` twice: blurred + darkened everywhere, then sharp only inside the holes.
// (backdrop-filter glitches inside the zoomed camera layer, so this is done with plain filters + clip-path.)
export const Spotlight: React.FC<{holes: Rect[]; amount: number; children: React.ReactNode}> = ({holes, amount, children}) => {
  if (amount <= 0.01) return <>{children}</>;
  const O = {x: -200, y: -150, w: 2320, h: 1380};
  const path = holes.map((h) => roundRect({...h, x: h.x - O.x, y: h.y - O.y}, 16)).filter(Boolean).join(" ") || "M0 0Z";
  return (
    <>
      <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, filter: `blur(${2.5 * amount}px) brightness(${1 - 0.6 * amount})`}}>
        {children}
      </div>
      <div style={{position: "absolute", left: O.x, top: O.y, width: O.w, height: O.h, clipPath: `path(nonzero, "${path}")`}}>
        <div style={{position: "absolute", left: -O.x, top: -O.y, width: 1920, height: 1080}}>{children}</div>
      </div>
      {holes.map((h, i) => h.w > 1 && (
        <div key={i} style={{
          position: "absolute", left: h.x, top: h.y, width: h.w, height: h.h, borderRadius: 16,
          boxShadow: `0 0 0 2px rgba(255,255,255,${0.6 * amount}), 0 0 30px rgba(255,255,255,${0.15 * amount})`,
        }} />
      ))}
    </>
  );
};
