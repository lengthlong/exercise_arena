---
name: design-release
description: Release an accepted version to users under the workspace deploy contract and record the result. Use when deploying an accepted release candidate to an ONLINE environment and announcing a new version with release notes.
---

# design-release

Distinguish **deploy** (placing an artifact into an `OFFLINE` environment for QA/`verify/` or an `ONLINE` environment for live users) from **release** (announcing a new verified version of the solution to users with release notes). Use `model/operate/deploy/SPEC.md` and the deploy/release entry in the workspace map. The candidate is the commit on the target release branch (such as mainline or `release/*`) used for release. The user acts as a target-system operator and separately authorizes the release. Use Integration Verify records as input.

## Rules

1. Obtain explicit user authorization and its scope. Credentials, remotes and deployment capability confer no authorization.
2. Confirm irreversible actions individually with the user, including `ONLINE` deployment, migration, a push, a formal tag or external release announcement.
3. Write contract-defined outputs and the release record (`record/release/`). Route missing contracts to discussion and missing entries to implementation.
4. Return evidence gaps to acceptance—never waive acceptance (there is no `waived:` upstream syntax). A matching baseline and candidate have identical trees outside `record/`. Acceptance and registered implementation tests belong to their respective stages.
5. Standalone pre-announcement `ONLINE` dark launches follow the same Integration Verify (`scope: integration`, or legacy omitted `scope`) gate, and do not freeze upstream implementation or acceptance records until release completes.

## Workflow

1. **Verify authorization and Integration Verify coverage:** Confirm candidate, target release branch, target environment/audience, release notes and authorization scope. Check completed **Integration Verify** records (`> scope: integration`, or legacy omitted `> scope:`; `> scope: feature` is ineligible; `baseline` matching the candidate tree outside `record/`, marked acceptance-judgment table, zero `fail`) in the candidate tree covering every implementation record since the last release to that target (reading both `record/release/` and legacy `record/deliver/` as one combined prior-release history) and accounting for all non-exempt changes without implementation records. Verify that no unresolved `in-progress` implementation or acceptance record (including `scope: feature`) remains open for covered work—complete or abort it first. Disclose any `unverified` boundaries (including prod-only boundaries when `model/verify/SPEC.md` declares no `OFFLINE` environment) before `ONLINE` deploy. A merge that changes the tree requires matching evidence.
2. **Read the deploy contract and entry:** Review prerequisites, `ONLINE` environment placement, release announcement channel, verification (including post-deploy live verification for prod-only boundaries), recovery and record timing in `model/operate/deploy/SPEC.md`, then read the registered deploy/release entry and instructions. If the candidate was already dark-launched to `ONLINE` as an authorized routine operation, locate the contract's read-only live-identity check.
3. **Preflight and rehearse:** Run preflight and rehearsal (a transactional safety dry-run, distinct from acceptance). Stop before real changes if either fails; resolve and retry.
4. **Execute authorized steps:** Confirm irreversible steps individually and run only authorized actions:
   - Deploy the candidate to `ONLINE` when applicable, or—if already dark-launched—run the contract's read-only live-identity check to verify the running `ONLINE` artifact matches the accepted candidate (stop if live identity cannot be verified).
   - Prepare or publish the version announcement and release notes per the contract.
   - Report the stopping point if confirmation covers only part of the flow.
5. **Verify, record and close:** Verify `ONLINE` availability and candidate identity against the deploy contract. Commit the release record (`record/release/<version>[-<environment>][-<sequence>].md`) on the target release branch or mainline at the contracted pre-push point (noting version, target environment/audience, location, applicable release notes, verification evidence and any authorized steps omitted). Completing the release freezes the release record and **permanently freezes globally** every covered `record/implement/` and `record/verify/` (both `scope: feature` and `scope: integration`) in the released candidate tree. Push and externally announce only with confirmation, reporting post-commit push/announcement verification in conversation without editing the frozen record. On failure, follow contract stop/recovery instructions, report completed actions and recovery commands, record `aborted` when appropriate—freezing only that `aborted` release record so upstream implementation and acceptance records remain updatable for fixes—and use a new numbered record (`-2`) for retries. Take stock after release.

*Legacy compatibility:* Older Chinese acceptance records, pre-0057 acceptance records omitting `> scope:`, and frozen `record/deliver/` records in upgraded workspaces remain readable alongside structured records and `record/release/`.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Release record format. |
