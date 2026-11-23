# Integration verify after 0045/0046 (prod-only baseline)

> status: completed (2026-11-23)
> location: branch `develop`
> scope: integration
> baseline: ecace39

## Upstream
<!-- upstream -->

- 20261122-0045-shrink-legacy-photos-tool
- 20261123-0046-simplify-deploy-runbook

## Scope and size

- Mode: `integration` covering all accumulated work since release `94` (`7d34d81`) on candidate `ecace39`. `git diff --stat 7d34d81..ecace39 -- impl/` is empty (`impl/arena.html` is byte-identical to release `94`); the product tree matches `20261123-0046-simplify-deploy-runbook` (`134012c`).
- Standalone `verify/`-only commit `ecace39` (aligned `verify/SPEC.md` and `verify/README.md` to `v0.48.0` prod-only policy and replaced the 15-case Playwright smoke script with 4 zero-dependency local Chrome CDP cases) is covered by `baseline: ecace39`.
- Entries run:
  - `simulated-smoke` (`automated`, `on-touch`, `both`): widened to run all 4 core cases (`node verify/fake-platform-smoke.js impl/arena.html`) on committed `ecace39` to verify the rewritten CDP smoke suite against `impl/arena.html` (`4/4` passed in 36.2s).
  - `live-spot-check` (`manual`, `on-touch`, `integration`): not run (prod-only default; no `impl/arena.html` or platform boundaries changed since release `94`).

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `91cb20d` | `DATA.md` 1-line note recording the completed one-time `matches.owner` backfill; no runtime change | Exempt per `verify/SPEC.md` (design-only write-off) |
| `6692327` | Initial local backup tool (`backups/backup.mjs`, `backups/README.md`); no page behavior change | Exempt per `verify/SPEC.md` (backup tool verified by `model/operate/recover/SPEC.md`) |
| `66df996` | Design write-off of `0045` (originally `0044`, renumbered in `062d09e`); no page behavior change | Taken over by `20261122-0045-shrink-legacy-photos-tool` and exempt per `verify/SPEC.md` |
| `cb72168` | Mechanical toolkit upgrade `v0.46.0 → v0.48.0`, `model/verify/SPEC.md → verify/SPEC.md`, `backups/{backup.mjs,README.md} → operate/recover/` | Exempt per `verify/SPEC.md` (mechanical toolkit upgrade + backup tool path move; no page behavior change) |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | `0010` Open arena cleanly into Today (wrapping `S.db` with `retryingDb`) and show an explicit error when required settings read fails | pass | `simulated-smoke` `boot-and-read-failure` passed on `ecace39` against local Chrome CDP fake |
| 2 | `0002`, `0009` Recover protected unfinished daily paper, survive marker-write failure and retry without duplicating attempts, then self-judge written answer to Fully assessed with coins | pass | `simulated-smoke` `daily-paper-flow` passed on `ecace39` against local Chrome CDP fake |
| 3 | `0003`, `0004`, `0008`, `0009` Refuse stale cross-owner check preview, initialize new check paper with `handedIn: {}`, self-judge without coins, and override a judgment (`judgedBy: 'parent'`) with write-failure preservation | pass | `simulated-smoke` `check-paper-and-override` passed on `ecace39` against local Chrome CDP fake |
| 4 | `0001`, `0005`, `0006`, `0007` Remove owned set and retain legacy set on last-member deletion, persist Default owner switch, isolate Games balance by owner scope (never negative), and store opener `owner` on new match | pass | `simulated-smoke` `library-and-owner-scope` passed on `ecace39` against local Chrome CDP fake |
| 5 | `0001`–`0010`, `0012` Real platform boundaries (identity, real `db` queries/writes/deletes, photo uploads, AI recognition, live runtime capabilities) | unverified | Prod-only workspace; no `impl/arena.html` or platform boundaries touched since release `94`; `live-spot-check` not run |

## Substitutes and unverified boundaries

- **Substitute:** `verify/fake-platform-smoke.js` runs unmodified `impl/arena.html` in local headless Google Chrome over raw CDP against an in-memory `db`/`user` fake with fault injection; passing judgments prove page-side behavior under `DATA.md` assumptions only, never real platform semantics.
- **Unverified (disclosed before any `ONLINE` release):** Real platform boundaries in judgment `#5` remain `unverified` (no `OFFLINE` test Artifact maintained under prod-only default, and `impl/arena.html` is unchanged since release `94`).
