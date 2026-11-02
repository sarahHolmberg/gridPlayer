# Grid Player tutorial video (Remotion)

A 18-second, 1920×1080 / 30 fps animated tutorial. The browser and the app are rebuilt as React components (no screenshots).

```bash
npm install
npm run studio    # preview in Remotion Studio (opens http://localhost:3000)
npm run render    # writes out/scene1.mp4
```

## What to edit

- `src/config.ts`: **all timings (in seconds), caption texts and on-screen text** (name, link, file name…).
- `src/Scene1.tsx`: camera keyframes (`camera`), cursor path (`cursorPos`), caption style.
- `src/ui.tsx`: the browser window and Grid Player app components (colors copied from `app/grid.css`).
- `src/layout.ts`: pixel positions shared by the UI, camera and cursor.

The Inter font is bundled in `public/fonts`, so rendering works offline.
