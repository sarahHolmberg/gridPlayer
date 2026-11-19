import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {ArrowRight, Check, ClipboardPaste, Copy, ExternalLink, Lock, PartyPopper, Send, SkipForward, RotateCcw} from "lucide-react";
import {CONFIG, sec} from "../config";
import {PARROT as K} from "./config";
import {ease, pop, track, window01} from "../anim";
import {Backdrop, Cam, Pt, Ripple, StepIndicator, World, clickPress, fontFamily} from "../shared";
import {PHONE, SCREEN, SW, SH, toWorld} from "../finder/phone";
import {
  ALLOW_BTN, AllowPaste, CHAT_BOX, ChatMsg, ChatScreen, DOCK_BTN, HomeScreen, OPEN_BTN, PARROT_ICON, PASTE_POP, P, ParrotScreen, ParrotStep, SEND_BTN,
  SKIP_COPY, WAITING, chatCopyIconY,
} from "./screens";

const fps = CONFIG.fps;
const GREEN = "#22c55e", BLUE = "#3b82f6";

/* ── scene start times ── */
type Key = (typeof K.scenes)[number]["key"];
const S = {} as Record<Key | "end", number>;
{
  let t = 0;
  for (const s of K.scenes) { S[s.key as Key] = t; t += s.dur; }
  S.end = t + K.fade;
}
export const PARROT_FRAMES = Math.round(S.end * fps);

/* ── chat contents ── */
const R1: ChatMsg[] = [{who: "me", reveal: 1, lines: 2}, {who: "ai", reveal: 1, lines: 9}];
const R2base: ChatMsg[] = [{who: "me", reveal: 1, lines: 2}, {who: "ai", reveal: 1, lines: 6}];
const R2: ChatMsg[] = [...R2base, {who: "me", reveal: 1, lines: 2}, {who: "ai", reveal: 1, lines: 5}];

/* ── taps ── */
const READY1 = S.send + 0.5; // countdown starts
const READY2 = S.fix + 12.0;
const T = {
  icon: {at: S.open + 2.0, p: PARROT_ICON},
  copy: {at: S.copy + 1.0, p: DOCK_BTN},
  open: {at: S.ai + 1.2, p: OPEN_BTN},
  hold: {at: S.paste + 0.9, p: CHAT_BOX},
  paste: {at: S.paste + 1.8, p: PASTE_POP},
  send: {at: S.paste + 2.5, p: SEND_BTN},
  copyAns: {at: S.answer + 1.4, p: {x: 36, y: chatCopyIconY(R1)}},
  pasteAns: {at: S.back + 1.6, p: DOCK_BTN},
  allow: {at: S.back + 4.2, p: ALLOW_BTN},
  copyFix: {at: S.fix + 2.2, p: DOCK_BTN},
  hold2: {at: S.fix + 4.4, p: CHAT_BOX},
  paste2: {at: S.fix + 5.3, p: PASTE_POP},
  send2: {at: S.fix + 5.9, p: SEND_BTN},
  copyAns2: {at: S.fix + 8.9, p: {x: 36, y: chatCopyIconY(R2, true)}},
  pasteAns2: {at: S.fix + 10.6, p: DOCK_BTN},
  allow2: {at: S.fix + 11.7, p: ALLOW_BTN},
  skip: {at: S.tips + 2.6, p: SKIP_COPY},
};
const TAPS = Object.values(T).sort((a, b) => a.at - b.at);

/* ── which app is on screen ── */
type App = "parrot" | "home" | "chat";
const APPS: {at: number; app: App; kind: "fade" | "slide" | "back"}[] = [
  {at: 0, app: "parrot", kind: "fade"},
  {at: S.open, app: "home", kind: "fade"},
  {at: S.open + 2.6, app: "parrot", kind: "fade"},
  {at: S.ai + 1.35, app: "chat", kind: "slide"},
  {at: S.back + 0.5, app: "parrot", kind: "back"},
  {at: S.fix + 3.4, app: "chat", kind: "slide"},
  {at: S.fix + 9.7, app: "parrot", kind: "back"},
];

/* ── subtitles: the voice line, one sentence at a time ── */
const SUBS = K.scenes.flatMap((s) => {
  const parts = s.voice.match(/[^.?!]+[.?!]+/g) ?? [s.voice];
  const words = parts.map((p) => p.trim().split(/\s+/).length);
  const total = words.reduce((a, b) => a + b, 0);
  const t0 = S[s.key as Key] + 0.25, span = s.dur - 0.5;
  let acc = 0;
  return parts.map((p, i) => {
    const from = t0 + (acc / total) * span;
    acc += words[i];
    return {from, to: t0 + (acc / total) * span, text: p.trim()};
  });
});

const Subtitle: React.FC<{f: number}> = ({f}) => {
  const t = f / fps;
  const s = SUBS.find((x) => t >= x.from && t < x.to);
  if (!s) return null;
  const p = Math.min(1, (t - s.from) / 0.25, (s.to - t) / 0.2);
  return (
    <div style={{position: "absolute", left: 110, bottom: 70, maxWidth: 900, opacity: p, transform: `translateY(${(1 - Math.min(1, (t - s.from) / 0.25)) * 14}px)`,
      background: "rgba(255,255,255,.95)", borderRadius: 16, padding: "18px 26px", fontSize: 34, fontWeight: 600, color: "#111", lineHeight: 1.3,
      boxShadow: "0 20px 50px rgba(0,0,0,.35)", borderLeft: `8px solid ${P.brand}`}}>
      {s.text}
    </div>
  );
};

/* ── left column ── */
const Panel: React.FC<{show: number; children: React.ReactNode; top?: number}> = ({show, children, top = 150}) =>
  show <= 0 ? null : (
    <div style={{position: "absolute", left: 200, top, width: 760, opacity: show, transform: `translateX(${(1 - show) * -30}px)`,
      background: "rgba(9,13,24,.88)", borderRadius: 22, padding: "26px 30px", boxSizing: "border-box", color: "#fff", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 20px 50px rgba(0,0,0,.4)"}}>
      {children}
    </div>
  );

const TAP_ICONS = [Copy, ExternalLink, Send, Copy, ClipboardPaste];
const Tracker: React.FC<{f: number; t: number; show: number}> = ({f, t, show}) => {
  const round1 = [T.copy.at, T.open.at, T.send.at, T.copyAns.at, T.pasteAns.at];
  const doneAt = t < S.next ? round1 : [Infinity, Infinity, Infinity, Infinity, Infinity];
  return (
    <Panel show={show}>
      <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.6)", marginBottom: 12}}>THE 5 TAPS</div>
      {K.taps.map((l, i) => {
        const done = t >= doneAt[i];
        const cur = !done && (i === 0 || t >= doneAt[i - 1]);
        const Ic = TAP_ICONS[i];
        const p = done ? pop(f, doneAt[i]) : 0;
        return (
          <div key={l} style={{display: "flex", alignItems: "center", gap: 16, padding: "9px 0", fontSize: 30, fontWeight: 700, color: done || cur ? "#fff" : "rgba(255,255,255,.45)"}}>
            <div style={{width: 46, height: 46, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
              background: done ? GREEN : cur ? P.brand : "transparent", border: `3px solid ${done ? GREEN : cur ? P.brand : "rgba(255,255,255,.25)"}`, transform: `scale(${done ? 0.7 + 0.3 * p : 1})`,
              boxShadow: cur ? `0 0 ${12 + 8 * Math.sin(t * 6)}px ${P.brand}` : "none"}}>
              {done ? <Check size={26} color="#fff" strokeWidth={4} /> : <Ic size={22} color="#fff" />}
            </div>
            <span style={{color: "rgba(255,255,255,.5)", fontSize: 24, width: 22}}>{i + 1}</span>{l}
          </div>
        );
      })}
    </Panel>
  );
};

export const ParrotScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade = interpolate(t, [0, 0.8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [S.end - K.fade, S.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const tap = (k: keyof typeof T) => clickPress(f, T[k].at);

  const cam = track<Cam>(f, {cx: 1000, cy: 560, z: 0.92, rx: 8, ry: -10}, [
    {at: 0, dur: 2.2, v: {cx: 1000, cy: 545, z: 1.02, rx: 0, ry: -3}},
    {at: S.recap - 0.4, dur: 1.2, v: {cx: 960, cy: 540, z: 1, rx: 0, ry: 0}},
  ]);

  /* ── Parrot state over time ── */
  const parrot = (): React.ReactNode => {
    const name1 = K.names[0], name2 = K.names[1];
    const toastWin = (a: number, b: number, text: string) => (t >= a && t < b + 0.3 ? {text, p: window01(f, a, b, 0.2, 0.25)} : undefined);
    let step: ParrotStep = "copy", name = name1, waiting = K.waiting, left = 3, cardIn = 1;
    let toast: {text: string; p: number} | undefined;
    let press = 0;
    if (t < S.open + 3.2 && t >= S.open) step = "loading";
    if (t >= T.copy.at + 0.15) step = "paste";
    if (t >= T.allow.at + 0.2) {
      step = "ready";
      left = Math.max(1, 3 - Math.floor(Math.max(0, t - READY1)));
      if (t < READY1) left = 3;
      if (t >= READY1 + 3) step = "sending";
    }
    if (t >= S.next - 0.4) { step = "loading"; waiting = K.waiting - 1; }
    if (t >= S.next + 0.1) { step = "copy"; name = name2; cardIn = ease(f, S.next + 0.1, 0.6); }
    if (t >= S.fix + 0.4) step = "fix";
    if (t >= T.copyFix.at + 0.15) step = "paste";
    if (t >= T.allow2.at + 0.2) { step = "ready"; left = Math.max(1, 3 - Math.floor(Math.max(0, t - READY2))); }
    if (t >= S.tips) { step = "copy"; name = name2; cardIn = 1; }
    if (t >= T.skip.at + 0.4) { name = "Brave Koala"; cardIn = ease(f, T.skip.at + 0.4, 0.6); }
    if (t >= S.tips + 10.8) { step = "empty"; waiting = 0; }

    press = Math.max(tap("copy"), tap("pasteAns"), tap("copyFix"), tap("pasteAns2"));
    toast =
      toastWin(T.copy.at + 0.1, T.copy.at + 2.2, "Copied: paste it into your AI") ??
      toastWin(S.next - 0.6, S.next + 0.9, `Sent ${name1} 🦜`) ??
      toastWin(T.copyFix.at + 0.1, T.copyFix.at + 1.6, "Copied: paste it into the same chat") ??
      toastWin(T.skip.at + 0.1, T.skip.at + 2.2, "Skipped: it goes to the back of the line");
    return (
      <>
        <ParrotScreen step={step} name={name} waiting={waiting} left={left} toast={toast} press={press} openPress={tap("open")} cardIn={cardIn}
          waitingHi={window01(f, S.open + 4.0, S.open + 8.6, 0.4, 0.4)}
          skipHi={window01(f, S.tips + 0.6, T.skip.at + 0.2, 0.3, 0.2)}
          cancelHi={window01(f, READY1 + 0.6, READY1 + 2.8, 0.3, 0.3)} />
        <AllowPaste p={Math.max(window01(f, T.pasteAns.at + 0.3, T.allow.at + 0.2, 0.25, 0.2), window01(f, T.pasteAns2.at + 0.3, T.allow2.at + 0.2, 0.25, 0.2))}
          press={Math.max(tap("allow"), tap("allow2"))} />
      </>
    );
  };

  const chat = (): React.ReactNode => {
    if (t < S.fix) {
      const sent = t >= T.send.at;
      const msgs: ChatMsg[] = sent ? [R1[0], ...(t >= S.paste + 3.3 ? [{...R1[1], reveal: Math.min(1, (t - (S.paste + 3.3)) / 2.3)}] : [])] : [];
      return <ChatScreen msgs={msgs} boxFilled={t >= T.paste.at && !sent} longPress={window01(f, T.hold.at - 0.1, T.paste.at, 0.2, 0.2)}
        pastePop={window01(f, T.hold.at + 0.3, T.paste.at + 0.1, 0.2, 0.15)} sendPress={tap("send")}
        thinking={sent && t < S.paste + 3.3 ? 0.5 + 0.5 * Math.sin(t * 10) : 0} copyShow={ease(f, S.answer + 0.2, 0.5)} copyPress={tap("copyAns")}
        toast={window01(f, T.copyAns.at + 0.1, T.copyAns.at + 1.8, 0.2, 0.25)} />;
    }
    const sent = t >= T.send2.at;
    const msgs: ChatMsg[] = [...R2base, ...(sent ? [R2[2]] : []), ...(t >= S.fix + 6.5 ? [{...R2[3], reveal: Math.min(1, (t - (S.fix + 6.5)) / 1.7)}] : [])];
    return <ChatScreen compact msgs={msgs} boxFilled={t >= T.paste2.at && !sent} longPress={window01(f, T.hold2.at - 0.1, T.paste2.at, 0.2, 0.2)}
      pastePop={window01(f, T.hold2.at + 0.3, T.paste2.at + 0.1, 0.2, 0.15)} sendPress={tap("send2")}
      thinking={sent && t < S.fix + 6.5 ? 0.5 + 0.5 * Math.sin(t * 10) : 0} copyShow={ease(f, S.fix + 8.3, 0.4)} copyPress={tap("copyAns2")}
      toast={window01(f, T.copyAns2.at + 0.1, T.copyAns2.at + 1.4, 0.2, 0.25)} />;
  };

  const render = (app: App) =>
    app === "parrot" ? parrot() : app === "chat" ? chat() : <HomeScreen press={tap("icon")} zoom={ease(f, T.icon.at + 0.1, 0.5)} />;

  let ci = 0;
  APPS.forEach((a, i) => { if (t >= a.at) ci = i; });
  const cur = APPS[ci], prev = APPS[Math.max(0, ci - 1)];
  const tp = ci === 0 ? 1 : Math.min(1, Math.max(0, (t - cur.at) / 0.45));
  const e = 1 - Math.pow(1 - tp, 3);
  const L = (node: React.ReactNode, style: React.CSSProperties) => <div style={{position: "absolute", inset: 0, ...style}}>{node}</div>;
  const screens = tp >= 1 ? L(render(cur.app), {}) : cur.kind === "fade" ? (
    <>{L(render(prev.app), {})}{L(render(cur.app), {opacity: e})}</>
  ) : cur.kind === "slide" ? (
    <>{L(render(prev.app), {transform: `translateX(${-100 * e}%)`})}{L(render(cur.app), {transform: `translateX(${100 * (1 - e)}%)`})}</>
  ) : (
    <>{L(render(prev.app), {transform: `translateX(${100 * e}%)`})}{L(render(cur.app), {transform: `translateX(${-100 * (1 - e)}%)`})}</>
  );

  /* finger */
  const finger = track<Pt>(f, toWorld({x: SW / 2, y: SH + 80}), TAPS.map((tp2) => ({at: tp2.at - 0.75, dur: 0.6, v: toWorld(tp2.p), arc: 0.08})));
  const pressed = Math.max(...TAPS.map((tp2) => clickPress(f, tp2.at)), window01(f, T.hold.at - 0.1, T.hold.at + 0.5, 0.1, 0.1), window01(f, T.hold2.at - 0.1, T.hold2.at + 0.5, 0.1, 0.1));
  const fingerShow = ease(f, S.open + 0.6, 0.5) - ease(f, S.recap - 0.4, 0.4);

  /* left column visibility */
  const intro = window01(f, 0.6, S.open + 0.3, 0.6, 0.4);
  const tracker = window01(f, S.open + 0.4, S.fix + 0.2, 0.5, 0.3) + window01(f, S.next, S.fix + 0.1, 0.01, 0.3) * 0;
  const aiCard = window01(f, S.ai + 2.6, S.paste + 0.3, 0.4, 0.3);
  const fixCard = window01(f, S.fix + 0.2, S.tips, 0.5, 0.3);
  const tipsCard = window01(f, S.tips + 0.2, S.recap, 0.5, 0.3);
  const sceneIdx = Math.max(0, K.scenes.findIndex((s, i) => t >= S[s.key as Key] && t < S[s.key as Key] + s.dur));
  const fixDone = [T.copyFix.at, T.send2.at, T.copyAns2.at, T.pasteAns2.at];

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: "#111"}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Panel show={intro} top={200}>
            <div style={{fontSize: 72, fontWeight: 900, letterSpacing: -1.5}}>🦜 Parrot</div>
            <div style={{fontSize: 40, fontWeight: 700, marginTop: 4}}>How to do a task</div>
            <div style={{fontSize: 26, color: "rgba(255,255,255,.7)", marginTop: 6}}>About 30 seconds each</div>
            {["One card = one task", "Through an AI and back", "No reading: just follow the buttons"].map((l, i) => (
              <div key={l} style={{display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600, marginTop: i ? 12 : 30, opacity: ease(f, 2.2 + i * 1.6, 0.6)}}>
                <Check size={30} color={GREEN} strokeWidth={4} />{l}
              </div>
            ))}
          </Panel>
          <Tracker f={f} t={t} show={Math.min(1, tracker)} />
          <Panel show={aiCard} top={560}>
            <div style={{fontSize: 28, fontWeight: 700}}>Prefer Claude or Gemini?</div>
            <div style={{fontSize: 26, color: "rgba(255,255,255,.8)", marginTop: 8}}>Tap <b style={{color: "#6ee7b7"}}>Use Claude</b> or <b style={{color: "#6ee7b7"}}>Use Gemini</b> once. Parrot remembers it.</div>
          </Panel>
          <Panel show={fixCard}>
            <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "#fbbf24", marginBottom: 12, display: "flex", alignItems: "center", gap: 10}}><RotateCcw size={20} />IF IT NEEDS A FIX</div>
            {K.fixLoop.map((l, i) => {
              const done = t >= fixDone[i];
              const curr = !done && (i === 0 ? t >= S.fix + 0.4 : t >= fixDone[i - 1]);
              return (
                <div key={l} style={{display: "flex", alignItems: "center", gap: 16, padding: "9px 0", fontSize: 30, fontWeight: 700, color: done || curr ? "#fff" : "rgba(255,255,255,.45)"}}>
                  <div style={{width: 46, height: 46, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
                    background: done ? GREEN : curr ? P.warn : "transparent", border: `3px solid ${done ? GREEN : curr ? P.warn : "rgba(255,255,255,.25)"}`}}>
                    {done ? <Check size={26} color="#fff" strokeWidth={4} /> : <span style={{fontSize: 22}}>{i + 1}</span>}
                  </div>
                  {l}
                </div>
              );
            })}
            <div style={{marginTop: 14, fontSize: 24, color: "rgba(255,255,255,.75)"}}>Same chat. No typing, no reading.</div>
          </Panel>
          <Panel show={tipsCard}>
            <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.6)", marginBottom: 6}}>GOOD TO KNOW</div>
            {K.tips.map((tp2, i) => {
              const Ic = tp2.icon === "skip" ? SkipForward : tp2.icon === "lock" ? Lock : PartyPopper;
              const at = S.tips + [0.3, 5.4, 10.8][i];
              const on = ease(f, at, 0.5);
              const active = t >= at && t < S.tips + [5.4, 10.8, 99][i];
              return (
                <div key={i} style={{display: "flex", gap: 18, alignItems: "flex-start", marginTop: 18, opacity: 0.35 + 0.65 * on * (active ? 1 : 0.75)}}>
                  <div style={{width: 58, height: 58, borderRadius: 16, flex: "none", background: active ? P.brand : "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center"}}><Ic size={30} color="#fff" /></div>
                  <div><div style={{fontSize: 28, fontWeight: 800}}>{tp2.title}</div><div style={{fontSize: 24, color: "rgba(255,255,255,.8)", marginTop: 4}}>{tp2.text}</div></div>
                </div>
              );
            })}
          </Panel>

          {/* phone */}
          <div style={{position: "absolute", left: PHONE.x, top: PHONE.y, width: PHONE.w, height: PHONE.h, borderRadius: 64, background: "#0b0b0c", boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 0 0 3px #2a2a2e"}}>
            <div style={{position: "absolute", left: SCREEN.x - PHONE.x, top: SCREEN.y - PHONE.y, width: SW, height: SH, borderRadius: 50, overflow: "hidden", background: "#000"}}>{screens}</div>
          </div>
          {TAPS.map((tp2, i) => <Ripple key={i} f={f} at={tp2.at} p={toWorld(tp2.p)} color="#ffffff" />)}
          {fingerShow > 0 && (
            <div style={{position: "absolute", left: finger.x - 26, top: finger.y - 26, width: 52, height: 52, borderRadius: "50%", opacity: fingerShow * 0.9,
              background: "rgba(255,255,255,.55)", border: "3px solid #fff", boxSizing: "border-box", transform: `scale(${1 - 0.25 * pressed})`, boxShadow: "0 6px 16px rgba(0,0,0,.45)"}} />
          )}
        </World>

        {/* recap */}
        {t >= S.recap && (
          <AbsoluteFill style={{background: `rgba(5,8,15,${0.8 * ease(f, S.recap, 0.6)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46}}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 16}}>
              {K.taps.map((l, i) => {
                const Ic = TAP_ICONS[i];
                const p = Math.min(1, Math.max(0, (f - sec(S.recap + 0.4) - i * 8) / 10));
                return (
                  <React.Fragment key={l}>
                    {i > 0 && <ArrowRight size={34} color="#fff" style={{opacity: p, flex: "none"}} />}
                    <div style={{width: 250, height: 210, flex: "none", background: "#fff", borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
                      opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: "0 20px 40px rgba(0,0,0,.45)", textAlign: "center", padding: 12, boxSizing: "border-box"}}>
                      <div style={{fontSize: 20, fontWeight: 800, color: "#9ca3af"}}>{i + 1}</div>
                      <div style={{width: 70, height: 70, borderRadius: "50%", background: i === 4 ? GREEN : P.brand, display: "flex", alignItems: "center", justifyContent: "center"}}><Ic size={36} color="#fff" /></div>
                      <div style={{fontSize: 26, fontWeight: 800, color: "#111"}}>{l}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{fontSize: 44, fontWeight: 800, color: "#fff", opacity: ease(f, S.recap + 1.4, 0.6)}}>⏱ {K.recapLine}</div>
          </AbsoluteFill>
        )}

        <StepIndicator show={ease(f, 0.3, 0.8) - ease(f, S.recap, 0.4)} step={sceneIdx + 1} total={K.scenes.length} title={K.scenes[sceneIdx].title} />
        <Subtitle f={f} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

void BLUE; void WAITING;
