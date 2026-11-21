---
name: design-verify
description: Verify user-perspective slice behavior against journey success conditions in Feature Verify (scope: feature) or Integration Verify (scope: integration) mode and record the result. Use after implementation, including before release or standalone ONLINE dark launch when matching integration evidence is missing.
---

# design-verify

Run the registered `verify/` entries for a feature slice or release candidate in one of two explicit modes—**Feature Verify (`scope: feature`)** or **Integration Verify (`scope: integration`)**—without adding a third regression mode. Use upstream implementation records and the workspace's `model/verify/SPEC.md` for `OFFLINE` environments, substitutes, coverage, sizing and exemptions. Implementation owns code/contract tests (including code-level regression) and writes or repairs acceptance entries. Acceptance writes or updates its own record and may use the temporary or `OFFLINE` environment defined by the entry.

## Modes

- **Feature Verify (`scope: feature`):** checks a changed feature's user-facing functions against journey success conditions in a fast, isolated or simulated `OFFLINE` environment.
- **Integration Verify (`scope: integration`):** checks the whole release candidate across all accumulated changes since the last release for that target, including unaffected-journey regression and the full integration entry set declared in `model/verify/SPEC.md` (always running any declared real `OFFLINE` environment—never skipping it). If a prod-only workspace's `model/verify/SPEC.md` explicitly declares no `OFFLINE` environment exists, run all declared local/simulated entries and mark prod-only boundaries `unverified` (zero `fail`).
- **Simple or single-feature releases:** when one pass already covers all Integration Verify requirements (including lightweight manual `verify/README.md` walkthroughs), skip a separate `scope: feature` pass and write one `> scope: integration` record.

## Rules

1. Never list `./check.sh` or registered implementation tests as acceptance judgment rows in `record/verify/`.
2. If entries are absent or fail to cover the success conditions, send the gap to `design-implement`. Keep design, implementation and entries out of the acceptance change.
3. Obtain separate user confirmation for steps that write external state, including `OFFLINE` environment deployment, real integrations, paid calls, shared environments or pushing records. Otherwise mark the boundary `unverified` and retain a local record.
4. Mark unrun, simulated-only real boundaries or stale evidence `unverified`. Keep `> status: in-progress` whenever any judgment is `fail` (mark `completed` only with zero `fail`).

## Workflow

1. **Select mode, scope and upstream records:** Choose `scope: feature` or `scope: integration`, confirm the decided scope slice (or requested scenario/journey steps, noting undecided scope), and use a committed baseline.
   - For `scope: feature`, select the implementation record(s) for the changed feature.
   - For `scope: integration`, gather **all** implementation records in the baseline tree since the last release candidate for that target (treating `record/release/` and legacy `record/deliver/` as one combined prior-release history), or since the first commit.
   Include records from rewritten history (rebase or squash merge) and disclose ancestry differences. Under squash-merge workflows, run Feature Verify on the PR branch before squash merge and Integration Verify on the target/release branch after merge. Read the relevant journey success conditions and contracts.
2. **Match baseline and account for unrecorded changes:** Match the baseline tree outside `record/` to the `<end>` commit of an implementation record with passing registered tests (ignoring intermediate `record/` commits inside an implementation range); route unmatched trees (including post-merge or squash-merged trees whose `<end>` no longer matches or is unavailable) to `design-implement` for a post-merge integration retest. Account for commits outside `record/` not covered by implementation records by mode, respecting contract exemptions:
   - In `scope: feature`, list and cover only unrecorded changes affecting that feature's scope (never pulling in commits covered by unselected implementation records or unrelated since-last-release commits).
   - In `scope: integration`, list and cover all remaining non-exempt commits outside `record/` since the last release for that target.
3. **Size the run:**
   - In `scope: feature`, take the union of paired entries and affected journey steps from the selected implementation records, the slice's steps, and feature-scoped unrecorded changes.
   - In `scope: integration`, take the union of all since-last-release implementation records, unaffected-journey regression entries, the full integration entry set declared in `model/verify/SPEC.md` (never skipping a declared `OFFLINE` environment), and unrecorded changes.
   Tell the user the sizing basis so they can adjust it.
4. **Prepare prerequisites and `OFFLINE` environment:** Trace environments, machines, credentials and dependencies to an operator journey, external responsibility or declared substitute. Stop on missing prerequisites. Use the `operate/deploy/` deploy entry to place the candidate in an `OFFLINE` environment (QA, staging, integration or trial environment) as acceptance setup—never a release.
5. **Run entries:** Execute the registered `verify/` entries from the workspace map (automated suites or lightweight manual walkthroughs) and record actual observations.
6. **Judge, record and route:** Judge every numbered user-perspective success condition as `pass`, `fail` or `unverified` and cite evidence. Include required `> scope: feature` or `> scope: integration` using `assets/record.md`. Keep `> status: in-progress` if any judgment is `fail`; set `completed` only when zero `fail`. Commit on the acceptance branch:
   - On unreleased feedback-loop re-runs of the same slice or candidate, **update the existing acceptance record in place**: keep the `YYYYMMDD-<topic>.md` filename (updating the `> status:` date) and preserve existing judgment row numbers (append new judgments at the end), updating `> baseline:`, `## Upstream` (adding any new implementation record), judgments, evidence and concise round notes. Records freeze permanently globally once any completed release covers their work (or on `aborted`).
   Report the mode, baseline, scope, rationale, substitutes and unverified boundaries. Route implementation defects to `design-implement` and design/success-condition gaps to `design-discuss`. If `scope: feature` passed, proceed to Integration Verify (`scope: integration`) before release or standalone `ONLINE` dark launch; if `scope: integration` passed with zero `fail` and release is wanted, proceed to `design-release`. Otherwise take stock.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Acceptance record metadata (`scope`, `baseline`) and numbered judgments. |
