---
name: design-deliver
description: Deliver an accepted version under the workspace delivery contract and record the result. Use when deploying, releasing or pushing an accepted slice to a target environment.
---

# design-deliver

Use `model/operate/deploy/SPEC.md` and the deploy entry in the workspace map. The candidate is the merged commit used for delivery. The user acts as a target-system operator and separately authorizes delivery. Use acceptance records as input.

## Rules

1. Obtain explicit user authorization and its scope. Credentials, remotes and deployment capability confer no authorization.
2. Confirm irreversible actions individually with the user, including production deployment, migration, a push or a formal tag.
3. Write contract-defined outputs and the delivery record. Route missing contracts to discussion and missing entries to implementation.
4. Return evidence gaps to acceptance. A matching baseline and candidate have identical trees outside `record/`. Acceptance and registered implementation tests belong to their respective stages.

## Workflow

1. **Verify authorization and acceptance coverage:** Confirm candidate, target and authorization. Check completed acceptance records (`baseline` matching the candidate tree outside `record/`, marked acceptance-judgment table, no `fail` verdict) in the candidate tree covering every implementation record since the last delivery to that target and accounting for all non-exempt changes without implementation records. Disclose unverified boundaries. A merge that changes the tree requires matching evidence.
2. **Read the delivery contract and entry:** Review prerequisites, scope, verification, recovery and record timing in `model/operate/deploy/SPEC.md`, then read the registered deploy entry and instructions.
3. **Preflight and rehearse:** Run preflight and rehearsal. Stop before real changes if either fails; resolve and retry.
4. **Execute authorized steps:** Confirm irreversible steps individually and run only authorized actions. Report the stopping point if confirmation covers only part of the flow.
5. **Verify, record and close:** Verify candidate availability in the target environment against the delivery contract. Commit the delivery record on the mainline at the contracted time (noting version, location, applicable release notes, evidence and any authorized steps omitted). Push only with confirmation and report push results in conversation. On failure, follow contract stop/recovery instructions, report completed actions and recovery commands, record `aborted` when appropriate, and use a new numbered record for retries. Take stock after delivery.

*Legacy compatibility:* Older Chinese acceptance records in upgraded workspaces remain readable alongside structured records.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Delivery record format. |
