# v6 release-fix verification — 2026-11-14

## Changes

R1: Practice again now maps the reviewed flight to setup, rather than reopening unrelated mutable menu choices. Activity, level, practice type, supported question count, time limit, input and optional goal are restored from existing records. The immediate current flight retains its full setup in a WeakMap for the life of the tab, including view. Older/reloaded records never stored a view, so setup explicitly asks the user to review the default (School Worksheet; phone math Focus; desktop math Worksheet). No view field or history migration is added.

Older records without practice type reopen as fixed timed or untimed sets rather than guessing Quick/Free. An older untimed School worksheet remains untimed, with its table and 60 questions. Selecting the normal School Test menu still resets the original two-minute preset. Unavailable old counts fall back to 20 with an explicit notice. Replay always shows setup before starting a fresh randomized set; choosing replay does not replace the Home Quick shortcut. A new Quick start uses the established shortcut preference behavior.

R2: Results and Progress now offer **Export learner backup JSON**, using the same version-1 learner envelope as Manage learners. A filtered activity report exports the whole learner, explicitly described in the report. Unsaved flights are included. If the profile was deleted in another tab or its saved data cannot be read, Results can export only its retained unsaved flights in a restorable recovery envelope, with an explicit message; this does not recreate the profile or modify storage.

Previous progress still exports its original archive shapes, now labeled as archives; CSV and old single-flight/array exports are not newly accepted by the importer. Guest remains non-exportable. No storage schema, scoring, microphone lifecycle, generator, ownership or stored historical record is changed.

R3: `application-version` is now `6.0.0-rc.1`, marking a candidate for testing, not a production release. README, changelog, roadmap and the audit follow-up reflect the fixes while retaining the original audit findings as historical evidence.

## Verification

The seven dedicated checks passed: historical replay after another activity and reload; immediate view/goal and Free replay; legacy fixed untimed and School behavior; actual Results/filtered-Progress downloads restored into synthetic storage preserving another learner and skipping duplicates; quota/deleted-profile unsaved recovery; replay of an imported voice flight with the ready gate; and candidate metadata/no page errors.

The existing profile-export assertion now checks the restorable envelope rather than an archive array. All 146 existing application regression checks also passed, for **153 passing checks** in isolated Windows Chrome 157.0.8103.51. The phone replay setup screenshot was visually inspected; syntax checks and `git diff --check` passed. Artifacts are under `C:/Users/gt000/.codex/visualizations/2026/11/14/01a1db3c-84fa-70a2-8fa5-279fe95e1971/release-fixes/`. All checks use isolated synthetic data and mocked speech where applicable.

## Remaining gate

No commit, push, merge or production release has been made. The owner previously passed the full three-browser checklist on `693affa`; that evidence does not constitute phone acceptance of these new fixes. After an approved preview push, verify older-flight replay after a different activity, setup/view review, and Results/Progress backup import on Windows Chrome, iPhone Safari and iPhone Chrome. Check both views and speech/keypad, and confirm School remains 60 facts/two minutes through the normal menu. Android and physical tablet behavior remain unverified. Actual microphone/permission behavior cannot be verified by the automated speech mock.

## Preview approval

The owner approved committing and pushing the release fixes and compact Progress updates together to `v6-development` for testing at the normal Netlify preview address. Physical-device acceptance of these changes and production release approval remain separate pending gates.

## Owner preview acceptance — 2026-11-14

After deployment of `63650a0`, the owner reported that the updates look as expected on desktop and iOS. This records acceptance of the reviewed preview changes, not a new exhaustive regression or separately itemized backup round trip. Browser names were not repeated for this acceptance. The prior full Windows Chrome/iPhone Safari/iPhone Chrome checklist on `693affa` remains separate evidence. Android and physical tablets remain unverified. Production release has not been approved.
