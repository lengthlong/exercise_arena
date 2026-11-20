# Independent review brief

Fill the placeholders and send this to a fresh-context read-only reviewer. Supply the original request summary, discussion and read-only repository. Keep the conversation history out of the brief.

```markdown
Review the proposed design before write-off. Read only. Report in your final message and leave design decisions to the user.

- Workspace root: <path>
- Original user request: <one to three factual sentences with the goal and core constraints>
- Discussion: <workspace>/record/discuss/<file>
- Read the background and target model first, then the current choices on each question, the write-off plan and supporting evidence.
- For wording changes, read <workspace>/.agents/skills/design-writing/SKILL.md and its applicable references. Verify repository facts at the source.

## Substantive review

1. Check whether material facts change the problem or whether the target narrows or misses the original goal.
2. Walk affected journey steps, goals, users, operator roles and dependencies. Trace runtime steps to responsible containers, entry components, messages, entities, state, contexts, aggregates and glossary terms. Trace support steps to work group, operator and authority, environment, scope, entry, prerequisites and success, failure, stop, verification and recovery conditions. Check runtime scenario coverage. Trace support-only journeys to operation contracts and acceptance. Keep runtime services in the runtime model regardless of operator or schedule. Flag untraceable steps, unsupported dependencies, unknowns, prerequisites, exclusions and substitutes. For process reviews without journeys, compare goal and proposed changes directly.
3. Check that the plan contains design rows only, and that interfaces, data shapes and failure boundaries are sufficient for implementation. Identify delegated internal decisions. Provide testable counterexamples and their consequences.
4. Identify logical gaps or improvements. Reopen a decision for an alternative only if it directly serves this round's goal or problem, has a clear advantage and tolerable cost, and would materially change a decision. Identify cost uncertainty for the user when relevant.
5. Flag agent choices that need user input: a genuine trade-off, a fact only the user knows, conflict with an existing journey or ADR, wider scope, or irreversible action.

## Delivery checks

Check consistency with journeys, glossary, ADRs, models, workflow files and writing guidance, both sides of each map pair, terminology and references across the repository, exact behavior and numbers, checklist coverage, ability to pass ./check.sh and unresolved blockers. Verify that the plan reflects settled and explicitly provisional choices and that factual assumptions and fidelity checks are listed. Include local checker and map requirements: <applicable items or None>.

## Report

Start with Ready for confirmation or Reconsideration needed and one reason. In two to four sentences reconstruct the target model and say whether it holds, citing finding numbers for gaps. Number findings, leading with target-model findings. Give category, question or row or file and line, sourced evidence, distinct inference and proposed fix. Use mechanical (omission or typo), reconsideration (new semantics or a choice requiring the user), alternative (state whether all three thresholds hold) or detail (nonblocking). Group dimensions with no findings.
```

For incremental review, supply the prior disposition table, changed questions and plan rows. Limit the review to those changes and their affected journey steps and paths. Keep the report format.
