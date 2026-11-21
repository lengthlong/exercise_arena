# Paper page: acceptance entries for the feature verify gaps

> status: completed (2026-11-21)
> location: branch `develop`, commits `013794f..cc7dcb6`

## Upstream
<!-- upstream -->

- 20261121-paper-page-one-implementation
- 20261121-remove-paper-assessment-wrapper

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `verify/fake-platform-smoke.js` `paper-page-opens-from-every-row` | Added: real clicks on the Today Exam, Papers Exam and Papers Daily rows, and Back to each origin | 0003 1b, 0004 4 |
| `verify/fake-platform-smoke.js` `paper-page-detail-button-real-click` | Added: real Detail button, then the real Back button returns to the same card | 0004 4, 0009 1 |
| `verify/fake-platform-smoke.js` `paper-page-override-recalculates-outcome` | Added: coins, ladder and Games balance before and after an override; no attempt added | 0009 5, 0004 4 |
| `verify/fake-platform-smoke.js` `paper-page-override-write-fails` | Added: a failed override keeps the stored judgment, shows the error on the page, and a retry writes it | 0009 4a |
| `verify/fake-platform-smoke.js` `check-paper-with-deleted-question` | Added: deleted question named, score over the remaining questions, no judgment control on the deleted card | 0003 2, 2a |
| `verify/fake-platform-smoke.js` `legacy-handed-in-paper-reads-no-answer` | Added: legacy paper without a marker; objective question reads "No answer", written question reads "Not judged yet" | 0002 7c, 0004 4d |
| `verify/fake-platform-smoke.js` `daily-paper-written-answer-self-judge` | Added: daily written answer self-judged once, 6 coins, Override offered, tabs unlocked | 0002 6, 0003 5 |
| `verify/fake-platform-smoke.js` `paper-page-reopened-outcome-and-pending` | Changed: asserts the coin and ladder values; the Papers Daily assertion is renamed to what it checks (the row text) | 0002 7c, 0004 4 |
| `verify/README.md` | Changed: coverage table and the list of cases without a simulated case | 0002, 0003, 0004, 0009 |

## Implementation choices

- Expected coin and ladder values come from the ladder rules, not from page output: a right answer on a fresh exercise climbs to level 2 and earns 2 coins; a wrong or partial answer earns 1 coin once. Daily paper `DP1` is therefore 3 coins before an override and 2 after; the self-judged paper is 6 coins.
- The ladder values are read from the `aria-label` of the paper's ladder SVG ("1 climbed to level 2", "No climbs yet"); the balance is read from the Games tab's coin panel.
- The override-failure case injects a write fault only for `exercises/` documents with a non-retried code (`permission-denied`), so the retry wrapper does not mask it.
- The legacy case seeds a check paper with no `handedIn` key, so hand-in is inferred from the latest attempt, the established legacy rule.
- No page code changed; the page's sha256 is unchanged from the previous acceptance baseline.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: `all logic tests passed`
- `./check.sh`: exit 0 (GNU awk installed in this container)
- `node verify/fake-platform-smoke.js impl/arena.html`: 25 cases passed (simulated platform), 18 old plus the 7 new
- Mutation check of the new cases, on copies of the page kept outside the repo: no wording for a legacy objective question (fails the legacy case); row without its action (fails the row, Detail and deleted-question cases); coin line off by one (fails five cases); failure not shown on the page (fails the override-failure case); Detail button action renamed (fails the Detail case); deleted questions counted in the total (fails the deleted-question case); self-judgment saved as a check-paper attempt (fails the daily self-judge case); paper ladder climbs not counted (fails the two value cases)
- Not covered: the 375px layout of the outcome block, the photo and material toggles on the paper page, hand-in partial-write failures for a check paper, and every platform boundary (real db snapshot echo, latency)

## Round notes

- Addresses the entry gaps reported by acceptance record `20261121-0042-paper-page-feature` (an updatable acceptance record): judgments 3, 7, 11 and 12 and the caveat on judgment 9, plus the round note about the overstated Papers Daily assertion. No judgment there is `fail`, so no defect fix is involved. Not listed as upstream to keep the links acyclic; the acceptance record's re-run will cite this record.
