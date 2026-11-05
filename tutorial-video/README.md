# Grid Player tutorial videos (Remotion)

1920×1080, 30 fps. The browser and the app are rebuilt as React components (no screenshots).

| Composition | What | Length |
|---|---|---|
| `Scene1` | Download the next link, drop the video into the player | 18 s |
| `Scene2` | Step 3: trim the video on the beat (count four 8s, press Out on the 4 of the fifth 8) | ~39 s (derived from BPM) |
| `Scene3` | Step 4: record the actions (Rec, pause at the peak, say it, click the cell, 0.3 s rule, last 2 s) | ~49 s |
| `Scene4` | Step 5: export audio → text, export the trimmed video | ~20 s |
| `Scene5` | Step 6: upload both files, press Done + personal code, recap | ~27 s |
| `FindDancer` | Separate phone tutorial: find a Norway-based dancer via tagged videos, copy the link, crop a screenshot, add it to Video Vault (`npm run render:find`, settings in `src/finder/config.ts`) | ~63 s |
| `Full` | All scenes back to back (Studio preview) | |

```bash
npm install
npm run studio          # preview in Remotion Studio (http://localhost:3000)
npm run render          # out/scene1.mp4
npm run render:scene2   # out/scene2.mp4
npm run render:scene3   # out/scene3.mp4 (and scene4, scene5)
npm run full            # joins out/scene1-5.mp4 into out/full.mp4 (needs ffmpeg)
```

## What to edit

- `src/config.ts`: Scene 1 timings (seconds), captions and on-screen text.
- `src/scene2/config2.ts`: Scene 2 **BPM, first-beat time, speed of each 8, which count to press Out on, replay speed, captions, step indicator, audio files**. All beat times, caption times and the scene length are calculated from these in `src/scene2/timeline.ts`.
- `src/scene3/config3.ts`: Scene 3 dance moves (video time of each peak, what you say, which dancer), pacing of the first (slow) and later (fast) actions, the 0.3 s rule, tip card, captions. Target cells are computed from where the body part really is.
- `src/scene4/config4.ts`, `src/scene5/config5.ts`: Scene 4/5 timings, page texts, captions, recap cards.
- `src/gp/`: Grid Player after trimming (grid overlay, beat strip, RECORD card), dancers, "Your files" tray.
- `src/shared.tsx`: step indicator (STEP n OF 6), camera, cursor, click ripple and caption style shared by both scenes.
- `src/ui.tsx`, `src/scene2/App2.tsx`: the browser window and Grid Player UI (colors from `app/grid.css`).
- `src/scene2/overlays.tsx`: beat track, count display, 3D 8-count blocks, keycaps, spotlight.

## Audio

`public/audio/kick.wav` (every beat) and `kick-accent.wav` (every count "1") are synthesized by `npm run kicks` (royalty-free).
Swap them for your own files, or point `audio` in `config2.ts` somewhere else.

The Inter font is bundled in `public/fonts`, so rendering works offline.
