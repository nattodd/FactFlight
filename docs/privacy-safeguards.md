# Repository privacy safeguards

The source repository and static hosting can expose documentation, tests and images, even when the app does not link to them. Do not store real learner exports, personal diagnostics, credentials, private keys, personal email addresses or identifiable home-directory paths here. Use synthetic fixtures and repository-relative paths, `<USER_HOME>` or `<TEMP>` placeholders.

## Local setup and checks

Run from the repository root with Node and Git installed:

```sh
node scripts/install-privacy-hooks.cjs
node scripts/privacy-check.cjs --identity
node tests/privacy-check.cjs
node scripts/privacy-check.cjs --worktree
```

The installer enables `.githooks` for this repository only and preserves any different existing hook setup instead of overwriting it. It also makes the hooks executable on platforms requiring that permission. Hooks are not automatically enabled by cloning; run the installer in each clone. `.gitattributes` preserves their LF line endings.

Use the GitHub-provided noreply address shown in the account's email settings for author and committer identities. Keep the owner's author name. The current checkout is configured locally for the owner's verified GitHub noreply identity; no old commit or tag is changed. Other contributors must use their own noreply identity, not impersonate the owner.

The pre-commit hook checks both identities and the actual staged blobs. Cleaning a working copy without re-staging does not bypass a sensitive staged value. The commit-msg hook checks the proposed message. For manual review:

```sh
node scripts/privacy-check.cjs --staged
node scripts/privacy-check.cjs --message PATH_TO_MESSAGE_FILE
```

The guard checks personal home paths (including JSON-escaped paths), personal email addresses, private filenames, credential-like literals/URLs, private-key headers and selected service-token formats. It prints file/line/rule only, never the matching value. It does not follow working-tree symlinks outside the repository. Private exports and credential files are ignored, while forced staging still triggers the filename check. Safe example-domain addresses and GitHub noreply addresses are allowed.

## CI and publication

The `.github/workflows/privacy.yml` workflow runs the guard tests, scans checked-out files and checks the checked-out commit's author/committer and message. It uses a pinned official checkout action, read-only repository permission and no persisted credentials. It does not deploy. It runs remotely when these files reach an enabled branch or pull request; the owner has authorized this update on v6.2-development. No branch-protection or hosting setting is changed by this work.

Before publishing, review the diff and images/metadata, run a full secret scanner such as `gitleaks git . --log-opts=--all --redact=100`, and inspect deployment scope. Use GitHub's branch protection settings to require CI only after separate owner approval. Do not bypass failures. Existing historical personal identifiers remain a separate cleanup decision.

## Limitations and correction record

These checks cannot prove absence of all sensitive information. They do not OCR screenshots, decompress every binary metadata format, classify arbitrary names/addresses, or detect every possible secret. Text email checks are broad; binary checks limit email matching to common personal-provider domains to avoid random compressed-byte false positives. They do not remove already published data, historical commit/tag email addresses, caches or old deployment snapshots. CI checks the current snapshot and checked-out commit, not every historical commit. A full history secret scan complements it.

2026-11-16 local correction: replaced personal account-path prefixes in 13 existing verification documents/result files with `<USER_HOME>`. The old test counts, findings, timestamps, filenames and outcomes are preserved. This explicitly documents the privacy-only correction to historical verification notes. No learner storage or application/voice code was modified.

Validation: 10 privacy safeguard tests passed, including actual pre-commit and commit-message hook rejection in a disposable repository with no commits created. The working-tree and future-identity checks passed; Gitleaks 8.30.1 reported no secrets in the updated working tree. All 13 redacted files were compared with HEAD to confirm only home-prefix substitutions, and the diagnostic JSON still parses. Application/voice files and HEAD are unchanged. The full browser regression suite was not repeated for this documentation/tooling-only change.

The owner authorized committing and pushing these changes to `v6.2-development` for its Netlify Branch Deploy. This does not authorize a main merge, changes to Netlify production, or cleanup of other branch tips. Rewriting history or replacing existing release tags requires explicit authorization and is not part of this change.
