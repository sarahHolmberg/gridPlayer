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
