# Fact Flight 6.0.0 release plan

Status: **published as v6.0.0; owner production smoke checks accepted**. Release preparation commit `b46821a` was merged and pushed to main as `6cff2087dd0e9e62c1fba4647e8413f0432de66b`. Annotated tag `v6.0.0` points to that main commit. [Published release](https://github.com/nattodd/FactFlight/releases/tag/v6.0.0) · [Production app](https://nattodd.github.io/FactFlight/) · [Release notes](v6-release-notes.md). The owner approved production publication and confirmed no history required preservation on 2026-11-14.

## Completed production verification

- Published HTML, runtime JavaScript, styles, manifest and brand icons matched the released files.
- Automated production smoke passed in an isolated Chrome context: learner creation, Quick Focus keypad completion and first-try scoring, saved results after reload, original School Test setup/launch, Guest entry, and no page errors. This did not exercise a real microphone.
- After publication, the owner confirmed voice, menus, adding/changing/deleting profiles, and answer-box colors work. This is manual production acceptance for those checks; the report did not specify browser/device names or separately confirm microphone reconnection, permission resets, backup round trips, or the full regression checklist.
- Earlier preview regression evidence remains below. Android/tablets and other previously unverified combinations are not newly marked passed.

## Reviewed release contents

Use the accepted `v6-development` app at `63650a0b534c13fe9417f24d3f4f05ecbc6d0d84`, plus the local acceptance/release documentation and the metadata-only change from `6.0.0-rc.1` to `6.0.0`. There are no further behavior changes in this preparation step. Do not include unrelated work or expand scope during promotion.

The final changelog/release should cover brand/Home/icons; eight activities and levels; Quick/Free/Timed/Custom and preserved School; Focus/Worksheet and feedback; local learner management/Guest; progress/replay; restorable learner backups; and history compatibility. Design mockups and prior verification notes remain repository artifacts, not extra shipped app features. Deferred items are listed in the draft notes and audit.

## Verified baseline and targets

- Development/accepted preview: `63650a0b534c13fe9417f24d3f4f05ecbc6d0d84`.
- Stable `main` and tag `v5.0`: `95df2cbaa4057afd04f95145bbd7eabd0159cf94`.
- Remote refs matched these SHAs during preparation; proposed `v6.0.0` tag did not exist.
- Public production URL `https://nattodd.github.io/FactFlight/` returned HTTP 200 and matched `main:index.html` exactly after newline normalization.
- Preview `https://factflight-preview.netlify.app/` returned HTTP 200 and matched `HEAD:index.html` before the local final-version metadata edit.
- Netlify auto-publishes development pushes to the accepted preview URL. A production main push may publish immediately; treat the main push itself as a production action.
- Owner-provided GitHub Pages screenshot confirms “Deploy from a branch,” `main`, `/(root)`, HTTPS enforced, and the public `https://nattodd.github.io/FactFlight/` address. This closes the hosting-source verification gate. The unauthenticated Pages API had returned 404, so the screenshot supplies the configuration evidence. No hosting changes are needed.

## Validation record

- Full audit: 146 automated app checks and 2,136 runtime diversity sequences passed.
- Release fixes: 153 automated checks passed, including existing suites and replay/backup-specific cases.
- Compact Progress follow-up: 41 relevant checks passed, including profile isolation, legacy math reporting, replay and backup round trips. Counts overlap; do not sum them.
- Owner confirmed the full Windows Chrome/iPhone Safari/iPhone Chrome checklist at `693affa`; later accepted the `63650a0` changes as expected on desktop/iOS. The latter was not a separately itemized backup round-trip or full browser checklist.
- Android/tablets and all orientation/permission-reset/screen-reader combinations remain unverified. No claim of offline support.
- The isolated Windows Chrome metadata check passed: the app reports `6.0.0` with no page errors. `git diff --check` passed. No full behavior-suite rerun is needed solely for a version string/documentation change.

## Backup preparation

Before production promotion, close active flights and retain copies of results that matter on every affected browser/device:

1. On the current production v5 site, export full history JSON. Keep it as a safety archive; the v6 learner importer does not accept this old array format. Existing browser data should appear unchanged as Previous progress after upgrade.
2. On v6 preview, export each learner using Results/Progress → Export learner backup JSON or Parent corner → Manage learners → Export results JSON. These are the restore-compatible version-1 learner files. Keep originals outside the browser.
3. Guest sessions are temporary and cannot be exported. Quick preferences are not backed up. Do not clear site data or remove installed shortcuts as an update/rollback step.
4. Preview and production are different storage origins. To carry preview learners to production, explicitly import their backups and review duplicates/conflicts; nothing moves automatically.

There is no new storage-schema migration in release preparation. Do not read, upload or rewrite a real family backup for automated testing. Use synthetic fixtures and let the owner confirm backups are safe (or no history needs preserving).

## Actions only after explicit owner production approval

Approval must cover committing/pushing release preparation, updating the final changelog, merging to main, publishing via GitHub Pages, and creating the GitHub tag/release. AGENTS.md sections 1 and 5 prohibit assuming these actions from preview approval.

1. Re-read status and fetch/reconcile remote refs. If main has changed from the reviewed baseline, stop promotion and review the new diff; never force-push.
2. Confirm Pages source and owner backups/no-history status. Resolve unexpected local files or stale release gates before publishing.
3. Move the implemented Unreleased v6 entries into `[6.0.0] - YYYY-MM-DD` using the actual release date, leave a fresh Unreleased section, update stable/preview README wording and ROADMAP release status, and retain historical release notes. Finalize the prepared notes without “Draft/Not published” framing. Do not represent this as completed beforehand.
4. Commit only the reviewed release files on `v6-development` with owner authorship and `AI-assisted-by: OpenAI Codex`; push development once. Verify the metadata and assets on Netlify. Version-only changes do not require another feature implementation cycle.
5. Prefer a normal reviewed merge commit into main (or follow the repository's enforced PR workflow). Inspect the proposed diff and use the approved merge method; do not bypass protection. Push main only within the production approval. Retain `v6-development` and the v5 tag.
6. Wait for the production deployment and verify the exact published files/version, relative JS/CSS/manifest/icon paths and no load errors. On an isolated browser, smoke-test profile/Guest, a Quick flight, School setup, results, and save/reload. Verify actual production microphone behavior on the required browsers with the owner; do not claim it from a mock.
7. After successful deployment verification, create annotated tag `v6.0.0` at the released main commit and publish the GitHub release with the finalized notes. Record commit, tag, production URL and verification outcome. Do not create a release on a failed deployment.

## Production smoke checklist

- Home/brand and assets load at `/FactFlight/`; version reads `6.0.0`.
- Create/select learner or Guest; Home retains selection; Change learner works.
- Quick fresh start and remembered shortcut, Focus/Worksheet, speech ready and keyboard/keypad fallback.
- Original School setup remains 60 facts/two minutes; timed expiry and Free Finish work.
- Review/Practice again uses the reviewed settings; expandable progress and backup downloads work.
- New learner flights persist after reload; Guest does not. Existing v5 records remain readable under Previous progress without rewriting originals.
- Owner verifies microphone permission/reconnection and a learner backup import on the production origin. Do not silently import preview data.

## Rollback plan

If a blocking regression appears, report the issue and obtain rollback authorization unless the production approval explicitly includes rollback. Preserve evidence and available learner backups before changing delivery.

- Preferred rollback is a normal revert of the release merge on main, followed by redeployment of the v5 app. Do not reset/force-push main, delete tags, or clear localStorage.
- Confirm the resulting served app matches the known v5 baseline; separately inspect any release documentation affected by the revert.
- v5 reads its old history key but does not display v6 family records. Those keys remain on the device; their invisibility is not proof of deletion. Preserve v6 learner backups and restore them only in a compatible v6 app after a fix.
- Keep the failed release/tag identifiable; publish a factual notice/correction with owner approval rather than pretending it never happened.

## Final owner decision

Approve the reviewed `6.0.0` scope and release operations above, or request more preview changes. The owner subsequently explicitly authorized these release operations and confirmed no history needs preserving. Retain the checklist as the execution/rollback plan.
