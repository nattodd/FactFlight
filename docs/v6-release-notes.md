# Fact Flight 6.0.0 — Math practice for the whole family

Release version: `6.0.0` · Tag: `v6.0.0` · Date: 2026-11-14.

Fact Flight v6 adds more ways to practice, an easier phone experience, and separate local progress for each learner. It remains free, with optional nickname profiles and no required sign-in.

## More ways to practice

- Eight activities: addition, subtraction, multiplication, division, number bonds, doubles, halves and squares, each with five whole-number levels.
- Fresh randomized question sets with balanced coverage and repeat spacing when the available facts permit it.
- Quick Practice with 5, 10, 15 or 20 questions. Each learner’s last Quick setup appears on Home for a one-tap fresh start.
- Free Practice continues until Finish. Timed Practice and Custom Test offer 5/10/15/20/30/60 questions and 1/2/5-minute limits.
- The original School Test remains a separate 60-fact, two-minute multiplication preset with tables 2–10.

## Easier to see and use

- Branded Home and tile-based menus, larger text, and an FF icon when added to the Home Screen.
- Focus View shows one problem at a time; Worksheet View remains available, including the original three-column School layout.
- Clear red, green and grey-blue answer feedback with text/symbols and reduced-motion support.
- Speech, keyboard and touch/keypad input, with Skip, Undo, Finish and guarded Home navigation.
- Activity summaries and detailed flight review, with expandable three-row fact/flight lists and clearer incorrect-answer labels.
- Practice again restores the reviewed flight’s available settings and shows setup before starting.

## Local learner progress and backups

- Create, switch, rename or delete optional nickname profiles. Each learner’s progress stays separate.
- Guest results are temporary and are never saved or exported.
- Export a restorable learner JSON backup from Results, Progress or Manage learners. Review imports before saving; identical flights are skipped and conflicts block changes.
- Failed saves are reported, with retained in-tab results available for recovery export.
- Existing v5 history remains unchanged under Previous progress. It is not automatically assigned to a learner.

## Before updating or switching sites

Back up results you want to keep. In v5, export the existing history JSON as an archive. In v6, use Export learner backup JSON or Manage learners → Export results JSON for a restorable learner backup. Netlify preview and GitHub Pages store separate data; switching URLs does not transfer learners automatically. Import v6 learner backups deliberately on the destination site. Older history-array exports are not accepted by the learner importer.

Results are stored in this browser on this device. Recognized speech text can appear in results and exports; the app does not store microphone audio. Browser speech recognition may use an online processing service.

## Validation and limitations

The owner passed the full manual checklist in Windows Chrome, iPhone Safari and iPhone Chrome on the pre-fix candidate, then accepted the release fixes and compact Progress on desktop/iOS. The fixes passed 153 automated checks, followed by 41 targeted checks for compact Progress; these runs overlap and must not be added as unique tests. The audit also passed 2,136 runtime question-generation checks and a local GitHub Pages-style subpath smoke test.

Android and physical tablets remain unverified. Offline caching, standalone-mode changes, cloud synchronization, full-family backup, old-history assignment, letters/sounds, colors/shapes and reading are not included. Future subjects are clearly marked Coming Soon. Previous progress archives and older single-flight/Progress-array exports are distinct from restore-compatible learner backups. Quick preferences are local conveniences, not included in backups. Older flights without view metadata ask you to review Focus/Worksheet when replaying.

Built with material design, implementation and testing assistance from OpenAI Codex and ChatGPT.
