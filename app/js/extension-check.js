// app/js/extension-check.js: Extension check: covers the app until the FastDL extension says it is installed (app/extension/grid-check.js).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Extension check: nothing starts until the FastDL extension is installed, up to date, and allowed in incognito.
//      Runs every time the page opens. ----
// app/extension/grid-check.js runs on this page and leaves its version in <html data-grid-ext="…">. No answer = not installed,
// or "Allow access to file URLs" is off (from here the two look the same).
const EXT_WAIT_MS = 1500; // CHANGE HERE: how long to wait for the extension's answer
const EXT_NEWEST = "1.3"; // CHANGE HERE: the version in app/extension/manifest.json; older = ask to reload it
const extOlder = (v) => { const a = v.split(".").map(Number), b = EXT_NEWEST.split(".").map(Number); return a[0] < b[0] || (a[0] === b[0] && (a[1] || 0) < b[1]); };
const extFound = () => document.documentElement.dataset.gridExt;
const extIncognito = () => document.documentElement.dataset.gridIncognito; // "yes" / "no" (grid-check.js), none = no answer yet
// Keeps the app covered and shows one of the fixes: "help" (install), "old" (reload it), "incog" (allow in incognito)
function extBlock(which, head) {
  $("extWait").hidden = true; $("extRetry").hidden = false;
  [["help", "extHelp"], ["old", "extOld"], ["incog", "extIncog"]].forEach(([k, id]) => ($(id).hidden = k !== which));
  $("extHead").textContent = head;
  console.warn(`[ext] blocked: ${which}`);
}
function extCheck() {
  const t0 = performance.now();
  (function look() {
    const waited = performance.now() - t0;
    if (!extFound()) {
      if (waited < EXT_WAIT_MS) return setTimeout(look, 100);
      return extBlock("help", "Grid Player needs its extension");
    }
    if (extOlder(extFound())) { $("extOldV").textContent = "v" + extFound(); return extBlock("old", "Update the extension"); }
    if (!extIncognito()) {
      if (waited < EXT_WAIT_MS * 2) return setTimeout(look, 100);
      return extBlock("incog", "Allow the extension in incognito");
    }
    if (extIncognito() !== "yes") return extBlock("incog", "Allow the extension in incognito");
    $("extGate").hidden = true;
    console.log(`[ext] FastDL extension v${extFound()} found, allowed in incognito (${Math.round(waited)} ms)`);
    return reclaim();
  })();
}
// The extension folder (app/extension, next to the page), written the way the folder picker shows it (no leading "/" before C: on Windows)
$("extPath").textContent = decodeURIComponent(location.pathname.replace(/[^/]*$/, "")).replace(/^\/([A-Za-z]:)/, "$1") + "app/extension";
$("extCopy").append(copyBtn("chrome://extensions", "Copy"));
document.querySelectorAll(".extCopy2").forEach((el) => el.append(copyBtn("chrome://extensions", "Copy")));
$("extRetry").onclick = () => location.reload(); // the extension only reaches a page when it loads, so check again = reload
