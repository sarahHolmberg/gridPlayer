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

**📊 Videos done** (bottom right): type your code and see how many videos you have done, the money (17 000 XAF for 30 videos, about 567 XAF each) and the links. Every **Done** is counted under the code you typed, so use your own code. In Done you can also paste the link to the stored video.

**👁 Stage info** (top left of the video area): how-to text and video for the stage you are on. Put the videos in `app/info` (see the README there).

To get the newest version: in the app, click **⟳ Update from GitHub**.
