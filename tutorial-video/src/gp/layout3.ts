// Grid Player after trimming (Scenes 3–5): shorter video area, beat strip + bottom bar under it,
// RECORD card in the sidebar. World coordinates, same browser window as Scenes 1–2.
import {CARD, STAGE} from "../layout";
import type {Rect} from "../scene2/layout2";

export const VSTAGE: Rect = {x: STAGE.x, y: STAGE.y, w: STAGE.w, h: 668}; // black video area
export const VIDEO3: Rect = {x: STAGE.x + (STAGE.w - 1188) / 2, y: STAGE.y, w: 1188, h: 668}; // 16:9 picture
export const STRIP: Rect = {x: STAGE.x, y: VSTAGE.y + VSTAGE.h, w: STAGE.w, h: 118};
export const BOTTOMBAR: Rect = {x: STAGE.x, y: STRIP.y + STRIP.h, w: STAGE.w, h: STAGE.y + STAGE.h - (STRIP.y + STRIP.h)};

// The dancers are drawn in a 1360×765 space (shared with Scene 2) and scaled into VIDEO3.
export const SRC_W = 1360, SRC_H = 765;
export const K3 = VIDEO3.w / SRC_W;
export const COLS = "ABCDEFGHIJKLMNOPQRST";
export const cellRect = (name: string): Rect => {
  const col = COLS.indexOf(name[0]);
  const row = parseInt(name.slice(1), 10) - 1;
  const w = VIDEO3.w / 20, h = VIDEO3.h / 20;
  return {x: VIDEO3.x + col * w, y: VIDEO3.y + row * h, w, h};
};
export const cellAt = (sx: number, sy: number) => {
  const col = Math.max(0, Math.min(19, Math.floor((sx / SRC_W) * 20)));
  const row = Math.max(0, Math.min(19, Math.floor((sy / SRC_H) * 20)));
  return `${COLS[col]}${row + 1}`;
};

export const PLAY3 = {x: VIDEO3.x + 34, y: VIDEO3.y + VIDEO3.h - 30};
export const PROGRESS3 = {x: VIDEO3.x + 70, y: VIDEO3.y + VIDEO3.h - 32, w: VIDEO3.w - 250};

// Sidebar
export const TIMER3: Rect = {x: CARD.x, y: CARD.y + 302, w: CARD.w, h: 128};
export const REC_CARD: Rect = {x: CARD.x, y: TIMER3.y + TIMER3.h + 18, w: CARD.w, h: 292};
export const REC_BTN = {x: REC_CARD.x + 20 + 30, y: REC_CARD.y + 44 + 30, r: 30};
export const EXPORT_AUDIO: Rect = {x: REC_CARD.x + 20, y: REC_CARD.y + 116, w: REC_CARD.w - 40, h: 42};
export const EXPORT_TRIM: Rect = {x: REC_CARD.x + 20, y: REC_CARD.y + 166, w: REC_CARD.w - 40, h: 42};
export const DONE_BTN: Rect = {x: CARD.x + CARD.w - 20 - 98, y: CARD.y + 112 + 30, w: 98, h: 46};
export const LINK_CARD: Rect = {x: CARD.x, y: CARD.y, w: CARD.w, h: 284};

// Overlays inside the video
export const MIC: Rect = {x: VIDEO3.x + 16, y: VIDEO3.y + VIDEO3.h - 150, w: 270, h: 66};
export const RHYTHM: Rect = {x: VIDEO3.x + 330, y: VIDEO3.y + 14, w: 720, h: 56};

// Files tray ("Your files"), just under the browser window
export const TRAY: Rect = {x: 1290, y: 1048, w: 550, h: 100};
