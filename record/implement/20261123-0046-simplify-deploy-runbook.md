# Align deploy runbook with simplified release gate (0046)

> status: completed (2026-11-23)
> location: branch `develop`, commits `c00d89a..134012c`

## Upstream
<!-- upstream -->

- 0046 Q1 implemented

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0012 Deliver an accepted Artifact | Steps 1–2, Extension 1a | `operate/deploy/README.md` drops the mandatory automated smoke blocker and requires passing local checks, zero-`fail` integration record, `unverified` disclosure and explicit publication authorization |
| 0013 Accept an integrated slice | Step 3 | `operate/deploy/README.md` marks `OFFLINE` test-Artifact supply optional (prod-only default) |

## Implementation choices

- None. `operate/deploy/README.md` mirrors `model/operate/deploy/SPEC.md` verbatim without changing `impl/arena.html` or `impl/logic.test.js`.

## Tests and checks

- `./check.sh`: exit 0 (`✓ Checks passed`).
- `node impl/logic.test.js impl/arena.html`: exit 0 (`all logic tests passed`).
- No runtime page code changed; live Artifact publication is outside implementation scope.
