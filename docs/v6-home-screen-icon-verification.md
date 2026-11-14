# Branded Home Screen icon — 2026-11-14

Implemented locally on `v6-development`: explicit 180px Apple touch icon, multi-resolution favicon, and manifest with 192/512px icons. All artwork is copied unchanged from the brand-kit source-derived FF icon files. The 180/192/512px PNGs were visually inspected; the 512px source is an upscale. The unreviewed maskable composition is not advertised as maskable.

The manifest uses relative identity, start, scope, and image paths, and requests `browser` display. No standalone/fullscreen opt-in, service worker, storage migration, speech change, or session-engine change was added. Device/browser choices can still affect launch behavior.

## Local checks

Two isolated Windows Chrome checks passed, serving the actual app at `/` and `/FactFlight/`. Both verified HTTP success for manifest and icons, image decoding, PNG dimensions, start/scope resolution, favicon response, all eight Math menu choices, and no JavaScript page errors. `git diff --check` passed. This metadata-only increment did not rerun the full session regression suite; the prior larger-font acceptance remains separate evidence.

## Pending preview/device checks

The owner approved committing and pushing this increment to `v6-development` for the normal Netlify preview. Deployment verification checks the served metadata and binary icons against the committed files. On physical iPhone, add the preview to Home Screen and inspect the FF icon and Fact Flight label; launch it and check voice ready/answers/reconnect, keypad, Finish/Home, and history after reload. Check Safari and Chrome paths when available. Do not assume installed-context history is shared with a browser. Back up before removing an existing installed app; do not clear website data to refresh an icon. Android/tablet installation and physical device behavior are unverified.

Implementation references: [Apple Home Screen icon configuration](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [manifest icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons), and [manifest display](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display).

## Owner acceptance

The owner reported that the FF icon looks good on their iPhone and the app works when launched from the Home Screen after deployment of `0c45c84`. This records physical icon/launch acceptance, not a detailed fresh microphone, persistence, or cross-device regression pass.
