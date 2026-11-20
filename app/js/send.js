// app/js/send.js: Step 4: send the trimmed video + its transcript to Studio Mirrors' comic server.
// The Grid Player cuts the trimmed MP4 itself (same as Export trim video: the picture is not re-encoded) and uploads it to the
// website (studio-mirrors: netlify/functions/task.mjs) in pieces, because the website takes about 6 MB per request; the
// website puts it back together, adds the secret key and sends it on (POST /api/tasks). Each video keeps one taskId, so
// sending it again never posts it twice. Temporary trouble is retried by itself while the app is open.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

const VIDEO_MAX = 13631488;        // the comic server's limit (13 MB)
const PART = 3 * 1024 * 1024;      // CHANGE HERE (and in task.mjs): the size of one upload piece
const RETRY_AFTER = [30, 120, 600, 1800]; // seconds: 30 s, 2 min, 10 min, then every 30 min (up to 24 h), as the server asks
let sentLink = ""; // (links.js) no stored-video link any more: Done leaves that field empty
let sendVideoBlob = null, sendVideoKey = "", sendBusy = false, retryTimer = null, retryCount = 0, retryStart = 0;

// ---- What is kept per video (this browser): taskId, send state, last message; and the transcript draft ----
const sendKey = () => (links[0] ? links[0].link : `file:${currentFile?.name || "video"}`);
const sendStore = {
  all() { try { return JSON.parse(localStorage.getItem("sendTasks")) || {}; } catch { return {}; } },
  get() { return this.all()[sendKey()] || {}; },
  set(patch) { try { const a = this.all(); a[sendKey()] = { ...a[sendKey()], ...patch, at: Date.now() }; localStorage.setItem("sendTasks", JSON.stringify(a)); } catch {} },
};
// One taskId per video, made once: letters, digits, - and _ (the link's number + a random part)
function taskIdFor() {
  let id = sendStore.get().taskId;
  if (!id) { id = `grid-${links[0]?.id ?? "x"}-${Math.random().toString(36).slice(2, 10)}`; sendStore.set({ taskId: id }); }
  return id;
}
const sendSay = (t, cls = "") => { $("sendMsg").textContent = t; $("sendMsg").className = cls; };
const sendUrl = () => SERVERS[linksServer]?.replace(/links-api$/, "task"); // null = the pretend (Mock) list

function sendMode(on) {
  document.body.classList.toggle("send-mode", on);
  if (on) {
    v.pause();
    const it = links[0];
    $("sendWhat").innerHTML = "";
    if (it) {
      const b = document.createElement("b"); b.textContent = it.name || "No name";
      $("sendWhat").append(b, document.createTextNode(instaLink(it)));
    } else $("sendWhat").textContent = "No Next link.";
    $("sendCode").value ||= myCode.get(); // your code, if typed before (links.js)
    let draft = ""; try { draft = localStorage.getItem("sendText:" + sendKey()) || ""; } catch {}
    if (!$("sendText").value) $("sendText").value = draft;
    countText();
    const st = sendStore.get();
    if (st.state === "sent") sendSay(`✓ This video was already sent (${st.message || "accepted"}). Sending it again does not post it twice.`, "ok");
    else if (st.message) sendSay(st.message, st.state === "waiting" ? "" : "bad");
    else sendSay("");
    prepareVideo();
  }
  reclaim();
  console.log(`[send] ${on ? "send step" : "back to record"}`);
}

// ---- 1. The video: the trimmed part, cut without re-encoding (like Export trim video), MP4, at most 13 MB ----
async function prepareVideo() {
  const key = `${currentFile?.name}|${currentFile?.size}|${tIn}|${tOut}`;
  if (sendVideoBlob && key === sendVideoKey) return showVideo();
  sendVideoBlob = null; sendVideoKey = key;
  if (!currentFile || !window.GridTrim) { $("sendVideo").textContent = "✗ Open the video with the file picker (or drag it in) first."; return; }
  $("sendVideo").textContent = "cutting the trimmed part…";
  try {
    const trimmed = tIn > 0 || tOut !== null;
    const { blob, ext } = trimmed ? await window.GridTrim.trim(currentFile, tIn, rangeEnd()) : { blob: currentFile, ext: currentFile.name.split(".").pop().toLowerCase() };
    if (key !== sendVideoKey) return; // another video meanwhile
    sendVideoBlob = Object.assign(blob, { ext });
  } catch (err) {
    console.error("[send] cutting failed:", err);
    $("sendVideo").textContent = "✗ Could not cut the video: " + (err.message || err);
    return;
  }
  showVideo();
}
function showVideo() {
  const b = sendVideoBlob, mb = (b.size / 1048576).toFixed(1);
  const problem = b.ext !== "mp4" ? `it is .${b.ext}, the server takes only .mp4` : b.size > VIDEO_MAX ? `${mb} MB is over the 13 MB limit: trim it shorter` : "";
  $("sendVideo").textContent = problem ? `✗ ${problem}` : `✓ trimmed MP4, ${mb} MB`;
  $("sendVideo").className = problem ? "bad" : "ok";
}

// ---- 2. The transcript: paste it, or load a .txt (kept as a draft per video) ----
function countText() {
  const n = $("sendText").value.length;
  $("sendCount").textContent = n ? `${n.toLocaleString()} / 50,000 characters` : "";
  try { localStorage.setItem("sendText:" + sendKey(), $("sendText").value); } catch {}
}
$("sendText").oninput = countText;
$("sendTxtBtn").onclick = () => $("sendTxtFile").click();
$("sendTxtFile").onchange = async () => {
  const f = $("sendTxtFile").files[0]; $("sendTxtFile").value = "";
  if (!f) return;
  $("sendText").value = (await f.text()).slice(0, 50000); countText();
  console.log(`[send] transcript loaded from ${f.name}`);
};

// ---- 3. Send: upload the pieces, then the website sends everything to the comic server ----
async function call(step, body) {
  const res = await netFetch(`${sendUrl()}?step=${step}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return res.json().catch(() => ({ ok: false, temporary: true, code: `HTTP_${res.status}`, message: `The website answered ${res.status}.` }));
}
async function upload(taskId, code) {
  const b = sendVideoBlob, parts = Math.ceil(b.size / PART);
  const start = await call("start", { code, taskId, size: b.size, parts });
  if (!start.ok) return start;
  for (let n = 0; n < parts; n++) {
    sendSay(`Uploading the video: piece ${n + 1} of ${parts}…`);
    const res = await netFetch(`${sendUrl()}?step=part&taskId=${encodeURIComponent(taskId)}&n=${n}`, {
      method: "PUT", headers: { "X-Code": code, "Content-Type": "application/octet-stream" }, body: b.slice(n * PART, (n + 1) * PART),
    });
    if (!res.ok) return res.json().catch(() => ({ ok: false, temporary: true, code: `HTTP_${res.status}`, message: "Uploading a piece failed." }));
  }
  return { ok: true };
}

// What each answer means for the person (the server's own "message" is added after it)
const ANSWERS = {
  ACCEPTED: ["sent", "✓ Sent: the comic server has it. It now waits on Parrot for its script, then it is posted by itself."],
  DUPLICATE: ["sent", "✓ Sent: the comic server already had this video. Nothing is done twice."],
  STORAGE_FULL: ["waiting", "⏳ The server's storage is full. Try again later (space frees up as videos get posted)."],
  SLOTS_FULL: ["waiting", "⏳ The posting queue is full for the next 25 days. Try again tomorrow."],
  VIDEO_UNREADABLE: ["fix", "✗ The server cannot play this video. Check the trimmed video plays, then send again."],
  VIDEO_TOO_BIG: ["fix", "✗ The video is over 13 MB. Trim it shorter, then send again."],
  BAD_REQUEST: ["config", "✗ The server refused the request. Tell Studio Mirrors:"],
  WRONG_KEY: ["config", "✗ The inbox key on the website is wrong (Code adder → Settings). Tell Studio Mirrors."],
  NOT_READY: ["config", "✗ The server is not set up yet. Tell Studio Mirrors:"],
  WRONG_CODE: ["fix", "✗ Wrong code. Type your code again."],
};

async function sendIt(isRetry) {
  if (sendBusy) return;
  const text = $("sendText").value, code = $("sendCode").value.trim();
  if (!sendVideoBlob) return sendSay("The video is not ready yet (see 1.).", "bad");
  if (sendVideoBlob.ext !== "mp4" || sendVideoBlob.size > VIDEO_MAX) return sendSay("The video cannot be sent: see 1.", "bad");
  if (!text.trim()) { sendSay("Paste the transcript first (2.).", "bad"); return $("sendText").focus(); }
  if (!code) { sendSay("Type your code.", "bad"); return $("sendCode").focus(); }
  clearTimeout(retryTimer); $("sendRetry").hidden = true;
  if (!isRetry) { retryCount = 0; retryStart = Date.now(); }
  const taskId = taskIdFor();
  sendBusy = true; $("sendBtn").disabled = true;
  let r;
  try {
    if (!sendUrl()) { await new Promise((ok) => setTimeout(ok, 600)); r = { ok: true, code: "ACCEPTED" }; } // the pretend list
    else {
      r = await upload(taskId, code);
      if (r.ok) { sendSay("Sending to the comic server… (this can take up to 2 minutes)"); r = await call("send", { code, taskId, transcript: text }); }
      if (r.code === "MISSING_PARTS") { r = await upload(taskId, code); if (r.ok) r = await call("send", { code, taskId, transcript: text }); }
    }
  } catch (err) {
    console.error("[send] FAILED:", err);
    r = { ok: false, temporary: true, code: "OFFLINE", message: "Cannot reach the website (offline?)." };
  } finally {
    sendBusy = false; $("sendBtn").disabled = false;
  }
  console.log(`[send] ${taskId}: ${r.code} ${r.message || ""}`);
  if (r.ok || r.code === "WRONG_CODE" || !r.temporary) {
    const [state, text2] = ANSWERS[r.code] || ["config", "✗ Unexpected answer. Tell Studio Mirrors:"];
    const msg = state === "sent" ? text2 : `${text2}${r.message && !text2.includes(r.message) ? " " + r.message : ""}`;
    if (r.code !== "WRONG_CODE") sendStore.set({ state, message: msg });
    if (r.ok) myCode.set(code); // the code worked: keep it
    sendSay(msg, state === "sent" ? "ok" : state === "waiting" ? "" : "bad");
    if (state === "waiting") $("sendRetry").hidden = false;
    if (r.ok) askDone(true, [["📨 Comic server", true, r.code === "DUPLICATE" ? "already had it" : "received"]]);
    return;
  }
  // Temporary (timeout, server starting, 5xx): the SAME taskId again later, by itself, while the app is open
  if (Date.now() - retryStart > 24 * 36e5) { sendStore.set({ state: "waiting", message: "✗ Still not through after 24 hours." }); return sendSay("✗ Still not through after 24 hours. Try again later.", "bad"); }
  const wait = RETRY_AFTER[Math.min(retryCount, RETRY_AFTER.length - 1)];
  retryCount++;
  const at = new Date(Date.now() + wait * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msg = `⏳ ${r.message || "Temporary trouble."} Trying again by itself at ${at} (keep the Grid Player open).`;
  sendStore.set({ state: "waiting", message: msg });
  sendSay(msg); $("sendRetry").hidden = false;
  retryTimer = setTimeout(() => sendIt(true), wait * 1000);
}

// ---- After a Send: "Are you done with this video?" Done = the usual Done window (your code); Not yet = stay here ----
function askDone(on, sent = []) {
  $("askDone").hidden = !on;
  if (on) {
    const it = links[0];
    $("askDoneWhat").textContent = it ? (it.name ? it.name + " · " : "") + instaLink(it) : "";
    $("askDoneSent").innerHTML = "";
    sent.forEach(([what, ok, detail]) => {
      const li = document.createElement("li");
      li.className = ok ? "ok" : "bad";
      li.textContent = `${ok ? "✓" : "✗"} ${what}: ${detail}`;
      $("askDoneSent").append(li);
    });
    $("askDoneHead").textContent = sent.every(([, ok]) => ok) ? "✓ Sent. Are you done with this video?" : "⚠ Partly sent. Are you done with this video?";
    $("askDoneYes").disabled = !it;
    $("askDoneYes").focus();
  } else reclaim();
  console.log(`[send] ask done ${on ? "open" : "closed"}`);
}
$("askDoneYes").onclick = () => { const it = links[0]; askDone(false); if (it) doneOpen(it); };
$("askDoneNo").onclick = () => askDone(false);
$("askDone").onclick = (e) => { if (e.target === $("askDone")) askDone(false); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("askDone").hidden) askDone(false); });

$("toSendBtn").onclick = () => sendMode(true);
$("sendBack").onclick = () => sendMode(false);
$("sendBtn").onclick = () => sendIt(false);
$("sendRetry").onclick = () => sendIt(true);
