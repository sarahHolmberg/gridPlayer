// Closes the fastdl tab once its download has finished. Console: chrome://extensions -> this extension -> "service worker".

const WAIT_FOR_START_MS = 20000; // CHANGE HERE: how long after the click a download may still start
const CLOSE_DELAY_MS    = 1000;  // CHANGE HERE: pause between "complete" and closing the tab

// tabId -> { url, armedAt, downloadId }. Kept in storage.session because the service worker can be shut down mid-download.
const KEY = "pending";
const load = async () => (await chrome.storage.session.get({ [KEY]: {} }))[KEY];
const save = (p) => chrome.storage.session.set({ [KEY]: p });

// content.js: "I am about to click, expect a download".
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type !== "arm" || !sender.tab) return;
  (async () => {
    const p = await load();
    p[sender.tab.id] = { url: msg.url, armedAt: Date.now(), downloadId: null };
    await save(p);
    console.log(`[fastdl] tab ${sender.tab.id} armed for ${msg.url}`);
    reply(true);
  })();
  return true; // keep the channel open for the async reply
});

// A download started: give it to the tab that was waiting (same URL first, else the oldest waiting tab).
chrome.downloads.onCreated.addListener(async (item) => {
  const p = await load();
  const waiting = Object.entries(p).filter(([, e]) => e.downloadId === null && Date.now() - e.armedAt < WAIT_FOR_START_MS);
  if (!waiting.length) return;
  const [tabId] = waiting.find(([, e]) => e.url === item.url || e.url === item.finalUrl) ?? waiting[0];
  p[tabId].downloadId = item.id;
  await save(p);
  console.log(`[fastdl] download ${item.id} started for tab ${tabId}: ${item.filename || item.url}`);
});

// A download changed state: complete -> close its tab; interrupted -> leave the tab open so you can retry.
chrome.downloads.onChanged.addListener(async (delta) => {
  if (!delta.state) return;
  const p = await load();
  const tabId = Object.keys(p).find((t) => p[t].downloadId === delta.id);
  if (!tabId) return;
  delete p[tabId];
  await save(p);
  if (delta.state.current === "complete") {
    console.log(`[fastdl] download ${delta.id} complete, closing tab ${tabId}`);
    setTimeout(() => chrome.tabs.remove(Number(tabId)).catch(() => {}), CLOSE_DELAY_MS);
  } else {
    console.warn(`[fastdl] download ${delta.id} ${delta.state.current}, leaving tab ${tabId} open`);
  }
});

// Toolbar button = ON / OFF switch (badge shows which).
const paint = async () => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
};
chrome.action.onClicked.addListener(async () => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  await chrome.storage.local.set({ enabled: !enabled });
  paint();
});
chrome.runtime.onInstalled.addListener(paint);
chrome.runtime.onStartup.addListener(paint);
