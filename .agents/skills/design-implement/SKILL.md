---
name: design-implement
description: Implement handed-off design and authorized maintenance in source, operational tools and acceptance entries, then record the result. Use for frozen design rows, bug fixes, contract-preserving refactors and integration retests after merges.
---

# design-implement

Implement the current model. Frozen discussion rows identify what changed, acceptance records identify reported defects, and the workspace map connects the model to implementation, test, acceptance and deployment entries. The workspace chooses its own languages, frameworks and test tools. Discussion confirmation authorizes handed-off implementation, including in the same session.

## Rules

1. Preserve contracts, data shapes and container boundaries. Return design gaps or new trade-offs to discussion with evidence.
2. Record internal implementation choices individually in the commit message and implementation record.
3. Write only scoped source, operational tools, acceptance entries (as needed; `design-verify` may also author or adjust `verify/` directly within the settled acceptance contract) and their workspace-map rows (`CLAUDE.md` holds only the one-time `verify/` directory pointer; concrete entries, commands and tags belong solely in `verify/README.md`).
4. Run `./check.sh` and registered implementation tests (including code-level regression). Never count them as acceptance verdicts. Acceptance entries may be run for debugging, but debugging results do not count as acceptance; formal acceptance and release belong to their own stages.

## Workflow

1. **Gather pending upstream items** in the baseline tree:
   - Discussion design rows not yet accounted for by an implementation record (if the workspace has legacy Chinese records or a record-chain cutover, read `references/legacy.md`).
   - Unhandled acceptance product defects: a `fail` judgment `#k` on an `in-progress` acceptance record `V` attributed to product code (`verify/`-only defects route directly to `design-verify`) where no addressing implementation record has `<end>` strictly after `V`'s current `baseline` (returning here if `#k` still fails after re-run), or unhandled product defects from a separate, frozen or aborted acceptance record (`<record-name> #k`).
   - Authorized maintenance linked to the settled model or established behavior.
   Confirm the user's selected scope, read the affected model as it stands now, and mark superseded rows with `not-implemented` and a reason.
2. **Trace impact through the workspace map** to affected source, operational tools, acceptance entries (via `verify/README.md`) and journey steps. Read the paired container, operation and acceptance contracts. Classify rationale-only rows as `no-implementation`.
3. **Implement and test:** Apply the model, update affected tests and (as needed) `verify/` entries, and update the workspace map for changed `impl/`/`operate/` pairings or an initial `verify/` directory pointer (record concrete acceptance entries, commands and tags in `verify/README.md`). Judge single-container or tool tests (and code-level regression) by their own contract in `impl/`; judge user-perspective acceptance entries by journey success conditions in `verify/`.
4. **Verify:** Run `./check.sh` and registered tests. Fix failures and rerun. Report uncovered boundaries and route design gaps to discussion.
5. **Commit and record:** Commit scoped implementation changes first (citing discussion/row IDs and internal implementation choices). Then write or update the implementation record on the same branch using `assets/record.md`:
   - **Update in place** on a same-feature re-run before any completed release covers the record **only when every intervening commit between the previous `<end>` and the new fix is a `record/` commit, a `verify/`-only commit, or part of the same feature**: keep the existing `YYYYMMDD-<topic>.md` filename (even across calendar days, updating the `> status:` date) and keep `<start>`, advance `<end>`, and log defect fixes in round notes without adding a circular `<verify-record> #k` upstream entry.
   - **Open a new record** when unrelated non-`record/`, non-`verify/` commits intervened (such as on a shared trunk or after a merge), when a fix spans multiple unreleased implementation records, for a post-merge integration retest, or after a completed release has globally frozen prior records.
   - **Keep upstream references strictly acyclic:** when a new implementation record fixes a defect from an `in-progress` acceptance record `V` that will be updated in place (adding this new implementation record to `V`'s upstream), list the affected prior implementation record(s) in `## Upstream` and record the fix of `V #k` in round notes—reserving `<verify-record> #k` strictly for defects from a separate (e.g., `scope: feature` feeding into `scope: integration`) or frozen/aborted acceptance record.
   Report test results, uncovered boundaries, rows without implementation, and acceptance handoff readiness.

**Post-merge integration retest:** When an acceptance baseline's product tree (outside `record/` and `verify/`, on a target mainline or release branch) lacks a matching tested implementation record after merges, run `./check.sh` and registered tests on the merged tree, then write a new implementation record listing the merged implementation records as upstream.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Copy for an implementation or integration record. |
| [references/legacy.md](references/legacy.md) | Workspace contains legacy Chinese records or a record-chain cutover. |
