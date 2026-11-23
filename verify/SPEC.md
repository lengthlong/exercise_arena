# Exercise Arena acceptance contract

Stable workspace acceptance policy only; concrete entries, commands and tags live solely in [verify/README.md](./README.md). [0013](../journey/0013-accept-integrated-slice.md) owns slice acceptance; [deploy SPEC](../model/operate/deploy/SPEC.md) supplies the `OFFLINE` test candidate when needed and defines release prerequisites; [ADR 0005](../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md) records the two-tier trade-off. See `design-verify` for Feature Verify (`scope: feature`) versus Integration Verify (`scope: integration`) and `journey/` for success conditions.

## Journeys served

- [User index](../journey/USER.md): 0001–0010, including their success conditions and affected extensions.
- [Operator index](../journey/OPERATOR.md): 0011 aligned local evidence, 0013 acceptance, 0012 target release. 0014 backups and capacity repairs are verified by their own contracts ([recover](../model/operate/recover/SPEC.md), [capacity](../model/operate/capacity/SPEC.md)), not by slice acceptance.
- Scope slices are owned by the initiating journey index, not duplicated here.

## Environments and substitutes

| Environment or dependency | How provided | Real or substitute |
|---|---|---|
| Implementation-stage checks (`./check.sh`, `node impl/logic.test.js impl/arena.html`) | Run locally during implementation | Precondition only, not acceptance evidence; the acceptance baseline's product tree (outside `record/` and `verify/`) must match an implementation record whose registered tests passed |
| Simulated runtime | Unmodified `impl/arena.html` in headless Chromium against an in-memory `db`/`user` fake with fault injection | Declared substitute for page-side DOM handlers, write sequences and injected failures against `DATA.md`; never proves real platform behavior |
| Authorized `OFFLINE` runtime | Candidate on an authorized `OFFLINE` test Artifact with its own database and synthetic `test: true` data, supplied via [deploy SPEC](../model/operate/deploy/SPEC.md) | Real platform for platform boundaries only (identity/registration, real db subscriptions/queries/deletes/partial writes, photo upload and AI recognition, runtime contract and capabilities); never proves production state |
| Production target (`ONLINE`) | Separately authorized release via [0012](../journey/0012-publish-artifact.md) | Live post-release checks only; never an acceptance sandbox |

Absent credentials, compatible runtime or authorized test data leaves the affected platform boundaries `unverified`, never `pass`.

## Phase and cadence policy

- **Catalog:** Concrete entries, commands and tags (`Journey / area`, `Cost: automated | manual`, `Cadence: always | on-touch`, `Default phase: feature | integration | both`) live solely in [verify/README.md](./README.md). Both `design-implement` and `design-verify` may maintain `verify/` within this contract and `journey/`.
- **Defaults:**
  - `Cost: automated` defaults to `always` on `scope: integration` (full suite) and the affected journey subset on `scope: feature`.
  - `Cost: manual` defaults to `on-touch` on `scope: integration` (only for platform boundaries touched since the last release) and is skipped on `scope: feature`.
  - Explicit per-entry `Cadence` in `verify/README.md` overrides the `Cost` default.
- **User direction and verdicts:** Users may widen, narrow or skip entries on any run. Mark unrun, simulated-only real boundaries, stale evidence and user-skipped entries `unverified` with the reason (never `pass`). Keep `record/verify/` `in-progress` **only** when any judgment is `fail`; zero `fail` marks `completed`. Passing automated simulated-runtime judgments are a mandatory release prerequisite under [deploy SPEC](../model/operate/deploy/SPEC.md); remaining `unverified` platform boundaries are disclosed to the user before `ONLINE` release.

## Sizing by change

All 8 logical components live inside single-file `impl/arena.html` ([components](../model/arch/arena/COMPONENT.md)), so `on-touch` manual boundaries are sized by touched component or platform capability rather than by file path alone:

| Touched component or capability in `impl/arena.html` | Affected journeys | Simulated runtime (`automated`) | Authorized `OFFLINE` manual group (`on-touch`) |
|---|---|---|---|
| `Session/settings` (`boot()`, identity/registration, owner-scoped subscriptions) | 0006, 0010 | Affected journeys (`feature`) / full (`integration`) | Identity, registration & owner scope |
| `Platform/data gateway` or `db` write/delete/membership-query paths in `Papers`, `Exercise library`, or `Record` | 0001–0004, 0007–0009 | Affected journeys (`feature`) / full (`integration`) | Real db writes, membership cleanup & retention |
| `Record` `assets` / `sample` paths | 0001 | Affected journeys (`feature`) / full (`integration`) | Photo upload & AI recognition |
| Source header runtime contract / capability declaration or target contract pin | 0010, 0012 | Affected journeys (`feature`) / full (`integration`) | Runtime contract & capabilities |
| Pure UI, layout, or derived projections (`Page UI/state`, `Progress`, `Games`) reusing unchanged write/query paths | Affected user journeys | Affected journeys (`feature`) / full (`integration`) | None (manual groups untouched) |

Do not mark deferred concurrent integrity or unsaved written-answer recovery as `pass`.

## External writes and confirmation

- Each authorized `OFFLINE` runtime run requires separate user confirmation for the named test Artifact, synthetic `test: true` data/asset writes and cleanup; production is never implicitly authorized.
- `ONLINE` release requires separate authorization and matching integration acceptance under [deploy SPEC](../model/operate/deploy/SPEC.md).
- Field logs, credentials and child content stay outside the repo; `record/verify/` retains only non-sensitive candidate identity, scope, judgments and disclosed unverified boundaries.

## Changes without implementation records

- `verify/`-only commits are logged in `record/verify/` and covered by `baseline` rather than listed as unrecorded product changes.
- Mechanical toolkit upgrades and design-only write-offs touching no `impl/` or `operate/` runtime behavior carry no runtime acceptance scope.
- Backup and capacity-repair tools change no page behavior; their runs are verified by the [recover](../model/operate/recover/SPEC.md) and [capacity](../model/operate/capacity/SPEC.md) contracts and carry no slice acceptance scope.
- All other product commits outside `record/` and `verify/` require matching implementation records or explicit coverage in `record/verify/`.
