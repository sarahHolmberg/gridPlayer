// app/js/keys.js: Keyboard shortcuts and the shortcut focus mode (green / orange frame).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// Space = play/pause the VIDEO only. The recording is controlled with R (or the red button).
function spaceToggle() {
  if (v.paused) v.play().catch(() => {});
  else v.pause();
}

const KEYS = {
  " ": spaceToggle,
  q: toggleCue, r: recToggle,                                // R: start / pause / resume the recording
  i: setIn, o: setOut, x: clearTrim,
  arrowleft: (e) => nudge(e.shiftKey ? -1000 : -stepMs()),   // fine steps back/forward, Shift = 1 s
  arrowright: (e) => nudge(e.shiftKey ? 1000 : stepMs()),
  a: () => stepSpeed(-1), d: () => stepSpeed(1),
  g: () => $("show").click(), n: () => $("lbl").click(), l: () => $("loop").click(),
  enter: goGrid, t: goTrim,
  h: () => document.body.classList.toggle("hide-side"), // video gets the full width; ResizeObserver refits
};
const GRID_ONLY = new Set(["r", "g", "n", "t", "q"]), TRIM_ONLY = new Set(["i", "o", "x", "enter"]);
const typing = (e) => e.target.matches("input[type=number], input[type=text], input[type=password], textarea");

// Capture phase + stopPropagation: the video's own controls and focused buttons/checkboxes
// never see these keys, so Space can't double-toggle or click whatever happens to be focused.
addEventListener("keydown", (e) => {
  if (!kbOn || !$("extGate").hidden || !$("help").hidden || !$("doneDlg").hidden || !$("upd").hidden || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toLowerCase();
  if (e.repeat && !key.startsWith("arrow")) return; // only the arrows auto-repeat
  const fn = KEYS[key];
  if (!fn || (trimMode ? GRID_ONLY : TRIM_ONLY).has(key)) return;
  e.preventDefault(); e.stopPropagation();
  fn(e);
}, true);
// Buttons/checkboxes activate on Space at key-UP, so block that too
addEventListener("keyup", (e) => { if (kbOn && e.key === " " && !typing(e)) { e.preventDefault(); e.stopPropagation(); } }, true);

// ---- Shortcut focus mode: a visible switch so you always know whether the keys are live ----
// ON (green frame)  = shortcuts on and this page has keyboard focus
// WAIT (orange)     = shortcuts on, but the page lost focus (click anywhere on it)
// OFF               = keys behave normally (native video arrows, Space scrolls, etc.)
let kbOn = true;
function updateKb() {
  const st = !kbOn ? "off" : document.hasFocus() ? "on" : "wait";
  $("kbBtn").dataset.st = st;
  $("kbBtn").textContent = st === "on" ? "⌨ Shortcuts: ON" : st === "off" ? "⌨ Shortcuts: OFF" : "⌨ Click the page to activate";
  $("stage").className = st === "on" ? "kb-on" : st === "wait" ? "kb-wait" : "";
  console.log(`[keys] ${st}`);
}
// Park keyboard focus on the stage (not on the video's own controls) so the keys keep working after clicks
const reclaim = () => { if (kbOn && $("doneDlg").hidden) $("stage").focus({ preventScroll: true }); }; // not while you type your code

$("kbBtn").onclick = () => { kbOn = !kbOn; updateKb(); reclaim(); };
addEventListener("focus", updateKb);
addEventListener("blur", updateKb);
addEventListener("pointerup", (e) => { if (kbOn && !typing(e)) setTimeout(reclaim, 0); }, true);
// Number boxes keep focus (and swallow the keys) until you leave them, so Enter/Escape lets go
document.querySelectorAll("input[type=number]").forEach((i) =>
  i.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === "Escape") { i.blur(); reclaim(); } }));
updateKb();
reclaim();
