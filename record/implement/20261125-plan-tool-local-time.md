# Plan tool writes updatedAt in local time

> status: completed (2026-11-25)
> location: branch `develop`, commits `c2c2c74..a6d3af8`

## Upstream
<!-- upstream -->

- maintenance: first production plan build (0016, user confirmation "Yes, write it", 2026-11-25). It restores the `DATA.md` rule that times (时刻) are device-local `YYYY-MM-DDTHH:mm`; `operate/plan/plan.mjs` wrote UTC.

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0016 Build or re-plan a PSLE paper plan | Step 6 | `plans.updatedAt` is now local time; no page behaviour changes |

## Implementation choices

- The time is built from the `Date`'s local fields, the same way the page writes its times.

## Tests and checks

- `node operate/plan/plan.test.mjs` passed; `./check.sh` passed.
- The production document written before the fix already holds a local time: the generated file was corrected before the write.

## Round notes

- First production build, 2026-11-25:
  - 258 School papers and `plans/u_NXoYbNGfkKlQUeHFusW3KQ` were written in six confirmed batches, papers first and the plan last.
  - Every document read back matched what was written. `plan.mjs check` passed: 43 planned weeks (2026-11-23 … 2027-09-13), 129 scheduled, 129 reserve.
  - Implementation carry-forward items:
    - CF-2: the GEP list was confirmed on MOE's GEP overview page.
    - CF-4: all 129 scheduled links returned 200.
    - CF-5: sgexam has no 2014–2020 P6 prelims; the reserve is filled with 2021–2023 and 2013 prelims, with no shortfall.
    - CF-6: Maths 2021 and Science 2023 syllabuses apply to P6 from 2026; 96 of 129 scheduled papers are older.
    - CF-1 (the PSLE date) stays open.
  - The paper lists and read-back stay in the git-ignored `backups/plans/sophia-20261125/`.
