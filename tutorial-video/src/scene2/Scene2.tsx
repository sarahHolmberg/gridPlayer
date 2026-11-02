import React from "react";
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame} from "remotion";
import {CONFIG, sec} from "../config";
import {CONFIG2 as K} from "./config2";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, C, IDLE_DOWNLOAD} from "../ui";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, World, clickPress, fontFamily} from "../shared";
import {BEATS, beatPulse, EV, OUT_V, SEGMENTS, videoAt} from "./timeline";
import {center, COUNT, CUBES, DECK, pad, PLAY_BTN, PROGRESS, Rect, TIMER_CARD, TRIM_BTN, TRIM_CARD, OUT_BTN, union, VIDEO} from "./layout2";
import {GridPlayerApp2} from "./App2";
import {VideoPlayer} from "./Player";
import {BeatDeck, CountDisplay, CubeStack, GREEN_D, Keycap, RED, Spotlight, VideoBadge} from "./overlays";
import {CheckIcon} from "../icons";

const fps = CONFIG.fps;
export const SCENE2_FRAMES = Math.round(EV.end * fps);
const TRIM_CLICK = EV.trim + 1.3;

/* ───────────── Camera ───────────── */
const BASE: Cam = {cx: 960, cy: 560, z: 0.9, rx: 0, ry: 0};
const camera = (f: number) =>
  track<Cam>(f, {cx: 960, cy: 570, z: 0.82, rx: 11, ry: -9}, [
    {at: 0, dur: 2.8, v: BASE},
    {at: EV.beat1 - 0.4, dur: 1.6, v: {cx: 760, cy: 700, z: 1.2, rx: 0, ry: 0}}, // counting: player + overlays
    {at: EV.fifth - 0.3, dur: 1.4, v: {cx: 1000, cy: 720, z: 1.32, rx: 0, ry: 0}}, // push in, Out button in view
    {at: EV.replay - 0.3, dur: 1.4, v: {cx: 760, cy: 740, z: 1.4, rx: 0, ry: 0}}, // replay
    {at: EV.trim, dur: 1.3, v: {cx: 1480, cy: 700, z: 1.6, rx: 0, ry: 0}}, // Trim & continue
    {at: EV.success + 0.2, dur: 1.6, v: BASE},
    {at: EV.fadeOut, dur: 2.5, v: {...BASE, z: 0.93}},
  ]);

/* ───────────── Cursor ───────────── */
const REST = {x: 1700, y: 890};
const cursorPos = (f: number) =>
  track<Pt>(f, {x: 980, y: 900}, [
    {at: 2.3, dur: 1.0, v: PLAY_BTN, arc: 0.1},
    {at: EV.play + 0.5, dur: 1.4, v: REST, arc: -0.08},
    {at: EV.out - 0.75, dur: 0.65, v: center(OUT_BTN), arc: 0.1},
    {at: EV.out + 0.6, dur: 1.0, v: REST, arc: 0.1},
    {at: EV.trim + 0.2, dur: 1.0, v: center(TRIM_BTN), arc: -0.1},
    {at: EV.success + 0.5, dur: 1.2, v: {x: 1740, y: 900}, arc: 0.1},
  ]);

/* ───────────── Spotlight phases ───────────── */
type Spot = {ax: number; ay: number; aw: number; ah: number; bx: number; by: number; bw: number; bh: number; amt: number};
const NONE = (a: Rect): Rect => ({x: a.x + a.w / 2, y: a.y + a.h / 2, w: 0, h: 0});
const spot = (a: Rect, b: Rect = NONE(a), amt = 1): Spot => ({ax: a.x, ay: a.y, aw: a.w, ah: a.h, bx: b.x, by: b.y, bw: b.w, bh: b.h, amt});
const R_PLAY: Rect = {x: VIDEO.x + 8, y: VIDEO.y + VIDEO.h - 74, w: 300, h: 68};
const R_DECK = pad(DECK, 6);
const R_COUNTDECK = pad(union(COUNT, DECK), 6);
const R_CUBES = pad(CUBES, 6);
const R_BAND = pad(union(union(COUNT, DECK), union(CUBES, {x: PROGRESS.x, y: PROGRESS.y - 22, w: PROGRESS.w, h: 44})), 6);
const spotlight = (f: number) =>
  track<Spot>(f, spot(R_PLAY, undefined, 0), [
    {at: 3.0, dur: 0.6, v: spot(R_PLAY)},
    {at: EV.play + 0.4, dur: 0.8, v: spot(R_DECK)},
    {at: EV.beat1 + 1.6, dur: 0.8, v: spot(R_COUNTDECK, R_CUBES)},
    {at: EV.out - 0.35, dur: 0.7, v: spot(R_BAND, pad(TRIM_CARD, 6))},
    {at: EV.replay - 0.3, dur: 0.8, v: spot(R_BAND)},
    {at: EV.trim, dur: 0.8, v: spot(pad(TRIM_BTN, 8))},
    {at: EV.success + 0.3, dur: 0.8, v: spot(pad(TRIM_BTN, 8), undefined, 0)},
  ]);

/* ───────────── Captions (text from config, times from the timeline) ───────────── */
const T = K.captions;
const CAPTIONS: CaptionSpec[] = [
  {from: 0.5, to: 3.1, step: null, text: T.intro},
  {from: 3.2, to: EV.beat1 - 0.05, step: null, text: T.listen},
  {from: EV.beat1, to: EV.beat1 + 1.7, step: null, text: T.start},
  {from: EV.beat1 + 1.8, to: EV.fifth - 0.1, step: null, text: T.count},
  {from: EV.fifth, to: EV.out - 0.05, step: null, text: T.fifth, color: RED},
  {from: EV.out, to: EV.replay - 0.1, step: null, text: T.out, color: RED},
  {from: EV.replay, to: EV.replayEnd - 0.05, step: null, text: T.replay},
  {from: EV.confirm, to: EV.trim - 0.05, step: null, text: T.confirm, color: GREEN_D},
  {from: EV.trim, to: EV.success - 0.05, step: null, text: T.trim},
  {from: EV.success, to: EV.end, step: null, text: T.success, color: GREEN_D},
];

// Merge back-to-back fast segments so the "2x" badge doesn't blink between 8s.
const FAST: {t0: number; t1: number; rate: number}[] = [];
for (const s of SEGMENTS) {
  if (s.replay || s.rate <= 1) continue;
  const last = FAST[FAST.length - 1];
  if (last && Math.abs(last.t1 - s.t0) < 1e-6 && last.rate === s.rate) last.t1 = s.t1;
  else FAST.push({t0: s.t0, t1: s.t1, rate: s.rate});
}

const bounce = (f: number, atSec: number) =>
  spring({frame: f - sec(atSec), fps, config: {damping: 9, stiffness: 170, mass: 0.8}});

const StepIndicator: React.FC<{show: number}> = ({show}) => (
  <div style={{
    position: "absolute", left: 40, top: 22, opacity: show, transform: `translateY(${(1 - show) * -20}px)`,
    display: "flex", alignItems: "center", gap: 14, background: "rgba(9,13,24,.88)", borderRadius: 14,
    padding: "10px 20px 10px 12px", boxShadow: "0 10px 30px rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.12)",
  }}>
    <div style={{background: C.accent, color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 1, padding: "5px 12px", borderRadius: 8}}>
      STEP {K.stepIndicator.step} OF {K.stepIndicator.total}
    </div>
    <div style={{color: "#fff", fontSize: 24, fontWeight: 700}}>{K.stepIndicator.title}</div>
  </div>
);

const BeatAudio: React.FC = () => (
  <>
    {BEATS.map((b, i) => (
      <Sequence key={i} from={Math.round(b.t * fps)} durationInFrames={Math.round(0.6 * fps)} layout="none">
        <Audio
          src={staticFile(b.k % 8 === 0 ? K.audio.accent : K.audio.kick)}
          playbackRate={b.replay ? K.audio.replayRate : 1}
          volume={b.replay ? 0.8 : 1}
        />
      </Sequence>
    ))}
  </>
);

export const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const cam = camera(f);
  const vid = videoAt(t);
  const v = vid.v;
  const pulse = t >= EV.beat1 ? beatPulse(t) : 0;

  const fade =
    interpolate(t, [0, K.fadeIn], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [EV.fadeOut, EV.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const confirmT = interpolate(t, [EV.confirm, EV.confirm + 1.2], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const confirmed = t >= EV.confirm ? 1 : 0;
  const outDrop = t >= EV.out ? bounce(f, EV.out) : 0;
  const outPulse = t >= EV.out ? Math.exp(-(t - EV.out) * 2.5) + (t >= EV.confirm ? Math.exp(-(t - EV.confirm) * 2.5) : 0) : 0;
  const listen = Math.max(window01(f, EV.play + 0.2, EV.out), window01(f, EV.replay, EV.replayEnd));

  const s = spotlight(f);
  const cur = cursorPos(f);
  const press = Math.max(clickPress(f, EV.play), clickPress(f, EV.out), clickPress(f, TRIM_CLICK));

  const fast = FAST.reduce((m, s2) => Math.max(m, window01(f, s2.t0 - 0.05, s2.t1 + 0.1, 0.25, 0.25)), 0);
  const BADGE = {x: COUNT.x + COUNT.w / 2, y: COUNT.y - 70};
  const KEY = {x: center(TRIM_BTN).x, y: TIMER_CARD.y + TIMER_CARD.h / 2};

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: C.text}}>
      <BeatAudio />
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Spotlight amount={s.amt} holes={[{x: s.ax, y: s.ay, w: s.aw, h: s.ah}, {x: s.bx, y: s.by, w: s.bw, h: s.bh}]}>
            <>
          <BrowserWindow download={IDLE_DOWNLOAD} tabTitle={`${K.content.fileName} - Grid Player`}>
            <GridPlayerApp2
              s={{v, outPress: clickPress(f, EV.out), outSet: t >= EV.out ? 1 : 0, trimPress: clickPress(f, TRIM_CLICK), trimDone: t >= TRIM_CLICK + 0.15 ? 1 : 0}}
              video={<VideoPlayer v={v} playing={vid.playing} playPress={clickPress(f, EV.play)} outMarker={outDrop} outPulse={outPulse} />}
            />
          </BrowserWindow>

          {/* beat overlays */}
          <CountDisplay v={v} show={t >= EV.beat1 - 0.1 ? pop(f, EV.beat1 - 0.1) : 0} pulse={pulse} outSet={t >= EV.out ? 1 : 0} confirm={confirmed} />
          <CubeStack
            v={v} t={t} show={ease(f, EV.beat1 - 0.3, 0.7)} pulse={pulse} outSet={t >= EV.out ? 1 : 0} confirm={confirmed}
            drops={EV.eightStarts.map((s0) => (t >= s0 - 0.2 ? bounce(f, s0 - 0.2) : 0))}
            fifthDrop={t >= EV.fifth - 0.2 ? bounce(f, EV.fifth - 0.2) : 0}
          />
          <BeatDeck s={{
            v, slide: ease(f, EV.play + 0.15, 0.9), listen, pulse,
            beat1Flash: t >= EV.beat1 ? Math.exp(-(t - EV.beat1) * 3) : 0,
            flag: t >= EV.beat1 ? pop(f, EV.beat1) : 0,
            fifth: ease(f, EV.fifth - 0.3, 0.6), outDrop, outPulse, confirm: t >= EV.confirm ? confirmT : 0,
          }} />

          <VideoBadge show={fast} x={BADGE.x} y={BADGE.y}>⏩ {FAST[0]?.rate ?? 2}x <span style={{fontSize: 18, fontWeight: 600, opacity: 0.75}}>counts stay the same</span></VideoBadge>
          <VideoBadge show={window01(f, EV.replay - 0.1, EV.replayEnd + 0.5)} x={BADGE.x} y={BADGE.y}>⟲ Replay · {K.replaySpeed}x</VideoBadge>
          <VideoBadge show={window01(f, TRIM_CLICK + 0.2, EV.end)} x={BADGE.x} y={BADGE.y} color={GREEN_D}>
            <CheckIcon size={26} /> Out at {OUT_V.toFixed(3)} s · on the {K.outCount}
          </VideoBadge>

            </>
          </Spotlight>

          {/* keyboard shortcuts, shown above the spotlight */}
          <Keycap label="O" x={KEY.x} y={KEY.y} color={RED} show={t >= EV.out - 0.2 ? pop(f, EV.out - 0.2) - ease(f, EV.replay - 0.7, 0.5) : 0} press={clickPress(f, EV.out)} />
          <Keycap label="Enter" w={170} x={KEY.x} y={KEY.y} color={C.accent} show={t >= TRIM_CLICK - 0.5 ? pop(f, TRIM_CLICK - 0.5) - ease(f, EV.success + 0.2, 0.5) : 0} press={clickPress(f, TRIM_CLICK)} />

          <Ripple f={f} at={EV.play} p={PLAY_BTN} />
          <Ripple f={f} at={EV.out} p={center(OUT_BTN)} color={RED} />
          <Ripple f={f} at={TRIM_CLICK} p={center(TRIM_BTN)} />
          <Cursor p={cur} pressed={press} opacity={Math.max(0, ease(f, 2.2, 0.6) - ease(f, EV.fadeOut, 1))} />
        </World>

        <StepIndicator show={ease(f, 0.4, 0.8)} />
        {CAPTIONS.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
