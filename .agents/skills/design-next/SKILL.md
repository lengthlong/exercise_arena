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
2. **Read pipeline state and workspace context:**
   - First run `./check.sh --status` (read-only, no `git fetch`) to obtain `RELEASE_BASE`, grouped open `in-progress` records, pending frozen discussion design rows (respecting cutovers; if legacy Chinese records exist, read `references/legacy.md`), unreleased implementation records, raw unrecorded product commits, acceptance coverage, `[unverified]` details, `STAGE_HINT` and cross-branch `record/` diffs (merged branches flagged `merged`). Read the latest completed release record's `## Known issues`.
   - Read the map, glossary, relevant ADRs, both journey indexes (`journey/USER.md`, `journey/OPERATOR.md`) and scope slices, affected scenarios, models and operation contracts, plus active discussions and available verification evidence.
   - Interpret `--status` findings into concrete handoff routing:
     - Pending frozen discussion design rows → `design-implement`.
     - Open `in-progress` acceptance records with `fail` judgments: evaluate per judgment `#k`—if evidence attributes the defect solely to `verify/`, route directly to `design-verify` to fix `verify/` and re-run; for product defects, route to `design-verify` (pending re-verify) only when an addressing implementation record has `<end>` strictly after that acceptance record's current `baseline`, otherwise route to `design-implement` (unhandled defect), returning to `design-implement` if `#k` still fails after re-run.
     - Unverified work: unreleased implementation records and non-exempt `UNRECORDED_PRODUCT_COMMITS` since `RELEASE_BASE`, plus unreleased-loop standalone `verify/`-only commits after an existing unfrozen acceptance baseline → `design-verify`. (Post-release standalone `verify/`-only commits with zero unreleased implementation records do not trigger `pending-verify`; they carry naturally into the next feature's `design-verify`.)
     - Feature-verified, pending Integration Verify: unreleased implementation records covered only by `scope: feature` (not yet covered by a matching completed `scope: integration` / legacy record) → `design-verify`.
     - Integration-verified, pending Release: `ready-for-release` work that also satisfies any mandatory automated `pass` release prerequisites declared in `model/operate/deploy/SPEC.md` → `design-release` (missing prerequisites route to `design-verify`; a slice dark-launched to `ONLINE` without a release record remains pending release).
   - Call out duplicate cross-branch handoffs, branches whose records are already merged into the target mainline/release branch (`merged` in `[branches]`), still-open known issues, and uncommitted changes of unknown provenance.
3. **Establish scope:** Use decided scope slices; otherwise propose a candidate minimum usable loop for a core user goal and a small end-to-end walking skeleton that retires a key unknown (stating scope, exclusions, prerequisites, substitutes and cross-role dependencies, tracing environments/machines/credentials to an operator journey or external owner). Decide scope via `design-discuss`. Non-software deliverables may use an appropriate first slice.
4. **Assess design readiness:** Check scope, responsibilities, interactions, contracts, failure boundaries, dependencies and success conditions. For each gap, show journey step or trigger → missing requirement → authoritative model location → completion condition. Defer unrelated design and internal details.
5. **Assess verified attainment (when implementation exists):** Evaluate walking-skeleton verification, minimum usable loop attainment and adoption/business value separately using evidence matching the baseline. Mark unrun, simulated-only or stale boundaries as unverified. Clear design readiness can precede implementation.
6. **Report in conversation:** Present goals, baseline commit, relevant diffs, active discussions, pending handoffs, branch status, slice and stage, readiness, verified results, blockers, unknowns and current authorization. Suggest 1–3 ordered next steps (each with scope, entry and completion condition) routed to `design-discuss`, `design-research`, `design-implement`, `design-verify`, `design-release` or `design-init`. Reevaluate when the baseline changes.

| File | When to use |
|---|---|
| [references/legacy.md](references/legacy.md) | Workspace contains legacy Chinese records or a record-chain cutover. |
