// app/js/whatsnew.js: "What's new": after an update (and the reload), a window lists what changed. Shown once per version.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// CHANGE HERE with every update: a new WHATS_NEW_VERSION (any new text, the date is easiest) and the two newest changes.
// Everyone who has not seen this version yet gets the window once.
const WHATS_NEW_VERSION = "2026-11-23";
const WHATS_NEW = [ // CHANGE HERE: only the TWO newest changes (put the new one first, remove the oldest)
  ["Check for updates every time", [
    "The Grid Player opens after ⟳ Check for updates. It goes online only when you click.",
  ]],
  ["Less to click", [
    "After Done, the video is cleared and you start again from Open a video. After Export audio the app goes to Send by itself.",
    "In Send, ▶ Watch it plays exactly what will be sent; tick “I watched it” to send. Grid and Names switches are in the ⋯ menu.",
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
    $("newUpd").focus(); // the big update button: Enter = check for updates
  } else {
    try { localStorage.setItem("whatsNewSeen", WHATS_NEW_VERSION); } catch {}
    reclaim();
  }
  console.log(`[whatsnew] ${on ? "shown" : "closed"} (${WHATS_NEW_VERSION})`);
}
$("newOk").onclick = $("newClose").onclick = () => whatsNew(false);
$("newUpd").onclick = () => { whatsNew(false); updToggle(true); }; // straight to Update from GitHub
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("newDlg").hidden) whatsNew(false); });
// Once the extension check is out of the way (it covers the app until the extension answers)
function whatsNewCheck() {
  let seen = null;
  try { seen = localStorage.getItem("whatsNewSeen"); } catch {}
  if (seen === WHATS_NEW_VERSION) return;
  (function wait() { if ($("extGate").hidden) whatsNew(true); else setTimeout(wait, 300); })();
}
whatsNewCheck();
