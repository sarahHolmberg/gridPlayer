// Runs on every fastdl.app page (the pages the grid player opens as f-d.app/<instagram link>).
// Waits for the result card, clicks the download button, then tells background.js to close this tab
// once the file is saved. Open the tab's DevTools console and filter on [fastdl] to follow it.

const CARD   = "#app section.search-result li";
const BUTTON = "#app > section.search-result.search-result--reserved > div > div > ul > li > div.media-content__info > a";
// CHANGE HERE: "this result is a video". The old img selector had a size part (more_0-75) that may change per video.
const VIDEO  = CARD + " .tags__item--video, " + CARD + " div.media-content img";

const SETTLE_MS  = 500;    // CHANGE HERE: pause after both are ready, before the click
const GIVE_UP_MS = 45000;  // CHANGE HERE: stop waiting for the page after this long
const POLL_MS    = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// CHANGE HERE: what "active" means for the button. Guess: not disabled, and its href is a real link.
const buttonReady = (a) => {
  if (!a) return false;
  if (a.matches('[disabled], [aria-disabled="true"], .disabled, .is-disabled')) return false;
  const href = a.getAttribute("href");
  return !!href && href !== "#" && !href.startsWith("javascript:");
};

// The video thumbnail only has to EXIST (a lazy image in a background tab may never finish loading).
const videoReady = (img) => !!img;

function report() {
  const a = document.querySelector(BUTTON);
  console.log("[fastdl] status:", {
    video: !!document.querySelector(VIDEO),
    button: !!a,
    href: a?.getAttribute("href") ?? null,
    buttonClass: a?.className ?? null,
    buttonSize: a ? `${Math.round(a.getBoundingClientRect().width)}x${Math.round(a.getBoundingClientRect().height)}` : null,
    cards: document.querySelectorAll(CARD).length,
  });
}

async function waitFor(test, timeoutMs) {
  const t0 = performance.now();
  let lastReport = t0;
  while (performance.now() - t0 < timeoutMs) {
    if (test()) return true;
    if (performance.now() - lastReport > 3000) { report(); lastReport = performance.now(); }
    await sleep(POLL_MS);
  }
  report();
  return false;
}

// ---- Wait overlay: covers the whole page, swallows every click/tap/scroll, shows what is going on. ----
// Shadow DOM, so the site's CSS cannot touch it. The script's own button.click() still works underneath.
const AFTER_CLICK_MS = 30000; // CHANGE HERE: if the tab is still open this long after the click, give the page back

function showOverlay(text) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `
    <style>
      .ov { position:fixed; inset:0; background:rgba(15,15,20,.88); color:#fff; display:flex; flex-direction:column;
            align-items:center; justify-content:center; gap:18px; font:600 22px system-ui,sans-serif; text-align:center;
            cursor:wait; user-select:none; touch-action:none; }
      .sp { width:56px; height:56px; border:6px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%;
            animation:r 1s linear infinite; }
      small { font:400 15px system-ui,sans-serif; opacity:.8; }
      @keyframes r { to { transform:rotate(360deg); } }
    </style>
    <div class="ov"><div class="sp"></div><div id="t"></div><small>Please wait and don't click anything. This tab closes by itself. if it doesnt go as planned, just download the video yourself normally</small></div>`;
  const t = root.getElementById("t");
  t.textContent = text;
  // swallow everything that could reach the page underneath
  for (const type of ["click", "mousedown", "mouseup", "pointerdown", "pointerup", "touchstart", "touchend", "wheel", "contextmenu", "dblclick"])
    host.addEventListener(type, (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
  document.documentElement.append(host);
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden"; // no scrolling the page behind it
  return {
    set: (msg) => (t.textContent = msg),
    remove: () => { host.remove(); document.documentElement.style.overflow = prevOverflow; },
  };
}

(async () => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  if (!enabled) return console.log("[fastdl] extension is OFF, doing nothing");

  const overlay = showOverlay("Getting your video ready…");
  const t0 = performance.now();
  console.log("[fastdl] waiting for the video + the download button...");
  const ok = await waitFor(
    () => videoReady(document.querySelector(VIDEO)) && buttonReady(document.querySelector(BUTTON)),
    GIVE_UP_MS
  );
  if (!ok) { overlay.remove(); return console.warn(`[fastdl] gave up after ${GIVE_UP_MS / 1000}s: button/video never became ready`); }
  console.log(`[fastdl] ready after ${((performance.now() - t0) / 1000).toFixed(2)}s, settling ${SETTLE_MS}ms`);

  await sleep(SETTLE_MS);
  const btn = document.querySelector(BUTTON); // look it up again: the page may have re-rendered meanwhile
  if (!buttonReady(btn)) { overlay.remove(); return console.warn("[fastdl] button changed during the pause, not clicking"); }

  // Tell the background first, so it is already listening for the download when the click happens.
  await chrome.runtime.sendMessage({ type: "arm", url: btn.href });
  console.log(`[fastdl] clicking -> ${btn.href}`);
  overlay.set("Downloading…");
  btn.click();
  // The tab normally closes itself (background.js). If it is still here later, something went wrong: give the page back.
  setTimeout(() => { overlay.remove(); console.warn("[fastdl] tab not closed after the click, overlay removed"); }, AFTER_CLICK_MS);
})();
