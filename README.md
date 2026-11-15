# ✈️ Fact Flight

**Little practice. Big confidence.**

Fact Flight is a free, browser-based math fact fluency application designed to help elementary school students build speed, accuracy, and confidence through interactive practice.

## Development status

The local `v6.1-development` branch starts from v6.0.0. Its first increment remembers last-started practice settings per learner and activity and highlights the selected mode. Returning Home discards unstarted drafts; Back within setup retains them. Existing Quick preferences remain a separate shortcut. Guest choices clear on reload or Change learner. Preferences are disposable browser settings, excluded from learner backups; history formats are unchanged. Owner acceptance for these setup/repeat changes covers desktop Chrome keyboard and physical iPhone Chrome/Safari; see [verification](docs/v6.1-setup-verification.md) and the preview trial record below.

One-tap Practice Again and Next Level are now implemented locally for flights whose complete setup remains available in this tab. They preserve learner, mode, count/timer, input, view and optional goal; Voice still waits for ready. Next Level advances one numbered level, including Free Practice, and is hidden at Level 5 and for School Test. Change options opens setup. Older/reloaded flights without the saved view use Review settings instead. Repeats prefer unused facts when possible and use fresh balanced sequences for small pools. No history or backup format change is made. See [repeat-action verification](docs/v6.1-repeat-verification.md).

Choose Tables is now implemented locally for multiplication: select one or more tables from 1–10, with other factors 1–10, in Quick, Free, Timed Practice or Custom Test. Existing numbered levels and School Test remain available. Selections are remembered per learner and on the separate Quick shortcut; Practice Again keeps the selected tables, and Next Level is hidden for these flights. The Next Table(s) action shifts every selected table up by one, shows the destination, and is hidden if any selected table is 10; the owner verified this action and the corrected selected-table heading on desktop Chrome and physical iPhone Chrome/Safari on the Branch Deploy (`13417bd`) on 2026-11-15. Results, history and exports identify the selected tables. Targeted flights use session schema version 2; existing records are not rewritten, and backups containing targeted flights require v6.1 to import. See [Choose Tables verification](docs/v6.1-tables-verification.md). The owner verified Choose Tables on the Branch Deploy (`ae6e496`) in desktop Chrome and physical iPhone Chrome/Safari on 2026-11-15; input methods and full regression coverage were not specified. Missed-fact practice, table-progress reporting and division-family selection are deferred. Production remains v6.0.0. The owner approved one commit/push of the reviewed G/E/F increment to the separately configured Netlify Branch Deploy; production branches remain unchanged. See [the preview trial record](docs/v6.1-branch-deploy-trial.md).

Final local regression and remaining release gates are recorded in [v6.1 automated results](docs/v6.1-final-regression.md). The owner completed the [desktop and iPhone test checklist](docs/v6.1-manual-release-checklist.md) on Windows Chrome and iPhone Chrome/Safari; fresh permission prompts, unavailable genuine legacy history, and Android/tablets remain explicitly unverified. Production release is not yet approved. Local v6.1.0 metadata, [draft release notes](docs/v6.1-release-notes.md), and a [promotion/rollback plan](docs/v6.1-release-plan.md) are prepared; production remains v6.0.0.

## Features

This section describes Fact Flight v6.0.0. The public GitHub Pages site serves the stable release; Netlify remains the development preview.

The app opens with a learner picker. Select or create an optional nickname profile, or continue as Guest. After selection, Home returns to that learner’s activity menu; Change learner returns to the picker. Choose Quick Practice for any of the eight math activities, or Math → activity → mode → level → input/view. Five levels remain available for addition, subtraction, multiplication, division, number bonds, doubles, halves, and squares. Letters & Sounds, Colors & Shapes, and Reading are marked Coming Soon and cannot be opened. Profiles are local to this browser and device; no sign-in or cloud account is created.

Quick Practice offers 5/10/15/20 questions without a timer. After the first Quick flight starts, Home shows that learner’s choices and offers Start again with fresh questions or Change options. Activity, level, count, input, view and optional goal are remembered locally per learner; other modes do not replace them. Voice still waits for “ready.” Guest remembers choices only until reload or Change learner. These disposable preferences are separate from result backups and are removed when the learner is deleted. Free Practice continues until you choose Finish. Timed Practice and Custom Test offer 5/10/15/20/30/60 questions with a 1-, 2-, or 5-minute limit. Both finish when all questions are correct, time expires, or you choose Finish. Custom Test defaults to 60 questions and two minutes; Timed Practice defaults to 20 questions and two minutes. The clock starts after “ready” for voice, or when starting with keypad/keyboard. New flight reviews and exports retain the chosen practice type and time limit; older records remain readable without being rewritten. The original School Test remains a distinct multiplication preset with tables 2–10, 60 facts, and its original generator and scoring.

Choose Focus or Worksheet before starting. In Focus, wrong answers shake the problem card red until skipped or corrected; correct answers shake green with a “Correct!” label for 350 milliseconds before advancing. Unrecognized final speech flashes grey-blue without counting as a wrong answer. Feedback uses symbols/text as well as color, and reduced-motion settings disable shaking. Skip, Undo, Finish, and Home are available during sessions. Home or other navigation asks whether to keep practicing or finish and review results; the clock and microphone continue while deciding. Results include Return Home. Practice again restores the reviewed flight’s settings rather than the last unrelated setup. The current flight retains its selected view while open; older/reloaded flights do not store a view, so the setup explicitly asks you to review Focus/Worksheet. Older records without a practice type reopen as fixed timed/untimed sets, and older untimed School worksheets stay untimed. Free Practice skips move forward and remain in results for review; finite sessions retain the existing revisit-unresolved behavior.

New flights save to the learner selected when the flight starts. Results & Stats is filtered by learner and activity. Facts to focus on and Flight log initially show three rows; expand each independently to see the full list. “Recent incorrect values” lists submitted answer values, not the number of mistakes; Wrong attempts supplies that count. Guest flights are temporary: they can be reviewed while using Guest but are never saved or exported, and clear on reload or Change learner. Create/select a profile before starting to save future flights; Guest results do not transfer.

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

- Full-family backups and deliberate assignment of Previous progress
- Offline caching and update notices
- Early-learning and reading activities
- Personalized review and optional games

## Technology

Built with HTML, CSS, and vanilla JavaScript. Hosted for free using GitHub Pages.

## Status

Fact Flight is independently developed with AI-assisted design, implementation, and testing using OpenAI's ChatGPT and Codex.

Actively developed as a personal educational project. Version 6.0.0 adds the math and family experience described above while preserving the original School Test. Version 5.0 remains the tagged rollback baseline.
