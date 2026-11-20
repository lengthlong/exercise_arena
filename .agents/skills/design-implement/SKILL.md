---
name: design-implement
description: Implement handed-off design and authorized maintenance in source, operational tools and acceptance entries, then record the result. Use for frozen design rows, bug fixes, contract-preserving refactors and integration retests after merges.
---

# design-implement

Implement the current model. Frozen discussion rows identify what changed, acceptance records identify reported defects, and the workspace map connects the model to implementation, test, acceptance and deployment entries. The workspace chooses its own languages, frameworks and test tools. Discussion confirmation authorizes handed-off implementation, including in the same session.

## Rules

1. Preserve contracts, data shapes and container boundaries. Return design gaps or new trade-offs to discussion with evidence.
2. Record internal implementation choices individually in the commit message and implementation record.
3. Write only scoped source, operational tools, acceptance entries and their workspace-map rows.
4. Run `./check.sh` and registered implementation tests. Acceptance entries may be run for debugging, but formal acceptance and delivery belong to their own stages.

## Workflow

1. **Gather pending upstream items** in the baseline tree:
   - Discussion design rows not yet accounted for by an implementation record (if the workspace has legacy Chinese records or a record-chain cutover, read `references/legacy.md`).
   - Unhandled acceptance defects (`<record-name> #k`).
   - Authorized maintenance linked to the settled model or established behavior.
   Confirm the user's selected scope, read the affected model as it stands now, and mark superseded rows with `not-implemented` and a reason.
2. **Trace impact through the workspace map** to affected source, operational tools, acceptance entries and journey steps. Read the paired container, operation and acceptance contracts. Classify rationale-only rows as `no-implementation`.
3. **Implement and test:** Apply the model, update affected tests and entries, and update the workspace map for changed pairings. Judge single-container or tool tests by their own contract in `impl/`; judge integrated acceptance entries by journey success conditions in `verify/`.
4. **Verify:** Run `./check.sh` and registered tests. Fix failures and rerun. Report uncovered boundaries and route design gaps to discussion.
5. **Commit and record:** Commit scoped implementation changes first (citing discussion/row IDs and internal implementation choices). Then write and commit the implementation record on the same branch using `assets/record.md`. Report test results, uncovered boundaries, rows without implementation, and acceptance handoff readiness.

**Post-merge integration retest:** When an acceptance baseline lacks a matching tested implementation record after merges, run `./check.sh` and registered tests on the merged tree, then write an implementation record listing the merged implementation records as upstream.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Copy for an implementation or integration record. |
| [references/legacy.md](references/legacy.md) | Workspace contains legacy Chinese records or a record-chain cutover. |
