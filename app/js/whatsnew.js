// app/js/whatsnew.js: "What's new": after an update (and the reload), a window lists what changed. Shown once per version.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// CHANGE HERE with every update: a new WHATS_NEW_VERSION (any new text, the date is easiest) and the list of changes.
// Everyone who has not seen this version yet gets the window once.
const WHATS_NEW_VERSION = "2026-11-09";
const WHATS_NEW = [
  ["A and F are said right", [
    "The letter A now sounds like \"ay\" (it said \"eye\"), and F like \"ef\" (it said \"E-F-F\").",
  ]],
  ["+0.85 s button", [
    "A small button right of the clock skips the video forward 0.85 seconds.",
    "Click and hold it to change how far it skips (for example 0.75 or 0.95 seconds).",
  ]],
  ["Send also goes to the render inbox", [
    "📨 Send now does two things at once: the email (as before) and the video link to Studio Mirrors' render inbox.",
    "It asks for your code once (it is filled in after that).",
    "After Send, the \"Are you done?\" window shows what was sent: 📧 Email ✓ and 📥 Render inbox ✓ (or ✗ with the reason).",
  ]],
  ["Before Export audio: three checks", [
    "1. The caption: say \"caption\", then what was hard, what you had to think about, and what you liked about this session.",
    "2. The steps.",
    "3. The name: say \"username\", then click 🔤 Say name until the name has been said out loud.",
  ]],
  ["A quicker voice", [
    "The cell, the time and the spelled name are said 10% faster (same voice, same pitch).",
  ]],
  ["Back on the new website", [
    "The Grid Player gets its links from studio-mirrors.netlify.app again.",
  ]],
  ["Your deadline", [
    "If you have a deadline, it shows every time you finish a video, right under \"Video deleted\".",
  ]],
  ["🔤 Say name", [
    "New button in the Record box (or press M): the app says \"name bubble\" and then spells the Next link's name letter by letter.",
    "Like the cell and the time, it goes straight into the recording, and you hear it in your headphones.",
  ]],
  ["The picture is on the video", [
    "The picture of the current link now shows small at the bottom left of the video.",
    "Click it to see it big. It changes with the Next link.",
  ]],
  ["Earlier in this update", [
    "⬇ Export audio opens FileFlap (not the transcription website), with a short \"drag the files here\" reminder there.",
    "That reminder needs the newest extension: chrome://extensions, then the reload arrow ⟳ on \"Grid FastDL auto-download\".",
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
