# Exercise Arena acceptance policy

Stable workspace acceptance policy only; exclusively owned by `design-verify`. Concrete entries, commands, tags and `verify/` self-checks live solely in [verify/README.md](./README.md). [0013](../journey/0013-accept-integrated-slice.md) owns slice acceptance; [deploy SPEC](../model/operate/deploy/SPEC.md) owns optional ad-hoc test targets and release rules; [ADR 0005](../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md) records the lightweight simulated-runtime trade-off. See `design-verify` for Feature Verify (`scope: feature`) versus Integration Verify (`scope: integration`) and `journey/` for success conditions.

## Journeys served

- [User index](../journey/USER.md): 0001–0010, including their success conditions and affected extensions.
- [Operator index](../journey/OPERATOR.md): 0011 aligned local evidence, 0013 acceptance, 0012 target release. 0014 backups and capacity repairs are verified by their own contracts ([recover](../model/operate/recover/SPEC.md), [capacity](../model/operate/capacity/SPEC.md)), not by slice acceptance.

## Environments and substitutes (prod-only default)

Exercise Arena is a fast-evolving personal app and **prod-only by default**: no separate `OFFLINE` test Artifact is maintained.

| Environment or dependency | How provided | Real or substitute |
|---|---|---|
| Implementation-stage checks (`./check.sh`, `node impl/logic.test.js impl/arena.html`) | Run locally during implementation (`< 1s` logic suite, zero external deps) | Precondition only, not acceptance evidence; the acceptance baseline's product tree (outside `record/` and `verify/`) must match a passing implementation record |
| Simulated runtime (`verify/fake-platform-smoke.js`) | Unmodified `impl/arena.html` in local headless Chrome over raw CDP against an in-memory `db`/`user` fake (zero npm deps) | Optional declared substitute for core page-side flows and fault handling against `DATA.md`; never proves real platform behavior |
| Production target (`ONLINE`) | Separately authorized release via [0012](../journey/0012-publish-artifact.md) | Live post-release spot-checks only; never an acceptance sandbox |

Real platform boundaries (identity/registration, real `db` queries/writes/deletes, photo uploads, AI recognition, runtime capabilities) stay `unverified` during local acceptance unless an explicitly authorized ad-hoc test Artifact is used, and are disclosed before `ONLINE` release.

## Tiered graders, cadence and verdicts

- **Catalog:** Concrete entries, commands, tags (`Journey / area`, `Cost: automated | agent | manual`, `Cadence: always | on-touch`, `Default phase: feature | integration | both`) and `verify/` self-checks live solely in [verify/README.md](./README.md).
- **Lightweight defaults:** Because this is a fast-moving solo-maintainer app, both `simulated-smoke` (`automated`) and `live-spot-check` (`manual`) default to `on-touch`. Users may widen, narrow or skip any entry on any run.
- **Tier order and verdicts:** Run selected `automated` entries first (fail fast) before any `agent` or `manual` entries. Mark unrun, simulated-only real boundaries, unavailable-browser and user-skipped entries `unverified` with the reason (never `pass`). Keep `record/verify/` `in-progress` **only** when any judgment is `fail`; zero `fail` marks `completed`. Passing `simulated-smoke` is **not** a mandatory pre-release blocker under [deploy SPEC](../model/operate/deploy/SPEC.md); all `unverified` boundaries are disclosed before `ONLINE` release.

## Oracle-integrity confirmation guard

- `design-verify` exclusively owns `verify/`. Adding cases from confirmed `journey/` success conditions, automating manual checks, or fixing `verify/` tool bugs proceeds directly in acceptance.
- Substantive policy edits to `verify/SPEC.md`, or weakening/deleting existing cases, assertions or catalog tags without a prior confirmed `journey/` change, require explicit user confirmation in acceptance (no bounce to discussion). Conflicts with `journey/` or `model/operate/deploy/SPEC.md` route to `design-discuss`.

## External writes and confirmation

- Any ad-hoc external test target requires separate user confirmation for the named test Artifact, synthetic `test: true` writes and cleanup; production is never an acceptance sandbox.
- `ONLINE` release requires separate authorization and a matching completed `scope: integration` record (zero `fail`) under [deploy SPEC](../model/operate/deploy/SPEC.md).
- Field logs, credentials and child content stay outside the repo.

## Changes without implementation records

- `verify/`-only commits are logged in `record/verify/` and covered by `baseline` rather than listed as unrecorded product changes.
- Mechanical toolkit upgrades and design-only write-offs touching no `impl/` or `operate/` runtime behavior carry no runtime acceptance scope.
- Backup and capacity-repair tools change no page behavior; their runs are verified by the [recover](../model/operate/recover/SPEC.md) and [capacity](../model/operate/capacity/SPEC.md) contracts and carry no slice acceptance scope.
- All other product commits outside `record/` and `verify/` require matching implementation records or explicit coverage in `record/verify/`.
