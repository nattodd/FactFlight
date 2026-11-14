# v6 release-readiness audit — 2026-11-14

## Follow-up implementation status

The owner authorized the required fixes. R1/R2 and release-candidate metadata are now implemented locally; see [release-fix verification](v6-release-fixes-verification.md). The findings below describe the audited `693affa` candidate and remain historical evidence. The owner subsequently accepted the `63650a0` preview appearance/behavior on desktop and iOS. This is not a separately itemized full regression or backup-round-trip report. The original findings have been addressed; final release preparation and explicit production approval remain.

## Recommendation

**Close to release; resolve two reproducible usability/recovery issues before promoting to main.** The agreed recent math/family experience is implemented and owner-accepted. No failed existing regression or demonstrated loss of saved learner records was found in this audit. Passing regression tests do not cover every behavior: the targeted audit probes below found gaps outside those assertions.

This audit records findings and updates documentation only. It does not change runtime code, commit, push, merge, tag, publish, or authorize production. Do not add new subjects or offline caching to the release-fix scope.

## Baseline and scope

- Candidate: `693affaa3d4e417611c52309ee846e824985de7d`, branch `v6-development`.
- `main`, `origin/main`, remote main and `v5.0`: `95df2cbaa4057afd04f95145bbd7eabd0159cf94`. Remote development matched the candidate during the audit.
- Compared `main...v6-development`: 96 files, 4,208 insertions and 52 deletions, including design artifacts, documentation and tests. Working tree was clean before audit documentation edits.
- Original School `generate`, first-try predicate and `stats` functions compare unchanged against main (newline-normalized). Speech lifecycle changes were inspected along with expanded parsing, Focus presentation, feedback transition guards and mocked speech regressions.

| Area | Current implementation | Audit assessment |
|---|---|---|
| Brand and Home | Brand assets, light/dark theme, learner picker, activity tiles, Coming Soon subjects, icon metadata | Implemented; owner-accepted |
| Math | Eight activities, five predefined whole-number levels, balanced randomized selection and spacing | Implemented; level ranges match the code; arbitrary custom ranges/family selectors are not implemented |
| Modes | Quick 5/10/15/20; Free until Finish; Timed and Custom Test with 5/10/15/20/30/60 and 1/2/5 minutes | Implemented; Timed and Custom use the same retry/revisit rules with different defaults |
| School Test | Original multiplication generator, 60 facts, two minutes, three-column Worksheet plus optional Focus | Preserved; School still defaults to Worksheet |
| Input and feedback | Voice ready/reconnect, keyboard/keypad fallback, red/green/grey-blue feedback, reduced-motion support | Implemented; owner manual acceptance plus automated coverage |
| Session navigation | Skip, Undo, Finish, guarded in-app Home, beforeunload warning | Implemented; no interrupted-session resume promise |
| Progress | Learner/activity totals, flight review, attempts/skips/first-try/timing, JSON/CSV | Implemented; separate mode dashboards and longitudinal charts are not implemented |
| Learners | Optional nickname, selection, rename, export, scoped deletion, separate results | Implemented; no sign-in/cloud backend |
| Guest | Memory-only results and Quick preference; clear on reload/change learner | Implemented; never silently assigned to a profile |
| Restore | Manage learners JSON review, duplicates skipped, conflicts blocked, cross-tab protection | Implemented; export-entry-point inconsistency below needs attention |
| Legacy history | Original keys retained unchanged and shown under Previous progress | Compatible; deliberate reassignment and legacy-array import are not implemented |
| Delivery | Relative assets and manifest paths, FF Home Screen icon, browser display mode | Subpath smoke passed; offline/update service worker and standalone opt-in are deferred |

## Findings to resolve before release

### R1 — Practice again from history can select the wrong activity (recommended release blocker)

**Reproduction:** finish a Division flight, then an Addition flight; open Progress and review the older Division flight; click Practice again. The review is Division, but the setup summary is Addition. The same issue can affect level, count, duration, input and view because the handler opens the current menu configuration rather than the reviewed flight.

**Evidence:** `index.html` result handler assigns `again` to `FlightMenu.ready()`; `scripts/menus.js` ready uses the mutable `cfg`. The isolated audit probe recorded “SESSION ENDED · DIVISION · LEVEL 1 · QUICK PRACTICE” followed by “Addition · Level 1 / Quick Practice · 5 questions · no time limit.” Saved scores and learner ownership are not changed.

**Recommended fix:** build a reviewed-session setup from stored settings when available, use explicit sensible defaults for older records lacking view/practice-type metadata, and show the settings before starting. Alternatively relabel the action as new practice with an explicit selection path. Preserve the per-learner Home Quick shortcut: replaying history must not silently use another activity. Test after another mode/activity, after reload/import, School, older records and both views.

### R2 — JSON export entry points do not share a restorable format (recommended release blocker)

**Reproduction:** select a learner, open Progress, choose Export learner history JSON, then pass the file to Import learner. It is rejected. Manage learners → Export results JSON for the same learner is accepted. Individual-flight JSON is also an archive format, not an accepted learner backup.

**Evidence:** `index.html` exports the Progress array or one session; `scripts/profiles.js` management export adds the learner envelope; `scripts/profile-store.js` requires `fact-flight-learner-export`, version 1. The audit downloaded actual UI exports and confirmed rejection of Progress JSON and acceptance of the management backup. The old README privacy section pointed parents to the wrong backup route; this audit corrects that documentation.

**Recommended fix:** provide the restorable learner envelope from the learner Progress backup action, or clearly distinguish archive/download actions from a prominent Restore-compatible backup action. Failed-save recovery should also lead to a restorable learner backup. Keep Previous progress exports unchanged unless a separate legacy-import policy is approved. Test round trips from every action described as backup, including unsaved-flight recovery, duplicate import and preservation of other learners. This is a recovery-path usability gap, not evidence that current Manage learners restore corrupts data.

### R3 — Release metadata and documentation cleanup (release preparation)

`index.html` still advertises `application-version=1.5`. Set an agreed v6 release version/identifier during release preparation. No update-notice feature is required just to correct metadata.

README listed already implemented activities/profiles as planned and linked the stable site without distinguishing v6 preview capabilities. ROADMAP and the level matrix retained historical pending/proposed text. This audit updates the current status, planned-feature list, stable/preview distinction and restore-compatible backup instructions while preserving historical notes. The Unreleased changelog matches the implemented feature categories; keep its entries unreleased until production approval.

## Verification evidence

### Automated, fresh audit run

**All 146 current application regression checks passed** in Windows Chrome 157.0.8103.51: original engine/brand 18, math 12, Focus 11, feedback 8, readability 9, menus 13, profiles 15, management 11, import 16, rename 9, configurable sessions 14 and Quick preferences 10. Suites cover the original engine, math, Focus, feedback, readability, menus, profiles, management, import, rename, configurable sessions and Quick preferences. Engine-fixture tests expose original controls without the profile adapter; integrated menu/profile suites separately exercise the public app. All data is synthetic and isolated.

The runtime math module passed **2,136 seeded sequence checks** (`FF_TEST_APP_MATH=1 node tests/question-diversity.cjs`), covering all 40 activity/level pools, nine School table configurations in the pure generator, tiny pools, full coverage, balance, spacing and streaming boundaries. Original School generation is separately checked by the engine suite and source comparison.

Additional audit probes served the actual candidate at `/FactFlight/`:
- App assets, manifest and icon requests succeeded; profile creation, sessions, history, reload and export worked without page errors or external requests in the exercised flows.
- Manage learners export parsed successfully; Progress export rejection and old-flight replay mismatch were reproduced as above.
- Reload during an active flight produced a beforeunload dialog in Chrome. Accepting it discarded only the unfinished flight; the two earlier saved flights remained. No automatic in-progress recovery is claimed. Mobile OS termination cannot be guaranteed to prompt.

Artifacts are local under `C:/Users/gt000/.codex/visualizations/2026/11/14/01a1db3c-84fa-70a2-8fa5-279fe95e1971/release-audit/`, including `core`, `family`, `audit-probes.cjs` and `audit-probes.json`. Tests need Playwright supplied via the existing temporary `NODE_PATH`; the repository does not yet provide a pinned test dependency/CI setup. Making the test runner reproducible is a maintenance follow-up, not an app-runtime dependency.

### Owner-reported physical/manual acceptance

The owner explicitly confirmed the full checklist on candidate `693affa` in **Windows Chrome, iPhone Safari and iPhone Chrome**: original School Test and expanded math; speech ready/answers/reconnect; keypad/keyboard fallback; timed and Free Practice; Skip/Undo/Finish/Home; both views; scoring/activity totals; and saved results after reload. Prior acceptance also covers learner export/delete/import/rename, duplicate messaging, feedback and Home Screen icon/launch.

Android Chrome and physical tablets remain **unverified**, not passed. All physical portrait/landscape combinations, permission-reset scenarios, screen readers and installed-context persistence were not separately itemized in this acceptance. Automated layouts include small portrait, landscape and tablet sizes; they are not physical-device verification. Release notes should state tested browsers accurately. Recheck the repaired flows on the required browsers after any runtime fix.

## Architecture, data and deployment tradeoffs

- Vanilla static app, no new runtime dependency, no analytics/cloud sync or app audio recording found. Recognized transcripts remain in local results/exports; browser speech processing may use an online service. Localhost network observations do not prove browser speech is offline.
- Shared engine with adapters preserves tested behavior, but globals/wrappers and duplicated activity labels couple history/menu setup; R1 illustrates the need for an explicit session-to-setup mapping. A broad rewrite is not recommended before release.
- Profile records are saved in one versioned localStorage envelope under Web Locks. Quota errors remain exportable in memory, but whole-family JSON serialization grows with history. There is no unlimited-storage promise. No new schema migration is needed for this audit.
- Per-learner Quick settings are disposable separate browser keys, excluded from result backups. Last successful start wins across tabs. Rename retains the ID; deletion clears its preference key.
- Netlify preview and GitHub Pages are different origins: no automatic transfer of preview learners/results. Use Manage learners backups to deliberately move learner data. Existing production v5 records remain available as Previous progress on the same production origin.
- GitHub Pages subpath behavior passed locally. Actual production deploy settings and post-deploy microphone/storage behavior still need confirmation in the approved release workflow. No changes to main or hosting were made.
- Rollback to the v5 commit preserves storage keys but v5 does not display v6 family results. Export v6 learner backups before rollback; never clear browser storage as a rollback step.

## Scope decisions and optional follow-ups

Recommended initial v6 scope is the reviewed math/family feature set above. The old proposals for streaming Timed Practice, one-pass Quick skips and arbitrary fact-family selection were not implemented; recent approved behavior uses finite timed sets and revisits unresolved finite-session questions. Confirm this implemented behavior as the release scope rather than describing those earlier proposals as completed.

Full-family backup, deliberate Previous progress assignment/import, custom fact-family/range selectors, deeper mode/trend reporting, storage-usage UI, offline/update handling, early-learning subjects, reading and games can remain separate follow-ups. In particular, individual-learner backup/restore already works; do not expand R2 into a full-family migration project.

## Smallest safe next milestone

1. Fix R1 and R2 with targeted regressions, leaving scoring/speech/School generation/storage ownership unchanged.
2. Apply the agreed version metadata and maintain the current documentation; no service worker or broader redesign.
3. Run affected suites, then one separately approved preview push. Owner verifies older-flight replay and restore-compatible exports on Windows Chrome and both iPhone browsers.
4. Reconcile the final diff/changelog, confirm remaining scope limitations and production backup/release/rollback steps, and request explicit approval to merge/release. Only then date the v6 release notes, merge to main, verify production and create the agreed release tag.
