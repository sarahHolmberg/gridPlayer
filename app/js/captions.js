// app/js/captions.js: Click captions (TEST, beside the normal recording): click a grid cell = a new line with the time and the cell,
// then say the action and Chrome's speech recognition writes it into that line. Export JSON = the caption file, no transcribing step.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).
// The Record card (recording.js) is not touched: both can run at the same time.

// CHANGE HERE: everything in the JSON that is not a caption (copied from the example file)
const CAP_TEMPLATE = {
  fps: 30,
  style: {
    type: "comic-bubble", fill: "#FFFFFF", ink: "#000000",
    font: { family: "Comic Neue", weight: 700, sizeCells: 0.4, capitals: true },
    outlineCells: 0.05, ballRadiusCells: 0.25,
    tail: { enabled: true, defaultTarget: "H8", maxLengthCells: 1.8, reach: 0.6 },
  },
  timing: {
    exitFadeSeconds: 0.05, gapBeforeNextSeconds: 0.5, lastHoldSeconds: 0.6, firstBallPopSeconds: 0.15,
    firstOpenSeconds: 0.15, endCloseSeconds: 0.15, endShrinkSeconds: 0.15, split: { close: 0.25, travel: 0.5, open: 0.25 },
  },
  zooms: [], ending: [],
  captionZoom: { enabled: true, percent: 3.5, seconds: 0.2 },
  nameZoom: { percent: 4, seconds: 0.5 },
  popSound: { enabled: true, offsetSeconds: 0 },
  bubbleScale: { normal: 1, name: 1 },
};
const CAP_SECONDS = 0.2;   // CHANGE HERE: how long a caption lasts ("to" = "from" + this, never past the next caption)
const CAP_LANG = "en-US";  // CHANGE HERE: the language you speak in

// One line = { id, from, cell, base (typed), heard: { result key: spoken words } }. Line 1 is the name bubble.
let caps = [], capActive = null, capNextId = 1;
const capText = (c) => [c.base, ...Object.values(c.heard)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
const capClean = (s) => s.replace(/^\s*action\s+/i, "").replace(/[.,!?]+$/, "").trim(); // "Action jump and turn." -> "jump and turn"
const capTime = () => Math.max(0, v.currentTime - (trimMode ? 0 : tIn)); // the same time as the clock: from the In point

// ---- Saved per video in this browser, so a reload does not lose the list ----
const capKey = () => "grid-captions:" + (currentFile ? currentFile.name : v.currentSrc);
function capSave() {
  try { localStorage.setItem(capKey(), JSON.stringify(caps.map((c) => ({ from: c.from, cell: c.cell, text: capText(c) })))); }
  catch (err) { console.warn("[captions] could not save:", err); }
}
function capLoad() {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(capKey())) || []; } catch (err) { console.warn("[captions] could not load:", err); }
  capNextId = 1;
  caps = saved.map((s) => ({ id: capNextId++, from: s.from, cell: s.cell, base: s.text, heard: {} }));
  capActive = caps.length ? caps[caps.length - 1].id : null;
  capDraw();
  console.log(`[captions] ${caps.length} lines for this video`);
}

// ---- The list in the side panel ----
function capDraw() {
  const list = $("capList");
  list.innerHTML = "";
  caps.forEach((c, i) => {
    const d = document.createElement("div");
    d.className = "cap" + (c.id === capActive ? " now" : "");
    const t = document.createElement("button");
    t.className = "link capT"; t.textContent = c.from.toFixed(3); t.title = "Go to this moment";
    t.onclick = () => { v.pause(); v.currentTime = c.from + (trimMode ? 0 : tIn); };
    const cell = document.createElement("b");
    cell.textContent = c.cell;
    const inp = document.createElement("input");
    inp.type = "text"; inp.value = capText(c); inp.placeholder = i === 0 ? "the name…" : "say the action…";
    inp.onfocus = () => { capActive = c.id; list.querySelectorAll(".cap").forEach((x) => x.classList.toggle("now", x === d)); };
    inp.oninput = () => { c.base = inp.value; c.heard = {}; capSave(); }; // typing replaces what was heard
    const del = document.createElement("button");
    del.className = "icon"; del.textContent = "✕"; del.title = "Delete this line";
    del.onclick = () => { caps = caps.filter((x) => x !== c); if (capActive === c.id) capActive = null; capSave(); capDraw(); };
    d.append(t, cell, inp, del);
    if (i === 0) d.title = "Line 1 is the name bubble";
    list.appendChild(d);
  });
  $("capCount").textContent = caps.length ? `${caps.length} line${caps.length > 1 ? "s" : ""}` : "Click a cell to start";
  $("capJson").disabled = $("capClear").disabled = !caps.length;
  list.querySelector(".now")?.scrollIntoView({ block: "nearest" });
}
// Only the words change while you talk: update that one box instead of redrawing (so a box you are typing in keeps its cursor)
function capRefresh(c) {
  const i = caps.indexOf(c), inp = $("capList").children[i]?.querySelector("input");
  if (inp && document.activeElement !== inp) inp.value = capText(c);
}

// ---- Clicking the grid: a new line with the time and the cell ----
function capClickable() {
  const on = $("capOn").checked;
  $("grid").classList.toggle("clickable", on);
  console.log(`[captions] click cells ${on ? "on" : "off"}`);
}
$("grid").addEventListener("click", (e) => {
  if (!$("capOn").checked) return;
  const n = +$("n").value, r = $("grid").getBoundingClientRect();
  const col = Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n));
  const row = Math.min(n - 1, Math.floor(((e.clientY - r.top) / r.height) * n));
  const c = { id: capNextId++, from: +capTime().toFixed(3), cell: cellName(col, row), base: "", heard: {} };
  caps.push(c); caps.sort((a, b) => a.from - b.from);
  capActive = c.id; // what you say now goes into this line
  const hit = $("grid").children[row * n + col];
  hit?.classList.add("hit"); setTimeout(() => hit?.classList.remove("hit"), 300);
  capSave(); capDraw();
  console.log(`[captions] ${c.from.toFixed(3)} ${c.cell}`);
});

// ---- Speech: Chrome's speech recognition (needs the internet: Chrome sends the sound to Google) ----
// Each piece of speech belongs to the line that was active when you STARTED saying it, so clicking the next cell mid-sentence is fine.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let capSR = null, capListening = false, capSession = 0, capOwner = {};
function micSet(on) {
  if (on === capListening) return;
  capListening = on;
  $("capMic").classList.toggle("on", on);
  $("capMic").textContent = on ? "🎤 Listening… (M)" : "🎤 Listen (M)";
  // the internet light (core.js) is green while capListening
  netBusy += on ? 1 : -1;
  if (netBusy) { clearTimeout(netTimer); $("net").classList.add("on"); } else $("net").classList.remove("on");
  if (on) micStart(); else capSR?.stop();
  console.log(`[captions] mic ${on ? "on" : "off"}`);
}
function micStart() {
  capSR = new SR();
  capSR.lang = CAP_LANG; capSR.continuous = true; capSR.interimResults = true;
  const session = ++capSession; capOwner = {};
  capSR.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const key = session + ":" + i;
      if (!(key in capOwner)) capOwner[key] = capActive;
      const c = caps.find((x) => x.id === capOwner[key]);
      if (!c) continue; // said before the first click, or that line was deleted
      c.heard[key] = capClean(e.results[i][0].transcript);
      capRefresh(c);
      if (e.results[i].isFinal) { capSave(); console.log(`[captions] heard for ${c.cell}: "${c.heard[key]}"`); }
    }
  };
  capSR.onerror = (e) => {
    console.error("[captions] speech error:", e.error);
    if (e.error === "not-allowed" || e.error === "service-not-allowed") { setStatus("Microphone or speech not allowed. Type the actions instead."); micSet(false); }
    else if (e.error === "network") { setStatus("Speech needs the internet. Type the actions instead."); micSet(false); }
  };
  capSR.onend = () => { if (capListening && session === capSession) micStart(); }; // Chrome stops after a silence: keep going
  capSR.start();
}
$("capMic").onclick = () => {
  if (!SR) { setStatus("This browser has no speech recognition: use Chrome, or type the actions."); return; }
  micSet(!capListening);
};
if (!SR) $("capMic").title = "Needs Chrome: this browser has no speech recognition (you can still type)";

// ---- Export: the caption file, same shape as the one made from the transcript ----
function capVideoName() {
  if (!currentFile) return "video.mp4";
  const trimmed = tIn > 0 || tOut !== null; // the times count from In, so they belong to the trimmed video
  return trimmed ? currentFile.name.replace(/(\.[^.]+)$/, "-trimmed$1") : currentFile.name;
}
function capExport() {
  const list = [...caps].sort((a, b) => a.from - b.from);
  const { fps, style, timing, ...rest } = CAP_TEMPLATE; // same order as the example file: captions right after timing
  const out = {
    version: 1,
    video: { file: capVideoName() },
    grid: { size: +$("n").value },
    fps, style, timing,
    captions: list.map((c, i) => {
      const next = list[i + 1], to = Math.min(c.from + CAP_SECONDS, next ? next.from : Infinity);
      return { id: i + 1, text: capText(c), from: c.from, to: +Math.max(c.from, to).toFixed(3), cells: [c.cell], mode: "center", out: "default" };
    }),
    ...rest,
  };
  const empty = out.captions.filter((c) => !c.text).length;
  download(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }), capVideoName().replace(/\.[^.]+$/, "") + "-captions.json");
  setStatus(`Exported ${out.captions.length} captions` + (empty ? ` (${empty} without words)` : ""));
}
$("capJson").onclick = capExport;
$("capClear").onclick = () => {
  if (!confirm(`Delete all ${caps.length} lines?`)) return;
  caps = []; capActive = null; capSave(); capDraw();
};
$("capOn").onchange = capClickable;
v.addEventListener("loadedmetadata", capLoad); // every video has its own list
capDraw();
