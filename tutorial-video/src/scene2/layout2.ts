// Scene 2 pixel layout in world coordinates (same browser window as Scene 1, see ../layout.ts).
import {CARD, STAGE} from "../layout";

export type Rect = {x: number; y: number; w: number; h: number};

// 16:9 video, letterboxed inside the black stage
export const VIDEO: Rect = {x: STAGE.x, y: STAGE.y + 32, w: STAGE.w, h: 765};
const VB = VIDEO.y + VIDEO.h; // video bottom (997)

export const CONTROLS_H = 84;
export const PLAY_BTN = {x: VIDEO.x + 44, y: VB - 40};
export const PROGRESS = {x: VIDEO.x + 22, y: VB - 82, w: VIDEO.w - 44};

// Beat overlays (sit above the player controls)
export const DECK: Rect = {x: VIDEO.x + 24, y: VB - CONTROLS_H - 160, w: 1000, h: 150};
export const COUNT: Rect = {x: DECK.x, y: DECK.y - 100, w: DECK.w, h: 88};
export const CUBES: Rect = {x: DECK.x + DECK.w + 16, y: COUNT.y - 150, w: VIDEO.x + VIDEO.w - 16 - (DECK.x + DECK.w + 16), h: DECK.y + DECK.h - (COUNT.y - 150)};

// Sidebar cards under the NEXT LINK card
export const TIMER_CARD: Rect = {x: CARD.x, y: CARD.y + 302, w: CARD.w, h: 128};
export const TRIM_CARD: Rect = {x: CARD.x, y: TIMER_CARD.y + TIMER_CARD.h + 18, w: CARD.w, h: 172};
export const OUT_BTN: Rect = {x: TRIM_CARD.x + 126, y: TRIM_CARD.y + 54, w: 104, h: 42};
export const TRIM_BTN: Rect = {x: TRIM_CARD.x + 20, y: TRIM_CARD.y + 110, w: TRIM_CARD.w - 40, h: 46};

export const center = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
export const pad = (r: Rect, p: number): Rect => ({x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p});
export const union = (a: Rect, b: Rect): Rect => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return {x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y};
};
