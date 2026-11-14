# Fact Flight v6.0 — Milestone 1 Local Preview Test Notes

Date: 2026-11-14
Status: **Local preview for review; not deployed, committed, or production-ready.**

## Preview

`FactFlight_v6_M1_Profile_Foundation_Preview.html`

## Implemented

- Brand Kit palette tokens: Golden Yellow `#FBBF24`, Soft Amber `#FCD873`, Near Black `#0B0B0F`, Off-White `#FFF9E6`, Sky Blue `#7DD3E9`. Light/dark backgrounds and neutral supporting tokens. **No final logo or official font embedded**; text-only identity and system-font fallback are intentional pending approved production assets.
- New profile-first Home with tagline, up to five saved nickname-only profiles, selectable color/initial, memory-only Guest, and a Results & Stats shortcut visible without profile selection.
- Subject screen with working Math route and clearly disabled future subjects. Math menu routes to original multiplication School Test and free practice, which remain the only activities in this milestone.
- Named profile creation, rename/color edit, duplicate rejection, maximum-five limit and confirmed profile/history deletion.
- Separate v6 localStorage keys `fact-flight-profiles-v6` and `fact-flight-sessions-v6`. Original v5 `fact-flight-history-v1` key remains read-only, with old records accessible as Legacy/Unassigned History.
- Guest sessions remain in memory and are discarded when Guest exits; Guest records are not written into persistent session/history keys.
- Profile-specific basic session list and family overview, with advanced analytics/export/import scheduled for later milestones.

## Automated/local checks — PASS

- JavaScript syntax check (`node --check`); no duplicate element IDs; no uncaught page errors in test flows.
- Chromium DOM tests: empty Home view, create profile, choose profile, subject navigation, keyboard-mode start, end session and display results.
- Five-profile cap, edit nickname, three disabled future subjects.
- Named session stored with correct `profileId`; Guest session does not increase persistent session count; Guest memory clears on exit.
- Representative seeded v5 legacy record remains unchanged in `fact-flight-history-v1`, and original legacy review remains accessible.
- Correct answer increments first-try score; Undo reverses score; forcing timer expiry closes a timed session; named data can reload from storage.
- Light/dark UI rendered in emulated Chromium desktop/phone-sized viewports.
- `connectMic()` and its speech-recognition handlers compared byte-for-byte against supplied baseline; unchanged.

## Testing limitations

- Automated Chromium tests used an `about:blank` page with injected HTML and mocked localStorage because direct browser navigation to local files and localhost URLs was blocked by environment policy. They do not constitute production-origin or full real-browser storage verification.
- **NOT TESTED:** actual microphone permissions, speech-to-text audio recognition, reconnect prompts, iPhone Safari, iPhone Chrome, Android Chrome, tablet devices, full orientation/device safe-area behavior, production hosting or PWA usage.
- Automated checks are not a substitute for manual interaction/accessibility and contrast auditing. No formal WCAG contrast-audit run has been completed.
- No repository files, development branches, `ROADMAP.md`, or production deployment modified.

## Missing production brand assets

1. Individual production-ready horizontal/stacked/logo-icon assets (SVG preferred, or transparent PNG at suitable sizes). The provided Brand Kit is a composite reference sheet.
2. Approved font family names, weights, and licensing/hosting instructions. The composite does not state the font specification.
3. Optional official square app icon exports for favicon/PWA; required before PWA/icon polish.

## Review before Milestone 1 approval

- Verify Home and profile management visually across target devices.
- Verify named profile persistence with real browser storage, legacy history preservation, and Guest isolation after reload.
- Verify the original school worksheet end-to-end in voice and keyboard modes, including iOS microphone permission prompts.
- Integrate final logo and typography once assets are provided and recheck contrast/light/dark mode.
- No commits, pushes, previews on external hosts, or `main` changes without separate explicit authorization.
