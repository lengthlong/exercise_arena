# Exercise Arena containers

One workspace-owned container hosts the single domain context ([ADR 0001](../adr/0001-arena-runs-as-claude-artifact-with-db.md)). Users open browser instances through the external Claude Artifact host; [ADR 0002](../adr/0002-each-user-opens-the-arena-with-their-own-claude-account.md) owns identity/access rationale.

```mermaid
flowchart LR
    U["User / authenticated account holder"]
    O["Operator with separate authority"]
    W["Workspace source, checks and records"]
    subgraph Host["External Claude Artifact host"]
        P["Exercise Arena page<br/>Owned browser container<br/>One bounded context"]
        I["Platform user<br/>Identity and profiles"]
        D["Platform db<br/>Persistent records"]
        A["Platform assets<br/>Photo storage"]
        AI["Platform sample<br/>AI drafting"]
    end
    K["Knowledge maps<br/>Optional references"]
    F["Font delivery<br/>Local fallbacks"]
    U -->|Use| P
    P -->|Resolve actor| I
    P -->|Subscribe and write| D
    P -->|Upload and read| A
    P -->|Request drafts| AI
    P -. Optional topic links .-> K
    P -. Presentation .-> F
    O -->|Maintain and accept| W
    W -. Accepted page supply .-> Host
    O -. Authorized delivery .-> Host
```

## Inventory

| Unit/dependency | Ownership and responsibility | Context |
|---|---|---|
| Exercise Arena page | Owned UI, coordination, validation and projections | Exercise Arena |
| Claude Artifact host | External access/sharing and capability supply | Generic platform |
| Platform user/db/assets/sample | External identity/profiles, persistent records, photos and untrusted AI | Generic platform |
| Science/math knowledge maps | Optional explanations; taxonomy IDs remain embedded TAX | External reference |
| Font delivery | Presentation dependency with local fallbacks | No domain context |

## Runtime nodes

- Browser instances share platform storage but have separate sessions; no owned backend, scheduled cleanup server or cross-device coordinator is introduced.
- Platform records/assets outlive sessions. Multiple browsers can write them; the model does not invent transaction/snapshot guarantees.
- Required identity/db/scope failures prevent readiness; narrower AI/assets/profile/reference failures are defined in [runtime SPEC](./arena/SPEC.md).
- Repository maintenance, acceptance and publication are support flows, not in-page components.
- [COMPONENT.md](./arena/COMPONENT.md) owns internal responsibilities; [SCENARIO.md](./SCENARIO.md) owns collaborations.
- Sources, artifact inventory and target flow belong to [deploy SPEC](../operate/deploy/SPEC.md).
