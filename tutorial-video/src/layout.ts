// Fixed pixel layout of the fake browser + app, in "world" coordinates (1920x1080).
// The camera, cursor and overlays all aim at these points, so they stay in sync.

export const WIN = {x: 80, y: 50, w: 1760, h: 980};
export const TAB_H = 48;
export const ADDR_H = 52;
export const TITLE_H = 52;
export const SIDEBAR_W = 400;

export const APP_Y = WIN.y + TAB_H + ADDR_H; // 150
export const MAIN_Y = APP_Y + TITLE_H; // 202
export const MAIN_H = WIN.y + WIN.h - MAIN_Y; // 828
export const STAGE = {x: WIN.x, y: MAIN_Y, w: WIN.w - SIDEBAR_W, h: MAIN_H};
export const SIDEBAR_X = STAGE.x + STAGE.w; // 1440

export const CARD = {x: SIDEBAR_X + 20, y: MAIN_Y + 20, w: SIDEBAR_W - 40, pad: 20};
export const CARD_ROWS = {header: 20, name: 58, link: 112, footer: 244, height: 284}; // relative to CARD.y

// Points of interest
export const STAGE_CENTER = {x: STAGE.x + STAGE.w / 2, y: STAGE.y + STAGE.h / 2};
export const LINK_BOX = {x: CARD.x + CARD.pad - 8, y: CARD.y + CARD_ROWS.link - 6, w: 196, h: 116};
export const LINK_POINT = {x: CARD.x + CARD.pad + 96, y: CARD.y + CARD_ROWS.link + 56};
export const DOWNLOAD = {x: WIN.x + WIN.w - 72, y: WIN.y + TAB_H + ADDR_H / 2}; // icon center
export const TOAST = {x: DOWNLOAD.x + 44 - 340, y: DOWNLOAD.y + 34, w: 340};
export const TOAST_FILE = {x: TOAST.x + 36, y: TOAST.y + 79}; // file icon in the toast
export const DROP_BOX = {w: 300, h: 160};
