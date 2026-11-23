# 0005 Acceptance runs the real page on a simulated platform

## Context

The page needs four platform capabilities (`db`, `assets`, `sample`, `user`) and about sixteen db call sites. Acceptance used to require an authorized test Artifact for every slice, so nothing ran between slices, while most required cases (partial writes, owner switch, stale preview, deleted documents) need failures the real platform cannot inject on demand.

## Decision

Acceptance stays lightweight for a fast-moving personal app (reconsidered 2026-11-23). The unmodified candidate page can be checked locally in headless Chrome against a minimal in-memory platform fake (zero npm dependencies); this simulated runtime is an optional `on-touch` substitute for page-side boundaries and is **not** a mandatory pre-release blocker. The workspace is prod-only by default (no maintained `OFFLINE` test Artifact): real platform boundaries remain `unverified` during local acceptance, are disclosed before `ONLINE` release, and are spot-checked live after publication. `./check.sh` and `impl/logic.test.js` (`< 1s`, zero dependencies) stay fast implementation-stage checks, not acceptance evidence.

## Rationale

- Keeping `impl/logic.test.js` fast (`< 1s`) and simulated browser smoke small, dependency-free and `on-touch` removes Playwright and test-Artifact ceremony while keeping a quick local browser check available when page wiring or fault paths change.
- Disclosing `unverified` boundaries before `ONLINE` publication preserves honesty without blocking single-user iteration.

## Cost

- The fake can drift from the real platform; skipped smoke checks and real platform boundaries stay `unverified` until live post-publish inspection (or an ad-hoc test Artifact run).
- Any ad-hoc external test target still needs explicit authorization.

## Open

Whether a private test Artifact's database is isolated from production is established by the first authorized run, not assumed.
