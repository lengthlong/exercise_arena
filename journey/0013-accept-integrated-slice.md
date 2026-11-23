# 0013 Accept an integrated slice

- **Actor** Operator executing acceptance; the same person may also maintain or deliver.
- **Goal** Establish whether an identified candidate satisfies the scoped journey success conditions.
- **Trigger** An implementation candidate and upstream record are ready for Feature Verify (`scope: feature`) or Integration Verify (`scope: integration`).
- **Success** A `record/verify/` record identifies the candidate, mode, actual coverage, judgments and unverified boundaries; zero `fail` completes the record, and completed `scope: integration` evidence satisfying release prerequisites may proceed to [0012](./0012-publish-artifact.md).

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Acceptance entry
    O->>A: 1. Identify candidate and implementation evidence
    O->>A: 2. Size entries from verify/README.md
    O->>A: 3. Establish authorized OFFLINE environment (when touched manual boundaries are in scope)
    O->>A: 4. Execute selected automated and manual entries
    A-->>O: 4. Report observations and unverified boundaries
    O->>A: 5. Record verdict and downstream handoff
```

## Main success scenario

1. The operator identifies candidate revision/content identity, selects `scope: feature` or `scope: integration`, and matches the baseline product tree (outside `record/` and `verify/`) to an upstream implementation record whose registered tests passed.
2. The operator sizes the run from [verify/README.md](../verify/README.md) using the contract's `Cost`/`Cadence` defaults (`automated` → affected subset on `feature`, full suite on `integration`; `manual` → `on-touch` on `integration` by touched component/capability) and confirms any user-directed widening, narrowing or skipping.
3. When touched `on-touch` manual platform boundaries are in scope (or widened by the user), the operator establishes an authorized `OFFLINE` test candidate, platform capabilities, actors and synthetic test-data scope through [deploy SPEC](../model/operate/deploy/SPEC.md). Slices with no manual boundaries in scope skip this step.
4. The operator executes the selected entries (editing `verify/` directly within the settled contract if an entry needs adjustment and committing the new baseline first). Implementation-stage checks are not re-counted as acceptance evidence.
5. The operator records judgments (`pass`, `fail`, or `unverified` with reason) under `record/verify/`: zero `fail` marks `completed`. Completed `scope: feature` records proceed to `scope: integration`; completed `scope: integration` records satisfying release prerequisites may proceed to separately authorized [0012](./0012-publish-artifact.md) with all `unverified` boundaries disclosed.

## Extensions

- **1a. Baseline product tree or upstream evidence is missing.** Route to implementation for a post-merge integration retest; never infer evidence from historical publication comments.
- **3a. Authorized `OFFLINE` access, capabilities or test-data confirmation is unavailable.** Stop on missing prerequisites unless the user explicitly skips the affected manual entries, in which case record each skipped boundary `unverified` with the reason; never substitute an unaccepted production upload.
- **4a. Behavior fails a settled contract.** Record `fail` and keep `record/verify/` `in-progress`. Route `verify/`-only defects to `verify/` repair, product defects to implementation, and contract or success-condition gaps to discussion.
- **4b. Only simulated-runtime checks run.** Page-side boundaries they exercise may `pass`; real platform boundaries remain `unverified` and must be disclosed.
- **5a. Unrun or user-skipped boundaries remain with zero `fail`.** Complete the record with each unrun or skipped boundary marked `unverified` (with reason). Mandatory automated release prerequisites are checked before [0012](./0012-publish-artifact.md), and all remaining `unverified` boundaries are disclosed to the user prior to release authorization.

## Support trace

[Acceptance contract](../verify/SPEC.md) owns policy, substitutes and `on-touch` sizing; [verify/README.md](../verify/README.md) owns the concrete entry catalog. [Deploy contract](../model/operate/deploy/SPEC.md) supplies the test candidate/environment and release prerequisites; no new operational work group is added.
