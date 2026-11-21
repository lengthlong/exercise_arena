# Writing model files

Use the standard map in `CLAUDE.md` for file locations and authority. Give each fact one home.

## Modeling boundaries by file

| File | Writing focus and boundaries |
|---|---|
| `journey/` (`USER.md`, `OPERATOR.md`, `NNNN-*.md`) | All journey bodies live directly in `journey/` with one global `NNNN` numbering sequence (plans consume a number; cross-index links do not); `USER.md` and `OPERATOR.md` index them by initiating role; designer settles unclear ownership. Include a person-facing sequence diagram keyed by step number; trace runtime and support separately; keep decisions and confirmation with the person. |
| `model/domain/GLOSSARY.md` | One entry with equivalent English and Chinese names per domain concept, grouped by bounded context; define same-name concepts per context; keep rationale in ADRs. |
| `model/domain/DOMAIN.md` | Subdomain kind, bounded contexts, architectural homes, context map, aggregates (with single writer), value objects, class diagram and invariants with ADR links. Omit context map and separate context headings for a single context. Put release slices in journey indexes. |
| `model/arch/CONTAINER.md` | System context, container diagram and inventory (with bounded contexts), runtime nodes and ADR links. Put build, deploy, release, install and artifact paths in `model/operate/deploy/SPEC.md`. |
| `model/arch/SCENARIO.md` | One section per distinct interaction linked to affected journeys. Treat containers (including stores) as black boxes; labels may name entry components. Cover runtime steps plus external, scheduled, operator, error and unattended scenarios. Notes cover cross-container order, authorization and failure. |
| `model/arch/<container>/COMPONENT.md` | Internal responsibilities, operations, aggregates written and message paths from entry components; keep other containers black boxes. |
| `model/arch/<container>/SCENARIO.md` | Add only for multi-component collaboration or failure/recovery across components; name the parent scenario it refines. |
| `model/arch/<container>/SPEC.md` | Authoritative fields, interfaces, shared shapes, validation and failure boundaries; split under `spec/` as needed; point to the workspace map for implemented internals. |
| `model/operate/INDEX.md` & `<group>/SPEC.md` | Active support work groups (`observe`, `respond`, `deploy`, `recover`, `capacity`, `maintain`—create only groups in use, one owner per item, call across groups without copying). Each contract covers journey/trigger, operator and authorization, environment, prerequisites, scope, entry, success/failure/stop, verification and recovery; `deploy` adds artifact flow, inventory, `OFFLINE`/`ONLINE` environments, release announcement channels and optional read-only dark-launch checks (used by both acceptance and release). Keep runtime monitoring/recovery/backup services and formal diagnostic CLIs in `model/arch/` and `impl/`. Do not commit field logs, credentials, incident examples or operational results by default—agree on retention explicitly by journey. |
| `model/verify/SPEC.md` | Feature Verify (`scope: feature`) vs. Integration Verify (`scope: integration`, including unaffected-journey regression) entry split, `OFFLINE` acceptance environments (or explicit prod-only declaration when none exists), substitutes, journey coverage per entry, sizing by affected container/component, external writes requiring confirmation, and exempt unrecorded changes. Reference journey success conditions instead of copying them. |

Use `verify/README.md` for actual acceptance entries and `operate/README.md` plus group READMEs for tools, configuration and runbooks; each links its authoritative contract without copying guarantees.

## Journey index rules

- Use six columns: `ID`, `Actor`, `Goal`, `Body`, `Status`, `TODO` (plain text for ID and goal; link the body in its own column).
- `Status` describes body availability only (`detailed` or `planned`). Use `—` for an absent body or unknown TODO (not proof of no gaps).
- Optional overview Mermaid `flowchart LR`: solid lines for explicit prerequisites, dashed lines for optional, conditional or feedback paths; state direction on cross-role links.
- Record decided minimum usable loop and scope slices only in the initiating role's index (included steps/extensions, exclusions, prerequisites/substitutes, cross-role dependencies—scope only, not progress).

## Level of detail and methods

- **Core C4 terms:** A **container** is an independently usable runtime unit (or standalone non-runtime deliverable); a **component** is a module/section inside a container sharing its lifecycle; a **scenario** is a collaboration triggered by a journey step, external system or schedule.
- **Fields only in specs:** Describe visible information and state changes in journeys, invariant-relevant properties in `DOMAIN.md`, message purpose and component responsibilities in scenarios/components, and field types, validation and failure boundaries in `SPEC.md`.
- **Before vs. after implementation:** Before implementation, capture agreed contracts and key behavior. Afterward, retain what code alone cannot express (shared contracts, externally visible shapes, invariants, rationale, deferred choices); leave internal steps in source, tests and skill prose.
- **Methods:** Cockburn user-goal use cases and extensions for journeys; C4 System Context, Container, Component, Deployment and Dynamic views for architecture; DDD bounded contexts, subdomains, context maps, ubiquitous language, aggregates and value objects for domain. Supplement with arc42 when needed.
