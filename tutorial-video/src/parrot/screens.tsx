// Phone screens for the Parrot tutorial. Screen-local coordinates (0..SW × 0..SH), same phone as the FindDancer video.
import React from "react";
import {ArrowUp, Copy, Mic, Plus, RotateCcw, SquarePen, ThumbsDown, ThumbsUp, Menu, ChevronDown, Lock} from "lucide-react";
import {StatusBar, SW, SH} from "../finder/phone";
import {PARROT as K} from "./config";

const sans = "Inter, system-ui, sans-serif";
export const P = {bg: "#f3f7f5", card: "#ffffff", ink: "#142420", soft: "#5d6f69", line: "#dde7e3", brand: "#0f9d75", brandDark: "#0b7a5b", ok: "#1f9d55", err: "#c0392b", warn: "#b7791f"};

/* ── Parrot layout ── */
const CARD_Y = 96;
export const DOCK_BTN = {x: SW / 2, y: SH - 66};
export const OPEN_BTN = {x: SW / 2, y: CARD_Y + 228};
export const SKIP_COPY = {x: 74, y: CARD_Y + 176};
export const SKIP_PASTE = {x: 74, y: CARD_Y + 344};
export const CANCEL_LINK = {x: 46, y: CARD_Y + 176};
export const WAITING = {x: SW - 56, y: 63};

export type ParrotStep = "loading" | "copy" | "paste" | "fix" | "ready" | "sending" | "empty";

const Dots: React.FC<{n: number}> = ({n}) => (
  <div style={{display: "flex", gap: 6}}>{[1, 2, 3].map((i) => <span key={i} style={{flex: 1, height: 5, borderRadius: 3, background: i <= n ? P.brand : P.line}} />)}</div>
);
const LinkBtn: React.FC<{children: React.ReactNode; hi?: number}> = ({children, hi = 0}) => (
  <span style={{color: P.brandDark, fontWeight: 600, fontSize: 15, textDecoration: "underline", textUnderlineOffset: 3, padding: "6px 4px", borderRadius: 8,
    background: hi > 0 ? `rgba(15,157,117,${0.18 * hi})` : "transparent", boxShadow: hi > 0 ? `0 0 0 ${3 * hi}px rgba(15,157,117,.5)` : "none"}}>{children}</span>
);

export const ParrotScreen: React.FC<{
  step: ParrotStep; name: string; waiting: number; left?: number; toast?: {text: string; p: number};
  press?: number; openPress?: number; cardIn?: number; waitingHi?: number; skipHi?: number; cancelHi?: number; aiHi?: number; lockBadge?: number;
}> = ({step, name, waiting, left = 3, toast, press = 0, openPress = 0, cardIn = 1, waitingHi = 0, skipHi = 0, cancelHi = 0, aiHi = 0, lockBadge = 0}) => {
  const stepNo = step === "copy" ? 1 : step === "ready" || step === "sending" ? 3 : 2;
  const button =
    step === "copy" ? {label: "Copy for AI", bg: P.brand}
    : step === "paste" ? {label: "Paste the answer", bg: P.brand}
    : step === "fix" ? {label: "Copy fix request", bg: P.warn}
    : step === "ready" ? {label: `Send now (${left})`, bg: P.brand}
    : step === "sending" ? {label: "Sending", bg: P.brand, ring: true}
    : step === "empty" ? {label: "Check again", bg: P.brand}
    : null;
  return (
    <div style={{position: "absolute", inset: 0, background: P.bg, color: P.ink, fontFamily: sans, overflow: "hidden"}}>
      <StatusBar dark={false} />
      <div style={{position: "absolute", left: 16, right: 16, top: 44, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span style={{fontWeight: 800, fontSize: 21, letterSpacing: -0.4}}>🦜 Parrot</span>
        <span style={{fontSize: 15, color: P.soft, padding: "4px 8px", borderRadius: 8, background: waitingHi > 0 ? `rgba(15,157,117,${0.15 * waitingHi})` : "transparent",
          boxShadow: waitingHi > 0 ? `0 0 0 ${3 * waitingHi}px rgba(15,157,117,.55)` : "none", fontWeight: waitingHi > 0.5 ? 700 : 400}}>{waiting ? `${waiting} waiting` : ""}</span>
      </div>
      {step === "loading" && <div style={{position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", color: P.soft, fontSize: 15}}>Finding the next one…</div>}
      {step === "empty" && (
        <div style={{position: "absolute", left: 20, right: 20, top: 260, textAlign: "center"}}>
          <div style={{fontSize: 70}}>🎉</div>
          <div style={{fontSize: 19, marginTop: 8}}>Nothing to do right now.</div>
          <div style={{fontSize: 15, color: P.soft, marginTop: 8}}>New ones show up here by themselves.</div>
        </div>
      )}
      {step !== "loading" && step !== "empty" && (
        <div style={{
          position: "absolute", left: 16, right: 16, top: CARD_Y, background: P.card, border: `1px solid ${P.line}`, borderRadius: 20, padding: "22px 20px",
          boxShadow: "0 6px 24px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", gap: 14,
          transform: `translateX(${(1 - cardIn) * 110}%)`, opacity: Math.min(1, cardIn * 2),
        }}>
          <Dots n={stepNo} />
          <div style={{fontSize: 31, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1}}>{name}</div>
          {step === "copy" && (
            <>
              <div style={{fontSize: 18}}>Copy it, then paste it into your AI app (ChatGPT, Claude, Gemini…).</div>
              <div><LinkBtn hi={skipHi}>Skip this one</LinkBtn></div>
            </>
          )}
          {step === "paste" && (
            <>
              <div style={{fontSize: 18}}>Paste it into {K.ai}. When it answers, copy its whole answer and come back.</div>
              <div style={{textAlign: "center", padding: 13, borderRadius: 14, border: `2px solid ${P.brand}`, color: P.brandDark, fontWeight: 700, fontSize: 17,
                background: openPress > 0 ? `rgba(15,157,117,${0.15 * openPress})` : "transparent", transform: `scale(${1 - 0.04 * openPress})`}}>Open {K.ai} ↗</div>
              <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
                <LinkBtn hi={aiHi}>Use Claude</LinkBtn><LinkBtn hi={aiHi}>Use Gemini</LinkBtn><LinkBtn>Copy again</LinkBtn>
              </div>
              <div><LinkBtn hi={skipHi}>Skip this one</LinkBtn></div>
            </>
          )}
          {step === "fix" && (
            <>
              <div style={{fontSize: 18}}>The answer isn't quite right yet.</div>
              <div style={{display: "flex", flexDirection: "column", gap: 9, paddingLeft: 4}}>
                {[0.86, 0.7, 0.78].map((w, i) => (
                  <div key={i} style={{display: "flex", alignItems: "center", gap: 8}}>
                    <span style={{width: 6, height: 6, borderRadius: 3, background: P.err}} />
                    <span style={{height: 11, width: `${w * 100}%`, borderRadius: 6, background: "rgba(192,57,43,.45)", filter: "blur(2px)"}} />
                  </div>
                ))}
              </div>
              <div style={{fontSize: 14, color: P.soft}}>Copy the fix request, paste it into the same chat, then copy the new answer.</div>
            </>
          )}
          {(step === "ready" || step === "sending") && (
            <>
              <div style={{fontSize: 19, color: P.ok, fontWeight: 700}}>✓ Looks good</div>
              <div style={{fontSize: 14, color: P.soft}}>{K.captionsCount} captions · tags @{K.tagUser}</div>
              {step === "ready" && <div><LinkBtn hi={cancelHi}>Cancel</LinkBtn></div>}
            </>
          )}
          {lockBadge > 0 && (
            <div style={{position: "absolute", right: 14, top: 14, opacity: lockBadge, transform: `scale(${lockBadge})`, background: P.ink, color: "#fff", borderRadius: 999, padding: "5px 10px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 5}}>
              <Lock size={13} />Yours for 15 min
            </div>
          )}
        </div>
      )}
      {button && (
        <div style={{position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 16px 36px", background: `linear-gradient(rgba(243,247,245,0), ${P.bg} 30%)`}}>
          <div style={{height: 60, borderRadius: 16, background: button.bg, color: "#fff", fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 18px ${button.bg === P.warn ? "rgba(183,121,31,.3)" : "rgba(15,157,117,.35)"}`, transform: `scale(${1 - 0.04 * press})`, filter: press > 0.3 ? "brightness(.88)" : "none"}}>
            {button.ring && <span style={{width: 18, height: 18, border: "3px solid rgba(255,255,255,.5)", borderTopColor: "#fff", borderRadius: "50%", marginRight: 10}} />}
            {button.label}
          </div>
        </div>
      )}
      {toast && toast.p > 0 && (
        <div style={{position: "absolute", left: "50%", top: 52, transform: `translateX(-50%) translateY(${(1 - toast.p) * -12}px)`, opacity: toast.p, background: P.ink, color: P.bg,
          padding: "10px 16px", borderRadius: 999, fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", zIndex: 5}}>{toast.text}</div>
      )}
    </div>
  );
};

/* ── home screen ── */
export const PARROT_ICON = {x: 150, y: 352};
const APPS = [
  ["📷", "Camera", "#3a3a3c"], ["🖼️", "Photos", "#fff"], ["✉️", "Mail", "#2f80ed"], ["🗺️", "Maps", "#d6f0d0"],
  ["⏰", "Clock", "#111"], ["📝", "Notes", "#fff6c8"], ["🎵", "Music", "#fa2d48"], ["⚙️", "Settings", "#8e8e93"],
  ["💬", "ChatGPT", "#111"], ["🦜", "Parrot", "#0f9d75"], ["🌤️", "Weather", "#4aa3ff"], ["📅", "Calendar", "#fff"],
];
export const HomeScreen: React.FC<{press: number; zoom: number}> = ({press, zoom}) => (
  <div style={{position: "absolute", inset: 0, background: "linear-gradient(160deg, #2a5f8f, #6a3fa0 60%, #c25a7c)", fontFamily: sans, overflow: "hidden"}}>
    <StatusBar dark />
    {APPS.map(([e, l, bg], i) => {
      const x = 50 + (i % 4) * 100, y = 130 + Math.floor(i / 4) * 111;
      const parrot = l === "Parrot";
      return (
        <div key={l} style={{position: "absolute", left: x - 34, top: y - 34, width: 68, textAlign: "center", transform: parrot ? `scale(${1 - 0.1 * press})` : undefined}}>
          <div style={{width: 68, height: 68, borderRadius: 16, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 4px 10px rgba(0,0,0,.25)"}}>{e}</div>
          <div style={{color: "#fff", fontSize: 13, marginTop: 5, fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,.5)"}}>{l}</div>
        </div>
      );
    })}
    <div style={{position: "absolute", left: 18, right: 18, bottom: 24, height: 92, borderRadius: 30, background: "rgba(255,255,255,.25)"}} />
    {zoom > 0 && (
      <div style={{position: "absolute", left: PARROT_ICON.x - 34 - (PARROT_ICON.x - 34) * zoom, top: 352 - 34 - 318 * zoom, width: 68 + (SW - 68) * zoom, height: 68 + (SH - 68) * zoom,
        borderRadius: 16 + 34 * zoom, background: P.bg, opacity: Math.min(1, zoom * 3), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 * (1 - zoom)}}>🦜</div>
    )}
  </div>
);

/* ── the AI chat (content always blurred) ── */
export const SEND_BTN = {x: SW - 42, y: SH - 64};
export const CHAT_BOX = {x: 170, y: SH - 64};
export const PASTE_POP = {x: 96, y: SH - 118};
export const copyIconAt = (round: number) => ({x: 34, y: round === 0 ? 470 : 760});

const Bars: React.FC<{n: number; reveal?: number; dark?: boolean}> = ({n, reveal = 1, dark}) => (
  <div style={{display: "flex", flexDirection: "column", gap: 9, filter: "blur(3.5px)"}}>
    {Array.from({length: n}, (_, i) => {
      const w = [0.95, 0.88, 0.97, 0.7, 0.92, 0.84, 0.6, 0.9, 0.75][i % 9];
      const on = Math.min(1, Math.max(0, reveal * n - i));
      return <div key={i} style={{height: 12, width: `${w * 100 * on}%`, borderRadius: 6, background: dark ? "#5b6170" : "#9aa1ab"}} />;
    })}
  </div>
);

export type ChatMsg = {who: "me" | "ai"; reveal: number; lines: number};
export const ChatScreen: React.FC<{
  msgs: ChatMsg[]; boxFilled: boolean; longPress: number; pastePop: number; sendPress: number; thinking: number; copyShow: number; copyPress: number; toast: number; compact?: boolean;
}> = ({msgs, boxFilled, longPress, pastePop, sendPress, thinking, copyShow, copyPress, toast, compact}) => {
  let y = compact ? 96 : 110;
  const blocks = msgs.map((m, i) => {
    const h = m.who === "me" ? 40 + m.lines * 8 : 20 + m.lines * 21;
    const el = (
      <div key={i} style={{position: "absolute", top: y, left: m.who === "me" ? 110 : 22, right: m.who === "me" ? 16 : 22, opacity: Math.min(1, m.reveal * 4)}}>
        {m.who === "me" ? (
          <div style={{background: "#f0f0f0", borderRadius: 20, padding: "14px 16px"}}><Bars n={Math.min(2, m.lines)} /></div>
        ) : <Bars n={m.lines} reveal={m.reveal} dark />}
      </div>
    );
    y += h + 26;
    return el;
  });
  const lastAi = [...msgs].reverse().find((m) => m.who === "ai");
  const copyY = y - 18;
  return (
    <div style={{position: "absolute", inset: 0, background: "#fff", fontFamily: sans, color: "#111", overflow: "hidden"}}>
      <StatusBar dark={false} />
      <div style={{position: "absolute", left: 16, right: 16, top: 46, height: 40, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <Menu size={24} />
        <span style={{fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 4}}>{K.ai}<ChevronDown size={18} /></span>
        <SquarePen size={22} />
      </div>
      {msgs.length === 0 && <div style={{position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 24, fontWeight: 600}}>What can I help with?</div>}
      {blocks}
      {thinking > 0 && <div style={{position: "absolute", left: 24, top: y - 6, width: 14, height: 14, borderRadius: 7, background: "#111", opacity: 0.4 + 0.6 * thinking}} />}
      {lastAi && copyShow > 0 && (
        <div style={{position: "absolute", left: 22, top: copyY, display: "flex", gap: 18, color: "#666", opacity: copyShow}}>
          <span style={{padding: 4, borderRadius: 8, background: copyPress > 0 ? `rgba(0,0,0,${0.12 * copyPress})` : "transparent", boxShadow: copyShow > 0.5 ? "0 0 0 3px rgba(15,157,117,.55)" : "none"}}><Copy size={20} /></span>
          <ThumbsUp size={20} /><ThumbsDown size={20} /><RotateCcw size={20} />
        </div>
      )}
      {/* message box */}
      <div style={{position: "absolute", left: 14, right: 14, bottom: 36, height: 56, borderRadius: 28, background: "#f4f4f4", border: "1px solid #e3e3e3", display: "flex", alignItems: "center", padding: "0 8px 0 14px", gap: 10,
        boxShadow: longPress > 0 ? `0 0 0 ${3 * longPress}px rgba(15,157,117,.45)` : "none"}}>
        <Plus size={22} color="#555" />
        <div style={{flex: 1, overflow: "hidden"}}>{boxFilled ? <Bars n={1} /> : <span style={{color: "#8e8e8e", fontSize: 17}}>Ask anything</span>}</div>
        <Mic size={22} color="#555" />
        <div style={{width: 40, height: 40, borderRadius: 20, background: boxFilled ? "#111" : "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.12 * sendPress})`}}>
          <ArrowUp size={22} color="#fff" strokeWidth={3} />
        </div>
      </div>
      {pastePop > 0 && (
        <div style={{position: "absolute", left: PASTE_POP.x - 42, top: PASTE_POP.y - 20, opacity: pastePop, transform: `scale(${0.8 + 0.2 * pastePop})`, background: "#1c1c1e", color: "#fff", borderRadius: 9, padding: "9px 18px", fontSize: 15, fontWeight: 600}}>Paste</div>
      )}
      {toast > 0 && (
        <div style={{position: "absolute", left: "50%", bottom: 110, transform: "translateX(-50%)", opacity: toast, background: "#111", color: "#fff", padding: "9px 16px", borderRadius: 999, fontSize: 15, fontWeight: 600, whiteSpace: "nowrap"}}>Copied</div>
      )}
    </div>
  );
};
export const chatCopyIconY = (msgs: ChatMsg[], compact?: boolean) => {
  let y = compact ? 96 : 110;
  for (const m of msgs) y += (m.who === "me" ? 40 + m.lines * 8 : 20 + m.lines * 21) + 26;
  return y - 18 + 14;
};

/* ── iPhone "Allow Paste" alert ── */
export const ALLOW_BTN = {x: SW / 2, y: 470};
export const AllowPaste: React.FC<{p: number; press: number}> = ({p, press}) =>
  p <= 0 ? null : (
    <>
      <div style={{position: "absolute", inset: 0, background: `rgba(0,0,0,${0.3 * p})`}} />
      <div style={{position: "absolute", left: 66, right: 66, top: 330, borderRadius: 16, background: "rgba(245,245,247,.97)", fontFamily: sans, textAlign: "center", opacity: p, transform: `scale(${0.9 + 0.1 * p})`, overflow: "hidden"}}>
        <div style={{padding: "18px 14px 14px", fontSize: 16, fontWeight: 700, color: "#111"}}>“Parrot” would like to paste from “{K.ai}”</div>
        <div style={{borderTop: "1px solid #ccc", padding: 12, color: "#0a7cff", fontSize: 16}}>Don't Allow Paste</div>
        <div style={{borderTop: "1px solid #ccc", padding: 12, color: "#0a7cff", fontSize: 16, fontWeight: 700, background: press > 0 ? `rgba(0,0,0,${0.08 * press})` : "transparent"}}>Allow Paste</div>
      </div>
    </>
  );
