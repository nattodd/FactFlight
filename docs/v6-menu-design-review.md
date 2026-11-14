# Tile-menu design review — R1

Date: 2026-11-14. Design only. Open `design-reference/ui-v6/v6-menu-preview.html` locally. No working-app files, speech, scoring, storage, or saved records are changed. Nothing was committed, pushed, or deployed for this review.

## Proposed flow

- Home is a useful branded landing screen, not an extra timed splash gate. Prominent Quick Practice, Math, Results & Stats, and Parent corner. No account/Guest selector at this stage.
- Letters & Sounds, Colors & Shapes, and Reading are disabled tiles explicitly labeled Coming Soon.
- Math → one of eight activity tiles → mode → level and question count → input/view → Start.
- Home Quick Practice → any of the same eight activities → level and 5/10/15/20 questions → input/view → Start. It skips the mode page.
- Five level tiles show concrete example equations, not just difficulty numbers. Nothing is locked by age or previous performance.
- Answer tiles: Tap or type / Say it out loud. View tiles: One at a time (Focus) / The whole sheet (Worksheet). Original School Test supports both views.
- The last step recaps activity, level/table, count, and time before Start. Optional first-try goal is in collapsed grown-up options.
- Back retains choices. Home and Progress remain visible. Start ends at an explicitly labeled handoff mockup; it does not run another simulated scoring engine.

## Behaviors to refine before integration

This mockup proposes menu grouping, not changed session rules:

- Quick: 5/10/15/20, untimed, available for every activity. Skip/revisit behavior should be confirmed separately; the menu does not silently replace the working engine's revisit rule.
- Free: selectable finite set, untimed, matching the current app. If “Free Practice” should instead continue indefinitely until Finish, that requires an explicit engine change later.
- Timed: selectable set with the existing two-minute limit. No unimplemented duration choices are advertised.
- Test: proposed 60-question, two-minute preset for the chosen activity and level. This uses familiar current capabilities; it does not imply single-attempt assessment scoring or blocked retries.
- Original School Test: a distinct shortcut under Math and multiplication modes. Select table 2–10; retain exactly 60 facts, two minutes, original generation/scoring. Worksheet default, Focus available. This avoids silently replacing the School Test with generic multi-table multiplication.
- Progress/Parent screens demonstrate navigation and preservation of existing reports, exports, microphone help, and privacy guidance. They do not read or invent student data.
- Later integration must retain the tested Focus/Worksheet session controls, recognized speech, reconnect, keypad/keyboard, scoring, timers, results, and both history stores.

## Mockup checks

Isolated Chrome checked Quick routes for all eight activities, all four Math mode routes, School table preset, and Back. There are no select/dropdown controls and three disabled subject tiles. Twenty-five combinations of Home/Math/Mode/Practice/Ready screens and 320×568, 390×844, 844×390, 768×1024, and 1440×1000 viewports had no horizontal overflow. Storage access and microphone requests were configured to throw; none occurred. No page errors were observed. Desktop Home and phone level/count screenshots were visually inspected.

This is not production regression or physical iPhone verification. Review the menu flow and labels first, then implement only the agreed changes in the working `index.html` and validate at the normal Netlify address after commit/push approval.
