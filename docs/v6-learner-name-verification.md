# Learner names and duplicate-import clarity — 2026-11-14

The owner accepted learner import/restore on physical iPhone Chrome and Safari, confirmed duplicates are disabled and other learner progress survives, and requested clearer existing-profile messaging plus Change Learner Name.

## Implemented changes

- Parent corner → Manage learners → Change Learner Name opens a prefilled nickname dialog with Cancel and Save name. Names are trimmed, required for renaming, and limited to 24 characters. No real name is required. Cancel/Escape makes no changes.
- The existing family-store lock protects a rename. Only the profile name changes; the learner ID, stored flight records, other profiles, and both Previous progress stores stay unchanged. A deleted learner, concurrent name edit, validation failure, or write failure is reported without overwriting data.
- Current Home/results labels use the current nickname. Stored flight `learnerName` fields retain the original name-at-flight snapshot; historical records are not rewritten. New flights capture the current nickname. No schema migration is involved.
- Import of a duplicate-only backup explicitly says “Profile already exists,” explains that all flights are already saved, and labels the disabled button “Already imported.”
- An older nickname on the same learner ID is informational rather than a conflict: review explains that the current local name will be kept. Ownership still uses stable IDs, and all flight-content, ownership and other profile-metadata conflicts remain blocking. Same names with different IDs remain separate profiles.

## Verification

All 64 targeted isolated Windows Chrome checks passed: 9 rename checks, 16 import checks, 11 management checks, 15 profile checks, and 13 public-menu checks. Coverage includes exact preservation of flight data and other learners; reload and immediate result labels; old-name backup duplicates and new-flight merging; cancel; invalid names; failed writes; concurrent name changes; text escaping; four dialog viewports; existing storage, Guest, School voice mocks, timing, and navigation regressions.

The phone rename dialog screenshot was visually inspected. The rename suite was rerun after refining immediate saved-result labels. `git diff --check` passed. No real user history was accessed or changed during tests.

Physical iPhone Safari/Chrome and Home Screen testing of the new nickname dialog and clearer import messages remains pending. Check the keyboard, Save/Cancel, reload, existing results after rename, and importing a backup exported before renaming. Android/tablet and actual microphone checks remain unverified for this increment. The owner approved committing and pushing this increment to `v6-development` for the normal Netlify preview; physical-device acceptance remains pending.
