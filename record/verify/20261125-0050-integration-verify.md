# Integration verify after 0050 (prod-only baseline)

> status: in-progress (2026-11-25)
> location: branch `develop`
> scope: integration
> baseline: ca4daa7

## Upstream
<!-- upstream -->

- 20261125-0050-psle-plan-and-forecast

## Scope and size

- Mode: `integration` covering all unreleased work since release `96` (`1d48095`). The only unreleased implementation record is `20261125-0050-psle-plan-and-forecast`, and the product tree matches its end (`a9c79d9`). One pass covers both the feature and integration requirements.
- `verify/`-only commit `ca4daa7`:
  - adds `psle-paper-plan` (0015 steps 1–7, extensions 1a, 2a, 2b, 2c, 5a–5c, 6a; 0001 2b);
  - adds `questions-per-day-forecast` (0006 steps 1–3 and 6, extensions 1b, 6a, 6b, and Today not limited);
  - extends the catalog row and the served-journey list. 0016 is verified by the plan contract (`operate/plan/plan.test.mjs`, read-back `check`), not by slice acceptance.
  - Oracle sanity check: both new cases fail on the release 96 page (`1d48095:impl/arena.html`).
- Entries run:
  - `simulated-smoke` (`automated`): all 7 cases on `ca4daa7`. Six passed; `questions-per-day-forecast` failed one assertion (judgment 10).
  - `live-spot-check` (`manual`): not run (prod-only; needs an authorized publication).
- No `agent` entries are catalogued for these areas.

## Changes without implementation records

None.

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0015 1–2: PSLE sub-tab after Exam and Daily shows done of total, behind and weeks to PSLE, and a week × subject grid with this week marked; only the actor's papers | pass | `psle-paper-plan`: tab order `check,daily,psle`; "1 of 9 done · 2 behind · 2 weeks to PSLE"; three rows; done cell shows 71; behind cells marked; this-week row present; uB's paper absent |
| 2 | 0015 3–4: choosing a paper shows its full name and opens it on sgexam.com in a new tab | pass | Panel shows "2023 P6 Prelim · Henry Park Primary · Maths"; link `https://sgexam.com/x`, `target=_blank` |
| 3 | 0015 5–6: mark done with date and optional score; the grid shows it done and only the done mark is written | pass | After the save, `doneOn` is today, `score` 78, `total` 100; all other fields equal; cell `sp-done`; "2 of 9 done" |
| 4 | 0015 2b, 5a: an earlier-week paper stays and counts as behind; a paper can be done ahead of its week | pass | Behind cells shown for the previous week; next week's English marked done today, keeping its week |
| 5 | 0015 5b: Undo clears the mark and the score | pass | `doneOn`, `score`, `total` all null after Undo |
| 6 | 0015 5c, 6a: invalid date or score is rejected; a failed save says so and the paper is not shown as done | pass | Future date and 120/100 rejected with messages and no write; under an injected write failure the page shows "Saving failed…" and the paper stays not done |
| 7 | 0015 1a, 2a, 2c: no plan → "No plan yet"; failed read → "unavailable"; reserve folded | pass | Reload without plan shows "No plan yet" with three sub-tabs; plan read failure shows "plan is unavailable"; "Reserve: 1 paper" in a closed `details` |
| 8 | 0015 7 / 0001 2b: Record mistakes opens Record with the paper's subject and name as Source; AI paper and question numbers are added, never replacing the name | pass | Banner "Recording mistakes from 2023 P6 Prelim Rosyth English"; AI drafts said math/science, saved drafts are English; Sources "2023 P6 Prelim Rosyth English Paper 2 Q7" and "2023 P6 Prelim Rosyth English" |
| 9 | 0006 1, 1b, 2–3: Questions per day sits in Settings, shows the recent pace when unset, saves on change, and other saves never store the pace | pass | Empty field with placeholder 1 and "recent pace 1"; batch-size save stores no `questionsPerDay`; + saves 2; typed 20 saves 20 |
| 10 | 0006 6a: with too few recent answers the forecast says the right rate is assumed | fail | The line reads "…at 80% (assumed: too few recent answers) right with about 3 new a week": "right" is split from its rate, so the sentence is garbled. The assertion expects "80% right (assumed…". Product wording in `renderForecast` (`impl/arena.html`) → `design-implement` |
| 11 | 0006 6: the forecast shows one bar per week with the count of today's questions left and names the finish week | pass | "At 20 a day you'll master today's 12 in the week of … (N weeks)"; matching old/new bar pairs; first count 12, last 0 |
| 12 | 0006 6b: far too few a day → no date within a year | pass | 300 new exercises at 1 a day: "won't all be mastered within a year. Try more a day." |
| 13 | 0006 2: Questions per day never limits the Daily redo | pass | With Questions per day 1 and batch size 5, the Maths daily paper holds 5 questions |
| 14 | Regression 0001–0010 core flows | pass | The five existing `simulated-smoke` cases pass on `ca4daa7` |
| 15 | Real platform boundaries: `where('for', '==', …)` subscription, `update` on `schoolPapers`, AI drafting with the prefill, the forecast's speed on the full library | unverified | Prod-only; the simulated `db` and AI stub do not prove platform behaviour. `live-spot-check` needs an authorized publication |

## Substitutes and unverified boundaries

- Simulated runtime (`verify/fake-platform-smoke.js`) substitutes for `db`, user and AI; judgment 15 lists the real boundaries left unverified.
- No production plan exists yet; building it is a separate confirmed operation (0016), so the live grid has no real data to check.

## Carry-forward

- CF-1 open — PSLE 2027 date (from implementation record): not observable until SEAB publishes.
- CF-2 open — GEP-centre list confirmation: before the first plan build (0016).
- CF-3 open — Sophia's real forecast figures: needs a live spot-check after publication.
- CF-4 open — sgexam URL spot-check: part of the first plan build.
- CF-5 open — Pool shortfall for 2022 and earlier: part of the first plan build.
- CF-6 open — Syllabus first-P6 year: part of the first plan build.
- CF-7 open — Settings responsiveness on the full library: needs a live spot-check after publication.
