import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {AudioLines, FileAudio, FileText, Loader2, Sparkles} from "lucide-react";
import {CONFIG, sec} from "../config";
import {CONFIG4 as K} from "./config4";
import {CONFIG3} from "../scene3/config3";
import {ACTIONS} from "../scene3/timeline3";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, C, IDLE_DOWNLOAD} from "../ui";
import {APP_Y, WIN} from "../layout";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily, monoFamily} from "../shared";
import {Spotlight} from "../scene2/overlays";
import {pad, Rect} from "../scene2/layout2";
import {GridPlayerApp3, IDLE_REC} from "../gp/GridApp3";
import {EXPORT_AUDIO, EXPORT_TRIM, REC_CARD, TRAY} from "../gp/layout3";
import {FlyingChip, FileChip, SLOT, Tray, CHIP} from "../gp/tray";

const fps = CONFIG.fps;
const T = K.t;
export const SCENE4_FRAMES = Math.round(T.end * fps);
const center = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

/* ── Audio-to-text page layout (world coordinates) ── */
const X0 = WIN.x + 430, COLW = 900;
const FILE_CARD: Rect = {x: X0, y: APP_Y + 130, w: COLW, h: 96};
const TRANSCRIBE: Rect = {x: X0, y: APP_Y + 250, w: 230, h: 56};
const OUTPUT: Rect = {x: X0, y: APP_Y + 330, w: COLW, h: 250};
const TFILE = {x: X0 + CHIP.w / 2, y: APP_Y + 640};

const BASE: Cam = {cx: 960, cy: 600, z: 0.85, rx: 0, ry: 0};
const SIDE: Cam = {cx: 1450, cy: 830, z: 1.32, rx: 0, ry: 0};
const camera = (f: number) =>
  track<Cam>(f, {cx: 1100, cy: 620, z: 0.8, rx: 8, ry: -8}, [
    {at: 0, dur: 1.6, v: {...SIDE, z: 1.2}},
    {at: T.ready - 0.3, dur: 1.2, v: SIDE},
    {at: T.toTextPage - 0.1, dur: 1.2, v: {cx: 900, cy: 500, z: 1.3, rx: 0, ry: 0}},
    {at: T.transcriptFile - 0.3, dur: 1.0, v: BASE},
    {at: T.backToPlayer, dur: 1.2, v: SIDE},
    {at: T.both, dur: 1.2, v: {cx: 1500, cy: 1000, z: 1.4, rx: 0, ry: 0}},
    {at: T.fadeOut - 0.6, dur: 1.4, v: BASE},
  ]);

const cursorKeys = [
  {at: 2.8, dur: 0.9, v: center(EXPORT_AUDIO), arc: 0.1},
  {at: T.toTextPage + 0.6, dur: 0.9, v: center(TRANSCRIBE), arc: -0.1},
  {at: T.transcribeClick + 0.5, dur: 0.8, v: {x: X0 + 1000, y: APP_Y + 520}, arc: 0.1},
  {at: T.backToPlayer + 0.3, dur: 0.9, v: center(EXPORT_TRIM), arc: 0.1},
  {at: T.trimClick + 0.4, dur: 0.8, v: {x: EXPORT_TRIM.x + 300, y: EXPORT_TRIM.y + 120}, arc: 0.1},
];

const LINES = ACTIONS.map((a) => `[${a.v.toFixed(1)} s]  Action, ${a.say}…`);

const AudioToTextPage: React.FC<{f: number; t: number}> = ({f, t}) => {
  const busy = t >= T.transcribeClick && t < T.lines[0];
  const tp = clickPress(f, T.transcribeClick);
  const rel = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x - WIN.x, top: r.y - WIN.y, width: r.w, height: r.h});
  return (
    <div style={{position: "absolute", left: 0, top: APP_Y - WIN.y, width: WIN.w, height: WIN.h - (APP_Y - WIN.y), background: "#f7f7fb"}}>
      <div style={{position: "absolute", left: X0 - WIN.x, top: 38, display: "flex", alignItems: "center", gap: 14}}>
        <AudioLines size={40} color="#4f46e5" />
        <div>
          <div style={{fontSize: 34, fontWeight: 800, color: "#111"}}>Audio to text</div>
          <div style={{fontSize: 18, color: "#6b7280"}}>Upload a recording and get a transcript.</div>
        </div>
      </div>
      <div style={{...rel(FILE_CARD), top: FILE_CARD.y - APP_Y, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", boxSizing: "border-box"}}>
        <FileAudio size={40} color="#4f46e5" />
        <div>
          <div style={{fontSize: 20, fontWeight: 700}}>{K.textPage.fileName}</div>
          <div style={{fontSize: 15, color: "#6b7280"}}>{K.textPage.fileInfo}</div>
        </div>
        <div style={{flex: 1, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end"}}>
          {Array.from({length: 60}, (_, i) => <div key={i} style={{width: 4, borderRadius: 2, height: 6 + 30 * Math.abs(Math.sin(i * 1.3) * Math.sin(i * 0.37)), background: "#c7d2fe"}} />)}
        </div>
      </div>
      <div style={{
        ...rel(TRANSCRIBE), top: TRANSCRIBE.y - APP_Y, background: "#4f46e5", color: "#fff", borderRadius: 12, fontSize: 21, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${1 - 0.06 * tp})`,
      }}>
        {busy ? <Loader2 size={22} style={{transform: `rotate(${t * 400}deg)`}} /> : <Sparkles size={22} />}
        {busy ? "Transcribing…" : "Transcribe"}
      </div>
      <div style={{...rel(OUTPUT), top: OUTPUT.y - APP_Y, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 24px", boxSizing: "border-box"}}>
        <div style={{fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: "#6b7280"}}>TRANSCRIPT</div>
        {LINES.map((l, i) => {
          const p = ease(f, T.lines[i] ?? 99, 0.5);
          return <div key={i} style={{fontFamily: monoFamily, fontSize: 24, marginTop: 16, opacity: p, transform: `translateX(${(1 - p) * 20}px)`, color: "#111"}}>{l}</div>;
        })}
      </div>
    </div>
  );
};

export const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade =
    interpolate(t, [0, T.fadeIn], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [T.fadeOut, T.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  // page switching: 0 = Grid Player, 1 = Audio to text
  const page = ease(f, T.toTextPage, 0.6) - ease(f, T.backToPlayer, 0.6);
  const onText = page > 0.5;

  const trimP = interpolate(t, [T.trimProgress[0], T.trimProgress[1]], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const rec = {
    ...IDLE_REC, time: K.recordedTime,
    audioReady: ease(f, T.ready, 0.8), audioShine: interpolate(t, [T.shine, T.shine + 0.7], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}),
    audioPress: clickPress(f, T.audioClick), trimPress: clickPress(f, T.trimClick), trimProgress: t >= T.trimClick ? trimP : 0, trimDone: t >= T.trimProgress[1] ? 1 : 0,
  };

  const transcriptFlyP = interpolate(t, [T.transcriptFly, T.transcriptFly + 0.9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const videoFlyP = interpolate(t, [T.videoFly, T.videoFly + 0.9], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const bothGlow = ease(f, T.both, 0.6);

  // spotlight
  type Spot = {ax: number; ay: number; aw: number; ah: number; amt: number};
  const sp = (r: Rect, amt = 1): Spot => ({ax: r.x, ay: r.y, aw: r.w, ah: r.h, amt});
  const R_REC = pad({x: REC_CARD.x, y: EXPORT_AUDIO.y, w: REC_CARD.w, h: EXPORT_AUDIO.h}, 8);
  const R_TRIM = pad({x: REC_CARD.x, y: EXPORT_TRIM.y, w: REC_CARD.w, h: EXPORT_TRIM.h}, 8);
  const s = track<Spot>(f, sp(R_REC, 0), [
    {at: T.ready - 0.3, dur: 0.6, v: sp(R_REC)},
    {at: T.toTextPage, dur: 0.4, v: sp(R_REC, 0)},
    {at: T.backToPlayer + 0.3, dur: 0.6, v: sp(R_TRIM)},
    {at: T.both - 0.2, dur: 0.6, v: sp(pad(TRAY, 6))},
    {at: T.fadeOut, dur: 0.6, v: sp(pad(TRAY, 6), 0)},
  ]);
  const holes = [{x: s.ax, y: s.ay, w: s.aw, h: s.ah}, ...(t >= T.transcriptFly ? [pad(TRAY, 6)] : [])];

  const C4 = K.captions;
  const CAPS: CaptionSpec[] = [
    {from: 1.2, to: T.toTextPage - 0.05, step: null, text: C4.ready},
    {from: T.toTextPage + 0.2, to: T.backToPlayer, step: null, text: C4.text},
    {from: T.backToPlayer + 0.2, to: T.both - 0.05, step: null, text: C4.trim},
    {from: T.both, to: T.end, step: null, text: C4.both, color: "#15803d"},
  ];

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: C.text}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={camera(f)}>
          <Spotlight amount={s.amt} holes={holes}>
            <BrowserWindow download={IDLE_DOWNLOAD} tabTitle={onText ? K.textPage.tabTitle : "sample_dance.mp4 - Grid Player"} url={onText ? K.textPage.url : CONFIG.content.url}>
              <div style={{position: "absolute", inset: 0, opacity: 1 - page}}>
                <GridPlayerApp3 v={K.lastV} playing={false} playPress={0} moves={CONFIG3.actions} rec={rec} footer={`${K.lastCell} · ${K.lastV.toFixed(3)} s · not recording…`} />
              </div>
              {page > 0 && (
                <div style={{position: "absolute", inset: 0, opacity: page, transform: `translateX(${(1 - page) * 40}px)`}}>
                  <AudioToTextPage f={f} t={t} />
                </div>
              )}
            </BrowserWindow>
          </Spotlight>
          {/* transcript.txt appears on the text page, then flies down */}
          {onText && t >= T.transcriptFile && transcriptFlyP <= 0 && (
            <div style={{position: "absolute", left: TFILE.x - CHIP.w / 2, top: TFILE.y - CHIP.h / 2, transform: `scale(${pop(f, T.transcriptFile)})`}}>
              <FileChip kind="transcript" />
            </div>
          )}
          <FlyingChip kind="transcript" from={TFILE} to={SLOT(0)} p={transcriptFlyP} />
          <FlyingChip kind="video" from={center(EXPORT_TRIM)} to={SLOT(1)} p={videoFlyP} />
          <Tray show={ease(f, T.transcriptFly - 0.6, 0.6)} glow={bothGlow} items={[
            {kind: "transcript", show: transcriptFlyP >= 1 ? 1 : 0, check: t >= T.both ? pop(f, T.both) : 0},
            {kind: "video", show: videoFlyP >= 1 ? 1 : 0, check: t >= T.both + 0.25 ? pop(f, T.both + 0.25) : 0},
          ]} />
          <Ripple f={f} at={T.audioClick} p={center(EXPORT_AUDIO)} />
          <Ripple f={f} at={T.transcribeClick} p={center(TRANSCRIBE)} />
          <Ripple f={f} at={T.trimClick} p={center(EXPORT_TRIM)} />
          <Cursor p={track<Pt>(f, {x: 1700, y: 960}, cursorKeys)}
            pressed={Math.max(clickPress(f, T.audioClick), clickPress(f, T.transcribeClick), clickPress(f, T.trimClick))}
            opacity={Math.max(0, ease(f, 2.4, 0.5) - ease(f, T.both, 0.5))} />
        </World>
        <StepIndicator show={ease(f, 0.3, 0.8)} step={K.step.step} title={K.step.title} />
        {CAPS.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

void sec; void FileText; void window01;
