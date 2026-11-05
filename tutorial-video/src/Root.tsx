import React from "react";
import {Composition, Series} from "remotion";
import {Scene1} from "./Scene1";
import {Scene2, SCENE2_FRAMES} from "./scene2/Scene2";
import {Scene3, SCENE3_FRAMES} from "./scene3/Scene3";
import {Scene4, SCENE4_FRAMES} from "./scene4/Scene4";
import {Scene5, SCENE5_FRAMES} from "./scene5/Scene5";
import {FinderScene, FINDER_FRAMES} from "./finder/FinderScene";
import {CONFIG} from "./config";

const S1 = Math.round(CONFIG.durationSec * CONFIG.fps);

// All scenes back to back (preview only; out/full.mp4 is made by `npm run full`, which joins the rendered files)
const Full: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={S1}><Scene1 /></Series.Sequence>
    <Series.Sequence durationInFrames={SCENE2_FRAMES}><Scene2 /></Series.Sequence>
    <Series.Sequence durationInFrames={SCENE3_FRAMES}><Scene3 /></Series.Sequence>
    <Series.Sequence durationInFrames={SCENE4_FRAMES}><Scene4 /></Series.Sequence>
    <Series.Sequence durationInFrames={SCENE5_FRAMES}><Scene5 /></Series.Sequence>
  </Series>
);

export const Root = () => (
  <>
    <Composition
      id="Scene1"
      component={Scene1}
      durationInFrames={Math.round(CONFIG.durationSec * CONFIG.fps)}
      fps={CONFIG.fps}
      width={CONFIG.width}
      height={CONFIG.height}
    />
    {/* Scene 2 length is derived from BPM + timings in src/scene2/config2.ts */}
    <Composition
      id="Scene2"
      component={Scene2}
      durationInFrames={SCENE2_FRAMES}
      fps={CONFIG.fps}
      width={CONFIG.width}
      height={CONFIG.height}
    />
    <Composition id="Scene3" component={Scene3} durationInFrames={SCENE3_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
    <Composition id="Scene4" component={Scene4} durationInFrames={SCENE4_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
    <Composition id="Scene5" component={Scene5} durationInFrames={SCENE5_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
    <Composition id="FindDancer" component={FinderScene} durationInFrames={FINDER_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
    <Composition id="Full" component={Full} durationInFrames={S1 + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES + SCENE5_FRAMES} fps={CONFIG.fps} width={CONFIG.width} height={CONFIG.height} />
  </>
);
