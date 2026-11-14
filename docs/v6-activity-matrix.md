# v6 activity and level matrix — proposed

Date: 2026-11-14. All ranges below are proposals for owner review, not implemented production capabilities. Levels describe content, not ages, grades, achievements or required learning paths. Every level is immediately selectable.

| Activity | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
|---|---|---|---|---|---|
| Addition | Sums within 5 | Sums within 10 | Sums within 20 | Both operands 10–99 | One operand 100–999, the other 10–99; either display order |
| Subtraction | Minuend within 5 | Within 10 | Within 20 | Minuend 20–99, subtrahend 10–99 no greater than minuend | Minuend 100–999, subtrahend 10–99 |
| Multiplication | 2/5/10 tables, factors 1–10 | 2–10 tables, factors 1–10 | 2–12 tables, factors 1–12 | 13–20 × 2–12; either display order | 21–99 × 2–12; either display order |
| Division | Exact 2/5/10 families, quotients 1–10 | Divisors 2–10, quotients 1–10 | Divisors 2–12, quotients 1–12 | Divisors 2–12, quotients 13–20 | Divisors 2–12, quotients 21–99 |
| Number bonds | Make 5 | Make 10 | Make 20 | Make 100, each part 10–90 | Make 1,000, each part 100–900 |
| Doubles | Double 0–5 | Double 0–10 | Double 0–20 | Double 21–99 | Double 100–999 |
| Halves | Even numbers 0–10 | Even numbers 0–20 | Even numbers 0–40 | Even numbers 42–198 | Even numbers 200–1,998 |
| Squares | Bases 1–5 | Bases 1–10 | Bases 1–12 | Bases 13–20 | Bases 21–50 |

The owner selected **whole numbers first**. All answers remain nonnegative integers. No negative answers, fractions, decimals, remainders, or square roots are introduced. Higher levels exclude the starter operand ranges instead of simply broadening a pool dominated by easier questions. Addition/subtraction at higher levels naturally include carrying/borrowing opportunities but do not require regrouping on every question.

Examples of level 5: `684 + 78`, `732 − 86`, `47 × 8`, `564 ÷ 6`, `375 + ? = 1000`, `Double 675`, `Half of 1350`, and `47²`. Maximum answer is 2,500; the prototype accepts four digits through keypad and keyboard. Original School Test is unchanged: selected table 2–10, factors 1–10, 60 facts, two minutes.

## Common behavior

- All eight activities support proposed Quick, Free, Timed and Challenge modes. Only multiplication supports original School Test.
- Focus and Worksheet share the same session and order. For non-School sessions, the production worksheet layout must adapt to count; it must not manufacture 60 questions.
- All starter answers are nonnegative whole numbers. Keyboard/custom keypad must support each range. Voice is optional and offered only when validated for the activity/range/browser.
- Difficulty changes question selection, never the definition of correctness, first-try, skip, correction or timing.
- Use every available distinct fact once before starting another shuffled round. Keep frequencies within one occurrence of each other and put at least three other equations between repeats whenever there are at least four distinct facts. Carry this state across Free/Timed batches. For pools of one to three facts, maximize the achievable separation without changing the selected range or looping.
- Treat reversed addition/multiplication operands as the same fact for coverage and spacing; vary their display order on later rounds. Bond blank-position variants with the same known part also share a spacing key. Different facts with the same answer are not duplicates. Wrong-answer retries and deliberately revisited skipped School Test items are not newly generated questions and may recur sooner. New sessions reshuffle independently; no cross-session history is read for selection.
- Store activity, level/range, mode and answer-position metadata for distinct analytics. “3 + ? = 10” is not the same prompt as “? + 3 = 10”, though a parent report may deliberately group both.
- Higher levels reaching 2,500 require spoken-number and numeric-transcript parsing coverage beyond the current app limits (spoken words through 100 and numeric inputs up to three digits). Do not silently advertise voice support before validating it.

## Prototype coverage versus implementation

The experience preview exposes all eight activity cards and five level labels each. It now enumerates the full selected level pool and uses balanced randomized coverage and repeat spacing in the preview. It does not implement family multi-selection, remembered choices, real speech, production analytics, or persistent profiles. School Test preview generates six rounds of ten factors with alternating operand order and the three-intervening-equation rule, but the running v5 School Test remains untouched. Production integration and scoring parity still require later implementation tests.

## Open extensions

- Decide whether zero/one multiplication families should be independently selectable outside School Test.
- The five-level whole-number ladder is implemented in the design preview for review. Confirm mixed operations, square roots, missing-total bonds, negatives/fractions/decimals, and custom teacher targets separately before adding them to scope.
- Treat “etc.” as an extension list to approve, not permission to add arbitrary activity types or an unbounded curriculum.

## Working-app integration — 2026-11-14

The five-level whole-number pools are now integrated locally into `index.html` through `scripts/math-activities.js`. All eight activities use the existing worksheet/input/scoring engine with finite 5/10/15/20/30/60-question sets, untimed or with a two-minute limit. School remains its original separate preset. This increment does not implement the prototype's streaming Free/Timed modes, one-pass Quick behavior, or Focus View. Four-digit keyboard/keypad answers and spoken whole numbers through 2,500 have automated coverage; physical microphone verification remains pending.
