---
name: design-writing
description: Write and review design prose and templates. Use for journeys, domain models, architecture, specifications, ADRs, glossaries, research, rules, skills and reader-facing documents.
---

# design-writing

Use the standard map in `CLAUDE.md` for file locations and authority. Apply the following to drafts and final material according to their current purpose.

## Rules

1. Preserve facts, numbers, conditions, exceptions, scope of negation, causality and certainty when rewriting. Return any semantic change to discussion. In procedural material, split complex conditions into subitems and retain each condition.
2. Use the preferred terms in `model/domain/GLOSSARY.md` and workflow terms in `CLAUDE.md`. Keep commands, paths, fields and literal errors in code formatting.
3. Mark intentionally open decisions with their location and boundary. Use Mermaid for Markdown diagrams: class diagrams for concepts, flowcharts for structure and sequence diagrams for interactions. Publishing integrations handle conversion.
4. Keep one point per item, lead with a short conclusion, use up to three levels, and write short phrases in table cells.

## File-specific guidance

Follow [references/model-files.md](references/model-files.md) and [assets/skeletons.md](assets/skeletons.md) for journeys, models and their associated templates. Use [references/human-docs.md](references/human-docs.md) for publications, proposals and README files. Use `design-research` for research note structure.

For agent instructions, keep task-specific guidance and its rationale. Separate defaults from requirements justified by a known failure, a machine-consumed format or an authorization boundary. Give each rule one authority and point to it elsewhere. A skill description states purpose and triggers in English. The body gives rules, workflow and a file table where applicable. Keep procedures in `SKILL.md` or a directly linked reference. Use assets for templates and label runnable commands as such. Reference another skill by name or its `SKILL.md` only. For commands state prerequisites, invocation and observed success or failure. Keep internal steps in scripts and tests. Put historical compatibility at the end.

For an ADR, record a genuine trade-off that is hard to reverse and will need background later. Explain context, decision, rationale and cost, with any open issue. Keep model structure in its model. Name the file `NNNN-<decision-statement>.md` and update decision rationale and links if reconsidered. Distinguish the agent's rationale from the user's stated motives.

For each glossary concept, give equivalent **English and Chinese names** and one short definition of what it is. Use either name first. A standard acronym may accompany both names. Choose the order, language of definitions and contextual headings for the workspace. Use `_Avoid_` for disfavored aliases. If the most natural equivalent was disfavored, choose another accurate name or revise the alias status as appropriate. Check presence and equivalence during writing and review. Add missing names to older entries during glossary maintenance and consult the author when equivalence is unclear.

After changes, check fidelity against the source even after independent review. Update affected non-frozen references and check both sides of mapped pairs. Correct authorized implementation drift directly and send design reconsideration to discussion. Validate new or changed diagrams with the enabled integration or disclose the gap in write-off.

| File | When to use |
|---|---|
| [references/model-files.md](references/model-files.md) | Write or review journeys and model files, including operation contracts. |
| [assets/skeletons.md](assets/skeletons.md) | Draft journey, model, operation and acceptance files. |
| [references/human-docs.md](references/human-docs.md) | Write material for human readers. |
