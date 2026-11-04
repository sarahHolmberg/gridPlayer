// app/js/help.js: Floating cue strip and the Help window with the flow diagram.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Floating cue: the steps for recording one action. Edit CUE to change them. ----
const CUE = ["Action", "Time", "Target cell"];
$("cue").innerHTML = CUE.map((t, i) => `<span><b>${i + 1}</b>${t}</span>`).join("<i>›</i>") + "<i>8 steps 2 then look for next action</i>";
function toggleCue() {
  const on = $("cue").classList.toggle("on");
  $("infoBtn").classList.toggle("on", on);
  console.log(`[cue] ${on ? "shown" : "hidden"}`);
}
$("infoBtn").onclick = toggleCue;

// ---- Help modal with flow diagram. Fill in the links below (null = "link coming"). ----x
const LINKS = {
  fetch: "https://studiomirrors.netlify.app/",
  download: "https://fastdl.app/en5IW#google_vignette",
  send: "https://fileflap.net/",
  del: "https://studiomirrors.netlify.app/",
};
const FLOW = [
  ["Fetch Instagram links", "fetch"],
  ["Download Instagram video", "download"],
  ["Open video and trim", "(do it in this app)"],
  ["Talk and describe action, and record", "(do it in this app)"],
  ["Export recording and trim video", "(do it in this app)"],
  ["Send videos and copy link", "send"],
  ["Delete videos from the link list", "del"],
];
$("flow").innerHTML = FLOW.map(([t, k], i) => {
  const app = k.startsWith("(");
  const sub = app ? `<small>${k}</small>` : LINKS[k] ? `<small><a href="${LINKS[k]}" target="_blank">Open link</a></small>` : `<small>link coming</small>`;
  return (i ? `<div class="arrow">│<br>▼</div>` : "") + `<div class="blk ${app ? "app" : ""}">${i + 1}. ${t}${sub}</div>`;
}).join("");
const helpToggle = (on) => { $("help").hidden = !on; console.log(`[help] ${on ? "open" : "closed"}`); };
$("helpBtn").onclick = () => helpToggle(true);
$("helpClose").onclick = () => helpToggle(false);
$("help").onclick = (e) => { if (e.target === $("help")) helpToggle(false); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("help").hidden) helpToggle(false); });

// ---- Stage info: the small 👁 on the video area opens how-to text + a video for the stage you are on ----
// CHANGE HERE: the texts, and the videos (files in the app/info folder). A stage can have several videos:
// they show as numbered buttons above the player, and the next one starts when one ends.
// Until a file is there the window says "Video coming soon".
const INFO = {
  download: {
    title: "1 · Download the video and open it",
    text: "Copy the Next link, open it, and download the video with the FastDL extension. Then drop the video on this window (or click Open a video).",
    videos: [{ label: "Download and open", src: "app/info/1-download.mp4" }],
  },
  trim: {
    title: "2 · Trim",
    text: "Play to where the dance starts and press I, then where it ends and press O. Check it, then press Enter (Trim & continue).",
    videos: [{ label: "Trim on the beat", src: "app/info/2-trim.mp4" }],
  },
  send: {
    title: "4 · Send to Studio Mirrors",
    text: "Upload the recording and the trimmed video on FileFlap and copy the link. Paste it here and click Send: Studio Mirrors gets an email with the link, the name and the Instagram link. Then it asks if you are done: click Done and type your code.",
    videos: [{ label: "Upload, then Done", src: "app/info/5-upload-done.mp4" }],
  },
  actions: {
    title: "3 · Record the actions",
    text: "Press R to record. Say the action, then click the target cell: the app says the cell and the time into the recording. When you are done, click Export audio. Then upload both files and press Done.",
    videos: [
      { label: "Record the actions", src: "app/info/3-actions.mp4" },
      { label: "Export audio + video", src: "app/info/4-export.mp4" },
      { label: "Upload, then Done", src: "app/info/5-upload-done.mp4" },
    ],
  },
};
let infoList = [], infoAt = 0; // the videos of the open stage, and which one is playing
function infoPlay(i, autoplay) {
  infoAt = i;
  const v = infoList[i];
  $("infoTabs").querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === i));
  $("infoVid").hidden = false; $("infoNoVid").hidden = true;
  $("infoVid").onerror = () => { // the file is not there yet
    $("infoVid").hidden = true; $("infoNoVid").hidden = false;
    $("infoNoVid").textContent = `Video coming soon (${v.src}).`;
  };
  $("infoVid").src = v.src;
  if (autoplay) $("infoVid").play().catch(() => {});
  console.log(`[info] video ${i + 1}/${infoList.length}: ${v.src}`);
}
function infoOpen(key) {
  const it = INFO[key];
  infoList = it.videos;
  $("infoHead").textContent = it.title;
  $("infoText").textContent = it.text;
  $("infoTabs").hidden = infoList.length < 2;
  $("infoTabs").innerHTML = infoList.map((v, i) => `<button type="button">${i + 1}. ${v.label}</button>`).join("");
  $("infoTabs").querySelectorAll("button").forEach((b, i) => (b.onclick = () => infoPlay(i, true)));
  infoPlay(0, false);
  $("info").hidden = false;
  console.log(`[info] ${key}`);
}
$("infoVid").onended = () => { if (infoAt < infoList.length - 1) infoPlay(infoAt + 1, true); }; // play the next part
function infoClose() {
  $("infoVid").pause(); $("infoVid").removeAttribute("src"); $("infoVid").load();
  $("info").hidden = true;
  reclaim();
}
document.querySelectorAll(".eye").forEach((b) => (b.onclick = () => infoOpen(b.dataset.info)));
$("infoClose").onclick = infoClose;
$("info").onclick = (e) => { if (e.target === $("info")) infoClose(); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("info").hidden) infoClose(); });
