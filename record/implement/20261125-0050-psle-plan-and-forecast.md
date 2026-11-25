# PSLE paper plan sub-tab and Questions per day finish forecast (0050)

> status: completed (2026-11-25)
> location: branch `develop`, commits `afeef68..c61695d`

## Upstream
<!-- upstream -->

- 0050 #1 implemented
- 0050 #2 implemented
- 0050 #3 no-implementation
- 0050 #4 implemented
- 0050 #5 no-implementation
- 0050 #6 implemented
- 0050 #7 no-implementation
- 0050 #8 implemented
- 0050 #9 no-implementation
- 0050 #10 implemented
- 0050 #11 implemented
- 0050 #12 implemented
- 0050 #13 implemented
- 0050 #14 implemented
- 0050 #15 no-implementation
- 0050 #16 implemented

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0015 Follow my PSLE paper plan (S14, C11) | Steps 1–7; extensions 1a, 2a–2c, 5a–5c, 6a | New PSLE sub-tab on Papers: progress line, week × subject grid opened at this week, paper panel with Open paper, Mark done (date and optional score), Undo, Record mistakes; folded reserve list |
| 0001 Record exercises (S2, C2) | Extension 2b | Record opened from a School paper shows a banner with Clear; the AI prompt gets the paper's subject; every draft and new set takes that subject and a Source starting with the paper label |
| 0006 Configure my practice (S11, C7, C9) | Steps 2, 6; extensions 1a, 1b, 6a–6c | Questions per day stepper (1–150) with recent pace; weekly stacked burndown with counts, finish line and PSLE marker |
| 0004 Review my progress | Extension 3a | No behaviour change; Today's This week bars are unchanged |
| 0016 Build or re-plan a PSLE paper plan | Steps 2–7; extensions 1a, 1b, 2b, 6a, 6b | `operate/plan/plan.mjs` build / replan / check; no production write has been made |
| 0014 Back up the production library | Step 2 | `backup.mjs` reads and verifies `plans` and `schoolPapers`; snapshots taken before 0050 still verify |

## Implementation choices

- Forecast runs 15 seeded projections (odd, fixed seed) and takes per-week medians; due exercises are taken oldest due first, ties in library order.
- Weekly bars start at this calendar week (Monday); week 0 simulates from today to Sunday.
- The forecast is cached on the exercises array, actor, Questions per day, date and owner, so Settings re-renders don't re-simulate.
- Chart colours: today's questions in `--pen`, new ones in `--pen` at 25 % opacity, so the strong/faint meaning holds in light and dark mode.
- Week labels and counts thin out on long charts; the last week is always labelled.
- The grid sits in a 62vh scroll box with a sticky header and opens scrolled to this week, once per visit to the sub-tab.
- Short school names come from `short`; the fallback is the one-word school name or initials. The plan tool uses the same fallback for document ids.
- `validateMark` rejects a missing date, a future date, a negative or non-numeric score, a total ≤ 0 and a score above the total. A total without a score is not stored.
- `composeSource` reads a paper number only as `Paper 1–3` or `P1–P3`, so "P6" is never taken as a paper number.
- `Record mistakes` keeps the prefill until the user chooses Clear or starts another paper.
- Plan tool: the schedule fills weeks with the chosen papers oldest year first, then by rank. A re-plan places new pool papers in reserve only up to the pool size. Papers that leave the catalogue are kept and ranked last.
- `backup.mjs verify` skips a collection that an older manifest lacks when the snapshot has no documents for it.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: all logic tests passed. New cases cover the settings field and save shape, the Source label and composition, plan grid derivation, mark validation, forecast inputs and the simulation (spacing floor, determinism, slower at lower rate or amount, new questions, 52-week cap).
- `node operate/plan/plan.test.mjs`: passed (GEP matching, weeks, ranking, build, re-plan keeps done marks and only patches week/rank, read-back check).
- `SKIP_CHROME=1 node operate/capacity/shrink-legacy.test.mjs`: passed; `node --check operate/recover/backup.mjs`: passed.
- `node verify/fake-platform-smoke.js` (run as a regression only, not an acceptance verdict): 5 cases passed.
- Manual preview of the real page on a local fake platform with seeded plan and exercises:
  - Grid, panel, mark done, validation messages, Undo and Record mistakes prefill (subject forced to English; Source "2023 P6 Prelim Rosyth English Paper 1 Q5").
  - Stepper save (`questionsPerDay` stored only once set) and burndown.
  - Checked at desktop and 375 px, in light and dark mode.
- `./check.sh`: passed.
- Not covered:
  - Real platform `where('for', '==', …)` subscription and `update` on `schoolPapers`.
  - Real AI drafting with the prefill.
  - Production plan build (needs separate confirmation, Q17).
  - Runtime cost of the forecast on the full production library.

## Carry-forward

- CF-1 open — When SEAB publishes the PSLE 2027 timetable, update `plans/{userId}.psleDate` and re-check that the last planned week is the week before the written papers.
- CF-2 open — Confirm the GEP-centre school list against MOE before the first selection.
- CF-3 open — Measure Sophia's actual unmastered count, 30-day right rate and weekly recording rate from production and show the resulting forecast in acceptance.
- CF-4 open — Spot-check that each selected sgexam URL opens.
- CF-5 open — Count sgexam P6 prelims for 2022 and earlier per subject; report any pool shortfall.
- CF-6 open — Confirm against MOE that the 2021 Maths and 2023 Science primary syllabuses first reach P6 in 2026, and note which planned papers predate them.
- CF-7 open — Check that Settings stays responsive with the full production library (forecast simulation over every unmastered exercise for 52 weeks × 15 runs).

## Round notes

- 2026-11-25, `a92807e`: fixed `20261125-0050-integration-verify` #10. The assumed-rate forecast line read "at 80% (assumed: too few recent answers) right"; it now reads "at 80% right (assumed: too few recent answers), with about N new a week". `node impl/logic.test.js impl/arena.html` and `./check.sh` passed. Intervening commits since `a9c79d9` were `verify/` and `record/` only.
- 2026-11-25, `c61695d`: the real cause of #10. When today's exercises would not all be mastered within 52 weeks, the line gave no rate or recording figure, so an assumed rate was never stated. It now ends "(At 80% right (assumed: too few recent answers), with about N new a week.)". The `a92807e` wording fix stands for the dated line. Logic tests and `./check.sh` passed.
