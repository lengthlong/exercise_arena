# File templates

Use the applicable outline and omit unused sections. Workspace creation already supplies the journey indexes and container inventory. Add operation contracts and tools when needed.

## Journey index (`journey/USER.md` or `journey/OPERATOR.md`)

```markdown
# <User or operator> journeys

<One-sentence index note per design-writing. Order entries by activity.>

<Optional Mermaid flowchart LR for prerequisites and cross-role links.>

| ID | Actor | Goal | Body | Status | TODO |
|---|---|---|---|---|---|

Status describes the body only (`detailed` or `planned`). Use `—` for an absent body or unknown TODO.

## Scope slices

<Optional, initiating role's index only. Decided minimum usable loop and slice scope.>

| Slice | Included steps and extensions | Excluded | Prerequisites and substitutes | Cross-role dependencies |
|---|---|---|---|---|
```

## Journey (`journey/NNNN-<slug>.md`)

```markdown
# NNNN <Active verb phrase for the goal>

- **Actor** <Main actual role and necessary supporting roles. Include delegated agents when applicable.>
- **Goal** <What the actor accomplishes.>
- **Trigger** <What starts the journey.>
- **Success** <Observable conditions for acceptance.>

<Mermaid sequence diagram with the person or delegated agent and directly contacted containers or operation entries. Label messages with step numbers and identify personal decisions and authorization. Keep UI controls and internal messages outside this view. For unattended activity use a system scenario or explicit operation trigger.>

## Main success scenario

1. <Actor acts on an object through an entry. State any resulting changed state.>
2. …

<Use three to nine intent-level steps and glossary terms. Agents can read, write and verify within their delegation. The person decides and confirms. The text governs discrepancies. Reconcile the diagram mechanically and raise incorrect or missing steps in discussion.>

## Extensions

- **2a. <Condition>** <Handling.>

<Number by main step. Give major alternative flows a separate journey. Trace runtime steps to domain, architecture and spec and support steps to operation contracts and acceptance. Trace both sides when necessary. Use a traceability table when helpful.>
```

## Container components (`model/arch/<container>/COMPONENT.md`)

```markdown
# <Container>

<Responsibility in one sentence.>

<Mermaid component diagram with directed, labeled paths from entry components to other components or connected containers and external systems.>

## <Component>

- **Responsibility** <One sentence.>
- **Operations or messages** <Provided operations or incoming and outgoing messages.>
- **Aggregates and state** <Aggregates it writes and states it changes, using domain terms.>

## Open decisions

<Location and boundary of deferred choices.>
```

## Domain overview (`model/domain/DOMAIN.md`)

```markdown
# Domain overview

<Structure of the model. Use the contexts and names in GLOSSARY.md.>

## Proposition

<Problem and core concepts.>

## Subdomains and contexts

| Bounded context | Subdomain kind | Responsibility | Architectural home |
|---|---|---|---|

<Identify existing external generic subdomains.>

## Context map

<Mermaid flowchart with relationships such as published language, upstream/downstream or anti-corruption layer.>

## <Context>

<Boundary in one sentence.>

| Aggregate | Root | Members | Writer |
|---|---|---|---|

<Immutable value objects.>

<Mermaid class diagram.>

1. <Invariant with an ADR reference.>
```

For one context, omit the context map, subdomain table and context heading.

## Inter-container scenario (`model/arch/SCENARIO.md`)

```markdown
## <Scenario>

- **Trigger** <Journey step, external system or schedule.>
- **Journeys served** <IDs or None for a system scenario.>

<Mermaid sequence diagram with people, external systems and black-box containers including stores. Label directed messages and optionally name entry components.>

1. <Orders, authority or failure conditions across containers. Refer to specifications for prerequisites and validation.>
```

## Intra-container scenario (`model/arch/<container>/SCENARIO.md`)

```markdown
## <Scenario>

- **Refines** <Parent inter-container scenario.>

<Mermaid sequence diagram with this container's components and adjacent people, external systems or black-box containers. Label directed messages.>

1. <Rules, failure and recovery across components. Reference specs and skills.>
```

## Operations index (`model/operate/INDEX.md`)

```markdown
# Operational support contracts

<Actual support scope and contract links for active work groups.>

| Work group | Responsibility | Journey or trigger | Contract |
|---|---|---|---|
```

## Work group contract (`model/operate/<group>/SPEC.md`)

```markdown
# <Work group> support contract

- **Journey or trigger** <Role, journey and step, or explicit external or scheduled trigger.>
- **Operator and authorization** <Actual responsibilities and existing permissions.>
- **Environment and dependencies** <Operating conditions and external responsibilities.>

## <Entry>

- **Prerequisites and scope** <Conditions, object, actions and stop conditions.>
- **Success and failure** <Observable outcomes, failures and boundaries.>
- **Verification and recovery** <Evidence, acceptance entry and recovery requirements.>
- **Implementation** <Link to the tool group or state that implementation is pending.>

<Split in spec/ when needed, with one owner per contract. Define field record retention separately. Refer to runtime rules, procedures and internals at their sources.>
```

## Deploy contract additions (`model/operate/deploy/SPEC.md`)

```markdown
## Target environments and release channels

| Class | Environment / channel | Purpose and verification gate |
|---|---|---|

## Artifact flow

<Mermaid diagram from source to each runtime or storage location, naming artifacts and containers.>

## Artifacts

| Artifact | Producer | Source | Destination | Lifecycle | Containers |
|---|---|---|---|---|---|
```

## Acceptance contract (`model/verify/SPEC.md`)

```markdown
# <Workspace> acceptance contract

<Workspace-specific rules. See design-verify for Feature Verify (scope: feature) vs. Integration Verify (scope: integration, including unaffected-journey regression) and journeys for success conditions.>

## Journeys served

- <Journeys for Feature Verify and Integration Verify.>

## Environments and substitutes

| Environment or dependency | How provided | Real or substitute |
|---|---|---|

<If prod-only with no OFFLINE environment, state that explicitly and define the local/simulated entries and prod-only unverified boundaries.>

## Entries and modes

| Acceptance entry | Steps or scenarios | Mode split (`feature` vs. `integration`) and criterion |
|---|---|---|

## Sizing by change

<Affected components or containers and their journey steps.>

## External writes and confirmation

- <Steps that write external state and require separate personal confirmation.>

## Changes without implementation records

- <Exempt categories or None.>
```

## Acceptance entry index (`verify/README.md`)

```markdown
# Acceptance entries

<Link to model/verify/SPEC.md and name actual entries.>

| Entry | Instructions | Coverage |
|---|---|---|
```

## Operation tool index (`operate/README.md`)

```markdown
# Operational tools

<Scope of actual entries and paired contract index in model/operate/INDEX.md.>

| Work group | Tools or configuration | Instructions | Contract |
|---|---|---|---|
```

## Work group tool instructions (`operate/<group>/README.md`)

```markdown
# <Work group> tools

<Link the authoritative operation contract and identify available and pending tools.>

## <Tool>

<Confirm authorization, environment and prerequisites from the contract. Give command, configuration and output location.>

<Include operation and troubleshooting instructions. Refer to the contract for guarantees and implementation for internal steps.>
```
