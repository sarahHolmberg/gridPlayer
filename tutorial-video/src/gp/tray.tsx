// "Your files" tray + file chips (world coordinates), shared by Scenes 4 and 5.
import React from "react";
import {Check, FileText, Film} from "lucide-react";
import {TRAY} from "./layout3";

export type FileKind = "transcript" | "video";
export const FILES: Record<FileKind, {name: string; sub: string; color: string}> = {
  transcript: {name: "transcript.txt", sub: "Text · 1 KB", color: "#2563eb"},
  video: {name: "trimmed_video.mp4", sub: "Video · 18 MB", color: "#7c3aed"},
};
export const CHIP = {w: 250, h: 62};
// chip slot centers inside the tray
export const SLOT = (i: number) => ({x: TRAY.x + 16 + CHIP.w / 2 + i * (CHIP.w + 12), y: TRAY.y + 30 + CHIP.h / 2});

export const FileChip: React.FC<{kind: FileKind; check?: number; style?: React.CSSProperties}> = ({kind, check = 0, style}) => {
  const f = FILES[kind];
  const Icon = kind === "transcript" ? FileText : Film;
  return (
    <div style={{
      width: CHIP.w, height: CHIP.h, borderRadius: 12, background: "#fff", boxSizing: "border-box", padding: "0 12px",
      display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 20px rgba(0,0,0,.3)", border: `2px solid ${check > 0.5 ? "#22c55e" : "transparent"}`,
      ...style,
    }}>
      <div style={{width: 38, height: 38, borderRadius: 9, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
        <Icon size={24} color={f.color} />
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontSize: 16, fontWeight: 700, color: "#111", whiteSpace: "nowrap"}}>{f.name}</div>
        <div style={{fontSize: 13, color: "#6b7280"}}>{f.sub}</div>
      </div>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${check})`, opacity: Math.min(1, check),
      }}>
        <Check size={17} color="#fff" strokeWidth={4} />
      </div>
    </div>
  );
};

export const Tray: React.FC<{show: number; items: {kind: FileKind; show: number; check: number; dim?: number}[]; glow?: number}> = ({show, items, glow = 0}) =>
  show <= 0 ? null : (
    <div style={{
      position: "absolute", left: TRAY.x, top: TRAY.y, width: TRAY.w, height: TRAY.h, opacity: show, transform: `translateY(${(1 - show) * 30}px)`,
      background: "rgba(9,13,24,.9)", borderRadius: 16, border: `${glow > 0.5 ? 2 : 1}px solid ${glow > 0.5 ? "#22c55e" : "rgba(255,255,255,.18)"}`,
      boxShadow: `0 16px 36px rgba(0,0,0,.5), 0 0 ${30 * glow}px rgba(34,197,94,${0.6 * glow})`, boxSizing: "border-box",
    }}>
      <div style={{position: "absolute", left: 16, top: 7, fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: "rgba(255,255,255,.65)"}}>YOUR FILES</div>
      {items.map((it, i) => {
        const c = SLOT(i);
        return it.show <= 0 ? (
          <div key={i} style={{position: "absolute", left: c.x - CHIP.w / 2, top: c.y - CHIP.h / 2, width: CHIP.w, height: CHIP.h, borderRadius: 12, border: "2px dashed rgba(255,255,255,.2)", boxSizing: "border-box"}} />
        ) : (
          <div key={i} style={{position: "absolute", left: c.x - CHIP.w / 2, top: c.y - CHIP.h / 2, opacity: it.show * (1 - 0.6 * (it.dim ?? 0))}}>
            <FileChip kind={it.kind} check={it.check} />
          </div>
        );
      }).map((el, i) => <div key={`w${i}`} style={{position: "absolute", left: -TRAY.x, top: -TRAY.y}}>{el}</div>)}
    </div>
  );

/** A chip flying from `from` to `to` (centers) as p goes 0 → 1, on a gentle arc. */
export const FlyingChip: React.FC<{kind: FileKind; from: {x: number; y: number}; to: {x: number; y: number}; p: number; check?: number}> = ({kind, from, to, p, check}) => {
  if (p <= 0 || p >= 1) return null;
  const x = from.x + (to.x - from.x) * p;
  const y = from.y + (to.y - from.y) * p - Math.sin(Math.PI * p) * 120;
  return (
    <div style={{position: "absolute", left: x - CHIP.w / 2, top: y - CHIP.h / 2, transform: `scale(${1 + 0.15 * Math.sin(Math.PI * p)}) rotate(${-4 * Math.sin(Math.PI * p)}deg)`}}>
      <FileChip kind={kind} check={check} style={{boxShadow: "0 20px 40px rgba(0,0,0,.45)"}} />
    </div>
  );
};
