# Design principles (from the owner: always follow them)

When they conflict, the higher one wins.

1. **As few database and website reads/writes as possible.** Credits on the website are limited. No polling (no
   "check every few seconds"); fetch in batches; piggyback on requests that already happen; only act when the person taps.
2. **One responsibility at a time.** Each screen or step does one thing, with one thing to focus on. This wins over
   "as few steps as possible".
3. **As few steps as possible.** Don't make people click when the app can click for them.
4. **Easy to use, straightforward, hard to get wrong.**
5. **Stay in the same app.** Avoid opening new tabs and outside services, unless it truly can't be avoided
   (e.g. the AI app for Parrot).

# Working rules

- The owner is not technical: explain in plain words.
- Never put codes, keys or passwords in the code (the repos are public). Secrets live in Netlify / Cloud Run settings or the
  database (Code adder page). The inbox key never goes into the Grid Player or any browser code.
- Website (newStudioMirrorsback) changes go to the test branch first, with how to test (`npm run preview`);
  they go to main only when the owner says "put on main" / "push to main".
