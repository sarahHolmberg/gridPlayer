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
const EXT_SELF_RELOAD = "1.5"; // from this version on, the extension can reload itself (background.js)
const extAtLeast = (v, want) => { const a = v.split(".").map(Number), b = want.split(".").map(Number); return a[0] > b[0] || (a[0] === b[0] && (a[1] || 0) >= b[1]); };
/** Asks the extension to reload itself (new files from disk), then reloads the page. false = it cannot (older than 1.5). */
function extReloadAndRestart() {
  const v = extFound();
  if (!v || !extAtLeast(v, EXT_SELF_RELOAD)) return false;
  try { sessionStorage.setItem("extReloadedFrom", v); } catch {}
  window.postMessage({ from: "grid-player", type: "reloadExtension" }, "*");
  setTimeout(() => location.reload(), 1500); // the extension needs a moment to start again
  return true;
}
const extIncognito = () => document.documentElement.dataset.gridIncognito; // "yes" / "no" (grid-check.js), none = no answer yet
// Keeps the app covered and shows one of the fixes: "help" (install), "old" (reload it), "incog" (allow in incognito)
function extBlock(which, head) {
  $("extWait").hidden = true; $("extRetry").hidden = false; $("extUpdate").hidden = false;
  [["help", "extHelp"], ["old", "extOld"], ["incog", "extIncog"], ["upd", "extUpd"]].forEach(([k, id]) => ($(id).hidden = k !== which));
  if (which === "upd") $("extRetry").hidden = $("extUpdate").hidden = $("extSelfReload").hidden = true; // one button: Check for updates
  $("extHead").textContent = head;
  console.warn(`[ext] blocked: ${which}`);
}
function extCheck() {
  const t0 = performance.now();
  (function look() {
    const waited = performance.now() - t0;
    if (!extFound()) {
      if (waited < EXT_WAIT_MS * 2) return setTimeout(look, 100); // a little longer: it may just be reloading itself
      let reloaded = null;
      try { reloaded = sessionStorage.getItem("extReloadedFrom"); } catch {}
      $("extReloadGone").hidden = !reloaded; // it reloaded itself and did not come back: say that, not "install it"
      return extBlock("help", reloaded ? "The extension did not come back" : "Grid Player needs its extension");
    }
    if (extOlder(extFound())) {
      $("extOldV").textContent = "v" + extFound();
      // It reloaded itself and is STILL old: Chrome loads it from another folder than this Grid Player's
      let reloaded = null;
      try { reloaded = sessionStorage.getItem("extReloadedFrom"); sessionStorage.removeItem("extReloadedFrom"); } catch {}
      $("extOtherFolder").hidden = !reloaded;
      $("extSelfReload").hidden = !extAtLeast(extFound(), EXT_SELF_RELOAD);
      return extBlock("old", "Update the extension");
    }
    if (!extIncognito()) {
      if (waited < EXT_WAIT_MS * 2) return setTimeout(look, 100);
      return extBlock("incog", "Allow the extension in incognito");
    }
    if (extIncognito() !== "yes") return extBlock("incog", "Allow the extension in incognito");
    console.log(`[ext] FastDL extension v${extFound()} found, allowed in incognito (${Math.round(waited)} ms)`);
    // Every time the app opens: check for updates first. Only when they click (it uses the internet: their choice)
    updGate = true;
    extBlock("upd", "Check for updates");
    $("extCheckUpd").focus();
  })();
}
// The extension folder (app/extension, next to the page), written the way the folder picker shows it (no leading "/" before C: on Windows)
$("extPath").textContent = decodeURIComponent(location.pathname.replace(/[^/]*$/, "")).replace(/^\/([A-Za-z]:)/, "$1") + "app/extension";
$("extCopy").append(copyBtn("chrome://extensions", "Copy"));
document.querySelectorAll(".extCopy2").forEach((el) => el.append(copyBtn("chrome://extensions", "Copy")));
$("extRetry").onclick = () => location.reload(); // the extension only reaches a page when it loads, so check again = reload
// The start-up update check: the Update window opens over this screen; "Up to date" opens the app (update.js -> updPassed)
let updGate = false;
$("extCheckUpd").onclick = () => updToggle(true);
function updPassed(why) {
  if (!updGate) return;
  updGate = false;
  $("upd").hidden = true; $("extGate").hidden = true;
  console.log(`[ext] update check passed (${why}): the app opens`);
  reclaim();
}
$("extUpdate").onclick = () => updToggle(true); // Update from GitHub works from here too (the window sits above this one)
$("extSelfReload").onclick = () => { if (!extReloadAndRestart()) setStatus("This extension cannot reload itself yet: use the steps above."); };
document.querySelectorAll(".extPath2").forEach((el) => (el.textContent = $("extPath").textContent));
