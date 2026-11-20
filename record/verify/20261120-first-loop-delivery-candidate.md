# First usable loop on the delivery candidate

> status: completed (2026-11-20)
> location: branch `develop`
> baseline: 2d6b44f

## Upstream
<!-- upstream -->

- 20261120-record-chain-cutover
- 20261120-0039-paper-recovery-set-ownership
- 20261120-first-loop-acceptance-fixes
- 20261120-read-failure-presentation
- 20261120-port-retry-wrapper
- 20261120-header-note-live-merge

## Scope and size

- Pre-delivery acceptance of the candidate `impl/arena.html` at `1ba9837` (sha256 `581b082994a0266419c82f1d14215f936ca7a552303803f20f87de09c22890a2`). The tree outside `record/` at baseline `2d6b44f` is identical to `1ba9837`. This record supersedes `20261120-first-loop-retry-candidate`, whose candidate differed only by a page-header comment.
- Environment: the private test Artifact at version `1795161503-b451`, whose published body is byte-identical to the candidate. Its database holds the synthetic `test: true` data from the earlier seeding. No walk-through of this candidate was made, by the user's decision.
- Entries run on this baseline: `./check.sh`, `node impl/logic.test.js impl/arena.html`, `node verify/fake-platform-smoke.js impl/arena.html`.
- Compared with the tree that had real-platform observations (`a0422fb`), the candidate adds the ported write-retry wrapper (`S.rawDb` for reads) and a header comment. Those earlier observations are stale for this candidate and are not carried over as passes.
- Sizing basis: the entries paired with the changed steps in the implementation records, plus the slice's steps. The user chose to skip the runtime walk-through and waive the unverified cases before delivery.
- History: no rewritten history.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `e2e5626`, `f987efe` | Workspace refine and 0039 design write-off; no change under `impl/` | Covered by the local consistency entry |
| `7ed370b`, `379078d`, `4eebc5b`, `a0422fb`, `f27385d`, `d353922`, `e91cc64`, `2d6b44f` | Record files only | Exempt |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | Local consistency: workspace structure, links and managed hash | pass | `./check.sh` exit 0 on `2d6b44f` |
| 2 | Pure-logic regression for the declared helper coverage, including the retry helpers | pass | `node impl/logic.test.js impl/arena.html` exit 0, "all logic tests passed"; helpers only |
| 3 | operator/0003 success: the record identifies the exact candidate that was tested | pass | Test Artifact version `1795161503-b451` body equals `impl/arena.html` (sha256 above) |
| 4 | user/0010 success: identity, database and owner scope are ready on the platform, own defaults effective | unverified | Not run on this candidate. The previous candidate was observed ready (registration write, owner scope used by later writes), but every write now goes through the retry wrapper |
| 5 | user/0010: failed required reads and identity or registration failures are presented as unavailable, not as loading or empty | unverified | Substitute only: the fake-platform smoke injects them and passes |
| 6 | Write path: a write failing with `unavailable` is retried up to twice and shown immediately for any other code; reads and listeners are not wrapped | unverified | Substitutes only: logic tests (count, delay window, only the `unavailable` code, writes only) and the smoke through the page's own `S.db`. The real platform's `unavailable` behavior was not exercised |
| 7 | user/0001 success: confirmed writes belong to the selected owner and start the ladder; new set references obey same-owner membership; unsuccessful drafts stay distinguishable | unverified | No recording on the real platform (AI and photos not exercised); link validation covered by logic tests and smoke |
| 8 | user/0001 extension 2a: a legacy set cannot be selected for supplementation | unverified | Smoke asserts it; not observed on the real page |
| 9 | user/0002 success: no due or protected submissions remain, every started batch handed in and fully assessed, a partial day reported as such | unverified | Not run on this candidate |
| 10 | user/0002 steps 2 and 5, extension 5a: recovering a protected paper and handing in saves the marker, keeps the paper and leaves the saved attempt unwritten twice | unverified | Observed on the previous candidate only (paper `tst-paper-prot` at version 2 with the marker and `responses` null; `tst-ex-5` unchanged). Not re-run with the wrapper |
| 11 | user/0002 steps 1 and 2b: protected submissions listed with nothing due; missing questions shown | unverified | Smoke only |
| 12 | user/0002 extensions 5a and 6a: write failures stop at the failed write and retry only missing writes | unverified | No failure injected on the platform |
| 13 | Changed boundary: new Exam and Daily papers start with an explicit empty marker map; a modern paper with a saved attempt and failed marker is recovered; legacy absent-map papers keep inference | unverified | Exam creation with an empty map was observed on the previous candidate only; Daily creation and marker-failure restart not run |
| 14 | user/0008 success: an acknowledged check paper holds the confirmed available references from the selected library | unverified | Observed on the previous candidate (paper `9qfbw9zqqjjdi2nk5vdv`); not re-run |
| 15 | Changed boundary: partial attempt writes, multiple protected papers, untouched-draft replacement, the all-written zero-attempt limit | unverified | Not run |
| 16 | Changed boundary: paper assessment wording for pending written judgments; an empty paper is not mastery evidence | unverified | Not run on the platform |
| 17 | Changed boundary: owner switch with a retained set draft or check preview requires validation or re-preview | unverified | Substitutes only |
| 18 | Changed boundary: last-member cleanup, word-bank edits and the real `where('setId')` membership query | unverified | Nothing deleted or edited on the platform; query support still unknown |
| 19 | Changed boundary: legacy-set cases and compatible unchanged references | unverified | Not run |
| 20 | Changed boundary: actor differs from owner, own-only judgment correction, match eligibility | unverified | One registered account; no matches or settings |

## Substitutes and unverified boundaries

- Substitutes: the fake in-memory platform smoke and VM-extracted helper tests; they prove only their declared boundary.
- No condition failed. Three judgments pass (local checks and candidate identity); all runtime conditions are unverified for this candidate.
- Differences from the live production page, reviewed before delivery: the live "resume an interrupted hand-in" feature is replaced by the 0039 protected-paper recovery; the live rule that a daily paper without `handedIn` counts as not handed in is not carried over (this candidate and `DATA.md` infer a hand-in from saved attempts). The effect on existing production data was not examined; only unsubmitted daily papers with saved attempts and no `handedIn` field would be classified differently.
- Verdict: not accepted on evidence, because required runtime coverage is incomplete. The user explicitly waived the unverified cases and authorized delivery on 2026-11-20 ("Skip the check, write the acceptance record and publish to production"). That waiver is a user decision recorded here and in the delivery record, not a pass.
