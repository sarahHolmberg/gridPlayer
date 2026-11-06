import React from "react";
import {AbsoluteFill, interpolate, useCurrentFrame} from "remotion";
import {Check, Copy, Crop, Link2, MapPin, Send, Tag, Users, X, ArrowRight, Camera, CircleUserRound, Timer} from "lucide-react";
import {CONFIG, sec} from "../config";
import {FINDER as K} from "./config";
import {ease, pop, track, window01} from "../anim";
import {Backdrop, Cam, Caption, CaptionSpec, Pt, Ripple, StepIndicator, World, clickPress, fontFamily} from "../shared";
import {
  AVATAR_CROP, Avatar, AvatarPic, BACK_BTN, BrowserScreen, CHOOSE_BTN, COPY_LINK, CROP_TARGET, CroppedPic, EDIT_DONE, LINK_FIELD, MarkupScreen, NAME_FIELD, PASTE_BUBBLE,
  PHONE, PostScreen, ProfileScreen, SCREEN, SEND_BTN, SHARE_BTN, SH, SUBMIT_BTN, SW, ShareSheet, TAG_ICON, Toast, bioRect, cellRect, postPoint,
  tabCenter, toWorld,
} from "./phone";
import {LOOKS} from "../gp/dancers3";

const fps = CONFIG.fps;
const GREEN = "#22c55e", RED = "#ef4444", BLUE = "#3b82f6";

/* ── step start times, each after the previous ── */
const S = (() => {
  const o: Record<string, number> = {};
  let t = 0;
  for (const [k, d] of Object.entries(K.steps)) { o[k] = t; t += d; }
  o.end = t;
  return o as Record<keyof typeof K.steps | "end", number>;
})();
export const FINDER_FRAMES = Math.round(S.end * fps);

const A = K.accounts;
const tagged = K.tagged[K.pickIndex];
const xsTagged = [0.33, 0.5, 0.67];
const TAGS = [
  {name: A.fail.user, xFrac: xsTagged[0], look: 0, h: 400},
  {name: A.ok.user, xFrac: xsTagged[1], look: 2, h: 240},
  {name: K.thirdTag, xFrac: xsTagged[2], look: 3, h: 400},
];
const tagPoint = (i: number) => {
  const p = postPoint(TAGS[i].xFrac, 765 * 0.9 - TAGS[i].h * LOOKS[TAGS[i].look].scale);
  return {x: p.x, y: p.y - 22};
};
const poster = {user: K.thirdTag, name: "Sam Sample", look: 3, counts: ["", "", ""], bio: []};
const center = (r: {x: number; y: number; w: number; h: number}) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

/* ── taps (screen-local) ── */
const SHOT_THUMB = {x: 64, y: SH - 130};
const T = {
  taggedTab: {at: S.profile + 1.6, p: tabCenter(3)},
  pick: {at: S.pick + 1.6, p: center(cellRect(K.pickIndex))},
  tagIcon: {at: S.tags + 0.9, p: TAG_ICON},
  failTag: {at: S.tags + 2.6, p: tagPoint(0)},
  back: {at: S.fail + 3.6, p: BACK_BTN},
  okTag: {at: S.ok + 0.8, p: tagPoint(1)},
  avatarThumb: {at: S.avatar + 1.6, p: SHOT_THUMB},
  avatarDone: {at: S.avatar + 6.0, p: EDIT_DONE},
  duo: {at: S.browse + 4.6, p: center(cellRect(K.chosenIndex))},
  share: {at: S.share + 0.8, p: SHARE_BTN},
  copy: {at: S.share + 2.2, p: COPY_LINK},
  shotThumb: {at: S.shot + 1.6, p: SHOT_THUMB},
  shotDone: {at: S.shot + 5.8, p: EDIT_DONE},
  nameField: {at: S.site + 1.0, p: NAME_FIELD},
  linkField: {at: S.site + 3.2, p: LINK_FIELD},
  paste: {at: S.site + 4.0, p: PASTE_BUBBLE},
  submit: {at: S.site + 5.6, p: SUBMIT_BTN},
  choose: {at: S.pic + 0.8, p: CHOOSE_BTN},
  photo1: {at: S.pic + 2.1, p: {x: 67, y: 391}},
  photo2: {at: S.pic + 2.7, p: {x: 201, y: 391}},
  add: {at: S.pic + 3.3, p: {x: 352, y: 284}},
  send: {at: S.pic + 4.8, p: SEND_BTN},
};
const TAPS = Object.values(T).sort((x, y) => x.at - y.at);
const tap = (f: number, k: keyof typeof T) => clickPress(f, T[k].at);

/* ── screens: a navigation stack with push / pop / fade ── */
type Nav = {at: number; key: string; kind: "push" | "pop" | "fade"};
const NAV: Nav[] = [
  {at: 0, key: "start", kind: "fade"},
  {at: S.pick + 1.8, key: "taggedPost", kind: "push"},
  {at: S.tags + 2.85, key: "fail", kind: "push"},
  {at: S.fail + 3.8, key: "taggedPost", kind: "pop"},
  {at: S.ok + 1.0, key: "ok", kind: "push"},
  {at: S.avatar + 1.8, key: "markupAvatar", kind: "fade"},
  {at: S.avatar + 6.2, key: "ok", kind: "fade"},
  {at: S.browse + 4.8, key: "duo", kind: "push"},
  {at: S.shot + 1.8, key: "markup", kind: "fade"},
  {at: S.site, key: "browser", kind: "fade"},
];

/* ── checklist states ── */
type St = "todo" | "check" | "ok" | "no";
const CHECKS: [number, St][][] = [
  [[S.pick + 1.6, "ok"]],
  [[S.fail + 0.6, "check"], [S.fail + 2.0, "no"], [S.ok + 1.2, "check"], [S.ok + 3.0, "ok"]],
  [[S.avatar + 0.3, "check"], [S.avatar + 5.0, "ok"]],
  [[S.browse + 0.5, "check"], [S.browse + 3.2, "ok"]],
  [[S.browse + 0.5, "check"], [S.browse + 3.2, "ok"]],
  [[S.share + 2.4, "ok"]],
  [[S.shot + 2.2, "check"], [S.shot + 5.0, "ok"]],
  [[S.site + 0.5, "check"], [S.pic + 5.5, "ok"]],
];
const stateAt = (t: number, list: [number, St][]) => list.reduce<{s: St; at: number}>((acc, [at, s]) => (t >= at ? {s, at} : acc), {s: "todo", at: 0});

const Checklist: React.FC<{f: number; t: number; show: number}> = ({f, t, show}) => (
  <div style={{position: "absolute", left: 200, top: 130, width: 700, opacity: show, transform: `translateX(${(1 - show) * -30}px)`,
    background: "rgba(9,13,24,.88)", borderRadius: 20, padding: "22px 26px", boxSizing: "border-box", color: "#fff", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 20px 50px rgba(0,0,0,.4)"}}>
    <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.6)", marginBottom: 10}}>CHECKLIST</div>
    {K.checklist.map((label, i) => {
      const {s, at} = stateAt(t, CHECKS[i]);
      const p = s === "todo" ? 0 : pop(f, at);
      const col = s === "ok" ? GREEN : s === "no" ? RED : s === "check" ? BLUE : "rgba(255,255,255,.25)";
      return (
        <div key={i} style={{display: "flex", alignItems: "center", gap: 14, padding: "5px 0", fontSize: 23, fontWeight: 600, color: s === "todo" ? "rgba(255,255,255,.55)" : "#fff"}}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
            background: s === "ok" || s === "no" ? col : "transparent", border: `3px solid ${col}`, boxSizing: "border-box", transform: `scale(${s === "todo" ? 1 : 0.7 + 0.3 * p})`,
            boxShadow: s === "check" ? `0 0 ${10 + 8 * Math.sin(t * 6)}px ${BLUE}` : "none",
          }}>
            {s === "ok" && <Check size={22} color="#fff" strokeWidth={4} />}
            {s === "no" && <X size={22} color="#fff" strokeWidth={4} />}
          </div>
          {label}
        </div>
      );
    })}
  </div>
);

const Card: React.FC<{show: number; color?: string; children: React.ReactNode}> = ({show, color = BLUE, children}) =>
  show <= 0 ? null : (
    <div style={{position: "absolute", left: 200, top: 625, width: 700, opacity: show, transform: `translateY(${(1 - show) * 24}px)`,
      background: "#fff", borderRadius: 20, padding: "20px 24px", boxSizing: "border-box", borderLeft: `10px solid ${color}`, boxShadow: "0 20px 50px rgba(0,0,0,.4)", fontSize: 25, color: "#111"}}>
      {children}
    </div>
  );

const Recap: React.FC<{f: number; show: number}> = ({f, show}) => {
  if (show <= 0) return null;
  const icons = [Tag, MapPin, CircleUserRound, Users, Link2, Crop, Send];
  return (
    <AbsoluteFill style={{background: `rgba(5,8,15,${0.75 * show})`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14}}>
      {K.recap.map((l, i) => {
        const Ic = icons[i];
        const p = Math.min(1, Math.max(0, (f - sec(S.recap + 0.3) - i * 7) / 10));
        return (
          <React.Fragment key={i}>
            {i > 0 && <ArrowRight size={26} color="#fff" style={{opacity: p, flex: "none"}} />}
            <div style={{width: 200, height: 190, flex: "none", background: "#fff", borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: "0 20px 40px rgba(0,0,0,.45)", padding: 12, boxSizing: "border-box", textAlign: "center"}}>
              <div style={{fontSize: 18, fontWeight: 800, color: "#9ca3af"}}>{i + 1}</div>
              <Ic size={44} color={i === 1 ? RED : i === K.recap.length - 1 ? GREEN : BLUE} />
              <div style={{fontSize: 20, fontWeight: 800, color: "#111", lineHeight: 1.2}}>{l}</div>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Screenshot effect over a screen: white flash, then the little thumbnail bottom-left. */
const ShotFx: React.FC<{flash: number; thumb: number; shot: React.ReactNode}> = ({flash, thumb, shot}) => (
  <>
    {flash > 0 && <div style={{position: "absolute", inset: 0, background: "#fff", opacity: flash}} />}
    {thumb > 0 && (
      <div style={{position: "absolute", left: 20, top: SH - 230, width: 92, height: 190, opacity: thumb, border: "3px solid #fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,.6)"}}>
        <div style={{width: SW, height: SH, transform: `scale(${92 / SW})`, transformOrigin: "0 0"}}>{shot}</div>
      </div>
    )}
  </>
);

const TimeCard: React.FC<{f: number; show: number}> = ({f, show}) => {
  if (show <= 0) return null;
  const sweep = Math.min(1, Math.max(0, (f - sec(S.time + 0.3)) / sec(2.2)));
  const R = 120, circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{background: `rgba(5,8,15,${0.8 * show})`, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 70}}>
      <div style={{position: "relative", width: 300, height: 300, opacity: show, transform: `scale(${0.85 + 0.15 * show})`}}>
        <svg width={300} height={300} style={{position: "absolute", inset: 0, transform: "rotate(-90deg)"}}>
          <circle cx={150} cy={150} r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth={18} />
          <circle cx={150} cy={150} r={R} fill="none" stroke={GREEN} strokeWidth={18} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - sweep * 50 / 60)} />
        </svg>
        <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff"}}>
          <Timer size={40} color={GREEN} />
          <div style={{fontSize: 64, fontWeight: 900}}>{K.timeCard.big}</div>
          <div style={{fontSize: 24, fontWeight: 700, opacity: 0.8}}>{K.timeCard.sub}</div>
        </div>
      </div>
      <div style={{width: 720, fontSize: 40, lineHeight: 1.35, color: "#fff", fontWeight: 600, opacity: ease(f, S.time + 0.6, 0.7)}}>{K.timeCard.text}</div>
    </AbsoluteFill>
  );
};

export const FinderScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / fps;
  const fade = interpolate(t, [0, 0.8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}) *
    interpolate(t, [S.fade, S.end], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});

  const cam = track<Cam>(f, {cx: 1000, cy: 560, z: 0.92, rx: 8, ry: -10}, [
    {at: 0, dur: 2.2, v: {cx: 1000, cy: 545, z: 1.02, rx: 0, ry: -3}},
    {at: S.fail, dur: 1.4, v: {cx: 1000, cy: 545, z: 1.03, rx: 0, ry: -2}},
    {at: S.site, dur: 1.4, v: {cx: 1000, cy: 545, z: 1.03, rx: 0, ry: 2}},
    {at: S.recap - 0.4, dur: 1.2, v: {cx: 960, cy: 540, z: 1, rx: 0, ry: 0}},
  ]);

  /* ── screen states ── */
  const tagsShow = t >= T.tagIcon.at ? pop(f, T.tagIcon.at + 0.05) : 0;
  const sheet = ease(f, S.share + 1.0, 0.5) - ease(f, S.share + 2.35, 0.4);
  const toast = window01(f, S.share + 2.45, S.share + 4.2, 0.3, 0.3);
  const cropP = ease(f, S.shot + 3.4, 1.3);
  const crop = {
    x: interpolate(cropP, [0, 1], [0, CROP_TARGET.x]), y: interpolate(cropP, [0, 1], [0, CROP_TARGET.y]),
    w: interpolate(cropP, [0, 1], [SW, CROP_TARGET.w]), h: interpolate(cropP, [0, 1], [SH, CROP_TARGET.h]),
  };
  const aCropP = ease(f, S.avatar + 2.7, 1.3);
  const aCrop = {
    x: interpolate(aCropP, [0, 1], [0, AVATAR_CROP.x]), y: interpolate(aCropP, [0, 1], [0, AVATAR_CROP.y]),
    w: interpolate(aCropP, [0, 1], [SW, AVATAR_CROP.w]), h: interpolate(aCropP, [0, 1], [SH, AVATAR_CROP.h]),
  };
  // white flash + thumbnail after a screenshot taken at `at`
  const shotFx = (at: number) => {
    const flash = t >= at && t < at + 0.5 ? 1 - (t - at) / 0.5 : 0;
    const thumb = window01(f, at + 0.2, at + 1.5, 0.3, 0.2);
    return {flash, thumb};
  };
  const typed = Math.floor(Math.max(0, Math.min(1, (t - (S.site + 1.3)) / 1.3)) * A.ok.user.length);

  const bioMark = (lines: number[], color: string, show: number, label: string, ok: boolean) => show <= 0 ? null : (
    <>
      {lines.map((l) => {
        const r = bioRect(l);
        return <div key={l} style={{position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 6, border: `3px solid ${color}`, background: `${color}22`, opacity: show, boxSizing: "border-box"}} />;
      })}
      <div style={{position: "absolute", right: 14, top: bioRect(lines[0]).y - 4, opacity: show, transform: `scale(${0.7 + 0.3 * show})`, background: color, color: "#fff", fontWeight: 800, fontSize: 15, borderRadius: 999, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, fontFamily}}>
        {ok ? <Check size={16} strokeWidth={4} /> : <X size={16} strokeWidth={4} />}{label}
      </div>
    </>
  );

  const screen = (key: string): React.ReactNode => {
    switch (key) {
      case "start": {
        const onTagged = t >= T.taggedTab.at + 0.15;
        const pickHi = window01(f, S.pick + 0.2, S.pick + 1.9, 0.3, 0.2);
        const r = cellRect(K.pickIndex);
        return (
          <ProfileScreen a={A.start} posts={onTagged ? K.tagged : K.startPosts} tab={onTagged ? 3 : 0} v={t}
            marks={pickHi > 0 ? <div style={{position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, border: `4px solid ${GREEN}`, boxSizing: "border-box", opacity: pickHi, boxShadow: `0 0 20px ${GREEN}`}}>
              <div style={{position: "absolute", left: 6, bottom: 6, background: GREEN, color: "#fff", fontSize: 13, fontWeight: 800, padding: "3px 8px", borderRadius: 6, fontFamily}}>3 dancers</div>
            </div> : null} />
        );
      }
      case "taggedPost":
        return (
          <PostScreen a={poster} t={tagged} v={t} xs={xsTagged} tagsShow={tagsShow} tagIconPress={tap(f, "tagIcon")}
            tags={TAGS.map((tg, i) => ({...tg, on: i === 0 ? tap(f, "failTag") + (t >= T.failTag.at && t < S.fail + 3.8 ? 0.6 : 0) : i === 1 ? tap(f, "okTag") : 0}))} />
        );
      case "fail":
        return <ProfileScreen a={A.fail} posts={K.startPosts} tab={0} v={t}
          marks={bioMark(A.fail.clue, RED, ease(f, S.fail + 0.6, 0.6), "Not in Norway", false)} />;
      case "ok": {
        const marks = K.verdicts.map((vd, i) => {
          const at = S.browse + 0.8 + i * 1.2;
          const p = t >= at ? pop(f, at) : 0;
          const r = cellRect(i);
          const c = vd.ok ? GREEN : RED;
          return p <= 0 ? null : (
            <div key={i} style={{position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, border: `4px solid ${c}`, boxSizing: "border-box", background: vd.ok ? "transparent" : "rgba(0,0,0,.35)", opacity: Math.min(1, p)}}>
              <div style={{position: "absolute", left: 6, right: 6, bottom: 6, background: c, color: "#fff", fontSize: 13, fontWeight: 800, padding: "4px 6px", borderRadius: 6, fontFamily, display: "flex", alignItems: "center", gap: 4, transform: `scale(${p})`}}>
                {vd.ok ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}{vd.text}
              </div>
            </div>
          );
        });
        const fx = shotFx(S.avatar + 0.4);
        const ring = window01(f, S.avatar - 0.1, S.avatar + 1.6, 0.3, 0.3);
        return (
          <>
            <ProfileScreen a={A.ok} posts={K.okPosts} tab={0} v={t < S.avatar ? t : t < S.browse ? S.avatar : t}
              marks={<>
                {bioMark(A.ok.clue, GREEN, ease(f, S.ok + 1.8, 0.6) - ease(f, S.avatar, 0.4), "Norway", true)}
                {ring > 0 && <div style={{position: "absolute", left: AVATAR_CROP.x - 6, top: AVATAR_CROP.y - 6, width: AVATAR_CROP.w + 12, height: AVATAR_CROP.h + 12, borderRadius: "50%", border: `4px solid ${BLUE}`, opacity: ring, boxShadow: `0 0 20px ${BLUE}`}} />}
                {marks}
              </>} />
            <ShotFx {...fx} shot={<ProfileScreen a={A.ok} posts={K.okPosts} tab={0} v={S.avatar} />} />
          </>
        );
      }
      case "duo": {
        const fx = shotFx(S.shot + 0.4);
        return (
          <>
            <PostScreen a={A.ok} t={K.okPosts[K.chosenIndex]} v={t < S.shot ? t : S.shot} sharePress={tap(f, "share")} />
            <ShareSheet p={sheet} copyPress={tap(f, "copy")} />
            <Toast p={toast} text="Link copied" />
            <ShotFx {...fx} shot={<PostScreen a={A.ok} t={K.okPosts[K.chosenIndex]} v={S.shot} />} />
          </>
        );
      }
      case "markupAvatar":
        return <MarkupScreen shot={<ProfileScreen a={A.ok} posts={K.okPosts} tab={0} v={S.avatar} />} crop={aCrop} cropped={ease(f, S.avatar + 4.3, 0.6)}
          donePress={tap(f, "avatarDone")} result={<AvatarPic d={260} />} resultSize={{w: 260, h: 260}} />;
      case "markup":
        return <MarkupScreen shot={<PostScreen a={A.ok} t={K.okPosts[K.chosenIndex]} v={S.shot} />} crop={crop} cropped={ease(f, S.shot + 4.9, 0.6)} donePress={tap(f, "shotDone")} />;
      case "browser":
        return (
          <BrowserScreen
            name={A.ok.user.slice(0, typed)} link={t >= T.paste.at + 0.05 ? K.link : ""}
            focus={t >= T.linkField.at ? "link" : t >= T.nameField.at ? "name" : null}
            paste={window01(f, S.site + 3.4, T.paste.at + 0.1, 0.2, 0.15)} submitPress={tap(f, "submit")}
            msg={t >= S.pic + 5.5 ? "Saved!" : ""}
            dialog={t >= T.submit.at + 0.2 ? pop(f, T.submit.at + 0.2) - ease(f, S.pic + 5.3, 0.3) : 0}
            choosePress={tap(f, "choose")} picker={ease(f, S.pic + 1.0, 0.5) - ease(f, T.add.at + 0.1, 0.4)}
            sel1={t >= T.photo1.at ? pop(f, T.photo1.at) : 0} sel2={t >= T.photo2.at ? pop(f, T.photo2.at) : 0}
            preview={ease(f, T.add.at + 0.4, 0.4)} sendPress={tap(f, "send")} sending={t >= T.send.at && t < S.pic + 5.4}
          />
        );
    }
    return null;
  };

  // current + previous screen with a transition
  let ci = 0;
  NAV.forEach((n, i) => { if (t >= n.at) ci = i; });
  const cur = NAV[ci], prev = NAV[Math.max(0, ci - 1)];
  const tp = ci === 0 ? 1 : Math.min(1, Math.max(0, (t - cur.at) / 0.4));
  const e = 1 - Math.pow(1 - tp, 3);
  const layer = (node: React.ReactNode, style: React.CSSProperties) => <div style={{position: "absolute", inset: 0, ...style}}>{node}</div>;
  const screens = tp >= 1 ? layer(screen(cur.key), {}) : cur.kind === "fade" ? (
    <>{layer(screen(prev.key), {})}{layer(screen(cur.key), {opacity: e})}</>
  ) : cur.kind === "push" ? (
    <>{layer(screen(prev.key), {transform: `translateX(${-30 * e}%)`, filter: `brightness(${1 - 0.4 * e})`})}{layer(screen(cur.key), {transform: `translateX(${100 * (1 - e)}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,.5)"})}</>
  ) : (
    <>{layer(screen(cur.key), {transform: `translateX(${-30 * (1 - e)}%)`, filter: `brightness(${0.6 + 0.4 * e})`})}{layer(screen(prev.key), {transform: `translateX(${100 * e}%)`})}</>
  );

  /* finger */
  const keys = TAPS.map((tp2, i) => ({at: tp2.at - (i === 0 ? 0.9 : 0.75), dur: 0.6, v: toWorld(tp2.p), arc: 0.08}));
  const finger = track<Pt>(f, toWorld({x: SW / 2, y: SH + 80}), keys);
  const pressed = TAPS.reduce((m, tp2) => Math.max(m, clickPress(f, tp2.at)), 0);
  const fingerShow = ease(f, S.profile - 0.2, 0.5) - ease(f, S.recap - 0.4, 0.4);

  // callouts
  const failCard = window01(f, S.fail + 2.0, S.ok + 0.2, 0.4, 0.3);
  const cluesCard = window01(f, S.ok + 1.8, S.avatar + 0.1, 0.4, 0.3);
  const avatarShotCard = window01(f, S.avatar - 0.1, S.avatar + 2.5, 0.3, 0.3);
  const avatarCropCard = window01(f, S.avatar + 2.6, S.browse, 0.4, 0.3);
  const browseCard = window01(f, S.browse + 0.3, S.share, 0.4, 0.3);
  const shotCard = window01(f, S.shot - 0.2, S.shot + 2.1, 0.3, 0.3);
  const matchCard = window01(f, S.shot + 2.2, S.site + 0.4, 0.4, 0.3);
  const nameCard = window01(f, S.site + 0.8, S.recap, 0.4, 0.3);

  const C = K.captions;
  const CAPS: CaptionSpec[] = [
    {from: 0.3, to: S.profile - 0.05, step: null, text: C.intro},
    {from: S.profile, to: S.pick - 0.05, step: null, text: C.profile},
    {from: S.pick, to: S.tags - 0.05, step: null, text: C.pick},
    {from: S.tags, to: S.fail - 0.05, step: null, text: C.tags},
    {from: S.fail, to: S.fail + 1.95, step: null, text: C.fail1},
    {from: S.fail + 2.0, to: S.ok - 0.05, step: null, text: C.fail2, color: "#b91c1c"},
    {from: S.ok, to: S.avatar - 0.05, step: null, text: C.ok, color: "#15803d"},
    {from: S.avatar, to: S.browse - 0.05, step: null, text: C.avatar},
    {from: S.browse, to: S.share - 0.05, step: null, text: C.browse},
    {from: S.share, to: S.shot - 0.05, step: null, text: C.share},
    {from: S.shot, to: S.site - 0.05, step: null, text: C.shot},
    {from: S.site, to: S.pic - 0.05, step: null, text: C.site},
    {from: S.pic, to: S.recap - 0.05, step: null, text: C.pic},
    {from: S.recap, to: S.time - 0.05, step: null, text: C.recap, color: "#15803d"},
    {from: S.time, to: S.end, step: null, text: C.time},
  ];
  const stepIdx = t < S.fail ? 0 : t < S.avatar ? 1 : t < S.browse ? 2 : t < S.share ? 3 : t < S.shot ? 4 : t < S.site ? 5 : 6;

  return (
    <AbsoluteFill style={{background: "#000", fontFamily, color: "#111"}}>
      <AbsoluteFill style={{opacity: fade}}>
        <Backdrop f={f} />
        <World cam={cam}>
          <Checklist f={f} t={t} show={ease(f, 0.8, 0.8)} />
          <Card show={failCard} color={RED}>
            <div style={{display: "flex", gap: 14, alignItems: "flex-start"}}>
              <div style={{width: 44, height: 44, borderRadius: "50%", background: RED, flex: "none", display: "flex", alignItems: "center", justifyContent: "center"}}><X size={28} color="#fff" strokeWidth={4} /></div>
              <div>{K.callouts.fail}</div>
            </div>
          </Card>
          <Card show={cluesCard} color={GREEN}>
            <div style={{fontWeight: 800, marginBottom: 8}}>Clues they live in Norway:</div>
            {K.callouts.clues.map((c) => <div key={c} style={{display: "flex", alignItems: "center", gap: 10, marginTop: 4}}><Check size={22} color={GREEN} strokeWidth={4} />{c}</div>)}
          </Card>
          <Card show={avatarShotCard} color={BLUE}>
            <div style={{display: "flex", gap: 14, alignItems: "center"}}><Camera size={36} color={BLUE} />{K.callouts.avatarShot}</div>
          </Card>
          <Card show={avatarCropCard} color={GREEN}>
            <div>{K.callouts.avatarCrop}</div>
            <div style={{display: "flex", alignItems: "center", gap: 26, marginTop: 14}}>
              {[false, true].map((ok) => (
                <div key={String(ok)} style={{display: "flex", alignItems: "center", gap: 12}}>
                  <div style={{width: 110, height: 110, background: "#000", border: `4px solid ${ok ? GREEN : RED}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
                    <Avatar look={2} d={ok ? 102 : 46} />
                  </div>
                  <div style={{fontWeight: 800, color: ok ? GREEN_D : "#b91c1c", display: "flex", alignItems: "center", gap: 6}}>
                    {ok ? <Check size={24} strokeWidth={4} /> : <X size={24} strokeWidth={4} />}{ok ? "Tight" : "Too loose"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card show={browseCard} color={BLUE}>
            <div style={{fontWeight: 800, marginBottom: 8}}>The video must be:</div>
            {K.callouts.browse.map((c) => <div key={c} style={{display: "flex", alignItems: "center", gap: 10, marginTop: 4}}><Check size={22} color={GREEN} strokeWidth={4} />{c}</div>)}
          </Card>
          <Card show={shotCard} color={BLUE}>
            <div style={{display: "flex", gap: 14, alignItems: "center"}}><Camera size={36} color={BLUE} />Take a screenshot of the video (side button + volume up).</div>
          </Card>
          <Card show={matchCard} color={BLUE}>
            <div>{K.callouts.match}</div>
            <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 14}}>
              <Avatar look={2} d={96} />
              <ArrowRight size={34} color="#111" />
              <div style={{width: 66, height: 120, borderRadius: 8, overflow: "hidden", border: `3px solid ${GREEN}`}}><CroppedPic w={66} h={120} /></div>
              <div style={{fontWeight: 800, color: GREEN_D}}>Same person</div>
            </div>
          </Card>
          <Card show={nameCard} color={BLUE}>
            <div>{K.callouts.name}</div>
            <div style={{marginTop: 8, fontFamily: "ui-monospace, 'DejaVu Sans Mono', monospace", fontWeight: 800, fontSize: 30}}>{A.ok.user}</div>
            <div style={{marginTop: 10, display: "flex", alignItems: "center", gap: 10}}><Copy size={22} color={BLUE} />Then paste the link you copied.</div>
          </Card>

          {/* phone */}
          <div style={{position: "absolute", left: PHONE.x, top: PHONE.y, width: PHONE.w, height: PHONE.h, borderRadius: 64, background: "#0b0b0c", boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 0 0 3px #2a2a2e"}}>
            <div style={{position: "absolute", left: SCREEN.x - PHONE.x, top: SCREEN.y - PHONE.y, width: SW, height: SH, borderRadius: 50, overflow: "hidden", background: "#000"}}>
              {screens}
            </div>
          </div>
          {/* finger */}
          {TAPS.map((tp2, i) => <Ripple key={i} f={f} at={tp2.at} p={toWorld(tp2.p)} color="#ffffff" />)}
          {fingerShow > 0 && (
            <div style={{position: "absolute", left: finger.x - 26, top: finger.y - 26, width: 52, height: 52, borderRadius: "50%", opacity: fingerShow * 0.9,
              background: "rgba(255,255,255,.55)", border: "3px solid #fff", boxSizing: "border-box", transform: `scale(${1 - 0.25 * pressed})`, boxShadow: "0 6px 16px rgba(0,0,0,.45)"}} />
          )}
        </World>
        <Recap f={f} show={ease(f, S.recap, 0.6) - ease(f, S.time, 0.5)} />
        <TimeCard f={f} show={ease(f, S.time, 0.6)} />
        <StepIndicator show={ease(f, 0.3, 0.8) - ease(f, S.recap, 0.4)} step={stepIdx + 1} total={K.stepTitles.length} title={K.stepTitles[stepIdx]} />
        {CAPS.map((c, i) => <Caption key={i} f={f} c={c} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GREEN_D = "#15803d";
