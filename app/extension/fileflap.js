// Runs on fileflap.net. When the Grid Player opened the page (its link ends in #grid-player), shows a small pop-up for
// 3 seconds: drag the recording and the trimmed video here. ✕ closes it sooner. Opened any other way: nothing happens.
// Open the tab's DevTools console and filter on [fileflap] to follow it.

const SHOW_MS = 3000; // CHANGE HERE: how long the pop-up stays

if (location.hash === "#grid-player") {
  history.replaceState(null, "", location.pathname + location.search); // the address goes back to plain fileflap.net
  // A shadow root keeps FileFlap's styles and ours apart
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      .box { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); width: min(420px, 92vw); pointer-events: auto;
             font: 13px/1.45 Tahoma, Verdana, sans-serif; color: #000; background: #ece9d8; border: 3px solid #0831d9; border-top: 0;
             border-radius: 8px 8px 0 0; box-shadow: 4px 4px 14px rgba(0,0,0,.45); animation: pop .2s ease-out; }
      .bar { display: flex; align-items: center; padding: 5px 4px 5px 10px; border-radius: 7px 7px 0 0; margin: 0 -3px;
             color: #fff; font: bold 13px "Trebuchet MS", Tahoma, sans-serif; text-shadow: 1px 1px #0f1089;
             background: linear-gradient(#0997ff 0, #0053ee 8%, #0050ee 40%, #06f 88%, #06f 93%, #005bff 95%, #003dd7 100%); }
      .bar span { flex: 1; }
      button { width: 21px; height: 21px; border: 1px solid #fff; border-radius: 3px; color: #fff; font: bold 11px Tahoma; cursor: pointer;
               background: radial-gradient(circle at 30% 25%, #f0987a, #d2401a 70%); }
      .body { padding: 10px 14px 12px; }
      ol { margin: 6px 0 0; padding-left: 20px; }
      .time { height: 4px; margin-top: 10px; background: #c1d2ee; }
      .time i { display: block; height: 100%; background: #0046d5; animation: down ${SHOW_MS}ms linear forwards; }
      @keyframes down { from { width: 100%; } to { width: 0; } }
      @keyframes pop { from { opacity: 0; transform: translate(-50%, -8px); } }
    </style>
    <div class="box" role="dialog" aria-label="Upload the files">
      <div class="bar"><span>⬆ Upload both files here</span><button title="Close">✕</button></div>
      <div class="body">
        Drag these two files onto this page:
        <ol>
          <li><b>The recording</b> you just exported (in Downloads)</li>
          <li><b>The trimmed video</b>: not exported yet? Click <b>⬇ Export trim video</b> in the Grid Player first</li>
        </ol>
        Then copy the FileFlap link and paste it in the Grid Player's <b>Send</b> step.
        <div class="time"><i></i></div>
      </div>
    </div>`;
  const close = () => { host.remove(); console.log("[fileflap] pop-up closed"); };
  root.querySelector("button").onclick = close;
  setTimeout(close, SHOW_MS);
  (document.body || document.documentElement).append(host);
  console.log("[fileflap] opened from the Grid Player: pop-up shown");
}
