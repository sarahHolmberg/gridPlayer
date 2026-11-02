import {Composition} from "remotion";
import {Scene1} from "./Scene1";
import {CONFIG} from "./config";

export const Root = () => (
  <Composition
    id="Scene1"
    component={Scene1}
    durationInFrames={Math.round(CONFIG.durationSec * CONFIG.fps)}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
  />
);
