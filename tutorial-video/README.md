# Grid Player tutorial videos (Remotion)

1920×1080, 30 fps. The browser and the app are rebuilt as React components (no screenshots).

| Composition | What | Length |
|---|---|---|
| `Scene1` | Download the next link, drop the video into the player | 18 s |
| `Scene2` | Trim the video on the beat (count four 8s, press Out on the 4 of the fifth 8) | ~39 s (derived from BPM) |

```bash
npm install
npm run studio          # preview in Remotion Studio (http://localhost:3000)
npm run render          # out/scene1.mp4
npm run render:scene2   # out/scene2.mp4
```

## What to edit

- `src/config.ts`: Scene 1 timings (seconds), captions and on-screen text.
- `src/scene2/config2.ts`: Scene 2 **BPM, first-beat time, speed of each 8, which count to press Out on, replay speed, captions, step indicator, audio files**. All beat times, caption times and the scene length are calculated from these in `src/scene2/timeline.ts`.
- `src/shared.tsx`: camera, cursor, click ripple and caption style shared by both scenes.
- `src/ui.tsx`, `src/scene2/App2.tsx`: the browser window and Grid Player UI (colors from `app/grid.css`).
- `src/scene2/overlays.tsx`: beat track, count display, 3D 8-count blocks, keycaps, spotlight.

## Audio

`public/audio/kick.wav` (every beat) and `kick-accent.wav` (every count "1") are synthesized by `npm run kicks` (royalty-free).
Swap them for your own files, or point `audio` in `config2.ts` somewhere else.

The Inter font is bundled in `public/fonts`, so rendering works offline.
