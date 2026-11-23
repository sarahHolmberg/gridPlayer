// Grid Player as it is now (2026-11): 26×26 grid, target picture bottom-left, beat timeline with
// "Bar · Beat", Tap B, Beat 1 here K; side panel = Next link, clock + skip, then the card for the step (Trim / Record / Send).
import React from "react";
import {Check} from "lucide-react";
import {AppTitleBar, C, LinkCard, LinkCardData} from "../ui";
import {SIDEBAR_W, SIDEBAR_X, STAGE, WIN, CARD} from "../layout";
import {monoFamily} from "../shared";
import {fmtClock} from "../scene2/timeline";
import {Figure, LOOKS, Move, targetPoint} from "../gp/dancers3";
import {Studio} from "../scene2/Player";
import type {Rect} from "../scene2/layout2";

/* ── the dance video ── */
export const MUSIC = 2.23; // video time where the music and the dance start (= beat 1)
export const TRUE_BPM = 117;
export const BEAT = 60 / TRUE_BPM;
export const beatV = (k: number) => MUSIC + k * BEAT;
export const DURATION = 15.7;
export const TARGET = 2; // the dancer in the link's picture

/* ── layout (world) ── */
export const VSTAGE: Rect = {x: STAGE.x, y: STAGE.y, w: STAGE.w, h: 668};
export const VIDEO: Rect = {x: STAGE.x + (STAGE.w - 1188) / 2, y: STAGE.y, w: 1188, h: 668};
export const STRIP: Rect = {x: STAGE.x, y: VSTAGE.y + VSTAGE.h, w: STAGE.w, h: 118};
export const BAR: Rect = {x: STAGE.x, y: STRIP.y + STRIP.h, w: STAGE.w, h: STAGE.y + STAGE.h - (STRIP.y + STRIP.h)};
export const TPIC: Rect = {x: STAGE.x + 6, y: VSTAGE.y + VSTAGE.h - 140, w: 76, h: 112};
export const PLAY = {x: VIDEO.x + 34, y: VIDEO.y + VIDEO.h - 30};
export const N = 26;
const SRC_W = 1360, SRC_H = 765;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const cellName = (sx: number, sy: number) =>
  `${LETTERS[Math.max(0, Math.min(N - 1, Math.floor((sx / SRC_W) * N)))]}${Math.max(0, Math.min(N - 1, Math.floor((sy / SRC_H) * N))) + 1}`;
export const cellRect = (name: string): Rect => {
  const c = LETTERS.indexOf(name[0]), r = parseInt(name.slice(1), 10) - 1;
  return {x: VIDEO.x + (c * VIDEO.w) / N, y: VIDEO.y + (r * VIDEO.h) / N, w: VIDEO.w / N, h: VIDEO.h / N};
};
/** the cell just beside the target person's face (to their right on screen) */
export const faceCell = () => {
  const p = targetPoint({kind: "spin", v: 0, dancer: TARGET}, []);
  return cellName(p.x + 60, p.y);
};
export const actionCell = (m: Move, moves: Move[]) => {
  const p = targetPoint(m, moves);
  return cellName(p.x, p.y);
};

// side panel
export const TIMER: Rect = {x: CARD.x, y: CARD.y + 302, w: CARD.w, h: 112};
export const SKIP_BTN: Rect = {x: TIMER.x + 196, y: TIMER.y + 16, w: 124, h: 40};
export const STEP_CARD_Y = TIMER.y + TIMER.h + 16;
export const OUT_BTN: Rect = {x: CARD.x + 20 + 106, y: STEP_CARD_Y + 54, w: 104, h: 42};
export const GO_BTN: Rect = {x: CARD.x + 20, y: STEP_CARD_Y + 136, w: CARD.w - 40, h: 46};
export const REC_BTN = {x: CARD.x + 50, y: STEP_CARD_Y + 82};
export const NAME_BTN: Rect = {x: CARD.x + 20, y: STEP_CARD_Y + 130, w: CARD.w - 40, h: 44};
export const AUDIO_BTN: Rect = {x: CARD.x + 20, y: STEP_CARD_Y + 184, w: CARD.w - 40, h: 44};
export const SEND_Y = TIMER.y + 72 + 12; // in the Send step the clock card is short (no speed buttons)
export const WATCH_BTN: Rect = {x: CARD.x + 20, y: SEND_Y + 94, w: 120, h: 36};
export const WATCH_TICK = {x: CARD.x + 160, y: SEND_Y + 112};
export const SEND_TEXT: Rect = {x: CARD.x + 20, y: SEND_Y + 166, w: CARD.w - 40, h: 96};
export const SEND_BTN: Rect = {x: CARD.x + 20, y: SEND_Y + 314, w: CARD.w - 40, h: 44};
export const KB: Rect = {x: BAR.x + 440, y: BAR.y + 6, w: 140, h: 30}; // "Beat 1 here K"
export const TAPB: Rect = {x: BAR.x + 360, y: BAR.y + 6, w: 72, h: 30};
export const POS: Rect = {x: BAR.x + 10, y: BAR.y + 6, w: 190, h: 30};

/* ── video picture ── */
const GridLayer: React.FC<{opacity: number}> = ({opacity}) => {
  const cw = VIDEO.w / N, ch = VIDEO.h / N;
  const items: React.ReactNode[] = [];
  for (let i = 1; i < N; i++) {
    items.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={VIDEO.h} stroke="rgba(255,255,255,.25)" />);
    items.push(<line key={`h${i}`} y1={i * ch} y2={i * ch} x1={0} x2={VIDEO.w} stroke="rgba(255,255,255,.25)" />);
  }
  for (let c = 0; c < N; c++) for (let r = 0; r < N; r++)
    items.push(<text key={`${c}-${r}`} x={c * cw + 2} y={r * ch + 12} fontSize={11.5} fontWeight={800} fontFamily={monoFamily} fill="#fff" stroke="rgba(0,0,0,.85)" strokeWidth={2.6} paintOrder="stroke">{LETTERS[c]}{r + 1}</text>);
  return <svg width={VIDEO.w} height={VIDEO.h} style={{position: "absolute", left: 0, top: 0, opacity}}>{items}</svg>;
};

export const TargetPicture: React.FC<{hi?: number; opacity?: number}> = ({hi = 0, opacity = 1}) => {
  const L = LOOKS[TARGET];
  return (
    <div style={{position: "absolute", left: TPIC.x - STAGE.x, top: TPIC.y - STAGE.y, width: TPIC.w, height: TPIC.h, borderRadius: 6, overflow: "hidden", opacity,
      border: `3px solid ${hi > 0.5 ? "#facc15" : "#fff"}`, boxSizing: "border-box", boxShadow: `0 0 ${24 * hi}px rgba(250,204,21,${hi})`, background: "#d8cfc4"}}>
      <svg width="100%" height="100%" viewBox={`${680 - 130} ${688 - 470 * L.scale} 260 ${470 * L.scale + 20}`} preserveAspectRatio="xMidYMid slice">
        <rect x={0} y={0} width={1360} height={765} fill="#d8cfc4" />
        <Figure i={TARGET} v={0.3} moves={[{kind: "handsUp", v: 0.3, dancer: TARGET}]} x={0.5} scale={L.scale} />
      </svg>
    </div>
  );
};

export type VideoProps = {v: number; playing: boolean; playPress?: number; moves: Move[]; grid: number; picHi?: number; overlay?: React.ReactNode; fx?: {scale: number; opacity: number}};
const VideoArea: React.FC<VideoProps> = ({v, playing, playPress = 0, moves, grid, picHi, overlay, fx = {scale: 1, opacity: 1}}) => {
  const vv = v < MUSIC ? 0.05 : v; // before the music everyone stands still
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: VSTAGE.w, height: VSTAGE.h}}>
      <div style={{position: "absolute", left: VIDEO.x - VSTAGE.x, top: 0, width: VIDEO.w, height: VIDEO.h, opacity: fx.opacity, transform: `scale(${fx.scale})`}}>
        <svg width={VIDEO.w} height={VIDEO.h} viewBox={`0 0 ${SRC_W} ${SRC_H}`} style={{position: "absolute", inset: 0}}>
          <Studio />
          {LOOKS.map((_, i) => <Figure key={i} i={i} v={vv} moves={v < MUSIC ? [] : moves} />)}
        </svg>
        <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 80, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.6))"}} />
        {grid > 0 && <GridLayer opacity={grid} />}
        <div style={{position: "absolute", left: 22, bottom: 18, display: "flex", alignItems: "center", gap: 14, color: "#fff", fontSize: 17}}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff" style={{transform: `scale(${1 - 0.15 * playPress})`}}>
            {playing ? <><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></> : <path d="M7 4.5v15l12-7.5z" />}
          </svg>
          <span style={{textShadow: "0 1px 3px #000"}}>{fmtClock(v)} / {fmtClock(DURATION)}</span>
        </div>
        <div style={{position: "absolute", left: 160, right: 150, bottom: 30, height: 5, borderRadius: 3, background: "rgba(255,255,255,.35)"}}>
          <div style={{width: `${(v / DURATION) * 100}%`, height: "100%", background: "#fff", borderRadius: 3}} />
        </div>
        {overlay}
      </div>
      <TargetPicture hi={picHi} opacity={fx.opacity} />
    </div>
  );
};

/* ── beat timeline: the sound scrolls past the middle line, the beat grid over it ── */
const PX = 200;
const hash = (n: number) => { const s = Math.sin(n * 91.7) * 43758.5453; return s - Math.floor(s); };
export type Grid = {beat1: number; bpm: number};
const Timeline: React.FC<{v: number; grid: Grid; out: number | null; outP: number}> = ({v, grid, out, outP}) => {
  const mid = STRIP.w / 2;
  const X = (tv: number) => mid + (tv - v) * PX;
  const bars: React.ReactNode[] = [];
  const n0 = Math.floor((v - mid / PX) / 0.02);
  for (let n = n0; n < n0 + STRIP.w / 4 + 2; n++) {
    const tv = n * 0.02, x = X(tv);
    if (x < 0 || x > STRIP.w) continue;
    let a = 0.03 + 0.04 * hash(n);
    if (tv >= MUSIC - 0.01) {
      const dt = ((tv - MUSIC) % BEAT + BEAT) % BEAT;
      a = 0.12 + 0.12 * hash(n + 7) + 0.7 * Math.exp(-dt * 11);
    }
    const h = Math.min(1, a) * (STRIP.h / 2 - 10);
    bars.push(<rect key={n} x={x} y={STRIP.h / 2 + 6 - h} width={3} height={2 * h} fill={tv <= v ? "#7aa7f5" : "#3f6fd1"} />);
  }
  const lines: React.ReactNode[] = [];
  const bl = 60 / grid.bpm;
  for (let k = Math.floor((v - mid / PX - grid.beat1) / bl); ; k++) {
    const tv = grid.beat1 + k * bl, x = X(tv);
    if (x > STRIP.w) break;
    if (x < -2) continue;
    const bar = ((k % 4) + 4) % 4 === 0;
    lines.push(<g key={k}>
      <line x1={x} x2={x} y1={0} y2={STRIP.h} stroke={bar ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.18)"} strokeWidth={bar ? 2 : 1} />
      {bar && <text x={x + 5} y={14} fill="#e5e5e0" fontSize={13} fontWeight={700}>{Math.floor(k / 4) + 1}</text>}
    </g>);
  }
  return (
    <svg width={STRIP.w} height={STRIP.h} style={{position: "absolute", left: 0, top: STRIP.y - STAGE.y, background: "#0b0b0a"}}>
      {bars}{lines}
      {out !== null && <g opacity={outP}><line x1={X(out)} x2={X(out)} y1={0} y2={STRIP.h} stroke="#ef4444" strokeWidth={4} /><rect x={X(out) - 24} y={STRIP.h - 22} width={48} height={20} rx={4} fill="#ef4444" /><text x={X(out)} y={STRIP.h - 7} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={800}>OUT</text></g>}
      <line x1={mid} x2={mid} y1={0} y2={STRIP.h} stroke="#f59e0b" strokeWidth={2.5} />
      <path d={`M${mid - 7} 0 h14 l-7 9z`} fill="#f59e0b" />
    </svg>
  );
};

const kbd: React.CSSProperties = {fontFamily: monoFamily, fontSize: 11, color: "#77776f", background: "#f1f1ed", borderRadius: 3, padding: "0 5px", marginLeft: 6};
const lbtn: React.CSSProperties = {height: 30, padding: "0 10px", display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e3e3de", borderRadius: 6, fontSize: 15, color: C.text, boxSizing: "border-box"};
export const posText = (v: number, g: Grid) => {
  const bl = 60 / g.bpm;
  if (v < g.beat1 - 1e-3) return "before beat 1";
  const k = Math.floor((v - g.beat1) / bl + 1e-4);
  return `Bar ${Math.floor(k / 4) + 1} · Beat ${(k % 4) + 1}`;
};
const BottomBar: React.FC<{v: number; grid: Grid; taps: number; kPress: number; bPress: number; posHi: number; record: boolean}> = ({v, grid, taps, kPress, bPress, posHi, record}) => (
  <div style={{position: "absolute", left: 0, top: BAR.y - STAGE.y, width: BAR.w, height: BAR.h, background: C.panel, borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", boxSizing: "border-box", fontSize: 15, color: C.text}}>
    <span style={{width: POS.w, fontFamily: monoFamily, fontWeight: 800, color: C.accent, fontSize: 17, borderRadius: 6, padding: "3px 6px", boxSizing: "border-box",
      background: posHi > 0 ? `rgba(37,99,235,${0.14 * posHi})` : "transparent", boxShadow: posHi > 0 ? `0 0 0 ${3 * posHi}px rgba(37,99,235,.5)` : "none"}}>{posText(v, grid)}</span>
    <span>BPM</span>
    <div style={{...lbtn, width: 82, fontFamily: monoFamily}}>{grid.bpm.toFixed(grid.bpm % 1 ? 1 : 0)}</div>
    <div style={{...lbtn, width: TAPB.w, transform: `scale(${1 - 0.08 * bPress})`, background: bPress > 0.2 ? C.accentSoft : "#fff"}}>Tap{taps === 0 ? <span style={kbd}>B</span> : <span style={{marginLeft: 5, fontWeight: 800, color: taps >= 4 ? C.ok : C.accent}}>{taps >= 4 ? "✓" : "·".repeat(taps)}</span>}</div>
    <div style={{...lbtn, width: KB.w, transform: `scale(${1 - 0.08 * kPress})`, background: kPress > 0.2 ? C.accentSoft : "#fff"}}>Beat 1 here<span style={kbd}>K</span></div>
    <div style={lbtn}>◂ 10 ms</div><div style={lbtn}>10 ms ▸</div>
    <div style={{display: "flex", alignItems: "center", gap: 5}}><div style={{width: 16, height: 16, borderRadius: 3, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center"}}><Check size={12} color="#fff" strokeWidth={4} /></div>Snap<span style={kbd}>S</span></div>
    <div style={lbtn}>−</div><div style={lbtn}>+</div>
    {record && <div style={lbtn}>▾ Hide</div>}
  </div>
);

/* ── side panel ── */
const rel = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x - SIDEBAR_X, top: r.y - STAGE.y, width: r.w, height: r.h});
const card: React.CSSProperties = {background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxSizing: "border-box"};
const btn: React.CSSProperties = {position: "absolute", borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 17, boxSizing: "border-box"};
const at = (r: Rect, base: Rect): React.CSSProperties => ({left: r.x - base.x, top: r.y - base.y, width: r.w, height: r.h});

export type Side =
  | {mode: "trim"; outOn: number; info: string; goPress: number}
  | {mode: "record"; recOn: boolean; recTime: number; recPress: number; namePress: number; audioPress: number}
  | {mode: "send"; watchPress: number; watched: number; ticked: number; text: number; sendPress: number; sending: boolean};

const SidePanel: React.FC<{clock: number; skipPress: number; skipHi: number; side: Side; link?: {donePress?: number; flip?: number; next?: LinkCardData}; status: string}> = ({clock, skipPress, skipHi, side, link = {}, status}) => {
  const flip = link.flip ?? 0;
  const send = side.mode === "send";
  const stepCard: Rect = {x: CARD.x, y: send ? SEND_Y : STEP_CARD_Y, w: CARD.w, h: side.mode === "trim" ? 200 : side.mode === "record" ? 262 : 372};
  const pulse = (p: number) => (p > 0 ? `0 0 0 ${3 * p}px rgba(37,99,235,.5)` : "none");
  return (
    <div style={{position: "absolute", left: WIN.w - SIDEBAR_W, top: STAGE.y - WIN.y, width: SIDEBAR_W, height: STAGE.h, background: C.bg}}>
      <div style={{position: "absolute", left: CARD.x - SIDEBAR_X, top: CARD.y - STAGE.y, width: CARD.w, height: 284, perspective: 1200}}>
        <div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)`}}>
          <div style={{position: "absolute", inset: 0, backfaceVisibility: "hidden"}}><LinkCard noFrame highlight={0} press={0} donePress={link.donePress} /></div>
          <div style={{position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)"}}><LinkCard noFrame highlight={0} press={0} data={link.next} /></div>
        </div>
      </div>
      <div style={{...rel({...TIMER, h: send ? 72 : TIMER.h}), ...card}}>
        <div style={{position: "absolute", left: 18, top: 16, height: 40, padding: "0 10px", border: `1px solid ${C.line}`, borderRadius: 6, fontFamily: monoFamily, fontSize: 30, fontWeight: 700, display: "flex", alignItems: "center"}}>{clock.toFixed(3)} s</div>
        <div style={{...btn, ...at(SKIP_BTN, TIMER), fontSize: 16, transform: `scale(${1 - 0.08 * skipPress})`, background: skipPress > 0.2 ? C.accentSoft : "#fff", boxShadow: pulse(skipHi)}}>+0.85 s ▸</div>
        <div style={{position: "absolute", left: 18, top: 68, display: send ? "none" : "flex", gap: 6}}>
          {["0.3x", "0.5x", "0.75x", "1x", "3x"].map((s) => <div key={s} style={{border: `1px solid ${C.line}`, borderRadius: 5, padding: "3px 9px", fontSize: 15, background: s === "1x" ? "#ececec" : "#fff"}}>{s}</div>)}
        </div>
      </div>
      <div style={{...rel(stepCard), ...card}}>
        {side.mode === "trim" && (
          <>
            <div style={{position: "absolute", left: 20, top: 16, fontSize: 17, fontWeight: 700}}>Trim</div>
            <div style={{...btn, left: 20, top: 54, width: 96, height: 42}}>[ In<span style={kbd}>I</span></div>
            <div style={{...btn, ...at(OUT_BTN, stepCard), border: `${side.outOn > 0.5 ? 2 : 1}px solid ${side.outOn > 0.5 ? C.accent : C.line}`, background: side.outOn > 0.5 ? C.accentSoft : "#fff", color: side.outOn > 0.5 ? C.accent : C.text, fontWeight: side.outOn > 0.5 ? 700 : 400}}>Out ]<span style={kbd}>O</span></div>
            <div style={{...btn, left: 240, top: 54, width: 100, height: 42, border: 0, color: C.muted}}>Clear<span style={kbd}>X</span></div>
            <div style={{position: "absolute", left: 20, top: 106, fontFamily: monoFamily, fontSize: 15, color: C.muted}}>{side.info}</div>
            <div style={{...btn, ...at(GO_BTN, stepCard), background: side.outOn > 0.5 ? C.accent : "#c9d6f6", color: "#fff", fontWeight: 700, border: 0, transform: `scale(${1 - 0.05 * side.goPress})`}}>✂ Trim &amp; continue<span style={{...kbd, color: "#fff", background: "rgba(255,255,255,.22)"}}>Enter</span></div>
          </>
        )}
        {side.mode === "record" && (
          <>
            <div style={{position: "absolute", left: 20, top: 16, fontSize: 17, fontWeight: 700}}>Record</div>
            <div style={{position: "absolute", right: 18, top: 17, fontSize: 15, color: C.accent}}>✂ Back to trim</div>
            <div style={{position: "absolute", left: REC_BTN.x - CARD.x - 26, top: REC_BTN.y - STEP_CARD_Y - 26, width: 52, height: 52, borderRadius: "50%", background: C.rec,
              transform: `scale(${1 - 0.12 * side.recPress})`, boxShadow: side.recOn ? `0 0 0 ${4 + 4 * Math.abs(Math.sin(side.recTime * 3))}px rgba(229,72,77,.35)` : "0 0 0 4px #fde2e2"}} />
            <div style={{position: "absolute", left: 92, top: 70, fontSize: 17, color: side.recOn ? C.rec : C.muted, fontWeight: side.recOn ? 700 : 400}}>{side.recOn ? "Rec ●" : "Rec"}</div>
            <div style={{position: "absolute", left: 210, top: 64, border: `1px solid ${C.line}`, borderRadius: 6, padding: "4px 10px", fontFamily: monoFamily, fontWeight: 700, fontSize: 21, color: side.recOn ? C.rec : C.text}}>{`${Math.floor(side.recTime / 60)}:${(side.recTime % 60).toFixed(1).padStart(4, "0")}`}</div>
            <div style={{...btn, ...at(NAME_BTN, stepCard), transform: `scale(${1 - 0.05 * side.namePress})`, background: side.namePress > 0.2 ? C.accentSoft : "#fff"}}>🔤 Say name<span style={kbd}>M</span></div>
            <div style={{...btn, ...at(AUDIO_BTN, stepCard), background: side.recOn ? C.accent : "#c9d6f6", color: "#fff", fontWeight: 700, border: 0, transform: `scale(${1 - 0.05 * side.audioPress})`}}>⬇ Export audio</div>
            <div style={{position: "absolute", right: 20, top: 236, fontSize: 15, color: C.accent}}>Skip to Send ▸</div>
          </>
        )}
        {side.mode === "send" && (
          <>
            <div style={{position: "absolute", left: 20, top: 16, fontSize: 17, fontWeight: 700}}>Send to Studio Mirrors</div>
            <div style={{position: "absolute", left: 20, top: 42, fontSize: 15, fontWeight: 700}}>Sample User</div>
            <div style={{position: "absolute", left: 20, top: 66, fontSize: 15}}>1. The video <span style={{color: C.ok, fontWeight: 700}}>✓ trimmed MP4, 4.1 MB</span></div>
            <div style={{...btn, ...at(WATCH_BTN, stepCard), fontSize: 15, transform: `scale(${1 - 0.06 * side.watchPress})`}}>▶ Watch it</div>
            <div style={{position: "absolute", left: WATCH_TICK.x - CARD.x - 12, top: WATCH_TICK.y - SEND_Y - 11, display: "flex", gap: 8, alignItems: "flex-start", width: 190, fontSize: 14, color: side.watched > 0.5 ? C.text : "#aaa"}}>
              <div style={{width: 20, height: 20, flex: "none", borderRadius: 4, border: `2px solid ${side.ticked > 0.5 ? C.accent : "#bbb"}`, background: side.ticked > 0.5 ? C.accent : "#fff", display: "flex", alignItems: "center", justifyContent: "center"}}>
                {side.ticked > 0.5 && <Check size={14} color="#fff" strokeWidth={4} />}
              </div>I watched it: it plays and it is the right part
            </div>
            <div style={{position: "absolute", left: 20, top: 142, fontSize: 15}}>2. The transcript</div>
            <div style={{...at(SEND_TEXT, stepCard), position: "absolute", border: `1px solid ${side.text > 0 && side.text < 1 ? C.accent : C.line}`, borderRadius: 6, padding: 8, boxSizing: "border-box", fontSize: 13, lineHeight: 1.35, overflow: "hidden", color: side.text > 0 ? C.text : "#999"}}>
              {side.text > 0 ? TRANSCRIPT.slice(0, Math.round(TRANSCRIPT.length * Math.min(1, side.text * 4))) : "Paste the transcribed text here"}
            </div>
            <div style={{...btn, left: 20, top: 270, width: 120, height: 30, fontSize: 14}}>📄 Load .txt</div>
            <div style={{position: "absolute", left: 160, top: 276, fontSize: 13, color: C.muted}}>Your code is saved · <span style={{color: C.accent}}>change</span></div>
            <div style={{...btn, ...at(SEND_BTN, stepCard), background: side.ticked > 0.5 && side.text > 0.5 ? C.accent : "#c9d6f6", color: "#fff", fontWeight: 700, border: 0, transform: `scale(${1 - 0.05 * side.sendPress})`}}>{side.sending ? "Sending…" : "📨 3. Send to Studio Mirrors"}</div>
          </>
        )}
      </div>
      <div style={{position: "absolute", left: 20, right: 20, bottom: 14, fontSize: 14, color: C.muted, display: send ? "none" : "flex", justifyContent: "space-between"}}>
        <span>{status}</span><span style={{color: C.accent}}>Open another</span>
      </div>
    </div>
  );
};

export const TRANSCRIPT = "Name bubble. S, A, M, P, L, E, U, S, E, R. Target cell R12, time 0.000. Action, hands up. Target cell Q9, time 3.300. Action, jump. Target cell Q8, time 5.500. Caption, the turns were fast, so I went back a few times to see each whole action.";

export type App4Props = {
  title: string; video: VideoProps; grid: Grid; out: number | null; outP?: number; taps?: number; kPress?: number; bPress?: number; posHi?: number;
  clock: number; skipPress?: number; skipHi?: number; side: Side; link?: {donePress?: number; flip?: number; next?: LinkCardData}; status: string;
  stageAfter?: React.ReactNode; // shown on the stage behind the video (e.g. "Open a video" after Done)
};
export const GridPlayer4: React.FC<App4Props> = (p) => (
  <>
    <AppTitleBar title={p.title} />
    <div style={{position: "absolute", left: 0, top: STAGE.y - WIN.y, width: STAGE.w, height: STAGE.h, background: "#000", overflow: "hidden"}}>
      {p.stageAfter}
      <VideoArea {...p.video} />
      <div style={{position: "absolute", left: 0, top: 0, width: VSTAGE.w, height: VSTAGE.h, boxShadow: `inset 0 0 0 2px ${C.stageGreen}`, pointerEvents: "none"}} />
      <Timeline v={p.video.v} grid={p.grid} out={p.out} outP={p.outP ?? 1} />
      <BottomBar v={p.video.v} grid={p.grid} taps={p.taps ?? 0} kPress={p.kPress ?? 0} bPress={p.bPress ?? 0} posHi={p.posHi ?? 0} record={p.side.mode !== "trim"} />
    </div>
    <SidePanel clock={p.clock} skipPress={p.skipPress ?? 0} skipHi={p.skipHi ?? 0} side={p.side} link={p.link} status={p.status} />
  </>
);

/* ── video time from keyframes: play = runs at 1x, hold = stays, scrub = slides to the next key ── */
export type VKey = {t: number; v: number; mode: "play" | "hold" | "scrub"};
export const vAt = (t: number, keys: VKey[]) => {
  let k = keys[0];
  for (let i = 0; i < keys.length; i++) {
    if (t < keys[i].t) break;
    k = keys[i];
    const nx = keys[i + 1];
    if (k.mode === "play") {
      const vv = k.v + (t - k.t);
      if (!nx || t < nx.t) return {v: vv, playing: true};
    } else if (k.mode === "scrub" && nx && t < nx.t) {
      const p = (t - k.t) / (nx.t - k.t), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      return {v: k.v + (nx.v - k.v) * e, playing: false};
    } else if (!nx || t < nx.t) return {v: k.v, playing: false};
  }
  return {v: k.v, playing: false};
};
