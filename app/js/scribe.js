// app/js/scribe.js: after Export audio, "Which website did you use LAST to transcribe?" The other one opens in an INCOGNITO
// window. A web page cannot open incognito itself, so it asks the extension (app/extension/grid-check.js -> background.js).
// If the extension may not open incognito ("Allow in Incognito" off), the window says how to switch it on and offers
// to open the site normally. Then FileFlap opens, as before.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// CHANGE HERE: the transcription sites (the extension's background.js must allow the same addresses)
const SCRIBE_SITES = [
  { name: "TurboScribe", url: "https://turboscribe.ai/" },
  { name: "UniScribe", url: "https://www.uniscribe.co/" },
];
let scribeThen = null, scribeAsked = 0;

function scribeAsk(then) {
  scribeThen = then;
  let last = "";
  try { last = localStorage.getItem("scribeOpened") || ""; } catch {}
  $("scribeChoices").innerHTML = "";
  SCRIBE_SITES.forEach((s) => {
    const b = document.createElement("button");
    b.className = "primary"; b.textContent = s.name;
    b.title = `I used ${s.name} last: open the other one`;
    b.onclick = () => scribeChoose(s);
    $("scribeChoices").append(b);
  });
  const lastSite = SCRIBE_SITES.find((s) => s.url === last);
  $("scribeHint").textContent = lastSite ? `Last time the app opened ${lastSite.name} for you.` : "";
  $("scribeMsg").textContent = ""; $("scribeMsg").className = "";
  $("scribeDlg").hidden = false;
  console.log("[scribe] asking which site was used last");
}

// The person used `used` last: open the other one in incognito (through the extension)
function scribeChoose(used) {
  const other = SCRIBE_SITES.find((s) => s !== used);
  try { localStorage.setItem("scribeOpened", other.url); } catch {}
  const id = ++scribeAsked;
  $("scribeMsg").textContent = `Opening ${other.name} in incognito…`; $("scribeMsg").className = "";
  const timer = setTimeout(() => answer({ ok: false, reason: "no-extension" }), 2000); // no answer: an old or missing extension
  function answer(r) {
    removeEventListener("message", onMessage); clearTimeout(timer);
    if (r.ok) { console.log(`[scribe] ${other.name} opened in incognito`); return scribeDone(); }
    console.warn("[scribe] incognito failed:", r.reason);
    // Could not open incognito: say why, and offer the site normally (a click, so the browser allows the new tab)
    $("scribeMsg").className = "bad";
    $("scribeMsg").textContent = r.reason === "incognito-off"
      ? "The extension may not open incognito windows yet. Switch it on once: chrome://extensions → Grid FastDL auto-download → Details → Allow in Incognito."
      : "The extension did not answer (reload it in chrome://extensions, then reload this page).";
    const open = document.createElement("button");
    open.textContent = `Open ${other.name} normally`;
    open.onclick = () => { window.open(other.url, "_blank"); scribeDone(); };
    $("scribeMsg").append(document.createElement("br"), open);
  }
  function onMessage(e) {
    if (e.source === window && e.data?.from === "grid-ext" && e.data.type === "openIncognitoResult" && e.data.id === id) answer(e.data);
  }
  addEventListener("message", onMessage);
  window.postMessage({ from: "grid-player", type: "openIncognito", id, url: other.url }, "*");
}

function scribeDone() {
  $("scribeDlg").hidden = true;
  reclaim();
  const then = scribeThen; scribeThen = null;
  then?.(); // FileFlap
}
$("scribeSkip").onclick = $("scribeClose").onclick = scribeDone;
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("scribeDlg").hidden) scribeDone(); });
