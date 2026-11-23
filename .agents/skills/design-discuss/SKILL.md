---
name: design-discuss
description: Examine and decide design trade-offs. Use for new designs, changes, design and workflow reviews, research follow-up, scope slices, and design gaps returned from implementation or acceptance.
---

# design-discuss

The agent gathers evidence and proposes a target model. The user decides genuine trade-offs and confirms the write-off plan. Apply confirmed changes to journeys and models (including operation contracts; never `verify/`, which belongs exclusively to `design-verify`) and record the write-off. Freezing hands the design rows and current model to `design-implement`, which identifies affected implementation paths and tests. Read implementation for evidence only.

## Rules

1. Cite primary sources for material evidence, identify unknowns and their impact, and surface agent-selected trade-offs individually at confirmation.
2. Record decisions on their numbered questions and put settled or explicitly provisional choices in the plan. Record user confirmation before writing design files. Keep changes, commits and actual verification current before stopping or committing in batches.
3. Run a fresh-context independent review before asking the user to confirm a full discussion. Obtain separate confirmation before irreversible external actions.
4. Reopen the affected question if new semantics appear or evidence invalidates a premise; preserve unaffected decisions.

## Workflow

For a new checkout or handover, use `design-next` first. Resume a brief interruption from the current record.

1. **Open the discussion:** Create `record/discuss/NNNN-<topic>.md` from `assets/discussion.md` stating background, goal, exclusions, constraints and affected journeys or system scenarios. Ask only for material context only the user knows.
2. **Verify evidence:** Check current behavior and assumptions against journeys, models, ADRs, implementation and primary sources (put external research in `record/research/`). Separate facts, inferences and unknowns; for measurable assumptions, state when to verify and how to recover if disproved, and list each observation a later stage must make under `## Carry-forward` (`- <id> open — <observation>`) so implementation carries it to acceptance.
3. **Derive the target model** with `references/design-method.md`:
   - Pick a clear best option yourself and show its rationale and declined alternatives; tell the user promptly about choices that shape later decisions or externally visible behavior.
   - Ask independent questions together and base questions before dependent ones.
   - Keep interface contracts, data shapes and failure boundaries in the model; mark delegated internal implementation choices explicitly.
   - If discussion ends with no file changes, record the conclusion and close it.
4. **Draft the write-off plan:** Summarize what changes in the target model. Under `<!-- write-off-plan -->`, map each decision to its journey or model change (one file or section per row; include deferred or unchanged items as applicable), verification (`./check.sh` and manual checks) and actual result. Record the handoff on freeze.
5. **Run independent review:** Send `assets/review-brief.md` to a fresh-context read-only sub-agent (prefer a stronger model if available and record the choice). Verify each finding at the source, fix mechanical omissions, reopen only impacted decisions for new semantics, reopen for an alternative only if all three thresholds hold, and record reasons for declining other findings. Offer incremental review after reconsideration using the same brief with incremental scope.
6. **Confirm before writing:** Present the goal, target model (with a diagram when helpful), review conclusion, each agent decision, files to change, verification gaps, separate irreversible actions and implementation authorization on freeze. Ask design questions and confirmation separately, carrying forward explicit prior authorization. Record the confirmation excerpt, date, scope and conditions, mark agent choices confirmed, and set `pending-write-off`.
7. **Write off and freeze:** Apply the plan with `design-writing`. Run `./check.sh` and validate new or changed diagrams with the enabled integration (or disclose the gap). Record actual results and verification, replace `<!-- write-off-plan -->` with `<!-- write-off -->`, and set `completed`. Commit scoped design, discussion and consumed research with the discussion ID. Freezing hands off implementation, which can continue in the same session.

**Light path:** For one or two localized choices with a clear single impact area and no requested review, omit the plan and review and combine modeling with confirmation. Keep a header, brief goal, and per-question evidence, decision, decision maker, proposed change and actual result. Reconfirm if the user's choice alters the proposed edit. Use the full path when uncertain.

For toolkit problems, record the evidence and open the change in the toolkit repository. Versioned workspace copies are managed by upgrade or link.

## Working with the user

- The agent verifies accessible facts and proposes a recommendation and costs. The user decides genuine preference, priority or risk trade-offs, relevant unknowns only they know, contradictions with settled design, scope expansions and irreversible actions.
- Keep one independently revisable choice per question and label who decided or recommended it. Keep simple questions short and compare viable alternatives for complex ones.
- Keep a specified example or established convention set intact by default; ask about conflicts, answer user questions before resuming, and return disproved assumptions or contradictions with evidence.
- Favor simpler solutions, existing mechanisms and deferrals that preserve structure. Reserve mandatory rules for known failures, machine-consumed formats and authorization boundaries.

| File | When to use |
|---|---|
| [assets/discussion.md](assets/discussion.md) | Discussion header, markers, questions and write-off format. |
| [references/design-method.md](references/design-method.md) | Goal, journey-driven modeling and comparison. |
| [assets/review-brief.md](assets/review-brief.md) | Independent reviewer instructions. |
| [references/rare-cases.md](references/rare-cases.md) | Batches, pause and resumption, abort, changed scope and incoming reviews. |
