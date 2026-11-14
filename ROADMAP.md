# Fact Flight — Product & Development Roadmap

**Vision:** *Little practice. Big confidence.* A free, account-free, family-friendly learning app that opens instantly on a phone, tablet, or computer. Practice should fit into real life: five minutes at a sibling's practice, a waiting room, or around the kitchen table.

**Current stable baseline:** `v5.0` on `main` (multiplication fact fluency). **Development branch:** `v6-development`. All milestones below are proposed scope, not promised dates.

**Scope revision — 2026-11-14:** At the owner’s direction, the v6 program now includes optional profiles, Guest, export/import, separate local progress, expanded math activities and levels alongside the new app interface. These are incremental milestones within v6, not deferred behind the former v6.0/v6.1 boundary. See the [experience plan](docs/v6-experience-plan.md), [activity/level matrix](docs/v6-activity-matrix.md), and [clickable design preview](design-reference/ui-v6/v6-experience-preview.html). The preview is a disposable design artifact, not integrated app functionality.

**Implementation order revision — 2026-11-14:** At the owner's request, integrate the reviewed math activities into the working `index.html` first for testing at the normal Netlify address. The uncommitted interim Home has been set aside. Learner-first Home will follow phone review using the supplied desktop/mobile reference images. The math integration is implemented locally with verification in [the math integration record](docs/v6-math-integration-verification.md); this does not complete Focus, stream-based modes, profiles, or the full v6 program.

## 1. Non-negotiable product principles

1. **Zero-friction start.** No account, email, subscription, ad, mandatory onboarding, daily streak, or forced lesson path.
2. **Useful in 30 seconds.** Open → choose an activity → pick a small amount → start. Remember the last choices, but let anyone switch quickly.
3. **One app for many ages.** Toddlers get touch-first pictures and sounds; older kids get fluency, typing, and voice practice.
4. **Private by default.** Results remain on the device unless a parent deliberately exports them. Profiles use optional nicknames; never require a child's real name.
5. **Parent-controlled, child-friendly.** Settings and detailed reports are available but never block a quick practice session.
6. **Do not break what works.** Keep the verified v5 microphone behavior, timers, original math test, analytics, and browser compatibility.
7. **Free and maintainable.** Prefer a static GitHub Pages site with HTML/CSS/JavaScript and local data. No paid backend required.

## 2. The experience: from scrolling worksheet to an app-like interface

### Landing screen (all devices)

- Four main destinations: **Math**, **Letters & Sounds**, **Colors & Shapes**, and **Reading**. Show only available modules; label future modules clearly rather than showing dead buttons.
- A prominent **Quick Practice** path: select **5, 10, 15, or 20 questions/cards**; optionally repeat the last activity with one tap.
- Optional student selection: **Guest** works immediately; local nicknames can be selected or added later.
- Minimal navigation: Home, Practice, Progress, and a tucked-away Parent/Settings area.

### Phone: focused, minimal-scroll practice

- **One active prompt/card per screen**, not a long page of rows. Large equation, word, color, picture, or letter is centered.
- Fixed, thumb-friendly answer area: custom numeric keypad for math, multiple-choice/tap options for preschool, and voice where appropriate.
- Visible but compact progress (e.g., `3 / 10`), timer when enabled, and a clear Skip/Undo option.
- Automatically advance after a correct answer; provide gentle feedback for errors. No navigating/scrolling to find the active question.
- Avoid obscuring the prompt with the keyboard, browser bars, or iPhone safe-area/home indicator. Support portrait and landscape.
- **School Worksheet view** remains optionally available, but **Focus view** is the phone default.

### Tablet: adaptive practice

- In portrait, favor the same focused-card experience as phones, with larger buttons and artwork.
- In landscape, use more horizontal space for a card + answer pad or an optional worksheet overview.
- Large targets for young children; no tiny controls or unnecessary scrolling.

### Desktop: two complementary views

- **Focus view** for fast individual questions and activities.
- **Worksheet view** for the familiar 60-fact, three-column school assessment. Preserve the tested voice auto-scroll and inline keyboard behavior here.

### App-like browser delivery

- Add a **Progressive Web App (PWA)** manifest, icons, and standalone/home-screen presentation so the site feels native when installed.
- Add an update indicator so families know when a newer release is available; ensure updating does not wipe stored progress.
- Add offline caching of the app shell, basic facts, images, and approved audio where practical. **Browser speech recognition may still require network access.**
- Keep normal browser access fully supported; installation is always optional.

## 3. Practice modes (shared across subjects)

| Mode | Experience | Default use |
|---|---|---|
| **Quick Practice** | **5 / 10 / 15 / 20** questions or cards; no required timer | Waiting rooms, practices, short breaks |
| **Free Practice** | Continue at your own pace, with optional pause/finish | Learning a new concept |
| **Timed Practice** | Choose a duration and set of facts | Building speed after accuracy |
| **School Test** | Preserve **60 multiplication facts / 2 minutes / 3 columns**, with a focused-screen option on mobile | Rehearsing the actual classroom assessment |
| **Smart Review** *(later)* | More frequent practice of missed or slow items | Strengthening weak spots |
| **Game Mode** *(later)* | Short challenges, animations, and gentle rewards | Fun without pressure or streaks |

For every mode, support **Tap/Keypad** as a reliable input. Offer **Voice** only when the activity and browser support it; never make voice mandatory.

## 4. Subject library

| Subject | First activities | Interaction / feedback |
|---|---|---|
| **Math** | Addition, subtraction, multiplication, division; choose fact family/range; whole-number problems initially | Voice or keypad; accurate first-try and timing analytics |
| **Letters & Sounds** | Uppercase/lowercase letter recognition; letter name; phonics sound; letter-to-picture association | Tap, listen, match; very large controls |
| **Colors & Shapes** | Identify and match colors; recognize common shapes; select a requested item | Tap choices, picture feedback, spoken prompt |
| **Reading** | Sight-word cards, word recognition, beginner spelling, word-to-picture matching | Listen, flip/reveal, tap, optionally type or speak |
| **Future library** | Counting, numbers, patterns, time, money, vocabulary, geography | Reuse the same card/quiz engine |

**Audio design:** Spoken instructions and word examples can use browser text-to-speech as an initial implementation, but **letter phonemes should use curated, accurate audio**. A letter *name* is not the same as its phonetic *sound*. Images and audio must be properly licensed or original.

## 5. Release roadmap

### v5.0 — Stable baseline (complete)

- Verified multiplication worksheet, two-minute test and free practice, speech recognition, custom mobile keypad, auto-scroll, light/dark theme, local analytics and exports.
- Tagged GitHub release gives us a known working version to restore.

### v6 — Complete math and family experience (CURRENT PROGRAM)

**Build:**
- New responsive, app-like home/navigation shell and **Focus view** (default on phones/tablets).
- **Quick Practice: 5, 10, 15, 20** items, plus existing free/timed practice.
- Addition, subtraction, multiplication, division, number bonds, doubles, halves, and squares; descriptive levels and selectable ranges/fact families. Starter problems use nonnegative whole-number answers. Exact level boundaries remain proposed in the activity matrix.
- Quick, free, timed, and configurable challenge modes; explicit skip/revisit, finish, results, and return-Home behavior.
- Keep the **original 60-question / two-minute multiplication School Test** as a distinct mode.
- Reuse existing microphone, keypad, scoring, and progress mechanisms; adapt their presentation without unnecessarily rewriting their proven core logic.
- Clear return-to-home and end-session actions; no scrolling to answer.

**Done when:** Users can start the agreed math activities and levels in a few taps, complete Quick Practice in mobile Focus View, and still run the original multiplication test with equivalent scoring and voice behavior. Optional learners have distinct progress, Guest works immediately under the approved retention policy, backups restore correctly, and existing v5 history survives. All required release/device regression gates pass.

**Implementation sequence:** approve the experience design → integrate Home/navigation → shared Focus/Worksheet presentation → modes → backup-safe profiles/local progress → expanded activity library → full validation. Brand foundation is implemented and owner-accepted; this does not mark the complete v6 program finished.

### Within v6 — Family usability + reliable local progress

**Build:**
- Optional **Guest** and multiple **local student nicknames**; one-tap switching.
- Separate progress per student, subject, and mode; parent-friendly view of missed facts, time, and improvement.
- **Import and export** of data (not just export), plus documented backups.
- Versioned data schema and migration of `fact-flight-history-v1` **without deleting or mixing existing records**.
- Guest retention and legacy ownership must be explicitly approved; do not silently discard or assign existing account-free history.

**Separate later delivery milestone:** PWA installation polish, update notice, and basic offline caching for non-voice activities. These do not block reviewing the math/family design and require their own validation.

**Done when:** Multiple children can use one device without mixing scores, while guests can practice immediately. Previously saved sessions still display correctly.

### v6.2 — Early learning: letters, sounds, colors, and shapes

**Build:**
- Big **A / a** cards, pictures, letter names, and curated letter sounds.
- Colors and shapes with touch-to-answer and listen-and-choose activities.
- Parent-led flashcard mode plus optional child-led tap mode; no timers by default.
- Quick Practice works with **5 / 10 / 15 / 20 cards**, not just math.

**Done when:** A two-year-old can participate with a parent using large cards, clear sounds, minimal reading, and no fine-motor demands.

### v6.3 — Early reading and sight words

**Build:**
- Beginner sight-word decks, reveal/flip cards, spoken examples, and short matching exercises.
- Optional spelling/typing for older children.
- Local progress by deck; simple parent view of words needing review.

**Done when:** A parent can open a 10-word session in seconds without creating an account or preparing physical cards.

### v6.4 — Playful practice + smarter review

**Build:**
- Optional short game modes (e.g., friendly missions, picture reveals, stars earned *during a session*).
- Target frequently missed or slow facts/words; keep scoring transparent and allow manual choice instead.
- No daily streak pressure, notification campaigns, premium currency, or ads.

**Done when:** Games increase enjoyment without becoming a requirement to access practice or reports.

### v7+ — Content expansion (only if useful)

- More flashcard packs (counting, clocks, money, vocabulary, science, geography).
- Parent-created card decks or importing a simple CSV/JSON list.
- Optional shareable content packs **without** sharing children's progress.
- Consider any cloud sync only if families genuinely need it; keep local-only mode available.

## 6. Technical foundation to avoid rebuilding each subject

Use one shared **activity engine** rather than independent pages for each subject. Each activity defines:

- **Content:** problem/card, answer(s), image/audio, difficulty/fact group.
- **Presentation:** focused card, worksheet, multiple choice, matching, flashcard reveal.
- **Input:** keypad/keyboard, tap, voice when supported.
- **Feedback:** correct, retry, reveal, skip, encouraging audio/animation.
- **Results:** student (optional), subject, activity, attempts, correctness, timing, and local date.

Keep content separate from presentation. Example: the same letter card can be shown in normal practice, Quick Practice, or a matching game without duplicating the lesson.

**Data/privacy safeguards:** Local storage remains the default; do not introduce accounts or remote analytics by accident. Avoid storing unnecessary raw speech transcripts, especially for children. Add storage export/import before migrating to more complex profiles. The GitHub Pages and Netlify test sites will remain separate storage origins.

## 7. Development, testing, and release process

1. Keep **`main` = stable production**, currently tagged `v5.0`.
2. Build in **`v6-development`**; avoid committing untested features to `main`.
3. Test on Netlify or a separate preview deployment. Verify **Windows Chrome, iPhone Safari, iPhone Chrome**, and eventually **Android Chrome and tablets** (Android not yet verified).
4. For each release, test voice, keypad/touch, scrolling/focus, timer, screen rotation, session history, and clearing/reloading the page. Test offline mode separately once added.
5. Before migration, export existing v5 history; test upgrade with a copy of real saved data.
6. Merge a reviewed/tested version into `main`; verify production; then create the matching version tag/release.

**Release rule:** No update should remove the ability to open Fact Flight and start multiplication practice immediately. Every module should also have a clear keyboard/touch fallback when voice recognition is unavailable.

## 8. Priority order and what NOT to build yet

**Now:** Design and incrementally implement the complete v6 math/family experience: Home/navigation, Focus/Worksheet, Quick/Free/Timed/Challenge modes, original School Test, optional profiles/Guest, safe backups/import, separate progress, and expanded math activities with levels.

**Next within v6:** follow the experience-plan milestones; implement backup-safe local profiles before connecting the expanded activity library. PWA/offline reliability remains a separate later milestone.

**After that:** toddler flashcards and sounds, sight words, games, and personalized review.

**Deliberately deferred:** Mandatory accounts, subscriptions, advertising, cloud databases, social features, daily streaks, and complicated curricula. These conflict with the simple family-use goal.

## 9. How we will judge success

- A parent can hand the phone to a child and start a 5-question practice with minimal taps.
- A toddler can use letter/color cards with a parent without reading instructions.
- The app remains usable on a phone without vertical scrolling during a focused activity.
- The original school-style multiplication test still works and existing progress is safe.
- Every activity has a useful non-microphone input; speech remains an enhancement.
- No child or parent must register, pay, or surrender personal information to use the core application.

---

*This document is a living product roadmap. Add discoveries and adjust release boundaries on `v6-development`; preserve the stable v5 release as a fallback.*
