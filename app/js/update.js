// app/js/update.js: Update from GitHub: compares this folder with the repo and copies in the files that changed (Chrome / Edge).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).

// ---- Update from GitHub: when online, compares this folder with the repo and copies in the files that changed. ----
// Offline the app works exactly as before: nothing is checked or downloaded until you open this window.
// Needs Chrome or Edge: a web page can only write into a folder you pick yourself (File System Access API).
// Files that only exist on this computer are never touched or deleted. Every file that gets replaced is first
// copied to _backup/ inside the folder, so you can put the old one back by hand. Only the most recent update's backup is kept.
const REPO = { owner: "sarahHolmberg", name: "gridPlayer", branch: "main" }; // CHANGE HERE: where updates come from
const API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}`;
const SKIP = (path) => path.split("/").some((p) => p.startsWith(".")); // .DS_Store, .github, ... are never copied
let updDir = null, updFiles = [], updCommit = null, updDone = false; // the picked folder, the files that differ, the repo version they come from

const updLog = (msg) => { $("updMsg").textContent = msg; console.log(`[update] ${msg}`); };
const updBusy = (on) => ["updCheck", "updFolder", "updGo"].forEach((id) => ($(id).disabled = on || (id === "updGo" && !updFiles.length && !updDone)));

// git's own id for a file: sha1("blob <size>\0" + bytes). Same bytes as in the repo -> same id, so comparing needs no download.
async function blobSha(bytes) {
  const head = new TextEncoder().encode(`blob ${bytes.byteLength}\0`);
  const all = new Uint8Array(head.length + bytes.byteLength);
  all.set(head); all.set(new Uint8Array(bytes), head.length);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-1", all))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// "app/extension/content.js" -> the bytes of that file in the folder, or null if it is not there
async function readLocal(dir, path) {
  const parts = path.split("/"), name = parts.pop();
  try {
    for (const p of parts) dir = await dir.getDirectoryHandle(p);
    return await (await (await dir.getFileHandle(name)).getFile()).arrayBuffer();
  } catch (err) {
    if (err.name === "NotFoundError" || err.name === "TypeMismatchError") return null;
    throw err;
  }
}
// Writes go to a temporary file that only replaces the real one when complete, so a file is never half written.
async function writeLocal(dir, path, bytes) {
  const parts = path.split("/"), name = parts.pop();
  for (const p of parts) dir = await dir.getDirectoryHandle(p, { create: true });
  const w = await (await dir.getFileHandle(name, { create: true })).createWritable();
  await w.write(bytes);
  await w.close();
}

// The picked folder is remembered (IndexedDB), so you choose it once; the browser still asks to allow editing.
function idb(mode, fn) {
  return new Promise((ok, fail) => {
    const req = indexedDB.open("grid-update", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onerror = () => fail(req.error);
    req.onsuccess = () => {
      const tx = req.result.transaction("kv", mode), r = fn(tx.objectStore("kv"));
      tx.oncomplete = () => ok(r.result);
      tx.onerror = () => fail(tx.error);
    };
  });
}
async function getFolder(pickAgain) {
  if (!window.showDirectoryPicker) throw new Error("This browser cannot write files. Open Grid Player in Chrome or Edge to update it.");
  let dir = pickAgain ? null : await idb("readonly", (s) => s.get("dir")).catch(() => null);
  if (dir && (await dir.requestPermission({ mode: "readwrite" })) !== "granted") dir = null;
  if (!dir) {
    updLog("Choose the folder this Grid Player is in…");
    dir = await showDirectoryPicker({ id: "grid-player", mode: "readwrite" });
  }
  // Guard against picking the wrong folder: it must contain the page that is open right now.
  const page = decodeURIComponent(location.pathname.split("/").pop());
  if (page.endsWith(".html") && !(await readLocal(dir, page)))
    throw new Error(`"${dir.name}" does not contain ${page}. Click "Change folder" and pick the folder this page is in.`);
  idb("readwrite", (s) => s.put(dir, "dir")).catch((err) => console.warn("[update] could not remember the folder:", err));
  return dir;
}

function updError(err) {
  console.error("[update] FAILED:", err);
  if (err.name === "AbortError") updLog("No folder chosen. Nothing was changed.");
  else if (err instanceof TypeError) updLog("Cannot reach GitHub: you seem to be offline. Nothing was changed; the app keeps working as it is.");
  else updLog(err.message);
}
async function github(url) {
  const res = await netFetch(url, { cache: "no-store" });
  if (res.status === 403 || res.status === 429) throw new Error("GitHub allows about 30 checks an hour without an account. Try again later.");
  if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${url}. Is the repo public and the branch "${REPO.branch}"?`);
  return res.json();
}

function renderUpd() {
  const box = $("updList");
  box.innerHTML = "";
  updFiles.forEach((f) => {
    const row = document.createElement("div");
    row.className = "lk";
    row.textContent = `${f.kind === "new" ? "🆕 new" : "✏ changed"} · ${f.path} (${(f.size / 1024).toFixed(1)} KB)`;
    box.appendChild(row);
  });
}

// Step 1: which files in the folder are not the same as in the repo?
async function updCheck(pickAgain) {
  updBusy(true); updDone = false; updFiles = []; renderUpd();
  $("updGo").textContent = "⬇ Install update";
  try {
    updDir = await getFolder(pickAgain); // first, while the click still counts: the browser only shows the folder prompt right after a click
    updLog("Asking GitHub what is in the repo…");
    const { commit } = await github(`${API}/branches/${REPO.branch}`); // the newest version (commit) on the branch
    updCommit = commit.sha;
    const { tree, truncated } = await github(`${API}/git/trees/${commit.commit.tree.sha}?recursive=1`);
    if (truncated) console.warn("[update] the repo list was cut short by GitHub, some files may be missing");
    for (const f of tree.filter((t) => t.type === "blob" && !SKIP(t.path))) {
      const local = await readLocal(updDir, f.path);
      if (!local) updFiles.push({ ...f, kind: "new" });
      else if ((await blobSha(local)) !== f.sha) updFiles.push({ ...f, kind: "changed" });
    }
    renderUpd();
    updLog(updFiles.length
      ? `${updFiles.length} file${updFiles.length === 1 ? "" : "s"} in "${updDir.name}" differ from GitHub. Click Install update.`
      : `Up to date: "${updDir.name}" matches GitHub.`);
  } catch (err) { updError(err); }
  finally { updBusy(false); }
}

// Step 2: download everything first (and check each file is exactly the repo's), only then back up and write.
// A connection that drops halfway therefore changes nothing.
async function updInstall() {
  updBusy(true);
  try {
    const got = [];
    for (const [i, f] of updFiles.entries()) {
      updLog(`Downloading ${i + 1}/${updFiles.length}: ${f.path}`);
      // From the exact commit that was checked (not "main"), so it is never an older cached copy. Not counted in GitHub's hourly limit.
      const res = await netFetch(`https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${updCommit}/${f.path.split("/").map(encodeURIComponent).join("/")}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Downloading ${f.path} failed (${res.status}). Nothing was changed; try again.`);
      const bytes = await res.arrayBuffer();
      if ((await blobSha(bytes)) !== f.sha) throw new Error(`${f.path} did not arrive intact. Nothing was changed; try again.`);
      got.push({ ...f, bytes });
    }
    // Only the newest backup is kept: the previous one goes first (nothing to remove the first time).
    await updDir.removeEntry("_backup", { recursive: true }).catch((err) => { if (err.name !== "NotFoundError") throw err; });
    for (const f of got) {
      updLog(`Writing ${f.path}`);
      const old = await readLocal(updDir, f.path);
      if (old) await writeLocal(updDir, `_backup/${f.path}`, old);
      await writeLocal(updDir, f.path, f.bytes);
    }
    const ext = got.some((f) => f.path.startsWith("app/extension/"));
    updFiles = []; updDone = true; renderUpd();
    $("updGo").textContent = "↻ Reload Grid Player";
    updLog(`Updated ${got.length} file${got.length === 1 ? "" : "s"} (old versions in _backup). Reload to use the new version.` +
      (ext ? " The extension changed too: click its reload arrow in chrome://extensions." : ""));
  } catch (err) { updError(err); }
  finally { updBusy(false); }
}

const updToggle = (on) => {
  $("upd").hidden = !on;
  console.log(`[update] window ${on ? "open" : "closed"}`);
  if (on) updCheck(false); // opening the window checks straight away
};
$("updBtn").onclick = () => updToggle(true);
$("updClose").onclick = () => updToggle(false);
$("updCheck").onclick = () => updCheck(false);
$("updFolder").onclick = () => updCheck(true);
$("updGo").onclick = () => (updDone ? location.reload() : updInstall());
$("upd").onclick = (e) => { if (e.target === $("upd")) updToggle(false); };
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("upd").hidden) updToggle(false); });
