# Focus / Worksheet integration — 2026-11-14

The owner reported that voice and tested new math modes worked in the preceding Netlify math build. That is general acceptance of that build, not a completed browser/device matrix for Focus. The owner then requested the reviewed Focus presentation, including School Test, while deferring Home.

## Implemented

- Select Focus or Worksheet before starting. New math activities default to Focus at phone widths up to 680px. School defaults to its original three-column worksheet but explicitly supports Focus. Selection is locked during a session and does not change on rotation.
- Focus presents one equation, question position, timer and scores, custom keypad, Skip, Undo, and Finish. Phone portrait stacks the equation and keypad; desktop/tablet and short landscape place them side by side. Setup, page header, and the full worksheet are hidden during Focus.
- Speech sessions show microphone status, reconnect when needed, and the recognized text with the active equation. Wrong answers retain the current question; correct answers advance through the same engine as Worksheet. Touch keypad remains available as a fallback during voice sessions.
- School retains 60 questions, its original generation, two-minute deadline, revisiting skipped facts, and existing scoring. Completion/early finish still saves through the same functions and displays existing results and review.
- The implementation keeps the existing worksheet DOM as a hidden compatibility layer for established scoring/render hooks. A separate presentation reads the same current item; it has no independent timer, answer state, or storage. This trades a small hidden DOM cost for avoiding a rewrite of the verified engine.
- No storage schema or saved-record fields changed. No migration, deletion, or profile assignment occurs. No Home redesign, streaming-mode change, or prototype scoring logic was added.

## Verification

Isolated Windows Chrome automated runs passed:

- **11/11 Focus checks:** matching Worksheet/Focus scores and saved fields for wrong/correct/skip/undo actions; School speech-ready gate, heard text, retries, advancement, reconnection and timer expiry; all eight activities at six sizes; small-phone School voice with keypad fallback; complete 60-question School Focus and reload/history review; no uncaught errors.
- **18/18 original regression checks:** School generator/scoring/timers, original speech mocks/fallback, worksheet layouts/keypad, exports/history, contrast/focus/reflow.
- **12/12 math regression checks:** all 40 activity/level choices, mixed legacy/new history preservation, exports, parser coverage, mocked voice, worksheet sizes, malformed-history protection. This suite explicitly selects Worksheet so it continues to cover that presentation.

Viewport sizes were 320×568, 390×844, 844×390, 768×1024, 1024×768, and 1440×900. Focus tests check equation, answer field, and Finish visibility. The School voice test checks equation, recognized-text region, and Finish at 320×568. Small-phone voice and landscape screenshots were visually inspected. A small-phone voice overflow was found and corrected before the passing run.

Tests use synthetic isolated data and mocked speech, not real audio. Real Windows microphone behavior and physical iPhone Safari/Chrome Focus use remain pending. Android/tablet physical touch, browser bars, permission dialogs, screen readers, and orientation behavior remain unverified. Long transcripts or expanded iOS troubleshooting guidance can require scrolling; guidance remains accessible.

## Phone acceptance checklist

After an approved commit/push and Netlify deployment, use the normal preview address. Choose an activity and Focus, then verify keyboard/keypad and voice, wrong/correct attempts, recognized text, Skip/Undo, early Finish, timed expiry, results and reload. Repeat the original School Test in both Focus and Worksheet. Confirm portrait/landscape usability and microphone reconnection. Home remains later work.

This record does not claim this increment has been committed, pushed, or deployed.
