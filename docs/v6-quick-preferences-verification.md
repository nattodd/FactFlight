# Remembered Quick Practice

## Behavior and storage

- First use opens Quick setup. Once a Quick session actually begins, Home shows its activity, level, count, input, view and optional goal. Start again immediately generates a fresh randomized set; voice opens the existing microphone/ready flow. Change options opens setup with the previous selections. Merely selecting options or cancelling voice setup does not replace the shortcut.
- Timed Practice, Custom Test, Free Practice and School Test do not replace Quick preferences. Learner preferences are keyed by stable ID, so renaming keeps them separate.
- Each learner has a disposable `fact-flight-quick-v1:<learner ID>` localStorage entry. No learner/history schema or historical record is changed. Preferences are not part of result exports/imports. Last successful start in another tab is read when Home renders or Start again is pressed. A failed preference write retains a temporary in-tab choice and displays a warning on Home rather than claiming persistence.
- Guest preferences remain in memory only and clear on reload, selection or Change learner. Deleting a learner removes their preference entry; failure to remove the entry is reported separately after successful results deletion. Corrupt or unsupported preferences fall back to setup without blocking practice.

## Local checks

The dedicated suite passed 10 checks: first-use setup, fresh direct starts, reload, non-Quick isolation, retained setup selections, two learners, Guest lifetime/no preference writes, mocked voice ready/cancellation, invalid preferences, failed preference writes, deletion cleanup, and layouts at 320×568, 390×844, 844×390 and 1440×1000. The phone screenshot was visually inspected and the action buttons have distinct spacing. Tests use isolated synthetic browser data.

All 53 targeted regression checks also passed: menu 13, profiles 15, learner management 11, configurable sessions 14. Together with the dedicated suite, 63 local Chrome checks passed. JavaScript syntax checks and `git diff --check` also passed. These checks supplement the 136 checks passed for the preceding configurable-session change; they are not new physical-device evidence.

## Remaining review

The original implementation request did not authorize a commit, push or deployment; subsequent preview approval is recorded below. Real microphone/permission behavior and physical iPhone Safari/Chrome, Android and tablet checks remain unverified for this increment. After an approved preview push, verify first setup, Start again, Change options, two learners, Guest reset, voice ready, and both views on the phone. Existing feedback and scoring behavior should remain visible during repeat flights.

## Owner acceptance and preview approval

The owner tested the Quick Practice changes locally and confirmed that they work and improve usability. Browser/device details were not specified. The owner approved committing and pushing the configurable-session and Quick Practice increments together to `v6-development` for testing at the normal Netlify preview address. Physical iPhone acceptance remains pending.

## Combined preview device acceptance — 2026-11-14

The owner tested deployed commit `693affa` and explicitly confirmed Windows Chrome, iPhone Safari, and iPhone Chrome passed the full release checklist: original School Test and expanded math; speech ready/answers/reconnect; keypad/keyboard fallback; timed and Free Practice; Skip/Undo/Finish/Home; Focus and Worksheet; scoring/activity totals; and saved results after reload. This is owner-reported manual verification. Android and physical tablets remain unverified. Specific enlarged-text, screen-reader, operating-system permission-reset and every orientation combination were not individually attested.
