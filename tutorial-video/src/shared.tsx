// Pieces shared by every scene: font, camera, cursor, click ripple, lower-third caption.
import React from "react";
import {AbsoluteFill, Easing, interpolate, staticFile} from "remotion";
import {loadFont} from "@remotion/fonts";
import {CONFIG, sec} from "./config";
import {ease, window01} from "./anim";
import {C} from "./ui";

// Inter is bundled in public/fonts so rendering works offline
export const fontFamily = "Inter";
loadFont({family: fontFamily, url: staticFile("fonts/inter-latin-wght-normal.woff2"), weight: "100 900"});
export const monoFamily = "ui-monospace, 'DejaVu Sans Mono', Menlo, Consolas, monospace";

export const W = CONFIG.width, H = CONFIG.height;

/* ───────────── Camera ─────────────
   cx/cy = world point at the center of the frame, z = zoom, rx/ry = 3D tilt in degrees */
export type Cam = {cx: number; cy: number; z: number; rx: number; ry: number};
export const FULL_VIEW: Cam = {cx: 960, cy: 545, z: 1, rx: 0, ry: 0};

// The world is laid out SHARP times bigger and scaled back down by the camera,
// so text stays crisp when the camera zooms in (3D layers are rasterized at their own size).
const SHARP = 2.4;

export const World: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <AbsoluteFill style={{
    transformOrigin: "0 0",
    transform:
      `translate(${W / 2}px, ${H / 2}px) perspective(2600px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) ` +
      `scale(${cam.z / SHARP}) translate(${-cam.cx * SHARP}px, ${-cam.cy * SHARP}px)`,
  }}>
    <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, zoom: SHARP}}>{children}</div>
  </AbsoluteFill>
);

export const Backdrop: React.FC<{f: number}> = ({f}) => (
  <>
    <AbsoluteFill style={{background: "radial-gradient(ellipse at 30% 20%, #2b3b63 0%, #151b2e 45%, #0a0d16 100%)"}} />
    <AbsoluteFill style={{
      background: "radial-gradient(circle at 85% 90%, rgba(37,99,235,.28), rgba(37,99,235,0) 40%)",
      transform: `translate(${Math.sin(f / 60) * 20}px, ${Math.cos(f / 70) * 15}px)`,
    }} />
  </>
);

/* ───────────── Cursor + click ripple (world coordinates) ───────────── */
export type Pt = {x: number; y: number};

export const Cursor: React.FC<{p: Pt; pressed: number; opacity: number; scale?: number}> = ({p, pressed, opacity, scale = 1}) => (
  <div style={{
    position: "absolute", left: p.x, top: p.y, opacity, transformOrigin: "0 0",
    transform: `scale(${scale * (1 - 0.15 * pressed)})`, filter: "drop-shadow(0 3px 5px rgba(0,0,0,.35))",
  }}>
    <svg width={30} height={42} viewBox="0 0 20 28" style={{display: "block", marginLeft: -3, marginTop: -2}}>
      <path d="M2 2v20.5l5.2-5 3.4 8 3.6-1.6-3.4-7.8H18z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  </div>
);

export const Ripple: React.FC<{f: number; at: number; p: Pt; color?: string}> = ({f, at, p, color = C.accent}) => {
  const t = (f - sec(at)) / sec(0.6);
  if (t < 0 || t > 1) return null;
  const r = interpolate(t, [0, 1], [6, 58], {easing: Easing.out(Easing.cubic)});
  return (
    <div style={{
      position: "absolute", left: p.x - r, top: p.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%",
      border: `3px solid ${color}`, background: `${color}22`, opacity: 1 - t,
    }} />
  );
};

// Press amount (0..1) for a click at `at` seconds.
export const clickPress = (f: number, at: number) => ease(f, at - 0.1, 0.25) - ease(f, at + 0.08, 0.35);

/* ───────────── Lower-third caption (screen space) ───────────── */
export type CaptionSpec = {from: number; to: number; step: string | null; text: string; color?: string};

export const Caption: React.FC<{f: number; c: CaptionSpec}> = ({f, c}) => {
  const vis = window01(f, c.from, c.to);
  if (vis <= 0) return null;
  const enter = ease(f, c.from, 0.8);
  const color = c.color ?? C.accent;
  return (
    <div style={{
      position: "absolute", left: 110, bottom: 84, opacity: vis,
      transform: `translateY(${(1 - enter) * 40}px)`, display: "flex", alignItems: "stretch",
      background: "rgba(255,255,255,.94)", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
    }}>
      <div style={{width: 8, background: color, transformOrigin: "bottom", transform: `scaleY(${enter})`}} />
      <div style={{display: "flex", alignItems: "center", gap: 18, padding: "20px 30px 20px 24px"}}>
        {c.step && (
          <div style={{
            background: color, color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1,
            padding: "6px 14px", borderRadius: 9, textTransform: "uppercase",
          }}>{c.step}</div>
        )}
        <div style={{fontSize: 36, fontWeight: 600, color: C.text, letterSpacing: -0.3}}>{c.text}</div>
      </div>
    </div>
  );
};
