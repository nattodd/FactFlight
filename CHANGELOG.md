# Changelog

All notable changes to Fact Flight are documented here.

This file records **implemented changes**, not ideas or planned features. The public [ROADMAP.md](ROADMAP.md) describes proposed work and future milestones.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions, with entries grouped under **Added**, **Changed**, **Fixed**, and **Removed** where relevant. Versions follow [Semantic Versioning](https://semver.org/) where practical.

## [Unreleased]

### Changed
- Applied the selected brand palette to light and dark themes and added an interim horizontal logo on a cream header backing.
- Replaced remotely loaded fonts with system fonts.
- Added theme-aware focus indicators and correct/wrong answer symbols alongside color feedback.
- Enlarged general controls and arranged phone table-selection buttons in five columns, with wrapping header navigation.

### Documentation
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

> **Release status:** No v6 application features have been released. Planned features belong in `ROADMAP.md` until implemented and verified. The `main` branch remains the production version.

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
3. Before release, compare `v6-development` with `main`, reconcile the changelog with the actual code changes, and verify regression tests.
4. Only after explicit production approval, move verified entries to a dated release section and publish the corresponding GitHub release.
5. Do not rewrite historical release notes without a documented correction.
