# 0005 Acceptance runs the real page on a simulated platform

## Context

The page needs four platform capabilities (`db`, `assets`, `sample`, `user`) and about sixteen db call sites. Acceptance used to require an authorized test Artifact for every slice, so nothing ran between slices, while most required cases (partial writes, owner switch, stale preview, deleted documents) need failures the real platform cannot inject on demand.

## Decision

Acceptance has two tiers. The unmodified candidate page runs in a headless browser against an in-memory platform fake with fault injection; this simulated runtime counts as acceptance evidence for page-side boundaries and is a declared substitute. The real platform is judged only for platform boundaries, in an authorized `OFFLINE` test Artifact, once per release candidate. `./check.sh` and the logic suite stay implementation-stage checks, not acceptance evidence.

## Rationale

- Failure injection makes the dangerous paths testable on every slice at low cost.
- The platform surface is small, so the fake stays small and the page needs no test hooks.
- Once per release candidate keeps real-platform evidence in front of release without making each slice wait for an external write.

## Cost

- The fake can drift from the real platform; a call it models only by assumption is judged as page-side behavior, and platform boundaries stay unverified until the authorized run.
- Slices that are not release candidates are accepted with platform boundaries unverified.
- Each authorized run is an external write that needs fresh authorization.

## Open

Whether a private test Artifact's database is isolated from production is established by the first authorized run, not assumed.
