# Clear answer feedback — 2026-11-14

The owner reported successful learner-renaming/duplicate-import testing on iPhone Chrome and Safari, with progress intact, and requested more obvious correct, wrong and uninterpreted-speech feedback. The prior increment's device acceptance is recorded separately in the learner-name verification document.

## Behavior

- The Focus problem card shakes red after an incorrect submitted/spoken number and displays “✕ Not quite — try again.” Red persists until Skip or correction. Repeated wrong answers restart the shake.
- A correct answer turns the same card green and displays “✓ Correct!” for 350 milliseconds, then advances. This includes School Test Focus. During the hold, additional submissions cannot score another question. Speech result indices received during the hold, including interim results, are consumed so a late final cannot spill into the next question.
- An uninterpretable final speech result shakes the card grey-blue with “? Didn't catch that — try again.” It is not scored as wrong. After 650 milliseconds, a preceding wrong-answer red state returns, including after repeated unclear phrases. Ordinary interim recognition continues using the established numeric-stability behavior; silence without a recognition result cannot trigger a flash.
- Feedback text remains visible with voice input on phones. Both themes use existing red/green semantic colors and new grey-blue neutral tokens. Reduced-motion settings retain colors/text but disable shaking.
- Worksheet retains its immediate advance and persistent row correctness indicators. Shakes restart for repeated answers, and an uninterpretable final briefly highlights the active row grey-blue, clearing on Skip or a subsequent answer.
- Undo cancels a pending advance and restores the previous scoring state. Finish and timer expiry cancel delayed callbacks. The original deadline keeps running; the next question's active response time begins when it appears. Final completion time is captured when the final correct answer is submitted, so a correct answer just before the deadline remains complete even if the green display extends past the deadline.

No storage schema, ownership, history migration, question generation, scoring definitions, or speech parser was changed. Profile and Guest saving rules remain intact.

## Verification

All 122 automated checks passed in isolated Windows Chrome: 8 new feedback checks, 13 public menu, 9 readability, 11 Focus, 18 original regression, 12 math, 15 profiles, 11 management, 16 import, and 9 rename checks.

New coverage includes repeated wrong answers, correct-card hold before advancing exactly once, ignored duplicate input, unclear/repeated speech without scoring, late finals after an interim received during transition, Skip/Undo, Finish/expiry during the hold, last-answer deadline outcome/time, light/dark states, reduced motion, and worksheet compatibility. The timing tests use a paused browser clock advanced explicitly; early versions used a running clock and had test timing races around screenshots/the deadline, which were corrected before the final pass.

Existing tests now wait for the visible feedback hold before sending the next answer. A shared test helper advances a mocked clock where applicable. No production test-speed bypass was introduced. Final focused checks were rerun after tightening late-speech protection and neutral-row cleanup. The established engine suites still use their documented test-only fixture; public-menu/profile tests run the integrated app.

Phone correct/neutral screenshots were visually inspected. `git diff --check` passed. Automated speech is mocked; actual voice timing and perceived shake/hold duration on physical devices are not verified by these checks.

## Pending manual review

After an approved preview push, test the feedback with spoken and keypad answers on iPhone Safari/Chrome and Windows Chrome. Include wrong → unclear → correct, repeated wrong/unclear phrases, consecutive identical correct answers, Skip/Undo, final answer near expiry, and Finish/Home during the green hold. Review both themes, reduced motion, phone portrait/landscape, School and expanded math, both views, and the Home Screen context. Android/tablet and actual microphone/permission checks remain unverified for this increment.

The owner approved committing and pushing this update to `v6-development` for the normal Netlify preview. Physical-device feedback acceptance remains pending.
