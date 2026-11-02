// Scene 3 overlays (world coordinates unless noted). BLUE = doing, RED = recording / critical, GREEN = success.
import React from "react";
import {Check, Coffee, Hourglass, Mic, MousePointerClick, Pause, Play, Repeat, X, Circle} from "lucide-react";
import {CONFIG3 as K} from "./config3";
import {MIC, RHYTHM, STRIP, VIDEO3, cellRect} from "../gp/layout3";
import {DancerThumb, Move} from "../gp/dancers3";
import {monoFamily} from "../shared";
import type {Rect} from "../scene2/layout2";

export const BLUE = "#3b82f6", BLUE_L = "#60a5fa", RED = "#ef4444", GREEN = "#22c55e", GREEN_D = "#15803d";
export const glass: React.CSSProperties = {
  background: "rgba(9,13,24,.86)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 14,
  boxShadow: "0 16px 36px rgba(0,0,0,.45)", boxSizing: "border-box", color: "#fff",
};
const at = (r: Rect): React.CSSProperties => ({position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h});

/* ── REC badge (top-left of the video) ── */
export const RecBadge: React.FC<{show: number; time: number; blink: number}> = ({show, time, blink}) =>
  show <= 0 ? null : (
    <div style={{
      position: "absolute", left: VIDEO3.x + 14, top: VIDEO3.y + 40, opacity: show, transform: `scale(${0.8 + 0.2 * show})`, transformOrigin: "0 0",
      background: "rgba(127,29,29,.92)", color: "#fff", borderRadius: 8, padding: "6px 12px", fontWeight: 800, fontSize: 18,
      display: "flex", alignItems: "center", gap: 8, boxShadow: "0 6px 16px rgba(0,0,0,.4)",
    }}>
      <div style={{width: 12, height: 12, borderRadius: "50%", background: RED, opacity: 0.4 + 0.6 * blink}} />
      REC <span style={{fontFamily: monoFamily, fontWeight: 600, opacity: 0.85}}>{time.toFixed(1)} s</span>
    </div>
  );

/* ── Microphone with live waveform + speech bubble ── */
export const MicWidget: React.FC<{show: number; level: number; t: number; bubble: string | null; bubbleShow: number; gapShow: number}> = ({
  show, level, t, bubble, bubbleShow, gapShow,
}) => {
  if (show <= 0) return null;
  const bars = Array.from({length: 26}, (_, i) => {
    const n = Math.sin(t * 17 + i * 1.7) * 0.5 + Math.sin(t * 29 + i * 0.9) * 0.5;
    const shape = Math.exp(-Math.pow((i - 13) / 8, 2));
    const hgt = 4 + Math.abs(n) * (6 + 34 * level * shape);
    return <div key={i} style={{width: 4, height: hgt, borderRadius: 2, background: level > 0.4 ? RED : "rgba(248,113,113,.75)"}} />;
  });
  return (
    <div style={{...at(MIC), opacity: show, transform: `translateY(${(1 - show) * 20}px)`}}>
      <div style={{...glass, position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", border: `1px solid rgba(239,68,68,${0.3 + 0.5 * level})`}}>
        <div style={{width: 42, height: 42, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${8 + 20 * level}px ${RED}`}}>
          <Mic size={24} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 3, height: 50}}>{bars}</div>
      </div>
      {bubble && bubbleShow > 0 && (
        <div style={{
          position: "absolute", left: 20, bottom: MIC.h + 14, opacity: bubbleShow, transform: `scale(${0.7 + 0.3 * bubbleShow})`, transformOrigin: "10% 100%",
          background: "#fff", color: "#111", borderRadius: 16, padding: "12px 20px", fontSize: 28, fontWeight: 800, whiteSpace: "nowrap",
          boxShadow: "0 12px 30px rgba(0,0,0,.4)",
        }}>
          {bubble}
          <div style={{position: "absolute", left: 26, bottom: -12, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "14px solid #fff"}} />
        </div>
      )}
      {gapShow > 0 && (
        <div style={{
          position: "absolute", left: 20, bottom: MIC.h + 14, opacity: gapShow, background: "rgba(9,13,24,.9)", color: "#fff", borderRadius: 16,
          padding: "10px 18px", fontSize: 30, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,.2)",
        }}>
          <Hourglass size={24} color={BLUE_L} /> … <span style={{fontSize: 16, fontWeight: 600, opacity: 0.7}}>½ s</span>
        </div>
      )}
    </div>
  );
};

/* ── The rhythm: Pause → "Action, …" → … → Click cell ── */
export const RhythmRow: React.FC<{show: number; active: number; done: number; say: string}> = ({show, active, done, say}) => {
  if (show <= 0) return null;
  const steps = [
    {icon: <Pause size={20} />, label: "Pause"},
    {icon: <Mic size={20} />, label: `"Action, ${say}"`},
    {icon: <Hourglass size={20} />, label: "…"},
    {icon: <MousePointerClick size={20} />, label: "Click cell"},
  ];
  return (
    <div style={{...at(RHYTHM), opacity: show, display: "flex", alignItems: "center", justifyContent: "center", gap: 8}}>
      {steps.map((s, i) => {
        const on = i === active;
        const past = i < done;
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{color: "rgba(255,255,255,.7)", fontSize: 22, fontWeight: 800}}>→</div>}
            <div style={{
              ...glass, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", fontSize: 19, fontWeight: 700, whiteSpace: "nowrap",
              background: on ? BLUE : past ? "rgba(30,58,138,.9)" : "rgba(9,13,24,.82)", transform: `scale(${on ? 1.1 : 1})`,
              border: on ? "2px solid #bfdbfe" : "1px solid rgba(255,255,255,.14)",
            }}>
              <span style={{display: "flex", alignItems: "center"}}>{s.icon}</span>
              {s.label}
              {past && !on && <Check size={16} color={GREEN} strokeWidth={3.5} />}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── Big pause flash in the middle of the video ── */
export const PauseFlash: React.FC<{p: number}> = ({p}) =>
  p <= 0 || p >= 1 ? null : (
    <div style={{
      position: "absolute", left: VIDEO3.x + VIDEO3.w / 2 - 70, top: VIDEO3.y + VIDEO3.h / 2 - 70, width: 140, height: 140, borderRadius: "50%",
      background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center",
      opacity: p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8, transform: `scale(${0.7 + 0.5 * Math.min(1, p * 3)})`,
    }}>
      <Pause size={80} color="#fff" fill="#fff" />
    </div>
  );

/* ── Too early vs. at the peak ── */
export const PeakThumbs: React.FC<{show: number; dancer: number; peakV: number; moves: Move[]}> = ({show, dancer, peakV, moves}) => {
  if (show <= 0) return null;
  const card = (ok: boolean, v: number, label: string) => (
    <div style={{...glass, width: 210, padding: 8, border: `3px solid ${ok ? GREEN : RED}`}}>
      <div style={{borderRadius: 8, overflow: "hidden"}}><DancerThumb i={dancer} v={v} moves={moves} w={190} h={250} /></div>
      <div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 19, fontWeight: 800, color: ok ? "#86efac" : "#fca5a5"}}>
        <div style={{width: 26, height: 26, borderRadius: "50%", background: ok ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center"}}>
          {ok ? <Check size={17} color="#fff" strokeWidth={4} /> : <X size={17} color="#fff" strokeWidth={4} />}
        </div>
        {label}
      </div>
    </div>
  );
  return (
    <div style={{position: "absolute", left: VIDEO3.x + 640, top: VIDEO3.y + 86, display: "flex", gap: 18, opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
      {card(false, peakV - 0.3, "hands rising")}
      {card(true, peakV, "hands fully up")}
    </div>
  );
};

/* ── Clicked cell: blue 3D pop + label ── */
export const CellPop: React.FC<{cell: string; pop: number; label: number; time: number}> = ({cell, pop, label, time}) => {
  if (pop <= 0 && label <= 0) return null;
  const r = cellRect(cell);
  return (
    <>
      <div style={{
        ...at(r), borderRadius: 4, background: `rgba(37,99,235,${0.75 * Math.min(1, pop)})`, border: "2px solid #bfdbfe", boxSizing: "border-box",
        transform: `perspective(400px) translateZ(${30 * pop}px) translateY(${-5 * pop}px)`, opacity: Math.min(1, pop * 2),
        boxShadow: `0 ${10 * pop}px ${18 * pop}px rgba(0,0,0,.55), 0 0 ${20 * pop}px rgba(96,165,250,.8)`,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: monoFamily, fontWeight: 800, fontSize: 15,
      }}>{cell}</div>
      {label > 0 && (
        <div style={{
          position: "absolute", left: r.x + r.w / 2, top: r.y - 52, transform: `translateX(-50%) scale(${0.8 + 0.2 * label})`, opacity: label,
          background: BLUE, color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 20, fontWeight: 800, whiteSpace: "nowrap",
          boxShadow: "0 10px 24px rgba(0,0,0,.45)",
        }}>
          Target cell {cell} · <span style={{fontFamily: monoFamily}}>{time.toFixed(3)} s</span>
        </div>
      )}
    </>
  );
};

/* ── The 0.3 s rule: action markers on a timeline under the video ── */
export const RuleStrip: React.FC<{slide: number; dots: number; tooClose: number; ok: number}> = ({slide, dots, tooClose, ok}) => {
  if (slide <= 0) return null;
  const v0 = 1.8, v1 = 6.3;
  const PX = (STRIP.w - 60) / (v1 - v0);
  const X = (v: number) => 30 + (v - v0) * PX;
  const acts = K.actions;
  const [a1, a2, close, far] = [acts[0], acts[1], acts[2], acts[3]];
  const lineY = 78;
  const dot = (v: number, i: number, color: string, crossed = false) => {
    const s = Math.min(1, Math.max(0, dots * 4 - i));
    return (
      <g key={i} transform={`translate(${X(v)}, ${lineY})`} opacity={s}>
        <circle r={11 * s} fill={color} stroke="#fff" strokeWidth={2.5} />
        {crossed && <path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke={RED} strokeWidth={4} strokeLinecap="round" opacity={tooClose} />}
        <text y={34} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize={15} fontWeight={700} fontFamily={monoFamily}>{v.toFixed(2)}</text>
      </g>
    );
  };
  const grey = `rgb(${Math.round(59 + (107 - 59) * tooClose)},${Math.round(130 + (114 - 130) * tooClose)},${Math.round(246 + (128 - 246) * tooClose)})`;
  return (
    <div style={{...at(STRIP), ...glass, borderRadius: 0, opacity: slide, transform: `translateY(${(1 - slide) * 40}px)`, border: "1px solid rgba(96,165,250,.4)"}}>
      <div style={{position: "absolute", left: 16, top: 8, fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: BLUE_L}}>YOUR ACTIONS</div>
      <svg width={STRIP.w} height={STRIP.h} style={{position: "absolute", inset: 0, overflow: "visible"}}>
        <line x1={20} x2={STRIP.w - 20} y1={lineY} y2={lineY} stroke="rgba(255,255,255,.3)" strokeWidth={2} />
        {/* too close */}
        <g opacity={tooClose}>
          <path d={`M${X(a2.v)} ${lineY - 22} v-10 H${X(close.v)} v10`} fill="none" stroke={RED} strokeWidth={3} />
          <path d={`M${X(a2.v) - 12} ${lineY - 52} H${(X(a2.v) + X(close.v)) / 2} V${lineY - 32}`} fill="none" stroke={RED} strokeWidth={2} />
          <rect x={X(a2.v) - 222} y={lineY - 67} width={210} height={30} rx={7} fill={RED} />
          <text x={X(a2.v) - 117} y={lineY - 46} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={800}>{"< 0.3 s · Too close, skip it"}</text>
        </g>
        {/* far enough */}
        <g opacity={ok}>
          <path d={`M${X(a2.v)} ${lineY + 44} v8 H${X(far.v)} v-8`} fill="none" stroke={GREEN} strokeWidth={3} />
          <rect x={X(close.v) + 40} y={lineY - 67} width={260} height={30} rx={7} fill={GREEN_D} />
          <text x={X(close.v) + 170} y={lineY - 46} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={800}>{"≥ 0.3 s ✓ record this one"}</text>
        </g>
        {dot(a1.v, 0, BLUE)}
        {dot(a2.v, 1, BLUE)}
        {dot(close.v, 2, grey, true)}
        {dot(far.v, 3, ok > 0.5 ? GREEN : BLUE)}
      </svg>
    </div>
  );
};

/* ── Screen-space cards ── */
export const TipCard: React.FC<{show: number}> = ({show}) =>
  show <= 0 ? null : (
    <div style={{
      position: "absolute", left: 230, top: 330, width: 620, opacity: show, transform: `translateY(${(1 - show) * 30}px) scale(${0.95 + 0.05 * show})`,
      background: "#fff", borderRadius: 22, padding: "28px 32px", display: "flex", gap: 24, alignItems: "center", boxShadow: "0 30px 70px rgba(0,0,0,.5)",
    }}>
      <div style={{width: 84, height: 84, borderRadius: 20, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none"}}>
        <Coffee size={48} color="#92400e" />
      </div>
      <div>
        <div style={{fontSize: 30, fontWeight: 800, color: "#111"}}>{K.tipCard.title}</div>
        <div style={{fontSize: 23, color: "#444", marginTop: 6, lineHeight: 1.35}}>{K.tipCard.text}</div>
      </div>
    </div>
  );

export const EndZoneCallout: React.FC<{show: number; x: number; y: number}> = ({show, x, y}) =>
  show <= 0 ? null : (
    <div style={{position: "absolute", left: x, top: y, opacity: show, transform: `translate(-100%, -100%) translateY(${(1 - show) * -10}px)`}}>
      <div style={{
        ...glass, padding: "8px 14px", fontSize: 18, fontWeight: 800, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10,
        border: "1px solid rgba(255,255,255,.4)",
      }}>
        <div style={{width: 26, height: 16, borderRadius: 3, background: "repeating-linear-gradient(45deg, #9ca3af 0 3px, #4b5563 3px 6px)"}} />
        {K.endZoneLabel}
      </div>
      <div style={{position: "absolute", right: 8, bottom: -16, width: 2, height: 16, background: "rgba(255,255,255,.7)"}} />
    </div>
  );

export const RecapRow: React.FC<{f: number; startFrame: number; show: number}> = ({f, startFrame, show}) => {
  if (show <= 0) return null;
  const icons = [<Circle key="r" size={28} fill={RED} color={RED} />, <Play key="p" size={28} />, <Pause key="pa" size={28} />, <Mic key="m" size={28} />, <MousePointerClick key="c" size={28} />, <Repeat key="re" size={28} />];
  return (
    <div style={{position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: show}}>
      {K.recap.map((label, i) => {
        const p = Math.min(1, Math.max(0, (f - startFrame - i * 8) / 10));
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{color: "#fff", fontSize: 30, fontWeight: 800, opacity: p}}>→</div>}
            <div style={{
              background: "#fff", borderRadius: 18, padding: "16px 16px", width: i === 5 ? 210 : 150, height: 150, boxSizing: "border-box",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center",
              opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`, boxShadow: "0 20px 40px rgba(0,0,0,.45)",
              color: i === 0 ? RED : "#1d4ed8",
            }}>
              {icons[i]}
              <div style={{fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2}}>{label}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
