# Paper page: feature acceptance on the simulated runtime

> status: completed (2026-11-21)
> location: branch `develop`
> scope: feature
> baseline: 6635502

## Upstream
<!-- upstream -->

- 20261121-paper-page-one-implementation
- 20261121-remove-paper-assessment-wrapper

## Scope and size

- Mode `feature`. Slice: discussion 0042 (one Paper page for taking and reviewing a paper), journey steps 0002 4-7 and 7c, 0003 1b/2/4-6, 0004 4 and 4d, 0009 1/3-5 and 1b. The candidate is `impl/arena.html` with sha256 `dc063d0f5e7f5f8991fcd05c4066f922eeece415e53eea59a9cb97544b886a9b`. It is not a release candidate: the commits since release 92 that belong to other implementation records (0039 handoff, retry wrapper, read-failure presentation, header note, tiered verify entries) are not selected here, so a separate integration pass must cover them before any release.
- Baseline check: the tree outside `record/` at `6635502` is identical to `33e032c`, the end commit of the last implementation record (`20261121-remove-paper-assessment-wrapper`), whose registered tests passed.
- Entries run: `node verify/fake-platform-smoke.js impl/arena.html`, all 18 cases, exit 0. The cases carrying 0002, 0003, 0004 or 0009 are the sizing basis (the three Paper page cases, the three daily hand-in and recovery cases, the two retention cases); the rest ran as regression on the same page. Sizing basis is the paired entries of the two implementation records plus the affected journey steps above.
- Environment: simulated runtime only (headless Chromium in the cloud container, in-memory platform fake). No test Artifact was published, so the authorized runtime did not run; it is required only for a release candidate (`model/verify/SPEC.md`).
- Registered checks re-run as a sanity step, not counted as judgments: `node impl/logic.test.js impl/arena.html` prints `all logic tests passed`; `./check.sh` exits 0 (GNU awk installed in this session, since the default mawk cannot compile the link scan).
- History: the baseline contains one merge (`ce60355`, remote work merged into the local Paper page work) and no rewritten history. The discussion was renumbered from 0040 to 0042 before that merge. The remote branches `main` and `claude/awesome-bohr-ur3hj4` are not part of the baseline and were not verified.
- Suite limits that bear on the judgments: the suite's `click` helper dispatches the action on a temporary button, so the real row and Detail button wiring is not exercised; and the assertions on the outcome block test for the presence of coins and the ladder SVG, not their values.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `a4210be` | Toolkit upgrade v0.44.0 to v0.45.0 (skills, checker, record layout); no runtime change | Mechanical upgrade; covered by the `./check.sh` sanity run, no runtime scope |
| `e155792` | Design write-off of 0042 (journeys, model, verify SPEC and README text); design only | No runtime scope; its coverage row in `model/verify/SPEC.md` is what the judgments below apply |
| `ce60355` | Merge of remote work; its range is in the first implementation record | Covered by the baseline identity check and judgment 8 |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0002 7c, 0004 4: a re-opened handed-in daily paper shows its score, coins, the before/after ladder and the count still to judge on the same Paper page | pass | `paper-page-reopened-outcome-and-pending`: the page shows `1/3`, a coin line, `.run-ladder svg` and "Handed in, not fully assessed: 1 to judge". The coin amount and ladder rungs are not asserted at the DOM level, so their values are judged only by the logic tests (not acceptance evidence) |
| 2 | 0002 6b/7c, 0004 4d, 0009 1b: a written answer with no saved judgment reads "Not judged yet", not "No answer"; it offers no self-mark control and creates no attempt when the paper is re-opened in a new session | pass | Same case, third card: "Not judged yet" present, "No answer to this question" absent, `.selfmark` absent, `exercises.e5.attempts.length === 0` in the fake db |
| 3 | 0003 1b, 0004 4: a handed-in paper opens as the same Paper page from every row (Today Exam row, Papers Exam row, Papers Daily row) | unverified | No case clicks a real row. Cases open the page with a synthetic `open-paper` action, and the "from the Papers Daily list" assertion reads only that list row's score text, not an opened page. The three rows share one `paperRow` renderer in the source, but sharing is not observed behavior |
| 4 | 0003 4-6: a check paper locks the tabs while answering, hand-in saves the objective attempt as a paper attempt and the marker, and review shows the ladder with no coins line and the pending written answer counted | pass | `check-paper-hand-in-self-judge-and-review`: tabs disabled while taking and while the written answer is pending; `e2` attempt with `paperId: CP1, mode: paper` and `handedIn.uS` in the fake db; `.run-ladder svg` present, `coin` absent, "1 to judge" |
| 5 | 0003 5/6, 0009 4: self-judging a written answer on a check paper saves exactly one attempt, the card then offers Override at once, and the paper reads "Fully assessed" with the tabs free again | pass | Same case: one `CP1` attempt on `e5` with `judgedBy: self`, `select.ov-sel` present, "Fully assessed", tabs enabled |
| 6 | 0009 3-4, 0003 6a: Override on a judged card changes only that existing own attempt without adding one, and the page score follows | pass | `paper-page-override-and-detail-back`: `e1` keeps one attempt, `result` becomes `wrong`, `judgedBy: parent`, the page score goes from `1/3` to `0/3` |
| 7 | 0009 5, 0004 4: after Override the ladder, mastery, coins and balance shown on the page are recalculated, and a failed override write leaves the prior judgment standing and is shown on the page | unverified | The case asserts only the score. The ladder, coin and balance values after an override, and an override write failure, have no case (the implementation record states failed writes are shown at the bottom of the page; not observed here) |
| 8 | 0002 2/5, 0003 4a: the unified page still recovers a protected daily paper, writes only the missing attempts and then the marker, reports a failed marker write on the page, and offers a retry that writes only the marker | pass | `daily-protected-recovery-and-handin`, `daily-marker-write-fails-then-recovers`, `daily-paper-with-deleted-question`: recovery note, one attempt per question, marker written, `S.run.err` set on failure, Today still lists the paper "2/2 saved", retry adds only the marker, the deleted question is shown |
| 9 | 0004 4 (Detail), 0009 1: Detail on a card opens the exercise with a way back, and Back returns to the same card of the paper page | pass | `paper-page-override-and-detail-back`: "Back to the paper" shown on the exercise, then `S.run.idx === 1` and "Handed in" on return. Reached by synthetic `goto-ex` and `back-list` actions; the real Detail button wiring is unverified (see boundaries) |
| 10 | 0004 4a, 0004 5: retention removes only a daily paper handed in more than 30 days ago, attempts survive, a failed delete is ignored, and nothing is changed by returning to the overview | pass | The two retention cases: `OLD31` deleted, `EDGE30`, `NEW29`, unhanded, other-actor and check papers kept, attempts on `OLD31` survive, a failed delete keeps the paper and the page |
| 11 | 0003 2/2a: a check paper shows its missing references on the Paper page and scores only the remaining exercises; 0002 7c legacy `none` wording ("no answer") applies only to a legacy paper with no attempt for an existing question after hand-in | unverified | No case for either: the deleted-question case covers a daily paper in recovery only, and no case seeds a legacy handed-in paper |
| 12 | 0002 6, 0003 5: a written answer on a daily paper is self-judged on the Paper page and saved once | unverified | The daily hand-in cases contain no written answer; self-judgment is exercised only on the check paper (judgment 5) |

## Substitutes and unverified boundaries

- Simulated platform only. Real snapshot echo of in-session judgments (the card shows a read-only result chip until the stored attempt arrives), db latency, subscription behavior and partial-write recovery on the real db are `unverified`; they need the authorized runtime of a release candidate.
- Real row and Detail button wiring (judgments 3 and 9), and the lock-and-leave behavior through the real tab buttons while a written answer is pending, are not covered by a case that uses real clicks.
- Values of coins and ladder rungs shown on the page, after hand-in and after override, are asserted for presence only (judgments 1 and 7).
- The 375px phone layout of the outcome block, the photo and material toggles on the page, and hand-in partial-write failures for a check paper have no case.
- Journeys 0005, 0006 and the progress projections of 0004 have no simulated case and were not part of this slice.
- Not a release candidate: unselected implementation records since release 92 need an integration pass, and the authorized runtime has not run.

## Round notes

- Gaps for `design-implement`: add real-click cases for the three row entries and the Detail button (judgment 3, 9); assert coin and ladder values and the failed-override path (judgment 7); add a daily-paper written-answer self-judgment case, a check paper with a deleted question, and a legacy handed-in paper (judgments 11, 12). The label of the "from the Papers Daily list opens the same page" assertion overstates what it checks. No defect in the page was found, and no design gap.
