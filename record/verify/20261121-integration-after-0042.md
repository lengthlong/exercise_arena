# Integration verify of the Paper page candidate

> status: in-progress (2026-11-21)
> location: branch `develop`
> scope: integration
> baseline: 5f90fe2

## Upstream
<!-- upstream -->

- 20261120-0040-tiered-verify-entries
- 20261121-paper-page-one-implementation
- 20261121-remove-paper-assessment-wrapper
- 20261121-paper-page-acceptance-entries

## Scope and size

- Mode `integration`: the release candidate against the last release (production version 92, candidate `a67601d`). Candidate: `impl/arena.html` with sha256 `dc063d0f5e7f5f8991fcd05c4066f922eeece415e53eea59a9cb97544b886a9b`. The tree outside `record/` at `5f90fe2` is identical to `9585b19` and to `cc7dcb6`, the end commit of the last implementation record, whose registered tests passed.
- Implementation records since release 92: the four above. Those for 0039, the acceptance fixes, the retry wrapper, the read-failure presentation and the header note, and the record-chain cutover, are inside release 91 or 92 and are not sized in (round notes). The page changed only through the Paper page work since release 92 (its previous sha256 was `4032676d…`); `20261120-0040-tiered-verify-entries` changed entries and docs only.
- Entries run: the full simulated runtime, `node verify/fake-platform-smoke.js impl/arena.html`, 25 of 25 cases, on this baseline; and the authorized runtime on a separate private test Artifact, as far as one account and the database state allow (below). Registered checks re-run as a sanity step, not counted as judgments: `./check.sh` exit 0 and `node impl/logic.test.js impl/arena.html` passes.
- Authorized runtime environment: the test Artifact (version `1795272298-a691`, runtime contract 0.2.96, capabilities assets, db, sample with images, user with profile). Authorized by the user on 2026-11-21: publish the exact candidate to this test Artifact only, seed synthetic documents flagged `test: true` in one batch (6 documents: exercises `tst-ex-9` to `tst-ex-12`, papers `tst-paper-handed` and `tst-paper-old`), read its database afterwards. It also held last round's synthetic data. No cleanup was authorized and none was done; production was not touched. One registered account, so no second actor.
- The user walked through the page on the real platform and reported no on-screen observations, so real-platform judgments rest on database state only; anything that leaves no database trace is `unverified`.
- Candidate identity: the published body is the platform's wrapper plus `impl/arena.html` byte for byte, verified by reading the published file back.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `20333c0` | Toolkit upgrade to v0.44.0 and layout migration; touched only `operate/deploy/README.md` text outside records | Mechanical; no runtime scope |
| `c64b7c7` | Design write-off of 0040 (tiered acceptance); no `impl/`, `verify/` or `operate/` path touched | Design only |
| `a4210be` | Toolkit upgrade to v0.45.0; no `impl/`, `verify/` or `operate/` path touched | Mechanical; no runtime scope |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0010: a failed required read shows "Couldn't read your data" instead of loading forever; identity failure shows unavailable; registration failure warns; a write failing with `unavailable` is retried and other codes are not | pass | Simulated runtime: `read-failure-settings`, `read-failure-exercises`, `identity-failure`, `registration-failure`, `write-path-retries-only-unavailable` pass. Page side only; see row 16 for the real platform |
| 2 | 0001 and 0007: new questions join only a same-owner, same-subject set; legacy sets cannot be selected or edited; word-bank edits keep every answer and block invalidating ones; last-member cleanup deletes only on a complete membership read | pass | Simulated runtime: `set-link-validation`, `legacy-set-not-selectable-in-saved-material`, `material-edit-keeps-bank-and-blocks-legacy`, `set-cleanup-uses-complete-membership` pass. Page side only |
| 3 | 0008: a check paper previewed under one owner and created under another needs a fresh preview; a new paper starts with an empty marker map | pass | Simulated runtime: `check-paper-stale-preview-and-marker` passes |
| 4 | 0002 steps 1-5, 0003 step 4: a protected unfinished paper is recovered first, hand-in writes only the missing attempts and then the marker, a failed marker write is reported and retried, a deleted question is shown | pass | Simulated runtime: `daily-protected-recovery-and-handin`, `daily-marker-write-fails-then-recovers`, `daily-paper-with-deleted-question` pass. Page side only |
| 5 | 0002, 0003, 0004, 0009: the Paper page behaves the same for taking and reviewing, from every row, with outcome values, pending wording, Override and Detail then Back | pass | Simulated runtime: the ten Paper page cases and the old and new retention-adjacent cases pass; feature acceptance `20261121-0042-paper-page-feature` records judgments 1-12 as pass. Page side only; mastery after override is row 21 |
| 6 | 0002, 0004: only a daily paper handed in more than 30 days ago is deleted, its attempts survive, a failed delete is ignored | pass | Simulated runtime: `retention-prunes-only-old-handed-in-daily-papers`, `retention-failed-delete-is-ignored` pass. Page side only; the real delete is row 14 |
| 7 | 0010 / README step 1: the page loads on the platform with the actor's identity, database and owner scope, and own defaults effective | pass | Real platform, database state: every attempt, paper and write made during the walkthrough carries the actor's platform id (`u_p8Fts…`); `settings` is empty so defaults applied; the exercises, papers and sets the page wrote or deleted are in the actor's owner scope |
| 8 | 0010: the first visit registers the user in `users/<id>` | unverified | The actor's `users` document already existed (created 2026-11-20); nothing new was registered, so first registration was not exercised |
| 9 | 0002 steps 3-5 / README step 5: a new daily batch is created, answered and handed in; objective attempts are saved before the marker, the saved responses are cleared, the paper is kept | pass | Real platform, database state: paper `0sj41…` (daily, English, 4 questions) has the actor's marker at 22:58 and `responses: null`; its objective attempts on `tst-ex-1`, `tst-ex-2`, `tst-ex-12` are `daily`/`auto` and were written (14:58:02.9, 14:58:03.4, 14:58:03.8Z) before the paper's marker update (14:58:04.3Z) |
| 10 | 0003 steps 4-5: handing in an exam paper saves the objective attempts as `paper` attempts, then the marker; a written answer self-judged afterwards is saved once with its response | pass | Real platform, database state: paper `9qfbw…` marker at 22:57 (14:57:13.3Z) after the last objective attempt (`tst-ex-5`, 14:57:12.9Z); `tst-ex-1`, `tst-ex-2` and `tst-ex-5` have one `paper` attempt each (`tst-ex-5` unanswered, judged wrong); `tst-ex-3` has one `paper` attempt with `judgedBy: self` and the written response. Each question has exactly one attempt for this paper |
| 11 | 0009 steps 3-4, 0004 4c: Override changes only the actor's existing attempt, adds none and keeps other attempts | pass | Real platform, database state: `tst-ex-9` still has one attempt on `tst-paper-handed`, now `wrong` with `judgedBy: parent` (version 2); `tst-ex-10` on the same paper is untouched (version 1) |
| 12 | 0002 6b, 0004 4d, 0009 1b: re-opening a handed-in paper does not create an attempt for a written answer that has no saved judgment | pass | Real platform, database state: `tst-ex-11` (the unjudged written question on `tst-paper-handed`) has no attempts and is still at version 1 after the walkthrough |
| 13 | 0002 7c, 0004 4, 0009 5: the re-opened paper shows its score, coins and ladder with the unjudged question as "Not judged yet", and the card follows the stored judgment after a write (real snapshot echo) | unverified | No screen was reported. The database state is consistent with the expected recalculation but shows only what was stored, not what the page displayed or how fast the snapshot arrived |
| 14 | 0002, 0004 / README step 6: a daily paper handed in more than 30 days ago is deleted when the page opens and its attempts remain | unverified | Not shown. Paper `tst-paper-old` (created 2026-10-20, handed in 2026-10-20, owner and for the actor) is still present at version 1 after the walkthrough, while its attempt on `tst-ex-12` is intact. The record cannot tell whether the page was reloaded after the paper was seeded, or whether the delete ran and failed silently (the page ignores delete errors by design). If a reload after this record still leaves the paper, this becomes a `fail` for `design-implement` |
| 15 | 0007 / README step 3: removing the last member of an owned set deletes the set only on a complete membership read; a legacy set is kept | pass | Real platform, database state: `tst-ex-6`, `tst-ex-7` and `tst-ex-8` are gone from `exercises`; the owned set `tst-set-own` is gone from `sets` while `tst-set-legacy` remains. This also shows the real `where('setId')` membership query accepted and answered |
| 16 | 0010, 0002 5a: failure handling on the real platform: read, identity and registration failures; a hand-in interrupted by a failed write is recovered writing only the missing attempts and marker | unverified | No failure was injected and none can be on the real platform with this setup; the simulated runtime covers the page side (rows 1 and 4) |
| 17 | 0001: recording a synthetic photo uploads it, AI reads it, confirmed drafts are saved under the selected owner | unverified | Not run: no photo was recorded; no asset or new exercise from recording exists |
| 18 | 0006, 0010, 0004 1a, 0009 1a: switching the default owner reloads the lists for that owner; another actor's attempts cannot be overridden | unverified | One registered account and no second owner in the test database; `settings` is empty |
| 19 | 0007, 0008: word-bank edits and the stale check-paper preview on the real platform | unverified | Not run on the platform; simulated rows 2 and 3 pass |
| 20 | 0012 / README step 7: the declared runtime contract and capabilities match the page header, and the target is the intended one | unverified | The test Artifact is pinned to contract 0.2.96 (newest 0.2.98) with capabilities assets, db, sample with images, user with profile, the same set the page header declares; the page header says 0.2.90, the version the production Artifact ran at release 91. The production Artifact's stored contract was not examined in this round |
| 21 | 0009 5: after Override an exercise that reached or left mastered is recalculated | unverified | No exercise on a paper is at level 4 or mastered; carried over from feature acceptance row 13 |
| 22 | 0004 progress projections, 0005 match, 0006 settings | unverified | No simulated case and no walkthrough step; outside the changes since release 92 |
| 23 | 0013 / 0011: this record identifies the exact candidate that was tested | pass | Published body of version `1795272298-a691` equals the platform wrapper plus `impl/arena.html` (sha256 above), read back from the Artifact; capabilities carried forward unchanged |

## Substitutes and unverified boundaries

- Simulated runtime: the in-memory platform fake proves page behavior only (rows 1-6). It does not turn a platform condition into a pass.
- Database-state-only evidence: no on-screen observation was reported, so what the page displayed (rows 13, 14 partly) is unverified.
- Unverified platform boundaries: first registration (row 8), real snapshot echo and displayed outcomes (row 13), the real retention delete (row 14), real failure and partial-write recovery (row 16), photo upload and AI reading (row 17), second owner and actor switching (row 18), word-bank and stale-preview on the platform (row 19), the declared runtime contract against the production target (row 20), mastery after override (row 21), progress projections, match and settings (row 22).
- Compatibility gap carried from release 91: acceptance runs on contract 0.2.96; production ran 0.2.90.
- Test data stays in the test Artifact, including `tst-ex-9` now overridden to `wrong`, the exam and daily papers the walkthrough created, and the deleted `tst-ex-6` to `tst-ex-8`; cleanup needs its own authorization.

## Round notes

- Round 1. No judgment is `fail`; the record stays `in-progress` because the verdict is not accepted: required boundaries of the authorized runtime remain unverified (rows 8, 13, 14, 16-21), and row 14 may turn into a defect. This candidate does not support a release; the release is stopped, not waived.
- Scope correction: an earlier summary in the conversation said ten implementation records since release 92. The correct count is four (above). Records 0039, acceptance fixes, retry wrapper, read-failure presentation and header note, and the record-chain cutover are inside release 91 or 92.
- Next rounds update this record in place: reload the test page and re-read the database to settle row 14; add a second synthetic owner (new seed authorization) for row 18; record a synthetic photo for row 17; report on-screen observations of the re-opened paper for row 13; read the production Artifact's stored contract (read-only) for row 20.
