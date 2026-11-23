// Step 4: send (new way): Export audio → the transcription website → transcribe, copy the text →
// back in Grid Player: Watch it + tick, paste the text, Send → "Are you done?" → Done + code → next link.
import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Copy, FileAudio, Loader2, UploadCloud} from "lucide-react";
import {CONFIG} from "../config";
import {ease, pop, track, window01} from "../anim";
import {BrowserWindow, C, IDLE_DOWNLOAD} from "../ui";
import {APP_Y, WIN} from "../layout";
import {Backdrop, Cam, Caption, CaptionSpec, Cursor, Pt, Ripple, StepIndicator, World, clickPress, fontFamily, monoFamily} from "../shared";
import {Keycap} from "../scene2/overlays";
import {CODE_INPUT, DoneModal, REMOVE_BTN, RollCounter} from "../scene5/parts5";
import {CONFIG5} from "../scene5/config5";
import {AUDIO_BTN, DURATION, GridPlayer4, MUSIC, SEND_BTN, SEND_TEXT, TRANSCRIPT, TRUE_BPM, VSTAGE, WATCH_BTN, WATCH_TICK} from "./GridApp4";
import {MOVES4} from "./RecordScene";

const fps = CONFIG.fps;
export const SEND = {
  step: {step: 4, total: 4, title: "Send to Studio Mirrors"},
  audio: 2.0, toSite: 2.4, upload: 3.7, transcribe: 5.1, lines: [6.8, 8.4] as const, copy: 9.2,
  back: 10.9, watch: 12.0, watched: 15.0, tick: 15.6, box: 16.6, paste: 17.1, send: 18.6, ask: 20.0,
  done: 21.6, typing: [22.4, 23.4] as const, remove: 24.2, flip: 24.8, recap: 27.2, end: 33.4,
  site: {name: "TurboScribe", url: "turboscribe.ai", file: "recording.webm", info: "0:39 · audio"},
  captions: [
    {from: 0.4, to: 2.3, text: "Done recording? Click Export audio"},
    {from: 2.4, to: 4.9, text: "The transcription website opens"},
    {from: 5.0, to: 9.0, text: "Upload the recording and transcribe it"},
    {from: 9.1, to: 10.8, text: "Copy the text"},
    {from: 10.9, to: 15.4, text: "Back in Grid Player: Watch it"},
    {from: 15.5, to: 16.5, text: "Tick: it plays, it's the right part"},
    {from: 16.6, to: 18.5, text: "Paste the text in the box"},
    {from: 18.6, to: 19.9, text: "Click Send"},
    {from: 20.0, to: 24.6, text: "Done, then your code"},
    {from: 24.7, to: 27.1, text: "Done! On to the next video", color: "#15803d"},
    {from: 27.2, to: 33.4, text: "Export, transcribe, copy, paste, Send", color: "#15803d"},
  ],
};
const S = SEND;
export const SEND_FRAMES = Math.round(S.end * fps);
const center = (r: {x: number; y: number; w: number; h: number}) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

/* transcription website (world coordinates) */
const X0 = WIN.x + 300, CW = 1160;
const DROP = {x: X0, y: APP_Y + 110, w: CW, h: 170};
const TRANSCRIBE = {x: X0, y: APP_Y + 304, w: 240, h: 56};
const TEXTBOX = {x: X0, y: APP_Y + 384, w: CW, h: 300};
const COPY = {x: X0 + CW - 160, y: APP_Y + 396, w: 140, h: 44};
const ASK = {x: 430, y: 390, w: 680, h: 270};
const ASK_DONE = {x: ASK.x + 24, y: ASK.y + 196, w: 160, h: 48};

const SitePage: React.FC<{f: number; t: number}> = ({f, t}) => {
  const rel = (r: {x: number; y: number; w: number; h: number}): React.CSSProperties => ({position: "absolute", left: r.x - WIN.x, top: r.y - APP_Y, width: r.w, height: r.h});
  const up = t >= S.upload + 0.3, busy = t >= S.transcribe && t < S.lines[0], reveal = Math.max(0, Math.min(1, (t - S.lines[0]) / (S.lines[1] - S.lines[0])));
  return (
    <div style={{position: "absolute", left: 0, top: APP_Y - WIN.y, width: WIN.w, height: WIN.h - (APP_Y - WIN.y), background: "#f5f7fb", color: "#111", fontFamily}}>
      <div style={{position: "absolute", left: X0 - WIN.x, top: 30, fontSize: 32, fontWeight: 800}}>{S.site.name}</div>
      <div style={{position: "absolute", left: X0 - WIN.x, top: 74, fontSize: 17, color: "#555"}}>Upload your recording, then transcribe it.</div>
      <div style={{...rel(DROP), border: `2px dashed ${up ? "#22c55e" : "#94a3b8"}`, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, boxSizing: "border-box"}}>
        {up ? (
          <div style={{display: "flex", alignItems: "center", gap: 14, transform: `scale(${pop(f, S.upload + 0.3)})`}}>
            <FileAudio size={44} color="#2563eb" /><div><div style={{fontSize: 22, fontWeight: 700}}>{S.site.file}</div><div style={{fontSize: 16, color: "#666"}}>{S.site.info}</div></div>
          </div>
        ) : (<><UploadCloud size={44} color="#64748b" /><div style={{fontSize: 22, fontWeight: 600}}>Click or drop your audio file here</div></>)}
      </div>
      <div style={{...rel(TRANSCRIBE), borderRadius: 12, background: up ? "#2563eb" : "#93a8d8", color: "#fff", fontSize: 21, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${1 - 0.06 * clickPress(f, S.transcribe)})`}}>
        {busy ? <><Loader2 size={22} style={{transform: `rotate(${t * 400}deg)`}} />Transcribing…</> : "Transcribe"}
      </div>
      <div style={{...rel(TEXTBOX), background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", boxSizing: "border-box", fontSize: 21, lineHeight: 1.55, color: "#222"}}>
        <div style={{fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: "#64748b", marginBottom: 8}}>TRANSCRIPT</div>
        <div style={{width: CW - 230}}>{TRANSCRIPT.slice(0, Math.round(TRANSCRIPT.length * reveal))}</div>
      </div>
      {reveal >= 1 && (
        <div style={{...rel(COPY), borderRadius: 10, border: "1px solid #cbd5e1", background: clickPress(f, S.copy) > 0.2 ? "#e0e7ff" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 18, fontWeight: 700}}><Copy size={18} />Copy</div>
      )}
      {window01(f, S.copy + 0.1, S.copy + 1.4, 0.2, 0.25) > 0 && (
        <div style={{position: "absolute", left: COPY.x - WIN.x - 20, top: COPY.y - APP_Y + 54, opacity: window01(f, S.copy + 0.1, S.copy + 1.4, 0.2, 0.25), background: "#111", color: "#fff", borderRadius: 999, padding: "8px 16px", fontSize: 16, fontWeight: 600}}>Copied</div>
      )}
    </div>
  );
};

export const SendScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade = interpolate(t, [0, 0.8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) * interpolate(t, [S.end - 1, S.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const page = ease(f, S.toSite, 0.5) - ease(f, S.back, 0.5);
  const onSite = page > 0.5;
  const sendMode = t >= S.back;
  // watching: the trimmed clip plays (sped up in the tutorial)
  const wv = t >= S.watch ? Math.min(11.46, ((t - S.watch) / (S.watched - S.watch)) * 11.46) : 5.5;
  const cleared = ease(f, S.remove + 0.3, 0.6);

  const cam = track<Cam>(f, {cx: 960, cy: 570, z: 0.86, rx: 8, ry: -8}, [
    {at: 0, dur: 1.8, v: {cx: 1250, cy: 760, z: 1.2, rx: 0, ry: 0}},
    {at: S.toSite, dur: 1.2, v: {cx: 960, cy: 500, z: 1.0, rx: 0, ry: 0}},
    {at: S.back, dur: 1.2, v: {cx: 1250, cy: 700, z: 1.18, rx: 0, ry: 0}},
    {at: S.ask - 0.2, dur: 1.0, v: {cx: 900, cy: 560, z: 1.0, rx: 0, ry: 0}},
    {at: S.recap - 0.3, dur: 1.2, v: {cx: 960, cy: 560, z: 0.92, rx: 0, ry: 0}},
  ]);
  const clicks: [number, Pt][] = [
    [S.audio, center(AUDIO_BTN)], [S.upload, center(DROP)], [S.transcribe, center(TRANSCRIBE)], [S.copy, center(COPY)],
    [S.watch, center(WATCH_BTN)], [S.tick, {x: WATCH_TICK.x - 2, y: WATCH_TICK.y}], [S.box, center(SEND_TEXT)], [S.send, center(SEND_BTN)],
    [S.done, center(ASK_DONE)], [S.typing[0] - 0.4, {x: CODE_INPUT.x + 100, y: CODE_INPUT.y + 24}], [S.remove, center(REMOVE_BTN)],
  ];
  const cursorKeys = clicks.map(([c, p], i) => ({at: c - (i === 0 ? 1.0 : 0.8), dur: 0.65, v: p, arc: 0.1}));
  cursorKeys.push({at: S.remove + 0.6, dur: 1, v: {x: 1000, y: 900}, arc: 0.1});
  const press = Math.max(...clicks.map(([c]) => clickPress(f, c)));

  const ask = t >= S.ask ? pop(f, S.ask) - ease(f, S.done + 0.1, 0.3) : 0;
  const modal = t >= S.done + 0.2 ? pop(f, S.done + 0.2) - ease(f, S.remove + 0.15, 0.3) : 0;
  const typed = Math.floor(Math.max(0, Math.min(1, (t - S.typing[0]) / (S.typing[1] - S.typing[0]))) * CONFIG5.code.length);
  const caps: CaptionSpec[] = S.captions.map((c) => ({...c, step: null}));

  return (
    <AbsoluteFill style={{background: "#000", fontFamily}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <BrowserWindow download={IDLE_DOWNLOAD} tabTitle={onSite ? S.site.name : "sample_dance.mp4 - Grid Player"} url={onSite ? S.site.url : "gridplayer.app"}>
            <div style={{position: "absolute", inset: 0, opacity: 1 - page}}>
              <GridPlayer4
                title="sample_dance.mp4 - Grid Player" grid={{beat1: MUSIC, bpm: TRUE_BPM}} out={null}
                video={{v: sendMode ? wv : 5.5, playing: t >= S.watch && t < S.watched, moves: MOVES4, grid: sendMode ? 0.35 : 1, fx: {scale: 1 - 0.2 * cleared, opacity: 1 - cleared}}}
                clock={sendMode ? wv : 5.5}
                side={sendMode
                  ? {mode: "send", watchPress: clickPress(f, S.watch), watched: t >= S.watched ? 1 : 0, ticked: t >= S.tick ? 1 : 0, text: t >= S.paste ? Math.min(1, (t - S.paste) / 0.25) : 0, sendPress: clickPress(f, S.send), sending: t >= S.send && t < S.ask}
                  : {mode: "record", recOn: true, recTime: 39.2, recPress: 0, namePress: 0, audioPress: clickPress(f, S.audio)}}
                link={{flip: ease(f, S.flip, 0.9), next: {...CONFIG5.nextLink, waiting: <RollCounter from={14} p={ease(f, S.flip + 0.8, 0.6)} />}}}
                status="not recording…"
                stageAfter={cleared > 0.3 ? (
                  <div style={{position: "absolute", left: VSTAGE.w / 2 - 150, top: VSTAGE.h / 2 - 80, width: 300, height: 160, borderRadius: 16, border: "2px dashed #4a4a45", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, opacity: cleared, color: "#fff"}}>
                    <div style={{fontSize: 25, fontWeight: 700}}>📂 Open a video</div><div style={{color: "#a8a8a0", fontSize: 18}}>or drop it anywhere</div>
                  </div>
                ) : null}
              />
            </div>
            {page > 0 && <div style={{position: "absolute", inset: 0, opacity: page, transform: `translateX(${(1 - page) * 40}px)`}}><SitePage f={f} t={t} /></div>}
          </BrowserWindow>
          {/* "✓ Sent. Are you done with this video?" */}
          {ask > 0 && (
            <>
              <div style={{position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, background: `rgba(0,0,0,${0.45 * ask})`}} />
              <div style={{position: "absolute", left: ASK.x, top: ASK.y, width: ASK.w, height: ASK.h, opacity: ask, transform: `scale(${0.9 + 0.1 * ask})`, background: "#fff", borderRadius: 18, padding: 24, boxSizing: "border-box", boxShadow: "0 30px 80px rgba(0,0,0,.5)", color: C.text}}>
                <div style={{fontSize: 25, fontWeight: 800}}>✓ Sent. Are you done with this video?</div>
                <div style={{fontSize: 16, color: "#444", marginTop: 8}}>Sample User · {CONFIG5.modalLink.replace("https://f-d.app/", "")}</div>
                <div style={{fontSize: 18, color: C.ok, fontWeight: 700, marginTop: 14}}>✓ The video: sent<br />✓ The transcript: sent</div>
                <div style={{position: "absolute", left: 24, top: ASK_DONE.y - ASK.y, display: "flex", gap: 12}}>
                  <div style={{width: ASK_DONE.w, height: ASK_DONE.h, borderRadius: 10, background: C.accent, color: "#fff", fontWeight: 800, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.06 * clickPress(f, S.done)})`}}>✔ Done</div>
                  <div style={{height: 48, padding: "0 18px", display: "flex", alignItems: "center", fontSize: 18, color: "#555"}}>Not yet</div>
                </div>
              </div>
            </>
          )}
          {modal > 0 && <div style={{position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, background: `rgba(0,0,0,${0.45 * modal})`}} />}
          <DoneModal show={Math.max(0, modal)} focus={t >= S.typing[0] - 0.4 ? 1 : 0} typed={typed} press={clickPress(f, S.remove)} />
          <Keycap label="Ctrl V" w={170} x={SEND_TEXT.x + SEND_TEXT.w / 2} y={SEND_TEXT.y - 70} color={C.accent} show={window01(f, S.paste - 0.4, S.paste + 1.1, 0.25, 0.3)} press={clickPress(f, S.paste)} />
          {clicks.map(([c, p], i) => <Ripple key={i} f={f} at={c} p={p} />)}
          <Cursor p={track<Pt>(f, {x: 1600, y: 980}, cursorKeys)} pressed={press} opacity={Math.max(0, ease(f, 0.6, 0.5) - ease(f, S.recap, 0.4))} />
        </World>
        {t >= S.recap && (
          <AbsoluteFill style={{background: `rgba(5,8,15,${0.8 * ease(f, S.recap, 0.6)})`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14}}>
            {[["⬇", "Export audio"], ["≡", "Transcribe on the website"], ["⧉", "Copy the text"], ["▶", "Watch it + tick"], ["⎘", "Paste the text"], ["✉", "Send"], ["✔", "Done + code"]].map(([k, l], i) => {
              const p = Math.min(1, Math.max(0, (t - S.recap - 0.3 - i * 0.22) / 0.35));
              return (
                <div key={i} style={{width: 210, height: 200, background: "#fff", borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, textAlign: "center", padding: 12, boxSizing: "border-box"}}>
                  <div style={{width: 64, height: 64, borderRadius: 16, background: i === 6 ? "#15803d" : "#2563eb", color: "#fff", fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: monoFamily}}>{k}</div>
                  <div style={{fontSize: 22, fontWeight: 800, color: "#111", lineHeight: 1.2}}>{l}</div>
                </div>
              );
            })}
          </AbsoluteFill>
        )}
        <StepIndicator show={ease(f, 0.3, 0.8) - ease(f, S.recap, 0.4)} step={S.step.step} total={S.step.total} title={S.step.title} />
        {caps.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

void DURATION;
