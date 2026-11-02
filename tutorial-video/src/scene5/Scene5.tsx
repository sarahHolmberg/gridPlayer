import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {CONFIG} from "../config";
import {CONFIG5 as K} from "./config5";
import {CONFIG3} from "../scene3/config3";
import {CONFIG4} from "../scene4/config4";
import {ease, pop, track} from "../anim";
import {BrowserWindow, C, IDLE_DOWNLOAD} from "../ui";
import {WIN} from "../layout";
import {FolderIcon} from "../icons";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily} from "../shared";
import {Spotlight} from "../scene2/overlays";
import {pad, Rect, union} from "../scene2/layout2";
import {GridPlayerApp3, IDLE_REC} from "../gp/GridApp3";
import {DONE_BTN, TRAY, VSTAGE} from "../gp/layout3";
import {CHIP, FileChip, SLOT, Tray} from "../gp/tray";
import {Carousel, CODE_INPUT, DoneModal, DROPZONE, FileSharePage, MistakeSplit, Particles, REMOVE_BTN, RollCounter, UPLOAD_ROW} from "./parts5";

const fps = CONFIG.fps;
const T = K.t;
export const SCENE5_FRAMES = Math.round(T.end * fps);
const center = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const BASE: Cam = {cx: 960, cy: 640, z: 0.95, rx: 0, ry: 0};
const camera = (f: number) =>
  track<Cam>(f, {cx: 960, cy: 620, z: 0.8, rx: 9, ry: -7}, [
    {at: 0, dur: 1.8, v: BASE},
    {at: T.toPlayer, dur: 1.3, v: {cx: 1100, cy: 520, z: 1.08, rx: 0, ry: 0}},
    {at: T.recap - 0.4, dur: 1.2, v: BASE},
  ]);

const DROP_C = center(DROPZONE);
const cursorKeys = [
  {at: 1.1, dur: 0.9, v: SLOT(0), arc: 0.1},
  {at: T.grab + 0.1, dur: T.dragDur, v: DROP_C, arc: -0.12},
  {at: T.drop + 0.4, dur: 0.9, v: {x: DROP_C.x + 340, y: DROP_C.y + 230}, arc: 0.1},
  {at: T.toPlayer + 0.3, dur: 0.9, v: center(DONE_BTN), arc: 0.1},
  {at: T.focus - 0.6, dur: 0.6, v: {x: CODE_INPUT.x + 120, y: center(CODE_INPUT).y}, arc: 0.1},
  {at: T.removeClick - 0.8, dur: 0.6, v: center(REMOVE_BTN), arc: -0.1},
  {at: T.removeClick + 0.5, dur: 1.0, v: {x: 1000, y: 820}, arc: 0.1},
];

export const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade =
    interpolate(t, [0, T.fadeIn], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [T.fadeOut, T.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const page = ease(f, T.toPlayer, 0.6); // 0 = file page, 1 = Grid Player
  const onPlayer = page > 0.5;
  const cur = track<Pt>(f, {x: 1500, y: 900}, cursorKeys);

  // drag & drop
  const dragging = t >= T.grab && t < T.drop + 0.4;
  const hover = ease(f, T.drop - 0.8, 0.5) - ease(f, T.drop + 0.1, 0.4);
  const sink = ease(f, T.drop, 0.4);
  const uploads = K.t.uploads.map(([a, b], i) => ({
    kind: (i === 0 ? "transcript" : "video") as "transcript" | "video",
    p: clamp01((t - a) / (b - a)), show: ease(f, a - 0.15, 0.4),
  }));

  // mistake split view
  const M = T.mistake;
  const split = {
    show: Math.max(0, ease(f, M, 0.5) - ease(f, T.mistakeEnd - 0.4, 0.4)),
    l: {show: ease(f, M + 0.1, 0.5), press: clickPress(f, M + 0.9), verdict: ease(f, M + 1.1, 0.4)},
    r: {show: ease(f, M + 1.5, 0.5), press: clickPress(f, M + 2.4), verdict: ease(f, M + 2.6, 0.4)},
  };

  // modal
  const modal = t >= T.modal ? pop(f, T.modal) - ease(f, T.removeClick + 0.15, 0.4) : 0;
  const typed = Math.floor(clamp01((t - T.typing[0]) / (T.typing[1] - T.typing[0])) * K.code.length + 1e-6);
  const dissolve = clamp01((t - T.dissolve) / 1.6);
  const de = 1 - Math.pow(1 - dissolve, 2);
  const flip = ease(f, T.flip, 0.9);

  // spotlight
  type Spot = {ax: number; ay: number; aw: number; ah: number; bx: number; by: number; bw: number; bh: number; amt: number};
  const NONE = (a: Rect): Rect => ({x: a.x + a.w / 2, y: a.y + a.h / 2, w: 0, h: 0});
  const sp = (a: Rect, b: Rect = NONE(a), amt = 1): Spot => ({ax: a.x, ay: a.y, aw: a.w, ah: a.h, bx: b.x, by: b.y, bw: b.w, bh: b.h, amt});
  const R_UP = pad(union(UPLOAD_ROW(0), UPLOAD_ROW(1)), 10);
  const s = track<Spot>(f, sp(pad(TRAY, 6), pad(DROPZONE, 8), 0), [
    {at: 1.0, dur: 0.6, v: sp(pad(TRAY, 6), pad(DROPZONE, 8))},
    {at: T.drop + 0.1, dur: 0.6, v: sp(R_UP)},
    {at: M - 0.2, dur: 0.5, v: sp(NONE(R_UP))},
    {at: T.toPlayer + 0.2, dur: 0.6, v: sp(pad(DONE_BTN, 10))},
    {at: T.modal, dur: 0.4, v: sp(pad(DONE_BTN, 10), undefined, 0)},
    {at: T.recap - 0.2, dur: 0.6, v: sp(NONE(DONE_BTN))},
  ]);

  const CP = K.captions;
  const CAPS: CaptionSpec[] = [
    {from: 1.0, to: M - 0.1, step: null, text: CP.upload},
    {from: M, to: T.mistakeEnd, step: null, text: CP.mistake, color: "#b91c1c"},
    {from: T.toPlayer + 0.3, to: T.focus - 0.05, step: null, text: CP.done},
    {from: T.focus, to: T.removeClick - 0.05, step: null, text: CP.code},
    {from: T.removeClick, to: T.recap - 0.1, step: null, text: CP.next, color: "#15803d"},
    {from: T.recap, to: T.end, step: null, text: CP.recap, color: "#15803d"},
  ];

  const turn = [1, 2, 3, 4, 5].reduce((acc, i) => acc + ease(f, T.recap + 0.6 + (i - 1) * 0.85, 0.6), 0);

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: C.text}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={camera(f)}>
          <Spotlight amount={s.amt} holes={[{x: s.ax, y: s.ay, w: s.aw, h: s.ah}, {x: s.bx, y: s.by, w: s.bw, h: s.bh}]}>
            <>
              <BrowserWindow download={IDLE_DOWNLOAD} tabTitle={onPlayer ? "sample_dance.mp4 - Grid Player" : K.sharePage.tabTitle} url={onPlayer ? CONFIG.content.url : K.sharePage.url}>
                <div style={{position: "absolute", inset: 0, opacity: 1 - page}}>
                  <FileSharePage hover={hover} uploads={uploads} />
                </div>
                {page > 0 && (
                  <div style={{position: "absolute", inset: 0, opacity: page}}>
                    <GridPlayerApp3
                      v={CONFIG4.lastV} playing={false} playPress={0} moves={CONFIG3.actions}
                      rec={{...IDLE_REC, time: CONFIG4.recordedTime, audioReady: 1, trimDone: 1}}
                      footer={`${CONFIG4.lastCell} · ${CONFIG4.lastV.toFixed(3)} s · not recording…`}
                      fx={{scale: 1 - 0.3 * de, opacity: 1 - de}}
                      link={{
                        donePress: clickPress(f, T.doneClick), doneGlow: ease(f, T.toPlayer + 0.4, 0.6) - ease(f, T.doneClick, 0.4), flip,
                        next: {...K.nextLink, waiting: <RollCounter from={K.waitingFrom} p={ease(f, T.flip + 0.8, 0.6)} />},
                      }}
                      stageAfter={dissolve > 0.4 ? (
                        <div style={{
                          position: "absolute", left: VSTAGE.w / 2 - 150, top: VSTAGE.h / 2 - 80, width: 300, height: 160, borderRadius: 16,
                          border: "2px dashed #4a4a45", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                          opacity: ease(f, T.dissolve + 0.8, 0.8),
                        }}>
                          <div style={{display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 25, fontWeight: 700}}><FolderIcon size={30} />Open a video</div>
                          <div style={{color: "#a8a8a0", fontSize: 18}}>or drop it anywhere</div>
                        </div>
                      ) : null}
                    />
                  </div>
                )}
              </BrowserWindow>
              <Tray show={1 - page} items={[
                {kind: "transcript", show: 1, check: 1, dim: dragging ? 1 : 0},
                {kind: "video", show: 1, check: 1, dim: dragging ? 1 : 0},
              ]} />
            </>
          </Spotlight>

          {/* page dims behind the modal */}
          <div style={{position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, background: `rgba(0,0,0,${0.5 * Math.max(0, modal)})`}} />
          <DoneModal show={Math.max(0, modal)} focus={t >= T.focus ? 1 : 0} typed={typed} press={clickPress(f, T.removeClick)} />
          <Particles p={dissolve} />

          {/* the two files being dragged */}
          {dragging && (
            <div style={{position: "absolute", left: cur.x - 30, top: cur.y - 20, transform: `scale(${(1 + 0.1 * pop(f, T.grab)) * (1 - 0.6 * sink)})`, opacity: 1 - sink, transformOrigin: "0 0"}}>
              <FileChip kind="video" style={{position: "absolute", left: 14, top: 14, boxShadow: "0 18px 36px rgba(0,0,0,.45)"}} />
              <FileChip kind="transcript" style={{position: "absolute", left: 0, top: 0, boxShadow: "0 18px 36px rgba(0,0,0,.45)"}} />
              <div style={{
                position: "absolute", left: CHIP.w - 6, top: -12, width: 30, height: 30, borderRadius: "50%", background: "#2563eb", color: "#fff",
                fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}>2</div>
            </div>
          )}

          <Ripple f={f} at={T.drop} p={DROP_C} />
          <Ripple f={f} at={T.doneClick} p={center(DONE_BTN)} color="#22c55e" />
          <Ripple f={f} at={T.focus} p={{x: CODE_INPUT.x + 120, y: center(CODE_INPUT).y}} />
          <Ripple f={f} at={T.removeClick} p={center(REMOVE_BTN)} />
          <Cursor p={cur} pressed={Math.max(dragging ? 1 : 0, clickPress(f, T.doneClick), clickPress(f, T.focus), clickPress(f, T.removeClick))}
            opacity={Math.max(0, ease(f, 0.9, 0.5) - ease(f, T.recap - 0.6, 0.5))} />
        </World>

        <MistakeSplit {...split} />
        <Carousel show={ease(f, T.recap, 0.8)} turn={turn} />
        <StepIndicator show={ease(f, 0.3, 0.8)} step={K.step.step} title={K.step.title} />
        {CAPS.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
