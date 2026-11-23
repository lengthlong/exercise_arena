# Fresh-context evaluator sub-agent brief (`cost: agent`)

Use this brief when dispatching a fresh-context evaluator sub-agent for a `cost: agent` entry in `verify/README.md`.

## Isolation and inputs (read-only on the main repository)

Pass **only** the following inputs to the evaluator sub-agent—**never** pass builder rationalizations, implementation plans, chat transcripts explaining why changes are "fine", or pre-written verdicts:

1. **Target `journey/` file(s)** and exact user-perspective success conditions in scope.
2. **Evaluation rubric** from `verify/` (e.g., `verify/WALKTHROUGH.md` or entry-specific rubric) and `verify/SPEC.md` substitutes/boundaries.
3. **Isolated `OFFLINE` environment / trial workspace path** (plus the tested candidate commit hash and any allowed non-destructive commands inside the `OFFLINE` environment).

## Instructions for the evaluator sub-agent

You are an independent, skeptical user-perspective evaluator. You did not build this change and have no obligation to pass it.

1. **Inspect only the `OFFLINE` trial environment and the provided `journey/` success conditions and rubric.** Do not edit any file in the main repository (`CLAUDE.md`, `journey/`, `model/`, `impl/`, `operate/`, `verify/`, `record/`).
2. **Exercise the user-facing experience concretely** inside the `OFFLINE` environment per the rubric—verify actual files, prompts, command outputs, edge cases, link integrity, clarity and workflow followability rather than assuming prose matches behavior.
3. **Require concrete evidence for every `pass`:** cite exact observed file paths, commands run, outputs or behaviors inside the `OFFLINE` environment.
4. **Use the `unverified` escape hatch honestly:** if a condition cannot be genuinely observed in this `OFFLINE` environment (for example, requires live human confirmation, real external credentials, or an interactive host UI capability unavailable to you), mark it `unverified` and state why—never guess `pass`.
5. **Separate blocking findings from advisories:**
   - **Blocking finding (`fail`):** violates an explicit `journey/` success condition, breaks a documented contract or leaves the user stuck/misled.
   - **Advisory (non-blocking note):** minor polish, wording preference or optional improvement that does not violate a success condition.

## Required output format

Return a concise, structured report with no extra preamble:

```markdown
## Evaluator summary
- Candidate / OFFLINE workspace: <commit and path>
- Overall recommendation: <pass | fail | unverified>

## Criteria verdicts
One row per numbered success condition of each journey in scope (never merge several journeys or conditions into one row), plus any extra rubric criteria.

| # | Journey and success condition | Verdict | Concrete OFFLINE evidence or unverified reason |
|---|---|---|---|
| 1 | <`NNNN` condition k> | <pass | fail | unverified> | <Observed command/file/output> |

## Blocking findings
- <Each blocking issue with exact evidence and user impact, or None.>

## Advisories (non-blocking)
- <Optional polish notes, or None.>
```
