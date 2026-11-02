// Scene 5: upload, then press Done. All times are scene seconds.
export const CONFIG5 = {
  step: {step: 6, title: "Upload and finish"},
  sharePage: {tabTitle: "Upload files", url: "files.example/upload", shareLink: "https://files.example/collection/2e1f…"},
  code: "••••••", // what the personal code field shows
  modalLink: "https://f-d.app/https://www.instagram.com/reel/AbC123xYz/?igsh=example",
  nextLink: {name: "Sample User 2", linkLines: ["f-d.app ›", "instagram.com/reel/", "XyZ987aBc/?", "igsh=example"]},
  waitingFrom: 14,

  t: {
    fadeIn: 0.8,
    grab: 2.2, // cursor grabs both files in the tray
    dragDur: 1.4,
    drop: 3.9,
    uploads: [[4.1, 5.0], [4.1, 6.6]] as [number, number][], // progress start/end for transcript, video
    mistake: 7.4, // split view
    mistakeEnd: 12.0,
    toPlayer: 12.0,
    doneClick: 13.4,
    modal: 13.6,
    focus: 14.4,
    typing: [14.8, 16.0] as const,
    removeClick: 16.9,
    dissolve: 17.4,
    flip: 17.9,
    recap: 20.4,
    fadeOut: 26.0,
    end: 27.2,
  },

  recap: [
    {icon: "download", label: "Download"},
    {icon: "scissors", label: "Trim on the beat"},
    {icon: "rec", label: "Record actions"},
    {icon: "export", label: "Export audio + video"},
    {icon: "upload", label: "Upload both"},
    {icon: "done", label: "Done + code"},
  ],

  captions: {
    upload: "Upload both files here",
    mistake: "Only press Done after BOTH are uploaded",
    done: "Then press Done",
    code: "Enter your personal code",
    next: "Done! On to the next video",
    recap: "That's the whole workflow",
  },
};
