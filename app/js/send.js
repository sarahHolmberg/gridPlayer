// app/js/send.js: Step 4: send it all to Studio Mirrors by email: the FileFlap link (recording + trimmed video), the name and
// Instagram link of the Next link, your name and a note. Uses Web3Forms (free, no server of our own, works from a file on disk).
// Part of Grid Player, loaded by Grid-v5.html with a plain <script> (no modules, so it also works opened from disk).
// Web3Forms free cannot carry files, so the files go on FileFlap and the email carries the link.

// CHANGE HERE: the Web3Forms access key. Get it (free) at https://web3forms.com: type the email address that should receive
// the videos, and the key arrives in that inbox. Every Send then goes to that address. Empty = Send is not set up yet.
const WEB3FORMS_KEY = "";
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
    try { $("sendFrom").value ||= localStorage.getItem("sendFrom") || ""; } catch {}
    $("sendMsg").textContent = ""; $("sendMsg").className = "";
  }
  reclaim();
  console.log(`[send] ${on ? "send step" : "back to record"}`);
}

async function sendIt() {
  const link = $("sendLink").value.trim(), from = $("sendFrom").value.trim(), note = $("sendNote").value.trim();
  const say = (t, ok) => { $("sendMsg").textContent = t; $("sendMsg").className = ok ? "ok" : ""; };
  if (!WEB3FORMS_KEY) return say("Sending is not set up yet: the Web3Forms key is missing (app/js/send.js).");
  if (!/^https?:\/\//i.test(link)) { say("Paste the FileFlap link first (it starts with https://)."); return $("sendLink").focus(); }
  if (!from) { say("Type your name first."); return $("sendFrom").focus(); }
  try { localStorage.setItem("sendFrom", from); } catch {}
  const it = links[0];
  const body = {
    access_key: WEB3FORMS_KEY,
    subject: `Grid Player: ${it?.name || "video"} from ${from}`,
    from_name: "Grid Player",
    "Sent by": from,
    "Name in the video": it?.name || "(none)",
    "Instagram link": it ? instaLink(it) : "(none)",
    "Recording + trimmed video (FileFlap)": link,
    Note: note || "(none)",
  };
  $("sendBtn").disabled = true; say("Sending…");
  try {
    const res = await netFetch(WEB3FORMS_URL, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    console.log(`[send] status ${res.status}: ${data.message || ""}`);
    if (!res.ok || !data.success) throw new Error(data.message || `Sending failed (${res.status}).`);
    sentLink = link;
    $("sendNote").value = "";
    say("✓ Sent to Studio Mirrors. Now press Done on the Next link.", true);
  } catch (err) {
    console.error("[send] FAILED:", err);
    say(err instanceof TypeError ? "Cannot reach the email service (offline?). Nothing was sent." : err.message);
  } finally {
    $("sendBtn").disabled = false;
  }
}

$("toSendBtn").onclick = () => sendMode(true);
$("sendBack").onclick = () => sendMode(false);
$("sendBtn").onclick = sendIt;
