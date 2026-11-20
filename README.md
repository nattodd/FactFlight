# ✈️ Fact Flight

**Little practice. Big confidence.**

Fact Flight is a free, browser-based math fact fluency application designed to help elementary school students build speed, accuracy, and confidence through interactive practice.

## Release status

**v6.3.0 is the current release.** It adds intentional practice mix, division families and tables through 12, clearer Progress/readiness, optional parent focus and refined mobile menus. See the [v6.3.0 release notes](docs/v6.3-release-notes.md) and [publication record](docs/v6.3-release-record.md).

**Previous release: v6.2.0.** It adds mobile bottom actions, missed-fact review, per-table progress, parent microphone controls and safer single-tab learner saving. The owner accepted the release-check groups. Voice is frozen; iOS retry remains a known limitation, with keypad fallback available. See the [v6.2.0 GitHub release](https://github.com/nattodd/FactFlight/releases/tag/v6.2.0), [release notes](docs/v6.2-release-notes.md) and [release record](docs/v6.2-release-record.md).

Version **6.1.0** adds remembered per-learner/activity settings, one-tap Practice Again, Next Level, multiplication Choose Tables 1–10, and Next Table(s). Selected tables appear consistently in active headings, results, history and exports. Original numbered levels and School Test remain available. Voice waits for “ready”; Guest stays temporary and learners’ progress stays separate.

New table-selected backups require a v6.1-compatible reader; older records are not rewritten. See [release notes](docs/v6.1-release-notes.md), [automated results](docs/v6.1-final-regression.md), [manual results and accepted limitations](docs/v6.1-manual-release-checklist.md), and the [approved promotion/rollback plan](docs/v6.1-release-plan.md). The [v6.1.0 GitHub release](https://github.com/nattodd/FactFlight/releases/tag/v6.1.0) is published at main commit `f760615`. Production assets and automated smoke checks passed; the owner confirmed production voice on Windows Chrome and iPhone Chrome/Safari. **v6.1.0 is complete.**

GitHub Pages is the stable production destination. Netlify’s primary site remains on v6.0.0 / `v6-development`. The separate [v6.2 Branch Deploy](https://v6-2-development--factflight-preview.netlify.app/) is the preview for `v6.2-development`. v6.2a–c are implemented there: mobile bottom actions, missed-fact review, iOS voice recovery, and per-table progress/layout improvements. The owner accepted the mobile layout and v6.2c progress/layout on iPhone Safari/Chrome, and subsequently confirmed the activity-scroll fix on iPhone (browser not specified). Earlier Mode H recognition acceptance was superseded by the microphone-release regression and continuous-voice recovery. The owner subsequently reported all release-check groups passed; **v6.2.0 is released**.

See the [v6.2 release notes](docs/v6.2-release-notes.md), [final automated regression and branch review](docs/v6.2-final-regression.md), and [manual acceptance record](docs/v6.2-manual-release-checklist.md). Backups containing new review sessions require a v6.2-compatible reader; older records are not rewritten. Rollback requires separate owner approval and must preserve new review and targeted-table records.

## Features

v6.3.0 includes the mobile, Progress and mastery refinements tested from preview `5170ca4`. See [final automated regression](docs/v6.3-release-preparation-regression.md), [release notes](docs/v6.3-release-notes.md) and [remaining release gates](docs/v6.3-release-plan.md). The owner reports successful functional testing on Windows Chrome and iPhone Chrome/Safari; see the [Windows Chrome / iPhone Safari / iPhone Chrome checklist](docs/v6.3-device-checklist.md) and its synthetic test learners. The owner authorized its [Netlify Branch Deploy](https://v6-3-development--factflight-preview.netlify.app/) for device testing. Confirm the deploy matches the development branch head before testing; the publication record identifies the released commit.

The v6.3 preview also includes mastery menu trophies and optional per-learner **Focus on unmastered practice**, off by default. Parents can allow one review flight; missed-fact review stays available. These preferences are separate from learner backups. See [local focus verification](docs/v6.3-focus-verification.md); owner device acceptance is recorded in the release checklist and v6.3 production publication is owner-approved.

The v6.3 preview includes the reviewed Progress dashboard structure, with separate readiness and results, synthetic fixtures, and preserved learner backup formats. See [local dashboard verification and pending review](docs/v6.3-progress-verification.md).

Version 6.2.0 adds Parent corner → Disable microphone, covering all learners and Guest in this browser, with Parent restricted voice choices and typed/touch fallback. It persists across reloads but is not a PIN lock or a device-wide browser permission. Other browsers and cleared website data are separate. The owner accepted the parent restriction. The earlier microphone cleanup and audio-session workaround failed iPhone release testing. Version 6.2.0 restores continuous iOS recognition without per-answer cues or audio-session overrides; the owner reports that the amber indicator clears, but retry worked only about one in six attempts. The owner subsequently accepted microphone checks and keypad fallback; this does not establish that iOS retry reliability has improved. See the [local recovery verification and iPhone checklist](docs/v6.2-continuous-voice-verification.md).

The core math and family features below remain available in v6.1.0 alongside the improvements listed above.

The app opens with a learner picker. Select or create an optional nickname profile, or continue as Guest. After selection, Home returns to that learner’s activity menu; Change learner returns to the picker. Choose Quick Practice for any of the eight math activities, or Math → activity → mode → level → input/view. Five levels remain available for addition, subtraction, multiplication, division, number bonds, doubles, halves, and squares. Letters & Sounds, Colors & Shapes, and Reading are marked Coming Soon and cannot be opened. Profiles are local to this browser and device; no sign-in or cloud account is created. Version 6.2.0 allows learner saving in one tab at a time. Other tabs show a saving warning; saved results remain viewable/exportable and Guest still works. Export any unsaved flight, close the saving tab, then reload the other tab to save there. Close old-version tabs before testing the candidate.

Quick Practice offers 5/10/15/20 questions without a timer. After the first Quick flight starts, Home shows that learner’s choices and offers Start again with fresh questions or Change options. Activity, level, count, input, view and optional goal are remembered locally per learner; other modes do not replace them. Voice still waits for “ready.” Guest remembers choices only until reload or Change learner. These disposable preferences are separate from result backups and are removed when the learner is deleted. Free Practice continues until you choose Finish. Timed Practice and Custom Test offer 5/10/15/20/30/60 questions with a 1-, 2-, or 5-minute limit. Both finish when all questions are correct, time expires, or you choose Finish. Custom Test defaults to 60 questions and two minutes; Timed Practice defaults to 20 questions and two minutes. The clock starts after “ready” for voice, or when starting with keypad/keyboard. New flight reviews and exports retain the chosen practice type and time limit; older records remain readable without being rewritten. The original School Test remains a distinct multiplication preset with tables 2–10, 60 facts, and its original generator and scoring.

Choose Focus or Worksheet before starting. In Focus, wrong answers shake the problem card red until skipped or corrected; correct answers shake green with a “Correct!” label for 350 milliseconds before advancing. Unrecognized final speech flashes grey-blue without counting as a wrong answer. Feedback uses symbols/text as well as color, and reduced-motion settings disable shaking. Skip, Undo, Finish, and Home are available during sessions. Home or other navigation asks whether to keep practicing or finish and review results; the clock and microphone continue while deciding. Results include Return Home. Practice again restores the reviewed flight’s settings rather than the last unrelated setup. The current flight retains its selected view while open; older/reloaded flights do not store a view, so the setup explicitly asks you to review Focus/Worksheet. Older records without a practice type reopen as fixed timed/untimed sets, and older untimed School worksheets stay untimed. Free Practice skips move forward and remain in results for review; finite sessions retain the existing revisit-unresolved behavior.

New flights save to the learner selected when the flight starts. Results & Stats is filtered by learner and activity. Facts to focus on and Flight log initially show three rows; expand each independently to see the full list. “Recent incorrect values” lists submitted answer values, not the number of mistakes; Wrong attempts supplies that count. Guest flights are temporary: they can be reviewed while using Guest but are never saved or exported, and clear on reload or Change learner. Create/select a profile before starting to save future flights; Guest results do not transfer.

The v6.2 development preview adds **Times tables at a glance** in Results & Stats (All activities or Multiplication). Choose a table and Recent 5 flights or All flights to see first-try correct/encounter counts, wrong attempts, skips, distinct facts and average active time. Reversed facts contribute to each relevant table, so table totals overlap. Small samples are labelled. Active time includes microphone preparation, listening, input and retries; iPhone voice delay makes it unsuitable as a pure recall-speed measure. Times-table and activity sections initially show three cards, with independent Show all / Show fewer controls. Short non-School worksheets use larger inline answer controls: five questions form a list, and ten use two columns of five on wider screens (one list on phones); School Test retains three columns. This read-only report uses existing learner history. The owner accepted the v6.2c progress and layout changes on iPhone Safari and Chrome; v6.2.0 was subsequently released after the owner accepted its release checks.

Existing original and expanded-math history stays untouched under Previous progress. It is not automatically assigned to a learner. Learner JSON backups from Results, Progress, and Manage learners use the same restorable format and include all of that learner’s flights, even from an activity-filtered report, plus any unsaved flights available in this tab. CSV remains an analysis export for the displayed history; Previous progress has its own archive exports. Export files include learner identity and the existing per-question detail. Profiles and sessions use a separate versioned local store with cross-tab write locking. If saving fails, a profile flight stays available in memory for export; an explicit error replaces the saved message. Use **Parent corner → Manage learners** to change a learner’s nickname without changing their ID or progress, export an individual profile and its results, or delete it after reviewing the name and flight count in a separate confirmation. Deletion only affects that learner in this browser; other learners and Previous progress remain unchanged. The management export contains the profile plus its sessions, including any unsaved flights available in this tab. Use **Parent corner → Manage learners → Import learner** to restore a JSON file exported from Manage learners. Review the learner, new flights, duplicates and conflicts before saving. Identical flights are skipped; conflicting IDs block the entire import without overwriting anything. Matching names alone never merge profiles. The importer accepts the version-1 learner backup from Results, Progress or Manage learners, including empty profiles; it does not accept CSV, previous-history archives, older single-flight/Progress arrays, or full-family backups. A duplicate-only review says “Profile already exists” and “Already imported.” If a backup uses an older nickname for the same learner ID, import keeps the current local name. Full-family backup/restore and deliberate assignment of Previous progress remain future increments.

Local automated profile/menu regressions are recorded in `docs/v6-profiles-integration-verification.md`. The owner accepted separate profile progress and non-saving Guest behavior on iPhone Chrome and Safari. The owner also accepted export/deletion on iPhone Chrome and Safari. The owner accepted import/restore on iPhone Chrome and Safari, including duplicate skipping and preservation of another learner. The owner accepted learner renaming and the clearer import message on iPhone Chrome and Safari, with progress intact. The owner also accepted red/green/grey-blue answer feedback on desktop and iPhone using speech and keypad; browser names were not specified for that feedback check.

- 60-question multiplication fluency quizzes covering factors 1–10
- Two-minute timed tests and untimed practice
- Spoken answers using browser speech recognition or typed answers using a keyboard
- On-screen numeric keypad with an **Enter** key for mobile practice
- Inline answer entry, automatic movement to the next fact, and scrolling to the active question
- Light and dark modes
- First-try accuracy, corrections, skips, and response-time tracking
- Detailed practice history and identification of frequently missed facts
- Responsive layout for desktop and mobile devices
- Local progress storage with JSON and CSV export

## Try Fact Flight

**[Launch stable Fact Flight](https://nattodd.github.io/FactFlight/)** · **[Test the v6 preview](https://factflight-preview.netlify.app/)**

No downloads or accounts required. For the best experience, open Fact Flight directly in a browser, not inside a messaging-app preview. Safari and Chrome on iPhone have both been tested for voice practice, with the appropriate permissions enabled.

## Enable voice answers: microphone and speech recognition

Fact Flight uses the browser's speech recognition feature to convert spoken math answers to text. Tap **Start a session**, grant any requested permission, and say **“ready”**. The timer begins after “ready.” If speech recognition stops, tap **Reconnect microphone**, or switch to keyboard input.

### iPhone / iPad — Chrome

Two separate iOS permissions may be required:

1. Open **iPhone Settings → Apps → Chrome** and turn **Microphone** **On**.
2. Open **Settings → Privacy & Security → Speech Recognition** and enable **Chrome**, if listed. Depending on iOS version, Speech Recognition may also be available from Chrome's app settings.
3. Open Fact Flight in Chrome and allow microphone access for the website when requested.
4. Return to Fact Flight and begin a new voice session. If necessary, fully close and reopen Chrome after changing permissions.

**Note:** Microphone permission alone may not be enough. On our iPhone tests, enabling Chrome's separate **Speech Recognition** permission resolved the “Microphone: Disconnected” issue.

### iPhone / iPad — Safari

1. Open Fact Flight in **Safari** and allow microphone/speech recognition access when prompted.
2. If microphone access was previously blocked, open the website's **Page Menu → Website Settings → Microphone** and change it to **Allow** (menu wording varies by iOS version). You can also review **Settings → Apps → Safari → Microphone**.
3. If Safari appears under **Settings → Privacy & Security → Speech Recognition**, enable it.
4. Reload the website and try a new voice session.

Fact Flight also supports being added to the iPhone Home Screen from Safari. Test microphone access after adding it, because Home Screen web apps can have different permission behavior.

### Android — Chrome

1. Open **Android Settings → Apps → Chrome → Permissions → Microphone**. Set the permission to **Allow while using the app** (wording varies by phone and Android version).
2. Open **Chrome → ⋮ → Settings → Site settings → Microphone**. Make sure sites can request microphone access.
3. If `https://nattodd.github.io` is under **Blocked**, open its entry and change the microphone permission to **Allow**.
4. Return to Fact Flight, allow microphone access when prompted, and start a new voice session.

Android generally does **not** have the same separate, system-wide **Speech Recognition** switch used by iOS Chrome. Browser speech recognition availability can still vary by Android version, browser, and installed speech services. If unavailable, use keyboard mode.

### Desktop — Chrome / Edge

1. Open Fact Flight over **HTTPS**.
2. In the browser's **site controls / site settings**, allow **Microphone** for the website.
3. Check that the intended microphone is selected and not muted.
4. Reload the page and start a new voice session.

The current local v6.2 candidate uses continuous recognition on iOS: say “ready,” then each answer without per-answer preparation cues. Unexpected endings and missing speech results stop the attempt and offer deliberate retry or typed fallback. Setup includes **Tap or type instead** and **Refresh & keep setup**; refresh is not guaranteed to repair recognition and never automatically starts voice. Existing safeguards block refresh when it would lose Guest or unsaved results. Timers continue during in-flight interruptions. Exact iOS substitutions retain “sex” as six, “thor”/“poor” as four, and “freddy” as ready only during setup. Desktop behavior is retained.

The owner has authorized this candidate for the existing v6.2 Branch Deploy; verify the deployed commit before testing. Earlier owner acceptance of repeated five-question Safari/Chrome flights and its delay does not establish privacy acceptance: the persistent microphone-use indicator is a release blocker. The new lifecycle requires physical release/recovery checks before publication.

### If voice answers still do not work

- Confirm that the app says **Microphone: Connected** before answering.
- Tap **Reconnect microphone** if recognition has stopped.
- Speak one number at a time; use keyboard mode in noisy environments.
- Make sure the device or browser is not blocking microphone access.
- Update the browser and try a fresh session. Recognition can depend on browser or operating-system services, even when microphone permission is enabled.

## Privacy

- Fact Flight does not require accounts or upload quiz performance data to a server. Practice results are stored **locally in the browser** on the device where they were recorded.
- Different browsers and devices maintain separate histories; results do not automatically synchronize. Clearing browser data can erase local progress. Use **Export learner backup JSON** in Results or Progress, or **Parent corner → Manage learners → Export results JSON**, for a backup that Import learner can restore. Previous progress and older single-flight/Progress-array exports remain separate archives.
- The app does **not** store microphone audio recordings. It does store recognized text from answer attempts and unrecognized phrases with session results locally; exported histories may include those transcripts.
- Depending on the browser and platform, speech recognition may use an online service to process audio. Review browser privacy settings if this is a concern.

## Planned Enhancements

**v6.3 planning is expanded:** intentional question mix, a quick and friendly Progress dashboard, explainable readiness trophies and optional parent focus controls join division families, multiplication tables through 12 and grouped menus. The owner accepted the [rules and synthetic acceptance examples](docs/v6.3-rules-specification.md). The Progress interface must follow the privately reviewed Learner Stats Review Mock Dashboard, recreated with synthetic fixtures. These features are not released. The question-mix, chosen-family, grouped-menu, Progress dashboard, menu-trophy and parent-focus increments are implemented locally. Full local regression has passed; physical-device acceptance remains pending. Local development branch: `v6.3-development`; the first shared calculation foundation is now owner-authorized, implemented and [locally tested](docs/v6.3-foundation-verification.md), with content definitions now supporting the local generator; shared reporting/readiness now power Progress, menu trophies and optional focus restrictions. The family extension below adds explicitly versioned new records while preserving existing history.

The local v6.3 family increment adds multiplication tables and division divisors 1–12, with explicit other-factor/answer ranges through 10 or 12. Repeat, Next Table(s)/Divisor(s), preferences and backup readers support these scopes. Existing backups remain readable without record rewrites; backups containing new scopes require v6.3. School Test is unchanged. See [family increment verification](docs/v6.3-families-verification.md). This is not released.

Local navigation follows Math → Operations & Facts → all eight activity tiles directly, with no intervening category click. Quick Practice opens those eight activities directly; saved Quick and result-repeat shortcuts remain direct. Future areas are compact Coming Soon notes. See [grouped-menu verification](docs/v6.3-grouped-menus-verification.md). School Test and backup formats are unchanged by this navigation increment.

The local draft [educator and parent guide: What Children Practice](docs/what-children-practice.md) explains all eight activities and Levels 1–5, with reproducible released/local measured mix graphs and repetition tradeoffs. It contains synthetic audit data only. The approved mix is implemented in the v6.3 preview with temporary carryover; it is included in v6.3.0. See the [generator verification record](docs/v6.3-generator-verification.md).

[View the detailed release roadmap](ROADMAP.md#5-release-roadmap). The graphic shows v6.3.0 Available Now, v6.1/v6.2 features included, and v6.4 onward Coming Soon. Planned sequence does not promise release dates. Games & Strategy → Chess is a separate long-term, unscheduled idea centered on tactical pattern recognition.

![Fact Flight roadmap: v6.2.0 features included with mobile bottom actions, missed-fact review, per-table progress, parent microphone controls and safer saving. v6.1 core features remain included. v6.3.0 is available now with practice quality, clearer Progress, readiness and parent focus alongside division families, tables through 12 and grouped menus. v6.4–v6.7 are Coming Soon; family backups and offline practice have no assigned release. Games & Strategy → Chess is a separate long-term, unscheduled idea focused on tactical pattern recognition.](docs/images/fact-flight-roadmap-v6.3.0.png)

- Full-family backups and deliberate assignment of Previous progress
- Offline caching and update notices
- Early-learning and reading activities
- Personalized review and optional games

## Technology

Built with HTML, CSS, and vanilla JavaScript. Hosted for free using GitHub Pages.

Contributors: install the repository-local privacy hooks and run the checks in [Privacy safeguards](docs/privacy-safeguards.md) before committing or publishing. Keep learner exports, credentials and personal machine paths outside the repository.

## Status

Fact Flight is independently developed with AI-assisted design, implementation, and testing using OpenAI's ChatGPT and Codex.

Actively developed as a personal educational project. Version 6.2.0 builds on the v6.1.0 targeted practice and family experience. Earlier releases are not safe readers for new mixed-review backups; rollback requires a data-preserving plan and separate approval. v5.0 remains a historical baseline.
