# 0005 Acceptance runs the real page on a simulated platform

## Context

The page needs four platform capabilities (`db`, `assets`, `sample`, `user`) and about sixteen db call sites. Acceptance used to require an authorized test Artifact for every slice, so nothing ran between slices, while most required cases (partial writes, owner switch, stale preview, deleted documents) need failures the real platform cannot inject on demand.

## Decision

Acceptance has two tiers. The unmodified candidate page runs in a headless browser against an in-memory platform fake with fault injection; this simulated runtime counts as acceptance evidence for page-side boundaries, is a declared substitute, and its automated pass is required before `ONLINE` release. The real platform is judged only for platform boundaries, in an authorized `OFFLINE` test Artifact, on an `on-touch` manual cadence (reconsidered 2026-11-22 from "once per release candidate": run only for platform boundaries touched since the last release, or when widened by the user, with any unrun or skipped boundaries disclosed as `unverified`). `./check.sh` and the logic suite stay implementation-stage checks, not acceptance evidence.

## Rationale

- Failure injection makes the dangerous paths testable on every slice at low cost.
- The platform surface is small, so the fake stays small and the page needs no test hooks.
- Sizing manual real-platform checks `on-touch` by component/capability keeps real-platform evidence focused on changes that actually touch platform boundaries without blocking UI-only or projection-only releases on manual walkthroughs.

## Cost

- The fake can drift from the real platform; a call it models only by assumption is judged as page-side behavior, and platform boundaries stay `unverified` until an authorized run exercises them.
- Both intermediate slices and release candidates whose platform boundaries were untouched (or explicitly skipped by the user) are completed and released with platform boundaries `unverified` and disclosed.
- Each authorized run is an external write that needs fresh authorization.

## Open

Whether a private test Artifact's database is isolated from production is established by the first authorized run, not assumed.
