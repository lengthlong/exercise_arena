# Design method

Define a verifiable goal, derive the runtime model and operation contracts from journeys, compare alternatives and summarize the target model. For a process or skill change without a journey, move from the goal directly to alternatives.

## Background and goal

State the current behavior, pain and people affected, attributing user-supplied facts. Write success as an observable state with quality requirements. State exclusions, chosen precedents, authorization, external constraints and what can be verified this round.

## Principles

1. **Traceability:** Journeys establish requirements, domain sets rules, and architecture assigns responsibility. Decide rule changes explicitly in the domain. Model target runtime in containers and components; trace support work to its group contract in `model/operate/`.
2. **Domain–architecture alignment:** Component responsibilities and domain concepts meet in bounded contexts (core, supporting or generic subdomains). Give a component a glossary entry only when a domain rule depends on it. Each context lives in a container or group of its components (small domains need only one context). Give each aggregate one writer (split competing writers), use value objects for immutable references, define same-name concepts separately by context, and enforce each context's rules on read-only cross-context readers.
3. **Field placement:** Specify fields, types and validation rules only in specifications (`SPEC.md`).

## Starting points

- **New goal:** Open `journey/user/INDEX.md` and `journey/operator/INDEX.md`, identify goals and overlapping roles, and draft the most important journeys.
- **Existing design:** Locate affected journey steps, system scenarios and cross-role dependencies, then rederive the model. Raise conflicts with written journeys for decision.
- **System trigger:** Trace runtime effects to container scenarios, explicit external/scheduled support to operation contracts, and impacts on people to their journeys.

## Derivation

1. **Draft journeys:** List goals one person can complete in one journey (split large goals; combine trivial steps). Follow `design-writing` for numbering, ownership and index conventions. Draft main success steps before extensions; continue once one or two important main scenarios exist.
2. **Trace runtime steps:**
   - Identify the container (`CONTAINER.md`), responsible component (`COMPONENT.md`), messages (`SCENARIO.md`), and affected entities, state, context and aggregate (`GLOSSARY.md`, `DOMAIN.md`).
   - Start with one entry component per human-facing container, one adapter per external system and one coordinating component per journey; model automatic reactions as triggers and consequences.
   - Repair existing omissions visibly, define new terms in the glossary, and ask about untraced elements, changed journey requirements or genuine alternatives.
3. **Trace operational support steps:**
   - Assign each support item one work group: `observe` (monitoring), `respond` (alerts/incidents), `deploy` (install, deploy, release, rollback), `recover` (backup, restore, drills), `capacity` (performance/efficiency) or `maintain` (routine maintenance). Create only groups in use and call across groups without copying.
   - Keep runtime monitoring services, recovery controllers, scheduled backup services and formal diagnostic CLIs in `model/arch/` and `impl/` according to their runtime responsibilities.
   - Define operator and existing authorization, environment and dependencies, object, allowed actions and entry, prerequisites, and observable success, failure, stop, verification and recovery boundaries (for `deploy`, include artifacts, sources and targets; both acceptance and delivery use deploy entries).
   - Trace the user's machine, environment, credentials and dependencies to an operator journey or external owner. Do not commit field logs, credentials, incident examples or operational results into the design repo by default—govern retention explicitly by journey agreement. Record gaps, substitutes and exclusions (a substitute proves only its stated boundary).
4. **Reconcile before write-off:**
   - Assign each responsibility to one component, each collaboration to one scenario, each aggregate one writer, and context relationships to the context map.
   - Support-only journeys trace to their entry contract and acceptance; runtime steps need scenario coverage.
   - Propose covering or removing existing components/entities with no entry path or scenario reference, and surface new untraceable additions for decision.
5. **Check container boundaries:** Decide boundaries by independently usable shape, deployment, data ownership and quality requirements (record rationale in an ADR). Verify against the deploy artifact inventory: discuss containers split across artifacts, artifacts mixing containers, or non-file sources.
6. **Open specifications when ready:** Open `model/arch/<container>/SPEC.md` (splitting under `spec/` as needed) once runtime questions, support entries/acceptance and cross-journey requirements are reconciled and contracts, validation rules or failure boundaries are needed.
   - One container owns each contract (provider owns interfaces; data owner/writer owns shared shapes). If no single owner exists, consider a standalone deliverable or split by owner.
   - Put cross-container sequencing/failure in scenario notes, cross-aggregate invariants in `DOMAIN.md`, and budget rationale in an ADR with allocated limits in `SPEC.md`.

## Compare alternatives

For material decisions a later reader will need explained, compare two or three viable options (including retention or deferral) against goals, quality requirements and constraints. Prefer simpler, reusable designs and deferrals that preserve structure. Pick a clear best option yourself and state reasons; ask the user to decide genuine trade-offs with a recommendation and costs. Put lasting rationale and declined alternatives in ADRs.

## Summarize for handoff

Lead with what changes, then summarize affected journeys, domain, architecture, specifications and operation contracts (naming replaced behavior and its source, with diagrams for structural or interaction changes). Keep active decisions on their questions and map each planned design edit and verification in the write-off plan. Handoff consists of those frozen design rows, the current model and the workspace map. Record shared contracts, data shapes and failure boundaries in the model and explicitly mark internal choices delegated to implementation.

## Legacy layouts

Retained legacy specifications under `model/spec/<topic>/` remain authoritative until a discussion affects that topic; then distribute them to their owning containers (`model/arch/<container>/SPEC.md`) and update references.
