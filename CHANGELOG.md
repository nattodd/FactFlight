# Changelog

All notable changes to Fact Flight are documented here.

This file records **implemented changes**, not ideas or planned features. The public [ROADMAP.md](ROADMAP.md) describes proposed work and future milestones.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions, with entries grouped under **Added**, **Changed**, **Fixed**, and **Removed** where relevant. Versions follow [Semantic Versioning](https://semver.org/) where practical.

## [Unreleased]

## [6.3.0] - 2026-11-19

### Documentation
- Recorded owner-reported v6.3 functional acceptance on Windows Chrome and iPhone Chrome/Safari; owner subsequently approved publication.
- Prepared v6.3.0 version metadata and refreshed release notes, candidate references and promotion gates; owner accepted Windows/iPhone testing and approved publication.
- Added an unscheduled Games & Strategy → Chess proposal centered on tactical pattern recognition, with supporting activities, illustrative phases and future compatibility requirements. Updated the roadmap graphic and README; existing release commitments remain unchanged. No Chess functionality is implemented.

### Fixed
- Release preparation updates regression assertions for the current Quick Practice summary layout and 6.3.0 metadata; no practice behavior changes.
- Opening Progress uses the shared mobile heading focus and framing, scrolling past the logo/navigation; mastery notification links still focus the specific earned choice.
- Dark-mode Progress metric cards match the warm Mastery/Results panels; the Results chart icon uses a transparent background so its bars remain visible in both themes.
- School Test table selection uses equal-sized choices with reserved mastery-badge space and three columns on phones; the test itself is unchanged.
- Mastery activity summaries distinguish facts mastery from timed School Test achievements; numbered levels and collapsed family-range sections show their own mastered counts.
- Completed flights show a quiet first-mastery card for newly qualified levels or chosen families, with a link to readiness details. Prior achievements are derived from retained learner history to suppress repeats and regained-mastery notices; School Tests use a separate timed-achievement message. No backup fields are added.
- Quick Practice shows mastery beside the remembered level or family selection, keeping the start button clear; mixed selections identify when only some choices are mastered.
- Progress summary cards use warm cream with clear borders; Results matches the soft-yellow Mastery heading, with readable warm dark-theme equivalents.
- Parent practice focus uses a tappable checkbox card with an adjacent label, concise help and expandable setting details in both themes.
- Chosen table/divisor tiles use three columns on narrow screens, equal-height rows and a contained trophy/label stack so mastered labels do not spill across borders.
- Activity tiles bottom-align mastery trophies and partial-progress labels, with wrapping and natural height for longer text.
- Math footer consistency: the Math label appears above the left-aligned Back button using the shared menu action-bar layout.
- mobile action-bar alignment: Back sits on the left of the Math bar, and Continue/Start no longer inherit the narrow-screen top margin that offset them from Back.
- menu consistency: all selectable tile symbols use the brand-yellow background and dark foreground in both themes. Coming Soon and parent-restricted choices retain unavailable styling.
- owner refinement: Math group tiles again use the shared activity-tile sizing and typography. School Test stays below the tiles with normal scrolling; menu framing and deeper tile sizes are preserved. This supersedes the earlier compact Math-tile treatment.
- compact Math icon correction: Numbers & Counting uses a contained vector 123 icon so font rendering cannot extend the digits beyond the icon border.
- follow-up: mobile framing budgets for content above the heading so shorter menus align consistently; post-flight results use the same framing. Focus questions size to available width rather than character count, keeping the trailing equals/question mark together.
- mobile navigation correction: entering menu steps scrolls the relevant heading into view above the choices; Back restores the triggering choice into view. Math group tiles use the shared activity sizing after owner review; the School Test shortcut remains below them with normal scrolling. Deeper tile dimensions remain unchanged.
- Final regression updates the Home-menu assertion to verify the restored three disabled Coming Soon tiles; no runtime behavior changed.
- Coming Soon refinement: bottom-aligned badges, consistent theme-aware tile/icon borders, and vector book, shapes and clock icons replace platform-dependent symbols. Applies to subject and Math menus; practice behavior is unchanged.
- preview visual corrections: Operations & Facts uses a contained four-symbol icon; future subjects and Math groups return to disabled Coming Soon tiles. Progress uses bordered result metrics and a chart icon; later owner refinements use the warm Mastery palette. School Test, reporting calculations and learner records are unchanged.
- regression fix: cross-tab readiness/focus refreshes now update practice menus only, preserving import review errors and in-progress management forms when another tab saves learner data.
- Redacted personal home-directory prefixes from 13 verification documents/result files without changing historical test outcomes. This is a documentation privacy correction; existing Git history and published copies are not erased by a later cleanup commit.

### Added
- Final v6.3 candidate regression evidence and draft release documentation, with preview status reconciled and physical-device acceptance tracked separately.
- regression runner, validated synthetic learner-backup generator and v6.3 Windows/iPhone device checklist. Full automated evidence separates current application, engine and retained prototype checks from unverified physical-device acceptance.
- mastery trophies in activity, level, chosen table/divisor and School Test menus, plus the per-learner Parent corner “Focus on unmastered practice” preference (off by default). Restricted choices retain readable trophies/stripes and explanations; one-flight review allowances, explicit mixed-selection removal and missed-fact review prevent dead ends. Start checks cover remembered/repeated/next choices and voice readiness. Active flights, School Test content and learner backup formats remain unchanged; owner device acceptance is recorded in the release checklist.
- Progress refinement: expanded activity cards use the full available width; “What to do next” gives plain-language practice steps, with detailed evidence rules behind a separate disclosure. Readiness calculations and saved records are unchanged.
- Progress dashboard connects shared reports and readiness to the reviewed two-section design: three responsive summary cards, collapsed Mastery/Results, eight equal activity cards, coverage explanations, separate timed achievements, range-specific families, filtered reports, comparable records and flight logs. Selectable tables 1–12 stay separate from higher encountered factors. Existing JSON backups, School Test and saved records are unchanged. Synthetic Chrome checks pass; owner visual and device acceptance is recorded in the release checklist.
- Math navigation: Operations & Facts shows all eight activity tiles directly, without an intermediate category click. Quick Practice opens the same eight activities, repeat shortcuts remain direct, Back restores context/focus and future areas are disabled Coming Soon tiles. School Test retains its shortcut and preset. No saved-record or generator changes in this navigation increment; owner device acceptance is recorded in the release checklist.
- chosen division families and multiplication tables 1–12, with separate through-10/12 ranges, remembered settings, repeat/next actions and missed-fact review. Existing backups and old through-10 selections retain their meaning; new scopes use session schema 4 and their reviews use review payload version 2, requiring v6.3 readers. Original School Test remains unchanged. Physical-device acceptance is pending; available on the authorized v6.3 Branch Deploy, not released to production.
- numbered-level generator increment: approved L2/L3 allocations, learner-specific in-memory carryover and bucket-balanced family selection. Released pools, L1/L4/L5 behavior, chosen tables, missed-fact review and School Test remain unchanged; no saved schema changes. Educator graphs now compare the preserved released baseline with measured output. Physical-device acceptance remains pending.
- educator and parent guide with eight reproducible figures covering all 40 numbered scopes, exact pools, approved allocation targets and measured repetition tradeoffs. Graphs and quantitative sections regenerate from shared definitions, the preserved baseline and synthetic audit output.
- Reproducible synthetic audit and documentation of all 40 numbered activity/level pools, fact-type definitions, repetitions, identity runs and adjacent structural similarities. Released baseline data is preserved separately from the new generator audit.
- v6.3 calculation foundation for fact-family classification, explicit reporting denominators, range-specific readiness and separate timed achievements, with synthetic tests. Short flights accumulate; completion credits use the outer flight window so long flights also qualify. Content definitions now support the generator; reporting/readiness were initially disconnected and are now connected by the Progress increment. Voice, saved history and schemas are unchanged.
- Planning documentation for the owner-approved expanded v6.3 scope, rules, synthetic acceptance cases and required Progress mockup fidelity, with a synchronized roadmap image. This documents future work only; no v6.3 application features are implemented by this update.
- staged-file and commit-message privacy hooks, GitHub noreply identity checks, ignored private-file patterns, and a proposed CI privacy check. Checks report rule names/locations without printing matched values. These safeguards do not rewrite existing history or change app behavior.

## [6.2.0] - 2026-11-16

Owner-accepted mobile practice, targeted review and progress improvements. iOS voice retry remains a known limitation; keypad fallback is supported. See [release notes](docs/v6.2-release-notes.md).

### Fixed
- Learner saving is limited to one open tab to prevent concurrent whole-family writes from replacing another learner or flight. Other tabs show a warning, retain viewing/export and Guest practice, and keep unsaved flights exportable. Close the saving tab and reload the other tab to transfer saving; export unsaved results before reloading. Existing records and backup formats are unchanged.
- Selecting an activity in Progress now focuses and scrolls to its heading and facts report instead of retaining a scroll position near the exports at the bottom. Returning to All activities anchors its heading too; filtering, history and existing disclosure controls are unchanged.
- The local iOS recovery candidate restores continuous recognition across ready and answers, with explicit abort on completion/cancellation/backgrounding. It removes per-answer synthesis, natural-end scoring, per-answer cooldowns and Audio Session category overrides from the quiz. Unexpected iOS endings require a deliberate retry; the owner subsequently accepted microphone checks and keypad fallback; improved repeat-voice reliability is not claimed.
- Review retries recalculate eligibility from current learner results, removing facts after two later first-try successes while keeping the original review scope.
- Exact iOS substitutions continue to accept “sex” as six, “thor”/“poor” as four, and “freddy” as ready during setup, independently of the expected answer. Earlier Mode H repeated-flight acceptance did not establish microphone release; that lifecycle is no longer used by the application.
- iOS recovery distinguishes missing start confirmation, missing results and reported permission/service errors. Startup/readiness attempts time out after eight seconds without the relevant event; active flights stop recognition after twenty seconds without results, preserving answers and timer behavior. Try microphone again stays prominent, Tap or type instead returns to the same setup, and a failed retry expands setup-preserving refresh. These timeouts do not diagnose a browser fault. Desktop retains its existing continuous recognition and recovery behavior.
- Short worksheets align answers and controls; ten-question worksheets use two columns of five on wide screens and one column on narrow screens. Original School Test retains its three-column layout. Progress sections and Show all controls have consistent borders and spacing.

### Added
- Parent corner offers Disable microphone for every learner and Guest in this browser. Restricted voice options are disabled and labeled Parent restricted; remembered starts, review and reconnects respect the restriction. Other open tabs stop voice when the setting changes. The setting is local, not PIN-protected or an OS-wide permission control.
- Missed-fact review from Results uses that session; Progress defaults to All activities or one activity across the latest five eligible flights. Select up to five unique missed/skipped facts for untimed practice. Mixed reviews retain each fact’s original activity and level/table context; Guest review remains temporary.
- Review setup defaults to Worksheet on desktop and One at a time on phones. Each learner’s last started input/view choices are remembered separately for those layouts; cancelled voice setup does not replace them.
- Per-table multiplication progress shows first-try accuracy and encounter counts, wrong submissions, skips, distinct facts and average active time for a shared recent-five-flight or all-flight window. Overlap, small samples and timing limitations are explicit. Reports read existing history without rewriting it. The owner accepted v6.2c progress/layout on iPhone Safari and Chrome.
- Optional iPhone Refresh & keep setup restores pending learner settings without automatically starting voice or the timer. It blocks Guest and unsaved-result loss; this earlier workaround is not a guarantee of speech recovery.
- Downloadable, temporary microphone event diagnostics exclude audio, recognized words and learner details. Experimental lab code is excluded from the release tree; its history remains in Git.

### Changed
- Finalized `6.2.0` metadata and removed the standalone microphone lab HTML/script from the static release tree. Voice experiments are frozen; no further speech lifecycle changes are included. The owner approved publication to main/GitHub Pages; Netlify production remains unchanged.
- Mobile setup keeps Back and Continue/Start in a persistent bottom action area; Results keeps repeat and eligible Next Level/Table actions reachable. It reserves space and returns to ordinary flow for editing, short viewports, zoom or oversized text.
- Microphone retry and Cancel appear directly below status; iPhone help and refresh options are collapsed. Progress table/activity cards initially show three entries with independent Show all / Show fewer controls.
- New review records and backups require a v6.2-compatible reader. Older history is preserved; local-only result storage and optional voice remain unchanged.
- Final regression updated older test expectations for waiting-for-speech status, scoped replay notices and collapsed activity cards. See [automated evidence](docs/v6.2-final-regression.md) and [remaining manual checks](docs/v6.2-manual-release-checklist.md). Earlier experimental voice notes are consolidated here into final behavior; their chronology remains in the increment verification documents. Version 6.2.0 is the released scope.

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
