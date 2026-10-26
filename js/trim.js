// js/trim.js: Trim stage: In / Out, trim & continue, playback kept inside [In, Out], fine stepping, Export trim video (needs grid-trim.js).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Trim: non-destructive. No re-encoding, no export: playback is simply confined to [In, Out]. ----
// The clock shows time relative to In, so the clip behaves like a shorter video starting at 0.
let tIn = 0, tOut = null; // tOut = null -> end of video
// Stage 1 (trimMode): whole video is playable so you can pick In/Out freely.
// Stage 2: playback is confined to [In, Out]. Nothing is encoded or downloaded.
let trimMode = true;
const lo = () => (trimMode ? 0 : tIn);
const hi = () => ((trimMode ? v.duration : tOut ?? v.duration)) || 0;
const rangeEnd = () => (tOut ?? v.duration) || 0;

function updateTrim() {
  const trimmed = tIn > 0 || tOut !== null;
  $("trimInfo").textContent = trimmed ? `${tIn.toFixed(3)} → ${rangeEnd().toFixed(3)} (${(rangeEnd() - tIn).toFixed(3)} s)` : "";
  $("inBtn").classList.toggle("on", tIn > 0);
  $("outBtn").classList.toggle("on", tOut !== null);
  console.log(`[trim] in=${tIn.toFixed(3)} out=${tOut === null ? "end" : tOut.toFixed(3)}`);
}
function setIn() {
  tIn = v.currentTime;
  if (tOut !== null && tOut <= tIn) tOut = null;
  updateTrim();
}
function setOut() {
  tOut = v.currentTime;
  if (tOut <= tIn) tIn = 0;
  updateTrim();
}
function clearTrim() { tIn = 0; tOut = null; updateTrim(); }

function setMode(trim) {
  trimMode = trim;
  document.body.classList.toggle("trim-mode", trim);
  v.pause();
  if (!trim) v.currentTime = tIn; // start the trimmed clip at its In point
  fit(); updateStatus(); reclaim();
  console.log(`[mode] ${trim ? "trim" : "grid"} range=${tIn.toFixed(3)}..${rangeEnd().toFixed(3)}`);
}
const goGrid = () => { if (v.duration) setMode(false); };
const goTrim = () => setMode(true);
$("goBtn").onclick = goGrid;
$("backBtn").onclick = goTrim;

$("inBtn").onclick = setIn;
$("outBtn").onclick = setOut;
$("clrBtn").onclick = clearTrim;
// Starting playback from the end of the clip restarts it at In
v.onplay = () => { if (v.currentTime >= hi() - 0.05) v.currentTime = lo(); };

function clampToTrim() {
  if (v.seeking || !v.duration) return;
  const t = v.currentTime;
  if (t < lo() - 0.001) v.currentTime = lo();
  else if (!v.paused && t >= hi()) {
    if ($("loop").checked) v.currentTime = lo();
    else { v.pause(); v.currentTime = hi(); }
  } else if (v.paused && t > hi() + 0.05) v.currentTime = hi();
}

// ---- Fine stepping: move by a fixed time step (not frame-exact), always inside the trim range ----
const stepMs = () => Math.max(1, +$("step").value || 40);
function nudge(ms) {
  v.pause();
  v.currentTime = Math.min(hi(), Math.max(lo(), v.currentTime + ms / 1000));
}

// ---- Export trim video: cuts the loaded file between In and Out WITHOUT re-encoding (like a native trimmer): the picture and sound data are copied as they are. ----
// Runs inside this page with grid-trim.js (keep it in the same folder as this file): no server, no internet.
// mp4 / mov / m4v only; the container of the original is kept. The cut starts at the key frame before In and the extra frames are hidden, so playback starts at In.
let exporting = false;
let currentFile = null; // the File that was loaded: this exact file is what gets cut
function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  console.log(`[export] saved ${name} (${(blob.size / 1e6).toFixed(2)} MB)`);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
async function exportVideo() {
  if (exporting || !v.duration) return;
  if (!currentFile) { setStatus("Load the video with the file picker or by dragging it in, so it can be cut."); return; }
  if (!window.GridTrim) { setStatus("grid-trim.js was not found. Put it in the same folder as this page and reload."); console.error("[export] window.GridTrim is missing"); return; }
  exporting = true; $("exportBtn").disabled = true;
  const start = tIn, end = rangeEnd();
  console.log(`[export] cutting ${currentFile.name} ${start.toFixed(3)}..${end.toFixed(3)} without re-encoding`);
  try {
    setStatus("Cutting…");
    const { blob, ext } = await window.GridTrim.trim(currentFile, start, end, (p) => setStatus(`Cutting… ${Math.round(p * 100)}%`));
    download(blob, `${currentFile.name.replace(/\.[^.]+$/, "")}-trimmed.${ext}`);
    setStatus(`Export done: ${start.toFixed(3)} → ${end.toFixed(3)} s, ${(blob.size / 1e6).toFixed(1)} MB, not re-encoded`);
  } catch (err) {
    console.error("[export] cut failed:", err);
    setStatus("Cut failed: " + (err && err.message ? err.message : err));
  } finally {
    exporting = false; $("exportBtn").disabled = false;
  }
}
$("exportBtn").onclick = exportVideo;
