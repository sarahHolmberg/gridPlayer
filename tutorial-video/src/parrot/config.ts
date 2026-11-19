// "Parrot: how to do a task" — phone tutorial. Scene lengths in SECONDS; each scene starts when the previous one ends.
// The on-screen texts copy the real Parrot app (remotionSarah: app/parrot.tsx).

export const PARROT = {
  scenes: [
    {key: "intro", dur: 9.0, title: "What this job is",
      voice: "Each card in Parrot is one task. You pass it through an AI and back. You never need to read anything. Just follow the buttons."},
    {key: "open", dur: 9.0, title: "Open Parrot",
      voice: "Open Parrot. It shows one task at a time. The number at the top tells you how many are waiting."},
    {key: "copy", dur: 4.6, title: "Copy",
      voice: "Tap Copy for AI. Everything the AI needs is now copied."},
    {key: "ai", dur: 6.4, title: "Open your AI",
      voice: "Tap Open ChatGPT. Prefer Claude or Gemini? Pick it once, and Parrot remembers."},
    {key: "paste", dur: 6.0, title: "Paste and send",
      voice: "Paste into a new chat and send. Wait for the AI to finish."},
    {key: "answer", dur: 4.4, title: "Copy the answer",
      voice: "Tap the copy button under the AI's answer."},
    {key: "back", dur: 5.0, title: "Back to Parrot",
      voice: "Go back to Parrot and tap Paste the answer."},
    {key: "send", dur: 8.0, title: "Done, by itself",
      voice: "Parrot checks it for you. When it's good, it sends by itself in three seconds. Tap Cancel if you need to stop it."},
    {key: "next", dur: 5.0, title: "The next one is already there",
      voice: "The next task appears straight away. Repeat. That's the whole job."},
    {key: "fix", dur: 14.0, title: "If it needs a fix",
      voice: "Sometimes the AI makes a mistake. Parrot tells you. Tap Copy fix request, paste it into the same chat, copy the new answer, and paste it in Parrot again. No typing, no reading."},
    {key: "tips", dur: 16.5, title: "Good to know",
      voice: "Something looks off? Tap Skip this one, and it goes to the back of the line. A task you open is kept for you for fifteen minutes, so nobody else does the same one. When nothing is waiting, you'll see a party popper, and new tasks appear by themselves."},
    {key: "recap", dur: 7.0, title: "Recap",
      voice: "Copy, open, paste, copy, paste. About thirty seconds per task. Parrot does the rest."},
  ],
  fade: 1.0,

  names: ["Golden Pelican", "Sleepy Llama"],
  waiting: 3,
  ai: "ChatGPT",
  captionsCount: 16,
  tagUser: "sample.user",

  taps: ["Copy for AI", "Open ChatGPT", "Paste and send", "Copy answer", "Paste the answer"],
  fixLoop: ["Copy fix request", "Paste in the same chat", "Copy the new answer", "Paste the answer"],
  tips: [
    {icon: "skip", title: "Something looks off?", text: "Tap Skip this one: it goes to the back of the line."},
    {icon: "lock", title: "Kept for you", text: "A task you open is held for you for 15 minutes, so nobody else does it."},
    {icon: "party", title: "Nothing waiting?", text: "You'll see a 🎉. New tasks appear by themselves."},
  ],
  recapLine: "About 30 seconds per task. Parrot does the rest.",
};
