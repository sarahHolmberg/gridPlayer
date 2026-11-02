// Scene 3: record the actions. Times in SECONDS. Most moments are derived in timeline3.ts.
import type {Move} from "../gp/dancers3";

export const CONFIG3 = {
  step: {step: 4, title: "Record the actions"},

  // Dance moves in the video (video time of the PEAK of each move). `say` = what you say into the mic.
  // `record: false` = a move that is too close to the previous one (used for the 0.3 s rule).
  actions: [
    {kind: "handsUp", v: 2.468, dancer: 0, say: "hands up", record: true},
    {kind: "stepLeft", v: 4.1, dancer: 1, say: "step left", record: true},
    {kind: "spin", v: 4.25, dancer: 3, say: "spin", record: false},
    {kind: "jump", v: 5.6, dancer: 2, say: "jump", record: true},
  ] as (Move & {say: string; record: boolean})[],
  minGap: 0.3, // seconds between actions

  // Scene moments
  fadeIn: 0.8,
  recClick: 2.0,
  playClick: 5.6,
  playStartV: 0.4, // video time when play is pressed
  // First action is explained slowly, the others quickly (seconds per phase)
  slow: {pause: 2.6, say: 2.4, gap: 1.1, click: 3.2, resume: 1.0},
  fast: {pause: 0.6, say: 1.2, gap: 0.6, click: 1.3, resume: 0.7},
  rule: 6.2, // the 0.3 s rule
  tip: 3.6, // "stepping away?" tip card
  endZone: 4.2, // last 2 seconds
  recapDur: 5.2,
  fadeOut: 1.2,

  captions: {
    rec: "Press Rec first. It records your voice",
    play: "Play the video and watch for an action",
    pause: "Pause at the peak of the action",
    say: "Say 'Action', then the action, clearly",
    gap: "Brief pause before clicking",
    click: "Click the cell where the action is",
    repeat: "Repeat for every action",
    rule: "Keep at least 0.3 s between actions",
    tip: "You can pause the recording anytime",
    end: "Stop 2 seconds before the end",
    recap: "That's the whole rhythm",
  },
  tipCard: {title: "Stepping away?", text: "You can pause the recording. Your work so far is kept."},
  endZoneLabel: "Last 2 s: no actions needed",
  recap: ["Rec", "Play", "Pause at peak", "Say it", "Click cell", "Repeat (≥ 0.3 s apart)"],
  startCell: "O5", // shown in the footer before the first click
};
