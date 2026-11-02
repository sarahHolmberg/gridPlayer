// app/js/stats.js: Videos done: the 📊 button (bottom right) asks for your code and shows how many videos you have done and the money.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).
// The website counts them: every Done is saved there under the code that was typed (links.js). Same server as the links (⋯ -> Links from).
// Real servers: POST { code } -> { who, count, payPerVideo, currency, total, videos: [{ name, link, stored, doneAt }] } (403 = wrong code)

const MOCK_PAY = { payPerVideo: 17000, currency: "XAF" }; // the pretend list only; the real amount is set on the website
async function getStats(server, code) {
  if (server === "mock") {
    await mock.wait();
    if (code.trim().toUpperCase() !== MOCK_CODE) throw wrongCode();
    const videos = mock.loadDone();
    return { who: MOCK_CODE, count: videos.length, ...MOCK_PAY, total: videos.length * MOCK_PAY.payPerVideo, videos };
  }
  const res = await netFetch(SERVERS[server], {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }), cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  console.log(`[stats] status ${res.status}`);
  if (res.status === 403) throw wrongCode();
  if (!res.ok) throw new Error(data.error || `Could not load (${res.status}).`);
  return data;
}

const money = (n, cur) => n.toLocaleString("fr-FR").replace(/ | /g, " ") + " " + cur; // 34000 -> "34 000 XAF"
function statsLink(href, text) {
  const a = document.createElement("a");
  a.href = a.title = href; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = text;
  return a;
}
function statsRender(d) {
  $("statsCount").textContent = d.count;
  $("statsTotal").textContent = money(d.total, d.currency);
  $("statsRate").textContent = `${d.count} × ${money(d.payPerVideo, d.currency)}`;
  const list = $("statsList");
  list.innerHTML = "";
  if (!d.videos.length) list.textContent = "No videos done with this code yet.";
  d.videos.forEach((it) => {
    const row = document.createElement("div");
    row.className = "dv";
    const when = document.createElement("span");
    when.className = "when";
    when.textContent = new Date(it.doneAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    const who = document.createElement("b");
    who.textContent = it.name || "No name";
    row.append(when, who, statsLink(fullLink(it), "▶ Video"));
    row.append(it.stored ? statsLink(it.stored, "📦 Stored") : Object.assign(document.createElement("span"), { className: "none", textContent: "no stored link" }));
    list.append(row);
  });
  if (d.count > d.videos.length) list.append(Object.assign(document.createElement("div"), { className: "none", textContent: `…and ${d.count - d.videos.length} older ones` }));
  $("statsOut").hidden = false;
  console.log(`[stats] ${d.who}: ${d.count} videos, ${d.total} ${d.currency}`);
}

function statsOpen(on) {
  $("statsDlg").hidden = !on;
  if (on) { $("statsCode").value = ""; $("statsMsg").textContent = ""; $("statsOut").hidden = true; $("statsCode").focus(); }
  else reclaim();
  console.log(`[stats] ${on ? "open" : "closed"}`);
}
$("statsForm").onsubmit = async (e) => {
  e.preventDefault();
  const code = $("statsCode").value;
  if (!code.trim()) { $("statsMsg").textContent = "Type your code first."; return $("statsCode").focus(); }
  $("statsOk").disabled = true; $("statsMsg").textContent = "Loading…"; $("statsOut").hidden = true;
  try {
    statsRender(await getStats(linksServer, code));
    $("statsMsg").textContent = linksServer === "mock" ? "MOCK: the pretend list" : "";
  } catch (err) {
    console.error("[stats] FAILED:", err.message);
    $("statsMsg").textContent = err instanceof TypeError ? "Cannot reach the website (offline?)." : err.message;
    if (err.wrongCode) $("statsCode").select();
  } finally {
    $("statsOk").disabled = false;
  }
};
$("statsBtn").onclick = () => statsOpen(true);
$("statsClose").onclick = () => statsOpen(false);
$("statsDlg").onclick = (e) => { if (e.target === $("statsDlg")) statsOpen(false); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("statsDlg").hidden) statsOpen(false); });
