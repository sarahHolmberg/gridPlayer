// "Find a dancer and add their video": a phone tutorial. All accounts are made up.
// Durations are in SECONDS; each step starts when the previous one ends (see STEPS in FinderScene.tsx).

export type Thumb = {kind: "studio" | "stage" | "outdoor"; people: number[]; v?: number};

export const FINDER = {
  steps: {
    intro: 2.2,
    profile: 3.4, // start account → Tagged
    pick: 3.0, // pick a video with several dancers
    tags: 4.0, // tag icon → open a tagged dancer
    fail: 4.8, // not in Norway → back
    ok: 5.6, // another dancer: Norway ✓
    browse: 6.6, // training video with 2+ people
    share: 4.6, // Share → Copy link
    shot: 7.2, // screenshot, crop to the account person
    site: 7.6, // Video Vault: name + link + Submit
    pic: 6.6, // add the cropped picture, Send
    recap: 6.0,
    fade: 1.0,
  },

  accounts: {
    start: {
      user: "dance.studio.example", name: "Sample Dance Studio", look: -1, counts: ["102", "2 381", "640"],
      bio: ["Dance studio · open classes", "Tag us in your videos!"],
    },
    fail: {
      user: "jay.dances.uk", name: "Jay Sample", look: 0, counts: ["58", "1 204", "377"],
      bio: ["Dancer & choreographer", "📍 London, UK 🇬🇧", "Classes every Thursday"], clue: [1],
    },
    ok: {
      user: "nora.moves", name: "Nora Sample", look: 2, counts: ["211", "3 960", "512"],
      bio: ["Danser og koreograf 🇳🇴", "📍 Oslo", "Trener på Sample Dansestudio"], clue: [0, 1, 2],
    },
  },
  thirdTag: "sam.groove",

  // posts
  startPosts: [
    {kind: "studio", people: [1, 3]}, {kind: "studio", people: [0]}, {kind: "outdoor", people: [3]},
    {kind: "stage", people: [0, 1, 3]}, {kind: "studio", people: [1]}, {kind: "outdoor", people: [0, 1]},
  ] as Thumb[],
  tagged: [
    {kind: "outdoor", people: [1]}, {kind: "studio", people: [0, 2, 3]}, {kind: "studio", people: [3]},
    {kind: "stage", people: [1, 3]}, {kind: "outdoor", people: [0, 3]}, {kind: "studio", people: [1]},
  ] as Thumb[],
  pickIndex: 1,
  okPosts: [
    {kind: "stage", people: [3, 2, 1]}, {kind: "outdoor", people: [2]}, {kind: "studio", people: [2, 1]},
    {kind: "studio", people: [2]}, {kind: "stage", people: [2]}, {kind: "outdoor", people: [2, 0]},
  ] as Thumb[],
  // what the checks say about okPosts[0..2]
  verdicts: [
    {ok: false, text: "Show / edited"},
    {ok: false, text: "Only 1 person"},
    {ok: true, text: "Training, 2 people"},
  ],
  chosenIndex: 2,

  link: "https://www.instagram.com/reel/AbC123xYz/",
  siteUrl: "studiomirrors.netlify.app",

  checklist: [
    "A video where several people dance",
    "The tagged dancer lives in Norway 🇳🇴",
    "A training video (not a show, not edited)",
    "At least 2 people in it",
    "Link copied",
    "Picture cropped to just them",
    "Added to Video Vault",
  ],

  stepTitles: [
    "Go to the tagged videos", "Check: Norway-based?", "Pick a training video",
    "Copy the link", "Screenshot and crop", "Add it to Video Vault",
  ],

  captions: {
    intro: "Find a Norway-based dancer and add their video",
    profile: "Open the account, go to Tagged",
    pick: "Pick a video with several dancers",
    tags: "Tap the tag icon, open a tagged dancer",
    fail1: "Check: do they live in Norway?",
    fail2: "Not in Norway? Go back, try another",
    ok: "Norway-based: keep going",
    browse: "Find a training video with 2+ people",
    share: "Share → Copy link",
    shot: "Screenshot, then crop to just them",
    site: "Name = account name, then paste the link",
    pic: "Add the cropped picture, then Send",
    recap: "Done! Repeat with the next dancer",
  },

  callouts: {
    fail: "Bio says London, UK: not in Norway. Go back and try another tagged dancer.",
    clues: ["📍 A city in Norway", "🇳🇴 Norwegian flag", "Norwegian words in the bio", "Norwegian studios or teams"],
    browse: ["Plain studio, like a class", "At least 2 people", "Not a show, not edited"],
    match: "Crop to the person who owns the account: match the profile picture.",
    name: "Type the account name exactly as it is:",
  },

  recap: ["Tagged videos", "Norway-based?", "Training video, 2+ people", "Copy link", "Screenshot + crop", "Name, link, picture → Send"],
};
