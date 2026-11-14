# v6 experience plan — for design review

Date: 2026-11-14. This is proposed product scope, not a record of shipped features.

The owner's expanded v6 scope supersedes the previous v6.0/v6.1 separation for profiles, Guest, backups, and family progress. Those capabilities belong in this v6 implementation program. Delivery remains incremental; no dates or production approval are implied.

## Review artifacts

- Open `design-reference/ui-v6/v6-experience-preview.html` directly in a browser. It loads local brand artwork and needs no server or installation.
- The preview is a separate, disposable interaction model. It never reads or writes app localStorage, requests a microphone, migrates history, or loads remote fonts/scripts. Sample learner/session state is memory-only and resets on reload.
- Compare the activity and level proposals in `docs/v6-activity-matrix.md` with the setup screen.
- The older profile-first prototype remains as historical reference; this proposed flow uses activity-first Home with optional learner selection.

## Scope and sequence

| Milestone | Build | Acceptance gate |
|---|---|---|
| Brand foundation | Existing palette, header asset, typography and control styling | Implemented; owner accepted browser/iPhone changes; detailed release regression still tracked separately |
| Experience design (current) | Useful Home instead of an extra splash gate; menus, learner picker, setup, views, exits and results | Owner reviews this prototype, matrix, and open decisions |
| Home/navigation | Integrate approved shell around current multiplication worksheet and full Progress | Existing School Test, speech and history work through navigation; leaving never silently discards a session |
| Shared session presentation | Focus and Worksheet render the same session model | Equivalent question order, attempts, undo, skips, timing and results; original Worksheet behavior preserved |
| Modes | Quick, Free, Timed, Challenge and original School Test | Explicit count/timer/completion rules, reliable fallback input, clear results and exit routes |
| Family/local progress | Optional profiles, Guest policy, per-student reporting, backup/import, legacy compatibility | JSON backup before schema changes; migration on copies; reload/import/ownership/failure tests; existing analytics retained |
| Math library | Addition, subtraction, division, bonds, doubles, halves and squares, plus configurable multiplication | One activity at a time; validated level definitions, mode/view/input/report compatibility |
| Integrated v6 | Required browser/device matrix and Netlify acceptance | All release gates passed or unresolved limitations explicitly reviewed; production requires separate approval |

PWA/offline/update handling remains later work with separate acceptance criteria. Early-learning/reading subjects are future destinations, not clickable empty modules. More math activities can be added after agreeing their content rules.

## Proposed navigation

Home → Math activity → Setup → Session → Results → Again / Home / Progress.

- Home: learner selector, prominent 5/10/15/20 Quick Practice, Math library, original School Test shortcut, Progress and Parent settings.
- Quick Practice initially defaults to multiplication; its shortcut displays the activity and count. In the integrated app, remember the last valid choices without requiring onboarding.
- Learner switching occurs outside active sessions. Guest works immediately; creating a profile never blocks practice. Optional nickname defaults to a neutral label when omitted.
- Setup: activity, descriptive level, mode, count/duration, input and view. Show the exact selected scope before Start. Choose a view before starting; postpone mid-session view switching.
- Focus defaults on phones/tablets, with large prompt and answer controls; Worksheet remains selectable. Desktop can use either. Original School Test defaults to the familiar three-column worksheet.
- During a session: Skip, Undo and Finish stay available. Home/Progress/Settings route through an exit dialog; Continue preserves the session, Finish shows results before navigating away. The running timer continues while confirming; no unintended free pause in a test.
- Results: first-try, corrected, unanswered, skips, time, finished/ended/time-up label, question review, Again, Home and Progress. Early-ended sessions do not masquerade as completed challenges.
- Progress: selected learner's overall totals → activity summaries → activity flight history → individual flight review. Each activity shows flights, final correct, incorrect at finish, first-attempt correct, unanswered, and wrong attempts. Keep activities and learners distinct, including empty activity states.
- Browser Back/reload in production needs explicit handling and testing; no resumable-session promise. The prototype is a single file without URL routing.

## Mode rules — proposals for approval

| Mode | Question count | Clock | Skip/completion |
|---|---|---|---|
| Quick | 5/10/15/20 | Elapsed, no deadline | One pass; skipped items stay unanswered in results; retry later as a new session |
| Free | Open-ended; generated in batches | Elapsed, no deadline | Skip moves on; Finish ends the session; no completion target |
| Timed | Open-ended stream | Proposed 1/2/3/5 minute choices | Skip moves on; expiry ends the session |
| Challenge | Proposed 10/20/30 facts | Optional 1/2/3/5 minute deadline | Finish the set, or end at deadline; no leaderboard, streak or penalty |
| School Test | Exactly 60 multiplication facts; selected table 2–10 and factors 1–10 | Exactly two minutes | Preserve existing revisit-unresolved behavior, generation, first-try semantics and three columns |

Wrong answers allow gentle retry. First-try requires a correct first attempt with no prior skip. Undo restores the prior answer state while retaining elapsed time and an invalidated-action record, matching existing behavior. Define completed versus attempted denominators explicitly in reports; never silently alter legacy calculations. Preserve detailed original School Test analytics and exports.

## Profiles, backups and privacy

**Proposed Guest policy:** temporary results, clearly labeled; named profiles save locally. This changes today's account-free saving behavior and needs approval before integration. Alternative: save Guest sessions in a distinct local bucket. Never retroactively treat existing history as disposable Guest data.

- Keep old sessions as Legacy / Unassigned until the owner deliberately assigns copied records under an approved policy. Never automatically put them under the first learner.
- No hard five-profile cap is assumed. Nicknames are optional; stable IDs, not names/colors, determine ownership. Duplicate nickname policy remains open.
- Backup/export before introducing schema changes; full-family JSON round-trip and existing CSV detail are required. Validate imports and preview counts/conflicts before applying. Default to merging without silent replacement or duplicate records.
- Corrupt or unsupported data is preserved and blocked from overwrite. Handle quota errors, interrupted writes, and multiple tabs explicitly. Avoid two independent keys pretending to be one atomic transaction.
- Keep deletion unavailable until backup and explicit per-profile confirmation exist; removal must never affect another learner.
- Production speech privacy remains accurate: recognized transcripts are locally stored with current session results and can appear in exports; audio recordings are not stored by the app, but browser recognition may process audio online. Any transcript-retention change needs a separate decision.

The preview's Backup screen demonstrates export of explicitly marked sample data and a sample import-review dialog. It does not implement production persistence or import migration.

## Architecture and risk controls

- Retain vanilla HTML/CSS/JavaScript and static hosting. Use shared session state with separate renderers, activity definitions, input adapters, and storage/reporting boundaries as needed; no wholesale framework rewrite.
- Protect the v5 speech recognizer lifecycle. Existing scoring currently accesses worksheet DOM directly; remove that coupling incrementally with parity tests before adding Focus.
- Keep School Test as a fixed preset with its existing generator. Variable question counts must not leak into its denominators or layout.
- Maximize question diversity within the selected range: exhaust distinct facts before repeats, balance their frequency, and separate repeats by three other equations whenever possible. Carry coverage/spacing across generated batches. Reversed commutative operands share a fact key; limited pools use the longest achievable gap. The prototype demonstrates this policy; production integration remains future work.
- The current speech parser covers spoken numbers through 100 (and numeric transcripts up to three digits); broader levels up to 2,500 need dedicated spoken-number and four-digit numeric-input tests and carefully scoped extension. Keyboard remains reliable fallback.
- A single shared activity model should define answer location (e.g. missing bond part), accepted answer, level/range, input eligibility and analytics identity. Do not aggregate addition/subtraction or different bond variants under multiplication keys.
- LocalStorage has no multi-record transaction. Choose a versioned write/recovery strategy before implementing family data; a separate storage-design review is required.
- No production logic is copied from the prototype. Its question generator, timer, scoring and transient profiles exist only to review interactions; they are not a replacement for the verified app engine.

## Decisions to review in order

1. Does activity-first Home with optional learner selection feel right?
2. Should Guest results be temporary or saved separately? Should blank nicknames receive a generated label?
3. Are the eight activities and the proposed levels correct? Confirm zeros, table range to 12 outside School Test, missing-part bonds, squares only (no roots), and optional future extensions.
4. Do mode counts/deadlines and one-pass Quick versus revisit School Test match your expectations?
5. Are Focus default, pre-session view selection, and Finish → Results → Home acceptable?
6. Confirm legacy ownership/import conflict policy during the subsequent storage design review.

## Design acceptance and testing

Review on desktop and phone, in both themes: Home, learner picker, setup, Focus, Worksheet, exit confirmation, results, progress and backup preview. Check 5-question Quick completion, wrong/retry, Skip, Undo, early finish and return Home. Use the sample import dialog to inspect the proposed conflict language.

Prototype testing is separate from production regression. Before integrating each step, run targeted local checks and the approved Netlify preview workflow. Full release regression includes Windows Chrome, iPhone Safari and iPhone Chrome; actual microphone/permissions and physical touch/orientation need manual tests. Android/tablets remain unverified when unavailable. No commit, push, or deployment is authorized by this design task.

### Prototype verification — 2026-11-14

`tests/v6-design-preview.cjs` passed **12/12 checks** in isolated, headless Windows Chrome 157.0.8103.51. Run with a separately installed Playwright package on `NODE_PATH`; artifacts use `FF_TEST_OUTPUT` or a temporary directory. It opens the HTML directly as a local file.

Checks cover Home/theme/logo, optional sample learners and blank nickname, wrong/correct/skip/undo/completion, learner progress review, 60-row School worksheet, leave/continue/finish/Home, all activity level labels and nonnegative integer sample answers, simulated challenge expiry, free-practice batch extension, sample JSON export/import-review UI, and reset on reload. Monitored flows produced no page errors or remote requests; persistent storage calls were configured to throw in the main test context and none occurred.

Five emulated touch viewports passed Home/Focus horizontal-overflow and visible-Finish checks: 320×568, 390×844, 844×390, 768×1024, and 1024×768. Small portrait/landscape session-control overflow found in the first working run was corrected, then the suite was rerun. Short landscape hides global navigation during practice; Finish → Results → Home remains the exit route. Compact keypad and session navigation buttons use 44px minimum heights.

Desktop light/dark Home and small portrait/landscape Focus screenshots were visually inspected. These checks do not validate every activity's question distribution, full keyboard/screen-reader accessibility, real iOS/Android touch, browser bars, enlarged-text layouts, live speech, real persistence, or production scoring parity. Physical device review and owner design approval remain pending. The working `index.html`, its stylesheet, runtime logo, speech code, and history storage were unchanged by this design work.

### Question diversity follow-up — 2026-11-14

Owner requested minimal duplicates and three intervening equations where possible. The prototype now enumerates full level pools, balances coverage in randomized rounds, varies equivalent display forms, and preserves selection state across streamed batches. Undo retains already-generated future questions so it cannot silently consume and discard part of the selection pool.

`node tests/question-diversity.cjs` passed 1,480 seeded sequence checks: all 24 activity/level combinations, nine individual School Test tables, synthetic pool sizes 1–4, full coverage before repetition, balanced frequencies, achievable spacing, varied fresh-session order, empty-pool rejection, and streaming batch boundaries. The 12 Chrome prototype interaction/layout checks also passed again after this change. Existing application files and stored history remain unchanged.

### Same-settings repeat-session verification — preview R3

The owner's screenshots showed the original deterministic sequence (2×1, 3×2, 4×3, …). The current file instead creates a fresh randomized source on every Start, including Practice again. A visible R3 revision marker now distinguishes the updated page from an older already-open document; reload resets this disposable preview.

All 13 Chrome prototype checks passed, including consecutive 20-question sessions at level 3 for each of the eight activities through the Practice again UI. Settings were unchanged and question orders differed. The 1,480 seeded generator checks also passed again. Random selection does not promise disjoint facts between sessions; small pools necessarily reuse facts. New-session order is reshuffled, while coverage and spacing are enforced within a session.

### Higher whole-number levels — preview R4

Following the owner's choice to stay with whole numbers, each activity now has five selectable levels. Levels 1–3 remain intact. Levels 4–5 introduce larger operand bands; exact definitions are in the activity matrix. The prototype keypad/keyboard accepts up to four digits, including 50² = 2,500, and longer equations use smaller responsive type. Production speech/input parsing remains unchanged and must be expanded and tested before integrating these levels.

Large pools (up to 81,000 distinct facts) use random swap-removal rather than filtering every remaining fact on every draw. Balanced coverage and three-intervening-fact spacing remain enforced. The generator suite passed 2,136 seeded sequences across 40 activity/level pools, nine School Test tables and tiny-pool edge cases; it also verifies every advanced equation's arithmetic and operand bounds, including complete multi-round coverage of larger pools.

All 14 isolated Windows Chrome prototype checks passed for R4, including all eight highest-level Focus screens at 320×568 and 844×390 and completing a 30-question squares challenge containing four-digit answers through the keypad. These are emulated layouts, not physical iPhone or microphone verification.

### Activity Progress — preview R5

Progress now begins with totals for the selected learner and eight activity cards, rather than immediately listing flights. Select an activity to view its totals and flight history, then review a flight; the result screen links back to that activity. Changing learners keeps results isolated. Empty activities remain visible with zero counts and a practice action.

Definitions: flights count finished/early-ended sessions; Correct counts final correct questions including corrections; Incorrect at finish counts unresolved questions with at least one wrong attempt; Unanswered covers all remaining questions, including skipped/untouched ones without a wrong attempt. These final outcomes are disjoint. First-attempt correct is a subset of Correct (exactly one correct attempt and no skip). Wrong attempts counts each incorrect submission separately. Undone inputs are absent from these totals because the prototype restores their previous state. Fixed-length early-ended sessions include their unanswered questions; open-ended modes retain only encountered items, as already defined by the prototype.

All 15 Chrome prototype checks passed, including a deterministic synthetic multi-flight fixture verifying totals, corrections, repeated wrong attempts, skips, untouched items, activity drill-down/back navigation, learner isolation, empty states, and 320px Progress layouts. The desktop summary screenshot was visually inspected. Data is still memory-only; production history/analytics and files remain untouched.

### Reviewed checkpoint — 2026-11-14

The owner accepted the math options, five-level progression, question variety, and results review, and approved committing this design checkpoint and beginning Home/navigation integration. Guest retention and storage migration policies still require their separate review. Prototype acceptance does not constitute production/device regression approval.

