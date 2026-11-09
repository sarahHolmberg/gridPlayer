// app/js/videocheck.js: after Export trim video, the person must go and check the file (it ends in .mp4 and it plays) before
// Export audio. The first time the window opens the box is locked ("go and check it now"); only when it is opened again
// (the Export trim video button becomes "☐ I checked the video") can it be ticked. Export audio waits for that tick.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// none = not exported yet · told = exported, sent to check it (box locked the first time) · confirmed = ticked
let vidState = "none", vidFirstLook = false, vidNameNow = "";
const EXPORT_LABEL = $("exportBtn").textContent;

function vidButton() {
  $("exportBtn").textContent = vidState === "told" ? "☐ I checked the video ▸" : vidState === "confirmed" ? "✔ Video checked" : EXPORT_LABEL;
  $("exportBtn").classList.toggle("on", vidState === "told");
}
// Called by trim.js when the trimmed video has been downloaded
function videoExported(name, ext) {
  vidState = "told"; vidNameNow = name; vidButton();
  vidOpen(true); // the first look: the box is locked
}
function vidOpen(first) {
  vidFirstLook = first;
  $("vidName").textContent = vidNameNow || "the trimmed video (…-trimmed.mp4)";
  const ext = (vidNameNow.match(/\.([^.]+)$/) || [])[1] || "mp4";
  $("vidExtWarn").hidden = ext.toLowerCase() === "mp4";
  $("vidExtWarn").textContent = `This one is .${ext}: check that it plays, and tell Studio Mirrors it is not .mp4.`;
  $("vidOk").checked = vidState === "confirmed";
  $("vidOk").disabled = first; // the first time: go and check it first
  $("vidTick").classList.toggle("locked", first);
  $("vidGo").hidden = !first;
  $("vidNext").disabled = !$("vidOk").checked;
  $("vidDlg").hidden = false;
  console.log(`[videocheck] window open (${first ? "first look, box locked" : "box can be ticked"})`);
}
function vidClose() { $("vidDlg").hidden = true; reclaim(); }

$("vidOk").onchange = () => {
  vidState = $("vidOk").checked ? "confirmed" : "told";
  $("vidNext").disabled = !$("vidOk").checked;
  vidButton();
};
$("vidNext").onclick = () => { vidClose(); if (mr) expAsk(true); else setStatus("Record first: there is no recording to export yet."); };
$("vidAgain").onclick = () => { vidClose(); vidState = "none"; vidButton(); exportVideo(); };
$("vidClose").onclick = vidClose;
$("vidDlg").onclick = (e) => { if (e.target === $("vidDlg")) vidClose(); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("vidDlg").hidden) vidClose(); });

// Export trim video: exports, or (once exported) reopens the check with the box free to tick
$("exportBtn").onclick = () => (vidState === "none" ? exportVideo() : vidOpen(false));
// Export audio: only after the video check
$("audioBtn").onclick = () => {
  if (!mr) return;
  if (vidState === "confirmed") return expAsk(true);
  if (vidState === "none") { setStatus("First click ⬇ Export trim video, then check the file."); $("exportBtn").focus(); return; }
  vidOpen(false); // exported but not ticked yet
};
// Every new video starts again
v.addEventListener("loadedmetadata", () => { vidState = "none"; vidNameNow = ""; vidButton(); });
