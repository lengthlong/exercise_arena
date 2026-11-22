# Acceptance entries

Contract: [model/verify/SPEC.md](../model/verify/SPEC.md) (policy, substitutes, `on-touch` component sizing, external-write confirmations) and [ADR 0005](../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md). This file is the sole catalog of concrete acceptance entries, commands and tags; both `design-implement` and `design-verify` may maintain `verify/` within the settled contract. Acceptance is recorded under `record/verify/`; running an entry while debugging is not a verdict.

Implementation-stage precondition (not acceptance evidence): `./check.sh` and `node impl/logic.test.js impl/arena.html` (see [maintain tools](../operate/maintain/README.md)) must pass on the matched implementation record's product tree.

## Entry catalog

| Entry | Journey / area | Cost | Cadence | Default phase | Command / instructions |
|---|---|---|---|---|---|
| `simulated-runtime` | 0001–0004, 0007–0010 (page DOM, write sequences & injected faults) | `automated` | `always` | `both` | `node verify/fake-platform-smoke.js impl/arena.html [--journeys 0002,0008]` (`--list` prints live cases and journeys; `feature` runs affected journeys, `integration` runs all; mandatory `pass` before `ONLINE` release) |
| `offline-identity-owner` | 0006, 0010 (identity, first registration & owner-scoped subscriptions) | `manual` | `on-touch` | `integration` | Authorized `OFFLINE` test Artifact walkthrough: (1) open candidate, verify Today loads and `users/<id>` exists; (2) switch default owner to a second seeded owner and back, verify lists follow the owner |
| `offline-db-writes-cleanup-retention` | 0002–0004, 0007, 0009 (real db writes, membership cleanup & retention delete) | `manual` | `on-touch` | `integration` | Authorized `OFFLINE` test Artifact walkthrough: (1) delete last member of an owned set and a legacy set (owned removed, legacy kept); (2) hand in a protected daily paper (attempts and marker written); (3) open with a seeded daily paper handed in >30 days ago (paper deleted, attempts remain) |
| `offline-photo-ai` | 0001 (photo upload & AI recognition) | `manual` | `on-touch` | `integration` | Authorized `OFFLINE` test Artifact walkthrough: record one synthetic worksheet photo (never a child's), confirm and save; verify asset and saved exercises exist |
| `offline-runtime-contract` | 0010, 0012 (declared runtime contract & capabilities) | `manual` | `on-touch` | `integration` | Authorized `OFFLINE` test Artifact / target read-only check: compare declared runtime contract and capabilities (`db`, `assets`, `sample` with images, `user` with profile) against the page header |

Tags: `Cost` = `automated` or `manual`; `Cadence` = `always` or `on-touch` (overrides `Cost` default); `Default phase` = `feature`, `integration` or `both`. Users may widen, narrow or skip any entry on any run; unrun or skipped entries are recorded `unverified` with the reason, and only `fail` keeps `record/verify/` `in-progress`.

## Simulated runtime notes

`verify/fake-platform-smoke.js` runs the unmodified `impl/arena.html` in headless Chromium against an in-memory `db`/`user` fake with fault injection (requires `playwright` and Chromium). Exit code 0 means every selected case passed. A pass proves page behavior only against the fake's `DATA.md` assumptions, never real platform semantics. Run `node verify/fake-platform-smoke.js --list` to inspect the current case list.

## Authorized `OFFLINE` runtime prerequisites

Before running any `manual` `on-touch` entry above, confirm through [deploy tools](../operate/deploy/README.md): an authorized `OFFLINE` test Artifact loaded with the exact candidate (verify sha256 against the published body), declared capabilities (`db`, `assets`, `sample` with images, `user` with profile), synthetic test data flagged `test: true` written with named authorization, and permission to read the test database afterwards. Without these, mark the affected manual entries `unverified`; never use production as an acceptance sandbox. Cleanup needs separate authorization and is never a global purge.

## Known gaps (no automated case yet)

- Journeys `0005` (match) and `0006` (settings), and the progress projections of `0004`.
- Multiple protected unfinished daily papers and owner switch before saving drafts.
- 375px narrow layout of the Paper page outcome block, photo/material toggles on the Paper page, mastery recalculation after an override, and partial-write failures during check-paper hand-in.

When a slice touches these areas without adding an automated case, record them `unverified` in `record/verify/`.
