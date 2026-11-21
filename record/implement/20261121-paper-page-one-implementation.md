# Paper page: one implementation

> status: completed (2026-11-21)
> location: branch `develop`, commits `a4210be..ce60355`

## Upstream
<!-- upstream -->

- 0042 Q1 implemented
- 0042 Q2 implemented
- 0042 Q3 implemented
- 0042 Q4 implemented
- 0042 Q5 implemented
- 0042 Q6 implemented
- 0042 Q7 implemented
- 0042 Q8 implemented

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `verify/fake-platform-smoke.js` three Paper page cases | Added; run on the simulated platform only | 0002 4-7 and 7c, 0003 1b/2/6, 0004 4 and 4d, 0009 1/4 and 1b |
| `node impl/logic.test.js impl/arena.html` | Changed: removed `tally`, `paperAttempts`, `paperProgress`, `runMarks`, `sheetMarks` cases; added rows, assessment, live overlay, ladder and marks cases | 0002 6-7, 0003 6, 0004 4 |

## Implementation choices

- The Paper page keeps the name `S.run` for its single view state; the sheet's `S.paperView`, `S.paperIdx`, `S.paperOpenSets` and `S.paperOpenPhotos` are gone.
- Tabs lock only while the page holds something that leaving would lose: answering, saving, a just-handed-in paper not yet saved, or a written answer still pending in this session. A re-opened page leaves freely through the tabs.
- Snapshot re-render is blocked only in the answering phase; in review the page re-renders on snapshots so outcome blocks follow acknowledged writes.
- A card judged in this session but not yet echoed by the snapshot shows a read-only result chip; the Override select appears when the stored attempt arrives.
- A pending written answer whose response is not in the session reads "Not judged yet. Its written answer was not kept, so it can't be judged here."
- Detail from a card stores the whole page state and restores it on Back (`S.pageBack`), keeping the card index and in-session results.
- Failed writes from the page, including overrides, are shown at the bottom of the paper page while it is open (`failed`).
- Question numbers on the pager are rows including deleted questions in both phases, so numbers no longer shift at hand-in.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: `all logic tests passed`
- `./check.sh`: exit 0 (needed gawk in this container; the default mawk panics in the link scanner on the untouched baseline)
- `node verify/fake-platform-smoke.js impl/arena.html`: 18 cases passed, including the three new Paper page cases (simulated platform; not an authorized-runtime result)
- Merged with `origin/develop` before pushing; its protected-recovery, detail-ladder climber and missing-reference note are kept inside the unified page (see discussion 0042 merge note).
- Not covered: real platform db subscriptions and latency, hand-in partial-write failure paths on the page, the 375px layout of the outcome block beyond one screenshot, Today recovery entry
