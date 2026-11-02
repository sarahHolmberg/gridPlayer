// Scene 2: trimming the video on the beat.
// Everything you are likely to want to change lives here. Times are in SECONDS.
// The beat times, scene length and most caption times are DERIVED from these values (see timeline.ts).

export const CONFIG2 = {
  // ── Music ──
  bpm: 120,
  firstBeat: 6.0, // video time (s) of BEAT 1, where you start counting
  listenLead: 2.0, // seconds of video that play before BEAT 1 ("listen for the first beat")
  // Speed of the TUTORIAL (not the app) for each 8. Index 0 = 8 #1 … index 3 = 8 #4.
  // 2 = shown fast-forwarded with a "⏩ 2x" badge; counts stay correct.
  eightSpeeds: [1, 2, 2, 1],
  fullEights: 4, // count this many full 8s…
  outCount: 4, // …then press Out on this count of the next 8

  // ── Scene beats (seconds of the scene) ──
  fadeIn: 1.0,
  playClick: 3.5, // cursor clicks play
  holdAfterOut: 2.6, // pause on the OUT marker before the replay
  replaySpeed: 0.3, // slow-motion replay speed
  replayCounts: 4, // the replay shows the last N counts up to OUT
  replayLead: 0.35, // video seconds shown before the first replayed count
  confirm: 1.8, // "exactly on the 4" moment after the replay
  trim: 4.2, // cursor clicks "Trim & continue" (+ Enter key)
  success: 3.0, // green success state
  fadeOut: 2.4,

  // ── Text ──
  stepIndicator: {step: 3, title: "Trim on the beat"}, // total comes from STEP_TOTAL in shared.tsx
  captions: {
    intro: "Next: trim the video on the beat",
    listen: "Listen for the first beat",
    start: "Start counting here",
    count: "Count four full 8s",
    fifth: "Fifth 8: count 1 2 3 4…",
    out: "…press Out exactly on the 4",
    replay: "Slow replay: Out lands on the 4",
    confirm: "Exactly on the beat",
    trim: "Then press Trim & continue",
    success: "Trimmed on the beat!",
  },
  content: {
    fileName: "sample_dance.mp4",
    videoDuration: 43.651, // seconds, shown in the player and the footer
    videoSize: "1276×720",
  },

  // ── Audio ── (swap these files to use your own sounds)
  audio: {
    kick: "audio/kick.wav",
    accent: "audio/kick-accent.wav", // played on every count "1"
    replayRate: 0.6, // pitch/speed of the kicks during the slow replay
  },
};
