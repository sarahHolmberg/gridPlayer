import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {CONFIG, sec} from "../config";
import {CONFIG3 as K} from "./config3";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, C, IDLE_DOWNLOAD} from "../ui";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily} from "../shared";
import {Spotlight} from "../scene2/overlays";
import {pad, union, Rect} from "../scene2/layout2";
import {GridPlayerApp3, IDLE_REC, RecState} from "../gp/GridApp3";
import {cellRect, MIC, PLAY3, PROGRESS3, REC_BTN, REC_CARD, RHYTHM, STRIP, VIDEO3} from "../gp/layout3";
import {ACTIONS, EV3, video3At} from "./timeline3";
import {
  CellPop, EndZoneCallout, MicWidget, PauseFlash, PeakThumbs, RecapRow, RecBadge, RED, RhythmRow, RuleStrip, TipCard, GREEN_D,
} from "./overlays3";

const fps = CONFIG.fps;
export const SCENE3_FRAMES = Math.round(EV3.end * fps);
const A0 = ACTIONS[0];
const MOVES = K.actions;
const BASE: Cam = {cx: 960, cy: 560, z: 0.9, rx: 0, ry: 0};
const END_X = PROGRESS3.x + PROGRESS3.w; // right end of the progress bar
const END_Y = PROGRESS3.y + 6;
const center = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

/* ── camera ── */
const c0 = center(cellRect(A0.cell));
const camera = (f: number) =>
  track<Cam>(f, {cx: 960, cy: 575, z: 0.82, rx: 10, ry: -8}, [
    {at: 0, dur: 2.4, v: BASE},
    {at: A0.pause - 0.3, dur: 1.2, v: {cx: 760, cy: 500, z: 1.25, rx: 0, ry: 0}},
    {at: A0.click, dur: 1.0, v: {cx: Math.max(680, c0.x + 160), cy: Math.max(380, c0.y + 40), z: 1.45, rx: 0, ry: 0}},
    {at: A0.resume, dur: 1.0, v: {cx: 760, cy: 520, z: 1.2, rx: 0, ry: 0}},
    {at: EV3.rule, dur: 1.2, v: {cx: 860, cy: 860, z: 1.5, rx: 0, ry: 0}},
    {at: EV3.tip, dur: 1.2, v: BASE},
    {at: EV3.endZone, dur: 1.3, v: {cx: END_X - 260, cy: END_Y - 60, z: 1.8, rx: 0, ry: 0}},
    {at: EV3.recap - 0.2, dur: 1.2, v: BASE},
  ]);

/* ── cursor ── */
const REST = {x: 1700, y: 1000};
const cursorKeys = (() => {
  const keys: {at: number; dur: number; v: Pt; arc?: number}[] = [
    {at: 1.1, dur: 0.8, v: REC_BTN, arc: 0.1},
    {at: K.playClick - 0.9, dur: 0.8, v: PLAY3, arc: -0.1},
    {at: K.playClick + 0.4, dur: 0.9, v: {x: PLAY3.x + 60, y: PLAY3.y + 120}, arc: 0.1},
  ];
  ACTIONS.forEach((a, i) => {
    const c = center(cellRect(a.cell));
    keys.push({at: a.clickAt - (a.slow ? 0.9 : 0.55), dur: a.slow ? 0.8 : 0.5, v: c, arc: 0.1});
    if (i < ACTIONS.length - 1) {
      keys.push({at: a.resume, dur: a.slow ? 0.8 : 0.5, v: PLAY3, arc: -0.1});
      keys.push({at: a.end + 0.2, dur: 0.6, v: {x: PLAY3.x + 60, y: PLAY3.y + 120}});
    }
  });
  keys.push({at: EV3.rule, dur: 1.0, v: REST});
  return keys;
})();
const RESUME_CLICKS = ACTIONS.slice(0, -1).map((a) => a.end - 0.05);

/* ── spotlight ── */
const NONE = (a: Rect): Rect => ({x: a.x + a.w / 2, y: a.y + a.h / 2, w: 0, h: 0});
type Spot = {ax: number; ay: number; aw: number; ah: number; bx: number; by: number; bw: number; bh: number; amt: number};
const spot = (a: Rect, b: Rect = NONE(a), amt = 1): Spot => ({ax: a.x, ay: a.y, aw: a.w, ah: a.h, bx: b.x, by: b.y, bw: b.w, bh: b.h, amt});
const R_REC = pad({x: REC_CARD.x, y: REC_CARD.y + 30, w: REC_CARD.w, h: 80}, 4);
const R_MIC = pad(union(MIC, {x: MIC.x, y: MIC.y - 80, w: 420, h: 80}), 8);
const R_VIDEO = pad(VIDEO3, 2);
const R_PLAY = {x: VIDEO3.x + 6, y: VIDEO3.y + VIDEO3.h - 58, w: 190, h: 54};
const cellSpot = (cell: string) => pad(union(cellRect(cell), {x: cellRect(cell).x - 140, y: cellRect(cell).y - 60, w: 340, h: 50}), 10);
const R_ENDZONE: Rect = {x: END_X - 420, y: END_Y - 70, w: 450, h: 100};
const spotKeys = (() => {
  const k: {at: number; dur: number; v: Spot}[] = [
    {at: K.recClick - 0.4, dur: 0.6, v: spot(R_REC, R_MIC)},
    {at: K.playClick - 0.6, dur: 0.6, v: spot(R_PLAY)},
    {at: K.playClick + 0.3, dur: 0.6, v: spot(R_VIDEO)},
  ];
  ACTIONS.forEach((a) => {
    k.push({at: a.sayT - 0.1, dur: 0.5, v: spot(R_MIC, pad(RHYTHM, 6))});
    k.push({at: a.click - 0.1, dur: 0.5, v: spot(cellSpot(a.cell), pad(RHYTHM, 6))});
    k.push({at: a.resume, dur: 0.5, v: spot(R_VIDEO)});
  });
  k.push({at: EV3.rule, dur: 0.7, v: spot(pad(STRIP, 4))});
  k.push({at: EV3.tip, dur: 0.7, v: spot(R_REC)});
  k.push({at: EV3.endZone, dur: 0.7, v: spot(R_ENDZONE)});
  k.push({at: EV3.recap, dur: 0.7, v: spot(NONE(R_ENDZONE))});
  return k;
})();

/* ── captions ── */
const T = K.captions;
const CAPS: CaptionSpec[] = [
  {from: K.recClick, to: K.playClick - 0.2, step: null, text: T.rec, color: RED},
  {from: K.playClick, to: A0.pause - 0.05, step: null, text: T.play},
  {from: A0.pause, to: A0.sayT - 0.05, step: null, text: T.pause},
  {from: A0.sayT, to: A0.gap - 0.05, step: null, text: T.say},
  {from: A0.gap, to: A0.click - 0.05, step: null, text: T.gap},
  {from: A0.click, to: A0.resume + 0.3, step: null, text: T.click},
  {from: A0.resume + 0.4, to: EV3.rule - 0.05, step: null, text: T.repeat},
  {from: EV3.rule, to: EV3.tip - 0.05, step: null, text: T.rule, color: RED},
  {from: EV3.tip, to: EV3.endZone - 0.05, step: null, text: T.tip},
  {from: EV3.endZone, to: EV3.recap - 0.05, step: null, text: T.end, color: RED},
  {from: EV3.recap, to: EV3.end, step: null, text: T.recap, color: GREEN_D},
];

export const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const cam = camera(f);
  const vid = video3At(t);

  const fade =
    interpolate(t, [0, K.fadeIn], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [EV3.fadeOut, EV3.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  // which action are we in?
  const cur = [...ACTIONS].reverse().find((a) => t >= a.pause - 0.05) ?? null;
  const phase = !cur ? -1 : t < cur.sayT ? 0 : t < cur.gap ? 1 : t < cur.click ? 2 : t < cur.end ? 3 : 4;
  const clicked = ACTIONS.filter((a) => t >= a.clickAt);
  const lastCell = clicked.length ? clicked[clicked.length - 1].cell : K.startCell;

  const recOn = t >= K.recClick;
  const recTime = recOn ? t - K.recClick : 0;
  const rec: RecState = {...IDLE_REC, on: recOn, time: recTime, press: clickPress(f, K.recClick), pulse: recOn ? (recTime % 1.2) / 1.2 : 0};

  // mic level: talking during "say" windows
  const speaking = ACTIONS.reduce((m, a) => Math.max(m, window01(f, a.sayT + 0.15, a.gap - 0.1, 0.15, 0.2)), 0);
  const micLevel = recOn ? 0.15 + 0.85 * speaking : 0;
  const bubbleA = ACTIONS.find((a) => t >= a.sayT && t < a.gap + 0.3);
  const gapA = ACTIONS.find((a) => t >= a.gap && t < a.click + 0.1);

  const press = Math.max(clickPress(f, K.recClick), clickPress(f, K.playClick), ...ACTIONS.map((a) => clickPress(f, a.clickAt)), ...RESUME_CLICKS.map((c) => clickPress(f, c)));
  const playPress = Math.max(clickPress(f, K.playClick), ...RESUME_CLICKS.map((c) => clickPress(f, c)));
  const s = track<Spot>(f, spot(R_REC, R_MIC, 0), spotKeys);

  const ruleT = EV3.rule;
  const videoOverlay = null;

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: C.text}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Spotlight amount={s.amt} holes={[{x: s.ax, y: s.ay, w: s.aw, h: s.ah}, {x: s.bx, y: s.by, w: s.bw, h: s.bh}]}>
            <>
              <BrowserWindow download={IDLE_DOWNLOAD} tabTitle="sample_dance.mp4 - Grid Player">
                <GridPlayerApp3
                  v={vid.v} playing={vid.playing} playPress={playPress} moves={MOVES} rec={rec}
                  footer={`${lastCell} · ${vid.v.toFixed(3)} s · ${recOn ? "recording…" : "not recording…"}`}
                  endZone={ease(f, EV3.endZone + 0.4, 0.8)} videoOverlay={videoOverlay}
                />
              </BrowserWindow>
              <RecBadge show={recOn ? pop(f, K.recClick) : 0} time={recTime} blink={0.5 + 0.5 * Math.cos(t * 5)} />
              <MicWidget
                show={recOn ? ease(f, K.recClick + 0.2, 0.7) : 0} level={micLevel} t={t}
                bubble={bubbleA ? `"Action… ${bubbleA.say}"` : null} bubbleShow={bubbleA ? window01(f, bubbleA.sayT, bubbleA.gap + 0.3, 0.3, 0.25) : 0}
                gapShow={gapA ? window01(f, gapA.gap, gapA.click + 0.1, 0.2, 0.2) : 0}
              />
              {cur && <PauseFlash p={(t - cur.pause) / (cur.slow ? 1.1 : 0.7)} />}
              <PeakThumbs show={window01(f, A0.pause + 0.5, A0.sayT, 0.4, 0.3)} dancer={MOVES[0].dancer} peakV={A0.v} moves={MOVES} />
              <RhythmRow
                show={cur && t < EV3.rule ? window01(f, A0.pause, EV3.rule, 0.4, 0.4) : 0}
                active={phase >= 0 && phase <= 3 ? phase : -1} done={phase === 4 ? 4 : Math.max(0, phase)} say={(cur ?? A0).say}
              />
              {ACTIONS.map((a, i) => (
                <CellPop key={i} cell={a.cell} time={a.v}
                  pop={t >= a.clickAt ? pop(f, a.clickAt) - 0.6 * ease(f, a.end + 0.3, 0.8) : 0}
                  label={t >= a.clickAt ? pop(f, a.clickAt + 0.1) - ease(f, a.end, 0.5) : 0} />
              ))}
              <RuleStrip
                slide={window01(f, ruleT, EV3.tip, 0.6, 0.4)} dots={ease(f, ruleT + 0.4, 1.0)}
                tooClose={ease(f, ruleT + 1.6, 0.6)} ok={ease(f, ruleT + 3.4, 0.6)}
              />
              <EndZoneCallout show={ease(f, EV3.endZone + 0.9, 0.6) - ease(f, EV3.recap, 0.4)} x={END_X + 4} y={END_Y - 24} />
            </>
          </Spotlight>
          <Ripple f={f} at={K.recClick} p={REC_BTN} color={RED} />
          <Ripple f={f} at={K.playClick} p={PLAY3} />
          {RESUME_CLICKS.map((c, i) => <Ripple key={i} f={f} at={c} p={PLAY3} />)}
          {ACTIONS.map((a, i) => <Ripple key={`c${i}`} f={f} at={a.clickAt} p={center(cellRect(a.cell))} />)}
          <Cursor p={track<Pt>(f, {x: 1000, y: 900}, cursorKeys)} pressed={press} opacity={Math.max(0, ease(f, 0.9, 0.5) - ease(f, EV3.recap - 0.5, 0.5))} />
        </World>

        <TipCard show={window01(f, EV3.tip + 0.3, EV3.endZone, 0.5, 0.4)} />
        <RecapRow f={f} startFrame={sec(EV3.recap + 0.3)} show={window01(f, EV3.recap + 0.2, EV3.end, 0.4, 0.5)} />
        <StepIndicator show={ease(f, 0.3, 0.8)} step={K.step.step} title={K.step.title} />
        {CAPS.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
