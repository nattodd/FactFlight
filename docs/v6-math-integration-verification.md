# Working math integration — 2026-11-14

Branch: `v6-development`. The owner requested working math options at the normal Netlify address, preserving speech and saved history, with Home work deferred. The earlier uncommitted Home files were preserved in a temporary local snapshot and removed from this change. The committed design checkpoint remains unchanged.

## Scope

`index.html` now offers the original School worksheet plus all eight reviewed activities and five whole-number levels. New activities support finite sets of 5, 10, 15, 20, 30, or 60 questions, with existing untimed or two-minute session behavior. Skips revisit unresolved facts, as in the working engine. New activities have a one-column phone worksheet for longer prompts; School keeps three columns.

This does not implement Focus View, the prototype's streaming Free/Timed modes, one-pass Quick sessions, learner profiles, import, or the learner-first Home. Those require subsequent increments. No temporary prototype Guest state is used by the working app.

The pure activity module provides reviewed pools, shuffled coverage, balanced repetition, and repeat spacing. The existing session engine retains attempt details, corrections, skips, undo, timers, keyboard/touch fallback, and speech ready/reconnect. Spoken whole-number parsing and numeric input now accept four-digit answers. The original School generator remains unchanged.

Progress includes per-activity totals and filtered flight lists, detailed fact patterns, session review, full JSON export, and CSV export with activity/level columns. First-attempt correct retains original semantics. Final correct includes corrected answers; incorrect at finish excludes corrected answers; unanswered includes untouched or skipped questions without wrong attempts. Wrong attempts is a separate count. Untouched facts are excluded from fact-pattern percentages.

## Storage and backup prerequisite

The owner explicitly confirmed there was no existing history to preserve on the test browsers when asked to export a JSON backup before schema work.

- Original sessions remain in `fact-flight-history-v1`; they are not migrated, assigned to a profile, or rewritten when an expanded-activity session is saved.
- Expanded-activity sessions use `fact-flight-math-history-v1`, with activity, zero-based level, schema version, fact text/key, and the existing attempt/timing structure.
- In-memory Progress combines the two sets for display. Each save appends only to its respective key using the current stored list. Full-history JSON includes both sets; CSV labels activities distinctly.
- Unreadable history disables saving and leaves original stored bytes intact. New results remain exportable in memory. Browser quota failures report saving failure.
- No real user data was read, deleted, or migrated. Synthetic v5 copies were used for verification. This is not a profile-schema migration or an import feature.

## Automated evidence

- `tests/brand-regression.cjs`: **18/18 passed**, isolated Windows Chrome 157.0.8103.51. Original School generation, scoring, correction/skip/undo, timed and untimed sessions, exports, synthetic-history persistence, mocked speech ready/reconnect, unsupported-speech fallback, touch keypad, contrast/focus, and six responsive sizes.
- `tests/math-integration.cjs`: **12/12 passed** in the final complete run. All 40 activity/level choices, variable-count completion, randomized repeat sessions, synthetic v5 byte preservation, mixed-history reload/review/JSON/CSV, activity summaries, all spoken-number values 0–2,500, mocked advanced speech answers/reconnect/timer expiry, malformed-history protection, and six layouts.
- `FF_TEST_APP_MATH=1 node tests/question-diversity.cjs`: **2,136 seeded sequences passed** against the integrated module, including all 40 pools, complete higher-level arithmetic/range checks, coverage, balanced counts, repeat spacing, tiny pools, and streamed selection boundaries. This does not imply streaming session modes are implemented.
- `git diff --check` passed. No page errors were observed in the automated suites. The final desktop Progress screenshot was visually inspected; screenshot review caught and led to fixing untouched-fact rows with invalid percentages.

Emulated sizes: 320×568, 390×844, 844×390, 768×1024, 1024×768, and 1440×900. Phone tests submit four-digit keypad answers, including 2,500. Emulation does not establish physical-device acceptance.

## Required preview/device review

Commit/push and Netlify deployment are not recorded as completed here. After deployment, use the normal preview root and its Activity selector, not the separate design-prototype URL.

Physical Windows Chrome microphone tests, iPhone Safari, and iPhone Chrome are pending for this increment. Check ready/start and permission prompts; spoken short and four-digit answers; microphone reconnection; keyboard/keypad fallback; correction/skip/undo; timed expiry and untimed finish; scrolling/focus; all activity summaries and flight review; exports; and retained results after reload. Include the original School Test. Android Chrome and physical tablet/portrait/landscape behavior remain unverified when unavailable.

After phone acceptance, resume the requested learner-first Home design using the supplied desktop/mobile reference images. No production deployment or merge into `main` is proposed.

Follow-up: all six layout checks passed again with explicit assertions that the active equation stays above the touch keypad on narrow phones. The 320px viewport screenshot was visually inspected.

