// Step 2: trim on the beat (new way): K on beat 1, tap B to the tempo, go to Bar 5 · Beat 3, Out, Trim & continue.
import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {CONFIG} from "../config";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, IDLE_DOWNLOAD} from "../ui";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily} from "../shared";
import {Keycap} from "../scene2/overlays";
import {pad} from "../scene2/layout2";
import {Spotlight} from "../scene2/overlays";
import {BEAT, GO_BTN, GridPlayer4, Grid, KB, MUSIC, OUT_BTN, PLAY, POS, STRIP, TAPB, TRUE_BPM, VKey, VIDEO, beatV, vAt} from "./GridApp4";

const fps = CONFIG.fps;
export const TRIM = {
  step: {step: 2, total: 4, title: "Trim on the beat"},
  // scene times (s)
  play1: 1.6, pause1: 5.3, back: [5.9, 7.0], k: 7.7, play2: 9.2, taps: 8, tapStart: 9.6,
  pause2: 17.0, toEnd: [17.6, 19.4], out: 20.4, go: 22.6, recap: 24.6, end: 31.0,
  endBar: 5, endBeat: 3,
  captions: [
    {from: 0.4, to: 4.0, text: "Play the video and watch for the start"},
    {from: 4.0, to: 7.5, text: "Music and dance start: that is beat 1"},
    {from: 7.5, to: 9.1, text: "Press K (Beat 1 here) right on it"},
    {from: 9.2, to: 13.9, text: "Play, and tap B along with the beat"},
    {from: 14.0, to: 17.4, text: "Now the grid matches the music"},
    {from: 17.5, to: 20.2, text: "Go to Bar 5 · Beat 3"},
    {from: 20.3, to: 22.4, text: "Press O (Out) right there"},
    {from: 22.5, to: 24.5, text: "Then Trim & continue"},
    {from: 24.6, to: 31.0, text: "Every video ends at Bar 5 · Beat 3", color: "#15803d"},
  ],
};
const T = TRIM;
export const TRIM_FRAMES = Math.round(T.end * fps);
const OUT_V = beatV((T.endBar - 1) * 4 + (T.endBeat - 1));
const TAPS = Array.from({length: T.taps}, (_, i) => T.tapStart + i * BEAT);
const center = (r: {x: number; y: number; w: number; h: number}) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

const KEYS: VKey[] = [
  {t: 0, v: 0, mode: "hold"},
  {t: T.play1, v: 0, mode: "play"},
  {t: T.pause1, v: T.pause1 - T.play1, mode: "hold"},
  {t: T.back[0], v: T.pause1 - T.play1, mode: "scrub"},
  {t: T.back[1], v: MUSIC, mode: "hold"},
  {t: T.play2, v: MUSIC, mode: "play"},
  {t: T.pause2, v: MUSIC + (T.pause2 - T.play2), mode: "hold"},
  {t: T.toEnd[0], v: MUSIC + (T.pause2 - T.play2), mode: "scrub"},
  {t: T.toEnd[1], v: OUT_V, mode: "hold"},
];

export const TrimScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade = interpolate(t, [0, 0.8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) * interpolate(t, [T.end - 1, T.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const vid = vAt(t, KEYS);

  // the beat grid: default (beat 1 at 0, 120 BPM) → K moves beat 1 → taps move the BPM to the music's
  const tapsDone = TAPS.filter((x) => t >= x).length;
  const bpm = tapsDone < 4 ? 120 : tapsDone < T.taps ? 120 + (TRUE_BPM - 120) * Math.min(1, (tapsDone - 3) / (T.taps - 3)) + 0.4 * (T.taps - tapsDone) / T.taps : TRUE_BPM;
  const grid: Grid = {beat1: t >= T.k ? MUSIC : 0, bpm: Math.round(bpm * 10) / 10};

  const cam = track<Cam>(f, {cx: 960, cy: 570, z: 0.84, rx: 9, ry: -8}, [
    {at: 0, dur: 2.2, v: {cx: 960, cy: 560, z: 0.92, rx: 0, ry: 0}},
    {at: 3.6, dur: 1.4, v: {cx: 760, cy: 700, z: 1.25, rx: 0, ry: 0}}, // video + timeline
    {at: T.k - 0.6, dur: 1.2, v: {cx: 620, cy: 860, z: 1.6, rx: 0, ry: 0}}, // timeline + bar
    {at: T.tapStart + 3, dur: 1.4, v: {cx: 760, cy: 820, z: 1.3, rx: 0, ry: 0}},
    {at: T.toEnd[0] - 0.4, dur: 1.2, v: {cx: 600, cy: 880, z: 1.6, rx: 0, ry: 0}},
    {at: T.out - 0.6, dur: 1.3, v: {cx: 1180, cy: 780, z: 1.2, rx: 0, ry: 0}}, // Out button + timeline
    {at: T.recap - 0.3, dur: 1.2, v: {cx: 960, cy: 560, z: 0.92, rx: 0, ry: 0}},
  ]);

  const cursorKeys = [
    {at: 0.6, dur: 0.8, v: PLAY, arc: 0.1},
    {at: T.pause1 - 0.7, dur: 0.5, v: PLAY},
    {at: T.play2 - 0.7, dur: 0.5, v: PLAY},
    {at: T.pause2 - 0.7, dur: 0.5, v: PLAY},
    {at: T.out - 1.0, dur: 0.8, v: center(OUT_BTN), arc: 0.1},
    {at: T.go - 0.9, dur: 0.7, v: center(GO_BTN), arc: 0.1},
    {at: T.go + 0.6, dur: 1, v: {x: 1700, y: 990}},
  ];
  const clicks = [T.play1, T.pause1, T.play2, T.pause2, T.out, T.go];
  const press = Math.max(...clicks.map((c) => clickPress(f, c)));
  const bPress = Math.max(0, ...TAPS.map((x) => clickPress(f, x)));

  type Spot = {x: number; y: number; w: number; h: number; amt: number};
  const sp = (r: {x: number; y: number; w: number; h: number}, amt = 1): Spot => ({...r, amt});
  const R_VIDEO = pad(VIDEO, 2), R_STRIP = pad({x: STRIP.x, y: STRIP.y, w: STRIP.w, h: STRIP.h + 42}, 4);
  const s = track<Spot>(f, sp(R_VIDEO, 0), [
    {at: 3.8, dur: 0.6, v: sp(pad({...VIDEO, h: VIDEO.h + STRIP.h}, 2))},
    {at: T.k - 0.5, dur: 0.5, v: sp(R_STRIP)},
    {at: T.out - 0.6, dur: 0.5, v: sp(pad({x: STRIP.x, y: OUT_BTN.y - 20, w: OUT_BTN.x + OUT_BTN.w + 30 - STRIP.x, h: STRIP.y + STRIP.h + 44 - OUT_BTN.y + 20}, 0), 0)},
    {at: T.recap, dur: 0.5, v: sp({x: 960, y: 540, w: 0, h: 0})},
  ]);

  const startHi = window01(f, 4.0, 7.4, 0.3, 0.3);
  const outP = t >= T.out ? pop(f, T.out) : 0;
  const caps: CaptionSpec[] = T.captions.map((c) => ({...c, step: null}));

  return (
    <AbsoluteFill style={{background: "#000", fontFamily}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Spotlight amount={s.amt} holes={[{x: s.x, y: s.y, w: s.w, h: s.h}]}>
            <BrowserWindow download={IDLE_DOWNLOAD} tabTitle="sample_dance.mp4 - Grid Player">
              <GridPlayer4
                title="sample_dance.mp4 - Grid Player" grid={grid} out={t >= T.out ? OUT_V : null} outP={outP}
                video={{v: vid.v, playing: vid.playing, playPress: press, moves: [], grid: ease(f, T.go + 0.1, 0.6),
                  overlay: startHi > 0 ? (
                    <div style={{position: "absolute", left: "50%", top: 30, transform: `translateX(-50%) scale(${0.9 + 0.1 * startHi})`, opacity: startHi, background: "#2563eb", color: "#fff", borderRadius: 999, padding: "10px 22px", fontSize: 26, fontWeight: 800, whiteSpace: "nowrap"}}>
                      ♪ Music + dance start = beat 1
                    </div>
                  ) : null}}
                taps={tapsDone} kPress={clickPress(f, T.k)} bPress={bPress} posHi={Math.max(window01(f, T.k, T.k + 1.4, 0.2, 0.3), window01(f, T.toEnd[0], T.out + 0.6, 0.3, 0.3))}
                clock={vid.v} side={t < T.go + 0.2 ? {mode: "trim", outOn: t >= T.out ? 1 : 0, info: t >= T.out ? `0.000 → ${OUT_V.toFixed(3)} (${OUT_V.toFixed(3)} s)` : "", goPress: clickPress(f, T.go)}
                  : {mode: "record", recOn: false, recTime: 0, recPress: 0, namePress: 0, audioPress: 0}}
                status={t < T.go ? "Trim: In 0.000 · Out —" : "Ready to record"}
              />
            </BrowserWindow>
          </Spotlight>
          <Keycap label="K" x={KB.x + KB.w / 2} y={KB.y - 80} color="#2563eb" show={window01(f, T.k - 0.4, T.k + 1.2, 0.25, 0.3)} press={clickPress(f, T.k)} />
          <Keycap label="B" x={TAPB.x + TAPB.w / 2} y={TAPB.y - 80} color="#2563eb" show={window01(f, T.tapStart - 0.4, TAPS[TAPS.length - 1] + 0.6, 0.25, 0.3)} press={bPress} />
          <Keycap label="O" x={OUT_BTN.x + OUT_BTN.w / 2} y={OUT_BTN.y - 80} color="#ef4444" show={window01(f, T.out - 0.4, T.out + 1.2, 0.25, 0.3)} press={clickPress(f, T.out)} />
          {/* beat counter while tapping */}
          {t >= T.tapStart && t < TAPS[TAPS.length - 1] + 1.0 && (
            <div style={{position: "absolute", left: POS.x + 20, top: STRIP.y - 70, display: "flex", gap: 10, opacity: window01(f, T.tapStart, TAPS[TAPS.length - 1] + 1.0, 0.2, 0.3)}}>
              {TAPS.map((x, i) => (
                <div key={i} style={{width: 34, height: 34, borderRadius: "50%", background: t >= x ? "#2563eb" : "rgba(255,255,255,.2)", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transform: `scale(${t >= x ? 1 + 0.3 * Math.exp(-(t - x) * 6) : 1})`}}>{(i % 4) + 1}</div>
              ))}
            </div>
          )}
          {clicks.map((c, i) => <Ripple key={i} f={f} at={c} p={i < 4 ? PLAY : i === 4 ? center(OUT_BTN) : center(GO_BTN)} />)}
          <Cursor p={track<Pt>(f, {x: 900, y: 900}, cursorKeys)} pressed={press} opacity={Math.max(0, ease(f, 0.4, 0.5) - ease(f, T.recap, 0.4))} />
        </World>
        {t >= T.recap && (
          <AbsoluteFill style={{background: `rgba(5,8,15,${0.8 * ease(f, T.recap, 0.6)})`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18}}>
            {[["1", "Find where music + dance start"], ["K", "Beat 1 here"], ["B", "Tap along with the beat"], ["⟶", "Go to Bar 5 · Beat 3"], ["O", "Out, then Trim & continue"]].map(([k, l], i) => {
              const p = Math.min(1, Math.max(0, (t - T.recap - 0.3 - i * 0.25) / 0.35));
              return (
                <div key={i} style={{width: 250, height: 210, background: "#fff", borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textAlign: "center", padding: 14, boxSizing: "border-box"}}>
                  <div style={{width: 70, height: 70, borderRadius: 16, background: i === 4 ? "#ef4444" : "#2563eb", color: "#fff", fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center"}}>{k}</div>
                  <div style={{fontSize: 24, fontWeight: 800, color: "#111", lineHeight: 1.2}}>{l}</div>
                </div>
              );
            })}
          </AbsoluteFill>
        )}
        <StepIndicator show={ease(f, 0.3, 0.8) - ease(f, T.recap, 0.4)} step={T.step.step} total={T.step.total} title={T.step.title} />
        {caps.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
