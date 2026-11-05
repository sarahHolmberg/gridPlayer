// Phone + the screens of the "find a dancer" tutorial. A generic dark social app (no real brand),
// and the real Video Vault page. Screen-local coordinates: 0..SW × 0..SH.
import React from "react";
import {
  BatteryFull, Bookmark, ChevronLeft, Clapperboard, Copy, Download, Grid3x3, Heart, Link, MessageCircle, MoreHorizontal, Plus,
  Repeat2, Send, Signal, SquareUser, UserRound, Wifi, Share, Crop, Undo2,
} from "lucide-react";
import {Figure, LOOKS, Move} from "../gp/dancers3";
import {FINDER, Thumb} from "./config";

export const SW = 402, SH = 832;
export const PHONE = {x: 1050, y: 106, w: 430, h: 868};
export const SCREEN = {x: PHONE.x + 14, y: PHONE.y + 18, w: SW, h: SH};
export const toWorld = (p: {x: number; y: number}) => ({x: SCREEN.x + p.x, y: SCREEN.y + p.y});
const BASE_Y = 765 * 0.9;
const sans = "Inter, sans-serif";

/* ───────── layout of the profile screen ───────── */
export const PROF = {
  header: 44, avatar: {x: 20, y: 104, d: 92}, bioY: 214, bioLine: 23, btnY: 300, tabsY: 352, gridY: 400,
  cellW: SW / 3, cellH: 178,
};
export const bioRect = (i: number) => ({x: 14, y: PROF.bioY + i * PROF.bioLine - 2, w: 300, h: PROF.bioLine + 2});
export const tabCenter = (i: number) => ({x: (i + 0.5) * (SW / 4), y: PROF.tabsY + 22});
export const cellRect = (i: number) => ({x: (i % 3) * PROF.cellW, y: PROF.gridY + Math.floor(i / 3) * (PROF.cellH + 1), w: PROF.cellW - 1, h: PROF.cellH});
export const BACK_BTN = {x: 24, y: 66};

/* ───────── layout of the post screen ───────── */
export const POST = {videoY: 150, videoH: 500, actionsY: 662};
const VB = {x: 300, y: -80, w: 760, h: 945}; // the part of the 1360×765 dance space shown in a post
export const TAG_ICON = {x: 26, y: POST.videoY + POST.videoH - 26};
export const SHARE_BTN = {x: 172, y: POST.actionsY + 18};
export const postPoint = (xFrac: number, srcY: number) => ({x: ((xFrac * 1360 - VB.x) / VB.w) * SW, y: POST.videoY + ((srcY - VB.y) / VB.h) * POST.videoH});

/* ───────── small pieces ───────── */
export const StatusBar: React.FC<{dark?: boolean}> = ({dark = true}) => {
  const c = dark ? "#fff" : "#111";
  return (
    <div style={{position: "absolute", left: 0, top: 0, width: SW, height: 40, display: "flex", alignItems: "center", padding: "0 22px", boxSizing: "border-box", color: c, fontSize: 15, fontWeight: 600, fontFamily: sans}}>
      <Signal size={15} color={c} /><span style={{marginLeft: 6, fontWeight: 500}}>Carrier</span><Wifi size={15} color={c} style={{marginLeft: 6}} />
      <div style={{flex: 1, textAlign: "center"}}>23:50</div>
      <BatteryFull size={20} color={c} />
    </div>
  );
};

const people = (n: number) => (n === 1 ? [0.5] : n === 2 ? [0.42, 0.58] : [0.36, 0.5, 0.64]);

/** Background + dancers, drawn in the 1360×765 space. */
export const DanceSpace: React.FC<{t: Thumb; v: number; peopleX?: number[]}> = ({t, v, peopleX}) => {
  const xs = peopleX ?? people(t.people.length);
  const moves: Move[] = t.people.map((p, i) => ({kind: (["handsUp", "stepLeft", "jump"] as const)[(i + (t.v ?? 0)) % 3], v: 1 + i * 0.9 + (t.v ?? 0) * 0.3, dancer: p}));
  return (
    <>
      {t.kind === "studio" && (
        <>
          <rect x={-200} y={-200} width={1800} height={1300} fill="#cfc8bf" />
          <rect x={-200} y={130} width={1800} height={330} fill="#e9e6e0" />
          {[200, 520, 840, 1160].map((x) => <rect key={x} x={x} y={150} width={220} height={290} fill="#b9c6cf" stroke="#9aa7b0" strokeWidth={6} />)}
          <rect x={-200} y={520} width={1800} height={800} fill="#b88a62" />
        </>
      )}
      {t.kind === "stage" && (
        <>
          <defs>
            <radialGradient id="spot" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="rgba(255,255,255,.75)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
          </defs>
          <rect x={-200} y={-200} width={1800} height={1300} fill="#2a0d5c" />
          {[380, 680, 980].map((x, i) => <path key={x} d={`M${x} -100 L${x - 260} 760 L${x + 260} 760 Z`} fill="url(#spot)" opacity={0.55 + 0.2 * Math.sin(v * 3 + i)} />)}
          <rect x={-200} y={560} width={1800} height={600} fill="#140630" />
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={(i * 137) % 1360} cy={(i * 71) % 520} r={4} fill="#f0abfc" opacity={0.5 + 0.5 * Math.sin(v * 5 + i)} />)}
          <text x={680} y={60} textAnchor="middle" fill="#f5d0fe" fontSize={64} fontWeight={900} fontFamily={sans} letterSpacing={8}>SHOWCASE</text>
        </>
      )}
      {t.kind === "outdoor" && (
        <>
          <rect x={-200} y={-200} width={1800} height={900} fill="#9cc7ea" />
          <ellipse cx={300} cy={480} rx={500} ry={160} fill="#7aa36b" />
          <rect x={-200} y={520} width={1800} height={700} fill="#c9c2b4" />
        </>
      )}
      {t.people.map((p, i) => <Figure key={i} i={p} v={v} moves={moves} x={xs[i]} scale={LOOKS[p].scale} />)}
    </>
  );
};

export const ThumbCell: React.FC<{t: Thumb; v: number}> = ({t, v}) => (
  <svg width="100%" height="100%" viewBox="380 110 600 800" preserveAspectRatio="xMidYMid slice" style={{display: "block"}}>
    <DanceSpace t={t} v={v} />
  </svg>
);

/** Round profile picture: the dancer's head and shoulders (or a logo for the studio). */
export const Avatar: React.FC<{look: number; d: number; ring?: boolean}> = ({look, d, ring = true}) => {
  const L = LOOKS[Math.max(0, look)];
  const cx = 0.5 * 1360, headY = BASE_Y - 322 * L.scale;
  return (
    <div style={{width: d, height: d, borderRadius: "50%", padding: ring ? 3 : 0, boxSizing: "border-box", background: ring ? "conic-gradient(#f59e0b, #ec4899, #8b5cf6, #f59e0b)" : "none"}}>
      <div style={{width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: ring ? "3px solid #000" : "none", boxSizing: "border-box", background: "#cfc8bf"}}>
        {look < 0 ? (
          <div style={{width: "100%", height: "100%", background: "linear-gradient(135deg, #1e3a8a, #9333ea)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: d * 0.36, fontFamily: sans}}>DS</div>
        ) : (
          <svg width="100%" height="100%" viewBox={`${cx - 90} ${headY - 70} 180 180`}>
            <rect x={0} y={0} width={1360} height={765} fill="#d8cfc4" />
            <Figure i={look} v={0.2} moves={[]} x={0.5} scale={L.scale} />
          </svg>
        )}
      </div>
    </div>
  );
};

/* ───────── profile screen ───────── */
type Acct = {user: string; name: string; look: number; counts: string[]; bio: string[]; clue?: number[]};

export const ProfileScreen: React.FC<{a: Acct; posts: Thumb[]; tab: number; v: number; marks?: React.ReactNode}> = ({a, posts, tab, v, marks}) => (
  <div style={{position: "absolute", inset: 0, background: "#000", color: "#fff", fontFamily: sans, overflow: "hidden"}}>
    <StatusBar />
    <div style={{position: "absolute", left: 0, top: PROF.header, width: SW, height: 46, display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box", gap: 8}}>
      <ChevronLeft size={30} color="#fff" />
      <div style={{fontSize: 22, fontWeight: 800, flex: 1}}>{a.user}</div>
      <MoreHorizontal size={24} color="#fff" />
    </div>
    <div style={{position: "absolute", left: PROF.avatar.x, top: PROF.avatar.y}}><Avatar look={a.look} d={PROF.avatar.d} /></div>
    <div style={{position: "absolute", left: 132, top: 104, fontSize: 17, fontWeight: 700}}>{a.name}</div>
    <div style={{position: "absolute", left: 132, top: 134, display: "flex", gap: 22}}>
      {a.counts.map((c, i) => (
        <div key={i}><div style={{fontSize: 19, fontWeight: 800}}>{c}</div><div style={{fontSize: 14, color: "#ddd"}}>{["posts", "followers", "following"][i]}</div></div>
      ))}
    </div>
    {a.bio.map((b, i) => <div key={i} style={{position: "absolute", left: 20, top: PROF.bioY + i * PROF.bioLine, fontSize: 16, color: i === 0 ? "#fff" : "#e5e7eb"}}>{b}</div>)}
    <div style={{position: "absolute", left: 16, right: 16, top: PROF.btnY, display: "flex", gap: 8}}>
      <div style={{flex: 1, height: 36, borderRadius: 9, background: "#3b5bfd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700}}>Follow</div>
      <div style={{flex: 1, height: 36, borderRadius: 9, background: "#262626", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700}}>Message</div>
    </div>
    <div style={{position: "absolute", left: 0, top: PROF.tabsY, width: SW, height: 46, display: "flex", borderBottom: "1px solid #262626"}}>
      {[Grid3x3, Clapperboard, Repeat2, SquareUser].map((Ic, i) => (
        <div key={i} style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: tab === i ? "2px solid #fff" : "2px solid transparent"}}>
          <Ic size={26} color={tab === i ? "#fff" : "#8e8e8e"} />
        </div>
      ))}
    </div>
    {[...posts, ...posts.slice(0, 3)].map((p, i) => {
      const r = cellRect(i);
      return <div key={i} style={{position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, overflow: "hidden"}}><ThumbCell t={p} v={v + i * 0.37} /></div>;
    })}
    {marks}
  </div>
);

/* ───────── post screen ───────── */
export const PostScreen: React.FC<{a: Acct; t: Thumb; v: number; tags?: {name: string; xFrac: number; look: number; on: number; h?: number}[]; tagsShow?: number; tagIconPress?: number; sharePress?: number; xs?: number[]}> = ({
  a, t, v, tags = [], tagsShow = 0, tagIconPress = 0, sharePress = 0, xs,
}) => (
  <div style={{position: "absolute", inset: 0, background: "#000", color: "#fff", fontFamily: sans, overflow: "hidden"}}>
    <StatusBar />
    <div style={{position: "absolute", left: 0, top: PROF.header, width: SW, height: 46, display: "flex", alignItems: "center", padding: "0 12px", boxSizing: "border-box"}}>
      <ChevronLeft size={30} color="#fff" />
      <div style={{flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, marginRight: 30}}>Posts</div>
    </div>
    <div style={{position: "absolute", left: 14, top: 96, display: "flex", alignItems: "center", gap: 10}}>
      <Avatar look={a.look} d={42} />
      <div><div style={{fontWeight: 700, fontSize: 15}}>{a.user}</div><div style={{fontSize: 13, color: "#bbb"}}>♫ Sample Artist · Sample Song</div></div>
    </div>
    <svg width={SW} height={POST.videoH} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid slice" style={{position: "absolute", left: 0, top: POST.videoY}}>
      <DanceSpace t={t} v={v} peopleX={xs} />
    </svg>
    {/* tag icon */}
    <div style={{
      position: "absolute", left: TAG_ICON.x - 16, top: TAG_ICON.y - 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,.65)",
      display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * tagIconPress})`,
    }}><UserRound size={18} color="#fff" fill="#fff" /></div>
    {/* tags */}
    {tags.map((tg, i) => {
      const p = postPoint(tg.xFrac, BASE_Y - (tg.h ?? 400) * LOOKS[tg.look].scale);
      return (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y - 6, transform: `translate(-50%, -100%) scale(${tagsShow})`, opacity: tagsShow, transformOrigin: "50% 100%",
          background: tg.on > 0 ? `rgba(59,130,246,${0.5 + 0.45 * tg.on})` : "rgba(0,0,0,.78)", color: "#fff", padding: "6px 11px", borderRadius: 8, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap",
        }}>
          {tg.name}
          <div style={{position: "absolute", left: "50%", bottom: -7, marginLeft: -7, width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: `7px solid ${tg.on > 0 ? "rgba(59,130,246,.95)" : "rgba(0,0,0,.78)"}`}} />
        </div>
      );
    })}
    <div style={{position: "absolute", left: 14, right: 14, top: POST.actionsY, display: "flex", alignItems: "center", gap: 18, fontSize: 15}}>
      <span style={{display: "flex", alignItems: "center", gap: 5}}><Heart size={26} />221</span>
      <span style={{display: "flex", alignItems: "center", gap: 5}}><MessageCircle size={26} />30</span>
      <span style={{display: "flex", alignItems: "center", gap: 5}}><Repeat2 size={26} />3</span>
      <span style={{display: "flex", alignItems: "center", gap: 5, transform: `scale(${1 - 0.15 * sharePress})`}}><Send size={26} />4</span>
      <div style={{flex: 1}} /><Bookmark size={26} />
    </div>
    <div style={{position: "absolute", left: 14, right: 14, top: POST.actionsY + 46, fontSize: 15, lineHeight: 1.4}}>
      <b>{a.user}</b> practice session with friends 💃
      <div style={{color: "#8e8e8e", fontSize: 13, marginTop: 4}}>2 March</div>
    </div>
  </div>
);

/* ───────── share sheet + toast ───────── */
export const SHEET_Y = 470;
export const COPY_LINK = {x: 140, y: SHEET_Y + 300};
export const ShareSheet: React.FC<{p: number; copyPress: number}> = ({p, copyPress}) => {
  if (p <= 0) return null;
  const names = ["Alex", "Mia", "Sam", "Lea", "Tom", "Ida"];
  return (
    <>
      <div style={{position: "absolute", inset: 0, background: `rgba(0,0,0,${0.45 * p})`}} />
      <div style={{position: "absolute", left: 0, top: SHEET_Y + (1 - p) * (SH - SHEET_Y), width: SW, height: SH - SHEET_Y, background: "#262626", borderRadius: "18px 18px 0 0", fontFamily: sans, color: "#fff"}}>
        <div style={{width: 40, height: 5, borderRadius: 3, background: "#555", margin: "8px auto 12px"}} />
        <div style={{margin: "0 14px", height: 36, borderRadius: 10, background: "#3a3a3a", display: "flex", alignItems: "center", padding: "0 12px", color: "#aaa", fontSize: 15}}>Search</div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "10px 0", padding: "14px 6px 0"}}>
          {names.map((n, i) => (
            <div key={n} style={{width: SW / 3 - 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 13}}>
              <div style={{width: 54, height: 54, borderRadius: "50%", background: `hsl(${i * 55 + 200}, 45%, 55%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20}}>{n[0]}</div>
              {n}
            </div>
          ))}
        </div>
        <div style={{position: "absolute", left: 0, right: 0, top: COPY_LINK.y - SHEET_Y - 30, display: "flex", justifyContent: "space-around", fontSize: 12}}>
          {[{ic: Plus, l: "Add to story"}, {ic: Link, l: "Copy link"}, {ic: Share, l: "Share to…"}, {ic: Download, l: "Download"}].map(({ic: Ic, l}, i) => (
            <div key={l} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transform: i === 1 ? `scale(${1 - 0.12 * copyPress})` : undefined}}>
              <div style={{width: 52, height: 52, borderRadius: "50%", background: i === 1 && copyPress > 0 ? "#3b82f6" : "#3a3a3a", display: "flex", alignItems: "center", justifyContent: "center"}}><Ic size={24} color="#fff" /></div>
              {l}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const Toast: React.FC<{p: number; text: string}> = ({p, text}) =>
  p <= 0 ? null : (
    <div style={{
      position: "absolute", left: "50%", bottom: 90, transform: `translateX(-50%) translateY(${(1 - p) * 20}px)`, opacity: p, background: "#fff", color: "#111",
      borderRadius: 999, padding: "10px 18px", fontWeight: 700, fontSize: 15, fontFamily: sans, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
    }}><Copy size={16} />{text}</div>
  );

/* ───────── screenshot + crop (markup editor) ───────── */
export const EDIT = {x: 31, y: 120, s: 0.85}; // where the screenshot sits in the editor
export const EDIT_DONE = {x: 38, y: 70};
export const MarkupScreen: React.FC<{shot: React.ReactNode; crop: {x: number; y: number; w: number; h: number}; cropped: number; donePress: number}> = ({shot, crop, cropped, donePress}) => {
  const W = SW * EDIT.s, H = SH * EDIT.s;
  const C = (k: number) => k * EDIT.s;
  const cx = EDIT.x + C(crop.x), cy = EDIT.y + C(crop.y), cw = C(crop.w), ch = C(crop.h);
  const corner = (l: boolean, t: boolean) => (
    <div style={{position: "absolute", left: l ? cx - 4 : cx + cw - 20, top: t ? cy - 4 : cy + ch - 20, width: 24, height: 24,
      borderLeft: l ? "5px solid #fff" : undefined, borderRight: l ? undefined : "5px solid #fff", borderTop: t ? "5px solid #fff" : undefined, borderBottom: t ? undefined : "5px solid #fff"}} />
  );
  return (
    <div style={{position: "absolute", inset: 0, background: "#1c1c1e", fontFamily: sans, color: "#fff", overflow: "hidden"}}>
      <StatusBar />
      <div style={{position: "absolute", left: 0, top: 48, width: SW, height: 44, display: "flex", alignItems: "center", padding: "0 16px", boxSizing: "border-box", gap: 22}}>
        <span style={{color: "#4f8cff", fontWeight: 800, fontSize: 18, transform: `scale(${1 - 0.1 * donePress})`}}>Done</span>
        <div style={{flex: 1}} /><Undo2 size={22} color="#888" /><Crop size={22} color="#4f8cff" />
      </div>
      <div style={{position: "absolute", left: EDIT.x, top: EDIT.y, width: W, height: H, overflow: "hidden", opacity: 1 - cropped}}>
        <div style={{width: SW, height: SH, transform: `scale(${EDIT.s})`, transformOrigin: "0 0", position: "relative"}}>{shot}</div>
      </div>
      {/* dim outside the crop */}
      <div style={{position: "absolute", left: EDIT.x, top: EDIT.y, width: W, height: H, opacity: 1 - cropped, background: "rgba(0,0,0,.55)",
        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cx - EDIT.x}px ${cy - EDIT.y}px, ${cx - EDIT.x}px ${cy - EDIT.y + ch}px, ${cx - EDIT.x + cw}px ${cy - EDIT.y + ch}px, ${cx - EDIT.x + cw}px ${cy - EDIT.y}px, ${cx - EDIT.x}px ${cy - EDIT.y}px)`}} />
      {cropped < 1 && (
        <>
          <div style={{position: "absolute", left: cx, top: cy, width: cw, height: ch, border: "1.5px solid rgba(255,255,255,.8)", boxSizing: "border-box", opacity: 1 - cropped}} />
          {cropped < 0.5 && <>{corner(true, true)}{corner(false, true)}{corner(true, false)}{corner(false, false)}</>}
        </>
      )}
      {cropped > 0 && (
        <div style={{position: "absolute", left: SW / 2 - 110, top: 190, width: 220, height: 420, opacity: cropped, transform: `scale(${0.8 + 0.2 * cropped})`, borderRadius: 8, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.6)"}}>
          <CroppedPic w={220} h={420} />
        </div>
      )}
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "#2c2c2e", display: "flex", alignItems: "center", justifyContent: "space-around"}}>
        {["#fff", "#ef4444", "#facc15", "#3b82f6", "#22c55e"].map((c) => <div key={c} style={{width: 26, height: 26, borderRadius: "50%", background: c}} />)}
      </div>
    </div>
  );
};

/** The chosen post's video, cropped to the account person (nora: the first dancer of okPosts[chosen]). */
export const CroppedPic: React.FC<{w: number; h: number}> = ({w, h}) => {
  const t = FINDER.okPosts[FINDER.chosenIndex];
  const x = 0.42 * 1360;
  return (
    <svg width={w} height={h} viewBox={`${x - 120} 250 240 458`} preserveAspectRatio="xMidYMid slice" style={{display: "block"}}>
      <DanceSpace t={t} v={0.2} />
    </svg>
  );
};
// crop rectangle around the account person in the post screen (screen-local)
export const CROP_TARGET = (() => {
  const p1 = postPoint(0.42 - 0.088, 250), p2 = postPoint(0.42 + 0.088, 708);
  return {x: p1.x, y: p1.y, w: p2.x - p1.x, h: p2.y - p1.y};
})();

/* ───────── browser with the Video Vault page ───────── */
const tahoma = "Tahoma, Verdana, 'DejaVu Sans', sans-serif";
export const VAULT = {winY: 116, nameY: 188, linkY: 262, submitY: 312, rowY: 372, dialogY: 230};
export const NAME_FIELD = {x: 201, y: VAULT.nameY + 20};
export const LINK_FIELD = {x: 201, y: VAULT.linkY + 20};
export const SUBMIT_BTN = {x: 201, y: VAULT.submitY + 22};
export const CHOOSE_BTN = {x: 112, y: VAULT.dialogY + 150};
export const SEND_BTN = {x: 62, y: VAULT.dialogY + 404};
export const PASTE_BUBBLE = {x: 120, y: VAULT.linkY - 36};

export const BrowserScreen: React.FC<{
  name: string; link: string; focus: "name" | "link" | null; paste: number; submitPress: number; msg: string;
  dialog: number; choosePress: number; picker: number; photoPress: number; preview: number; sendPress: number; sending: boolean;
}> = (s) => {
  const field = (y: number, text: string, focused: boolean, placeholder: string) => (
    <div style={{
      position: "absolute", left: 22, right: 22, top: y, height: 40, background: "#fff", border: "2px inset #999", boxSizing: "border-box", padding: "0 8px",
      display: "flex", alignItems: "center", fontSize: 16, color: text ? "#000" : "#888", overflow: "hidden", whiteSpace: "nowrap",
      boxShadow: focused ? "0 0 0 3px rgba(59,130,246,.6)" : "none",
    }}>{text || placeholder}{focused && <span style={{width: 2, height: 20, background: "#000", marginLeft: 1}} />}</div>
  );
  return (
    <div style={{position: "absolute", inset: 0, background: "#3a6ea5", fontFamily: tahoma, overflow: "hidden"}}>
      <div style={{position: "absolute", left: 0, top: 0, width: SW, height: 100, background: "#f2f2f7"}}>
        <StatusBar dark={false} />
        <div style={{position: "absolute", left: 14, right: 14, top: 50, height: 40, borderRadius: 12, background: "#e3e3e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontSize: 16, color: "#111"}}>
          {FINDER.siteUrl}
        </div>
      </div>
      {/* the retro window */}
      <div style={{position: "absolute", left: 10, right: 10, top: VAULT.winY, height: 330, background: "#ece9d8", border: "2px solid #0a246a", borderRadius: 6, boxShadow: "4px 4px 10px rgba(0,0,0,.5)"}}>
        <div style={{height: 30, background: "linear-gradient(to right, #0a246a, #3a6ea5)", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", borderRadius: "4px 4px 0 0"}}>
          <span>📼 Video Vault</span>
          <span style={{display: "flex", gap: 3}}>{["_", "□", "✕"].map((c) => <span key={c} style={{background: "#d4d0c8", color: "#000", border: "1px solid #000", padding: "0 6px", fontSize: 11}}>{c}</span>)}</span>
        </div>
        <div style={{position: "absolute", left: 12, top: 44, fontSize: 14}}>Name (who the video is about):</div>
        <div style={{position: "absolute", left: 12, top: VAULT.linkY - VAULT.winY - 22, fontSize: 14}}>Paste Instagram link:</div>
        <div style={{position: "absolute", left: 12, top: VAULT.rowY - VAULT.winY + 20, fontSize: 14, color: "#2e7d32", fontWeight: 700}}>{s.msg}</div>
        <div style={{position: "absolute", left: 12, top: VAULT.rowY - VAULT.winY + 42, display: "flex", gap: 6}}>
          <div style={{border: "2px outset #fff", padding: "10px 12px", fontSize: 14}}>View Videos</div>
          <div style={{border: "2px outset #fff", padding: "10px 14px", fontSize: 14}}>✂</div>
        </div>
        <div style={{
          position: "absolute", left: 12, right: 12, top: VAULT.submitY - VAULT.winY, height: 44, border: `2px ${s.submitPress > 0.3 ? "inset" : "outset"} #fff`, boxSizing: "border-box",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: "#ece9d8",
        }}>Submit</div>
      </div>
      <div style={{position: "absolute", left: 0, top: 0, width: SW, height: SH}}>
        {field(VAULT.nameY, s.name, s.focus === "name", "e.g. Sarah")}
        {field(VAULT.linkY, s.link, s.focus === "link", "https://www.instagram.com/...")}
      </div>
      {s.paste > 0 && (
        <div style={{position: "absolute", left: PASTE_BUBBLE.x - 40, top: PASTE_BUBBLE.y - 18, opacity: s.paste, background: "#1c1c1e", color: "#fff", borderRadius: 8, padding: "8px 16px", fontFamily: sans, fontSize: 15, fontWeight: 600}}>Paste</div>
      )}
      {/* Step 2 dialog */}
      {s.dialog > 0 && (
        <>
          <div style={{position: "absolute", inset: 0, background: `rgba(0,0,0,${0.4 * s.dialog})`}} />
          <div style={{
            position: "absolute", left: 18, right: 18, top: VAULT.dialogY, height: 440, background: "#ece9d8", border: "2px solid #0a246a", borderRadius: 6, padding: 14,
            boxSizing: "border-box", fontSize: 14, opacity: s.dialog, transform: `scale(${0.9 + 0.1 * s.dialog})`,
          }}>
            <b>Step 2: add a picture</b>
            <div style={{marginTop: 10, color: "#333", wordBreak: "break-all"}}>{s.name} · {s.link}</div>
            <div style={{marginTop: 12}}>Choose a picture or take a photo:</div>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 8}}>
              <div style={{border: `2px ${s.choosePress > 0.3 ? "inset" : "outset"} #fff`, padding: "6px 10px", background: "#e4e4e4"}}>Choose File</div>
              <span style={{color: "#333"}}>{s.preview > 0.5 ? "nora_crop.jpg" : "no file chosen"}</span>
            </div>
            <div style={{marginTop: 8, color: "#555", fontSize: 12}}>…or copy a picture and paste it here (Ctrl+V).</div>
            {s.preview > 0 && <div style={{marginTop: 8, width: 110, height: 170, border: "1px solid #7f9db9", opacity: s.preview, overflow: "hidden"}}><CroppedPic w={110} h={170} /></div>}
            <div style={{position: "absolute", left: 14, bottom: 14, display: "flex", gap: 8}}>
              <div style={{border: `2px ${s.sendPress > 0.3 ? "inset" : "outset"} #fff`, padding: "10px 16px", color: s.preview > 0.5 ? "#000" : "#999"}}>{s.sending ? "Sending…" : "Send"}</div>
              <div style={{border: "2px outset #fff", padding: "10px 16px"}}>Back</div>
            </div>
          </div>
        </>
      )}
      {/* photo picker */}
      {s.picker > 0 && (
        <div style={{position: "absolute", left: 0, top: 260 + (1 - s.picker) * 600, width: SW, height: SH - 260, background: "#fff", borderRadius: "16px 16px 0 0", fontFamily: sans, boxShadow: "0 -10px 30px rgba(0,0,0,.4)"}}>
          <div style={{padding: "16px 18px 10px", fontWeight: 800, fontSize: 18, color: "#111"}}>Photos</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, padding: "0 3px"}}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{height: 170, overflow: "hidden", background: "#ddd", outline: i === 0 && s.photoPress > 0 ? "4px solid #3b82f6" : "none", outlineOffset: -4}}>
                {i === 0 ? <CroppedPic w={133} h={170} /> : <ThumbCell t={FINDER.startPosts[i]} v={i} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
