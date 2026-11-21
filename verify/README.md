# Acceptance entries

Contract: [model/verify/SPEC.md](../model/verify/SPEC.md) (tiers, verdict rule, boundary classes) and [ADR 0005](../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md). Acceptance is run by the verify stage and recorded under `record/verify/`; running an entry while debugging is not a verdict.

## Evidence tiers at a glance

| Tier | Entry | When |
|---|---|---|
| Implementation-stage checks | `./check.sh`, `node impl/logic.test.js impl/arena.html` (see [maintain tools](../operate/maintain/README.md)) | Run by implementation; acceptance only checks the baseline matches a record where they passed |
| Simulated runtime | `node verify/fake-platform-smoke.js impl/arena.html [--journeys 0002,0008]` | Every slice, selected by affected journeys; a release candidate runs all |
| Authorized runtime | The walkthrough below on an `OFFLINE` test Artifact | Once per release candidate |

## Simulated runtime

Runs the unmodified page in headless Chromium against an in-memory db/user fake with fault injection. Needs `playwright` and Chromium (preinstalled in the cloud container). Each case opens a fresh page from the same seed; about 25 seconds for all cases. `--list` prints the cases with their journeys; `--journeys` takes a comma-separated list of journey IDs and runs every case that carries one. Exit code 0 means every selected case passed.

| Journey | Cases | Boundary classes covered |
|---|---|---|
| 0001 Record | `set-link-validation`, `legacy-set-not-selectable-in-saved-material` | Set ownership (new links, legacy restrictions) |
| 0002 Daily redo | `daily-protected-recovery-and-handin`, `daily-marker-write-fails-then-recovers`, `daily-paper-with-deleted-question`, `daily-paper-written-answer-self-judge`, `paper-page-reopened-outcome-and-pending`, `legacy-handed-in-paper-reads-no-answer`, retention cases | Submission protection (marker failure and recovery, deleted question); daily written-answer self-judgment with coin value; legacy paper wording; retention boundary |
| 0003 Take check | `check-paper-hand-in-self-judge-and-review`, `check-paper-with-deleted-question`, `paper-page-opens-from-every-row` | Check paper hand-in writes, ladder without coins, pending written answer, self-judgment, tab lock; deleted question scored over the rest; opening from the Today and Papers rows by real clicks, Back to the origin |
| 0004 Progress | the two retention cases, `paper-page-reopened-outcome-and-pending`, `paper-page-override-and-detail-back`, `paper-page-opens-from-every-row`, `paper-page-detail-button-real-click`, `paper-page-override-recalculates-outcome`, `legacy-handed-in-paper-reads-no-answer` | Exact 30-day boundary, attempt survival, failed delete; paper page outcome block (coin and ladder values) and pending wording; real row and Detail clicks |
| 0009 Override | `paper-page-override-and-detail-back`, `check-paper-hand-in-self-judge-and-review`, `paper-page-override-recalculates-outcome`, `paper-page-override-write-fails`, `paper-page-detail-button-real-click` | Own-attempt override on the paper page, recalculated coins, ladder and balance, failed write leaves the stored judgment and shows the error, Detail then Back to the same card |
| 0007 Library | `set-cleanup-uses-complete-membership`, `set-link-validation`, `material-edit-keeps-bank-and-blocks-legacy`, `legacy-set-not-selectable-in-saved-material` | Set ownership and membership; word bank |
| 0008 Prepare check | `check-paper-stale-preview-and-marker` | Stale preview; new-paper marker map |
| 0010 Open arena | `write-path-retries-only-unavailable`, `read-failure-settings`, `read-failure-exercises`, `identity-failure`, `registration-failure` | Failure presentation, write retry |

**No simulated case yet** for 0005 (match), 0006 (settings), the progress projections of 0004, multiple protected papers, and owner switch before save. The older paper page cases open pages through the suite's synthetic action clicks; `paper-page-opens-from-every-row` and `paper-page-detail-button-real-click` use real clicks on the rows, the Back buttons and the Detail button. The 375px layout of the outcome block, the photo and material toggles on the paper page, and partial-write failures during check-paper hand-in have no case. A slice that changes these steps cannot be accepted on them; the record marks them `unverified` until a case exists.

A pass proves page behavior only against the fake's `DATA.md` assumptions. It does not prove the platform boundaries listed in the contract.

## Authorized runtime walkthrough (once per release candidate)

Prerequisites: an authorized `OFFLINE` test Artifact loaded with the exact candidate (compare the candidate's sha256 with the published body), declared capabilities (db, assets, sample with images, user with profile), synthetic test data flagged `test: true` written with named authorization, and permission to read the test database afterwards. Use a synthetic worksheet photo, never a child's. Without these, the steps are `unverified`; never use production as the sandbox. Judge each from the resulting database state when no on-screen observation is reported.

| # | Step | Platform boundary |
|---|---|---|
| 1 | Open the candidate; Today loads and `users/<id>` exists | Identity and first registration (0010) |
| 2 | Change the default owner to a second seeded owner and back; lists follow the owner | Real subscription semantics (0006, 0010) |
| 3 | Delete the last member of an owned set, then of a legacy set; the owned set is removed, the legacy set kept | Real membership read (0007) |
| 4 | Record one synthetic worksheet photo; confirm and save; an asset and the drafts' exercises exist | Upload and AI recognition (0001) |
| 5 | Hand in a protected daily paper; attempts and the marker appear in the database | Real partial-write path (0002, 0003) |
| 6 | Open with a seeded daily paper handed in more than 30 days ago; it is deleted and its attempts remain | Real delete (0002, 0004) |
| 7 | Compare the declared runtime contract and capabilities with the page header | Runtime contract |

Test publication, db and asset writes and cleanup each need named authorization through the [deploy tools](../operate/deploy/README.md); cleanup is never a global purge.
