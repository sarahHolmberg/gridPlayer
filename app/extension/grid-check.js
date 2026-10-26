// Runs on the Grid Player page (Grid*.html / grid*.html opened from your disk) and tells it this extension is installed:
// it leaves the version in <html data-grid-ext="1.1">, which the page checks every time it opens.
// Chrome only runs this on file:// pages if "Allow access to file URLs" is ON (chrome://extensions -> this extension -> Details).
document.documentElement.dataset.gridExt = chrome.runtime.getManifest().version;
console.log(`[grid-ext] extension v${document.documentElement.dataset.gridExt} is installed`);
