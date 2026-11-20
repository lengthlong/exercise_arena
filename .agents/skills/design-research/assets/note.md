# Research note template

Copy the outline, number applicable sections from 1, and cite sections by name. Remove instructional quotes and unused sections, including open questions or follow-up when absent. Use the subject's own terms. Use workspace terms in the summary and terminology comparison. Include a Mermaid diagram in Structure and deployment and Domain model when those sections apply.

```markdown
# <Subject and question>

> **Observed:** <YYYY-MM-DD>. **Baseline:** <commit, version or —>.
> **Relationship to prior notes:** <Claims superseded or None>.
> **Consuming discussion:** <ID or —>.

## 0. Summary

<One sentence on the subject, goal and mechanism. Then give key findings with evidence and their relationship to this workspace: same, different, absent here or absent there. Keep to one screen.>

## 1. Purpose and boundary

<Problems solved, users and intentional exclusions.>

## N. Structure and deployment

<Mermaid diagram of relevant containers, storage, placement and connections. Add details the figure cannot show.>

## N. Domain model

<Mermaid diagram of core concepts, relationships and boundaries. List the subject's language and relevant lifecycles.>

## N. Key journeys

<One to three journeys relevant to actual users or operators. For each step record the actor, action, state change and observation. Diagram the main interaction in Mermaid.>

## N. Cross-cutting mechanisms

<Relevant identity, authorization, isolation, failure, recovery, versioning and observability.>

## N. Trade-offs and known issues

<Current choices and remaining pain.>

## N. Terminology comparison

| Subject term | Closest workspace term | Difference |
|---|---|---|

## N. Candidate follow-up questions

| # | Question | Reason and source section | Strength | Status |
|---|---|---|---|---|

## N. Unverified

<Material unknowns and access restrictions, one per line.>

# Part two: follow-up

## D1. <Question>

<Organize findings by question and identify any changed baseline.>

## Source locations

| Finding location | Primary source | Version or date and limits |
|---|---|---|
| <Section or Dn and finding> | <File and symbol or URL> | <Commit or observation date and uncertainty> |
```
