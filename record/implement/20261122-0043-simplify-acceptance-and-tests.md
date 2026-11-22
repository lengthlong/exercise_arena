# Simplify acceptance catalog and simulated-runtime cases (0043)

> status: completed (2026-11-22)
> location: branch `develop`, commits `6a76a28..2d211c0`

## Upstream
<!-- upstream -->

- 0043 #1 implemented
- 0043 #2 implemented
- 0043 #3 implemented
- 0043 #4 implemented
- 0043 #5 no-implementation
- 0043 Q2 implemented
- 0043 Q3 no-implementation

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `verify/README.md` | Rewritten into the sole v0.46.0 tagged acceptance catalog (`Cost`, `Cadence`, `Default phase`), with 4 `on-touch` manual `OFFLINE` entries and preserved known-gaps section | 0013 2–5, 0012 1–2 |
| `verify/fake-platform-smoke.js` (`simulated-runtime`) | Consolidated from 25 cases (415 lines) to 14 single-page-safe cases (341 lines) with zero harness changes and zero dropped runtime assertions | 0001–0004, 0007–0010, 0013 4 |
| `operate/deploy/README.md` | Updated test-candidate supply for `on-touch` cadence and release steps for mandatory automated `pass` and `unverified` disclosure | 0013 3, 0012 1–2, 5 |
| `CLAUDE.md` | Collapsed two `verify/` rows into a single `verify/` directory pointer per v0.46.0 | 0011 1–5 |

## Implementation choices

- Exact single-page-safe case count is **14 cases** (341 lines, down from 25 cases / 415 lines): the 10 case groups listed in `0043` sum to `1+1+1+1+1+2+1+1+1+4 = 14` (`0043` prose summed them as 15).
- Added a small `handIn(pg)` helper in `verify/fake-platform-smoke.js` to deduplicate repeated "Hand in" / "Hand in anyway" confirmation clicks without changing the test harness (`pg.addInitScript` untouched).
- Preserved all three unique runtime assertions flagged during independent review: `draftLinkError` unchanged-legacy-edit exemption inside `set-material-edit-and-legacy-guards`, `S.db` boot-wiring check (`S.db !== window.__db && S.rawDb === window.__db && typeof S.db.collection('exercises').where === 'undefined'`) inside `registration-failure`, and `judgedBy === 'parent'` inside `paper-page-override-recalc-and-fault`.
- Left `impl/logic.test.js` (926 lines, 94 pure functions) and `impl/arena.html` completely untouched per `0043` Q3 and non-goals.

## Tests and checks

- `./check.sh`: exit 0 (`Checks passed`).
- `node impl/logic.test.js impl/arena.html`: exit 0 (`all logic tests passed`).
- `node --check verify/fake-platform-smoke.js`: exit 0 (syntax valid).
- `node verify/fake-platform-smoke.js --list`: exit 0 (lists all 14 cases with journey tags).
- **Outside local verification coverage:** `playwright` is not installed in this local Node environment, so the consolidated `verify/fake-platform-smoke.js` cases were not executed against headless Chromium here. They must pass a Playwright run (e.g. in the cloud container) before counting as passing acceptance evidence; if any consolidated case fails due to test code, repair it under `design-verify` Rule 3 or revert `2d211c0`.
