# Acceptance catalog

Policy: [verify/SPEC.md](./SPEC.md) (prod-only default, tiered graders, oracle-integrity guard, external-write confirmations) and [ADR 0005](../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md). Exclusively owned by `design-verify`. Acceptance verdicts are recorded under `record/verify/`; running an entry while debugging is not a verdict.

Implementation-stage precondition (not acceptance evidence): `./check.sh` and `node impl/logic.test.js impl/arena.html` (see [maintain tools](../operate/maintain/README.md)) must pass on the matched implementation record's product tree.

## Entry catalog

| Entry | Journey / area | Cost | Cadence | Default phase | Command / instructions |
|---|---|---|---|---|---|
| `simulated-smoke` | 0001–0010 core flows (boot/read fault, daily paper recovery/hand-in/self-judge, check paper preview/review/override, set cleanup & owner-scoped Games balance, recording coins, Record coin pill, treasure-bowl save animation & status messages via a stubbed AI `sample`) | `automated` | `on-touch` | `both` | `node verify/fake-platform-smoke.js impl/arena.html [--journeys 0002,0008]` (`--list` prints cases; zero npm deps, uses local Chrome via CDP; set `CHROME_PATH` if needed; skippable with `unverified` reason) |
| `live-spot-check` | Real platform boundaries (identity, real `db` queries/writes/deletes, photo uploads, AI recognition, runtime capabilities) | `manual` | `on-touch` | `integration` | Prod-only default: spot-check affected live flows after separately authorized `ONLINE` publication (or on an explicitly authorized ad-hoc test Artifact). Unrun boundaries stay `unverified` and are disclosed before release |

Tags: `Cost` = `automated | agent | manual`; `Cadence` = `always | on-touch`; `Default phase` = `feature | integration | both`. Users may widen, narrow or skip any entry on any run; only `fail` keeps `record/verify/` `in-progress`.

## `verify/` self-checks

Run after editing `verify/` (alongside `./check.sh`; never rerun `impl/` tests and never count self-checks as acceptance verdicts):

```sh
node --check verify/fake-platform-smoke.js
node verify/fake-platform-smoke.js --list
```

## Notes

`verify/fake-platform-smoke.js` serves the unmodified `impl/arena.html` over local HTTP and drives headless Google Chrome via raw DevTools Protocol (`http` + `WebSocket`, Node built-ins only) against a minimal in-memory `db`/`user` fake with fault injection, plus an opt-in AI `sample` stub returning fixed drafts (`window.__sampleOut`). A pass proves page behavior only against the fake's `DATA.md` assumptions, never real platform semantics.
