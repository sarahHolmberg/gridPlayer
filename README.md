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

**Click a cell** (grid view): the app says the cell and the time, e.g. "target cell G4, time 2.146", straight into the recording, mixed with your voice. You hear it in your headphones too. While it is speaking, other clicks are ignored (the grid dims). Untick **Grid** (G) to use the video's own controls.

To get the newest version: in the app, click **⟳ Update from GitHub**.
