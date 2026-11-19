// Runs on the Grid Player page (Grid*.html / grid*.html opened from your disk) and tells it this extension is installed:
// it leaves the version in <html data-grid-ext="1.6">, which the page checks every time it opens.
// Chrome only runs this on file:// pages if "Allow access to file URLs" is ON (chrome://extensions -> this extension -> Details).
document.documentElement.dataset.gridExt = chrome.runtime.getManifest().version;
console.log(`[grid-ext] extension v${document.documentElement.dataset.gridExt} is installed`);
// And whether this extension may open incognito windows (only the background script may ask Chrome): the page waits for
// <html data-grid-incognito="yes|no"> and does not open until it is "yes" (app/js/extension-check.js).
chrome.runtime.sendMessage({ type: "incognitoAllowed" }, (r) => {
  document.documentElement.dataset.gridIncognito = r?.allowed ? "yes" : "no";
  console.log(`[grid-ext] allowed in incognito: ${document.documentElement.dataset.gridIncognito}`);
});

// The Grid Player asks the extension to open a transcription site in an INCOGNITO window (a web page cannot do that
// itself). The page posts { from: "grid-player", type: "openIncognito", id, url }; background.js opens it (only the
// sites it allows) and the answer goes back to the page as { from: "grid-ext", type: "openIncognitoResult", id, ok, reason }.
window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.from !== "grid-player" || e.data.type !== "openIncognito") return;
  chrome.runtime.sendMessage({ type: "openIncognito", url: e.data.url, urls: e.data.urls }, (r) => {
    const answer = r || { ok: false, reason: chrome.runtime.lastError?.message || "no answer" };
    window.postMessage({ from: "grid-ext", type: "openIncognitoResult", id: e.data.id, ...answer }, "*");
  });
});

// After Update from GitHub the page asks the extension to reload itself (background.js), so the new files are used
window.addEventListener("message", (e) => {
  if (e.source !== window || e.data?.from !== "grid-player" || e.data.type !== "reloadExtension") return;
  chrome.runtime.sendMessage({ type: "reloadExtension" }, (r) => {
    window.postMessage({ from: "grid-ext", type: "reloadExtensionResult", ok: !!r?.ok }, "*");
  });
});
