import {Composition} from "remotion";
import {Scene1} from "./Scene1";
import {Scene2, SCENE2_FRAMES} from "./scene2/Scene2";
import {CONFIG} from "./config";

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
  </>
);
