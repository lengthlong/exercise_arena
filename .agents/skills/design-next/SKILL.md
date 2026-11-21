---
name: design-next
description: Assess a workspace and suggest next steps. Use at handover, before starting implementation, after acceptance or release, or to choose a minimum usable loop and walking skeleton.
---

# design-next

Take stock on the current baseline and suggest one to three ordered next steps. Keep this activity read-only: avoid tests or experiments that write state, use `design-init` for recovery or upgrade, and route authorization to the stage that needs it.

## Workflow

1. **Check onboarding and alignment** (new checkout or handover only; skip for a brief interruption by the same user):
   - Establish provenance, purpose and intended toolkit version, then run `./check.sh` and compare `toolkit` with the intended (usually installed) version.
   - Route mismatched copies to `design-init` `link` and older versions to `upgrade` (install the recorded version first if local is older).
   - List uncommitted changes that recovery or upgrade would touch so the user can decide ownership first. Recheck and use the aligned guide and indexes.
2. **Read workspace state and derive pending handoffs:**
   - Read the map, glossary, relevant ADRs, both journey indexes (`journey/USER.md`, `journey/OPERATOR.md`) and scope slices, affected scenarios, models and operation contracts.
   - Identify active discussions (`in-progress`, `pending-write-off`) and derive pending handoffs from the baseline tree—treating `record/release/` and legacy `record/deliver/` as one combined release history (if the workspace has legacy Chinese records or a record-chain cutover, read `references/legacy.md`):
     - Pending discussion design rows not yet accounted for by an implementation record.
     - Open `in-progress` acceptance records with `fail` judgments: evaluate per judgment `#k`—route to `design-verify` (pending re-verify) only when an addressing implementation record has `<end>` strictly after that acceptance record's current `baseline`; otherwise route to `design-implement` (unhandled defect), returning to `design-implement` if `#k` still fails after re-run.
     - Unverified work: implementation records and non-exempt unrecorded changes since the last release not yet covered by any completed acceptance record.
     - Feature-verified, pending Integration Verify: implementation records since the last release covered by a completed `scope: feature` acceptance record whose upstream implementation records are not yet covered by a matching completed `scope: integration` (or legacy omitted) acceptance record or a completed release (completed `scope: feature` records retire automatically once covered).
     - Integration-verified, pending Release: completed, zero-`fail` `scope: integration` (or legacy omitted) acceptance records not yet cited by a release record (a slice dark-launched to `ONLINE` without a release record remains pending release).
   - Inspect local branches and existing remote-tracking refs without fetching; flag in-flight work, duplicate handoffs and branches whose records are already on the target mainline or release branch.
   - Inspect recent commits, diffs and available verification, calling out changes of unknown provenance.
3. **Establish scope:** Use decided scope slices; otherwise propose a candidate minimum usable loop for a core user goal and a small end-to-end walking skeleton that retires a key unknown (stating scope, exclusions, prerequisites, substitutes and cross-role dependencies, tracing environments/machines/credentials to an operator journey or external owner). Decide scope via `design-discuss`. Non-software deliverables may use an appropriate first slice.
4. **Assess design readiness:** Check scope, responsibilities, interactions, contracts, failure boundaries, dependencies and success conditions. For each gap, show journey step or trigger → missing requirement → authoritative model location → completion condition. Defer unrelated design and internal details.
5. **Assess verified attainment (when implementation exists):** Evaluate walking-skeleton verification, minimum usable loop attainment and adoption/business value separately using evidence matching the baseline. Mark unrun, simulated-only or stale boundaries as unverified. Clear design readiness can precede implementation.
6. **Report in conversation:** Present goals, baseline commit, relevant diffs, active discussions, pending handoffs, branch status, slice and stage, readiness, verified results, blockers, unknowns and current authorization. Suggest 1–3 ordered next steps (each with scope, entry and completion condition) routed to `design-discuss`, `design-research`, `design-implement`, `design-verify`, `design-release` or `design-init`. Reevaluate when the baseline changes.

| File | When to use |
|---|---|
| [references/legacy.md](references/legacy.md) | Workspace contains legacy Chinese records or a record-chain cutover. |
