# 0003 Accept an integrated slice

- **Actor** Operator executing acceptance; the same person may also maintain or deliver.
- **Goal** Establish whether an identified candidate satisfies the scoped journey success conditions.
- **Trigger** An implementation candidate and upstream record are ready for acceptance.
- **Success** A verification record identifies the candidate, actual coverage, results and uncovered boundaries; an accepted verdict is supported by the required integrated evidence.

```mermaid
sequenceDiagram
    actor O as Operator
    participant A as Acceptance entry
    O->>A: 1. Identify candidate and implementation evidence
    O->>A: 2. Select affected journey coverage
    O->>A: 3. Establish authorized environment and test data
    O->>A: 4. Execute local and runtime entries
    A-->>O: 4. Report observations and uncovered boundaries
    O->>A: 5. Record verdict and downstream handoff
```

## Main success scenario

1. The operator identifies candidate revision/content identity and upstream implementation record.
2. The operator selects journey steps, extensions and affected component/contract boundaries.
3. The operator establishes an authorized test candidate, platform capabilities, actors and test-data scope through the deploy contract.
4. The operator executes required entries, distinguishing local logic checks from actual runtime integration observations.
5. The operator records results and verdict under `record/verify/`; accepted candidates may proceed to separately authorized [operator/0002](./0002-publish-artifact.md).

## Extensions

- **1a. Baseline or upstream evidence is missing.** Do not infer it from historical publication comments.
- **3a. Runtime access or test-data authority is unavailable.** Mark the boundary unverified, not passed; never substitute an unaccepted production upload.
- **4a. Behavior fails a settled contract.** Return a defect to implementation; a new design boundary returns to discussion.
- **4b. Only VM/helper tests pass.** Their named logic boundary may pass, but platform integration remains unverified.
- **5a. Required coverage is incomplete.** Do not issue an accepted verdict for that slice.

## Support trace

[Acceptance contract](../../model/verify/SPEC.md) owns coverage/verdicts. [Deploy contract](../../model/operate/deploy/SPEC.md) supplies the test candidate/environment; no new operational work group is added.
