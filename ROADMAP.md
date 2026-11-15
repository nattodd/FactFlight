# Fact Flight — Product & Development Roadmap

**Vision:** *Little practice. Big confidence.* A free, account-free, family-friendly learning app that opens instantly on a phone, tablet, or computer. Practice should fit into real life: five minutes at a sibling's practice, a waiting room, or around the kitchen table.

**Approved stable release:** `v6.0.0` on `main`. **Rollback baseline:** `v5.0` (multiplication fact fluency). **Development branch:** `v6.1-development`. All milestones below are proposed scope, not promised dates.

**Scope revision — 2026-11-14:** At the owner’s direction, the v6 program now includes optional profiles, Guest, export/import, separate local progress, expanded math activities and levels alongside the new app interface. These are incremental milestones within v6, not deferred behind the former v6.0/v6.1 boundary. See the [experience plan](docs/v6-experience-plan.md), [activity/level matrix](docs/v6-activity-matrix.md), and [clickable design preview](design-reference/ui-v6/v6-experience-preview.html). The preview is a disposable design artifact, not integrated app functionality.

**Implementation order revision — 2026-11-14:** At the owner's request, integrate the reviewed math activities into the working `index.html` first for testing at the normal Netlify address. The uncommitted interim Home has been set aside. Learner-first Home will follow phone review using the supplied desktop/mobile reference images. The math integration is implemented locally with verification in [the math integration record](docs/v6-math-integration-verification.md); this does not complete Focus, stream-based modes, profiles, or the full v6 program.

**Focus increment:** After successful owner voice/math testing, Focus/Worksheet presentation is integrated locally for all activities, including School Test. Both render the existing session model; history schemas are unchanged. See [Focus verification](docs/v6-focus-verification.md). Physical-device review of this new presentation remains pending; learner-first Home is still deferred.

**Approved menu increment — 2026-11-14:** The owner approved the account-free tile Home and guided menu mockup, with Free Practice continuing until Finish. These are now integrated locally, including Quick Practice across all activities, disabled Coming Soon subjects, and guarded Home navigation. Optional learner profiles remain subsequent work; this supersedes the earlier plan to require a learner-first Home now. Verification and remaining device checks are recorded in [menu integration verification](docs/v6-menu-integration-verification.md).

**Readability acceptance — 2026-11-14:** The larger-text update (`7e93dc1`) is owner-accepted on physical iPhone Chrome and Safari after 43 automated checks. This is visual/readability acceptance, not a new exhaustive device regression pass. Next proposed increments are branded Home Screen icons, learner-selection Home, and backup-safe local profiles. See [the next-phase plan](docs/v6-profiles-home-plan.md). Icon metadata is brought forward; offline caching and update handling remain separate.

## Current release status — v6.0.0 published

Version `v6.0.0` is published from main commit `6cff208`, with an annotated tag and GitHub release. Brand, learner Home, eight activities/five levels, Focus/Worksheet, configurable modes, remembered Quick, separate profiles/Guest, management and individual-learner restore are implemented. The audited replay/backup fixes and compact Progress are included. Earlier increment paragraphs below are historical records, not the current release status.

Published files and automated production smoke passed. The owner subsequently confirmed production voice, menus, profile creation/change/deletion, and answer-box feedback; browser/device names were not specified for that report. Earlier full preview regression covered Windows Chrome, iPhone Safari and iPhone Chrome. See [production verification](docs/v6-release-plan.md#completed-production-verification) for the exact scope and remaining unverified coverage.

Full-family backups, old-history assignment, custom fact-family selectors, deeper mode/trend reporting and offline/early-learning work remain proposed follow-ups rather than completed features.

## v6.1 — Approved scope (2026-11-15)

Active development is `v6.1-development`, created from the verified local `v6.0.0` tag / main commit `6cff208`. Production remains v6.0.0. The older v6 implementation notes below are historical context; this section governs the next release.

Approved scope, in implementation order:
1. **G — Configuration and menu persistence:** last actually started settings per learner/activity; preserve the separate Quick shortcut and temporary Guest behavior.
2. **E — One-tap Practice Again:** fresh sessions with the completed flight's compatible settings, preserving voice readiness and history.
3. **F — Next Level:** immediate optional advancement by exactly one numbered level; no action at Level 5 or for non-level presets.
4. **A — Choose Tables:** multiplication tables 1–10, other factors 1–10, compatible modes and existing balanced generation; preserve School Test.

**Deferred:** B (missed-fact practice), C (per-table progress), D (division family selection), and explicit 11/12 table selection. These are not v6.1 commitments.

The configuration/menu increment is implemented locally; verification is recorded in [v6.1 setup verification](docs/v6.1-setup-verification.md). E/F are also implemented locally: same-tab Practice Again and Next Level share the validated configuration and normal voice startup; incomplete historical configurations retain setup review. See [repeat-action verification](docs/v6.1-repeat-verification.md). A is now implemented locally, with automated verification and remaining device checks recorded in [Choose Tables verification](docs/v6.1-tables-verification.md). Owner accepted G/E/F on desktop Chrome (keyboard) and physical iPhone Chrome/Safari; full release regression and unitemized voice checks remain pending. The initial scope approval did not authorize publication. Subsequent owner approval permits one commit/push of the reviewed G/E/F increment for a Netlify Branch Deploy trial; production remains unapproved. See [trial record](docs/v6.1-branch-deploy-trial.md). Complete local checks and physical-device regression before release approval.

**Branch Deploy acceptance — 2026-11-15:** Owner verified `dc155f8` on the successful v6.1 Branch Deploy: direct Practice Again, Next Level, and remembered selections after Home navigation. Owner subsequently specified desktop Chrome with keyboard and confirmed the link and changes work on physical iPhone Chrome and Safari. iPhone input method was not specified; full release regression and unitemized voice checks remain pending. Billing still displays 19 production deploys / 285 deployment credits and 14.7 remaining, with requests increasing from 892 to 903. See the [trial outcome](docs/v6.1-branch-deploy-trial.md#trial-outcome-and-owner-acceptance--2026-11-15). Choose Tables is the subsequent local increment; its new behavior is not covered by this earlier device acceptance. Production is not approved.

**Choose Tables acceptance — 2026-11-15:** Owner confirms `ae6e496` works on desktop Chrome and physical iPhone Chrome/Safari via the Branch Deploy. Input methods and individual regression cases were not specified. This does not complete the full release checklist or authorize production. The owner chose to advance every selected table by one for the subsequent Next Table(s) action (2, 5 → 3, 6), unavailable if any selected table is 10. The owner subsequently verified Next Tables and the corrected selected-table heading on desktop Chrome and physical iPhone Chrome/Safari on the Branch Deploy (`13417bd`) on 2026-11-15. The supplied screenshot shows “Multiplication · Tables 3, 9” during practice. This feature acceptance does not establish a full release regression pass; input methods and individual edge cases were not specified.

**Manual regression acceptance — 2026-11-15:** The owner completed the desktop/iPhone walkthrough across Windows Chrome and iPhone Chrome/Safari. See the [recorded results and exceptions](docs/v6.1-manual-release-checklist.md#completed-owner-walkthrough--2026-11-15). Earlier increment paragraphs below and above describe evidence at their respective stages; the current release gates are in section 5. Production remains unapproved.

## 1. Non-negotiable product principles

**Branded icon increment — 2026-11-14:** Apple touch icon, favicon, and manifest metadata are implemented locally with root/subpath Chrome checks passing. Physical Home Screen acceptance remains pending; see [icon verification](docs/v6-home-screen-icon-verification.md). Offline caching and standalone launch changes remain deferred.

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

### v6.1 — Targeted practice and easier repeat sessions (tested; release preparation pending)

This is the approved G/E/F/A release scope described near the top of this file, plus the owner-approved Next Table(s) follow-up and heading correction. The older v6 program sections above retain their original planning context; they are not additional v6.1 release requirements.

**Implemented and owner-accepted on preview:**
- **G — Configuration/menu persistence:** remember last-started choices per learner/activity, highlight selections, preserve the separate Quick shortcut and temporary Guest behavior.
- **E — Practice Again:** start a fresh flight directly with the same complete settings, preserving learner ownership and voice readiness; older/reloaded flights retain setup review.
- **F — Next Level:** advance exactly one numbered level with compatible settings; stop at Level 5 and exclude School Test/table selections.
- **A — Choose Tables:** multiplication tables 1–10 with other factors 1–10 across Quick, Free, Timed Practice and Custom Test; retain existing levels and School Test.
- **Next Table(s):** increment every selected table by one, show the destination and stop when any selected table is 10.
- Display selected tables in active headings, results, history and exports; preserve selections through repeats. Balanced generation and existing records remain protected.

**Evidence:** Owner acceptance covers desktop Chrome and physical iPhone Chrome/Safari; desktop keyboard was specified for G/E/F, while later input methods and individual regression cases were not itemized. The code at `13417bd` includes the heading correction; `b2db2e6` records acceptance. Automated increment suites passed, including all 1,023 table subsets and 2,356 seeded generation/repeat sequences. Test counts across increments overlap and are not a cumulative certification. See [setup](docs/v6.1-setup-verification.md), [repeat actions](docs/v6.1-repeat-verification.md), [tables and follow-ups](docs/v6.1-tables-verification.md), and [preview acceptance](docs/v6.1-branch-deploy-trial.md).

**Remaining release gates:**
**Automated gate completed — 2026-11-15:** 211 browser checks across 17 suites, 2,356 seeded generator/repeat sequences and all 1,023 table subsets passed against code `13417bd` / docs HEAD `b2db2e6`. Syntax checks passed. See [final regression](docs/v6.1-final-regression.md); physical testing remains separate.

**Manual walkthrough completed — 2026-11-15:** Owner reported all 14 [checklist groups](docs/v6.1-manual-release-checklist.md) passed on Windows Chrome and physical iPhone Chrome/Safari, including real speech/reconnection, blocked-microphone fallback, scoring, timer expiry, backup restore, other math modes and layout/orientation. Fresh permission prompts subsequently passed on all three browsers. The owner explicitly accepted the remaining limitations: genuine legacy history unavailable (synthetic checks passed), Android/tablets unverified and exact manual OS/browser versions unrecorded. Candidate 51c4d47 serves 6.1.0 and passed owner preview smoke checks.

- Local preparation now sets app metadata and its release test to 6.1.0, with [draft notes](docs/v6.1-release-notes.md) and a [promotion/rollback plan](docs/v6.1-release-plan.md). The local branch-to-main scope is reconciled with Unreleased. Keep entries undated until approval, recheck remote tips/final diff before execution, and finalize published wording only through the approved release process.
- The owner reconfirmed no history needs preserving and requires separate rollback approval. Keep the prepared promotion/rollback plan subject to production authorization. Targeted sessions use schema version 2; backups containing them require v6.1, so a v6.0 rollback cannot be treated as fully data-compatible. Do not clear browser storage.
- Hosting is owner-confirmed: GitHub Pages main/root/HTTPS; Netlify production v6-development with v6.1-development as Branch Deploy. Production destination is GitHub Pages; leave Netlify production unchanged. The last supplied Netlify balance was 14.7 credits, not a fresh balance check. No Netlify production change is implied by release preparation.
- Obtain explicit production approval; only then perform the approved promotion, production smoke checks and tag/release publication.

**Deferred, not release blockers:** B (missed-fact practice), C (per-table progress), D (division-family selection), explicit 11/12 table selection, offline/early-learning work and the previously deferred full-family/legacy-assignment features.

**Ready when:** The approved scope has a reconciled release record, the final automated and required manual checks pass with remaining limitations explicitly recorded, and backup/hosting/rollback preparation is reviewable. Feature acceptance alone is not production approval. The final automated regression is now recorded; only documentation changed during that run. No commit, push or deployment was performed.

### v6.2 — Targeted review and mobile setup usability (planned)

Added at the owner’s request after v6.1 testing. This is roadmap scope for design and incremental implementation, not completed functionality or permission to publish. Later planned releases move down: early learning v6.2→v6.3, reading v6.3→v6.4, playful practice v6.4→v6.5. The open-ended v7+ expansion horizon remains longer-term.

**Deferred practice items brought forward:**
- **B — Missed-fact practice:** optional practice from missed facts; define source sessions, correction/skip handling and empty-history behavior before implementation.
- **C — Per-table progress:** define transparent table-level summaries without double-counting reversed or overlapping selected-table facts.
- **D — Division-family selection:** choose targeted division families while retaining the existing levels and scoring.
- **Tables 11/12:** evaluate explicit selection and its factor range, labels, Next Tables endpoint and backward-compatible backups; v6.1 stays at 1–10.

**Next/Continue/Start layout exploration:**
The owner reports that primary setup actions sit at the bottom on iPhone and require scrolling. Explore reducing the scrolling while preserving deliberate selection, readable settings and easy thumb access.

| Option | Benefit | Tradeoff to verify |
|---|---|---|
| Persistent bottom action bar with a compact selection summary | Keeps the primary action reachable while settings scroll; first option to prototype | Must reserve content space and respect the iPhone safe area, browser bars and on-screen keyboard; never cover options or dialogs |
| Primary action near the heading/selection summary | Visible early with no bottom overlay | May require scrolling back up after editing; easier to skip reviewing settings |
| More compact setup and collapsed grown-up options | Reduces page length with ordinary document flow | Must preserve readable text, large touch targets and discoverability; cannot guarantee no scrolling |

Prototype the bottom action bar first, with one visible primary action per step and a clear summary of the chosen tables/count. Keep Continue disabled for empty table selection, preserve validation and Voice ready/cancellation, and avoid duplicate starts. Compare against the existing layout before choosing an implementation. Test small iPhones in Safari/Chrome, portrait/landscape, larger text, VoiceOver/keyboard focus, open keyboard and microphone dialogs; include desktop so the mobile improvement does not degrade it. No app layout change is included in the current documentation update.

**Other deferred work to triage within v6.2 planning:** full-family backup, deliberate Previous progress assignment, and offline/PWA reliability. These are candidates requiring separate design and data-safety decisions, not implied prerequisites or promised deliverables for this release. Keep personal progress local and preserve learner ownership.

**Done when:** agreed targeted-review features and the chosen setup layout pass their own automated and physical-device regression, old history remains safe, and the owner accepts the usability improvement. Final v6.2 scope can be narrowed before implementation; none of this delays v6.1 release preparation.

### v6.3 — Early learning: letters, sounds, colors, and shapes

**Build:**
- Big **A / a** cards, pictures, letter names, and curated letter sounds.
- Colors and shapes with touch-to-answer and listen-and-choose activities.
- Parent-led flashcard mode plus optional child-led tap mode; no timers by default.
- Quick Practice works with **5 / 10 / 15 / 20 cards**, not just math.

**Done when:** A two-year-old can participate with a parent using large cards, clear sounds, minimal reading, and no fine-motor demands.

### v6.4 — Early reading and sight words

**Build:**
- Beginner sight-word decks, reveal/flip cards, spoken examples, and short matching exercises.
- Optional spelling/typing for older children.
- Local progress by deck; simple parent view of words needing review.

**Done when:** A parent can open a 10-word session in seconds without creating an account or preparing physical cards.

### v6.5 — Playful practice + smarter review

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

1. Keep **`main` = stable production**, currently tagged `v6.0.0`.
2. Build in **`v6.1-development`**; avoid committing untested features to `main`.
3. Test on Netlify or a separate preview deployment. Verify **Windows Chrome, iPhone Safari, iPhone Chrome**, and eventually **Android Chrome and tablets** (Android not yet verified).
4. For each release, test voice, keypad/touch, scrolling/focus, timer, screen rotation, session history, and clearing/reloading the page. Test offline mode separately once added.
5. Before migration, export existing v5 history; test upgrade with a copy of real saved data.
6. Merge a reviewed/tested version into `main`; verify production; then create the matching version tag/release.

**Release rule:** No update should remove the ability to open Fact Flight and start multiplication practice immediately. Every module should also have a clear keyboard/touch fallback when voice recognition is unavailable.

## 8. Priority order and what NOT to build yet

**Now:** Design and incrementally implement the complete v6 math/family experience: Home/navigation, Focus/Worksheet, Quick/Free/Timed/Challenge modes, original School Test, optional profiles/Guest, safe backups/import, separate progress, and expanded math activities with levels.

**Next within v6:** complete v6.1 release preparation and explicit approval, then design the v6.2 targeted-review and mobile-action improvements above. Learner Home/profiles, icons, individual-learner backup/restore and configurable modes are implemented. Offline reliability remains a separate later milestone.

**After that:** v6.3 early-learning flashcards and sounds, v6.4 sight words, and v6.5 playful practice.

**Deliberately deferred:** Mandatory accounts, subscriptions, advertising, cloud databases, social features, daily streaks, and complicated curricula. These conflict with the simple family-use goal.

## 9. How we will judge success

- A parent can hand the phone to a child and start a 5-question practice with minimal taps.
- A toddler can use letter/color cards with a parent without reading instructions.
- The app remains usable on a phone without vertical scrolling during a focused activity.
- The original school-style multiplication test still works and existing progress is safe.
- Every activity has a useful non-microphone input; speech remains an enhancement.
- No child or parent must register, pay, or surrender personal information to use the core application.

---

*This document is a living product roadmap. Add discoveries and adjust release boundaries on `v6.1-development`; preserve v6.0.0 as the release baseline and v5.0 as an older fallback.*

**Learner Home review — 2026-11-14:** Owner accepted the branded icon and app launch from the physical iPhone Home Screen. The [learner Home mockup](design-reference/ui-v6/v6-learner-home-preview.html) is ready for design review. It uses memory-only sample profiles/results; real learner storage, Guest retention, and data migration remain unimplemented.

**Learner integration — 2026-11-14:** The reviewed learner Home is now integrated locally with nickname creation/selection, profile-owned new flights, learner-filtered results/exports, and temporary non-saving Guest use. Existing history remains unchanged under Previous progress. Owner confirmed there is no current history requiring backup; synthetic legacy copies are used for compatibility checks. See [profile integration verification](docs/v6-profiles-integration-verification.md). Physical-device acceptance remains pending. Rename/delete, full-family import/restore and deliberate old-history assignment remain separate work; this does not mark the complete family-data milestone finished.

**Profile device acceptance — 2026-11-14:** Owner tested `0ceae90` on physical iPhone Chrome and Safari and confirmed that profiles work, progress stays separate, and Guest does not save. Profile deletion is still unimplemented; proposed next management flow is Parent corner → Manage learners, with per-profile export and explicit scoped deletion confirmation. This acceptance does not mark all family-data or release regression gates complete.

**Manage learners increment — 2026-11-14:** Parent corner now includes local profile-specific export and confirmed deletion, with name/count review, cross-tab conflict detection, and preservation of other learners and Previous progress. No schema migration was needed. Physical-device acceptance remains pending. Rename and import/restore remain future work. See [management verification](docs/v6-manage-learners-verification.md).

**Manage learners device acceptance — 2026-11-14:** Owner tested export and profile deletion at `8d73b25` on iPhone Chrome and Safari and confirmed that the other learner’s progress remains intact. Import/restore and profile renaming remain outstanding.

**Learner restore increment — 2026-11-14:** Version-1 Manage learners JSON exports can now be reviewed and restored locally. Exact duplicates are skipped, conflicts block saving, and writes recheck the review under the family-store lock. Other learners and Previous progress are preserved. Owner confirmed no current history required backup; synthetic exports and legacy copies were used in tests. Device acceptance remains pending. Full-family backups, legacy export import/assignment, and profile renaming remain separate milestones. See [restore verification](docs/v6-import-learner-verification.md).

**Restore acceptance and learner names — 2026-11-14:** Owner accepted import/restore at `695854d` on iPhone Chrome and Safari. Change Learner Name and clearer duplicate-import messaging are now implemented locally. Renaming leaves IDs and flight records unchanged; an older nickname in an import does not overwrite the current local name. Device acceptance of these follow-ups remains pending. Full-family backups and Previous progress assignment remain future work.

**Answer-feedback increment — 2026-11-14:** Owner accepted nickname changes and duplicate-import messaging at `31bb944` on iPhone Chrome and Safari. At the owner’s request, Focus now provides prominent red/green/grey-blue answer feedback with symbols and a short correct-answer hold. Physical-device acceptance of feedback remains pending; see [feedback verification](docs/v6-answer-feedback-verification.md).

**Answer-feedback acceptance:** Owner accepted `256160c` on desktop and physical iPhone with speech and keypad. Browser names and exhaustive edge-case coverage were not specified. The next proposed increment is configurable Timed Practice and Test/challenge setup, preserving the fixed original School Test, followed by a v6 scope audit and consolidated release regression. Full-family backup and deliberate Previous progress assignment remain separate proposed data-management increments; offline caching and early-learning modules remain deferred.

**Configurable sessions increment:** Timed Practice and Custom Test now offer 5/10/15/20/30/60 questions and 1/2/5-minute limits in the working app. School Test stays fixed at 60 facts/two minutes. New flights carry optional practice-type/time-limit metadata; existing records are not migrated or rewritten. Owner confirmed no history required backup. Local verification and remaining physical-device checks are recorded in [configurable session verification](docs/v6-configurable-sessions-verification.md). This increment has not been pushed or accepted on physical devices.

**Quick Practice shortcut increment:** Implemented per-learner last-started Quick choices, a Home summary, fresh-question Start again, and Change options. Other modes preserve the shortcut; Guest choices are temporary. Preferences use separate per-learner browser keys, leaving history/profile schemas unchanged. Browser acceptance of the preceding configurable-session increment was reported by the owner; physical-device acceptance of both increments remains pending. See [Quick shortcut verification](docs/v6-quick-preferences-verification.md).

**Combined preview approval:** Owner accepted the configurable-session and Quick Practice updates locally and approved committing/pushing both together to `v6-development` for normal-address Netlify testing. Physical iPhone acceptance remains pending.

**Release-fix implementation:** R1 historical-flight replay and R2 restore-compatible report backups are implemented locally, with `6.0.0-rc.1` metadata. Existing saved formats/ownership remain unchanged; missing older replay metadata is explained at setup. Verification and remaining preview acceptance are tracked in [release-fix verification](docs/v6-release-fixes-verification.md). No production release is approved.

**Progress readability follow-up:** Facts to focus on and Flight log now have independent three-row previews and expand/collapse controls. Incorrect submitted values are explicitly labeled separately from attempt counts, with definitions under About these numbers. Scoring, speech interpretation and saved history are unchanged; local checks are recorded in [progress verification](docs/v6-progress-disclosure-verification.md). Device acceptance remains pending.

**Release-fix preview acceptance — 2026-11-14:** Owner reports `63650a0` looks as expected on desktop and iOS. R1 replay, R2 report backup consistency, candidate metadata and compact Progress are implemented and preview-accepted. This is not a new exhaustive or browser-itemized regression report. Next is final release preparation and explicit production approval; no production release has been authorized.

**Release preparation:** Proposed `6.0.0` notes and a concrete promotion/backup/rollback plan are prepared locally in [the release plan](docs/v6-release-plan.md). Final version metadata is staged locally; no production action is approved or complete.

**v6.0.0 production approval — 2026-11-14:** Owner confirmed no history needs preserving and explicitly authorized final release commits, merge/push to main and publication of v6.0.0 with its tag. The release scope is the accepted math/family experience, including the audited replay/backup fixes and compact Progress. Deferred work remains listed above. See [release notes](docs/v6-release-notes.md) and [execution plan](docs/v6-release-plan.md).

**v6.0.0 published and production smoke accepted:** Main commit `6cff208` is deployed to GitHub Pages with annotated tag `v6.0.0` and a published GitHub release. Published assets and automated production smoke passed. The owner subsequently confirmed voice, menus, adding/changing/deleting profiles, and answer-box colors work on production; browser/device details were not specified for this report. See [production verification](docs/v6-release-plan.md#completed-production-verification). This closes the release milestone without extending the stated device coverage.
