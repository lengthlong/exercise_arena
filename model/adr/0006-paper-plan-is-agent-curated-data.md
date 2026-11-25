# 0006 The paper plan is agent-curated data in `db`

## Context

The user asked for a weekly plan of sgexam.com School papers, one per subject per week up to PSLE, with a reserve in case the weekly amount grows. The papers are chosen by ranking rules over an external listing that changes (new prelims each September, pages that move), and the plan belongs to one person. The arena runs as one Claude Artifact page with a shared `db` ([ADR 0001](./0001-arena-runs-as-claude-artifact-with-db.md)), and an agent can read and write that `db` with the Artifact tools.

## Decision

Keep the plan as data: `plans/<user>` and one `schoolPapers` document per paper. An agent builds and re-plans them on the user's request under the [plan contract](../operate/plan/SPEC.md). The page only reads them and writes the done mark, score and total of the actor's own papers.

## Rationale

- The user chose agent-curated data over a catalogue in the page source (discussion of 2026-11-25).
- Changing the plan (new PSLE date, more papers a week, a dead link) needs no release.
- Ranking web listings is better done by an agent that can read the site and show the result for confirmation than by page code that cannot fetch it.
- The write split keeps one owner for each field, so a re-plan and a done mark set at the same time do not overwrite each other.

## Cost

- Building or changing the plan needs the agent and a confirmed production write; the page cannot re-plan itself.
- Two new collections enter backups, the data contract and the gateway.
- Plans for other users must be requested one by one.
