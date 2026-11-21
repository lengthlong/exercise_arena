# Operator journeys

Three distinct goals may be performed by the same person. All journeys use one workspace-wide numbering sequence; body status does not claim acceptance.

| ID | Actor | Goal | Body | Status | TODO |
|---|---|---|---|---|---|
| 0011 | Operator | Maintain an aligned change | [0011-maintain-and-verify.md](./0011-maintain-and-verify.md) | detailed | Downstream implementation records |
| 0012 | Operator | Deliver an accepted Artifact | [0012-publish-artifact.md](./0012-publish-artifact.md) | detailed | Candidate/target/recovery evidence |
| 0013 | Operator | Accept an integrated slice | [0013-accept-integrated-slice.md](./0013-accept-integrated-slice.md) | detailed | Authorized runtime entries and evidence |

```mermaid
flowchart LR
    M["0011 Maintain"] --> A["0013 Accept integrated slice"]
    A --> D["0012 Deliver accepted candidate"]
    D --> U["0010 Open arena"]
```

The links are stage dependencies, not automatic authorization. Acceptance test-candidate supply uses the deploy contract without implying production delivery.

Legacy ID mapping for tracing earlier frozen records: `operator/0001` → `0011`, `operator/0002` → `0012`, `operator/0003` → `0013`.
