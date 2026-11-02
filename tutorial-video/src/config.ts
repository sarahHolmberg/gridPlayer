// Everything you are likely to want to change lives here.
// All times are in SECONDS from the start of the video.

export const CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationSec: 18,

  // Text shown inside the fake browser / app
  content: {
    tabTitle: "Grid Player",
    url: "gridplayer.app",
    appTitle: "Grid Player",
    name: "Sample User",
    // The blue link, one entry per line (wrapped like in the app)
    linkLines: ["f-d.app ›", "instagram.com/reel/", "AbC123xYz/?", "igsh=example"],
    waiting: "14 more waiting",
    allLinks: "All links (15)",
    footer: "No video loaded · Grid 20×20 (A1–T20)",
    footerLoaded: "sample-reel.mp4 · Grid 20×20 (A1–T20)",
    fileName: "sample-reel.mp4",
    fileSize: "4.2 MB",
    toast: "Download complete",
  },

  timing: {
    fadeIn: [0, 1] as const,
    pushIn: 0, // camera push-in starts (lasts ~2s)

    // Step 1: the link
    cursorAppear: 2.0,
    cameraToSidebar: 2.0,
    cursorToLink: 2.3,
    linkHighlight: 3.6,
    click: 5.0,

    // Download
    cameraToDownload: 6.0,
    cursorToDownload: 6.0,
    progress: [6.6, 9.8] as const, // ring fills between these two times
    complete: 10.0, // glow + shine
    toast: 10.2,

    // Step 2: drag & drop
    cameraToFull: 12.0,
    cursorToFile: 12.2,
    grab: 13.0,
    drag: 13.2, // drag movement starts (lasts ~1.6s)
    dropHover: 14.1, // drop box starts highlighting
    drop: 15.0,

    fadeOut: [16, 18] as const,
  },

  // Lower-third captions. `step` is the small chip label (or null for none).
  captions: [
    {from: 2.4, to: 5.9, step: "Step 1", text: "Click the next link to download the video"},
    {from: 6.4, to: 11.7, step: null, text: "Wait for the download to finish"},
    {from: 12.4, to: 16.2, step: "Step 2", text: "Drop the video into the player"},
  ] as {from: number; to: number; step: string | null; text: string}[],
};

export const sec = (s: number) => Math.round(s * CONFIG.fps);
