# Shared paper plan, per-user marks, New per week and a faster forecast (0051)

> status: completed (2026-11-25)
> location: branch `claude/dazzling-keller-aovz33`, commits `1e40ced..955d73c`

## Upstream
<!-- upstream -->

- 0051 #1 implemented
- 0051 #2 implemented
- 0051 #3 implemented
- 0051 #4 no-implementation
- 0051 #5 no-implementation
- 0051 #6 implemented
- 0051 #7 implemented
- 0051 #8 implemented
- 0051 #9 implemented
- 0051 #10 implemented
- 0051 #11 implemented
- 0051 #12 no-implementation

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0015 Follow my PSLE paper plan (S14, C11) | Steps 1–7; extensions 1a, 2a, 2d (new), 5b, 6a, 6b | Shared plan via `plans` (followed plan rule), papers by `plan`, marks in `paperMarks/<paper>-<actor>` (Undo writes nulls), "Mine · <owner>" read-only switch, "Marks unavailable" on a marks read failure; legacy `for` documents never shown |
| 0006 Configure my practice (S11, C7, C9) | Steps 2, 3, 6; extensions 1c (new), 3a | New per week stepper (0–100, saved); − / + redraw the forecast at once from local state, one write 600 ms after the last tap, flush on leaving Settings, revert on failure; finish line "with N new a week" / "about N" when unset |
| 0016 Build or re-plan a PSLE paper plan (plan contract) | Steps 2–7; extensions 1b, 1c (new), 6b | `operate/plan/plan.mjs`: `--plan` ids, re-plan keeps past weeks, `check` compares Paper marks, new `migrate` (shared batches, marks batches, delete batches) and `check-migration` |
| 0014 Back up the production library (recover contract) | Step 2 | `paperMarks` added to `operate/recover/backup.mjs` collections |

## Implementation choices

- Legacy per-user plan documents are recognized by an id equal to a registered user id, and the page does not follow them, so `plans/<Sophia>` and `plans/psle-2027` can coexist during migration. Ties on `psleDate` are broken by id.
- Paper marks whose `paper`, `by` and document id disagree are ignored (`marksFor`).
- The stepper write delay is 600 ms. Stepper taps re-render only the stepper rows (inside a `display: contents` wrapper) and `#fc-box`. A typed change in either number box saves at once, together with any pending stepper value.
- `simulateFinish` uses a binary min-heap keyed by (due day, id) and keeps counters instead of rescanning. `impl/logic.test.js` checks it week by week against a copy of the 0050 algorithm on four input sets, one of them at 100 new a week.
- `migrate` puts the deletes in their own batch file (`batches-migrate-delete.json`) so they can only be applied on a separate confirmation. `--marks-only` copies only marks that are missing or differ.

## Tests and checks

- `./check.sh`: passed.
- `node impl/logic.test.js impl/arena.html`: passed (new cases cover `newPerWeek` reading and saving, `followedPlan`, `marksFor`, per-user `planView`, and heap/naive equivalence).
- `node operate/plan/plan.test.mjs`: passed (shared ids, re-plan keeps past weeks, Paper-mark check, migrate, second-pass marks, check-migration).
- `node --check operate/recover/backup.mjs`: passed.
- Implementation-stage browser check, not acceptance evidence: a scratch copy of `verify/fake-platform-smoke.js` re-seeded with the new shape passed 0015 and 0006, including the owner switch, the delayed single write and the paper-mark write failure. Its fake `set` was given the same fault injection that `update` already has. In-page `stepSetting` took 11–35 ms with 300 unmastered exercises (container Chromium).
- The registered `verify/` smoke now fails `psle-paper-plan` and `questions-per-day-forecast`. Both cases seed the 0050 per-user shape and expect a write on every tap, and the fake db's `set` has no fault injection. These cases belong to acceptance (`design-verify`) and must be updated from journeys 0015, 0006 and 0016.
- Not covered: the real platform's `where('plan', …)` and `where('by', …)` queries over new collections, measurement on Sophia's device (CF-1), and production migration (CF-2).

## Carry-forward

- CF-1 open — Measure forecast redraw time on Sophia's device with her production backlog (target about 100 ms from tap to redrawn chart; the number itself changes at once).
- CF-2 open — Before migration, count production School papers with `doneOn` set (likely zero: the plan was built on 2026-11-25) and report them with the migration rows.
