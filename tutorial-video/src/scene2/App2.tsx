// Grid Player app with a loaded video: player on the left, NEXT LINK / timer / TRIM cards on the right.
import React from "react";
import {CONFIG2} from "./config2";
import {AppTitleBar, C, LinkCard} from "../ui";
import {SIDEBAR_W, SIDEBAR_X, STAGE, WIN} from "../layout";
import {OUT_BTN, Rect, TIMER_CARD, TRIM_BTN, TRIM_CARD} from "./layout2";
import {CheckIcon} from "../icons";
import {monoFamily} from "../shared";

const rel = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x - SIDEBAR_X, top: r.y - STAGE.y, width: r.w, height: r.h});
const card: React.CSSProperties = {background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxSizing: "border-box"};
const kbd: React.CSSProperties = {fontFamily: monoFamily, fontSize: 12, color: C.muted, background: "#f1f1ed", borderRadius: 4, padding: "1px 6px"};

const TimerCard: React.FC<{v: number}> = ({v}) => (
  <div style={{...rel(TIMER_CARD), ...card, padding: "16px 20px"}}>
    <div style={{fontFamily: monoFamily, fontSize: 36, fontWeight: 700, letterSpacing: 1, color: C.text}}>{v.toFixed(3)} s</div>
    <div style={{display: "flex", marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", width: "fit-content"}}>
      {["0.3x", "0.5x", "0.75x", "1x", "3x"].map((s, i) => (
        <div key={s} style={{
          padding: "7px 12px", fontSize: 17, borderLeft: i ? `1px solid ${C.line}` : "none",
          background: s === "1x" ? C.accent : C.panel, color: s === "1x" ? "#fff" : C.text, fontWeight: s === "1x" ? 600 : 400,
        }}>{s}</div>
      ))}
    </div>
  </div>
);

const TrimCard: React.FC<{outPress: number; outSet: number; trimPress: number; trimDone: number}> = ({outPress, outSet, trimPress, trimDone}) => {
  const btn: React.CSSProperties = {
    position: "absolute", top: OUT_BTN.y - TRIM_CARD.y, height: OUT_BTN.h, borderRadius: 8, boxSizing: "border-box",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 18,
  };
  return (
    <div style={{...rel(TRIM_CARD), ...card}}>
      <div style={{position: "absolute", left: 20, top: 18, fontSize: 15, fontWeight: 600, letterSpacing: 1.6, color: C.muted}}>TRIM</div>
      <div style={{...btn, left: 20, width: 96, border: `1px solid ${C.line}`}}>[ In <span style={kbd}>I</span></div>
      <div style={{
        ...btn, left: OUT_BTN.x - TRIM_CARD.x, width: OUT_BTN.w,
        border: `${outSet > 0.5 ? 2 : 1}px solid ${outSet > 0.5 ? "#ef4444" : C.line}`,
        background: outSet > 0.5 ? "#fef2f2" : C.panel, color: outSet > 0.5 ? "#b91c1c" : C.text, fontWeight: outSet > 0.5 ? 600 : 400,
        transform: `scale(${1 - 0.08 * outPress})`,
      }}>Out ] <span style={kbd}>O</span></div>
      <div style={{...btn, left: 240, width: 100, color: C.muted}}>Clear <span style={kbd}>X</span></div>
      <div style={{
        ...btn, left: TRIM_BTN.x - TRIM_CARD.x, top: TRIM_BTN.y - TRIM_CARD.y, width: TRIM_BTN.w, height: TRIM_BTN.h,
        background: trimDone > 0.5 ? C.ok : C.accent, color: "#fff", fontWeight: 700, fontSize: 19,
        transform: `scale(${1 - 0.05 * trimPress})`,
      }}>
        {trimDone > 0.5 ? <><CheckIcon size={18} /> Trimmed</> : <>✂ Trim &amp; continue <span style={{...kbd, color: "#fff", background: "rgba(255,255,255,.22)"}}>Enter</span></>}
      </div>
    </div>
  );
};

export type AppState = {
  v: number; outPress: number; outSet: number; trimPress: number; trimDone: number;
};

export const GridPlayerApp2: React.FC<{s: AppState; video: React.ReactNode}> = ({s, video}) => {
  const c = CONFIG2.content;
  return (
    <>
      <AppTitleBar title={`${c.fileName} - Grid Player`} />
      <div style={{position: "absolute", left: 0, top: STAGE.y - WIN.y, width: STAGE.w, height: STAGE.h, background: "#000", overflow: "hidden"}}>
        {video}
        <div style={{position: "absolute", inset: 0, boxShadow: `inset 0 0 0 2px ${C.stageGreen}`}} />
      </div>
      <div style={{position: "absolute", left: STAGE.w, top: STAGE.y - WIN.y, width: SIDEBAR_W, height: STAGE.h, background: C.bg}}>
        <LinkCard highlight={0} press={0} />
        <TimerCard v={s.v} />
        <TrimCard outPress={s.outPress} outSet={s.outSet} trimPress={s.trimPress} trimDone={s.trimDone} />
        <div style={{position: "absolute", left: 20, right: 20, bottom: 18, fontSize: 15, color: C.muted, display: "flex", justifyContent: "space-between"}}>
          <span>{c.videoSize} · {c.videoDuration.toFixed(3)} s · Grid 20×20</span>
          <span style={{color: C.accent}}>Open another</span>
        </div>
      </div>
    </>
  );
};
