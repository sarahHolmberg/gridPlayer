// app/js/send.js: Step 4: send it to Studio Mirrors by email: the FileFlap transfer link (recording + trimmed video), with the
// name and Instagram link of the Next link added by the app. The form takes ONLY the FileFlap link.
// Uses Web3Forms (free, no server of our own, works from a file on disk).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).
// Web3Forms free cannot carry files, so the files go on FileFlap and the email carries the link.
// The same link also goes to the render inbox, through the website (its "inbox" function adds the secret key there:
// a key in this page could be read by anyone). That needs your code, so strangers cannot use it.

// ============================== THE KEY FOR THE MAIL SENDING ==============================
// CHANGE HERE: paste the Web3Forms access key between the quotes. Get it (free) at https://web3forms.com: type the email
// address that should receive the videos, and the key arrives in that inbox. Every Send then goes to that address.
// Empty = Send is not set up yet.
const WEB3FORMS_KEY = "2db4d391-3422-441a-b361-364cf54c237e";
// ==========================================================================================
const WEB3FORMS_URL = "https://api.web3forms.com/submit";
let sentLink = ""; // the FileFlap link that was last sent: Done fills it in as the stored-video link (links.js)

function sendMode(on) {
  document.body.classList.toggle("send-mode", on);
  if (on) {
    v.pause();
    const it = links[0];
    $("sendWhat").innerHTML = "";
    if (it) {
      const b = document.createElement("b"); b.textContent = it.name || "No name";
      $("sendWhat").append(b, document.createTextNode(instaLink(it)));
    } else $("sendWhat").textContent = "No Next link: the email will have no Instagram link.";
    $("sendMsg").textContent = ""; $("sendMsg").className = "";
    $("sendCode").value ||= myCode.get(); // your code, if typed before (links.js)
  }
  reclaim();
  console.log(`[send] ${on ? "send step" : "back to record"}`);
}

// Only a FileFlap transfer link: https://fileflap.net/<something>
function isFlapLink(raw) {
  try {
    const u = new URL(raw), host = u.hostname.toLowerCase();
    return u.protocol === "https:" && (host === "fileflap.net" || host.endsWith(".fileflap.net")) && u.pathname.length > 1;
  } catch { return false; }
}

// The render inbox, through the website: POST { code, url, title } -> { received } (the website adds the key)
async function sendToInbox(link, code, it) {
  const url = SERVERS[linksServer]?.replace(/links-api$/, "inbox");
  if (!url) return "(pretend list: no inbox)";
  const res = await netFetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, url: link, title: it ? `${it.name || "video"} #${it.id}` : "" }),
  });
  const data = await res.json().catch(() => ({}));
  console.log(`[send] inbox status ${res.status}`);
  if (!res.ok || !data.received) throw new Error(res.status === 404 ? "The website has no inbox yet." : data.error || `Inbox failed (${res.status}).`);
  return data.received;
}

async function sendIt() {
  const link = $("sendLink").value.trim(), code = $("sendCode").value.trim();
  const say = (t, ok) => { $("sendMsg").textContent = t; $("sendMsg").className = ok ? "ok" : ""; };
  if (!WEB3FORMS_KEY) return say("Sending is not set up yet: the Web3Forms key is missing (app/js/send.js).");
  if (!isFlapLink(link)) { say("Paste the FileFlap transfer link (https://fileflap.net/…). Only that link is accepted."); return $("sendLink").focus(); }
  if (!code) { say("Type your code (it sends the link to the render inbox too)."); return $("sendCode").focus(); }
  const it = links[0];
  const body = {
    access_key: WEB3FORMS_KEY,
    subject: `Grid Player: ${it?.name || "video"}`,
    from_name: "Grid Player",
    "Name in the video": it?.name || "(none)",
    "Instagram link": it ? instaLink(it) : "(none)",
    "Recording + trimmed video (FileFlap)": link,
  };
  $("sendBtn").disabled = true; say("Sending…");
  // Both at once: the email and the render inbox
  const email = (async () => {
    // Sent as a plain form (like Web3Forms' own example), not JSON: then the browser sends it straight away, with no
    // permission check first, which a page opened from a file on disk could fail
    const form = new FormData();
    Object.entries(body).forEach(([k, val]) => form.append(k, val));
    const res = await netFetch(WEB3FORMS_URL, { method: "POST", headers: { Accept: "application/json" }, body: form });
    const data = await res.json().catch(() => ({}));
    console.log(`[send] email status ${res.status}: ${data.message || ""}`);
    if (!res.ok || !data.success) throw new Error(data.message || `Sending failed (${res.status}).`);
  })();
  const [mail, inbox] = await Promise.allSettled([email, sendToInbox(link, code, it)]);
  const why = (r, what) => (r.reason instanceof TypeError ? `cannot reach the ${what} (offline?)` : r.reason.message);
  if (inbox.status === "fulfilled") myCode.set(code); // the code worked: keep it (the list and Done use it too)
  const parts = [mail.status === "fulfilled" ? "email ✓" : `email ✗ (${why(mail, "email service")})`,
                 inbox.status === "fulfilled" ? "inbox ✓" : `inbox ✗ (${why(inbox, "website")})`];
  console.log("[send]", parts.join(" · "));
  $("sendBtn").disabled = false;
  if (mail.status === "rejected" && inbox.status === "rejected") return say("Nothing was sent: " + parts.join(" · "));
  sentLink = link;
  say((mail.status === "fulfilled" && inbox.status === "fulfilled" ? "✓ Sent to Studio Mirrors: " : "⚠ Partly sent: ") + parts.join(" · "),
      mail.status === "fulfilled" && inbox.status === "fulfilled");
  askDone(true); // "Are you done with this video?"
}

// ---- After a Send: "Are you done with this video?" Done = the usual Done window (your code); Not yet = stay here ----
function askDone(on) {
  $("askDone").hidden = !on;
  if (on) {
    const it = links[0];
    $("askDoneWhat").textContent = it ? (it.name ? it.name + " · " : "") + instaLink(it) : "";
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
$("sendBtn").onclick = sendIt;
