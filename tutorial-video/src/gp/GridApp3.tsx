// Grid Player after trimming: video with a 20×20 grid, beat strip + bottom bar, RECORD card.
import React from "react";
import {Download, Save, Scissors, Check} from "lucide-react";
import {AppTitleBar, C, LinkCard, LinkCardData} from "../ui";
import {SIDEBAR_W, SIDEBAR_X, STAGE, WIN} from "../layout";
import {monoFamily} from "../shared";
import {fmtClock} from "../scene2/timeline";
import {KebabIcon} from "../icons";
import {
  BOTTOMBAR, COLS, EXPORT_AUDIO, EXPORT_TRIM, LINK_CARD, PROGRESS3, REC_BTN, REC_CARD, SRC_H, SRC_W, STRIP, TIMER3, VIDEO3, VSTAGE,
} from "./layout3";
import {DanceScene, Move} from "./dancers3";
import type {Rect} from "../scene2/layout2";

export const VIDEO_DURATION = 43.651;
export const BAR1 = 0.65; // video time of bar 1 on the beat strip
const BEAT = 0.5;

/* ───────────── grid ───────────── */
export const GridOverlay: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const cw = VIDEO3.w / 20, ch = VIDEO3.h / 20;
  const items: React.ReactNode[] = [];
  for (let i = 1; i < 20; i++) {
    items.push(<line key={`v${i}`} x1={i * cw} x2={i * cw} y1={0} y2={VIDEO3.h} stroke="rgba(255,255,255,.28)" strokeWidth={1} />);
    items.push(<line key={`h${i}`} y1={i * ch} y2={i * ch} x1={0} x2={VIDEO3.w} stroke="rgba(255,255,255,.28)" strokeWidth={1} />);
  }
  for (let c = 0; c < 20; c++)
    for (let r = 0; r < 20; r++)
      items.push(
        <text key={`${c}-${r}`} x={c * cw + 3} y={r * ch + 15} fontSize={13.5} fontWeight={800} fontFamily={monoFamily}
          fill="#fff" stroke="rgba(0,0,0,.85)" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
          {COLS[c]}{r + 1}
        </text>,
      );
  return <svg width={VIDEO3.w} height={VIDEO3.h} style={{position: "absolute", left: 0, top: 0, opacity}}>{items}</svg>;
};

/* ───────────── video picture + controls ───────────── */
const PlayGlyph: React.FC<{playing: boolean}> = ({playing}) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
    {playing ? <><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></> : <path d="M7 4.5v15l12-7.5z" />}
  </svg>
);

export type VideoFx = {scale: number; opacity: number};

const VideoPicture: React.FC<{v: number; playing: boolean; playPress: number; moves: Move[]; grid: number; fx: VideoFx; endZone: number; children?: React.ReactNode}> = ({
  v, playing, playPress, moves, grid, fx, endZone, children,
}) => {
  const frac = v / VIDEO_DURATION;
  const zoneFrac = 2 / VIDEO_DURATION;
  return (
    <div style={{position: "absolute", left: VIDEO3.x - VSTAGE.x, top: 0, width: VIDEO3.w, height: VIDEO3.h, opacity: fx.opacity, transform: `scale(${fx.scale})`}}>
      <svg width={VIDEO3.w} height={VIDEO3.h} viewBox={`0 0 ${SRC_W} ${SRC_H}`} style={{position: "absolute", inset: 0}}>
        <DanceScene v={v} moves={moves} />
      </svg>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.6))"}} />
      {grid > 0 && <GridOverlay opacity={grid} />}
      {/* controls */}
      <div style={{position: "absolute", left: 22, bottom: 18, display: "flex", alignItems: "center", gap: 14, color: "#fff", fontSize: 17, fontWeight: 500}}>
        <div style={{width: 26, transform: `scale(${1 - 0.15 * playPress})`, filter: `drop-shadow(0 0 ${10 * playPress}px #fff)`}}><PlayGlyph playing={playing} /></div>
        <span style={{textShadow: "0 1px 3px #000"}}>{fmtClock(v)} / {fmtClock(VIDEO_DURATION)}</span>
      </div>
      <div style={{position: "absolute", left: PROGRESS3.x - VIDEO3.x + 110, top: PROGRESS3.y - VIDEO3.y + 4, width: PROGRESS3.w - 110, height: 5, borderRadius: 3, background: "rgba(255,255,255,.35)"}}>
        <div style={{width: `${frac * 100}%`, height: "100%", background: "#fff", borderRadius: 3}} />
        {/* last 2 seconds: no actions needed */}
        <div style={{
          position: "absolute", right: 0, top: -6 * endZone, height: 5 + 12 * endZone, width: `${zoneFrac * 100}%`, opacity: endZone, borderRadius: 2,
          background: "repeating-linear-gradient(45deg, #9ca3af 0 3px, #4b5563 3px 6px)", boxShadow: `0 0 0 1px rgba(255,255,255,${0.6 * endZone})`,
        }} />
      </div>
      <div style={{position: "absolute", right: 18, bottom: 16, display: "flex", gap: 16, alignItems: "center"}}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="#fff"><path d="M4 9h4l5-4v14l-5-4H4z" /></svg>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
        <KebabIcon color="#fff" />
      </div>
      {children}
    </div>
  );
};

/* ───────────── beat strip + bottom bar ───────────── */
const STRIP_PX = 200; // px per second, window 0 … 6.8 s
const hash = (n: number) => { const s = Math.sin(n * 91.7) * 43758.5453; return s - Math.floor(s); };

const BeatStrip: React.FC<{v: number}> = ({v}) => {
  const bars: React.ReactNode[] = [];
  for (let x = 0; x < STRIP.w; x += 4) {
    const tv = x / STRIP_PX;
    let a = 0.08 + 0.1 * hash(Math.round(tv * 60));
    if (tv >= BAR1 - 0.02) {
      const dt = ((tv - BAR1) % BEAT + BEAT) % BEAT;
      a += 0.75 * Math.exp(-dt * 10) + 0.22 * hash(Math.round(tv * 33) + 7);
    }
    const hgt = Math.min(1, a) * (STRIP.h / 2 - 8);
    bars.push(<rect key={x} x={x} y={STRIP.h / 2 - hgt} width={3} height={2 * hgt} fill={tv <= v ? "#7aa7f5" : "#3f6fd1"} />);
  }
  const markers = [0, 1, 2, 3].map((n) => {
    const x = (BAR1 + n * 2) * STRIP_PX;
    return (
      <g key={n}>
        <line x1={x} x2={x} y1={0} y2={STRIP.h} stroke={n === 0 ? "#e5484d" : "#d8d8d2"} strokeWidth={2} />
        <text x={x + 5} y={14} fill={n === 0 ? "#e5484d" : "#d8d8d2"} fontSize={13} fontWeight={700}>{n + 1}</text>
      </g>
    );
  });
  const ph = v * STRIP_PX;
  return (
    <svg width={STRIP.w} height={STRIP.h} style={{position: "absolute", left: 0, top: STRIP.y - STAGE.y, background: "#0b0b0a"}}>
      {[...Array(8)].map((_, i) => <line key={i} x1={i * 100 + 25} x2={i * 100 + 25} y1={0} y2={STRIP.h} stroke="#1f1f1d" />)}
      {bars}
      {markers}
      <line x1={ph} x2={ph} y1={0} y2={STRIP.h} stroke="#f59e0b" strokeWidth={2.5} />
      <path d={`M${ph - 7} 0 h14 l-7 9z`} fill="#f59e0b" />
    </svg>
  );
};

const kbd: React.CSSProperties = {fontFamily: monoFamily, fontSize: 11, color: "#a8a8a0", background: "#2a2a27", borderRadius: 3, padding: "0 5px", marginLeft: 6};
const darkBtn: React.CSSProperties = {height: 30, padding: "0 10px", display: "flex", alignItems: "center", background: "#1c1c1a", color: "#e6e6e0", border: "1px solid #3a3a37", borderRadius: 6, fontSize: 15};

const BottomBar: React.FC<{v: number}> = ({v}) => {
  const k = Math.max(0, Math.floor((v - BAR1) / BEAT + 1e-6));
  return (
    <div style={{
      position: "absolute", left: 0, top: BOTTOMBAR.y - STAGE.y, width: BOTTOMBAR.w, height: BOTTOMBAR.h, background: "#0b0b0a",
      borderTop: "1px solid #262624", display: "flex", alignItems: "center", gap: 10, padding: "0 12px", color: "#d8d8d2", fontSize: 15,
    }}>
      <span style={{fontFamily: monoFamily, fontWeight: 800, color: "#f0a020", fontSize: 17, marginRight: 6}}>Bar {Math.floor(k / 4) + 1} · Beat {(k % 4) + 1}</span>
      <span>BPM</span>
      <div style={{...darkBtn, width: 70}}>120</div>
      <div style={darkBtn}>Tap<span style={kbd}>B</span></div>
      <div style={darkBtn}>Beat 1 here<span style={kbd}>K</span></div>
      <div style={darkBtn}>‹ 10 ms<span style={{width: 1, height: 18, background: "#3a3a37", margin: "0 8px"}} />10 ms ›</div>
      <div style={{display: "flex", alignItems: "center", gap: 6}}>
        <div style={{width: 16, height: 16, borderRadius: 3, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center"}}><Check size={12} color="#fff" strokeWidth={4} /></div>
        Snap<span style={kbd}>S</span>
      </div>
      <div style={darkBtn}>–</div>
      <div style={darkBtn}>+</div>
    </div>
  );
};

/* ───────────── sidebar ───────────── */
const rel = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x - SIDEBAR_X, top: r.y - STAGE.y, width: r.w, height: r.h});
const card: React.CSSProperties = {background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxSizing: "border-box"};
const lkbd: React.CSSProperties = {fontFamily: monoFamily, fontSize: 11, color: C.muted, background: "#f1f1ed", borderRadius: 3, padding: "0 5px"};

const TimerCard3: React.FC<{v: number}> = ({v}) => (
  <div style={{...rel(TIMER3), ...card, padding: "16px 20px"}}>
    <div style={{fontFamily: monoFamily, fontSize: 36, fontWeight: 700, letterSpacing: 1}}>{v.toFixed(3)} s</div>
    <div style={{display: "flex", marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", width: "fit-content"}}>
      {["0.3x", "0.5x", "0.75x", "1x", "3x"].map((s, i) => (
        <div key={s} style={{padding: "7px 12px", fontSize: 17, borderLeft: i ? `1px solid ${C.line}` : "none", background: s === "1x" ? C.accent : C.panel, color: s === "1x" ? "#fff" : C.text}}>{s}</div>
      ))}
    </div>
  </div>
);

export type RecState = {
  on: boolean; time: number; press: number; pulse: number; // pulse: 0..1 cycling
  audioReady: number; audioShine: number; audioPress: number;
  trimPress: number; trimProgress: number; trimDone: number;
};

const fmtRec = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

const RecordCard: React.FC<{r: RecState}> = ({r}) => {
  const ready = r.audioReady;
  const mix = (a: number[], b: number[]) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * ready)).join(",")})`;
  const btn: React.CSSProperties = {position: "absolute", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 17, boxSizing: "border-box", overflow: "hidden"};
  const R = 15, circ = 2 * Math.PI * R;
  return (
    <div style={{...rel(REC_CARD), ...card}}>
      <div style={{position: "absolute", left: 20, top: 18, fontSize: 15, fontWeight: 600, letterSpacing: 1.6, color: C.muted}}>RECORD</div>
      {/* rec button */}
      <div style={{position: "absolute", left: REC_BTN.x - REC_CARD.x - 30, top: REC_BTN.y - REC_CARD.y - 30, width: 60, height: 60}}>
        {r.on && <div style={{position: "absolute", inset: -14 * r.pulse, borderRadius: "50%", border: `3px solid rgba(229,72,77,${1 - r.pulse})`}} />}
        <div style={{
          width: 60, height: 60, borderRadius: "50%", background: C.rec, transform: `scale(${1 - 0.12 * r.press})`,
          boxShadow: r.on ? `0 0 0 4px #fde2e2, 0 0 ${18 + 10 * (1 - r.pulse)}px rgba(229,72,77,.7)` : "0 0 0 4px #fde2e2",
        }} />
      </div>
      <div style={{position: "absolute", left: 98, top: 62, fontSize: 17, color: r.on ? C.rec : C.muted, fontWeight: r.on ? 700 : 400}}>{r.on ? "Rec ●" : "Rec"}</div>
      <div style={{position: "absolute", left: 172, top: 58, fontFamily: monoFamily, fontSize: 22, fontWeight: 700, color: r.on ? C.rec : C.text}}>{fmtRec(r.time)}</div>
      <div style={{...btn, left: 252, top: 52, width: 88, height: 40, border: `1px solid ${C.line}`, color: C.muted, fontSize: 16}}><Save size={16} />Save</div>
      {/* export audio */}
      <div style={{
        ...btn, ...rel({...EXPORT_AUDIO, x: EXPORT_AUDIO.x - REC_CARD.x + SIDEBAR_X, y: EXPORT_AUDIO.y - REC_CARD.y + STAGE.y}),
        background: mix([201, 214, 246], [37, 99, 235]), color: "#fff", fontWeight: 600, transform: `scale(${1 - 0.05 * r.audioPress})`,
        boxShadow: ready > 0.9 ? `0 6px 18px rgba(37,99,235,${0.35 * ready})` : "none",
      }}>
        <Download size={18} strokeWidth={2.6} />Export audio
        <div style={{
          position: "absolute", top: -20, bottom: -20, width: 40, left: `${-20 + r.audioShine * 120}%`, transform: "rotate(20deg)",
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.85), rgba(255,255,255,0))", opacity: r.audioShine > 0 && r.audioShine < 1 ? 1 : 0,
        }} />
      </div>
      {/* export trim video */}
      <div style={{
        ...btn, ...rel({...EXPORT_TRIM, x: EXPORT_TRIM.x - REC_CARD.x + SIDEBAR_X, y: EXPORT_TRIM.y - REC_CARD.y + STAGE.y}),
        border: `1px solid ${r.trimDone > 0.5 ? C.ok : C.line}`, background: r.trimDone > 0.5 ? C.okSoft : C.panel,
        color: r.trimDone > 0.5 ? C.ok : C.text, fontWeight: r.trimDone > 0.5 ? 600 : 400, transform: `scale(${1 - 0.05 * r.trimPress})`,
      }}>
        {r.trimProgress > 0 && r.trimDone < 0.5 ? (
          <svg width={36} height={36} style={{transform: "rotate(-90deg)"}}>
            <circle cx={18} cy={18} r={R} fill="none" stroke="#dbe3f3" strokeWidth={3.5} />
            <circle cx={18} cy={18} r={R} fill="none" stroke={C.accent} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - r.trimProgress)} />
          </svg>
        ) : r.trimDone > 0.5 ? <Check size={18} strokeWidth={3} /> : <Download size={18} />}
        {r.trimProgress > 0 && r.trimDone < 0.5 ? `Exporting… ${Math.round(r.trimProgress * 100)}%` : r.trimDone > 0.5 ? "Exported" : "Export trim video"}
      </div>
      {/* checkboxes */}
      <div style={{position: "absolute", left: 20, top: 220, display: "flex", gap: 22, fontSize: 17}}>
        {["Grid|G", "Names|N"].map((s) => {
          const [l, k] = s.split("|");
          return (
            <div key={l} style={{display: "flex", alignItems: "center", gap: 7}}>
              <div style={{width: 18, height: 18, borderRadius: 4, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center"}}><Check size={13} color="#fff" strokeWidth={4} /></div>
              {l} <span style={lkbd}>{k}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: "absolute", left: 20, top: 256, display: "flex", alignItems: "center", gap: 7, fontSize: 17, color: C.muted}}>
        <Scissors size={16} /> Back to trim <span style={lkbd}>T</span>
      </div>
    </div>
  );
};

/* ───────────── whole app ───────────── */
export type App3Props = {
  v: number; playing: boolean; playPress: number; moves: Move[]; grid?: number;
  rec: RecState; footer: string;
  link?: {donePress?: number; doneGlow?: number; flip?: number; next?: LinkCardData; data?: LinkCardData};
  fx?: VideoFx; endZone?: number; videoOverlay?: React.ReactNode; stageAfter?: React.ReactNode;
};

export const GridPlayerApp3: React.FC<App3Props> = ({
  v, playing, playPress, moves, grid = 1, rec, footer, link = {}, fx = {scale: 1, opacity: 1}, endZone = 0, videoOverlay, stageAfter,
}) => {
  const flip = link.flip ?? 0;
  return (
    <>
      <AppTitleBar title="sample_dance.mp4 - Grid Player" />
      <div style={{position: "absolute", left: 0, top: STAGE.y - WIN.y, width: STAGE.w, height: STAGE.h, background: "#000", overflow: "hidden"}}>
        {stageAfter}
        <VideoPicture v={v} playing={playing} playPress={playPress} moves={moves} grid={grid} fx={fx} endZone={endZone}>{videoOverlay}</VideoPicture>
        <div style={{position: "absolute", left: 0, top: 0, width: VSTAGE.w, height: VSTAGE.h, boxShadow: `inset 0 0 0 2px ${C.stageGreen}`}} />
        <BeatStrip v={v} />
        <BottomBar v={v} />
      </div>
      <div style={{position: "absolute", left: STAGE.w, top: STAGE.y - WIN.y, width: SIDEBAR_W, height: STAGE.h, background: C.bg}}>
        {/* NEXT LINK card, can flip over to the next link */}
        <div style={{...rel(LINK_CARD), perspective: 1200}}>
          <div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)`}}>
            <div style={{position: "absolute", inset: 0, backfaceVisibility: "hidden"}}>
              <LinkCard noFrame highlight={0} press={0} donePress={link.donePress} doneGlow={link.doneGlow} data={link.data} />
            </div>
            <div style={{position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)"}}>
              <LinkCard noFrame highlight={0} press={0} data={link.next} />
            </div>
          </div>
        </div>
        <TimerCard3 v={v} />
        <RecordCard r={rec} />
        <div style={{position: "absolute", left: 20, right: 20, bottom: 18, fontSize: 15, color: C.muted, display: "flex", justifyContent: "space-between"}}>
          <span style={{color: rec.on ? C.rec : C.muted, fontWeight: rec.on ? 600 : 400}}>{footer}</span>
          <span style={{color: C.accent}}>Open another</span>
        </div>
      </div>
    </>
  );
};

export const IDLE_REC: RecState = {on: false, time: 0, press: 0, pulse: 0, audioReady: 0, audioShine: 0, audioPress: 0, trimPress: 0, trimProgress: 0, trimDone: 0};
