---
name: design-release
description: Release an accepted version to users under the workspace deploy contract and record the result. Use when deploying an accepted release candidate to an ONLINE environment and announcing a new version with release notes.
---

# design-release

Distinguish **deploy** (placing an artifact into an `OFFLINE` environment for QA/`verify/` or an `ONLINE` environment for live users) from **release** (announcing a new verified version of the solution to users with release notes). Use `model/operate/deploy/SPEC.md` and the deploy/release entry in the workspace map. The candidate is the merged commit used for release. The user acts as a target-system operator and separately authorizes the release. Use acceptance records as input.

## Rules

1. Obtain explicit user authorization and its scope. Credentials, remotes and deployment capability confer no authorization.
2. Confirm irreversible actions individually with the user, including `ONLINE` deployment, migration, a push, a formal tag or external release announcement.
3. Write contract-defined outputs and the release record (`record/release/`). Route missing contracts to discussion and missing entries to implementation.
4. Return evidence gaps to acceptance. A matching baseline and candidate have identical trees outside `record/`. Acceptance and registered implementation tests belong to their respective stages.

## Workflow

1. **Verify authorization and acceptance coverage:** Confirm candidate, target environment/audience, release notes and authorization scope. Check completed acceptance records (`baseline` matching the candidate tree outside `record/`, marked acceptance-judgment table, no `fail` verdict) in the candidate tree covering every implementation record since the last release to that target (reading both `record/release/` and legacy `record/deliver/` as one combined prior-release history) and accounting for all non-exempt changes without implementation records. Disclose unverified boundaries. A merge that changes the tree requires matching evidence.
2. **Read the deploy contract and entry:** Review prerequisites, `ONLINE` environment placement, release announcement channel, verification, recovery and record timing in `model/operate/deploy/SPEC.md`, then read the registered deploy/release entry and instructions. If the candidate was already dark-launched to `ONLINE` as an authorized routine operation, locate the contract's read-only live-identity check.
3. **Preflight and rehearse:** Run preflight and rehearsal. Stop before real changes if either fails; resolve and retry.
4. **Execute authorized steps:** Confirm irreversible steps individually and run only authorized actions:
   - Deploy the candidate to `ONLINE` when applicable, or—if already dark-launched—run the contract's read-only live-identity check to verify the running `ONLINE` artifact matches the accepted candidate (stop if live identity cannot be verified).
   - Prepare or publish the version announcement and release notes per the contract.
   - Report the stopping point if confirmation covers only part of the flow.
5. **Verify, record and close:** Verify `ONLINE` availability and candidate identity against the deploy contract. Commit the release record (`record/release/<version>[-<environment>][-<sequence>].md`) on the mainline at the contracted pre-push point (noting version, target environment/audience, location, applicable release notes, verification evidence and any authorized steps omitted). Push and externally announce only with confirmation, reporting post-commit push/announcement verification in conversation without editing the frozen record. On failure, follow contract stop/recovery instructions, report completed actions and recovery commands, record `aborted` when appropriate, and use a new numbered record for retries. Take stock after release.

*Legacy compatibility:* Older Chinese acceptance records and frozen `record/deliver/` records in upgraded workspaces remain readable alongside structured records and `record/release/`.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Release record format. |
