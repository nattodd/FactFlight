# Changelog

All notable changes to Fact Flight are documented here.

This file records **implemented changes**, not ideas or planned features. The public [ROADMAP.md](ROADMAP.md) describes proposed work and future milestones.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions, with entries grouped under **Added**, **Changed**, **Fixed**, and **Removed** where relevant. Versions follow [Semantic Versioning](https://semver.org/) where practical.

## [Unreleased]

## [6.1.0] - 2026-11-15

### Added
- Table-selected results offer Next Table(s), showing the destination and advancing every selected table by one while preserving session options and voice readiness. The action is unavailable when any selected table is 10 or the complete setup is no longer available in the current tab.
- Multiplication offers Choose Tables for any combination of tables 1–10 with factors 1–10 in Quick, Free, Timed Practice and Custom Test. Existing levels and the original School Test remain available.
- Selected tables persist with learner practice settings and Quick shortcuts, carry through Practice Again, and appear in results, history and JSON/CSV exports. Next Level is hidden for table-selected flights.
- Results offer Next Level for complete numbered-level flight settings below Level 5, including Free Practice, while preserving the learner and compatible session options. School Test does not offer Next Level.
- Results include Change options alongside repeat actions, with full-width repeat controls on small screens.

### Changed
- Practice Again starts a fresh flight immediately when the completed flight's full configuration is available in the current tab. Voice still waits for ready. Older/reloaded flights without a saved view retain an explicit Review settings action.
- Repeated expanded-math flights prefer previously unused fact families where available while preserving balanced rounds and repeat spacing. Small pools reuse facts with a different opening when possible; repeated School Tests retain the fixed preset with a different opening.
- Repeat actions recheck learner ownership before launch and after voice readiness, preserve completed records, and prevent duplicate starts. A cancelled launch does not replace saved preferences.

### Fixed
- In-session headings show the selected multiplication tables instead of a numbered level in Focus and Worksheet, including Practice Again and Next Table(s).
- Practice menus remember each learner's last started settings separately for each activity, including mode, level, count, duration, input, view and optional goal. Mode choices now visibly identify the selected option.
- Selecting the current practice mode preserves its count and timer choices. Abandoned setup changes do not replace the last started settings, and changing learners resets setup drafts.
- General practice preferences preserve the separate Quick Practice shortcut. Guest preferences remain temporary; learner deletion also clears the new disposable preferences. These preference changes do not rewrite existing flight history. New Choose Tables flights use session schema version 2, and backups containing them require v6.1 to import; older backups remain supported.

## [6.0.0] - 2026-11-14

### Added
- Quick Practice remembers each learner’s last started Quick setup, displays its activity, level, count, input and view on Home, and offers Start again with fresh questions or Change options. Other modes do not replace the shortcut. Guest choices clear on reload or Change learner.
- Added 1-, 2-, and 5-minute choices and 5/10/15/20/30/60-question sets to Timed Practice and Custom Test. Setup and repeat-session review show the selected choices; the original School Test stays fixed at 60 multiplication facts and two minutes.
- New expanded-math flights retain their practice type and time limit in results, history, and JSON/CSV exports. Learner import validates the optional settings and continues accepting older exports without rewriting existing records.
- Added Change Learner Name in Manage learners. Renaming preserves the learner ID, saved flights, other learners, and Previous progress; stale edits and failed writes do not overwrite data.
- Added Manage learners → Import learner for JSON files exported by Manage learners, with a review of the learner, new flights, skipped duplicates, and conflicts before saving.
- Restore preserves learner/flight IDs and detailed results, skips identical flights regardless of JSON property order, and blocks conflicts without overwriting records. Other learners and Previous progress remain unchanged; changed data in another tab requires another review.
- Added Parent corner → Manage learners with profile-specific JSON export and a separate confirmation showing the learner name and flight count before deleting their profile and results. Other learners and Previous progress remain unchanged.
- Deletion rechecks the learner’s records under the cross-tab write lock; changed results require a fresh confirmation, and failed writes preserve the original data. Removing the active learner returns Home to learner selection.
- Added the learner-first Home with optional nickname profiles, Create Profile, Guest, and Results & Stats. Home keeps the current learner; Change learner returns to selection.
- New flights save to the profile selected at session start. Progress and exports are learner-specific; existing histories remain unchanged and separately accessible as Previous progress.
- Guest flights remain temporary in memory, with no save prompts or export controls; reload or Change learner clears them. Guest flights never transfer into a new profile.
- Added versioned local profile storage with cross-tab write locking, validation before writes, and exportable in-memory recovery for profile flights when saving fails.
- Added brand-kit FF Home Screen icon metadata, a branded favicon, and a web manifest with relative paths for root and subpath hosting. This increment retains browser display mode and does not add offline caching.

### Changed
- Facts to focus on and Flight log now show three rows initially, with independent Show all/Show fewer controls. Full history, filtering, review and exports remain available.
- Clarified incorrect-answer values with explicit “Answer:” labels and an expandable explanation of encounters, averages and attempt counts; the values include speech, keyboard and keypad submissions.
- Updated application metadata to `6.0.0-rc.1` for release-candidate testing; this is not a production release.
- Focus problems now shake and turn red after wrong answers, briefly turn green with “Correct!” before advancing, and flash grey-blue when final speech cannot be interpreted. Wrong-answer red remains until Skip/correction; unclear speech briefly overlays it, then restores red. Feedback includes symbols/text and respects reduced-motion preferences.
- Correct Focus answers remain visible for 350 milliseconds, with repeat input guarded during the transition. Skip, Undo, Finish, scoring and timer expiry remain supported; completion time is captured at the final correct answer.
- Duplicate-only imports now explicitly say “Profile already exists” and show an “Already imported” disabled action. Imports using an older nickname keep the current local name for the matching learner ID.
- Enlarged menu tile labels, descriptions, results text, keypad digits, and session controls. Focus equations are substantially larger, with a separate readable size for longer prompts; compact screens can scroll rather than shrinking text.
- Centered the in-flight Focus layout vertically within the available viewport when space permits; shorter screens retain natural scrolling so controls remain reachable.
- Replaced the public dropdown setup with the approved tile-based Home and guided activity, mode, level, input, and view menus. Quick Practice supports all eight math activities; future subjects are disabled Coming Soon tiles.
- Free Practice now continues until Finish, using a continuous randomized fact source. Skip advances; Undo retains the generated next question. Saved results include attempted/skipped questions, not the unseen final prompt.
- Added in-session Home and guarded navigation: continue the current flight or finish and review saved results before returning Home. Existing speech, School Test, Focus/Worksheet, history stores, and exports remain available.
- Added a pre-session Focus/Worksheet selector for all eight math activities and the original School Test. New activities default to Focus on phones; School retains its worksheet default and can also run in Focus.
- Focus shows one equation with a responsive keypad, question position, timer, Skip/Undo/Finish controls, and recognized speech text. It reuses existing questions, scoring, microphone behavior, and saved results without a storage-schema change.
- Integrated addition, subtraction, multiplication, division, number bonds, doubles, halves, and squares into the working app, with five whole-number levels and 5/10/15/20/30/60-question sets using existing timed/untimed worksheet sessions.
- Kept the original 60-question School Test as a separate choice. New activities use balanced shuffled fact pools with repeat spacing and fresh selection for each session.
- Extended keyboard/keypad and spoken-number parsing to four-digit answers; kept the existing microphone ready/reconnect lifecycle.
- Excluded untouched facts from fact-pattern statistics so unattempted rows do not display invalid percentages.
- Added activity summaries and filtered flight review to Progress, with activity-aware fact reporting and exports. New activity sessions save separately from original history; both appear in Progress and exports.
- Applied the selected brand palette to light and dark themes and added an interim horizontal logo on a cream header backing.
- Replaced remotely loaded fonts with system fonts.
- Added theme-aware focus indicators and correct/wrong answer symbols alongside color feedback.
- Enlarged general controls and arranged phone table-selection buttons in five columns, with wrapping header navigation.

### Fixed
- Practice again now restores the reviewed flight’s activity, level, count, time limit, input and goal instead of using an unrelated recent setup. Missing older settings have explicit defaults shown before starting; no saved history is rewritten.
- Results and Progress now export restore-compatible learner backups, including all learner flights and unsaved-flight recovery. Previous progress archives and CSV remain separate.

### Documentation
- Prepared local 6.0.0 release notes, deployment/backup/rollback checklist and final version metadata; release notes remain Unreleased pending explicit production approval.
- Recorded owner desktop/iOS preview acceptance of the release fixes and compact Progress updates at `63650a0`; production release remains unapproved.
- Audited the v6 candidate against main/v5.0, reconciled current documentation, and recorded release-readiness findings and remaining gates. No production release was made.
- Recorded owner acceptance of configurable sessions and remembered Quick Practice at `693affa`, including the full release checklist on Windows Chrome, iPhone Safari and iPhone Chrome.
- Recorded owner acceptance of red/green/grey-blue answer feedback on desktop and physical iPhone using speech and keypad.
- Recorded owner acceptance of learner renaming and duplicate-import messaging on physical iPhone Chrome and Safari, with progress intact.
- Recorded owner acceptance of learner import/restore on physical iPhone Chrome and Safari, including duplicates and preservation of another learner’s progress.
- Recorded owner acceptance of profile export and deletion on physical iPhone Chrome and Safari, including preservation of another learner’s progress.
- Recorded owner acceptance of learner profiles on physical iPhone Chrome and Safari, including separate progress and non-saving Guest behavior.
- Refined the learner Home mockup so Home retains the current learner or Guest and returns to activity selection; Change learner opens the profile picker.
- Recorded owner acceptance of the branded iPhone Home Screen icon and launch; added a separate learner Home mockup with sample profiles, profile creation, Guest, and learner-specific Results & Stats navigation. No working-app or storage changes.
- Recorded owner acceptance of the larger-text update on physical iPhone Chrome and Safari; added the proposed learner Home, local-profile, backup, and branded Home Screen icon implementation plan.
- Added a separate tile-menu design mockup for review: account-free Home, Quick Practice across all eight activities, guided mode/level/input/view choices, and disabled Coming Soon subject tiles. The working app is unchanged.
- Revised the planned v6 scope to include profiles, Guest, backup/import, expanded math activities and levels; added an experience plan and proposed activity matrix.
- Added a separate clickable experience-design preview with sample learners, activity setup, Focus/Worksheet sessions, results, and backup-review examples. It does not change the running application or access saved app data.
- Improved question variety in the design preview: full level pools, balanced shuffled rounds, and at least three intervening equations between repeated facts when possible, including across streamed batches. Added generator coverage and spacing checks; the running application's generator is unchanged.
- Added an R3 revision marker to the preview and verified randomized repeat-session order through Practice again for all eight activities with unchanged settings.
- Expanded the design preview to five whole-number levels per activity, with harder operand ranges, four-digit answer entry, and an R4 marker. Updated the level matrix and added advanced arithmetic, diversity, and layout checks; production activities remain unchanged.
- Added an R5 activity-level Progress overview to the preview: learner-specific flight counts, correct/incorrect outcomes, first-attempt correct totals, and drill-down to each activity's flight history. Wrong attempts and unanswered questions are reported separately.
- Added the v6 product and development roadmap on the `v6-development` branch.
- Established this changelog to track changes before the next approved release.
- Recorded brand-foundation implementation, owner feedback, static checks, and outstanding device regression checks in [the milestone verification record](docs/v6-milestone-1-verification.md).
- Added an isolated browser regression suite and recorded 18 passing automated Windows Chrome checks, followed by owner acceptance after browser and iPhone testing. Detailed manual regression results remain partially unverified.

> **Release scope:** This section records the approved v6.0.0 release. Historical design/verification entries describe their respective implementation stages; planned follow-ups remain in `ROADMAP.md`.

## [5.0.0] - 2026-11-14

First verified stable release of Fact Flight, a free browser-based multiplication fact-fluency application.

### Added
- 60-question multiplication quizzes with a two-minute timed school-test option and untimed practice.
- Voice-answer recognition with improved spoken-number transcription handling and microphone reconnection support.
- Automatic scrolling to keep the active question in view.
- Custom mobile numeric keypad with an Enter button and inline keyboard answer entry.
- Light and dark themes and responsive layouts for desktop and mobile.
- First-try accuracy, corrections, skips, response-time analytics, and detailed local practice history.
- JSON and CSV exports of locally stored results.
- iOS microphone and speech-recognition permission guidance.

### Verified compatibility
- Windows Chrome.
- iPhone Safari and Chrome, with the necessary microphone and speech-recognition permissions enabled.

### Data compatibility
- Existing practice history is stored locally in the browser. Future releases must preserve compatibility with the `fact-flight-history-v1` history key.

**Release record:** [Fact Flight v5.0](https://github.com/nattodd/FactFlight/releases/tag/v5.0)

---

## Maintenance rules

1. For each completed feature, meaningful behavior change, or bug fix, update **[Unreleased]** in the same change or commit.
2. Use factual, user-facing descriptions. Do not mark planned features as implemented.
3. Before release, compare `v6.1-development` with `main`, reconcile the changelog with the actual code changes, and verify regression tests.
4. Only after explicit production approval, move verified entries to a dated release section and publish the corresponding GitHub release.
5. Do not rewrite historical release notes without a documented correction.
