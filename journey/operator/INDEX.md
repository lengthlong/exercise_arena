# Operator journeys

Three distinct goals may be performed by the same person. IDs remain role-local and stable; body status does not claim acceptance.

| ID | Actor | Goal | Body | Status | TODO |
|---|---|---|---|---|---|
| 0001 | Operator | Maintain an aligned change | [0001-maintain-and-verify.md](./0001-maintain-and-verify.md) | detailed | Downstream implementation records |
| 0002 | Operator | Deliver an accepted Artifact | [0002-publish-artifact.md](./0002-publish-artifact.md) | detailed | Candidate/target/recovery evidence |
| 0003 | Operator | Accept an integrated slice | [0003-accept-integrated-slice.md](./0003-accept-integrated-slice.md) | detailed | Authorized runtime entries and evidence |

```mermaid
flowchart LR
    M["0001 Maintain"] --> A["0003 Accept integrated slice"]
    A --> D["0002 Deliver accepted candidate"]
    D --> U["user/0010 Open arena"]
```

The links are stage dependencies, not automatic authorization. Acceptance test-candidate supply uses the deploy contract without implying production delivery.
