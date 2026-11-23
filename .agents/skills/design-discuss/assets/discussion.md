# Discussion template

Copy this outline to `record/discuss/NNNN-<topic>.md`. Delete unused sections. A light discussion uses the header and a level-two question heading for each question, with evidence, decision, decision maker, proposed change and actual result.

Use `in-progress`, `pending-write-off`, `completed` or `aborted`. Put structural markers directly after their level-two headings. Replace `<!-- write-off-plan -->` with `<!-- write-off -->` at final write-off. Keep the plan marker during batches. Record each user confirmation with an excerpt, date, scope and conditions before changing design files. In a discussion completed without edits, record why no confirmation was needed.

Keep the active decisions on their questions. Mark recommendations as pending, user choices and directions with their dates, and agent choices as effective upon confirmation, then confirmed. Update revised choices in place with the old choice and date. Mark superseded or moved questions with the destination ID. Use durable journey and model files for decisions and ADRs for trade-off rationale.

```markdown
# NNNN <Topic>

> status: in-progress (YYYY-MM-DD)
> location: branch `<branch>`, baseline `<commit>` (`<base branch>`)
> confirmation: "<excerpt>" (YYYY-MM-DD), <scope and conditions. Add after confirmation.>

## Background and goal

<Current situation, pain, people affected, success conditions, non-goals and constraints. Include only unfinished discussions on this topic as input.>

## Target model

<Summarize the important change. Include only affected journeys, domain, architecture, specifications and operation contracts. Identify old behavior and sources when replacing it. Diagram structural or interaction changes. State when the model stays as is.>

<User-visible changes that will follow from implementation, if any. Describe behavior here and record contracts in the model.>

## Decisions for the user

**Q1 <Question>**

<Evidence, inference and real alternatives. If there is no choice for the user, state why.>

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | | |
| B | | |

<Recommendation and reason.>

## Write-off plan
<!-- write-off-plan -->

<Journey and model changes only. Freezing hands these design rows and the current model to implementation.>

| # | Question | Target | Change | Verification | Actual result and verification |
|---|---|---|---|---|---|

## Evidence

### E1 <Fact>

<Source, facts, inference and basis, unknowns and impact. Identify any consumed research by path. It freezes with this discussion.>

## Carry-forward

- CF-1 open — <Optional: observation a later stage must make, such as measuring a disproved-if assumption. The first implementation record copies open items. Delete the section if none.>

## Agent decisions

**Q2 <Question>** (effective upon confirmation) <Decision, rationale and alternatives declined.>

## Independent review (date)

<Reviewer, model, whether a stronger model was available, verified conclusion and assessment of target model. Record verified findings and dispositions.>

| Finding | Verification | Disposition |
|---|---|---|
| 1 <mechanical, reconsideration, alternative or detail> | <Source and assessment> | <Row corrected, question reopened or reason to decline> |

### Incremental review (date)

<Same structure. Identify changed questions.>
```
