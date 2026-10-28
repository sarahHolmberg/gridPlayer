# gridPlayer

**To start: double-click `Grid-v5.html`** (open it in Chrome or Edge). It works offline.

Everything else lives in the `app` folder. Keep it next to `Grid-v5.html` and don't rename it.

| In `app/` | What it is |
|---|---|
| `grid.css` | the styles |
| `js/` | the code, one file per feature (`main.js` starts the app) |
| `grid-trim.js` | the offline video cutter |
| `extension/` | the FastDL Chrome extension: load it with **Load unpacked** in `chrome://extensions`, and turn on **Allow access to file URLs** |
| `gridCell.ts` | helper that turns a cell name like `H8` into pixels |

**Click captions (test)**: in the grid view, the card under Record. Tick **Click cells** (C) and click a cell: a new line gets the time and the cell. The app says "grid cell G10, time 2.802" out loud (untick **Say it** to stop that), so your microphone records it into the normal recording too. Click **🎤 Listen** (M) and say the action, and your words go into that line (Chrome, needs the internet). You can also type them. Line 1 is the name. **⬇ Export JSON** downloads the caption file. The normal recording still works the same, next to it.

To get the newest version: in the app, click **⟳ Update from GitHub**.
