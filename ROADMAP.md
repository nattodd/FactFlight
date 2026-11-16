# Fact Flight — Product & Development Roadmap

**Vision:** *Little practice. Big confidence.* Simple, enjoyable practice for children ages 2–12 without unnecessary accounts, subscriptions, advertisements, complex menus or prescribed learning paths.

**Current stable release:** `v6.1.0`, published to GitHub Pages from main `f760615`, with annotated tag and [GitHub release](https://github.com/nattodd/FactFlight/releases/tag/v6.1.0). Production voice is owner-accepted on Windows Chrome and physical iPhone Chrome/Safari. **Current development checkout:** `v6.2-development`, created with owner approval from verified production `main` / v6.1.0 `f760615`. Release-completion notes and the reviewed documentation/image were carried forward; the owner approved committing this documentation-only update locally.

**Planning agreement — 2026-11-15:** The owner agreed to the post-v6.1 milestone sequence and authorized this roadmap update only. Future features remain planned, not implemented or verified. This agreement does not authorize application changes, branch creation, commits, pushes, deployments or Netlify configuration changes. Milestone suffixes identify independently testable increments, not promised version tags or dates. Detailed product defaults below remain proposals to confirm before their implementation.

**Branch transition — 2026-11-15:** The owner separately authorized creating local `v6.2-development`, carrying over release-completion notes and pending documentation, and updating branch references. The branch now starts at verified main `f760615`; no commit, push, deployment or Netlify configuration change was made. The owner subsequently approved a local commit of the reviewed documentation and roadmap image. These approvals supersede only the earlier restrictions on this branch creation and documentation commit; application implementation, pushing, deployment and Netlify changes remain unauthorized.

**Status reconciliation — 2026-11-15:** This revision replaces outdated current-status and future-sequence wording. v6.1.0 is complete. v6.0.0 and v5.0 are historical baselines, not automatically safe rollback targets: targeted-table backups require a v6.1-compatible reader. Rollback requires a data-aware plan and separate owner approval. Earlier acceptance notes are preserved in the historical appendix as evidence of the state at the time, not continuing authorization. The original nine numbered sections are retained, with completed and planned versions together in section 5. The [release completion record](docs/v6.1-release-plan.md#completed-production-verification--2026-11-15) records subsequent production voice acceptance; older pending wording in published release material does not reopen that gate.

## 1. Non-negotiable product principles

1. **Zero-friction start.** No account, email, subscription, ad, mandatory onboarding, daily streak, or forced lesson path.
2. **Useful in 30 seconds.** Open → choose an activity → pick a small amount → start. Remember the last choices, but let anyone switch quickly.
3. **One app for many ages.** Toddlers get touch-first pictures and sounds; older kids get fluency, typing, and voice practice.
4. **Private by default.** Results remain on the device unless a parent deliberately exports them. Profiles use optional nicknames; never require a child's real name.
5. **Parent-controlled, child-friendly.** Settings and detailed reports are available but never block a quick practice session.
6. **Do not break what works.** Keep the verified v5 microphone behavior, timers, original math test, analytics, and browser compatibility.
7. **Free and maintainable.** Prefer a static GitHub Pages site with HTML/CSS/JavaScript and local data. No paid backend required.

## 2. The experience: from scrolling worksheet to an app-like interface

### Landing screen and grouped navigation (planned)

Keep the learner picker and Guest entry. Learner Home remains the subject screen, with one-tap Quick practice above subject choices. Use **subject → group → activity/setup → Start**, adding depth only where it reduces crowding.

| Destination | Organization |
|---|---|
| Math | Numbers & Counting; Operations & Facts; Time & Clocks; later Money & Measurement |
| Numbers & Counting | Recognition; counting objects; number sequences/order; skip counting |
| Operations & Facts | Add & Subtract (addition, subtraction, bonds); Multiply & Divide; Doubles & Halves; Squares |
| Time & Clocks | Read clocks; analog/digital matching; 12/24-hour time; separate elapsed time |
| Letters & Sounds | Alphabet; Letter Sounds |
| Colors & Shapes | Colors; Shapes, without unnecessary extra group screens |
| Reading | Initially a small activity/deck chooser; groups only when needed |
| Parent corner | Learner management, backups, detailed settings and content information |

Target two to four major choices per screen, never 15–20 activity tiles. Operations category activity choices can sit within setup instead of another full-screen level. Table/family selection stays inside its activity. Preserve a clearly labeled original School Test shortcut under Math.

Back returns to the previous context; Home returns to learner Home. Use consistent hierarchy, focus restoration, transitions, large touch targets and text/icon labels. Preserve Results repeat shortcuts and last-started settings so repeat users bypass the hierarchy. Consider a small recent-practice area later, not a favorites-management system. Keep Coming Soon compact and explicit; avoid empty future-subject tiles.

### Mobile setup — first increment

Prototype one persistent bottom action area with a compact selection summary. Reserve its actual height and respect safe areas/Home indicator, browser bars, keyboard and dialogs. In short landscape/large-text layouts, allow ordinary document flow if necessary. Readability and reachable controls take priority over zero scrolling.

Preserve selection logic, validation, disabled Continue for empty tables, voice-ready/cancellation and duplicate-start protection. Compare the prototype with the existing layout on small physical iPhones, both orientations, large text, VoiceOver and keyboard focus. Do not refactor speech in this increment.

### Phone, tablet and desktop presentation

Keep one active prompt in mobile Focus with reachable answer controls. In tablet landscape, use extra room for a card and answer area; permit natural scrolling on short screens. Desktop retains Focus and Worksheet. Preserve the original three-column School worksheet and speech auto-scroll. Larger text and accessibility must not be sacrificed to eliminate scrolling.

### App-like browser delivery

Home Screen icons and a browser-mode manifest already exist. Standalone launch, update notices and offline caching remain planned reliability increments in sections 5 and 6. Installation stays optional; browser speech may still need a network.

## 3. Practice modes (shared across subjects)

| Mode | Experience | Status / use |
|---|---|---|
| Quick Practice | 5/10/15/20 questions; no timer | Complete for math; extend to supported new activities |
| Free Practice | Continue until Finish | Complete for math; untimed practice |
| Timed Practice | Configurable question count and 1/2/5 minutes | Complete for math; optional fluency practice |
| Custom Test | Configurable count/time and optional goal | Complete for math; defaults to 60 questions/two minutes |
| School Test | Original 60 facts/two minutes/three columns, optional Focus | Complete; preserve the distinct preset |
| Missed-fact review | Short practice selected from recent mistakes/skips | Implemented in unreleased v6.2; slow-but-correct review later |
| Game mode | Optional short challenges and gentle rewards | Deferred; never required |

Every activity needs useful keyboard/touch input. Voice remains optional and is offered only when supported. Do not force every subject to support every mode.

### Explore and Practice

Practice remains the default. Explore is an optional activity-level reference/discovery view using the same content: tap numbers, letters or shapes to see/hear them. It is not a mandatory menu step or curriculum. Explore taps are not scored attempts; reveals and parent-reported outcomes remain distinct from independent answers. Early learning defaults to untimed large choices; expose Worksheet, timers, voice and progression only where supported and useful.

## 4. Subject library

Existing math is complete as summarized in section 5. The content below is planned; none is represented as implemented.

### Numbers & Counting

Recognition starts with 1–5, 1–10 and 1–20; offer zero explicitly and expand to 100 later. Count separated objects before quantities to 20 using ten-frames/grouping. Avoid overlap, partial objects and decorative countable distractors. Use numeric entry where useful and tap choices for beginners.

Sequences cover next, previous and missing numbers before ascending/descending ordering. Skip counting starts with 2s, 5s and 10s, later other intervals/starts. Use freely selectable descriptive ranges, not a rigid age path or mandatory five-level structure. Start ordering with tap-to-place/select-next and keyboard equivalents; dragging is optional. Young-child sessions use two or three large choices, gentle feedback and parent participation.

### Alphabet, Letter Sounds, Colors & Shapes

Start with uppercase/lowercase recognition and matching, then letter order, missing letters and spoken names. Letter Sounds is complementary: curated sound-to-letter practice, then beginning sounds and reviewed picture matching. Advanced phonics needs separate justification.

Vary shape size/orientation and color independently; avoid ambiguous categories and misleading real-world pictures. Color identification/matching needs alternatives for children with color-vision differences. Do not interpret difficulty with color discrimination as general learning performance. Navigation and correctness feedback use symbols/text as well as color.

### Audio

Use curated, locally hosted phoneme recordings; generic text-to-speech must not substitute for reviewed isolated sounds. Track asset/content ID, version, language/dialect, name-versus-phoneme type, examples, source/license and attribution. Prefer original commissioned recordings with redistribution/offline rights or appropriately licensed assets; obtain specialist pronunciation and picture-word review.

Ordinary prompts/letter names may use device-tested browser speech synthesis as an optional fallback. If essential listening audio is unavailable, offer retry, another activity or clearly labeled parent-led use; revealing the answer is not equivalent scored practice. Load needed assets, prefetch the next prompt, and coordinate playback with the microphone. Later offline caching uses versioned assets with verified rights.

### Time & Clocks

- Reading: whole hours → half hours → quarters → five-minute intervals → exact minutes; distinguish hour/minute hands.
- Matching: analog-to-digital, then digital-to-analog. Interactive hands follow with touch snapping, keyboard increments, selected-hand controls, explicit answer submission and a non-drag alternative.
- Geometry: responsive SVG; minute angle `6 × minutes`; hour angle `30 × (hours mod 12) + 0.5 × minutes`. Differentiate hands by length/shape, not color alone.
- 12/24-hour conversion: daytime examples, then noon/midnight and full-day examples. Noon is 12 PM / 12:00; midnight is 12 AM / 00:00. Analog faces alone cannot identify AM/PM; supply context. Defer 24:00 notation.
- Elapsed time is separate: same-hour differences, adding minutes/hours and ending times, then crossing hours/noon/midnight and explicit day offsets. Use integer minutes rather than device timezone/DST-dependent dates.

### Reading

Begin with small reviewed sight-word decks, listen-and-select, flashcard reveal and unambiguous word-to-picture matching; abstract words need other interactions. Add spelling/typing and short reading when useful, without a full curriculum. Keep recognition, spelling and parent-led reading distinct, with local review words.

Defer automatic spoken-word grading: homophones, accents, dialects and recognizer uncertainty differ from numeric parsing. Voice stays optional; recognition failure is not evidence that a child cannot read. Avoid unnecessary raw transcript retention in new word activities.

## 5. Release Roadmap

Completed releases are listed first, followed by the agreed future sequence. All future releases remain **PLANNED** and require separately authorized implementation and publication. Lettered increments identify delivery order within a version, not promised tags or dates. Grouped navigation precedes new subjects; one counting activity proves typed choices before broader expansion. Each release requires section 7's full regression matrix.

### v5.0 — Original multiplication practice (COMPLETE — historical baseline)

**Delivered:** Multiplication worksheet, timed/untimed practice, speech ready/reconnect, mobile keypad/keyboard, auto-scroll, themes, local analytics and exports.

**Preserve:** The proven speech behavior and original School Test. This historical release is not an automatically data-compatible rollback target for later records.

### v6.0.0 — Math and family experience (COMPLETE — 2026-11-14)

**Delivered:**

- Eight math activities/five levels; guided Home, Focus/Worksheet, configurable sessions and remembered Quick Practice.
- Optional nickname learners and temporary Guest; separate history, learner rename/delete and individual JSON backup/restore.
- Branded icons, feedback, compact Progress, and audited replay/backup fixes. Previous progress remains separate.

**Evidence:** Published main `6cff208`, annotated tag and GitHub release. See [release notes](docs/v6-release-notes.md) and [production verification](docs/v6-release-plan.md#completed-production-verification) for reported checks and coverage limits. Full-family backup, legacy association and offline were not delivered. v6.0.0 cannot be assumed to read new v6.1 targeted-table backups correctly.

### v6.1.0 — Targeted practice and easier repeat sessions (COMPLETE — current production)

Released scope: G/E/F/A plus Next Table(s) and the heading correction. Earlier scope and acceptance records are preserved in the historical appendix; they are not outstanding release gates.

**Implemented and owner-accepted:**

- **G — Configuration/menu persistence:** remember last-started choices per learner/activity, highlight selections, preserve the separate Quick shortcut and temporary Guest behavior.
- **E — Practice Again:** start a fresh flight directly with the same complete settings, preserving learner ownership and voice readiness; older/reloaded flights retain setup review.
- **F — Next Level:** advance exactly one numbered level with compatible settings; stop at Level 5 and exclude School Test/table selections.
- **A — Choose Tables:** multiplication tables 1–10 with other factors 1–10 across Quick, Free, Timed Practice and Custom Test; retain existing levels and School Test.
- **Next Table(s):** increment every selected table by one, show the destination and stop when any selected table is 10.
- Display selected tables in active headings, results, history and exports; preserve selections through repeats. Balanced generation and existing records remain protected.

**Evidence:** Owner acceptance covers desktop Chrome and physical iPhone Chrome/Safari; desktop keyboard was specified for G/E/F, while later input methods and individual regression cases were not itemized. The code at `13417bd` includes the heading correction; `b2db2e6` records acceptance. Automated increment suites passed, including all 1,023 table subsets and 2,356 seeded generation/repeat sequences. Test counts across increments overlap and are not a cumulative certification. See [setup](docs/v6.1-setup-verification.md), [repeat actions](docs/v6.1-repeat-verification.md), [tables and follow-ups](docs/v6.1-tables-verification.md), and [preview acceptance](docs/v6.1-branch-deploy-trial.md).

**Release complete — 2026-11-15:** Final automated regression passed 211 browser checks across 17 suites, 2,356 seeded sequences and all 1,023 table subsets. The owner completed the desktop/iPhone checklist and preview smoke, including fresh permission prompts. GitHub Pages now serves v6.1.0 from main `f760615`, with the annotated tag and published GitHub release. Production index/assets matched the release; six production smoke checks and a targeted synthetic backup restore passed. Owner confirmed actual production voice on Windows Chrome and physical iPhone Chrome/Safari. See [completion evidence](docs/v6.1-release-plan.md#completed-production-verification--2026-11-15).

Accepted limitations remain Android/tablets, unavailable manual genuine legacy history (synthetic checks passed), and missing exact manual OS/browser versions. At release approval the owner confirmed no history needed preserving; reconfirm backup needs before future data work. Netlify production remains v6-development and unchanged. Rollback requires separate approval. The release has no outstanding execution gates; the next sequence is agreed below, with implementation requiring separate authorization.

**Deferred, not release blockers:** B (missed-fact practice), C (per-table progress), D (division-family selection), explicit 11/12 table selection, offline/early-learning work and the previously deferred full-family/legacy-assignment features.

**Milestone closed:** completed release and production voice verification are recorded above; accepted coverage limitations remain visible. No new app change or publication is part of this documentation update.

### v6.2 — Targeted review and mobile setup usability (PLANNED — next)

**Current release-candidate status — 2026-11-15:** v6.2a–c are implemented on `v6.2-development`; v6.2 remains unreleased/Coming Soon. The existing heading denotes the next unpublished release, not unimplemented work. Owner acceptance covers iPhone Safari/Chrome mobile layout, repeated five-question voice with the accepted delay, and v6.2c progress/layout. See the [final automated review](docs/v6.2-final-regression.md), [draft release notes](docs/v6.2-release-notes.md) and [remaining manual checks](docs/v6.2-manual-release-checklist.md). Production approval is still required. Earlier planning/authorization notes describe their historical stage; subsequent scoped owner authorizations govern completed work. Release scope and image availability labels have not changed.

**Microphone privacy follow-up — local, unreleased:** explicit terminal/background cleanup and Parent corner Disable microphone now cover all learners and Guest in this browser, including review, remembered choices and the diagnostic lab. The restriction is not PIN-protected or OS-wide. Automated follow-up and remaining physical release/restart checks are recorded in [verification](docs/v6.2-microphone-privacy-verification.md); no preview push or release is authorized by this local change.

**v6.2a local implementation — 2026-11-15:** Owner authorized local mobile bottom-action work, including Continue/Start/Back and Results repeat/advance controls, while preserving voice readiness. Implemented and deployed to the v6.2-development Branch Deploy at 3fa74b1; owner accepted the mobile layout and confirmed voice working on physical iPhone Safari and Chrome. Unitemized microphone edge cases and full release-regression checks remain pending. See [verification and remaining checks](docs/v6.2-mobile-actions-verification.md). v6.2 remains unreleased/Coming Soon; release scope and the roadmap image are unchanged. The owner subsequently authorized committing/pushing this increment to the v6.2-development Netlify Branch Deploy for testing only; production remains unchanged.

**Build, in order:**

1. **v6.2a — Mobile setup:** Persistent Continue/Start area and compact summary, with the layout safeguards in section 2.
2. **v6.2b — Missed-fact review:** Launch short targeted practice from Results and Progress using fresh generator pools. Owner-approved local implementation includes All activities by default in Progress, an optional single-activity filter, and session-only review from Results. See [local verification](docs/v6.2-missed-review-verification.md). After local acceptance, the owner authorized committing/pushing this increment to v6.2-development for Netlify Branch Deploy testing only; no merge to main or production deployment is authorized.
3. **v6.2c — Per-table progress:** Understandable first-try, attempts, timing, sample size and recent-performance summaries. Implemented locally with owner authorization: a shared recent-five-eligible-flight/all-flight window, explicit table overlap and small-sample notices, and microphone/active-time limitations. See [verification](docs/v6.2-table-progress-verification.md). The owner accepted the local progress/layout and authorized committing/pushing this increment to the existing v6.2-development Netlify Branch Deploy for iPhone testing. The owner subsequently accepted the v6.2c progress and layout changes on physical iPhone Safari and Chrome after Branch Deploy affac47. Full release checks remain pending; no main merge or production change is authorized. v6.2 remains Coming Soon, with unchanged release scope and roadmap image.

**Value / risk:** Easier starts and useful review for existing families. Medium complexity and regression risk; preserve setup, scoring and ownership. Dependencies are agreed selection/metric rules and shared fact identity, not a new subject engine.

**Done when:** Automated checks cover review eligibility, tiny/empty pools, ownership, replay/export and table denominators/overlap. Physical Windows Chrome and iPhone Safari/Chrome confirm reachable controls with keyboard, safe areas, large text, dialogs and voice readiness. Relevant history/reload and full release regression pass. Division/11–12 are intentionally separate in v6.3.

#### Review and reporting defaults — proposed

- Results reviews only the completed flight. Progress defaults to All activities, with an option to choose one activity, and considers the latest five eligible flights for that learner within the selected scope. Mixed reviews preserve each question's activity and original level/table context. These selection defaults were confirmed by the owner for local v6.2b implementation.
- Include wrong answers even if corrected, plus explicit skips. Exclude untouched timed-out questions, unrecognized speech and undone mistakes absent from retained attempts. Slow-but-correct review is deferred.
- Deduplicate fact identities within an activity; default to up to five unique facts. Explain tiny pools, allow short reviews/repetition, and offer ordinary practice for an empty pool.
- In rolling review, retire a fact after first-try success in two distinct later flights following its latest mistake/skip. Leaving the five-flight window does not mean mastery. Keep selection explainable and parent-overridable.
- Guest initially reviews only the current completed flight, in memory; never transfer Guest results or mix learners.
- Reuse `createQuestionSource(settings, random, pool)` with fresh question state. Never mutate historical attempts. Review-origin configuration must survive replay and export/import.
- Per-table views show first-try correct/attempted encounters, wrong submissions, skips, distinct facts, recent window and average active time. Exclude untouched facts; explain that active time includes listening/interaction/retries.
- A reversed pair such as 4 × 7 contributes once to each relevant table view and once globally; 4 × 4 counts once in its table. Table totals overlap and must not be summed. Do not infer an exclusive intended table from randomized display order.
- Show sample size and a small-sample notice (proposed threshold: ten encounters). Compare equivalent scopes/windows; avoid mastery percentages and unsupported improvement claims.

### v6.3 — Fact families and grouped navigation (PLANNED)

**Build, in order:**

1. **v6.3a — Fact-family extension:** Targeted division and explicit multiplication tables 11/12 with deliberate factor ranges.
2. **v6.3b — Grouped navigation:** Subject/group/activity organization from section 2, supported by a small activity registry.

**Value / risk:** More precise practice and room to expand. Medium complexity; medium-high compatibility risk for family records and medium navigation risk. Reuse selectors with operation-specific semantics and preserve existing Quick/repeat/School paths.

**Done when:** Generator diversity, range/version validation, old/new imports, remembered preferences and Next Table endpoint tests pass. All activities and shortcuts remain reachable by keyboard/touch on required physical browsers. No School Test changes or silent range changes.

#### Fact-family defaults — proposed

Division selection means **Divide by** selected divisors with exact integer answers: choosing 4 produces `(4 × q) ÷ 4`. Share selector UI/configuration patterns but preserve ordered division identities and all existing levels.

Expand explicit multiplication to 1–12 with **Other factor: up to 10 / up to 12**. Existing selections retain their original up-to-10 meaning. Save the range and preserve it through repeats, preferences and exports. Next Table(s) advances all selections together and stops if any is 12; no wrapping/dropping tables. School stays unchanged. Coordinate generation, validation, session versions, imports, labels and analytics rather than adding buttons alone.

### v6.4 — Numbers & Counting, shapes and colors (PLANNED)

**Build, in order:**

1. **v6.4a — Counting pilot:** One complete choice-based activity with typed answers and versioned results.
2. **v6.4b — Early-practice expansion:** Number recognition, sequences/order, skip counting, shapes and colors using the tested choice presentation.

**Value / risk:** Younger children can participate with large touch targets and parent help. The pilot is medium-high complexity with high risk at the data boundary; later content reuse is medium complexity/risk. Depends on grouped navigation and compatible result adapters. Explore is optional and untimed; content details are in section 4.

**Done when:** Automated generation/grading, learner ownership, export/import and reload pass for the pilot before expansion. Human review confirms countable illustrations and unambiguous choices. Physical devices verify touch/keyboard equivalents, large text and parent-led participation; color alone never signals correctness.

### v6.5 — Letters and sounds (PLANNED)

**Build:** Uppercase/lowercase recognition and matching, ordering/missing letters, spoken names, then curated letter sounds and beginning-sound/picture activities. Reuse content definitions for optional Explore.

**Value / risk:** Accurate early alphabet/sound practice. High content effort and medium runtime risk. Depends on reviewed content IDs, dialect, licensing and audio strategy; no generic TTS substitution for phonemes.

**Done when:** Automated asset/configuration and graded-outcome tests pass. Human pronunciation/content review and physical-device playback, unavailable-audio fallback and microphone/playback coordination are accepted. A young child can participate without reading instructions or fine-motor demands.

### v6.6 — Time & Clocks (PLANNED)

**Build:** Analog reading through exact minutes, analog/digital matching, and 12/24-hour conversion. Deliver elapsed time as a separate follow-up activity; interactive hands follow with keyboard and non-drag alternatives.

**Value / risk:** Practical time skills; medium-high complexity and medium regression risk. Reuse SVG/choice presentation and typed results; use integer-minute arithmetic and explicit day context.

**Done when:** Automated geometry, answer generation, noon/midnight and elapsed-time boundary checks pass. Physical touch/keyboard/orientation checks confirm responsive hands/choices and accessible alternatives. Levels remain freely selectable.

### v6.7 — Early reading and sight words (PLANNED)

**Build:** Small reviewed decks, listen-and-select, reveal cards, unambiguous word/picture matches and local review words; later spelling/typing and short reading when useful. No full curriculum.

**Value / risk:** Fast, useful word practice without preparation/accounts. High content/assessment effort and medium-high risk. Reuse audio/reveal/choice infrastructure; distinguish independent, revealed and parent-reported outcomes. Automatic spoken-word grading remains deferred.

**Done when:** Automated deck/answer/result and backup/reload checks pass. Human review and physical-device audio, keyboard/touch and fallback checks pass. A parent can open a short word session quickly; voice is never the only completion method.

### Family reliability and offline support (PLANNED — release placement to decide)

**Build separately:** Full-family backup/restore → deliberate reversible Previous progress association; standalone launch improvements → versioned offline caching and safe update notices. Full-family backup precedes legacy association; settle navigation/assets before caching. Placement before or between new subjects is still open.

**Value / risk:** Recovery and reliable family use. Medium-high complexity with high data/update risk. Preserve original IDs, ownership and records; details are in section 6.

**Done when:** Automated duplicate/conflict, stale-review, failed-write and round-trip checks pass. Physical devices verify file import/export and standalone behavior. Offline work separately passes interrupted-update, mixed-version-tab, cache eviction, offline reload, history preservation and microphone/network limitation checks.

### Later — Playful practice and smarter review (DEFERRED)

**Build only when useful:** Optional short challenges, picture reveals, session-local rewards and transparent slow-but-correct review with parent override.

**Value / risk:** Enjoyment and useful suggestions; scope/complexity depend on evidence from simple review. Reuse existing activity rules rather than creating mandatory progression.

**Done when:** Selection/reward rules are testable, keyboard/touch and reduced-motion behavior work on required devices, and games are never required to access practice/reports. No streak pressure, premium currencies or advertising.

### v7+ — Further content expansion (DEFERRED — idea inventory)

Money/change and measurement; patterns; vocabulary; science/geography; parent-created decks and importable content packs. Grouping is described in section 8. Define small scopes only after multiple working content types demonstrate reusable needs; these are not release commitments. Content-pack sharing must never share learner progress.

### Existing capability reference

Source review confirmed the following existing capabilities; do not reimplement them:

- Eight math activities (addition, subtraction, multiplication, division, number bonds, doubles, halves, squares), each with five whole-number levels.
- Choose Tables 1–10 for multiplication with other factors 1–10. Numbered multiplication/division levels already include 11 and 12; explicit selection does not.
- Quick (5/10/15/20 questions), continuous Free, configurable Timed and Custom Test; Focus and Worksheet.
- Original School Test: separate generator, 60 questions, two minutes, three-column worksheet, tables 2–10. Preserve scoring and optional Focus presentation.
- Practice Again, Next Level, Next Table(s) and per-learner/activity last-started settings; the Quick shortcut remains separate. Direct repeat needs complete current-tab configuration; older/reloaded flights retain settings review.
- Optional voice ready/reconnect, keypad and keyboard fallback; first-try scoring, corrections, skips, timing and history.
- Optional local nickname profiles, isolation, temporary Guest, renaming, scoped deletion and individual-learner backup/import with review, duplicate skipping and conflict rejection.
- Responsive branded interface, themes, Home Screen icons and manifest. Manifest display is currently browser mode; offline caching is not implemented.

See [generation](scripts/math-activities.js), [menus](scripts/menus.js), [engine/reports](index.html), [profile integration](scripts/profiles.js) and [storage/import](scripts/profile-store.js). Previous progress remains separate. New subjects are Coming Soon. Missed-fact launch, per-table summaries, division selection, explicit 11/12, full-family restore and offline support remain missing.

Preserve local-first storage, optional nicknames, reliable non-voice input and existing history. No accounts, advertising, subscriptions, remote analytics or cloud synchronization are part of this plan. Recognized transcripts are stored locally with results and may appear in exports; the app does not store microphone recordings. Browser speech recognition may send audio to an online service. Do not claim all speech processing is on-device. Competitor products may inform research but do not define the product.

## 6. Technical foundation to avoid rebuilding each subject

The pure math generator is reusable. Inline engine/global-function adapters, duplicated activity metadata, numeric-only answers, math reports and hard-coded import validation need deliberate extension. Avoid a complete rewrite, framework migration, backend or speculative authoring platform.

| Boundary | Responsibility |
|---|---|
| Content | Stable IDs, version/locale, assets and answer definitions |
| Activity rules | Generation, review selection, grading, supported modes and progression |
| Presentation | Existing Focus/Worksheet; choices/reveal first, matching/ordering later |
| Input | Numeric entry, choices, text, optional speech; keyboard/touch equivalents |
| Feedback | Correct, retry, skipped, revealed and unrecognized; activity-appropriate presentation |
| Results/progress | Learner ownership, typed attempts, timing semantics, versioned metadata |

Introduce a small capability-based activity registry. Keep math behind an adapter and prove one choice-answer activity before extracting more shared lifecycle code. Do not expose unsupported Worksheet, voice, timer or Next Level options. Explore/Practice share content, not scoring semantics.

Nonnumeric sessions need a versioned extension with typed answers, not unexplained numeric codes to satisfy old validators. Preserve v5/v6/v6.1 records unchanged and read by version/activity. Preserve selected-table metadata and individual backup compatibility. Save enough content/configuration for understandable review/replay. Separate scored, revealed, parent-reported and unrecognized outcomes; normally do not save Explore taps. Define audio-task timing and listening/replay inclusion. Do not combine unlike subjects into one accuracy score.

Before schema changes, require JSON backups and representative v5 copies plus v6 and selected-table fixtures. Reconfirm current backup needs; release-time no-history confirmation is not continuing evidence. Unsupported records must fail safely without rewriting/deleting originals. Keep disposable preferences separate from progress.

### Full-family backup and Previous progress

Use a distinct versioned family export containing all profiles and owned sessions, including empty profiles. Preserve IDs/ownership. Validate the entire file, review additions/duplicates/conflicts, recheck under the existing lock and apply atomically; conflicts block saving. Keep individual backups supported. Decide whether Previous progress belongs in a separate archive section; clearly state exclusions, including disposable preferences. Test failed writes, stale reviews, conflicts, duplicates and round trips.

After family backup, offer deliberate parent selection of old flights and a learner with count/ownership review. Prefer reversible associations preserving original records/provenance rather than rewriting ownership. Prevent duplicate assignment and double counting; support undo. Never infer ownership from nicknames or silently assign records.

### Standalone and offline

Icons/manifest already exist. Separately improve standalone launch and verify its microphone permissions. Then add versioned app-shell/content caching with correct `/FactFlight/` scope, update notices and activation between sessions. Never replace running-flight code automatically or treat history as disposable cache data. Test mixed-version tabs, interrupted updates, eviction, offline reload and history preservation. Cache approved assets only; offline practice does not guarantee offline speech. Installation stays optional.

## 7. Development, testing, and release process

1. Keep production `main` at verified v6.1.0 until a separately approved release. Active local branch `v6.2-development` was created from verified main `f760615`; completion notes from `b62a014` and the planning documentation/image are carried forward with owner approval for a local documentation-only commit. Recheck branch and working state before implementation. Future release branches should likewise start from verified production, not blindly from a previous development tip.
2. Develop incrementally locally. Run pure generator/validation checks, then affected browser suites using isolated synthetic data. Reuse existing generation, menu, profile, import, repeat, feedback and regression coverage; do not automate against real learner stores.
3. Use only the approved Netlify Branch Deploy workflow. Production stays `v6-development`; the documented enabled additional branch is `v6.1-development`. A new branch needs separately approved allowlist configuration. Earlier preview approvals do not authorize new commits/pushes or primary-site changes.
4. Batch coherent, separately approved preview pushes after local checks. Verify deployed SHA and Branch Deploy context before physical-device testing. Check usage before/after allowing for delay/rounding. Last account-specific evidence: 19 production deploys / 285 deployment credits / 14.7 remaining, with traffic increasing during the trial. This is historical, not a fresh balance. No extra production-deploy charge in that trial does not mean unlimited free previews. See [billing evidence](docs/v6.1-branch-deploy-trial.md).
5. Before proposing production, run full regression and reconcile actual branch changes with the changelog. Implemented features belong in Unreleased; planned scope stays here. Commits, pushes, merges, publication, tags and rollback require applicable owner approval.

**Mandatory release/device coverage:** Windows Chrome, physical iPhone Safari and physical iPhone Chrome; real voice ready/start, spoken answers, reconnection and permission prompts; touch/keypad and keyboard fallback; scoring/analytics; timed/untimed modes; scrolling/focus; history/reload; learner isolation/Guest; backup/import including legacy and selected-table compatibility; original School Test; portrait/landscape and responsive layouts. Listen to new audio, not just test loading. Add large-text, screen-reader and keyboard checks for changed controls. Android/tablets remain unverified until actually tested.

**Evidence discipline:** Separate automated and manual results, record device/OS/browser versions, and list unavailable checks. Emulation/mocked speech do not certify physical touch, microphone quality, permission prompts or orientation. Offline/update behavior needs its own tests when implemented. No new application tests or physical-device checks are claimed by this documentation-only update. Never clear valued browser data as a regression step.

## 8. Priority order and what NOT to build yet

**Now:** Documentation-only planning; v6.1.0 is complete. No implementation or publication is authorized by this roadmap update.

**Next:** v6.2 mobile setup → missed-fact review → per-table progress.

**After that:** v6.3 fact-family extension and grouped navigation → v6.4 counting pilot and early-practice expansion → v6.5 letters/sounds → v6.6 clocks → v6.7 reading. Family reliability is delivered separately with dependencies and placement as described in section 5; games and broader content remain later.

Optional challenges, picture reveals and session-local rewards follow simple review. Later slow-but-correct review must explain selection and allow parent override. Avoid streak pressure, premium currency, ads, notification campaigns and required games.

Money/coins/change and measurement units/conversions belong together; patterns near Numbers & Counting; vocabulary can extend Reading. Science, geography, parent-created decks and importable content packs remain an idea inventory. Wait for multiple real content types before designing a pack/authoring platform. Sharing content must not share children's progress.

Mandatory accounts, subscriptions, advertising, remote analytics, cloud synchronization, social features and complicated prescribed curricula remain outside this agreed plan.

### Decisions before implementation

The sequence is agreed; confirm detailed defaults while preparing each increment:

- Review eligibility/window, two-flight retirement, small-pool behavior and Guest scope.
- Table overlap/denominators and small-sample threshold.
- Factor/quotient ranges, record versions and repeat semantics for extended tables/division.
- Group labels and reviewed mobile setup/navigation prototype.
- Audio dialect, recording/licensing approach and pronunciation-review responsibility.
- Family backup inclusion of Previous progress and scheduling relative to new subjects. Backup before legacy association is the recommended dependency; placing it before new subjects remains an open choice.
- Exact schema/compatibility design, backup evidence and acceptance criteria before data-model changes.

## 9. How we will judge success

- A parent/child can start a short practice with few taps and repeat without retracing menus.
- The growing library remains easy to browse without overwhelming activity screens.
- A younger child can participate using large choices, clear sounds and parent help without fine-motor demands.
- Focus remains usable on phones; readable text and reachable controls take priority over eliminating all scrolling.
- Original School Test, speech ready/reconnect, keyboard/touch fallback and historical results remain intact.
- Learner records stay separate, backup/restore is reliable, and no historical ownership changes silently.
- Every activity has a useful non-microphone completion method; voice remains an enhancement.
- No registration, payment or unnecessary personal information is required.

## Historical appendix — earlier scope and acceptance records

The following records are preserved from the previous roadmap. “Pending,” “production remains v6.0.0,” “next release,” and old section references describe their original stage only. Current release status and future versions are in section 5; sections 1–9 govern the present plan. These historical records do not authorize new work.

### Earlier v6/v6.1 scope and acceptance

**Scope revision — 2026-11-14:** At the owner’s direction, the v6 program now includes optional profiles, Guest, export/import, separate local progress, expanded math activities and levels alongside the new app interface. These are incremental milestones within v6, not deferred behind the former v6.0/v6.1 boundary. See the [experience plan](docs/v6-experience-plan.md), [activity/level matrix](docs/v6-activity-matrix.md), and [clickable design preview](design-reference/ui-v6/v6-experience-preview.html). The preview is a disposable design artifact, not integrated app functionality.

**Implementation order revision — 2026-11-14:** At the owner's request, integrate the reviewed math activities into the working `index.html` first for testing at the normal Netlify address. The uncommitted interim Home has been set aside. Learner-first Home will follow phone review using the supplied desktop/mobile reference images. The math integration is implemented locally with verification in [the math integration record](docs/v6-math-integration-verification.md); this does not complete Focus, stream-based modes, profiles, or the full v6 program.

**Focus increment:** After successful owner voice/math testing, Focus/Worksheet presentation is integrated locally for all activities, including School Test. Both render the existing session model; history schemas are unchanged. See [Focus verification](docs/v6-focus-verification.md). Physical-device review of this new presentation remains pending; learner-first Home is still deferred.

**Approved menu increment — 2026-11-14:** The owner approved the account-free tile Home and guided menu mockup, with Free Practice continuing until Finish. These are now integrated locally, including Quick Practice across all activities, disabled Coming Soon subjects, and guarded Home navigation. Optional learner profiles remain subsequent work; this supersedes the earlier plan to require a learner-first Home now. Verification and remaining device checks are recorded in [menu integration verification](docs/v6-menu-integration-verification.md).

**Readability acceptance — 2026-11-14:** The larger-text update (`7e93dc1`) is owner-accepted on physical iPhone Chrome and Safari after 43 automated checks. This is visual/readability acceptance, not a new exhaustive device regression pass. Next proposed increments are branded Home Screen icons, learner-selection Home, and backup-safe local profiles. See [the next-phase plan](docs/v6-profiles-home-plan.md). Icon metadata is brought forward; offline caching and update handling remain separate.

### Previous release record — v6.0.0 published

Version `v6.0.0` is published from main commit `6cff208`, with an annotated tag and GitHub release. Brand, learner Home, eight activities/five levels, Focus/Worksheet, configurable modes, remembered Quick, separate profiles/Guest, management and individual-learner restore are implemented. The audited replay/backup fixes and compact Progress are included. Earlier increment paragraphs below are historical records, not the current release status.

Published files and automated production smoke passed. The owner subsequently confirmed production voice, menus, profile creation/change/deletion, and answer-box feedback; browser/device names were not specified for that report. Earlier full preview regression covered Windows Chrome, iPhone Safari and iPhone Chrome. See [production verification](docs/v6-release-plan.md#completed-production-verification) for the exact scope and remaining unverified coverage.

Full-family backups, old-history assignment, custom fact-family selectors, deeper mode/trend reporting and offline/early-learning work remain proposed follow-ups rather than completed features.

### v6.1 — Approved scope (2026-11-15)

Active development is `v6.1-development`, created from the verified local `v6.0.0` tag / main commit `6cff208`. Production remains v6.0.0. The older v6 implementation notes below are historical context; this section governs the next release.

Approved scope, in implementation order:
1. **G — Configuration and menu persistence:** last actually started settings per learner/activity; preserve the separate Quick shortcut and temporary Guest behavior.
2. **E — One-tap Practice Again:** fresh sessions with the completed flight's compatible settings, preserving voice readiness and history.
3. **F — Next Level:** immediate optional advancement by exactly one numbered level; no action at Level 5 or for non-level presets.
4. **A — Choose Tables:** multiplication tables 1–10, other factors 1–10, compatible modes and existing balanced generation; preserve School Test.

**Deferred:** B (missed-fact practice), C (per-table progress), D (division family selection), and explicit 11/12 table selection. These are not v6.1 commitments.

The configuration/menu increment is implemented locally; verification is recorded in [v6.1 setup verification](docs/v6.1-setup-verification.md). E/F are also implemented locally: same-tab Practice Again and Next Level share the validated configuration and normal voice startup; incomplete historical configurations retain setup review. See [repeat-action verification](docs/v6.1-repeat-verification.md). A is now implemented locally, with automated verification and remaining device checks recorded in [Choose Tables verification](docs/v6.1-tables-verification.md). Owner accepted G/E/F on desktop Chrome (keyboard) and physical iPhone Chrome/Safari; full release regression and unitemized voice checks remain pending. The initial scope approval did not authorize publication. Subsequent owner approval permits one commit/push of the reviewed G/E/F increment for a Netlify Branch Deploy trial; production remains unapproved. See [trial record](docs/v6.1-branch-deploy-trial.md). Complete local checks and physical-device regression before release approval.

**Branch Deploy acceptance — 2026-11-15:** Owner verified `dc155f8` on the successful v6.1 Branch Deploy: direct Practice Again, Next Level, and remembered selections after Home navigation. Owner subsequently specified desktop Chrome with keyboard and confirmed the link and changes work on physical iPhone Chrome and Safari. iPhone input method was not specified; full release regression and unitemized voice checks remain pending. Billing still displays 19 production deploys / 285 deployment credits and 14.7 remaining, with requests increasing from 892 to 903. See the [trial outcome](docs/v6.1-branch-deploy-trial.md#trial-outcome-and-owner-acceptance--2026-11-15). Choose Tables is the subsequent local increment; its new behavior is not covered by this earlier device acceptance. Production is not approved.

**Choose Tables acceptance — 2026-11-15:** Owner confirms `ae6e496` works on desktop Chrome and physical iPhone Chrome/Safari via the Branch Deploy. Input methods and individual regression cases were not specified. This does not complete the full release checklist or authorize production. The owner chose to advance every selected table by one for the subsequent Next Table(s) action (2, 5 → 3, 6), unavailable if any selected table is 10. The owner subsequently verified Next Tables and the corrected selected-table heading on desktop Chrome and physical iPhone Chrome/Safari on the Branch Deploy (`13417bd`) on 2026-11-15. The supplied screenshot shows “Multiplication · Tables 3, 9” during practice. This feature acceptance does not establish a full release regression pass; input methods and individual edge cases were not specified.

**Manual regression acceptance — 2026-11-15:** The owner completed the desktop/iPhone walkthrough across Windows Chrome and iPhone Chrome/Safari. See the [recorded results and exceptions](docs/v6.1-manual-release-checklist.md#completed-owner-walkthrough--2026-11-15). Earlier increment paragraphs below and above describe evidence at their respective stages; the current release gates are in section 5. Production remains unapproved.

**v6.1.0 production approval — 2026-11-15:** Owner authorized final release documents, promotion to main/GitHub Pages, production verification, and tag/GitHub release publication. Testing exceptions are accepted, permission prompts and preview smoke passed, and no history needs preserving. Netlify production stays unchanged; rollback requires separate approval. Earlier pending-approval entries retain historical context. See the [execution plan](docs/v6.1-release-plan.md) and [release notes](docs/v6.1-release-notes.md).

**v6.1.0 complete — 2026-11-15:** Published main `f760615`, annotated tag and GitHub release verified; owner confirmed production voice on Windows Chrome and iPhone Chrome/Safari. Earlier scope/approval paragraphs are historical records. See section 5 and the [release completion record](docs/v6.1-release-plan.md#completed-production-verification--2026-11-15). Netlify production is unchanged; rollback requires separate approval.


### Earlier learner integration and v6.0 acceptance

**Learner Home review — 2026-11-14:** Owner accepted the branded icon and app launch from the physical iPhone Home Screen. The [learner Home mockup](design-reference/ui-v6/v6-learner-home-preview.html) is ready for design review. It uses memory-only sample profiles/results; real learner storage, Guest retention, and data migration remain unimplemented.

**Learner integration — 2026-11-14:** The reviewed learner Home is now integrated locally with nickname creation/selection, profile-owned new flights, learner-filtered results/exports, and temporary non-saving Guest use. Existing history remains unchanged under Previous progress. Owner confirmed there is no current history requiring backup; synthetic legacy copies are used for compatibility checks. See [profile integration verification](docs/v6-profiles-integration-verification.md). Physical-device acceptance remains pending. Rename/delete, full-family import/restore and deliberate old-history assignment remain separate work; this does not mark the complete family-data milestone finished.

**Profile device acceptance — 2026-11-14:** Owner tested `0ceae90` on physical iPhone Chrome and Safari and confirmed that profiles work, progress stays separate, and Guest does not save. Profile deletion is still unimplemented; proposed next management flow is Parent corner → Manage learners, with per-profile export and explicit scoped deletion confirmation. This acceptance does not mark all family-data or release regression gates complete.

**Manage learners increment — 2026-11-14:** Parent corner now includes local profile-specific export and confirmed deletion, with name/count review, cross-tab conflict detection, and preservation of other learners and Previous progress. No schema migration was needed. Physical-device acceptance remains pending. Rename and import/restore remain future work. See [management verification](docs/v6-manage-learners-verification.md).

**Manage learners device acceptance — 2026-11-14:** Owner tested export and profile deletion at `8d73b25` on iPhone Chrome and Safari and confirmed that the other learner’s progress remains intact. Import/restore and profile renaming remain outstanding.

**Learner restore increment — 2026-11-14:** Version-1 Manage learners JSON exports can now be reviewed and restored locally. Exact duplicates are skipped, conflicts block saving, and writes recheck the review under the family-store lock. Other learners and Previous progress are preserved. Owner confirmed no current history required backup; synthetic exports and legacy copies were used in tests. Device acceptance remains pending. Full-family backups, legacy export import/assignment, and profile renaming remain separate milestones. See [restore verification](docs/v6-import-learner-verification.md).

**Restore acceptance and learner names — 2026-11-14:** Owner accepted import/restore at `695854d` on iPhone Chrome and Safari. Change Learner Name and clearer duplicate-import messaging are now implemented locally. Renaming leaves IDs and flight records unchanged; an older nickname in an import does not overwrite the current local name. Device acceptance of these follow-ups remains pending. Full-family backups and Previous progress assignment remain future work.

**Answer-feedback increment — 2026-11-14:** Owner accepted nickname changes and duplicate-import messaging at `31bb944` on iPhone Chrome and Safari. At the owner’s request, Focus now provides prominent red/green/grey-blue answer feedback with symbols and a short correct-answer hold. Physical-device acceptance of feedback remains pending; see [feedback verification](docs/v6-answer-feedback-verification.md).

**Answer-feedback acceptance:** Owner accepted `256160c` on desktop and physical iPhone with speech and keypad. Browser names and exhaustive edge-case coverage were not specified. The next proposed increment is configurable Timed Practice and Test/challenge setup, preserving the fixed original School Test, followed by a v6 scope audit and consolidated release regression. Full-family backup and deliberate Previous progress assignment remain separate proposed data-management increments; offline caching and early-learning modules remain deferred.

**Configurable sessions increment:** Timed Practice and Custom Test now offer 5/10/15/20/30/60 questions and 1/2/5-minute limits in the working app. School Test stays fixed at 60 facts/two minutes. New flights carry optional practice-type/time-limit metadata; existing records are not migrated or rewritten. Owner confirmed no history required backup. Local verification and remaining physical-device checks are recorded in [configurable session verification](docs/v6-configurable-sessions-verification.md). This increment has not been pushed or accepted on physical devices.

**Quick Practice shortcut increment:** Implemented per-learner last-started Quick choices, a Home summary, fresh-question Start again, and Change options. Other modes preserve the shortcut; Guest choices are temporary. Preferences use separate per-learner browser keys, leaving history/profile schemas unchanged. Browser acceptance of the preceding configurable-session increment was reported by the owner; physical-device acceptance of both increments remains pending. See [Quick shortcut verification](docs/v6-quick-preferences-verification.md).

**Combined preview approval:** Owner accepted the configurable-session and Quick Practice updates locally and approved committing/pushing both together to `v6-development` for normal-address Netlify testing. Physical iPhone acceptance remains pending.

**Release-fix implementation:** R1 historical-flight replay and R2 restore-compatible report backups are implemented locally, with `6.0.0-rc.1` metadata. Existing saved formats/ownership remain unchanged; missing older replay metadata is explained at setup. Verification and remaining preview acceptance are tracked in [release-fix verification](docs/v6-release-fixes-verification.md). No production release is approved.

**Progress readability follow-up:** Facts to focus on and Flight log now have independent three-row previews and expand/collapse controls. Incorrect submitted values are explicitly labeled separately from attempt counts, with definitions under About these numbers. Scoring, speech interpretation and saved history are unchanged; local checks are recorded in [progress verification](docs/v6-progress-disclosure-verification.md). Device acceptance remains pending.

**Release-fix preview acceptance — 2026-11-14:** Owner reports `63650a0` looks as expected on desktop and iOS. R1 replay, R2 report backup consistency, candidate metadata and compact Progress are implemented and preview-accepted. This is not a new exhaustive or browser-itemized regression report. Next is final release preparation and explicit production approval; no production release has been authorized.

**Release preparation:** Proposed `6.0.0` notes and a concrete promotion/backup/rollback plan are prepared locally in [the release plan](docs/v6-release-plan.md). Final version metadata is staged locally; no production action is approved or complete.

**v6.0.0 production approval — 2026-11-14:** Owner confirmed no history needs preserving and explicitly authorized final release commits, merge/push to main and publication of v6.0.0 with its tag. The release scope is the accepted math/family experience, including the audited replay/backup fixes and compact Progress. Deferred work remains listed above. See [release notes](docs/v6-release-notes.md) and [execution plan](docs/v6-release-plan.md).

**v6.0.0 published and production smoke accepted:** Main commit `6cff208` is deployed to GitHub Pages with annotated tag `v6.0.0` and a published GitHub release. Published assets and automated production smoke passed. The owner subsequently confirmed voice, menus, adding/changing/deleting profiles, and answer-box colors work on production; browser/device details were not specified for this report. See [production verification](docs/v6-release-plan.md#completed-production-verification). This closes the release milestone without extending the stated device coverage.
