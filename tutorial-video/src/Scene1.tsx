import React from "react";
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from "remotion";
import {loadFont} from "@remotion/fonts";
import {CONFIG, sec} from "./config";
import {ease, pop, track, window01} from "./anim";
import {DOWNLOAD, LINK_POINT, STAGE_CENTER, TOAST, TOAST_FILE} from "./layout";
import {BrowserWindow, C, DownloadState, DownloadToast, DropState, GridPlayerApp} from "./ui";
import {VideoFileIcon} from "./icons";

// Inter is bundled in public/fonts so rendering works offline
const fontFamily = "Inter";
loadFont({family: fontFamily, url: staticFile("fonts/inter-latin-wght-normal.woff2"), weight: "100 900"});

const T = CONFIG.timing;
const W = CONFIG.width, H = CONFIG.height;
// The world is laid out SHARP times bigger and scaled back down by the camera,
// so text stays crisp when the camera zooms in (3D layers are rasterized at their own size).
const SHARP = 2.4;

/* ───────────── Camera ─────────────
   cx/cy = world point at the center of the frame, z = zoom, rx/ry = 3D tilt in degrees */
type Cam = {cx: number; cy: number; z: number; rx: number; ry: number};
const camera = (f: number): Cam =>
  track<Cam>(f, {cx: 960, cy: 570, z: 0.9, rx: 12, ry: -9}, [
    {at: T.pushIn, dur: 2.4, v: {cx: 960, cy: 545, z: 1.0, rx: 4, ry: -3}},
    {at: T.cameraToSidebar, dur: 2.2, v: {cx: 1560, cy: 410, z: 1.85, rx: 2, ry: -5}},
    {at: T.cameraToDownload, dur: 1.8, v: {cx: 1640, cy: 190, z: 2.35, rx: 3, ry: -3}},
    {at: T.cameraToFull, dur: 1.8, v: {cx: 960, cy: 545, z: 1.0, rx: 2, ry: 2}},
    {at: T.drop + 0.2, dur: 3, v: {cx: 960, cy: 545, z: 1.04, rx: 1, ry: 1}},
  ]);

/* ───────────── Cursor (world coordinates) ───────────── */
type Pt = {x: number; y: number};
const cursorPos = (f: number): Pt =>
  track<Pt>(f, {x: 1180, y: 780}, [
    {at: T.cursorToLink, dur: 1.6, v: LINK_POINT, arc: 0.12},
    {at: T.cursorToDownload, dur: 1.5, v: {x: DOWNLOAD.x - 78, y: DOWNLOAD.y + 6}, arc: -0.15},
    {at: T.cursorToFile, dur: 0.9, v: TOAST_FILE, arc: 0.1},
    {at: T.drag, dur: 1.6, v: STAGE_CENTER, arc: -0.12},
    {at: T.drop + 0.4, dur: 1.2, v: {x: STAGE_CENTER.x + 150, y: STAGE_CENTER.y + 130}, arc: 0.1},
  ]);

const Cursor: React.FC<{p: Pt; pressed: number; opacity: number; scale: number}> = ({p, pressed, opacity, scale}) => (
  <div style={{
    position: "absolute", left: p.x, top: p.y, opacity, transformOrigin: "0 0",
    transform: `scale(${scale * (1 - 0.15 * pressed)})`, filter: "drop-shadow(0 3px 5px rgba(0,0,0,.35))",
  }}>
    <svg width={30} height={42} viewBox="0 0 20 28" style={{display: "block", marginLeft: -3, marginTop: -2}}>
      <path d="M2 2v20.5l5.2-5 3.4 8 3.6-1.6-3.4-7.8H18z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  </div>
);

const Ripple: React.FC<{f: number; at: number; p: Pt; color?: string}> = ({f, at, p, color = C.accent}) => {
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

/* ───────────── Lower-third caption (screen space) ───────────── */
const Caption: React.FC<{f: number; c: (typeof CONFIG.captions)[number]}> = ({f, c}) => {
  const vis = window01(f, c.from, c.to);
  if (vis <= 0) return null;
  const enter = ease(f, c.from, 0.8);
  return (
    <div style={{
      position: "absolute", left: 110, bottom: 84, opacity: vis,
      transform: `translateY(${(1 - enter) * 40}px)`, display: "flex", alignItems: "stretch",
      background: "rgba(255,255,255,.94)", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
    }}>
      <div style={{width: 8, background: C.accent, transformOrigin: "bottom", transform: `scaleY(${enter})`}} />
      <div style={{display: "flex", alignItems: "center", gap: 18, padding: "20px 30px 20px 24px"}}>
        {c.step && (
          <div style={{
            background: C.accent, color: "#fff", fontWeight: 700, fontSize: 22, letterSpacing: 1,
            padding: "6px 14px", borderRadius: 9, textTransform: "uppercase",
          }}>{c.step}</div>
        )}
        <div style={{fontSize: 36, fontWeight: 600, color: C.text, letterSpacing: -0.3}}>
          {c.text}
        </div>
      </div>
    </div>
  );
};

export const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);

  // global fade in/out
  const fade =
    interpolate(f, [sec(T.fadeIn[0]), sec(T.fadeIn[1])], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(f, [sec(T.fadeOut[0]), sec(T.fadeOut[1])], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad)});

  // Step 1: link highlight + click
  const highlight = ease(f, T.linkHighlight, 0.8) - ease(f, T.cameraToDownload + 0.6, 0.8);
  const clickPress = (at: number) => ease(f, at - 0.1, 0.25) - ease(f, at + 0.08, 0.35);
  const press = clickPress(T.click);

  // Download progress
  const prog = interpolate(f, [sec(T.progress[0]), sec(T.progress[1])], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.35, 0.1, 0.4, 1),
  });
  const done = ease(f, T.complete, 0.4);
  const glowT = (f - sec(T.complete)) / sec(1.6);
  const download: DownloadState = {
    progress: prog,
    ringOpacity: ease(f, T.progress[0] - 0.3, 0.5) - ease(f, T.complete + 1.2, 0.6),
    done,
    glow: glowT > 0 && glowT < 1 ? Math.sin(Math.PI * glowT) * (0.75 + 0.25 * Math.sin(glowT * 18)) : 0,
    shine: interpolate(f, [sec(T.complete + 0.1), sec(T.complete + 0.7)], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
    scale: 1 + 0.22 * (pop(f, T.complete) - ease(f, T.complete + 0.35, 0.6)),
    arrowBob: f > sec(T.progress[0]) && f < sec(T.progress[1]) ? Math.sin(f / 4) * 2 : 0,
  };

  // Toast
  const toastIn = pop(f, T.toast);
  const toastOut = ease(f, T.drag + 0.6, 0.6);
  const dragging = ease(f, T.grab, 0.3);

  // Cursor
  const cur = cursorPos(f);
  const grabbed = ease(f, T.grab - 0.05, 0.2) - ease(f, T.drop, 0.25);
  const pressed = Math.max(press, grabbed);
  const cursorOpacity = ease(f, T.cursorAppear, 0.6) - ease(f, T.fadeOut[0] + 0.5, 1);

  // Drop target
  const drop: DropState = {
    hover: ease(f, T.dropHover, 0.6) - ease(f, T.drop + 0.1, 0.5),
    flash: (() => {
      const t = (f - sec(T.drop)) / sec(0.7);
      return t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
    })(),
    loaded: ease(f, T.drop + 0.15, 0.7),
  };

  // Ghost file following the cursor
  const ghostVis = f >= sec(T.grab) && f < sec(T.drop + 0.5);
  const ghostLift = pop(f, T.grab);
  const ghostSink = ease(f, T.drop, 0.4);

  const worldTransform =
    `translate(${W / 2}px, ${H / 2}px) perspective(2600px) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) ` +
    `scale(${cam.z / SHARP}) translate(${-cam.cx * SHARP}px, ${-cam.cy * SHARP}px)`;

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: C.text}}>
      <AbsoluteFill style={{opacity: fade}}>
        {/* backdrop */}
        <AbsoluteFill style={{background: "radial-gradient(ellipse at 30% 20%, #2b3b63 0%, #151b2e 45%, #0a0d16 100%)"}} />
        <AbsoluteFill style={{
          background: "radial-gradient(circle at 85% 90%, rgba(37,99,235,.28), rgba(37,99,235,0) 40%)",
          transform: `translate(${Math.sin(f / 60) * 20}px, ${Math.cos(f / 70) * 15}px)`,
        }} />

        {/* the camera-moved world */}
        <AbsoluteFill style={{transformOrigin: "0 0", transform: worldTransform}}>
          <div style={{position: "absolute", left: 0, top: 0, width: W, height: H, zoom: SHARP}}>
          <BrowserWindow download={download}>
            <GridPlayerApp highlight={Math.max(0, highlight)} press={press} drop={drop} />
          </BrowserWindow>

          {/* toast under the download icon */}
          <div style={{
            position: "absolute", left: TOAST.x, top: TOAST.y, transformOrigin: "85% 0",
            opacity: Math.min(1, toastIn) * (1 - toastOut),
            transform: `translateY(${(1 - toastIn) * -16 - toastOut * 10}px) scale(${0.9 + 0.1 * toastIn})`,
          }}>
            <DownloadToast dragging={dragging} />
          </div>

          <Ripple f={f} at={T.click} p={LINK_POINT} />
          <Ripple f={f} at={T.drop} p={STAGE_CENTER} color="#60a5fa" />

          {ghostVis && (
            <div style={{
              position: "absolute", left: cur.x - 26, top: cur.y - 24,
              transform: `scale(${(1 + 0.25 * ghostLift) * (1 - 0.7 * ghostSink)}) rotate(${-6 * ghostLift * (1 - ghostSink)}deg)`,
              opacity: 1 - ghostSink, filter: `drop-shadow(0 ${10 * ghostLift}px ${14 * ghostLift}px rgba(0,0,0,.45))`,
            }}>
              <VideoFileIcon size={54} />
            </div>
          )}

          <Cursor p={cur} pressed={pressed} opacity={Math.max(0, cursorOpacity)} scale={1} />
          </div>
        </AbsoluteFill>

        {/* captions sit on top of everything, unaffected by the camera */}
        {CONFIG.captions.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
