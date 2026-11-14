# Compact Progress and clearer statistics — 2026-11-14

The owner’s screenshot shows `5 × 7`, Seen 3, First-try 67%, Wrong attempts 1, average active time 1.8s and incorrect value 325. The last value is an answer, not 325 wrong attempts. Seen counts encountered fact instances across flights (including equivalent reversed operands); 67% means two of three earned first-try credit. Average time is not a maximum or a per-attempt guarantee. The old “Wrong answers heard” label was inaccurate because the list includes typed/keypad values too. No actual export or transcript from that screenshot was examined, so the reason 325 was submitted/recognized cannot be determined here.

## Implemented

Facts to focus on and Flight log initially show up to three rows each. Separate keyboard-accessible Show all/Show fewer buttons expose the remainder, with `aria-expanded`, controlled table IDs and visible row counts. No unnecessary toggle is shown for a short/empty list. Facts keep their existing error/skip ordering; flights retain newest-first order. Filtering or returning to Progress resets the previews. Hidden rows keep their review handlers, and backups/CSV still include all applicable records.

The column is now “Recent incorrect values”, with explicit `Answer: 325` formatting. About these numbers expands definitions of encounters, average time, attempt count, input sources and the existing last-12-values limit. Equations do not wrap inside the horizontally scrollable fact table. No speech parser, timing, scoring, stored data, schema or learner ownership changed.

## Verification

Seven focused checks passed with isolated synthetic data: a fixture matching the screenshot’s numbers; three-row previews and independent expansion/collapse; keyboard activation; review of a previously hidden flight; unchanged full-backup count; empty/filtered/short lists; 320px, 390px and desktop overflow/reachable export controls; and no page errors. The phone screenshot was visually inspected. This fixture verifies interpretation/rendering, not the original microphone event.

All 34 relevant existing checks passed: profile integration 15, release fixes 7, math integration 12. Together with the new suite, **41 local Chrome checks passed**. `git diff --check` passed. The earlier release-fix suite remains separate evidence. Physical phone expansion, horizontal scrolling and keyboard/screen-reader behavior remain pending; no device test is claimed from emulation.

No commit, push or deployment was made. The local working tree also contains the previously requested release fixes and audit records.

## Preview approval

The owner approved committing and pushing the release fixes and compact Progress updates together to `v6-development` for testing at the normal Netlify preview address. Physical-device acceptance of these changes and production release approval remain separate pending gates.
