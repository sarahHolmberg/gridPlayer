// app/js/announce.js: Click a grid cell -> the app says "target cell G4, time 2.146" INTO the recording.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).
// The words are the clips in voice-clips.js, played on the mixer from recording.js, so they land in the same file as your voice.
// You also hear them in your headphones, recording or not (handy to check it works).

const ANNOUNCE_GAIN = 1.0; // CHANGE HERE: loudness of the announcement next to your voice (0.5 = half, 2 = double)

// clips -> announceGain ─┬─> mixer (into the recording)
//                        └─> your headphones
const announceGain = actx.createGain();
announceGain.gain.value = ANNOUNCE_GAIN;
announceGain.connect(mixer);
announceGain.connect(actx.destination);

// Decode all 44 clips once at start-up, so a click plays at once
const clipBufs = new Map();
Promise.all(Object.entries(VOICE_CLIPS).map(async ([name, url]) => {
  const bytes = Uint8Array.from(atob(url.slice(url.indexOf(",") + 1)), (c) => c.charCodeAt(0));
  clipBufs.set(name, await actx.decodeAudioData(bytes.buffer));
})).then(() => console.log(`[announce] ${clipBufs.size} clips ready`), (err) => console.error("[announce] clips failed:", err));

// G4 @ 12.146 -> target cell, G, 4, time, 12, point, 1, 4, 6. The row is one number word ("seventeen"), and so are the whole seconds
// up to 20 ("twelve"; from 21 on digit by digit: "two, one"). After the point: digit by digit, always 3 decimals.
function announceWords(cell, t) {
  const [whole, frac] = t.toFixed(3).split(".");
  return ["target", cell[0], cell.slice(1), "time", ...(+whole <= 20 ? [whole] : whole), "point", ...frac];
}

// While one is playing, other clicks are ignored (not queued): the grid dims for a moment so you can see the click was dropped
let announcing = false, announceNo = 0;
function announce(cell, t) {
  const words = announceWords(cell, t), bufs = words.map((w) => clipBufs.get(w));
  if (bufs.some((b) => !b)) { setStatus(`No voice clip for ${words[bufs.indexOf(undefined)]} (the clips cover A1–T20)`); return false; }
  actx.resume();
  announcing = true;
  const no = ++announceNo, done = () => { if (no === announceNo) announcing = false; }; // an old timer cannot end a newer one
  let at = actx.currentTime + 0.05; // back to back on the audio clock: no gaps, no overlaps
  bufs.forEach((b, i) => {
    const src = actx.createBufferSource();
    src.buffer = b;
    src.connect(announceGain);
    src.start(at);
    at += b.duration;
    if (i === bufs.length - 1) src.onended = done;
  });
  setTimeout(done, (at - actx.currentTime) * 1000 + 300); // in case onended never comes
  return true;
}

$("grid").addEventListener("click", (e) => {
  const t = Math.max(0, v.currentTime - (trimMode ? 0 : tIn)); // the moment of the click, the same time as the clock
  const g = $("grid");
  if (announcing || !clipBufs.size) {
    g.classList.remove("refuse"); void g.offsetWidth; g.classList.add("refuse"); // restart the dim
    console.log(`[announce] click ignored (${announcing ? "still speaking" : "voice still loading"})`);
    return;
  }
  const n = +$("n").value, r = g.getBoundingClientRect();
  const col = Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n));
  const row = Math.min(n - 1, Math.floor(((e.clientY - r.top) / r.height) * n));
  const cell = cellName(col, row);
  if (!announce(cell, t)) return;
  const hit = g.children[row * n + col];
  hit?.classList.add("hit"); setTimeout(() => hit?.classList.remove("hit"), 400);
  const rec = mr && mr.state === "recording";
  setStatus(`🔊 ${cell} · ${t.toFixed(3)} s` + (rec ? " · in the recording" : " · not recording, only in your headphones"));
  console.log(`[announce] ${cell} @ ${t.toFixed(3)} -> ${announceWords(cell, t).join(", ")}${rec ? " (recorded)" : ""}`);
});
