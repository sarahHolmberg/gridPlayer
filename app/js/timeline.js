// app/js/timeline.js: Beat timeline under the video (grid view only), like a DJ app: the sound scrolls past a fixed middle line,
// with a beat grid drawn over it (set the BPM and where beat 1 is). With Snap on, clicking, dragging and ←/→ land on beats.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

const TL = {
  BIN: 0.005,        // seconds of sound per waveform column
  pps: 160,          // CHANGE HERE: zoom, pixels per second (+ / − buttons change it)
  peaks: null,       // loudest point of each BIN, 0..1 (null = not decoded yet)
  rms: null,         // average loudness of each BIN, 0..1 (the darker inner part of the waveform)
  bpm: 120, beat1: 0, // the beat grid: beats per minute, and the video time of beat 1
  taps: [],          // tap tempo
  key: "",           // remembers the grid per video (localStorage)
};
const beatLen = () => 60 / TL.bpm;
const snapOn = () => !trimMode && $("snap").checked;
// The beat number (0 = beat 1) closest to time t, and its time
const beatIndex = (t) => Math.round((t - TL.beat1) / beatLen());
const beatTime = (k) => TL.beat1 + k * beatLen();
const snapTime = (t) => (snapOn() ? beatTime(beatIndex(t)) : t);

// ---- Sound -> waveform: the video file's sound is decoded once, in the background, when the video is opened ----
async function tlLoad(file) {
  TL.peaks = TL.rms = null;
  TL.key = `beatgrid:${file.name}:${file.size}`;
  try { Object.assign(TL, JSON.parse(localStorage.getItem(TL.key)) || {}); } catch {} // the grid you set last time for this video
  $("bpm").value = TL.bpm;
  $("tlMsg").textContent = "Reading the sound…";
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audio = await ctx.decodeAudioData(await file.arrayBuffer());
    ctx.close();
    const per = Math.max(1, Math.round(audio.sampleRate * TL.BIN)), n = Math.ceil(audio.length / per);
    const peaks = new Float32Array(n), rms = new Float32Array(n);
    const chans = [...Array(audio.numberOfChannels)].map((_, c) => audio.getChannelData(c));
    for (let i = 0; i < n; i++) {
      let pk = 0, sq = 0;
      for (let j = i * per, end = Math.min(audio.length, j + per); j < end; j++) {
        let s = 0;
        for (const ch of chans) s += ch[j];
        s /= chans.length;
        const a = Math.abs(s);
        if (a > pk) pk = a;
        sq += s * s;
      }
      peaks[i] = pk; rms[i] = Math.sqrt(sq / per);
    }
    const top = Math.max(...peaks) || 1; // loudest moment fills the height
    for (let i = 0; i < n; i++) { peaks[i] /= top; rms[i] /= top; }
    TL.peaks = peaks; TL.rms = rms;
    $("tlMsg").textContent = "";
    console.log(`[timeline] sound read: ${audio.duration.toFixed(2)} s, ${n} columns`);
  } catch (err) {
    console.warn("[timeline] could not read the sound:", err);
    $("tlMsg").textContent = "This video has no sound the browser can read: the beat grid still works.";
  }
}
function tlSave() {
  try { localStorage.setItem(TL.key, JSON.stringify({ bpm: TL.bpm, beat1: TL.beat1 })); } catch {}
}

// ---- Drawing: the middle line is "now"; the sound and the beat lines scroll past it ----
const tlCanvas = $("tlCanvas"), tlCtx = tlCanvas.getContext("2d");
function tlDraw() {
  const dpr = devicePixelRatio || 1, W = tlCanvas.clientWidth, H = tlCanvas.clientHeight;
  if (!W || !H) return;
  if (tlCanvas.width !== Math.round(W * dpr) || tlCanvas.height !== Math.round(H * dpr)) {
    tlCanvas.width = Math.round(W * dpr); tlCanvas.height = Math.round(H * dpr);
  }
  const g = tlCtx, now = v.currentTime || 0, mid = W / 2, toX = (t) => mid + (t - now) * TL.pps;
  const t0 = now - mid / TL.pps, t1 = now + mid / TL.pps, cy = H / 2 + 6, amp = H / 2 - 14;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);

  // outside the trimmed part: darker
  g.fillStyle = "#0b0b0a"; g.fillRect(0, 0, W, H);
  const a = Math.max(0, toX(lo())), b = Math.min(W, toX(hi() || v.duration || 0));
  if (b > a) { g.fillStyle = "#171716"; g.fillRect(a, 0, b - a, H); }

  // waveform: one column per pixel, peak (light) and average loudness (strong)
  if (TL.peaks) {
    for (let x = 0; x < W; x++) {
      const t = t0 + x / TL.pps, i = Math.floor(t / TL.BIN), j = Math.max(i + 1, Math.floor((t + 1 / TL.pps) / TL.BIN));
      if (i < 0 || i >= TL.peaks.length) continue;
      let pk = 0, rm = 0;
      for (let k = i; k < j && k < TL.peaks.length; k++) { if (TL.peaks[k] > pk) pk = TL.peaks[k]; if (TL.rms[k] > rm) rm = TL.rms[k]; }
      const past = t < now;
      g.fillStyle = past ? "#2d5fa8" : "#4f8cf0"; g.fillRect(x, cy - pk * amp, 1, pk * amp * 2);
      g.fillStyle = past ? "#6f8fbf" : "#bcd3ff"; g.fillRect(x, cy - rm * amp, 1, rm * amp * 2);
    }
  }

  // beat grid: thin line per beat, strong line + bar number every 4 beats, red marker on beat 1
  g.font = "600 10px ui-monospace, Menlo, Consolas, monospace"; g.textBaseline = "top";
  for (let k = Math.ceil((t0 - TL.beat1) / beatLen()); beatTime(k) <= t1; k++) {
    const x = Math.round(toX(beatTime(k))) + 0.5, bar = ((k % 4) + 4) % 4 === 0;
    g.fillStyle = k === 0 ? "#ff5a5f" : bar ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.22)";
    g.fillRect(x - (bar ? 0.5 : 0), bar ? 0 : 14, bar ? 2 : 1, bar ? H : H - 14);
    if (bar) { g.fillStyle = k === 0 ? "#ff5a5f" : "#e8e8e3"; g.fillText(String(Math.floor(k / 4) + 1), x + 4, 2); }
  }

  // the middle line = now
  g.fillStyle = "#fcb83c"; g.fillRect(mid - 1, 0, 2, H);
  g.beginPath(); g.moveTo(mid - 6, 0); g.lineTo(mid + 6, 0); g.lineTo(mid, 7); g.fill();

  // where we are, musically
  const k = Math.floor((now - TL.beat1) / beatLen() + 1e-6);
  $("tlPos").textContent = now < TL.beat1 - 1e-3 ? "before beat 1" : `Bar ${Math.floor(k / 4) + 1} · Beat ${((k % 4) + 4) % 4 + 1}`;
}
(function tlLoop() { if (!trimMode && document.body.classList.contains("has-video")) tlDraw(); requestAnimationFrame(tlLoop); })();

// ---- Moving around: drag the waveform to scrub, click to jump (both snap to the nearest beat when Snap is on) ----
let tlDrag = null;
tlCanvas.addEventListener("pointerdown", (e) => {
  tlCanvas.setPointerCapture(e.pointerId);
  tlDrag = { x: e.clientX, t: v.currentTime, moved: false, playing: !v.paused };
  v.pause();
});
tlCanvas.addEventListener("pointermove", (e) => {
  if (!tlDrag) return;
  const dx = e.clientX - tlDrag.x;
  if (Math.abs(dx) > 3) tlDrag.moved = true;
  if (tlDrag.moved) v.currentTime = Math.min(hi(), Math.max(lo(), tlDrag.t - dx / TL.pps));
});
tlCanvas.addEventListener("pointerup", (e) => {
  if (!tlDrag) return;
  const r = tlCanvas.getBoundingClientRect();
  const t = tlDrag.moved ? v.currentTime : v.currentTime + (e.clientX - r.left - r.width / 2) / TL.pps; // a click: jump to that spot
  v.currentTime = Math.min(hi(), Math.max(lo(), snapTime(t)));
  if (tlDrag.playing) v.play().catch(() => {});
  tlDrag = null;
});
tlCanvas.addEventListener("wheel", (e) => { e.preventDefault(); tlZoom(e.deltaY < 0 ? 1.25 : 0.8); }, { passive: false });

// With Snap on, ←/→ jump one beat (Shift = one bar) instead of the fine step (keys.js)
function beatStep(dir, bar) {
  v.pause();
  const k = beatIndex(v.currentTime), onBeat = Math.abs(beatTime(k) - v.currentTime) < 0.01;
  const target = onBeat ? k + dir * (bar ? 4 : 1) : dir > 0 ? Math.ceil((v.currentTime - TL.beat1) / beatLen()) : Math.floor((v.currentTime - TL.beat1) / beatLen());
  v.currentTime = Math.min(hi(), Math.max(lo(), beatTime(target)));
}

// ---- Setting the beat grid ----
function setBpm(b) {
  TL.bpm = Math.min(240, Math.max(40, Math.round(b * 10) / 10));
  $("bpm").value = TL.bpm; tlSave();
  console.log(`[timeline] BPM ${TL.bpm}`);
}
// The beat under the middle line becomes beat 1: play, and press K (or the button) on a beat you hear as "one".
// Like DJ apps it lands on the actual hit: the sharpest rise in the sound within ±80 ms (your timing is never that exact).
const HIT_WINDOW = 0.08; // CHANGE HERE: how far (seconds) K may move beat 1 to reach the hit; 0 = exactly where you pressed
function hitNear(t) {
  if (!TL.peaks || !HIT_WINDOW) return t;
  const a = Math.max(2, Math.floor((t - HIT_WINDOW) / TL.BIN)), b = Math.min(TL.peaks.length - 1, Math.ceil((t + HIT_WINDOW) / TL.BIN));
  let best = -1, rise = 0.05; // ignore rises smaller than 5 % of the loudest sound: no hit nearby = keep your time
  for (let i = a; i <= b; i++) { const d = TL.peaks[i] - TL.peaks[i - 2]; if (d > rise) { rise = d; best = i - 1; } }
  return best < 0 ? t : best * TL.BIN;
}
function setBeat1() {
  TL.beat1 = hitNear(v.currentTime); tlSave();
  console.log(`[timeline] beat 1 at ${TL.beat1.toFixed(3)} s (pressed at ${v.currentTime.toFixed(3)} s)`);
}
// Tap along with the music (B): after 4 taps the BPM follows your taps
function tapTempo() {
  const t = performance.now() / 1000;
  if (TL.taps.length && t - TL.taps[TL.taps.length - 1] > 2) TL.taps = []; // a pause = start again
  TL.taps = [...TL.taps, t].slice(-8);
  $("tapBtn").textContent = `Tap ${TL.taps.length < 4 ? "·".repeat(TL.taps.length) : "✓"}`;
  if (TL.taps.length >= 4) setBpm((60 * (TL.taps.length - 1)) / (t - TL.taps[0]));
}
function tlZoom(f) { TL.pps = Math.min(1200, Math.max(30, TL.pps * f)); }
const nudgeGrid = (s) => { TL.beat1 += s; tlSave(); };

$("bpm").onchange = () => setBpm(+$("bpm").value || 120);
$("tapBtn").onclick = tapTempo;
$("beat1Btn").onclick = setBeat1;
$("gridEarlier").onclick = () => nudgeGrid(-0.01);
$("gridLater").onclick = () => nudgeGrid(0.01);
$("zoomIn").onclick = () => tlZoom(1.25);
$("zoomOut").onclick = () => tlZoom(0.8);
