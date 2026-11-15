# Fact Flight Development Rules

These rules apply to all development work in this repository.

## 1. Repository and branch management

- Repository: `nattodd/FactFlight`.
- Production branch: `main`.
- Active development branch: `v6.1-development`.
- Verified stable baseline: `v6.0.0`.
- Always verify the active branch before modifying code.
- Never modify, merge into, or deploy `main` without the repository owner's explicit approval.
- Never commit, push, or merge without the repository owner's approval.
- Development preview testing is permitted through the approved preview workflow. This permission does not authorize commits, pushes, merges, production deployments, or publishing outside that workflow. If the approved workflow is not documented or known, clarify it before deploying a preview.
- Never otherwise publish without the repository owner's approval.
- Approved preview workflow (2026-11-15): Netlify project factflight-preview keeps production branch `v6-development`; only `v6.1-development` is enabled as an additional Branch Deploy. The owner approved committing/pushing the reviewed G/E/F increment for one Branch Deploy trial. This does not authorize other commits/pushes, production deployments, or changing either `main` or `v6-development`. Verify deployment context and usage against 19 production deploys / 285 deployment credits / 14.7 remaining; traffic may consume credits. Prefer local tests and batch separately approved preview pushes. The owner separately approved committing/pushing Choose Tables on 2026-11-15 to `v6.1-development` for a Branch Deploy and desktop/iPhone testing; the same production restrictions apply.

## 2. Product principles

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
- Verify relevant functionality on desktop and mobile.
- Minimum regression coverage for application changes and before release must include Windows Chrome, iPhone Safari, and iPhone Chrome. Check voice recognition (ready/start behavior, spoken answers, and microphone reconnection), keypad/touch and keyboard input, scoring and analytics, timed and untimed sessions, scrolling/focus, session history, and persistence after page reloads. Include the original School Test and non-voice fallback.
- Include Android Chrome, tablets, and portrait/landscape orientation testing when available. Record unavailable devices and browsers as unverified, not passed.
- Run relevant checks for each incremental change and the full minimum regression checks before proposing production deployment. Run available local checks before preview deployment, then use the approved preview workflow for browser/device verification.
- Clearly separate automated results from manual checks. Actual microphone recognition and audio quality, operating-system/browser permission prompts, and real iPhone/Android/tablet touch, keyboard, and orientation behavior require manual device testing when automation cannot exercise them reliably. Emulation alone does not verify a physical device. Identify every check that cannot be completed automatically, report whether manual verification was performed, and list any remaining checks explicitly.

## 5. Documentation and release management

- Document each completed meaningful feature, behavior change, or fix in the `Unreleased` section of `CHANGELOG.md` as part of the same development change or commit.
- Use factual, user-facing descriptions. Never represent planned features as completed; keep planned work in `ROADMAP.md` until implemented and verified.
- Never alter historical release notes without a documented correction.
- Update `ROADMAP.md` when milestones are verified.
- Before releases, compare `v6.1-development` against `main` and reconcile the changelog with actual changes.
- Never publish to production without the repository owner's explicit approval.
- Only after explicit production approval, move verified changelog entries into a dated release section and publish the corresponding release.

## 6. AI acknowledgement

- Credit material assistance from ChatGPT or Codex in relevant commit messages using an `AI-assisted-by: OpenAI Codex` or `AI-assisted-by: ChatGPT` line.
- Keep the repository owner as the author.
- Never claim work was tested or reviewed unless it actually was.
