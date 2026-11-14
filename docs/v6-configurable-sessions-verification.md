# Configurable Timed Practice and Custom Test

## Scope

- Both modes offer 5, 10, 15, 20, 30 or 60 questions and 1, 2 or 5 minutes for all eight math activities and existing levels. Timed Practice defaults to 20 questions/two minutes; Custom Test defaults to 60/two minutes. Both retain retry and revisit-unresolved behavior, ending on completion, expiry, or Finish.
- Setup uses the existing large button choices, shows settings before starting, and retains them through Back and Practice again. Optional first-try goals cannot exceed the selected count.
- Original School Test keeps its generator, tables 2–10, 60 facts, two-minute deadline, and both views. Its duration is explicitly fixed at session start, even after a custom session.
- The existing engine captures the selected deadline at begin and uses it for display, answer cutoff, expiry, and elapsed-time capping. Voice starts after ready. Feedback, skips, Undo, guarded Home/Finish, input fallback, and scoring definitions remain intact.
- New expanded-math flights include optional `practiceType` and `timeLimitMs` fields. Results/history and JSON/CSV exports expose them. Old records are not rewritten; old imports without these fields remain valid. No storage key/version change or migration is performed. Import validates new fields and their consistency with mode. School records retain their existing format.

The owner confirmed there is no history requiring backup before this change. All automated checks use isolated synthetic data; no real learner data is modified.

## Local verification

The new configurable-session suite passes 14 checks, including all durations in both modes/views, all activities, every count choice, first-try goal bounds, repeat settings, before/at-deadline answers, correct-answer feedback across expiry, voice ready/reconnection simulation, School isolation after custom settings, reload persistence, legacy-format import acceptance, malformed-setting rejection, and synthetic restore writes preserving another learner and recognizing duplicates.

Setup layouts pass horizontal-overflow checks at 320×568, 390×844, 844×390, 768×1024, and 1440×1000. Phone and desktop screenshots were visually inspected. JavaScript syntax and `git diff --check` pass.

All 122 existing regression checks also passed in isolated Windows Chrome 157.0.8103.51: menu 13, answer feedback 8, Focus 11, original engine/brand 18, math 12, profiles 15, learner management 11, import 16, rename 9, and readability 9. Together with the new suite, 136 checks passed. Existing engine fixtures exercise the original controls separately; public menu/profile suites exercise the integrated app. Synthetic v5 and expanded legacy records remain byte-identical and readable.

## Remaining manual checks

This increment has not been committed, pushed or deployed. Physical iPhone Safari/Chrome and desktop microphone verification remain pending. Automated speech is mocked; emulation does not verify actual touch, browser bars, permissions, microphone reliability, or orientation behavior. Android and physical tablets remain unverified.

After a separately approved preview push, test one- and five-minute sessions with speech and keypad, early completion/Finish, Skip/Undo/Home, both views, learner save/reload and export/import, and the original two-minute School Test. Confirm voice waiting does not consume session time and the selected settings are readable in both themes and phone orientations.

## Owner browser acceptance

The owner tested the configurable-session changes in their browser and reported that they work. Browser name and detailed coverage were not specified; physical iPhone review remains pending.

The owner subsequently approved committing and pushing this increment together with the remembered Quick Practice shortcut to the normal Netlify preview for phone review.
