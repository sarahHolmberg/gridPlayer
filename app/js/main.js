// app/js/main.js: Start-up: loading videos, the clock, and what runs once when the app opens. Loaded last.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// Time with millisecond precision (0.124 s), refreshed every screen frame
(function tick() {
  clampToTrim();
  $("time").textContent = Math.max(0, v.currentTime - (trimMode ? 0 : tIn)).toFixed(3) + " s";
  const s = recElapsed();
  $("recTime").textContent = Math.floor(s / 60) + ":" + (s % 60).toFixed(1).padStart(4, "0");
  requestAnimationFrame(tick);
})();

// ---- Loading videos: file picker, drag & drop, or a link ----
function loadFile(f) {
  if (!f || !f.type.startsWith("video/")) return;
  currentFile = f; // kept so the trim export can send this exact file
  v.src = URL.createObjectURL(f);
  tlLoad(f); // the beat timeline reads the sound in the background (timeline.js)
  $("title").textContent = f.name + " - Grid Player";
  console.log(`[file] loaded ${f.name} (${(f.size / 1e6).toFixed(1)} MB)`);
}
$("file").onchange = (e) => loadFile(e.target.files[0]);
addEventListener("dragover", (e) => e.preventDefault());
addEventListener("drop", (e) => { e.preventDefault(); if ($("extGate").hidden && !isBusy()) loadFile(e.dataTransfer.files[0]); }); // no video while the extension check covers the app or a Done is running

// ---- After a Done: the finished video leaves the screen and the app goes back to the start ("Open a video"),
//      so the next link's picture never sits on top of the old video ----
function unloadVideo() {
  v.pause(); v.removeAttribute("src"); v.load();
  currentFile = null; $("file").value = ""; // the same file can be opened again
  document.body.classList.remove("has-video", "send-mode", "pre-trimmed");
  clearTrim(); setMode(true);
  $("goBtn").disabled = true;
  $("title").textContent = "Grid Player";
  updateStatus();
  console.log("[file] video cleared after Done");
}

v.addEventListener("loadedmetadata", () => {
  document.body.classList.add("has-video"); // shows the playback / trim / record cards (grid.css)
  clearTrim(); // new video -> reset trim
  $("goBtn").disabled = false;
  // Already trimmed on the phone (the Next link has trimEnd): it starts at the beginning, ends there, and goes straight to Record.
  // A link without trimEnd (the pretend list, an older website) still gets the trim step.
  const end = Number(links[0]?.trimEnd);
  document.body.classList.toggle("pre-trimmed", end > 0);
  if (end > 0) { tIn = 0; tOut = end < v.duration - 0.01 ? end : null; updateTrim(); setMode(false); }
  else setMode(true); // every new video starts at the trim stage
  fit();
  updateStatus();
  console.log(`[video] ${v.videoWidth}x${v.videoHeight}, ${v.duration.toFixed(3)}s`);
});

["n", "op", "show", "lbl"].forEach((id) => ($(id).oninput = drawGrid));

document.body.classList.add("trim-mode");
setSpeed(1);
drawGrid();
fit();
extCheck();
fetchLinks(); // every time the app opens: show the next link straight away
