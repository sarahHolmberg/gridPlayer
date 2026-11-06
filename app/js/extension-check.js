// app/js/extension-check.js: Extension check: covers the app until the FastDL extension says it is installed (app/extension/grid-check.js).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Extension check: nothing starts until the FastDL extension is installed. Runs every time the page opens. ----
// app/extension/grid-check.js runs on this page and leaves its version in <html data-grid-ext="…">. No answer = not installed,
// or "Allow access to file URLs" is off (from here the two look the same).
const EXT_WAIT_MS = 1500; // CHANGE HERE: how long to wait for the extension's answer
const EXT_NEWEST = "1.2"; // CHANGE HERE: the version in app/extension/manifest.json; older = ask to reload it
const extOlder = (v) => { const a = v.split(".").map(Number), b = EXT_NEWEST.split(".").map(Number); return a[0] < b[0] || (a[0] === b[0] && (a[1] || 0) < b[1]); };
const extFound = () => document.documentElement.dataset.gridExt;
function extCheck() {
  const t0 = performance.now();
  (function look() {
    if (extFound()) {
      $("extGate").hidden = true;
      console.log(`[ext] FastDL extension v${extFound()} found after ${Math.round(performance.now() - t0)} ms`);
      if (extOlder(extFound())) setStatus(`The extension is older (v${extFound()}): click its reload arrow ⟳ in chrome://extensions, then reload this page.`);
      return reclaim();
    }
    if (performance.now() - t0 < EXT_WAIT_MS) return setTimeout(look, 100);
    $("extWait").hidden = true; $("extHelp").hidden = false; $("extRetry").hidden = false;
    console.warn("[ext] FastDL extension not found: showing the install steps");
  })();
}
// The extension folder (app/extension, next to the page), written the way the folder picker shows it (no leading "/" before C: on Windows)
$("extPath").textContent = decodeURIComponent(location.pathname.replace(/[^/]*$/, "")).replace(/^\/([A-Za-z]:)/, "$1") + "app/extension";
$("extCopy").append(copyBtn("chrome://extensions", "Copy"));
$("extRetry").onclick = () => location.reload(); // the extension only reaches a page when it loads, so check again = reload
