# Fact Flight Development Rules

These rules apply to all development work in this repository.

## 1. Repository and branch management

- Repository: `nattodd/FactFlight`.
- Production branch: `main`.
- Active development branch: `v6.3-development`, created locally at `a3101b0` after verifying its tree matches local main `46f2f9c` and its ancestry includes v6.2.0 tag `13d09dd`.
- v6.3 planning authorization (2026-11-18): owner accepted `docs/v6.3-rules-specification.md` defaults and authorized the local branch plus planning docs/roadmap image for expanded practice quality, Progress, readiness and parent focus alongside division families, tables through 12 and grouped menus. No application changes, commits, pushes, merges, deployments or hosting changes are authorized. The private Learner Stats Review Mock Dashboard is the required Progress visual reference; recreate with synthetic fixtures and never copy its private HTML/data/screenshots into the repository.
- v6.3 foundation authorization (2026-11-18): owner approved local shared content definitions, reporting/readiness calculations and synthetic tests only. The owner also approved counting readiness completion credits across the outer 12/8-flight window while accuracy/coverage retain their 60/40-encounter caps. This supersedes the planning-only restriction for this increment; no commits, pushes, deployments or storage schema changes are authorized.
- v6.3 generator authorization (2026-11-18): owner approved implementing the reviewed L2/L3 allocation locally with learner-specific in-memory carryover, preserving School Test, rerunning the synthetic audit and updating graphs. No storage schema changes, commits, pushes or deployments are authorized. Earlier planning-only restrictions are superseded only for this increment.
- v6.3 family-extension authorization (2026-11-18): owner confirmed a fresh production learner JSON backup and approved local division families, multiplication tables 1–12 and explicit through-10/12 ranges. v6.3 must read existing backups without rewriting their records; backups containing new scopes require v6.3. This authorizes the additive session/selection and reader changes for this increment, superseding the earlier no-schema-change restriction only here. Preserve School Test; no commits, pushes, deployments or publishing.
- v6.3 navigation refinement (2026-11-18): owner requested all eight activity tiles directly under Operations & Facts and Quick Practice, removing the extra category click. Preserve School Test and existing compatibility; local changes only, no commits, pushes or deployments. This supersedes the earlier four-category screen layout.
- v6.3 grouped-menu authorization (2026-11-18): owner approved local grouped practice navigation from the existing roadmap. Preserve School Test and the established learner-backup compatibility boundary; no commits, pushes or deployments. The Progress dashboard remains a separate increment.
- Current release baseline: `v6.2.0` on main/GitHub Pages, owner-approved on 2026-11-16 after preview `a9fe516` and release-check acceptance. Exact release commit is identified by annotated tag `v6.2.0` and the GitHub release. Previous baseline `v6.1.0` at `f760615` does not support importing new mixed-review records. Rollback requires separate owner approval and a data-preserving plan.
- Branch transition authorization (2026-11-15): owner approved creating local `v6.2-development` from verified main, carrying over v6.1 release-completion notes and pending documentation/image, and updating current branch references. The owner subsequently approved a local commit of the reviewed documentation and roadmap image only. Application changes, pushes, deployments and Netlify configuration changes remain unauthorized; v6.2 Branch Deploy is not yet enabled by this work.
- Always verify the active branch before modifying code.
- Subsequent v6.2 authorization (2026-11-15): owner approved local v6.2a implementation, then enabling `v6.2-development` as an additional Netlify Branch Deploy and committing/pushing `3fa74b1` for that preview only. The owner accepted layout and voice on iPhone Safari/Chrome. Netlify production remains `v6-development`; `main` remains GitHub Pages production. The owner subsequently approved committing/pushing the locally reviewed v6.2b missed-fact review and retry preferences to v6.2-development for Netlify Branch Deploy testing only; no merge to main or production deployment is authorized. Current learner JSON backups were confirmed exported before adding review-session metadata. These specific approvals supersede the earlier branch-transition restrictions only for the stated work.
- Never modify, merge into, or deploy `main` without the repository owner's explicit approval.
- Never commit, push, or merge without the repository owner's approval.
- Development preview testing is permitted through the approved preview workflow. This permission does not authorize commits, pushes, merges, production deployments, or publishing outside that workflow. If the approved workflow is not documented or known, clarify it before deploying a preview.
- Never otherwise publish without the repository owner's approval.
- Approved preview workflow (2026-11-15): Netlify project factflight-preview keeps production branch `v6-development`; only `v6.1-development` is enabled as an additional Branch Deploy. The owner approved committing/pushing the reviewed G/E/F increment for one Branch Deploy trial. This does not authorize other commits/pushes, production deployments, or changing either `main` or `v6-development`. Verify deployment context and usage against 19 production deploys / 285 deployment credits / 14.7 remaining; traffic may consume credits. Prefer local tests and batch separately approved preview pushes. The owner separately approved committing/pushing Choose Tables on 2026-11-15 to `v6.1-development` for a Branch Deploy and desktop/iPhone testing; the same production restrictions apply. The owner also separately approved committing/pushing Next Table(s) and its updated verification docs to the same branch for desktop/iPhone Branch Deploy testing on 2026-11-15, without production changes.

- Release authorization (2026-11-15): owner explicitly approved finalizing v6.1.0 release docs, committing/pushing preparation, merging/pushing main for GitHub Pages, verifying production, and publishing the v6.1.0 annotated tag/GitHub release. Keep Netlify production/v6-development unchanged. Rollback requires separate owner approval. This does not authorize subsequent feature releases.

- Release authorization (2026-11-16): owner approved final v6.2 release-status/image updates, promotion to main/GitHub Pages, and the v6.2.0 annotated tag/GitHub release after verifying preview a9fe516. Keep Netlify production v6-development unchanged. This authorizes this release only, not future development publication.

- Local Progress authorization (2026-11-18): owner approved implementing the Learner Stats Review dashboard with synthetic fixtures on `v6.3-development`, preserving School Test and backup compatibility. No commits, pushes, deployments or publication. This increment does not authorize storage-schema changes or enable parent focus restrictions.

- Local focus authorization (2026-11-19): owner approved mastery menu trophies and the per-learner Parent corner focus toggle, preserving School Test and learner backup compatibility. The agreed one-flight allowance and no-PIN preference semantics apply. Keep preferences separate from answer records; no commits, pushes, deployments or publication. This supersedes earlier planning-only limits for this increment.

- v6.3 Branch Deploy authorization (2026-11-19): owner approved privacy/secret scans, committing and pushing the reviewed v6.3-development candidate, and its Netlify Branch Deploy for Windows/iPhone testing. The owner added v6.3-development to factflight-preview Branch deploys; the supplied settings screenshot confirms production remains v6-development and the existing v6.1/v6.2 branch deploys remain enabled. This supersedes earlier local-only restrictions for this candidate only. Do not merge into main, publish a production release, change production branches or create release tags. Physical-device acceptance remains pending.

## 2. Product principles

- Owner privacy boundary: never read, list, search, or otherwise access the owner's iCloud Drive, including its local synced folders. Request files from Downloads instead. A previously shared iCloud path does not grant continuing access.
- Never publish personal home-directory paths, personal email addresses, credentials, real learner exports or private diagnostics in source, screenshots, documentation, test results or commit messages. Use repository-relative paths or `<USER_HOME>` / `<TEMP>` placeholders; preserve test outcomes when redacting logs. Review image content and metadata before publishing.
- Keep the owner as author, but use their verified GitHub noreply address for future commits. Never change past authors, rewrite history, move existing tags or alter hosting without explicit approval.

- Fact Flight is a free, privacy-conscious educational application for children ages 2–12.
- No mandatory accounts, subscriptions, advertisements, or marketing.
- Keep interactions simple, accessible, and mobile-first.
- Support desktop, iPhone, and Android.
- Prioritize practice over teaching or prescribed learning paths.
- Preserve local-first storage: practice results remain on the device unless a parent deliberately exports them. Do not introduce remote analytics or cloud synchronization without an explicitly approved change.
- Student profiles must use optional nicknames; never require a child's real name or an account. Minimize collection of children's information and avoid unnecessary speech transcripts.
- Describe current speech privacy accurately: recognized speech transcripts are stored locally with session results and may appear in exports; microphone audio recordings are not stored by the app. Browser speech recognition may send audio to an online processing service, so do not claim all speech processing stays on the device.

## 3. Preserve existing functionality

- Protect the verified `v5.0` speech recognition implementation.
- Preserve timers, scoring, keypad, keyboard input, and quiz history.
- Preserve the original 60-question, two-minute, three-column multiplication School Test, existing analytics, and equivalent scoring behavior, including first-try accuracy, corrections, skips, and response-time tracking.
- Preserve reliable keyboard and touch/keypad fallback when speech recognition is unavailable; voice must remain optional.
- Maintain backward compatibility with `fact-flight-history-v1`.
- Before modifying storage schemas, require a JSON backup of existing history and test migration with representative v5 data using copies. Verify that existing sessions and analytics remain readable and correct after migration and reload.
- Never delete, overwrite, or mix historical records during development or migration. Preserve the original data and keep students' and sessions' records distinct.
- Avoid unnecessary rewrites or dependencies.

## 4. Development workflow

- Read `ROADMAP.md` and `README.md` before planning significant changes.
- Make incremental, testable changes.
- Explain risks and architectural tradeoffs.
- Run appropriate tests before proposing deployment.
- Install local privacy hooks with `node scripts/install-privacy-hooks.cjs`. Before staging/publishing run `node scripts/privacy-check.cjs --worktree`, `node tests/privacy-check.cjs`, and a full secret scan such as Gitleaks. Before committing, run `node scripts/privacy-check.cjs --identity` and `--staged`; check commit messages too. Do not bypass a failing check or paste detected values into reports. The scanner is a guardrail, not proof that all personal information has been found. Repository/source publication can expose documentation and historical Git metadata even when the app has no link to them.
- Verify relevant functionality on desktop and mobile.
- Minimum regression coverage for application changes and before release must include Windows Chrome, iPhone Safari, and iPhone Chrome. Check voice recognition (ready/start behavior, spoken answers, and microphone reconnection), keypad/touch and keyboard input, scoring and analytics, timed and untimed sessions, scrolling/focus, session history, and persistence after page reloads. Include the original School Test and non-voice fallback.
- Include Android Chrome, tablets, and portrait/landscape orientation testing when available. Record unavailable devices and browsers as unverified, not passed.
- Run relevant checks for each incremental change and the full minimum regression checks before proposing production deployment. Run available local checks before preview deployment, then use the approved preview workflow for browser/device verification.
- Clearly separate automated results from manual checks. Actual microphone recognition and audio quality, operating-system/browser permission prompts, and real iPhone/Android/tablet touch, keyboard, and orientation behavior require manual device testing when automation cannot exercise them reliably. Emulation alone does not verify a physical device. Identify every check that cannot be completed automatically, report whether manual verification was performed, and list any remaining checks explicitly.

## 5. Documentation and release management

- **Preserve documentation structure:** Obtain explicit owner approval before renaming, renumbering, reordering, combining or removing established sections, or substantially changing their format. Routine content corrections within existing sections are permitted.
- **Keep the roadmap image synchronized:** When release scope, sequence, major features or Available/Coming Soon status changes, generate an updated brand-compliant image, verify it against `ROADMAP.md`, and update the README reference. Wording-only corrections do not require regeneration.
- Document each completed meaningful feature, behavior change, or fix in the `Unreleased` section of `CHANGELOG.md` as part of the same development change or commit.
- Use factual, user-facing descriptions. Never represent planned features as completed; keep planned work in `ROADMAP.md` until implemented and verified.
- Never alter historical release notes without a documented correction.
- Update `ROADMAP.md` when milestones are verified.
- Before releases, compare the active development branch (`v6.3-development`) against `main` and reconcile the changelog with actual changes.
- Never publish to production without the repository owner's explicit approval.
- Only after explicit production approval, move verified changelog entries into a dated release section and publish the corresponding release.

## 6. AI acknowledgement

- Credit material assistance from ChatGPT or Codex in relevant commit messages using an `AI-assisted-by: OpenAI Codex` or `AI-assisted-by: ChatGPT` line.
- Keep the repository owner as the author.
- Never claim work was tested or reviewed unless it actually was.
