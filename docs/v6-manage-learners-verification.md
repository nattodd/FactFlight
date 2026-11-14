# Manage learners — 2026-11-14

The owner requested Parent corner management with export and explicit confirmation before deleting a profile and its results. This increment implements that workflow without changing the family schema or migrating either legacy history store. No real learner data was deleted during development; tests used isolated synthetic browser data.

## Behavior

- Parent corner is accessible from the learner picker as well as the selected learner's activity Home. Manage learners lists each profile and its flight count, with Export results JSON and Delete profile actions.
- Export contains a versioned profile-specific envelope with the selected profile, export timestamp, and its sessions, including failed-save flights still available in this tab. Other learners and Previous progress are excluded. Existing Progress exports retain their earlier formats. Import/restore is not implemented, and the UI states this before deletion.
- A separate modal names the learner and number of flights being removed, offers export, and initially focuses Keep learner. Cancel or Escape performs no storage mutation. Deleting an empty profile is supported.
- Confirmation waits for this tab's pending profile writes before showing the count. Confirmed deletion runs under the same Web Lock as profile creation and saves. It compares the target profile and its sessions against the confirmation snapshot; changes require a fresh review rather than silently deleting newly added results.
- The single family-store write removes only the selected profile ID and sessions belonging to that ID. Other profiles/sessions and both legacy keys remain unchanged. Write failures leave storage intact and display an error.
- Deleting the active learner clears that selection. Home then displays the learner picker. Deleting someone else retains the active learner. A stale tab cannot save a new flight to a deleted learner: the save is rejected and the in-memory result remains exportable. Before starting another flight, a deleted selection is cleared.
- Speech, scoring, timers, question generation, and Guest retention are unchanged. No automatic deletion, remote operation, schema migration, profile rename, or import capability was added.

## Verification

All 39 targeted isolated Windows Chrome checks passed:

- 11 management checks: export/cancel/deletion isolation; exact preservation of other learners and both legacy keys; active/last/empty profile deletion; changed-target rejection and unrelated-tab changes; write failure; stale running-tab save rejection; failed-save export and deletion; four viewport sizes; no page errors.
- 15 existing profile checks: per-learner ownership, Guest, reload/export, old-history compatibility, malformed stores, quota handling, concurrent writes, nickname escaping, and responsive/dark layouts.
- 13 public-menu regression checks: all eight activities, both views, School voice mocks, reconnect, fallback input, timed expiry, continuous Free Practice, guarded Home/Progress, and layouts.

The initial management run had one test-selector ambiguity because a save warning appears in both footer and results; the assertion was scoped to the results status, and the complete suite passed afterward. The phone deletion confirmation screenshot was visually inspected. `git diff --check` passed.

Actual iPhone Chrome/Safari and Home Screen testing of management is pending. After an approved preview push, use disposable test profiles to check export downloads, cancel, confirmation scrolling/focus, deletion/reload, and preservation of a second learner's results. Real microphone/permissions, Android/tablet behavior, and assistive technology were not verified by these automated checks. The prior owner acceptance of profiles remains distinct from this new management increment.

The owner approved committing and pushing this increment to `v6-development` for testing at the normal Netlify preview address. Physical-device acceptance remains pending.
