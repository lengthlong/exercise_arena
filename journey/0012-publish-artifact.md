# 0012 Deliver an accepted Artifact

- **Actor** Operator with target access and separate publication authorization.
- **Goal** Deliver the exact accepted page candidate to the intended Artifact.
- **Trigger** Matching integration acceptance evidence and user delivery authorization exist.
- **Success** The intended target contains the accepted candidate, post-publication checks pass, and the delivery result is recorded. An upload alone is not delivery.

```mermaid
sequenceDiagram
    actor O as Operator
    participant D as Deploy entry
    O->>D: 1. Identify candidate, integration acceptance and unverified boundaries
    O->>D: 2. Disclose unverified boundaries; confirm target, authority and recovery limits
    O->>D: 3. Publish the accepted HTML
    O->>D: 4. Inspect target identity and behavior
    D-->>O: 4. Report passed or failed target checks
    O->>D: 5. Record delivery or failure
```

## Main success scenario

1. The operator identifies the exact candidate revision/content identity, matching completed `scope: integration` [0013](./0013-accept-integrated-slice.md) evidence (zero `fail`), mandatory automated release prerequisites defined in [deploy contract](../model/operate/deploy/SPEC.md), and all `unverified` boundaries.
2. The operator discloses every `unverified` boundary to the user and confirms intended target, explicit publication authorization, artifact inventory and available recovery entry/source.
3. The operator publishes only the accepted HTML through the established platform entry.
4. The operator checks actual target identity, loading and affected behavior against the acceptance baseline.
5. The operator records candidate, target, authority, checks, disclosed unverified boundaries and outcome under `record/release/`.

## Extensions

- **1a. Integration acceptance is missing, describes another candidate, or lacks a mandatory automated prerequisite.** Stop and obtain matching evidence through [0013](./0013-accept-integrated-slice.md).
- **2a. Target access, authority or recovery capability is unknown.** Record limits; do not invent rollback or proceed without required authorization.
- **3a. Upload fails.** Inspect actual target state; the prior version is not assumed to have survived.
- **4a. Target identity or behavior differs.** Delivery failed. Record the gap; restoration requires an available prior candidate and established authority/entry.
- **5a. Production data repair is requested.** It is not implied by page publication and needs separate scope/authorization.

## Support trace

All steps use [deploy contract](../model/operate/deploy/SPEC.md); evidence policy uses [acceptance contract](../model/verify/SPEC.md). Publication enables [0010](./0010-open-shared-arena.md), not cross-owner content sharing.
