// Scene 4: export your files. All times are scene seconds.
export const CONFIG4 = {
  step: {step: 5, title: "Export your files"},
  recordedTime: 44.0, // shown on the stopped Rec timer
  lastCell: "M7",
  lastV: 5.6,

  t: {
    fadeIn: 0.8,
    ready: 1.4, // Export audio turns from pale to solid blue
    shine: 2.3,
    audioClick: 4.0,
    toTextPage: 4.4, // switch to the "Audio to text" page
    transcribeClick: 6.0,
    lines: [6.7, 7.5, 8.3], // transcript lines appear
    transcriptFile: 9.0, // transcript.txt appears on the page
    transcriptFly: 9.5, // …and flies into the tray
    backToPlayer: 10.7,
    trimClick: 11.9,
    trimProgress: [12.0, 13.7] as const,
    videoFly: 13.8,
    both: 14.9,
    fadeOut: 18.6,
    end: 19.8,
  },

  textPage: {tabTitle: "Audio to text", url: "audio-to-text.example", fileName: "recording.webm", fileInfo: "0:44 · 1.2 MB"},

  captions: {
    ready: "Export audio turns blue when you're ready",
    text: "Turn your recording into text",
    trim: "Export the trimmed video too",
    both: "You need both files",
  },
};
