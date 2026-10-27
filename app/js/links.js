// app/js/links.js: Instagram links: the Next link box with Done (asks for the personal code), All links, Main / Dev / Mock.
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Instagram links: the side panel shows the NEXT link to work on (the oldest one) with Done beside it. ----
// "▸ All links" opens the whole list underneath (same rows as before: link, name, Copy name). This page holds no data:
// it only displays what the server sends. Done asks for your personal code and sends it to the website, which checks it
// (the real code is only on the website, never in this app) and removes the link; the next one moves up.
// CHANGE HERE: where the list comes from. If your dev address is different (for example a Codespaces
// address like https://<name>-8888.app.github.dev), put it in "dev". "mock" is a pretend list inside this page.
const SERVERS = {
  main: "https://studiomirrors.netlify.app/.netlify/functions/links-api",
  dev: "http://localhost:8888/.netlify/functions/links-api",
  mock: null,
};
let linksServer = "main"; // CHANGE HERE: used until you pick one with the toggle (menu ⋯ -> Links from)
let links = [], allOpen = false; // the list, oldest first (links[0] = the one to work on now); whether "All links" is open

// ---- Mock server: a pretend list kept in this browser (localStorage), so Done can be tried without touching the real one ----
const MOCK_LINKS = [ // out of order on purpose: the app must still show MOCK-FIRST first
  { id: "m3", link: "https://www.instagram.com/reel/MOCK-THIRD/", name: "Mock Carla", createdAt: "2026-10-03T09:00:00Z" },
  { id: "m1", link: "https://www.instagram.com/reel/MOCK-FIRST/", name: "Mock Anna", createdAt: "2026-10-01T09:00:00Z" },
  { id: "m4", link: "https://www.instagram.com/reel/MOCK-FOURTH/", name: "", createdAt: "2026-10-04T09:00:00Z" },
  { id: "m2", link: "https://www.instagram.com/reel/MOCK-SECOND/", name: "Mock Ben", createdAt: "2026-10-02T09:00:00Z" },
];
const MOCK_CODE = "MOCK"; // the pretend list's own code for Done (capitals do not matter); the real one is set in Netlify
const mock = {
  load() { try { return JSON.parse(localStorage.getItem("mockLinks")) ?? MOCK_LINKS; } catch { return MOCK_LINKS; } },
  save(list) { try { localStorage.setItem("mockLinks", JSON.stringify(list)); } catch {} },
  wait: () => new Promise((r) => setTimeout(r, 300)), // feels like a real request
};

// Real servers: GET -> { links: [{ link, name, ... }] }
async function getLinks(server) {
  if (server === "mock") { await mock.wait(); return mock.load(); }
  const res = await netFetch(SERVERS[server], { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  console.log(`[links] status ${res.status}`);
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data.links || [];
}
// Real servers: DELETE { id, code } -> the website checks the code (403 = wrong) and removes that one link
const wrongCode = () => Object.assign(new Error("Wrong code. Try again."), { wrongCode: true });
async function removeLink(server, it, code) {
  if (server === "mock") {
    await mock.wait();
    if (code.trim().toUpperCase() !== MOCK_CODE) throw wrongCode();
    mock.save(mock.load().filter((x) => x.id !== it.id));
    return;
  }
  const res = await netFetch(SERVERS[server], {
    method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: it.id, code }), cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  console.log(`[done] status ${res.status}`);
  if (res.status === 403) throw wrongCode();
  if (res.status === 404) return; // already removed (for example on the Video Vault page): same result
  if (!res.ok) throw new Error(data.error || `Removing failed (${res.status}).`);
}
// Oldest first: by createdAt when the server sends it, then by id (a newer link gets a bigger id)
const byAge = (list) => [...list].sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0) || a.id - b.id);

// CHANGE HERE: every link is shown (and opened) as ONE link = this prefix + the Instagram link.
const LINK_PREFIX = "https://f-d.app/";

const fullLink = (it) => (it.link.startsWith(LINK_PREFIX) ? it.link : LINK_PREFIX + it.link); // one link: prefix + Instagram link
// What the link SAYS (short, so it fits): "f-d.app › instagram.com/reel/…". Clicking still opens the full link; hovering shows it.
const shortLink = (it) => "f-d.app › " + fullLink(it).slice(LINK_PREFIX.length).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function linkRow(it) {
  const row = document.createElement("div");
  row.className = "lk";
  const a = document.createElement("a");
  a.href = a.title = fullLink(it); a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = shortLink(it);
  row.append(a); // the link has no copy button
  if (it.name) {
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = "Name: " + it.name;
    row.append(line(who, copyBtn(it.name, "Copy name"))); // after the link; the button says it copies the name
  }
  return row;
}

function renderLinks(slideIn) {
  const now = links[0];
  $("nextLegend").textContent = "Next link" + (linksServer === "mock" ? " (MOCK)" : "");
  $("nextItem").innerHTML = "";
  if (now) {
    const row = linkRow(now);
    const done = document.createElement("button");
    done.id = "doneBtn"; done.textContent = "✔ Done"; done.title = "Finished with this link: remove it (asks for your code)";
    done.onclick = () => doneOpen(now);
    row.firstChild.after(done); // Done sits right beside the link
    if (slideIn) row.classList.add("enter"); // after a Done: the next link slides in (grid.css)
    $("nextItem").append(row);
  }
  $("linksMsg").textContent = !links.length ? "No links waiting. 🎉" : links.length === 1 ? "Nothing else waiting." : `${links.length - 1} more waiting`;
  $("allBtn").textContent = `${allOpen ? "▾" : "▸"} All links (${links.length})`;
  $("linksList").innerHTML = "";
  links.forEach((it, i) => { const r = linkRow(it); if (!i) r.classList.add("now"); $("linksList").append(r); });
  console.log(`[links] showing ${links.length}, next: ${now ? now.link : "none"}`);
}

async function fetchLinks() {
  const server = linksServer;
  $("fetchBtn").disabled = true;
  $("linksMsg").textContent = "Fetching…";
  console.log(`[links] requesting from the ${server} server: ${SERVERS[server] ?? "(pretend list in this page)"}`);
  try {
    const list = await getLinks(server);
    if (server !== linksServer) return; // the toggle was switched meanwhile: that answer is not wanted any more
    links = byAge(list);
    renderLinks();
  } catch (err) {
    console.error("[links] FAILED:", err);
    links = []; renderLinks();
    $("linksMsg").textContent = err instanceof TypeError ? `Cannot reach the ${server} server (offline?). The rest of the app works as usual.` : err.message;
  } finally {
    $("fetchBtn").disabled = false;
  }
}

$("fetchBtn").onclick = fetchLinks;
$("allBtn").onclick = () => { allOpen = !allOpen; $("allBox").hidden = !allOpen; renderLinks(); };
$("mockReset").onclick = () => { try { localStorage.removeItem("mockLinks"); } catch {} console.log("[links] mock list reset"); fetchLinks(); };
function setServer(s, reload) {
  linksServer = s;
  document.querySelectorAll("#serverToggle button").forEach((b) => b.classList.toggle("on", b.dataset.server === s));
  $("mockReset").hidden = s !== "mock";
  console.log(`[links] server set to ${s}`);
  if (reload) { try { localStorage.setItem("linksServer", s); } catch {} fetchLinks(); } // a click: remember it and load
}
document.querySelectorAll("#serverToggle button").forEach((b) => (b.onclick = () => setServer(b.dataset.server, true)));
{ let s = null; try { s = localStorage.getItem("linksServer"); } catch {} setServer(s in SERVERS ? s : linksServer, false); }

// ---- Done: asks for your personal code, then removes the link; the next one moves up ----
let doneItem = null;
function doneOpen(it) {
  doneItem = it;
  $("doneWhat").textContent = (it.name ? it.name + " · " : "") + fullLink(it);
  $("doneCode").value = ""; $("doneMsg").textContent = "";
  $("doneForm").hidden = false; $("doneOkMsg").hidden = true;
  $("doneDlg").hidden = false;
  $("doneCode").focus();
  console.log(`[done] asking for the code: ${it.link}`);
}
function doneClose() { if (isBusy()) return; $("doneDlg").hidden = true; doneItem = null; reclaim(); }

// ---- Done animation: tick in the window -> window fades away -> the link swipes out -> "Video deleted" -> next link slides in ----
// From the click until the next link is in place the page is busy: clicks, keys and dropped files are ignored (grid.css body.busy).
const DONE_MS = { tick: 700, leave: 250, swipe: 350, deleted: 800 }; // CHANGE HERE: how long each part of the animation lasts
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const isBusy = () => document.body.classList.contains("busy");
const setBusy = (on) => { document.body.classList.toggle("busy", on); console.log(`[done] page ${on ? "busy" : "free again"}`); };

async function doneAnimation(server) {
  const next = getLinks(server).catch((err) => err); // load the next link while the animation plays
  $("doneForm").hidden = true; $("doneOkMsg").hidden = false; // the green tick
  await pause(DONE_MS.tick);
  $("doneDlg").classList.add("leaving");
  await pause(DONE_MS.leave);
  $("doneDlg").hidden = true; $("doneDlg").classList.remove("leaving");
  $("nextItem").querySelector(".lk")?.classList.add("swipe");
  await pause(DONE_MS.swipe);
  $("nextItem").innerHTML = '<div class="deleted">✓ Video deleted</div>';
  const [list] = await Promise.all([next, pause(DONE_MS.deleted)]);
  if (server !== linksServer) return; // the toggle was switched meanwhile
  if (list instanceof Error) return fetchLinks(); // shows why the list could not load
  links = byAge(list);
  renderLinks(true);
}

$("doneForm").onsubmit = async (e) => {
  e.preventDefault();
  if (isBusy()) return;
  const code = $("doneCode").value;
  if (!code.trim()) { $("doneMsg").textContent = "Type your code first."; return $("doneCode").focus(); }
  const server = linksServer;
  setBusy(true);
  $("doneOk").disabled = true; $("doneMsg").textContent = "Checking…";
  try {
    await removeLink(server, doneItem, code);
    console.log(`[done] removed ${doneItem.link}`);
    await doneAnimation(server);
    doneItem = null;
  } catch (err) {
    console.error("[done] FAILED:", err.message);
    $("doneMsg").textContent = err instanceof TypeError
      ? "Cannot reach the website (offline, or it does not accept Done yet). Nothing was removed."
      : err.message;
    if (err.wrongCode) $("doneCode").select();
  } finally {
    $("doneOk").disabled = false;
    setBusy(false);
    if ($("doneDlg").hidden) reclaim();
  }
};
$("doneCancel").onclick = doneClose;
$("doneClose").onclick = doneClose;
$("doneDlg").onclick = (e) => { if (e.target === $("doneDlg")) doneClose(); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("doneDlg").hidden) doneClose(); });
