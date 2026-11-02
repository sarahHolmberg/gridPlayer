import React from "react";
import {
  ADDR_H, CARD, CARD_ROWS, DROP_BOX, LINK_BOX, SIDEBAR_W, SIDEBAR_X, STAGE, TAB_H, TITLE_H, WIN,
} from "./layout";
import {CONFIG} from "./config";
import {
  CheckIcon, ClipboardIcon, DownloadIcon, FolderIcon, GlobeIcon, InstagramIcon, KebabIcon, LockIcon,
  NavArrow, RefreshIcon, ReloadIcon, VideoFileIcon,
} from "./icons";

// Colors taken from the real app (app/grid.css)
export const C = {
  bg: "#f4f4f2",
  panel: "#ffffff",
  line: "#e3e3de",
  text: "#1c1c1a",
  muted: "#77776f",
  accent: "#2563eb",
  accentSoft: "#e8efff",
  ok: "#15803d",
  okSoft: "#e7f6ec",
  rec: "#e5484d",
  stageGreen: "#22c55e",
};

const abs = (x: number, y: number, w?: number, h?: number): React.CSSProperties => ({
  position: "absolute", left: x, top: y, width: w, height: h,
});

/* ───────────────────────── Browser chrome ───────────────────────── */

export type DownloadState = {
  progress: number; // 0..1 ring fill (0 = hidden)
  ringOpacity: number;
  done: number; // 0..1 turned "complete"
  glow: number; // 0..1 glow pulse
  shine: number; // 0..1 shine sweep position
  scale: number;
  arrowBob: number; // px
};

const DownloadButton: React.FC<{s: DownloadState}> = ({s}) => {
  const R = 19;
  const circ = 2 * Math.PI * R;
  const ringColor = s.done > 0.5 ? C.ok : C.accent;
  return (
    <div style={{position: "relative", width: 44, height: 44, transform: `scale(${s.scale})`}}>
      {/* glow */}
      <div style={{
        position: "absolute", inset: -30, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(34,197,94,${0.55 * s.glow}) 0%, rgba(34,197,94,${0.18 * s.glow}) 40%, rgba(34,197,94,0) 70%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden",
        background: s.done > 0 ? `rgba(231,246,236,${s.done})` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <DownloadIcon size={24} color={s.done > 0.5 ? C.ok : s.ringOpacity > 0 ? C.accent : "#5f6368"}
          style={{transform: `translateY(${s.arrowBob}px)`}} />
        {/* shine sweep */}
        <div style={{
          position: "absolute", top: -20, bottom: -20, width: 18,
          left: -30 + s.shine * 110, transform: "rotate(25deg)",
          background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))",
          opacity: s.shine > 0 && s.shine < 1 ? 1 : 0,
        }} />
      </div>
      <svg width={44} height={44} style={{position: "absolute", inset: 0, transform: "rotate(-90deg)", opacity: s.ringOpacity}}>
        <circle cx={22} cy={22} r={R} fill="none" stroke="#dbe3f3" strokeWidth={3} />
        <circle cx={22} cy={22} r={R} fill="none" stroke={ringColor} strokeWidth={3.2} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - s.progress)} />
      </svg>
    </div>
  );
};

const TrafficLights: React.FC = () => (
  <div style={{display: "flex", gap: 9, alignItems: "center"}}>
    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
      <div key={c} style={{width: 14, height: 14, borderRadius: "50%", background: c, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,.15)"}} />
    ))}
  </div>
);

const BrowserChrome: React.FC<{download: DownloadState}> = ({download}) => (
  <>
    {/* Tab strip */}
    <div style={{...abs(0, 0, WIN.w, TAB_H), background: "#dee1e6", display: "flex", alignItems: "flex-end", paddingLeft: 20}}>
      <div style={{height: TAB_H, display: "flex", alignItems: "center", marginRight: 22}}><TrafficLights /></div>
      <div style={{
        height: 38, width: 250, background: "#fff", borderRadius: "10px 10px 0 0", display: "flex",
        alignItems: "center", gap: 10, padding: "0 14px", fontSize: 15, color: "#202124",
      }}>
        <GlobeIcon />
        <span style={{flex: 1}}>{CONFIG.content.tabTitle}</span>
        <span style={{color: "#5f6368", fontSize: 16}}>×</span>
      </div>
      <div style={{height: 38, display: "flex", alignItems: "center", padding: "0 14px", color: "#5f6368", fontSize: 22}}>+</div>
    </div>
    {/* Address bar */}
    <div style={{
      ...abs(0, TAB_H, WIN.w, ADDR_H), background: "#fff", borderBottom: "1px solid #dadce0",
      display: "flex", alignItems: "center", gap: 14, padding: "0 16px",
    }}>
      <NavArrow dir="left" />
      <NavArrow dir="right" />
      <ReloadIcon />
      <div style={{
        flex: 1, height: 36, borderRadius: 18, background: "#f1f3f4", display: "flex", alignItems: "center",
        gap: 10, padding: "0 16px", fontSize: 16, color: "#202124",
      }}>
        <LockIcon />
        <span>{CONFIG.content.url}</span>
      </div>
      <div style={{width: 8}} />
      <DownloadButton s={download} />
      <KebabIcon />
    </div>
  </>
);

/* ───────────────────────── Grid Player app ───────────────────────── */

export type DropState = {
  hover: number; // 0..1 drop target highlight
  flash: number; // 0..1 flash on drop
  loaded: number; // 0..1 switches to the "loaded" state
};

const DropBox: React.FC<{d: DropState}> = ({d}) => {
  const idle = 1 - d.loaded;
  const borderColor = mixColor([74, 74, 69], [96, 165, 250], d.hover);
  return (
    <div style={{
      position: "absolute", left: STAGE.w / 2 - DROP_BOX.w / 2, top: STAGE.h / 2 - DROP_BOX.h / 2,
      width: DROP_BOX.w, height: DROP_BOX.h, transform: `scale(${1 + 0.08 * d.hover - 0.04 * d.flash})`,
    }}>
      {/* idle box */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 16, opacity: idle,
        border: `2px dashed ${borderColor}`, background: `rgba(37,99,235,${0.16 * d.hover})`,
        boxShadow: `0 0 ${40 * d.hover}px rgba(59,130,246,${0.45 * d.hover})`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <div style={{display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 25, fontWeight: 700}}>
          <FolderIcon size={30} />
          <span>{d.hover > 0.5 ? "Drop to open" : "Open a video"}</span>
        </div>
        <div style={{color: d.hover > 0.5 ? "#bfdbfe" : "#a8a8a0", fontSize: 18}}>or drop it anywhere</div>
      </div>
      {/* loaded */}
      <div style={{
        position: "absolute", inset: 0, opacity: d.loaded, transform: `scale(${0.9 + 0.1 * d.loaded})`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: C.stageGreen, display: "flex",
          alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(34,197,94,.5)",
        }}>
          <CheckIcon size={34} />
        </div>
        <div style={{color: "#fff", fontSize: 22, fontWeight: 600}}>{CONFIG.content.fileName}</div>
      </div>
      {/* flash */}
      <div style={{position: "absolute", inset: -20, borderRadius: 24, background: `rgba(147,197,253,${0.5 * d.flash})`, filter: "blur(12px)"}} />
    </div>
  );
};

const LinkCard: React.FC<{highlight: number; press: number}> = ({highlight, press}) => {
  const c = CONFIG.content;
  const x = CARD.pad;
  return (
    <div style={{
      ...abs(CARD.x - SIDEBAR_X, CARD.y - STAGE.y, CARD.w, CARD_ROWS.height),
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)",
    }}>
      <div style={{...abs(x, CARD_ROWS.header, CARD.w - 2 * x, 24), display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span style={{fontSize: 15, fontWeight: 600, letterSpacing: 1.6, color: C.muted}}>NEXT LINK</span>
        <RefreshIcon />
      </div>
      <div style={{...abs(x, CARD_ROWS.name, CARD.w - 2 * x, 36), display: "flex", alignItems: "center", gap: 10}}>
        <span style={{fontSize: 19, fontWeight: 700, whiteSpace: "nowrap"}}>Name: {c.name}</span>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, border: `1px solid ${C.line}`, borderRadius: 7,
          padding: "4px 8px", fontSize: 14, whiteSpace: "nowrap",
        }}>
          <ClipboardIcon />Copy name
        </div>
      </div>
      {/* link highlight */}
      <div style={{
        ...abs(LINK_BOX.x - CARD.x, LINK_BOX.y - CARD.y, LINK_BOX.w, LINK_BOX.h), borderRadius: 10,
        background: `rgba(37,99,235,${0.12 * highlight + 0.08 * press})`,
        boxShadow: `0 0 0 ${2 * highlight}px rgba(37,99,235,${0.35 * highlight}), 0 0 ${26 * highlight}px rgba(37,99,235,${0.3 * highlight})`,
        transform: `scale(${1 + 0.03 * highlight - 0.03 * press})`,
      }} />
      <div style={{...abs(x, CARD_ROWS.link, 190, 108), fontSize: 18.5, lineHeight: "26px", color: C.accent, transform: `scale(${1 - 0.03 * press})`}}>
        {c.linkLines.map((l, i) => (
          <div key={i} style={{textDecoration: highlight > 0.5 && i > 0 ? "underline" : "none", textUnderlineOffset: 3}}>{l}</div>
        ))}
      </div>
      <div style={{...abs(212, CARD_ROWS.link + 38, 32, 32), display: "flex", alignItems: "center", justifyContent: "center"}}>
        <InstagramIcon size={22} />
      </div>
      <div style={{
        ...abs(CARD.w - x - 98, CARD_ROWS.link + 30, 98, 46), background: C.ok, borderRadius: 8, color: "#fff",
        fontWeight: 700, fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <CheckIcon size={17} />Done
      </div>
      <div style={{...abs(x, CARD_ROWS.footer, CARD.w - 2 * x, 24), display: "flex", justifyContent: "space-between", fontSize: 16}}>
        <span style={{color: C.muted}}>{c.waiting}</span>
        <span style={{color: C.accent}}><span style={{fontSize: 10, marginRight: 6}}>▸</span>{c.allLinks}</span>
      </div>
    </div>
  );
};

export const GridPlayerApp: React.FC<{highlight: number; press: number; drop: DropState}> = ({highlight, press, drop}) => (
  <>
    {/* app title bar */}
    <div style={{
      ...abs(0, TAB_H + ADDR_H, WIN.w, TITLE_H), background: C.panel, borderBottom: `1px solid ${C.line}`,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 0 22px",
    }}>
      <span style={{fontSize: 19, fontWeight: 600}}>{CONFIG.content.appTitle}</span>
      <div style={{display: "flex", alignItems: "center", gap: 22}}>
        <div style={{width: 11, height: 11, borderRadius: "50%", background: C.rec, opacity: 0.55}} />
        <KebabIcon color={C.muted} horizontal />
      </div>
    </div>
    {/* video stage */}
    <div style={{
      ...abs(0, STAGE.y - WIN.y, STAGE.w, STAGE.h), background: "#000", overflow: "hidden",
      boxShadow: `inset 0 0 0 2px ${C.stageGreen}`,
    }}>
      <div style={{position: "absolute", inset: 0, opacity: drop.loaded, background: "radial-gradient(ellipse at 50% 45%, #1b2638 0%, #000 70%)"}} />
      <DropBox d={drop} />
    </div>
    {/* sidebar */}
    <div style={{...abs(STAGE.w, STAGE.y - WIN.y, SIDEBAR_W, STAGE.h), background: C.bg}}>
      <LinkCard highlight={highlight} press={press} />
      <div style={{position: "absolute", left: 20, bottom: 18, fontSize: 15, color: C.muted}}>
        {drop.loaded > 0.5 ? CONFIG.content.footerLoaded : CONFIG.content.footer}
      </div>
    </div>
  </>
);

export const BrowserWindow: React.FC<{download: DownloadState; children: React.ReactNode}> = ({download, children}) => (
  <div style={{
    ...abs(WIN.x, WIN.y, WIN.w, WIN.h), borderRadius: 14, overflow: "hidden", background: "#fff",
    boxShadow: "0 50px 120px rgba(0,0,0,.45), 0 12px 30px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.25)",
  }}>
    <BrowserChrome download={download} />
    {children}
  </div>
);

/* ───────────────────────── Toast (download bubble) ───────────────────────── */

export const DownloadToast: React.FC<{dragging: number}> = ({dragging}) => (
  <div style={{
    width: 340, background: "#fff", borderRadius: 14, padding: "16px 18px",
    boxShadow: "0 18px 40px rgba(0,0,0,.22), 0 0 0 1px rgba(0,0,0,.06)",
  }}>
    <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 700, color: C.ok}}>
      {CONFIG.content.toast}
      <div style={{width: 22, height: 22, borderRadius: "50%", background: C.ok, display: "flex", alignItems: "center", justifyContent: "center"}}>
        <CheckIcon size={14} />
      </div>
    </div>
    <div style={{display: "flex", alignItems: "center", gap: 14, marginTop: 12, padding: "6px 8px", marginLeft: -8, borderRadius: 10, background: `rgba(37,99,235,${0.08 * dragging})`}}>
      <div style={{opacity: 1 - 0.6 * dragging}}><VideoFileIcon size={36} /></div>
      <div>
        <div style={{fontSize: 17, fontWeight: 600, color: C.text}}>{CONFIG.content.fileName}</div>
        <div style={{fontSize: 14, color: C.muted}}>{CONFIG.content.fileSize} · Done</div>
      </div>
    </div>
  </div>
);

/* helpers */
function mixColor(a: number[], b: number[], t: number) {
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${m.join(",")})`;
}
