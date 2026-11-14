# Learner Home and local profiles — 2026-11-14

## Authorization and scope

The owner approved integrating the reviewed learner Home, saving new flights to the active learner, and temporary Guest use without saving prompts or menus. Home retains the current learner; Change learner returns to profile selection. Before implementation, the owner confirmed there is no existing history requiring a backup. Compatibility was still tested with synthetic copies of original School and expanded-math records.

This increment supports profile creation/selection, optional nickname defaults, the learner Home, separate results and activity totals, and learner-scoped JSON/CSV exports. No real accounts, email, password, cloud storage, analytics, profile deletion, or automatic old-history assignment was introduced. Rename/delete, full-family import/restore, and deliberate assignment of older records remain later work. Same-named profiles have distinct IDs; names do not determine ownership.

## Storage and session architecture

- `scripts/profile-store.js` owns the version-1 family envelope at `fact-flight-family-v1`, containing profiles and new sessions. UUIDs identify profiles and flights. Each flight captures its learner ID/name when the existing engine begins the session.
- `scripts/profiles.js` supplies learner UI and narrow adapters around begin/save/results/history. Generation, microphone lifecycle, timers, attempt scoring, Skip/Undo, Focus/Worksheet, and guarded exits still use the existing engine.
- Original `fact-flight-history-v1` and expanded `fact-flight-math-history-v1` are read as Previous progress and never rewritten or assigned by this integration. Old sessions preserve their original IDs, fields, scoring and analytics.
- Guest results live only in memory. Home retains the Guest context; Change learner or reload clears it. Guest has no save-to-profile action, export buttons, or saving prompts. Creating a profile never transfers Guest results.
- Writes use a named Web Lock and reread the latest validated envelope inside that lock, then commit with one localStorage write. Two current-version tabs cannot silently overwrite each other's profile creation or flight saves. Unsupported locking prevents durable writes with an explicit error instead of an unsafe fallback.
- Invalid/unsupported family data is preserved and blocks writes. Unknown learner ownership and conflicting session IDs are rejected. Quota/write failures retain the profile flight in memory and display an export warning; successful-save wording appears only after the write completes. A pending write can still be interrupted by closing the page: wait for the Saved status before closing. Guest never gets this saving flow.
- Viewing another learner's stats does not change the active practice learner. Previous progress and other learners' reviewed flights do not offer a misleading Practice again action under the wrong learner. Home returns to the active learner's activity menu.

## Automated verification

All 78 checks passed in isolated headless Windows Chrome with synthetic data:

| Suite | Passed | Evidence scope |
|---|---:|---|
| Profile integration | 15 | Ownership, Guest, export isolation, reload, old-history preservation, damaged data, quota failures, overlapping tab writes, rejected unsafe/conflicting writes, nickname escaping, phone/tablet/desktop and dark layout |
| Public menu integration | 13 | All eight activities in both views, continuous Free, guarded exits, timed expiry, School voice ready/retry/reconnect mocks, microphone cancellation/fallback, layouts |
| Readability | 9 | Large prompts/text, six viewports, eight activities, School voice mock and worksheet touch fallback |
| Original regression | 18 | Existing baseline engine generation, scoring, timers, speech mocks, exports, accessibility and layouts |
| Focus engine | 11 | Presentation/scoring parity, voice mocks, School, keypad and layouts |
| Math engine | 12 | Forty activity/level combinations, advanced parsing, mocked speech, legacy compatibility and layouts |

The established engine suites intentionally omit the profile adapter in their test-only HTTP fixture. They verify the retained baseline engine, not new profile persistence. The public menu/readability suites load the real profile scripts; the dedicated profile suite verifies current persistence and ownership. A final Free Practice check was rerun after strengthening its assertion to use the new family key rather than an unchanged old key.

Phone/desktop light Home and small-phone dark Home with a long nickname were visually inspected. `git diff --check` passed. These checks do not establish physical-device or actual microphone acceptance.

## Pending manual preview verification

The owner approved committing and pushing this increment to `v6-development` for Netlify preview testing. Test the normal Netlify root in Windows Chrome, iPhone Safari, iPhone Chrome, and the iPhone Home Screen shortcut:

1. Create two learners. Complete different activities for each, reload, reselect each learner, and confirm separate totals/flights and exports.
2. Try Guest. Confirm no save/export prompts, Home retains Guest, and reload or Change learner clears Guest results without transferring them to a new profile.
3. Check voice ready/start, correct/incorrect answers, heard text, reconnection and permissions; test keypad/keyboard fallback.
4. Exercise Quick, Free until Finish, Timed/Test and original School, Focus/Worksheet, Skip/Undo, early finish and guarded Home, then review scoring and reload persistence.
5. Check large text, long names, scrolling, keyboard focus, portrait/landscape and Home Screen launch. Do not assume installed-context data is shared with browser tabs.

Android/tablet physical checks and assistive-technology review remain unverified. No production release is proposed or authorized.
