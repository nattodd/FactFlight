# Tile menus and continuous Free Practice — 2026-11-14

The owner accepted the tile-menu mockup and specifically requested that Free Practice continue until Finish. The owner also reported that the preceding Focus build worked on their phone. That is not acceptance of this new menu/Free Practice increment.

## Implemented behavior

- Home exposes Quick Practice, Math, Progress, and Parent corner. Letters & Sounds, Colors & Shapes, and Reading are disabled Coming Soon tiles. No profile or account gate is introduced.
- Math guides activity → mode → level/amount → input/view. The Home Quick shortcut skips mode selection and supports all eight activities with 5/10/15/20 questions. Five levels, example equations, both answer methods, and Focus/Worksheet remain available.
- Free Practice has no question limit or deadline. A session-scoped source generates a new question when needed, retaining pool coverage and spacing. Wrong answers retry the current question. Skip advances, leaving that question in results. Undo restores the previous attempt and retains the already-generated future item; redoing an answer does not consume an extra random fact.
- Finite Quick, Timed, Test, and School sessions keep the existing revisit-unresolved behavior. Timed uses a chosen finite set and two-minute deadline. Test is the 60-question/two-minute preset for the selected activity. Original School is still a distinct table 2–10 preset with its original generator and scoring.
- Skip, Undo, Finish, and Home remain visible in the session. Finish saves and opens results directly. Home or other navigation while running opens a Continue/Finish-and-review dialog. The clock and microphone continue. Finishing or automatic expiry closes the dialog and displays results; results include Return Home.
- Canceling microphone setup returns to the chosen ready step, where keypad/keyboard can be selected. Reconnect, recognized text, privacy guidance, and fallback input remain available.
- Optional first-try goals are retained. Finite goals cannot exceed the set size; Free Practice accepts the existing 1–60 goal range without making it a completion limit.

## Architecture and data preservation

`scripts/menus.js` adapts the approved choices to the current engine. Menu styling is scoped to `#menuView` so it does not restyle questions or reports. Private legacy setup controls remain hidden as a compatibility adapter; they are not exposed in the public flow. The original School generator, speech lifecycle, number parser, and attempt/scoring definitions are retained.

No storage schema, keys, or record fields changed. No migration, deletion, or profile assignment occurred. Quick and Free continue saving as the existing `practice` mode; Timed and Test continue saving as `test`. Consequently, old report/export mode labels remain generic rather than adding new mode values to stored history. Activity, level, questions, attempts, timing, and finish reason remain available.

Free results contain attempted or skipped questions only. The generated, untouched final prompt is excluded, including after Undo. An immediately finished empty session has zero recorded questions and does not produce invalid percentages. Existing finite-session denominators are unchanged. Free retains encountered questions for review, so very long sessions still accumulate memory/history and can encounter the existing browser quota limit; save failures retain the existing export warning.

## Automated verification

Isolated headless Windows Chrome, synthetic data and mocked speech only:

- `tests/menu-integration.cjs`: public Home/Math/Quick tile routes for every activity in both views; continuous Free beyond 120 answers and beyond two minutes; Skip/Undo and diversity; guarded Home/Progress navigation and expiry; School speech ready/retry/advance/reconnect; microphone cancellation and keyboard fallback; empty finish, goals, Back, and activity reports; five phone/tablet/desktop sizes; no page errors.
- Existing `tests/brand-regression.cjs`, `tests/focus-integration.cjs`, and `tests/math-integration.cjs` cover original School, Focus/Worksheet, scoring, timers, speech mocks, all 40 activity/level pools, exports, malformed-history protection, and byte-for-byte synthetic legacy-history preservation after new saves and reload.
- Those older engine suites now use `tests/engine-fixture.cjs`, a test-server-only adapter that exposes private setup controls. This avoids coupling their engine checks to menu clicks. It does not ship in the app. The separate menu suite exercises the unmodified public page and real navigation end to end.
- Desktop Home and phone ready-step screenshots were visually inspected. An inherited worksheet flex style was corrected to match the approved Home arrangement. Follow-up layout checks passed at 320×568, 390×844, 844×390, 768×1024, and 1440×1000. Session controls, including Home, remain in view in these checks.

## Remaining preview/device acceptance

New menus and continuous Free Practice need physical Windows Chrome microphone and iPhone Safari/Chrome review after an approved commit/push triggers Netlify. Test starting each mode, voice ready and reconnection, keypad/keyboard, corrections, Skip/Undo, Free continuing until Finish, Home Continue/Finish, finite expiry, results/exports, and reload persistence. Include original School and both views. Real iOS/Android/tablet browser bars, permissions, touch, orientation, and screen readers are not verified by emulation.

No commit, push, deployment, or production approval is recorded as completed here. The normal Netlify root will serve the menu after this integration is approved and pushed; the separate design mockup remains a reference only.

Final automated result: 12/12 public-menu checks, 18/18 original regression checks, 11/11 Focus checks, and 12/12 math checks passed (53 total). The five menu-layout checks were also rerun successfully after the Home style correction. git diff --check passed.


## Owner acceptance and alignment follow-up

The owner reported successful desktop/iPhone testing in Chrome and Safari, and requested vertical centering of the in-flight Focus screen. The local follow-up uses the dynamic viewport height and centers the full session when there is spare height. On shorter screens the document grows naturally, retaining access to the top and scrollable controls. No session JavaScript or storage code changed.

Seven targeted automated checks passed: five layout sizes (320x568, 390x844, 844x390, 768x1024, 1440x1000), a 390x400 overflow/scrolling check, and the existing 320px School voice/keypad check. The centered 390px screenshot was visually inspected. Physical-device validation of this alignment change and commit/push remain pending.

