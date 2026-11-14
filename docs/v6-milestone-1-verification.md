# v6 milestone 1 — Brand and theme foundation

Record date: 2026-11-14

Status: Implemented locally on `v6-development`; 18 automated Windows Chrome checks passed, plus the owner-reported smoke check. Physical-device and real-microphone regression verification remains pending. Not released or deployed.

This record covers the application's brand foundation, not the separate profile-foundation prototype in `design-reference/ui-v6/`. Prototype test claims do not count as application verification.

## Implemented scope

- `styles/brand.css` defines the selected palette, semantic control/text colors, system font stack, and light/dark themes. Dark canvas is `#19191D` and dark surface is `#28282E`.
- `assets/brand/horizontal.svg` is an unchanged copy of the supplied light horizontal trace. It appears on cream backing in both themes to avoid the dark candidate's visible artifacts. It remains interim artwork, not an approved vector master.
- `index.html` loads the local stylesheet and logo, removes remote font loading, adds theme-aware focus styling and correct/wrong symbols, and adjusts control sizes and phone header/table-button layout.
- Existing navigation, worksheet, session JavaScript, scoring, speech logic, timer logic, history schema, and export code remain unchanged. No migration or profile integration was performed.

## Owner-reported check

The owner reported: “the app still works, the colors have changed, the logo is in the top left.”

This confirms the visible palette/logo change and a general functional smoke check. Browser/device, input mode, tested session flows, theme switching, and persistence details were not specified. It is not recorded as a full browser regression pass.

## Automated static checks — passed

Run on 2026-11-14 against the current working tree:

- Application script matches `v5.0:index.html` exactly after CRLF/LF normalization.
- JavaScript parses successfully using Node's `vm.Script`.
- Literal HTML element IDs are unique.
- Referenced local stylesheet and logo exist.
- Application HTML and brand stylesheet contain no Google Fonts URLs or CSS imports.
- Runtime logo matches the supplied light horizontal SVG trace.
- `git diff --check` reports no whitespace errors.

These are static checks, not browser execution, accessibility certification, or proof of unchanged runtime behavior after layout changes.

## Automated browser regression — passed

Run on 2026-11-14 with `tests/brand-regression.cjs`, using a temporary localhost HTTP server, isolated browser contexts, and synthetic history. No normal browser profile or original user history was accessed.

- Installed Windows Chrome **157.0.8103.51**, headless: **18/18 checks passed**.
- Playwright Chromium **159.0.8154.6**, headless: the initial **15/15 checks passed**. The three additional contrast/focus/revisit checks were subsequently run in installed Chrome.
- Playwright was installed in a temporary tools folder; no runtime dependency or package manifest was added to the app.

Coverage:

- Local logo loads; no external requests during the observed non-voice flow; theme switching and theme persistence after reload.
- School Test has 60 questions and three columns. Generator checks cover tables 2–10, factor frequencies, multiplication answers, and repeat spacing (20 generated sessions per table).
- Keyboard entry, first-try scoring, wrong-then-correct answers, skip, Undo, response-time accumulation, manual finish, and correct-answer symbols.
- Detailed results/history, session JSON, full-history JSON, and attempts CSV downloads.
- Full 60-answer untimed completion, correct totals, preservation of the earlier synthetic record when new sessions append, and reload persistence.
- Two-minute timed expiry using a simulated browser clock, with elapsed time capped at 120000 ms.
- Unsupported speech recognition: setup cancellation and keyboard fallback.
- Mocked speech recognition: ready/start gate, duplicate-result protection, and manual reconnect. This does not test microphone audio, actual speech-service responses, permission prompts, automatic reconnect under real conditions, or recognition quality.
- Six emulated viewport sizes: 320×568, 390×844, 844×390, 768×1024, 1024×768, and 1440×900. No page-level horizontal overflow before/during tested sessions. Phone keypad digit/delete/Enter input works, and the active fact is above the keypad. Wider layouts expose inline input.
- Semantic text, status, control-border, and focus color pairs meet the tested 4.5:1 text and 3:1 control/focus thresholds in both themes. This is a targeted check, not a full accessibility audit.
- Initial keyboard Tab focus and visible outline, enlarged body-text reflow at 640px, and reduced-motion transition suppression. This is not a complete keyboard or browser-zoom audit.
- A skipped question is revisited; completion yields 59 first-try facts, 60 correct, and one skip. Intermediate answers in this check use the session API; skip/final answer use UI controls.
- No uncaught page errors were observed in the monitored flows.

Assistant visually inspected captured desktop light/dark pages and the 320px worksheet. The logo and themes render; the narrow worksheet remains dense and wraps equations, reinforcing the planned need for Focus View. Screenshots do not verify physical-device touch behavior.

Earlier in-app-browser and native Computer Use attempts failed. The successful isolated Playwright runs above supersede the earlier lack of automated browser execution; they do not imply a successful native Computer Use session.

### Reproduce

Use a separately installed Playwright package and browser. Set `NODE_PATH` to its `node_modules` folder, then run `node tests/brand-regression.cjs` from the repository. Set `FF_CHROME_CHANNEL=chrome` for installed Chrome; omit it for Playwright Chromium. `FF_TEST_OUTPUT` optionally selects an artifact folder; otherwise screenshots/results go to the system temporary directory. The suite creates fresh contexts and its own localhost port.

## Preview workflow and remaining manual checks

The owner confirmed that Netlify is connected to the v6 branch and that a commit is needed for preview testing. Commit/push approval is still required under AGENTS.md. No commit, push, or deployment has been performed. Include the HTML, stylesheet, and runtime SVG together; uploading only HTML would omit required assets. Keep production `main` untouched.

The owner has an iPhone available. The following checklist must be completed separately in **iPhone Safari and iPhone Chrome**, and actual microphone checks also remain for **Windows Chrome**:

1. Open the updated Netlify preview. Confirm the logo, both themes, readable controls, and theme persistence after reload. Record browser/OS and portrait/landscape results.
2. In voice School Test, grant permissions if needed. Confirm the clock waits for “ready,” then starts; answer several facts aloud, try a wrong answer followed by correction, Skip, and Undo. Verify the displayed totals.
3. Test microphone reconnection after an interruption, and verify keyboard/touch fallback. Record permission prompts and recognition quality separately from scoring.
4. Run a full two-minute School Test and verify expiry/results. Run untimed practice and manually finish. Confirm keyboard/touch entry, active-question visibility, scrolling/focus, and accessible Skip/Undo/Finish controls in both orientations.
5. Review history and detailed analytics, export JSON/CSV, reload, and confirm saved sessions remain readable and new sessions do not change older records. Use disposable preview sessions or copied fixtures; preserve original history.
6. Check text enlargement/browser zoom, focus navigation where applicable, and browser bars/safe-area behavior. Record any clipped or obscured controls.

Remaining matrix:

| Environment | Automated status | Manual/device status |
|---|---|---|
| Windows Chrome | 18 checks passed, headless | Real microphone, permission/reconnection behavior, complete manual keyboard/accessibility checks pending |
| iPhone Safari | Not run in Safari | Owner testing pending |
| iPhone Chrome | Chromium viewport emulation only | Owner testing pending |
| Android Chrome | Chromium viewport emulation only | Physical device unverified |
| Tablets, both orientations | Chromium viewport emulation only | Physical devices unverified |
| Netlify HTTPS preview | Not deployed/tested | Pending approved commit/push and preview availability |

Netlify and GitHub Pages have separate storage origins. Synthetic test records demonstrate the tested persistence behavior; representative real v5 history copies still need verification. No migration is part of this milestone.

## Completion boundary

Implementation and documentation are recorded. Full milestone acceptance remains pending the manual and preview checks above. The v6.0 roadmap milestone is not marked complete. Home/navigation, Focus View, Quick Practice, profiles, data migration, and PWA work are outside this first milestone.
