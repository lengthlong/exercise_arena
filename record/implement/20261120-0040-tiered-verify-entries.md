# Tiered verify entries (discussion 0040)

> status: completed (2026-11-20)
> location: branch `develop`, commits `c64b7c7..719b41b`

## Upstream
<!-- upstream -->

- 0040 #1 no-implementation Design applied in the write-off (acceptance contract).
- 0040 #2 no-implementation Design applied in the write-off (operator journey 0013).
- 0040 #3 no-implementation Design applied in the write-off (deploy contract).
- 0040 #4 no-implementation Design applied in the write-off (maintain contract); `operate/maintain/README.md` already states the awk prerequisite.
- 0040 #5 no-implementation Design applied in the write-off (ADR 0005).
- 0040 #6 implemented
- 0040 #7 no-implementation Option A leaves the frozen release record as written.

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `verify/fake-platform-smoke.js` | Changed: 15 cases on fresh pages tagged by journey, `--journeys` and `--list`; added cases for a failed hand-in marker with recovery, the 30-day retention boundary and a failed delete | 0001, 0002, 0004, 0007, 0008, 0010 |
| `verify/README.md` | Changed: tier table, journey-to-case map, journeys without a case, authorized-runtime walkthrough | 0011-0013 |
| `./check.sh` | Affected; see tests | None |
| `node impl/logic.test.js impl/arena.html` | Affected; unchanged page, passes | None |

## Implementation choices

- Each case runs on a fresh page from one shared seed, with case-specific seed changes, instead of one long sequential page. The old assertions are kept as case assertions; a failing case no longer stops the others.
- The fake's `update` failure takes an optional `match` path prefix so only the paper's hand-in marker write fails while attempt writes succeed.
- The fake's `delete` can be made to fail with `__failDelete`.
- Failure-presentation cases pass flags before page load; they ignore console errors, as the earlier script did for those pages (page errors still fail them).
- A case failing makes the process exit 1 and print the failed assertion labels; an unknown journey filter exits 2.
- Journeys 0003, 0005, 0006, 0009, the 0004 progress projections, multiple protected papers and owner switch before save have no case yet and are listed as such in the README, not covered silently.
- The SPEC sentence "each entry covers these classes" was corrected to "together cover" (mechanical wording fix of the write-off).

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: all logic tests passed
- `node verify/fake-platform-smoke.js impl/arena.html`: 15 of 15 cases passed (about 25 seconds). Two copies of the page with a deliberate defect each (30-day retention changed to 20; swallowing the hand-in error) made the retention and marker-failure cases fail, so the new cases detect those regressions; the copies are not kept.
- `./check.sh` exit status 1 with one error about the upstream line of the latest release record, which exists on `origin/develop` before this change (discussion 0040 Q6 option A: left as written). No other error.
- Outside coverage: no authorized-runtime run (no test Artifact was published or written to); the cases for the journeys listed above; real db behavior.
