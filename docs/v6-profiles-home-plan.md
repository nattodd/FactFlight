# Learner Home, profiles, and branded installation — proposed next phase

2026-11-14. Planning only; no runtime or storage changes are part of this record.

## Accepted baseline

The working app already provides eight math activities, five levels, Quick/Free/Timed/Test, original School Test, Focus/Worksheet, speech and fallback input, results and activity summaries. Preserve these routes, enlarged text, Skip/Undo/Finish/Home, and scoring. The owner accepted the larger text on physical iPhone Chrome and Safari at commit `7e93dc1`.

## Increment 1: branded Home Screen icon

Use the existing brand-kit FF flashcards/airplane app-icon artwork, not the horizontal wordmark squeezed into a square. Inspect the 180px Apple touch icon, 192/512px manifest icons, favicon, and maskable candidate at native size before copying selected assets to runtime assets. The source is raster-derived and the 512px asset is upscaled; maskable cropping requires visual review.

Add Apple touch icon and favicon links plus a web manifest with correct relative asset/start/scope paths for both the Netlify root and GitHub Pages subpath. Audit whether standalone launch should be enabled in this increment; treat it as a separately tested behavior, not a consequence assumed safe from adding icons. Do not add a service worker or claim offline support.

Acceptance: valid metadata, all asset URLs resolve, artwork stays legible without clipping, and a newly added iPhone Home Screen shortcut uses the branded icon and opens the correct app. Manually test launch, speech permissions/reconnect, keypad, return Home, and history/reload in the installed context; do not assume browser history is shared with it. Check Android installation when available. Existing shortcuts may require removal and re-addition to refresh cached artwork; never instruct clearing browser data.

## Increment 2: learner Home design review

Use the supplied desktop/mobile Home references: brand logo and short blurb, “Who's ready to take flight?”, large existing-learner tiles, Create Profile, Continue as Guest, and Results & Stats. Keep the accepted large typography, both themes, and responsive two-column phone / wider desktop arrangement where space permits.

Selecting a learner or Guest opens the existing activity Home with Quick Practice, Math, and disabled Coming Soon subjects. Show the current learner and a Change learner action. Home within practice returns to the activity Home through the existing guarded finish flow; changing learners is available only outside an active flight. Results & Stats from the entry screen offers learner selection and Previous progress rather than mixing everyone’s totals.

Review a visual/clickable preview before integrating this screen. Sample learners in a design preview must be visibly identified as samples and never become real saved profiles. No hard five-profile limit is implied by the reference image.

## Increment 3: backup-safe learner data and working Home

Before schema work, obtain current JSON backups from every browser with history to retain. The earlier statement that no history existed predates subsequent testing and must not be assumed still true. AGENTS.md requires backup and migration checks on copies.

Recommend a small versioned storage adapter rather than rewriting the session engine. Keep `fact-flight-history-v1` and `fact-flight-math-history-v1` unchanged and readable as Previous progress. Do not auto-assign those sessions to the first learner. Store new family data under a separate versioned key, with stable learner IDs and session ownership captured at session start. Renaming a nickname must not change ownership. Reject malformed/unsupported data without overwriting it; handle quota errors and stale writes from multiple tabs explicitly.

Implement validated family JSON export/import and recovery before relying on profile storage. Include original history in full backups with provenance. Import previews must show counts and conflicts; merge by stable IDs, skip exact duplicates, and require resolution for conflicting content. Never silently replace another learner or session. Validate legacy v5 exports and current mixed-activity exports using copies. Avoid claiming that multiple localStorage writes form an atomic transaction.

Integrate profile creation/selection/rename, Guest handling, learner-specific results and activity totals, then per-flight drill-down. Optional nickname defaults to a neutral label; no email, password, real-name requirement, cloud account, or remote analytics. Profile deletion follows only after backup and explicit scoped confirmation are implemented.

## Decisions needing approval before storage integration

- Guest: recommend temporary results, clearly labeled “Not saved”; allow immediate results review/export. Agree exactly when temporary results clear (recommended: reload or confirmed learner switch). Existing account-free history remains durable Previous progress, never disposable Guest data.
- Entry: recommend the reference learner picker on initial open, followed by the existing activity Home. Guest is one tap, with no mandatory profile creation.
- Previous progress: recommend keeping it separate initially; deliberate assignment can be added later without altering originals or double-counting copies.
- Nicknames: recommend optional neutral defaults and duplicate-name warnings, with IDs always determining ownership.

## Acceptance and regression gates

Two learners can complete different activities, reload, rename, and view only their own totals and flights. Guest behavior matches the approved policy. Previous progress remains byte-for-byte intact and analytics remain correct. Backup round-trip preserves learners, sessions, attempts, transcripts, skips, corrections, timing, and ownership. Test duplicate/conflicting imports, corrupt data, unsupported versions, quota failures, and competing tabs.

Run existing engine/menu/readability suites plus targeted storage and ownership checks. Test School and all math activities, both views, voice ready/answer/reconnect, keypad/keyboard, timers, Free until Finish, Skip/Undo, guarded navigation, results, exports, and reload. Automated speech mocks and device emulation remain distinct from physical Windows Chrome/iPhone Safari/iPhone Chrome verification. Record unavailable Android/tablet checks as unverified. Installed Home Screen behavior gets its own manual checks.

Each increment is reviewed and tested before a separately approved commit/push to `v6-development` and the normal Netlify preview. This plan does not authorize production publication or implementation of undecided retention policies.

## Learner Home mockup R1 — available for review

Open `design-reference/ui-v6/v6-learner-home-preview.html` directly in a browser. It extends the earlier menu navigator with the reference learner-first entry: Alex/Sam/Riley sample tiles, Create Profile, Guest, and Results & Stats. Profile selection opens the existing-style activity menu and setup navigator. Start ends at a clearly labeled mock launch; no real session or microphone starts. Sample results show learner selection, activity summaries, flight list, and illustrative review. Preview controls demonstrate an empty first visit.

All data is memory-only and resets on reload. No app history is read or written. Guest “Not saved” remains a proposed policy for approval. This is a design artifact, not integration into `index.html`.

Isolated Windows Chrome checks passed for overflow at 320×568, 390×844, 844×390, and 1440×1000; theme switching; selecting a learner; Quick setup to launch placeholder; nickname creation and blank-name fallback; Guest; learner/activity/flight stats navigation; empty first visit; and reset on reload. Storage getters were configured to throw, and no access or page errors occurred. Phone and desktop Home screenshots were visually inspected. Physical-device review of this new mockup remains pending. No commit or push was made.

### Home navigation refinement

At the owner’s request, Home (including logo and mock-launch Back to Home) returns to activity selection for the current learner or Guest. Change learner explicitly opens profile selection. Reload still resets this sample-only preview. This changes only the mockup.
