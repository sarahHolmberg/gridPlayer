// app/js/core.js: Shared helpers: $, the video, fit, status bar, grid, speed buttons, the internet light (netFetch) and copy buttons.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

const $ = (id) => document.getElementById(id);
const v = $("v");

// Cell name = column letter + row number, top-left origin: A1 (top-left) ... O15 (bottom-right)
const cellName = (col, row) => String.fromCharCode(65 + col) + (row + 1);

// ---- Make the video as big as possible: fit its aspect ratio into the stage ----
function fit() {
  const r = $("stage").getBoundingClientRect();
  const ar = v.videoWidth ? v.videoWidth / v.videoHeight : 16 / 9;
  let w = r.width, h = w / ar;
  if (h > r.height) { h = r.height; w = h * ar; }
  $("wrap").style.width = Math.floor(w) + "px";
  $("wrap").style.height = Math.floor(h) + "px";
}
new ResizeObserver(fit).observe($("stage"));

function setStatus(msg) { $("stText").textContent = msg; }
function updateStatus() {
  const n = +$("n").value;
  setStatus(
    (v.videoWidth ? `${v.videoWidth}×${v.videoHeight} · ${v.duration.toFixed(3)} s` : "No video loaded") +
    ` · Grid ${n}×${n} (A1–${cellName(n - 1, n - 1)})`
  );
}

function drawGrid() {
  const n = +$("n").value, g = $("grid"), c = `rgba(255,255,255,${$("op").value})`;
  g.style.display = $("show").checked ? "grid" : "none";
  g.style.setProperty("--n", n);
  g.style.gridTemplate = `repeat(${n}, 1fr) / repeat(${n}, 1fr)`;
  g.innerHTML = "";
  for (let row = 0; row < n; row++)
    for (let col = 0; col < n; col++) {
      const d = document.createElement("div");
      d.className = "cell";
      d.style.borderColor = c;
      if ($("lbl").checked) d.innerHTML = `<span>${cellName(col, row)}</span>`;
      g.appendChild(d);
    }
  updateStatus();
  console.log(`[grid] ${n}x${n} names=${$("lbl").checked} -> ${cellName(0, 0)}..${cellName(n - 1, n - 1)}`);
}

// Speed buttons. A steps down (3 -> 1 -> 0.75 -> 0.5 -> 0.3), D steps back up.
const SPEEDS = [0.3, 0.5, 0.75, 1, 3];
const stepSpeed = (d) => setSpeed(SPEEDS[Math.min(SPEEDS.length - 1, Math.max(0, SPEEDS.indexOf(v.playbackRate) + d))]);
SPEEDS.forEach((s) => {
  const b = document.createElement("button");
  b.textContent = s + "x";
  b.onclick = () => setSpeed(s);
  b.dataset.s = s;
  $("speeds").appendChild(b);
});
function setSpeed(s) {
  v.defaultPlaybackRate = v.playbackRate = s; // default survives loading a new file
  document.querySelectorAll("#speeds button").forEach((b) => b.classList.toggle("on", +b.dataset.s === s));
  console.log(`[speed] ${s}x`);
}

// ---- Internet light: every request this app makes goes through netFetch(), which turns the light green
//      while it runs (and for at least 1 s after, so a quick request is still visible). Idle = red. ----
let netBusy = 0, netTimer = null;
function netFetch(url, opts) {
  netBusy++;
  clearTimeout(netTimer);
  $("net").classList.add("on");
  console.log(`[net] request started (${netBusy} running): ${url}`);
  return fetch(url, opts).finally(() => {
    netBusy--;
    console.log(`[net] request finished (${netBusy} running)`);
    if (!netBusy) netTimer = setTimeout(() => $("net").classList.remove("on"), 1000);
  });
}

/** Small round-trip button: copies text, shows ✓ (or ✗ if the browser refuses). */
function copyBtn(text, label) {
  const b = document.createElement("button");
  const idle = "📋 " + label; // e.g. "📋 Copy name": the button says what it copies
  b.textContent = idle; b.title = label;
  b.onclick = async () => {
    try { await navigator.clipboard.writeText(text); b.textContent = "✓ Copied"; console.log(`[links] ${label}: ${text}`); }
    catch (err) { console.error("[links] copy failed:", err); b.textContent = "✗ Failed"; }
    setTimeout(() => (b.textContent = idle), 1500);
  };
  return b;
}
const line = (...kids) => { const d = document.createElement("div"); d.className = "ln"; d.append(...kids); return d; };
