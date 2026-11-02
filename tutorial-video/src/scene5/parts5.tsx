// Scene 5 building blocks: file-sharing page, common-mistake split view, Done modal, particles, recap carousel.
import React from "react";
import {
  BadgeCheck, Check, CircleDot, Clock, Copy, Download, ExternalLink, File, FileDown, Link2, MousePointer2, Plus, Scissors, Shield, Upload,
  UploadCloud, X,
} from "lucide-react";
import {CONFIG5 as K} from "./config5";
import {APP_Y, WIN} from "../layout";
import {monoFamily} from "../shared";
import {FILES, FileKind, FileChip} from "../gp/tray";
import {VIDEO3} from "../gp/layout3";
import type {Rect} from "../scene2/layout2";

const GREEN = "#22c55e", RED = "#ef4444", BLUE = "#3b82f6";

/* ── page geometry (world coordinates) ── */
export const COL_X = WIN.x + 360, COL_W = 1040;
export const DROPZONE: Rect = {x: COL_X + 24, y: APP_Y + 360, w: COL_W - 48, h: 220};
export const UPLOAD_ROW = (i: number): Rect => ({x: COL_X + 24, y: APP_Y + 600 + i * 50, w: COL_W - 48, h: 42});

const panel: React.CSSProperties = {background: "#111827", border: "1px solid #1f2937", borderRadius: 14, boxSizing: "border-box"};

export const FileSharePage: React.FC<{hover: number; uploads: {kind: FileKind; p: number; show: number}[]}> = ({hover, uploads}) => {
  const rel = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x - WIN.x, top: r.y - APP_Y, width: r.w, height: r.h});
  const info = [
    {icon: <File size={26} color="#f59e0b" />, title: "Max file size", sub: "10 GB"},
    {icon: <Clock size={26} color="#f59e0b" />, title: "Storage time", sub: "7 days"},
    {icon: <Shield size={26} color="#f59e0b" />, title: "Secure", sub: "Passwords and tokens"},
  ];
  return (
    <div style={{position: "absolute", left: 0, top: APP_Y - WIN.y, width: WIN.w, height: WIN.h - (APP_Y - WIN.y), background: "#0b0f17", color: "#e5e7eb"}}>
      {info.map((c, i) => (
        <div key={i} style={{...panel, position: "absolute", left: COL_X - WIN.x + i * 355, top: 28, width: 330, height: 128, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8}}>
          {c.icon}
          <div style={{fontSize: 20, fontWeight: 700}}>{c.title}</div>
          <div style={{fontSize: 16, color: "#9ca3af", fontFamily: i < 2 ? monoFamily : undefined}}>{c.sub}</div>
        </div>
      ))}
      <div style={{...panel, position: "absolute", left: COL_X - WIN.x, top: 178, width: COL_W, height: 96, padding: "14px 20px"}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, letterSpacing: 1.3, color: "#9ca3af"}}><Link2 size={16} />SHARE LINK</div>
        <div style={{display: "flex", gap: 10, marginTop: 10}}>
          <div style={{flex: 1, background: "#0b0f17", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 12px", fontFamily: monoFamily, fontSize: 17}}>{K.sharePage.shareLink}</div>
          {[<Copy key="c" size={18} color="#22c55e" />, <ExternalLink key="e" size={18} />].map((ic, i) => (
            <div key={i} style={{width: 42, height: 38, borderRadius: 8, border: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "center"}}>{ic}</div>
          ))}
        </div>
      </div>
      <div style={{...panel, position: "absolute", left: COL_X - WIN.x, top: 292, width: COL_W, height: 470}}>
        <div style={{position: "absolute", left: 24, top: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700}}>
          <Upload size={24} color="#38bdf8" />Upload your files
        </div>
      </div>
      {/* drop zone */}
      <div style={{
        ...rel(DROPZONE), borderRadius: 14, border: `2px dashed ${hover > 0.5 ? "#60a5fa" : "#1e3a5f"}`, boxSizing: "border-box",
        background: `rgba(37,99,235,${0.06 + 0.22 * hover})`, boxShadow: `0 0 ${50 * hover}px rgba(59,130,246,${0.55 * hover}), inset 0 0 ${40 * hover}px rgba(59,130,246,${0.3 * hover})`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, transform: `scale(${1 + 0.02 * hover})`,
      }}>
        <div style={{width: 60, height: 60, borderRadius: 12, background: "#0f2a44", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e3a5f"}}>
          <Plus size={32} color="#38bdf8" />
        </div>
        <div style={{fontSize: 21, fontWeight: 700}}>{hover > 0.5 ? "Drop to upload" : "Drop files or folders anywhere, or click to browse"}</div>
        <div style={{fontSize: 15, color: "#9ca3af"}}>Maximum file size: 10 GB · Files & folders supported</div>
      </div>
      {/* uploads */}
      {uploads.map((u, i) => u.show > 0 && (
        <div key={i} style={{...rel(UPLOAD_ROW(i)), opacity: u.show, display: "flex", alignItems: "center", gap: 14, fontSize: 17}}>
          <div style={{width: 210, fontWeight: 600, whiteSpace: "nowrap"}}>{FILES[u.kind].name}</div>
          <div style={{flex: 1, height: 10, borderRadius: 5, background: "#1f2937", overflow: "hidden"}}>
            <div style={{width: `${u.p * 100}%`, height: "100%", background: u.p >= 1 ? GREEN : BLUE}} />
          </div>
          <div style={{width: 56, fontFamily: monoFamily, color: "#9ca3af"}}>{Math.round(u.p * 100)}%</div>
          <div style={{width: 30, height: 30, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${u.p >= 1 ? 1 : 0})`}}>
            <Check size={19} color="#fff" strokeWidth={4} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── common mistake: split view (screen space) ── */
const MiniPanel: React.FC<{ok: boolean; show: number; press: number; verdict: number}> = ({ok, show, press, verdict}) => (
  <div style={{
    width: 620, height: 430, borderRadius: 24, background: "#fff", padding: 30, boxSizing: "border-box", position: "relative",
    opacity: show, transform: `translateY(${(1 - show) * 30}px)`, boxShadow: "0 30px 60px rgba(0,0,0,.5)",
    border: `4px solid ${verdict > 0.5 ? (ok ? GREEN : RED) : "transparent"}`,
  }}>
    <div style={{fontSize: 22, fontWeight: 800, color: "#6b7280", letterSpacing: 1}}>{ok ? "RIGHT" : "WRONG"}</div>
    {(["transcript", "video"] as FileKind[]).map((k, i) => {
      const up = ok || i === 0;
      return (
        <div key={k} style={{display: "flex", alignItems: "center", gap: 12, marginTop: 18, fontSize: 21}}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: up ? GREEN : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center",
          }}>{up ? <Check size={21} color="#fff" strokeWidth={4} /> : <X size={21} color="#9ca3af" strokeWidth={3} />}</div>
          <span style={{fontWeight: 700, color: up ? "#111" : "#9ca3af"}}>{FILES[k].name}</span>
          <span style={{color: up ? GREEN : "#9ca3af", fontWeight: 600}}>{up ? "uploaded" : "not uploaded"}</span>
        </div>
      );
    })}
    <div style={{
      position: "absolute", left: 30, bottom: 34, width: 170, height: 58, borderRadius: 12, background: "#15803d", color: "#fff", fontSize: 24, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${1 - 0.1 * press})`,
    }}><Check size={22} strokeWidth={4} />Done</div>
    <div style={{position: "absolute", left: 140, bottom: 10, opacity: press > 0.05 || verdict > 0 ? 1 : 0}}><MousePointer2 size={34} fill="#111" color="#fff" /></div>
    <div style={{
      position: "absolute", right: 30, bottom: 26, display: "flex", alignItems: "center", gap: 12, opacity: verdict, transform: `scale(${0.6 + 0.4 * verdict})`,
    }}>
      <div style={{width: 74, height: 74, borderRadius: "50%", background: ok ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center"}}>
        {ok ? <Check size={46} color="#fff" strokeWidth={4} /> : <X size={46} color="#fff" strokeWidth={4} />}
      </div>
      <div style={{fontSize: 34, fontWeight: 900, color: ok ? "#15803d" : "#b91c1c"}}>{ok ? "Correct" : "Not yet!"}</div>
    </div>
  </div>
);

export const MistakeSplit: React.FC<{show: number; l: {show: number; press: number; verdict: number}; r: {show: number; press: number; verdict: number}}> = ({show, l, r}) =>
  show <= 0 ? null : (
    <div style={{position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center", gap: 50, opacity: show}}>
      <MiniPanel ok={false} {...l} />
      <MiniPanel ok {...r} />
    </div>
  );

/* ── "Done with this link?" modal (world) ── */
export const MODAL: Rect = {x: 470, y: 360, w: 600, h: 330};
export const CODE_INPUT: Rect = {x: MODAL.x + 22, y: MODAL.y + 178, w: MODAL.w - 44, h: 48};
export const REMOVE_BTN: Rect = {x: MODAL.x + 22, y: MODAL.y + 256, w: 200, h: 48};

export const DoneModal: React.FC<{show: number; focus: number; typed: number; press: number}> = ({show, focus, typed, press}) => {
  if (show <= 0) return null;
  const r = (x: Rect): React.CSSProperties => ({position: "absolute", left: x.x - MODAL.x, top: x.y - MODAL.y, width: x.w, height: x.h});
  return (
    <div style={{position: "absolute", left: MODAL.x, top: MODAL.y, width: MODAL.w, height: MODAL.h, perspective: 900, opacity: Math.min(1, show * 1.5)}}>
      <div style={{
        position: "absolute", inset: 0, background: "#fff", borderRadius: 18, boxShadow: "0 30px 80px rgba(0,0,0,.5)", color: "#1c1c1a",
        transform: `rotateX(${(1 - show) * 22}deg) scale(${0.85 + 0.15 * show})`,
      }}>
        <div style={{position: "absolute", left: 22, top: 22, fontSize: 23, fontWeight: 800}}>Done with this link?</div>
        <X size={24} color="#555" style={{position: "absolute", right: 22, top: 22}} />
        <div style={{position: "absolute", left: 22, top: 66, width: MODAL.w - 44, fontSize: 16, lineHeight: 1.45, wordBreak: "break-all"}}>
          Sample User · {K.modalLink}
        </div>
        <div style={{position: "absolute", left: 22, top: 150, fontSize: 16, color: "#444"}}>Personal code</div>
        <div style={{
          ...r(CODE_INPUT), boxSizing: "border-box", borderRadius: 9, border: `2px solid ${focus > 0.5 ? "#3b82f6" : "#d1d5db"}`,
          boxShadow: `0 0 0 ${4 * focus}px rgba(59,130,246,.3), 0 0 ${20 * focus}px rgba(59,130,246,.4)`,
          display: "flex", alignItems: "center", padding: "0 14px", fontSize: 28, letterSpacing: 6, color: "#111",
        }}>
          {K.code.slice(0, typed)}
          {focus > 0.5 && <span style={{width: 2, height: 26, background: "#111", marginLeft: 2, opacity: Math.round(typed * 7) % 2 ? 1 : 0.2}} />}
        </div>
        <div style={{
          ...r(REMOVE_BTN), borderRadius: 9, background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${1 - 0.07 * press})`,
        }}><Check size={18} strokeWidth={3.5} />Done, remove it</div>
        <div style={{position: "absolute", left: 250, top: 270, fontSize: 18, color: "#444"}}>Cancel</div>
      </div>
    </div>
  );
};

/* ── video + grid dissolving into particles (world) ── */
const rnd = (i: number, k: number) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
export const Particles: React.FC<{p: number}> = ({p}) => {
  if (p <= 0 || p >= 1) return null;
  const cx = VIDEO3.x + VIDEO3.w / 2, cy = VIDEO3.y + VIDEO3.h / 2;
  return (
    <>
      {Array.from({length: 160}, (_, i) => {
        const x0 = VIDEO3.x + rnd(i, 1) * VIDEO3.w, y0 = VIDEO3.y + rnd(i, 2) * VIDEO3.h;
        const dx = (x0 - cx) * (0.4 + rnd(i, 3) * 0.6), dy = (y0 - cy) * 0.5 - 140 * rnd(i, 4);
        const e = 1 - Math.pow(1 - p, 2);
        const size = 4 + rnd(i, 5) * 9;
        return (
          <div key={i} style={{
            position: "absolute", left: x0 + dx * e, top: y0 + dy * e, width: size, height: size, borderRadius: rnd(i, 6) > 0.5 ? 2 : "50%",
            background: rnd(i, 7) > 0.6 ? "#93c5fd" : rnd(i, 7) > 0.3 ? "#fff" : "#c8a27c", opacity: (1 - p) * (0.6 + 0.4 * rnd(i, 8)),
            transform: `rotate(${p * 200 * (rnd(i, 9) - 0.5)}deg)`,
          }} />
        );
      })}
    </>
  );
};

/* ── "14 more waiting" → "13 more waiting" ── */
export const RollCounter: React.FC<{from: number; p: number}> = ({from, p}) => (
  <span style={{display: "inline-flex", alignItems: "center", gap: 5}}>
    <span style={{display: "inline-block", position: "relative", width: 22, height: 22, overflow: "hidden", verticalAlign: "bottom"}}>
      <span style={{position: "absolute", left: 0, top: -22 * p, color: p > 0.5 ? "#15803d" : undefined, fontWeight: 700}}>{from}</span>
      <span style={{position: "absolute", left: 0, top: 22 - 22 * p, color: "#15803d", fontWeight: 700}}>{from - 1}</span>
    </span>
    more waiting
  </span>
);

/* ── final recap: horizontal 3D carousel (screen space) ── */
const ICONS: Record<string, React.ReactNode> = {
  download: <Download size={54} color="#2563eb" />, scissors: <Scissors size={54} color="#2563eb" />, rec: <CircleDot size={54} color={RED} />,
  export: <FileDown size={54} color="#2563eb" />, upload: <UploadCloud size={54} color="#2563eb" />, done: <BadgeCheck size={54} color={GREEN} />,
};
export const Carousel: React.FC<{show: number; turn: number}> = ({show, turn}) => {
  if (show <= 0) return null;
  const n = K.recap.length, R = 560;
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: 1920, height: 1080, perspective: 1800, opacity: show}}>
      <div style={{position: "absolute", left: 960, top: 470, transformStyle: "preserve-3d", transform: `translateZ(${-R}px) rotateX(-6deg) rotateY(${-turn * (360 / n)}deg)`}}>
        {K.recap.map((c, i) => {
          const ang = (i * 360) / n;
          const rel = ((ang - turn * (360 / n)) % 360 + 540) % 360 - 180; // -180..180, 0 = front
          const front = Math.cos((rel * Math.PI) / 180);
          return (
            <div key={i} style={{
              position: "absolute", left: -150, top: -125, width: 300, height: 250, borderRadius: 24, background: "#fff", boxSizing: "border-box",
              transform: `rotateY(${ang}deg) translateZ(${R}px)`, opacity: 0.35 + 0.65 * Math.max(0, front), backfaceVisibility: "hidden",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
              boxShadow: `0 30px 60px rgba(0,0,0,.45), 0 0 0 ${front > 0.95 ? 4 : 0}px ${i === n - 1 ? GREEN : BLUE}`,
            }}>
              <div style={{position: "absolute", left: 18, top: 14, fontSize: 20, fontWeight: 800, color: "#9ca3af"}}>{i + 1}</div>
              {ICONS[c.icon]}
              <div style={{fontSize: 27, fontWeight: 800, color: "#111", textAlign: "center", padding: "0 16px"}}>{c.label}</div>
            </div>
          );
        })}
      </div>
      {/* step dots under the carousel */}
      <div style={{position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 14}}>
        {K.recap.map((c, i) => {
          const cur = Math.round(turn) % n === i;
          return <div key={i} style={{
            padding: "8px 16px", borderRadius: 999, fontSize: 18, fontWeight: 700, background: cur ? (i === n - 1 ? GREEN : BLUE) : "rgba(255,255,255,.12)",
            color: "#fff", whiteSpace: "nowrap",
          }}>{i + 1}. {c.label}</div>;
        })}
      </div>
    </div>
  );
};

export {FileChip};
