// app/js/recording.js: Audio recording (Rec / Pause / Resume / Save) and Export audio (then opens TurboScribe).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Audio recording: one MediaRecorder, pause()/resume() => a single file ----
// States: idle -> recording <-> paused -> (Save) -> idle. Paused time is not recorded.
let mr = null, stream = null, chunks = [], acc = 0, t0 = 0;

const recElapsed = () => (acc + (mr && mr.state === "recording" ? performance.now() - t0 : 0)) / 1000;

function updateRec() {
  const st = mr ? mr.state : "idle";
  $("recBtn").dataset.st = st;
  $("recLbl").textContent = st === "recording" ? "Pause" : st === "paused" ? "Resume" : "Rec";
  $("saveBtn").disabled = !mr;
  $("audioBtn").disabled = !mr;
  console.log(`[rec] ${st} ${recElapsed().toFixed(1)}s`);
}

async function recToggle() {
  if (!mr) {
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (err) { alert("Microphone not available: " + err.message); return; }
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
    mr = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
    chunks = [];
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.start(1000); // flush a chunk every second
    acc = 0; t0 = performance.now();
  } else if (mr.state === "recording") {
    mr.pause(); acc += performance.now() - t0;
  } else {
    mr.resume(); t0 = performance.now();
  }
  updateRec();
}

function recSave(after) {
  if (!mr) return;
  const rec = mr;
  rec.onstop = () => {
    const type = rec.mimeType || "audio/webm";
    const blob = new Blob(chunks, { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${type.includes("mp4") ? "m4a" : "webm"}`;
    a.click();
    console.log(`[rec] saved ${a.download} (${(blob.size / 1e6).toFixed(2)} MB)`);
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    stream.getTracks().forEach((t) => t.stop()); // release the mic
    mr = stream = null; chunks = []; acc = 0;
    updateRec();
    after?.(); // e.g. open TurboScribe once the file is downloaded
  };
  if (rec.state === "recording") acc += performance.now() - t0;
  rec.stop();
}

$("recBtn").onclick = recToggle;
$("saveBtn").onclick = recSave;

// ---- Export audio: stop + download the recording, then open TurboScribe to transcribe it ----
const SCRIBE_URL = "https://turboscribe.ai/"; // CHANGE HERE: the transcribing website
function exportAudio() {
  if (!mr) return;
  recSave(() => {
    const w = window.open(SCRIBE_URL, "_blank");
    console.log(`[export] opened ${SCRIBE_URL} -> ${w ? "ok" : "blocked"}`);
    if (!w) setStatus("Popup blocked: allow popups for this page, or open " + SCRIBE_URL);
  });
}
$("audioBtn").onclick = exportAudio;
