# Integration verify of owner-scoped balance (0044)

> status: completed (2026-11-22)
> location: branch `develop`
> scope: integration
> baseline: d23b7b2

## Upstream
<!-- upstream -->

- 20261122-0044-balance-owner-scope

## Scope and size

- Mode `integration`: the slice is the balance bug fix after release 93 (candidate `f887655`). Implementation record `20261122-0043-simplify-acceptance-and-tests` is covered by the completed integration record `20261122-0043-integration-verify`; this record covers `20261122-0044-balance-owner-scope`. Journey steps: 0004 3/3c, 0005 1/1a/3, 0006 4/5b, plus a full regression of the shared page.
- Baseline product-tree match: `impl/arena.html` at `d23b7b2` (sha256 `3273347b85695bf9887af0082c52f07617a06671a0f2748db3db5348ed9e979b`) is the tree of the last implementation record's end `3c09ead`, `d23b7b2` differing only under `record/`.
- Entries run: `simulated-runtime` (`Cost: automated`, `Cadence: always`): all **15 of 15** cases in headless Chromium through Playwright, including the new `games-balance-follows-owner-scope`, which was added by the `verify/`-only commit `3c09ead` in this round and which fails on `impl/arena.html` at `418bf99` at the balance-not-negative assertion. `offline-identity-owner` (`Cost: manual`, extended in this round to cover the owner-scoped balance): skipped at the user's direction ("no need to do 'manual check' before release", 2026-11-22), recorded `unverified`. `offline-db-writes-cleanup-retention`, `offline-photo-ai`, `offline-runtime-contract`: not triggered (their components in `impl/arena.html` are unchanged since release 93).
- Registered implementation checks re-run as a precondition (not judgments): `./check.sh` exit 0, `node impl/logic.test.js impl/arena.html` exit 0.
- History: linear on `develop` since `418bf99`, plus a merge `b73570e` of the remote `develop` into the local work; no rewritten ancestry.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `551c2b9`, `b73570e`, `966f195` | Product and design commits for 0044 and its merge with upstream `418bf99` | Covered by `20261122-0044-balance-owner-scope` (range `418bf99..3c09ead`) |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0006 4/5b, 0004 3/3c: after switching Default owner through Settings, Games shows only the selected library's coins and spending, so balance is never negative because of the switch, and switching back restores the first library's figures | pass | Simulated runtime: `games-balance-follows-owner-scope` passed: 12 balance (14 earned, 2 used) in the first library, 0/0/0 in the second with one stored-owner and one legacy match present, 12/14/2 again after switching back. Page side only |
| 2 | 0005 1/1a/3: starting a match saves the opener's Default owner as the match's library | pass | Simulated runtime: same case; after real `game-start` a new match document has `owner: uS` and players `uS`, `uB`. Page side only |
| 3 | 0001–0004, 0007–0010: shared page behavior is unchanged | pass | Simulated runtime: the other 14 cases passed (daily recovery, written self-judgment, check paper, Paper page, Override, retention, set cleanup and legacy guards, stale preview, read/identity/registration failure) |
| 4 | 0006 4/5b, 0004 3c (`offline-identity-owner`): real platform owner switch, including another-device change, and balance on the real db | unverified | Skipped by user direction ("no need to do 'manual check' before release", 2026-11-22); no authorized `OFFLINE` test Artifact run |
| 5 | 0002–0004, 0007, 0009 (`offline-db-writes-cleanup-retention`); 0001 (`offline-photo-ai`); 0010, 0012 (`offline-runtime-contract`) | unverified | `on-touch` cadence: Platform/data gateway, `Record` assets/sample and source-header contract untouched since release 93 |
| 6 | 0005 4b/4c: result-persistence failure and simultaneous-device overspending; 0004 other progress projections | unverified | No automated case in `verify/README.md` (known gaps); not part of this change |

## Substitutes and unverified boundaries

- Simulated runtime (`verify/fake-platform-smoke.js`) is a declared substitute: unmodified `impl/arena.html` against an in-memory `db`/`user` fake. It proves page-side behavior for judgments 1–3, not real platform semantics.
- Judgment 4 is user-skipped: the stored `owner` on real match documents, real settings snapshots and other-device owner changes are not observed on the platform. Judgments 5 and 6 are untouched or uncovered boundaries disclosed for release.

## Round notes

- Round 1: all judgments recorded in one pass; zero `fail`. The new case was checked for effectiveness by running it against the page at `418bf99`, where it fails.
