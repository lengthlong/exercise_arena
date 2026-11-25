# Integration verify after 0051 (prod-only baseline)

> status: completed (2026-11-25)
> location: branch `claude/dazzling-keller-aovz33`
> scope: integration
> baseline: 3f2281f

## Upstream
<!-- upstream -->

- 20261125-0051-shared-plan-and-forecast-speed
- 20261125-plan-tool-local-time

## Scope and size

- Mode: `integration` covering all unreleased work since release `97` (`c2c2c74`). The product tree matches the end of `20261125-0051-shared-plan-and-forecast-speed` (`955d73c`). `20261125-plan-tool-local-time` changes only `operate/plan/` (no page behaviour). That tool, and the 0051 `migrate` / `check-migration` commands, are verified by the plan contract (`operate/plan/plan.test.mjs`, read-back checks), not by slice acceptance (`verify/SPEC.md` Journeys served). One pass covers both feature and integration requirements.
- `verify/`-only commit `3f2281f`, derived from the confirmed 0051 changes to journeys 0015 and 0006:
  - `psle-paper-plan`:
    - the seed now uses the shared shape (`plans/psle-2027`, papers with `plan`, `paperMarks`), plus a legacy per-user plan and paper;
    - assertions adapted to Paper marks;
    - new checks: another user's mark is not counted, the done write touches only the actor's mark, 2d owner switch read-only, 2a marks read failure.
  - `questions-per-day-forecast`:
    - new checks: 1c New per week placeholder; step 3 instant redraw and one delayed write for both steppers; 3a revert on failure; flush on leaving Settings.
    - "+ saves 2" now asserts the save after the delay instead of at once (0006 step 3 as changed by 0051).
  - Tool fixes: the fake `db` `set()` gets the same fault injection as `update()`; Chrome gets `--no-sandbox` when run as root.
  - No existing assertion was dropped without a confirmed journey change. The former "another user's paper is not shown" became "a legacy per-user paper is not shown", because 0015 now has one shared plan.
  - Oracle sanity check: both updated cases fail on the release 97 page (`a29e8a5:impl/arena.html`).
- Entries run:
  - `simulated-smoke` (`automated`): all 7 cases on `3f2281f`; all passed. An earlier draft of the new 3a check injected `unavailable`, which the page retries by design, so the test waited. Before the baseline commit it was changed to the non-retryable `permission-denied`. This was a test defect, not a product one.
  - `live-spot-check` (`manual`): not run (prod-only; needs an authorized publication).
- No `agent` entries are catalogued for these areas.

## Changes without implementation records

None.

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0015 1–2: the PSLE sub-tab shows done of total, behind and weeks to PSLE from the user's own marks, and the shared week × subject grid at this week | pass | Tab order `check,daily,psle`; "1 of 9 done · 2 behind · 2 weeks to PSLE"; three rows; uS's done cell shows 71; this-week row present |
| 2 | 0015 success: one shared plan, each user's own history; another user's mark is not the actor's | pass | uB's mark on `pe1` leaves `pe1` behind for uS |
| 3 | 0016 / DATA migration window: legacy per-user papers (with `for`, no `plan`) and the legacy plan are not shown | pass | Seed includes `plans/uS` and a `for`-only paper; the grid follows `psle-2027` and the legacy paper is absent |
| 4 | 0015 3–4: choosing a paper shows its full name and opens it on sgexam.com in a new tab | pass | Panel "2023 P6 Prelim · Henry Park Primary · Maths"; link `https://sgexam.com/x`, `target=_blank` |
| 5 | 0015 5–6: Mark done writes only the actor's Paper mark; the shared paper and other users' marks are unchanged; the grid shows it done | pass | `paperMarks/pm2-uS` = {paper pm2, by uS, today, 78, 100}; `schoolPapers/pm2` has no mark fields; `pe1-uB` unchanged; exactly 3 marks; cell `sp-done`; "2 of 9 done" |
| 6 | 0015 2b, 5a: an earlier-week paper stays behind; a paper can be done ahead of its week | pass | Previous week's cells behind; `pe3-uS` done today with `pe3` still in next week |
| 7 | 0015 5b: Undo clears date and score | pass | `pe3-uS` has `doneOn`, `score`, `total` all null |
| 8 | 0015 5c, 6a: an invalid date or score is rejected; a failed save says so and the paper is not done | pass | Future date and 120/100 rejected with no write; injected `paperMarks/` write failure shows "Saving failed…" and the cell stays not done |
| 9 | 0015 2d: when the Default owner is someone else, a "Mine · <owner>" switch opens on Mine and shows the owner's marks read-only | pass | With Default owner uB: two switch tabs, "1 of 9 done" (Mine); owner view says read-only, shows uB's `pe1` done and not uS's `pm1`; its panel has no Mark done, Undo or Record mistakes |
| 10 | 0015 1a, 2a, 2c: no plan → "No plan yet"; a failed plan read → plan unavailable; a failed marks read → marks unavailable, never nothing done; reserve folded | pass | Each message seen on its seed; no "0 of 9 done" under a marks read failure; "Reserve: 1 paper" in a closed `details` |
| 11 | 0015 7 / 0001 2b: Record mistakes opens Record with the paper's subject and name as Source | pass | Banner "Recording mistakes from 2023 P6 Prelim Rosyth English"; drafts English; Sources "… Paper 2 Q7" and the bare label |
| 12 | 0006 1, 1b: Questions per day unset shows the recent pace; other saves never store it | pass | Empty field, placeholder 1, "recent pace 1"; batch-size save stores no `questionsPerDay` |
| 13 | 0006 1c: New per week unset shows the recent recording rate, used by the forecast and never stored | pass | Empty field, placeholder 3, "with about 3 new a week"; no `newPerWeek` stored |
| 14 | 0006 2–3: a − / + tap shows the number and redraws the forecast at once; one write of both values follows shortly after the last tap | pass | + shows 2 and "At 2 a day" before any write; New per week 3 → 5 shows "with 5 new a week" before any write; after the delay `questionsPerDay` 2 and `newPerWeek` 5 are stored and "Saved" shows |
| 15 | 0006 3a: a failed write reports unsaved and returns the steppers to the stored values | pass | Injected settings write failure: "Saving failed…"; steppers back to 2 and 5; stored values unchanged |
| 16 | 0006 3 (C9): leaving Settings right after a tap still saves it | pass | − then Today tab at once: `newPerWeek` 4 stored |
| 17 | 0006 6, 6a: the forecast names the finish week with the right rate and the New per week amount, and shows weekly bars | pass | "At 20 a day you'll master today's 12 in the week of … (N weeks), at 80% right (assumed: too few recent answers), with 3 new a week"; matching bar pairs, first 12, last 0 |
| 18 | 0006 6b: far too few a day → no date within a year | pass | 300 new exercises at 1 a day: "won't all be mastered within a year. Try more a day." |
| 19 | 0006 2: Questions per day never limits the Daily redo | pass | With Questions per day 1 and batch size 5, the Maths daily paper holds 5 questions |
| 20 | Regression 0001–0010 core flows | pass | The five other `simulated-smoke` cases pass on `3f2281f` |
| 21 | Real platform boundaries: `plans` collection read, `where('plan', …)` and `where('by', …)` subscriptions, `set` on new `paperMarks` documents, forecast speed on Sophia's device (CF-1) | unverified | Prod-only; the simulated `db` does not prove platform behaviour. `live-spot-check` needs an authorized publication |

## Substitutes and unverified boundaries

- Simulated runtime (`verify/fake-platform-smoke.js`) substitutes for `db`, user and AI; judgment 21 lists the real boundaries left unverified.
- Production still holds only the legacy per-user plan. Until migration steps 2–3 (plan contract) write the shared plan, a release of this page would show "No plan yet". The release must follow those steps (0051 Q2m order).

## Carry-forward

- CF-1 open — Forecast redraw time on Sophia's device with her production backlog (from implementation record); only measurable live. Simulated in-page time was 11–35 ms with 300 unmastered exercises.
- CF-2 open — Count production School papers with `doneOn` set before migration (from implementation record); belongs to the plan contract's migrate step 1.
