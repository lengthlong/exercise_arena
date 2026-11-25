# 0006 The paper plan is agent-curated data in `db`

## Context

The user asked for a weekly plan of sgexam.com School papers, one per subject per week up to PSLE, with a reserve in case the weekly amount grows, and later for that plan to be shared by everyone while each person keeps their own history. The papers are chosen by ranking rules over an external listing that changes (new prelims each September, pages that move), and the same plan serves every user. The arena runs as one Claude Artifact page with a shared `db` ([ADR 0001](./0001-arena-runs-as-claude-artifact-with-db.md)), and an agent can read and write that `db` with the Artifact tools.

## Decision

Keep the plan as data: one shared `plans/<plan id>` and one `schoolPapers` document per paper, which an agent builds and re-plans on the user's request under the [plan contract](../operate/plan/SPEC.md). Each user's progress is a separate `paperMarks` document per paper, which the page writes for the actor only. The page never writes the plan or papers.

## Rationale

- The user chose agent-curated data over a catalogue in the page source, and then one shared plan with each person's own marks (discussions of 2026-11-25).
- Changing the plan (new PSLE date, more papers a week, a dead link) needs no release.
- Ranking web listings is better done by an agent that can read the site and show the result for confirmation than by page code that cannot fetch it.
- The write split keeps one writer for each document: a re-plan never touches a mark, and two users marking the same paper write different documents. The `db` has no atomic field update, so a marks map inside each paper would let concurrent writes overwrite each other.

## Cost

- Building or changing the plan needs the agent and a confirmed production write; the page cannot re-plan itself.
- Three new collections enter backups, the data contract and the gateway.
- A re-plan cannot move a paper of a past week, because some users may have done it and others not.
- Moving from the first per-user plan to the shared shape needed a one-time confirmed migration.
