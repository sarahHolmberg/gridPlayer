// app/js/whatsnew.js: "What's new": after an update (and the reload), a window lists what changed. Shown once per version.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// CHANGE HERE with every update: a new WHATS_NEW_VERSION (any new text, the date is easiest) and the list of changes.
// Everyone who has not seen this version yet gets the window once.
const WHATS_NEW_VERSION = "2026-11-06";
const WHATS_NEW = [
  ["Export audio now opens FileFlap", [
    "⬇ Export audio still downloads the recording, but no longer opens the transcription website (TurboScribe).",
    "It opens FileFlap instead, so you can upload the recording straight away.",
  ]],
  ["A reminder on FileFlap", [
    "When FileFlap opens from the Grid Player, a small window says: drag the recording and the trimmed video here.",
    "It also reminds you to click ⬇ Export trim video first if you have not yet.",
    "It closes by itself after 3 seconds, or click ✕.",
    "This needs the newest extension: open chrome://extensions and click the reload arrow ⟳ on \"Grid FastDL auto-download\".",
  ]],
  ["Also new since the last updates", [
    "The app now talks to the new website (studio-mirrors.netlify.app).",
    "Sending to Studio Mirrors is more reliable.",
    "This window: after every update it tells you what changed.",
  ]],
];

function whatsNew(on) {
  $("newDlg").hidden = !on;
  if (on) {
    $("newBody").innerHTML = "";
    WHATS_NEW.forEach(([head, lines]) => {
      const h = document.createElement("h4"); h.textContent = head;
      const ul = document.createElement("ul");
      lines.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
      $("newBody").append(h, ul);
    });
    $("newOk").focus();
  } else {
    try { localStorage.setItem("whatsNewSeen", WHATS_NEW_VERSION); } catch {}
    reclaim();
  }
  console.log(`[whatsnew] ${on ? "shown" : "closed"} (${WHATS_NEW_VERSION})`);
}
$("newOk").onclick = $("newClose").onclick = () => whatsNew(false);
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("newDlg").hidden) whatsNew(false); });
// Once the extension check is out of the way (it covers the app until the extension answers)
function whatsNewCheck() {
  let seen = null;
  try { seen = localStorage.getItem("whatsNewSeen"); } catch {}
  if (seen === WHATS_NEW_VERSION) return;
  (function wait() { if ($("extGate").hidden) whatsNew(true); else setTimeout(wait, 300); })();
}
whatsNewCheck();
