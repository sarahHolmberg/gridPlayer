// Step 3: record (new way): Rec → Say name → click beside the target's face → skip to an action →
// go back a little to see the whole action → "Action, …" → click it → … → "Caption, …" about this video → Export audio.
import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Mic, Volume2, MessageSquareText} from "lucide-react";
import {CONFIG} from "../config";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, IDLE_DOWNLOAD} from "../ui";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily, monoFamily} from "../shared";
import {Spotlight} from "../scene2/overlays";
import {pad} from "../scene2/layout2";
import {Move} from "../gp/dancers3";
import {
  AUDIO_BTN, GridPlayer4, MUSIC, NAME_BTN, REC_BTN, SKIP_BTN, TARGET, TPIC, TRUE_BPM, VIDEO, VKey, actionCell, cellRect, faceCell, vAt,
} from "./GridApp4";

const fps = CONFIG.fps;
export const MOVES4: Move[] = [
  {kind: "handsUp", v: 3.3, dancer: TARGET},
  {kind: "jump", v: 5.5, dancer: TARGET},
  {kind: "stepLeft", v: 4.4, dancer: 0},
  {kind: "spin", v: 6.6, dancer: 3},
];
const A1 = MOVES4[0], A2 = MOVES4[1];
export const CELLS = {face: faceCell(), a1: actionCell(A1, MOVES4), a2: actionCell(A2, MOVES4)};

export const REC = {
  step: {step: 3, total: 4, title: "Record the actions"},
  rec: 2.0, name: 3.6, picHi: [6.4, 9.2], face: 9.8,
  skips: [12.8, 13.5, 14.2], back1: [14.8, 15.4], play1: 15.6, say1: 17.2, click1: 19.7,
  skips2: [22.6, 23.3], back2: [23.8, 24.3], play2: 24.4, say2: 25.8, click2: 27.6,
  caption: 30.6, audio: 39.0, recap: 40.6, end: 47.0,
  nameSpelled: "S · A · M · P · L · E  U · S · E · R",
  captionSay: "Caption, the turns were fast, so I went back a few times to see each whole action.",
  captions: [
    {from: 0.4, to: 3.4, text: "Press Rec first"},
    {from: 3.5, to: 6.3, text: "Then Say name (M)"},
    {from: 6.4, to: 9.6, text: "This picture shows your target person"},
    {from: 9.7, to: 12.5, text: "Click beside their face"},
    {from: 12.6, to: 14.7, text: "Skip ahead with +0.85 s"},
    {from: 14.8, to: 17.1, text: "Go back a little: see the whole action"},
    {from: 17.2, to: 19.5, text: "Say “Action”, then what it is"},
    {from: 19.6, to: 22.4, text: "Click where the action is"},
    {from: 22.5, to: 30.4, text: "Skip, go back, say it, click. Repeat"},
    {from: 30.5, to: 38.8, text: "Caption: say something about this video"},
    {from: 38.9, to: 40.5, text: "Then Export audio"},
    {from: 40.6, to: 47.0, text: "Always say a caption at the end", color: "#15803d"},
  ],
};
const R = REC;
export const RECORD_FRAMES = Math.round(R.end * fps);
const SKIP = 0.85;
const center = (r: {x: number; y: number; w: number; h: number}) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
const vSkip = (n: number) => n * SKIP;

const KEYS: VKey[] = [
  {t: 0, v: 0, mode: "hold"},
  ...R.skips.map((s, i) => ({t: s, v: vSkip(i + 1), mode: "hold" as const})),
  {t: R.back1[0], v: vSkip(3), mode: "scrub"},
  {t: R.back1[1], v: A1.v - 0.9, mode: "hold"},
  {t: R.play1, v: A1.v - 0.9, mode: "play"},
  {t: R.play1 + 0.9, v: A1.v, mode: "hold"},
  {t: R.skips2[0], v: A1.v + SKIP, mode: "hold"},
  {t: R.skips2[1], v: A1.v + 2 * SKIP, mode: "hold"},
  {t: R.back2[0], v: A1.v + 2 * SKIP, mode: "scrub"},
  {t: R.back2[1], v: A2.v - 0.7, mode: "hold"},
  {t: R.play2, v: A2.v - 0.7, mode: "play"},
  {t: R.play2 + 0.7, v: A2.v, mode: "hold"},
];

const Bubble: React.FC<{show: number; kind: "app" | "me"; text: string; x: number; y: number; w?: number}> = ({show, kind, text, x, y, w}) =>
  show <= 0 ? null : (
    <div style={{position: "absolute", left: x, top: y, width: w, opacity: show, transform: `translateY(${(1 - show) * 14}px) scale(${0.9 + 0.1 * show})`, transformOrigin: "0 100%",
      background: kind === "app" ? "#2563eb" : "#fff", color: kind === "app" ? "#fff" : "#111", borderRadius: 16, padding: "12px 18px", fontSize: 24, fontWeight: 700,
      boxShadow: "0 12px 30px rgba(0,0,0,.45)", display: "flex", gap: 10, alignItems: "center", border: kind === "me" ? "3px solid #ef4444" : "none"}}>
      {kind === "app" ? <Volume2 size={26} /> : <Mic size={26} color="#ef4444" />}<span>{text}</span>
    </div>
  );

export const RecordScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade = interpolate(t, [0, 0.8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) * interpolate(t, [R.end - 1, R.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const vid = vAt(t, KEYS);
  const recOn = t >= R.rec;

  const face = cellRect(CELLS.face), c1 = cellRect(CELLS.a1), c2 = cellRect(CELLS.a2);
  const cam = track<Cam>(f, {cx: 960, cy: 570, z: 0.84, rx: 9, ry: -8}, [
    {at: 0, dur: 2.0, v: {cx: 1100, cy: 640, z: 1.05, rx: 0, ry: 0}},
    {at: R.picHi[0] - 0.4, dur: 1.2, v: {cx: 640, cy: 560, z: 1.2, rx: 0, ry: 0}},
    {at: R.skips[0] - 0.4, dur: 1.2, v: {cx: 1000, cy: 560, z: 1.08, rx: 0, ry: 0}},
    {at: R.caption - 0.3, dur: 1.2, v: {cx: 900, cy: 560, z: 1.02, rx: 0, ry: 0}},
    {at: R.audio - 0.8, dur: 1.0, v: {cx: 1250, cy: 700, z: 1.2, rx: 0, ry: 0}},
    {at: R.recap - 0.3, dur: 1.2, v: {cx: 960, cy: 560, z: 0.92, rx: 0, ry: 0}},
  ]);

  const skipC = center(SKIP_BTN);
  const cursorKeys = [
    {at: 1.1, dur: 0.8, v: REC_BTN, arc: 0.1},
    {at: R.name - 0.8, dur: 0.6, v: center(NAME_BTN)},
    {at: R.face - 0.9, dur: 0.8, v: center(face), arc: 0.1},
    {at: R.skips[0] - 0.8, dur: 0.7, v: skipC, arc: -0.1},
    {at: R.click1 - 0.8, dur: 0.7, v: center(c1), arc: 0.1},
    {at: R.skips2[0] - 0.8, dur: 0.7, v: skipC, arc: -0.1},
    {at: R.click2 - 0.8, dur: 0.7, v: center(c2), arc: 0.1},
    {at: R.audio - 0.9, dur: 0.8, v: center(AUDIO_BTN), arc: 0.1},
    {at: R.audio + 0.6, dur: 0.8, v: {x: 1700, y: 1000}},
  ];
  const clicks: [number, Pt][] = [[R.rec, REC_BTN], [R.name, center(NAME_BTN)], [R.face, center(face)], ...R.skips.map((s) => [s, skipC] as [number, Pt]), [R.click1, center(c1)], ...R.skips2.map((s) => [s, skipC] as [number, Pt]), [R.click2, center(c2)], [R.audio, center(AUDIO_BTN)]];
  const press = Math.max(...clicks.map(([c]) => clickPress(f, c)));

  type Spot = {x: number; y: number; w: number; h: number; amt: number};
  const sp = (r: {x: number; y: number; w: number; h: number}, amt = 1): Spot => ({...r, amt});
  const s = track<Spot>(f, sp(pad(VIDEO, 2), 0), [
    {at: R.picHi[0], dur: 0.5, v: sp({x: TPIC.x - 10, y: VIDEO.y, w: VIDEO.x + VIDEO.w - TPIC.x + 10, h: VIDEO.h + 4})},
    {at: R.face + 2.2, dur: 0.6, v: sp(pad(VIDEO, 2), 0)},
  ]);

  const clickVoice = (at: number, cell: string, time: number) => window01(f, at + 0.15, at + 2.3, 0.2, 0.3) > 0
    ? {show: window01(f, at + 0.15, at + 2.3, 0.2, 0.3), text: `target cell ${cell}, time ${time.toFixed(3)}`} : null;
  const voice = clickVoice(R.face, CELLS.face, 0) ?? clickVoice(R.click1, CELLS.a1, A1.v - 0) ?? clickVoice(R.click2, CELLS.a2, A2.v);
  const nameVoice = window01(f, R.name + 0.2, R.name + 2.6, 0.2, 0.3);
  const say1 = window01(f, R.say1, R.click1 - 0.2, 0.25, 0.25), say2 = window01(f, R.say2, R.click2 - 0.2, 0.25, 0.25);
  const capSay = window01(f, R.caption + 0.8, R.audio - 0.4, 0.3, 0.3);
  const pops = [[R.face, face], [R.click1, c1], [R.click2, c2]] as const;

  const caps: CaptionSpec[] = R.captions.map((c) => ({...c, step: null}));
  return (
    <AbsoluteFill style={{background: "#000", fontFamily}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Spotlight amount={s.amt} holes={[{x: s.x, y: s.y, w: s.w, h: s.h}]}>
            <BrowserWindow download={IDLE_DOWNLOAD} tabTitle="sample_dance.mp4 - Grid Player">
              <GridPlayer4
                title="sample_dance.mp4 - Grid Player" grid={{beat1: MUSIC, bpm: TRUE_BPM}} out={null}
                video={{v: vid.v, playing: vid.playing, moves: MOVES4, grid: 1, picHi: window01(f, R.picHi[0], R.picHi[1], 0.3, 0.3)}}
                clock={vid.v} skipPress={Math.max(...[...R.skips, ...R.skips2].map((x) => clickPress(f, x)))} skipHi={window01(f, R.skips[0] - 0.3, R.skips[2] + 0.4, 0.2, 0.3)}
                side={{mode: "record", recOn, recTime: recOn ? t - R.rec : 0, recPress: clickPress(f, R.rec), namePress: clickPress(f, R.name), audioPress: clickPress(f, R.audio)}}
                status={recOn ? `recording… ${vid.v.toFixed(3)} s` : "not recording…"}
              />
            </BrowserWindow>
          </Spotlight>
          {/* which one is the target: picture → person */}
          {window01(f, R.picHi[0] + 0.5, R.picHi[1], 0.3, 0.3) > 0 && (
            <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: window01(f, R.picHi[0] + 0.5, R.picHi[1], 0.3, 0.3)}} width={1} height={1}>
              <path d={`M${TPIC.x + TPIC.w + 6} ${TPIC.y + 20} Q ${(TPIC.x + face.x) / 2} ${face.y - 40} ${face.x - 6} ${face.y + 30}`} fill="none" stroke="#facc15" strokeWidth={6} strokeDasharray="14 10" />
            </svg>
          )}
          {pops.map(([at, r], i) => t >= at ? (
            <div key={i} style={{position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 3, background: "rgba(37,99,235,.8)", border: "2px solid #bfdbfe", boxSizing: "border-box",
              opacity: pop(f, at) - ease(f, at + 2.4, 0.6), transform: `scale(${1 + 0.6 * pop(f, at)})`, boxShadow: "0 0 18px rgba(96,165,250,.9)"}} />
          ) : null)}
          <Bubble kind="app" show={nameVoice} text={`“name bubble…  ${R.nameSpelled}”`} x={VIDEO.x + 140} y={VIDEO.y + 24} />
          {voice && <Bubble kind="app" show={voice.show} text={`“${voice.text}”`} x={VIDEO.x + 260} y={VIDEO.y + 24} />}
          <Bubble kind="me" show={say1} text="“Action, hands up”" x={VIDEO.x + 30} y={VIDEO.y + VIDEO.h - 150} />
          <Bubble kind="me" show={say2} text="“Action, jump”" x={VIDEO.x + 30} y={VIDEO.y + VIDEO.h - 150} />
          <Bubble kind="me" show={capSay} text={`“${R.captionSay}”`} x={VIDEO.x + 30} y={VIDEO.y + VIDEO.h - 210} w={720} />
          {/* caption card */}
          {window01(f, R.caption, R.audio, 0.4, 0.3) > 0 && (
            <div style={{position: "absolute", left: VIDEO.x + 300, top: VIDEO.y + 70, width: 600, opacity: window01(f, R.caption, R.audio, 0.4, 0.3), background: "rgba(9,13,24,.92)", color: "#fff", borderRadius: 20, padding: "22px 26px", boxShadow: "0 20px 50px rgba(0,0,0,.5)"}}>
              <div style={{display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 800}}><MessageSquareText size={32} color="#60a5fa" />Caption</div>
              <div style={{fontSize: 23, marginTop: 10, lineHeight: 1.4, color: "rgba(255,255,255,.9)"}}>At the end, say “Caption,” then talk about <b>this</b> video: what was hard, what went well, what was different.</div>
              <div style={{fontSize: 23, marginTop: 10, fontWeight: 800, color: "#fbbf24"}}>You always have to say something.</div>
            </div>
          )}
          {/* "go back a little" hint */}
          {[R.back1, R.back2].map((b, i) => window01(f, b[0] - 0.1, b[0] + 2.0, 0.2, 0.3) > 0 ? (
            <div key={i} style={{position: "absolute", left: VIDEO.x + VIDEO.w / 2, top: VIDEO.y + 80, transform: "translateX(-50%)", opacity: window01(f, b[0] - 0.1, b[0] + 2.0, 0.2, 0.3), background: "#2563eb", color: "#fff", borderRadius: 999, padding: "10px 22px", fontSize: 24, fontWeight: 800, whiteSpace: "nowrap"}}>
              ⟲ A little back: watch the whole action
            </div>
          ) : null)}
          {clicks.map(([c, p], i) => <Ripple key={i} f={f} at={c} p={p} color={i === 0 ? "#ef4444" : "#2563eb"} />)}
          <Cursor p={track<Pt>(f, {x: 1600, y: 980}, cursorKeys)} pressed={press} opacity={Math.max(0, ease(f, 0.6, 0.5) - ease(f, R.recap, 0.4))} />
        </World>
        {t >= R.recap && (
          <AbsoluteFill style={{background: `rgba(5,8,15,${0.8 * ease(f, R.recap, 0.6)})`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14}}>
            {[["●", "Rec"], ["M", "Say name"], ["◎", "Click beside the face"], ["+0.85", "Skip to an action"], ["⟲", "Back a little"], ["🎙", "“Action, …” + click"], ["💬", "“Caption, …”"]].map(([k, l], i) => {
              const p = Math.min(1, Math.max(0, (t - R.recap - 0.3 - i * 0.22) / 0.35));
              return (
                <div key={i} style={{width: 210, height: 200, background: "#fff", borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textAlign: "center", padding: 12, boxSizing: "border-box"}}>
                  <div style={{minWidth: 64, height: 64, padding: "0 8px", borderRadius: 16, background: i === 0 ? "#ef4444" : "#2563eb", color: "#fff", fontSize: k.length > 2 ? 22 : 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: monoFamily}}>{k}</div>
                  <div style={{fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.2}}>{l}</div>
                </div>
              );
            })}
          </AbsoluteFill>
        )}
        <StepIndicator show={ease(f, 0.3, 0.8) - ease(f, R.recap, 0.4)} step={R.step.step} total={R.step.total} title={R.step.title} />
        {caps.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
