# Learner import and restore — 2026-11-14

## Scope and authorization

The owner requested restoring an exported learner with review before saving, duplicate skipping, conflict reporting, and preservation of other learners and Previous progress. Before implementation, the owner confirmed there is no current history requiring backup. All verification used isolated synthetic records. The existing version-1 family storage schema is unchanged; neither legacy history key is migrated or written.

## Implemented workflow

Parent corner → Manage learners → Import learner accepts a JSON file exported by Manage learners (`fact-flight-learner-export`, version 1). It reads the file locally and validates the envelope, learner identity, activity/School fields, flight ownership, dates, numeric fields, attempts, skips, undo actions and unrecognized phrases. Files over 20 MiB, unsupported versions, malformed/incomplete records, mixed ownership, and unsafe/deep object structures are rejected before any write.

The review shows the learner, whether the profile will be restored or matched by ID, and counts of new flights, identical duplicates and conflicts. Names alone do not merge profiles; a same-name/different-ID profile is explicitly identified as separate. Empty profiles can be restored. Cancel makes no changes.

Duplicate comparison ignores JSON object property order but preserves all field values and array order. Identical repeated flight IDs are skipped, including repetitions within one file. A conflicting flight ID, different owner for a flight ID, or changed details for an existing learner ID blocks the entire import. There is no automatic overwrite, partial conflict import, or conflict-resolution UI in this increment. The review identifies the conflicting record IDs and reasons.

Saving requires an explicit Restore learner or Import new flights action. The store revalidates the file and compares the reviewed family-data snapshot inside the existing Web Lock before one atomic localStorage write. Any intervening family-data change requires Review again. Quota failures preserve the original store and display an error. Pending writes in this tab are awaited; unresolved unsaved flights block import with instructions to export those results before reloading. Guest results are never imported or converted.

The restore preserves profile/flight IDs and complete detailed records, including scoring inputs, transcripts, timing, corrections, skips and undo history. It only adds the reviewed profile and new flights. Other learner records and both Previous progress keys remain unchanged. It does not switch the active learner.

CSV, single-flight JSON, older Progress session-array exports, and full-family backups are not accepted by this importer. Full-family backup/restore and deliberate old-history assignment remain later milestones. Manage learners export and deletion copy now explains that these learner backups can be restored.

## Verification

All 55 targeted Windows Chrome checks passed:

- 16 importer checks: export/delete/restore equality and reload analytics; cancel without writes; reordered-property and repeated-file duplicates; other-learner and byte-for-byte legacy-key preservation; profile/content/ownership conflicts; malformed/unsupported/injected/mixed-owner exports; stale review and quota failure; empty profile and escaped text; all eight activities and School with undo/skip detail; speech transcript/unrecognized-text round trip with mocked recognition; concurrent restore confirmations; four responsive viewports; no page errors.
- 11 existing Manage learners checks.
- 15 existing profile integration checks.
- 13 existing public-menu checks, including School speech readiness/reconnection mocks, input fallback, timed expiry, continuous Free Practice, both views, and guarded navigation.

The 390px review screenshot was visually inspected. `git diff --check` passed. No new real microphone or physical-device pass is claimed.

## Pending device review

After an approved commit/push, test iPhone Safari and Chrome file selection from Files, review scrolling and buttons, cancel, restoring a disposable exported learner, repeat-import duplicates, and progress after reload. Verify a second learner and Previous progress remain intact. Exercise the Home Screen context separately; do not assume its storage is shared with browser tabs. Actual microphone/permissions and Android/tablet behavior remain subject to the repository's manual regression requirements.

The owner approved committing and pushing this increment to `v6-development` for the normal Netlify preview. Physical iPhone file-selection and restore acceptance remains pending.
