# First usable loop on the test Artifact

> status: completed (2026-11-20)
> location: branch `develop`
> baseline: a0422fb

## Upstream
<!-- upstream -->

- 20261120-record-chain-cutover
- 20261120-0039-paper-recovery-set-ownership
- 20261120-first-loop-acceptance-fixes
- 20261120-read-failure-presentation

## Scope and size

- Retest of the first usable loop (user/0010 access, user/0001 recording, user/0002 daily redo) plus the changed-boundary cases of the acceptance contract and the check-paper creation path (user/0008). It supersedes the earlier acceptance record `20261120-first-loop-after-0039` (in this record, local fixes #4, #8 and #11 are re-judged below).
- Candidate: `impl/arena.html` at `a0422fb`, sha256 `684b42c6ba40a611421e691890f35bdadfbe639fecec0839212f96b45fdf6df6`. The tree outside `record/` is identical to the last fix commit `f73fd7f`. The test Artifact's published body (version `1795160022-1347`, never republished) is byte-identical to that file.
- Environment: a separate private test Artifact with its own database (capabilities db, assets, sample with images, user with profile). Data is synthetic and flagged `test: true`: 11 documents seeded in one batch with the user's authorization (8 exercises, 2 sets, 1 protected daily paper). Production was not touched. Only one account registered, so no second actor.
- Entries run: `./check.sh`, `node impl/logic.test.js impl/arena.html`, `node verify/fake-platform-smoke.js impl/arena.html`, and a user walk-through of the test Artifact. The user reported no on-screen observations, so the walk-through is evidenced only by the resulting database state, read with `ArtifactData` after the walk-through. Anything that leaves no trace in the database is unverified.
- Sizing basis: the entries paired with the changed steps in the four implementation records, plus the slice's steps. The user may widen it.
- History: no rewritten history.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `e2e5626` | Workspace refine; no change under `impl/` | Covered by the local consistency entry |
| `f987efe` | Design write-off of 0039; no change under `impl/` | Same |
| `7ed370b`, `a0422fb`, `4eebc5b`, `f27385d` | Record files only | Exempt |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | Local consistency: workspace structure, links and managed hash | pass | `./check.sh` exit 0 on `a0422fb` |
| 2 | Pure-logic regression for the declared helper coverage | pass | `node impl/logic.test.js impl/arena.html` exit 0, "all logic tests passed"; helpers only |
| 3 | user/0010 success: identity, database and owner scope are ready on the platform, and own defaults are effective | pass | Real platform. `users/u_p8Fts…` was created by the page at 07:33:48Z (identity resolved and registration written). `settings` is empty, so defaults applied, and later writes carry that id as owner: paper `9qfbw9zqqjjdi2nk5vdv` has owner and `madeBy` equal to it and references the seeded exercises from the subscribed scope |
| 4 | user/0010: a failed required read shows "Couldn't read your data" instead of loading forever; identity failure shows unavailable; registration failure warns | unverified | Substitute only: the fake-platform smoke injects read, identity and registration failures and passes. No failure was injected on the real platform and no screen was reported |
| 5 | user/0001 success: each confirmed write belongs to the selected owner, appears in the library and starts the ladder due the next day | unverified | No recording was done: no exercise or set was added, and AI and photo recording were not exercised |
| 6 | user/0001 success: new set references obey same-owner membership | unverified | No recording attempted. Link validation is covered only by the logic tests and the smoke |
| 7 | user/0001 success: unsuccessful drafts stay distinguishable from recorded content | unverified | Not run |
| 8 | user/0001 extension 2a (earlier defect #8): a legacy set cannot be selected for supplementation and its reason is shown | unverified | No screen was reported and no recording followed. Substitute: the smoke asserts it and fails on the pre-fix page. The earlier failed judgment is not re-observed on the real page |
| 9 | user/0002 success: no due or protected submissions remain, every started batch is handed in and fully assessed, and a partial day is reported as such | unverified | Only the protected paper was handed in. `tst-ex-1` to `tst-ex-4` still have no attempts (version 1) and no new daily batch exists |
| 10 | user/0002 steps 2 and 5, extension 5a: recovering the protected paper and handing in saves the actor's marker, keeps the paper, and leaves the saved attempt unwritten twice | pass | Real platform. Paper `tst-paper-prot` is still present at version 2 (updated 07:37:59Z) with `handedIn` for the actor and `responses` null. `tst-ex-5` is still at version 1 with exactly one attempt for that paper. The paper was not replaced although a batch could have superseded it. Caveat: its only other question was deleted, so no missing attempt had to be written; retrying missing writes is not exercised |
| 11 | user/0002 step 1 and extension 1a: protected submissions are listed even when nothing is due | unverified | The seed still had due questions and no screen was reported |
| 12 | user/0002 extension 2b (earlier defect #11): a protected paper with deleted questions shows the missing content | unverified | Seeded with `tst-ex-gone`, but no screen was reported. Substitute: the smoke asserts the note and fails on the pre-fix page |
| 13 | user/0002 extensions 5a and 6a: write failures stop at the failed write, report partial effects and retry only missing writes | unverified | No failure was injected |
| 14 | Changed boundary: a newly created Exam paper starts with an explicit empty marker map | pass | Real platform. Paper `9qfbw9zqqjjdi2nk5vdv` (no `kind`, so an Exam paper) was created at 07:40:01Z with `handedIn` of `{}` |
| 15 | Changed boundary: a new Daily paper starts with an empty marker map; a modern paper with a saved attempt and failed marker is recovered after nothing is due; absent-map legacy papers keep inference | unverified | No new Daily batch was started and no marker failure occurred. Logic assertions and the smoke cover the helpers on a fake db |
| 16 | Changed boundary: partial attempt writes, multiple protected papers, untouched-draft replacement, the all-written zero-attempt limit | unverified | Not run on the platform |
| 17 | Changed boundary: a handed-in paper with pending written judgments keeps them in the denominator; an empty paper is not mastery evidence | unverified | The only paper handed in has no written question; the on-screen wording was not reported |
| 18 | Changed boundary: an existing-set draft retained across an owner switch is rejected at save | unverified | One account only and no recording |
| 19 | Changed boundary: a check preview made under one owner then created under another requires re-preview | unverified | The refusal path was not run. Substitute: the smoke sets the stale state directly |
| 20 | user/0008 success: an acknowledged check paper holds the confirmed available references from the selected library | pass | Real platform. Paper `9qfbw9zqqjjdi2nk5vdv`: owner is the selected owner, subject English, requested count 10, `exerciseIds` are exactly the seven English exercises of the library (`tst-ex-1`, `-2`, `-3`, `-6`, `-7`, `-8`, `-5`), with the Math exercise excluded. The preview text and any insufficient-pool message were not observed |
| 21 | Changed boundary: last-member cleanup deletes only for a valid owner and proven empty membership, otherwise retains, using the real membership query | unverified | Nothing was deleted: `tst-ex-7`, `tst-ex-8` and both sets are still at version 1. Whether the platform accepts the `where('setId')` query is still unknown |
| 22 | Changed boundary: word-bank edits keep every member answer, reject invalidating edits and never overwrite unchanged fields | unverified | Both sets unchanged (version 1) |
| 23 | Changed boundary: legacy-set cases stay readable and warned; compatible unchanged references allow Exercise and attempt writes | unverified | No attempt or edit on `tst-ex-8` (version 1); no warning screen reported |
| 24 | Changed boundary: actor differs from owner, own-only judgment correction, match eligibility needing supporting snapshots | unverified | One registered account; `matches` and `settings` are empty |
| 25 | operator/0003 success: the record identifies the exact candidate that was tested | pass | Published body of version `1795160022-1347` equals `impl/arena.html` at `a0422fb` (sha256 above); version not republished |

## Substitutes and unverified boundaries

- Substitutes: the fake in-memory platform smoke and VM-extracted helper tests. They prove only the declared boundary and never turn a real-platform condition into a pass.
- Real-platform evidence in this record comes from database state only: the registration write, the marker write on the recovered paper, the Exam paper creation, and the seeded data left untouched. No screen text was reported, so every UI-only condition is unverified.
- Still unverified: all recording (AI and photos), write-failure handling, new daily batches and the unproven membership query, set cleanup and bank edits, the legacy-set warnings, the stale-preview refusal, retention, matches, the second-actor cases, and concurrent writes. The published production target and rollback were not examined.
- No condition failed in this run. The earlier failed judgments #8 and #11 and the observation #4 are corrected locally and covered by the smoke; the real page has not been observed with them.
- Test data stays in the test Artifact; removing it needs its own authorization.
- Verdict: the slice is not accepted, because required changed-boundary coverage is incomplete. Delivery stays blocked. Four judgments pass on the real platform, none fail, and the rest are unverified.
