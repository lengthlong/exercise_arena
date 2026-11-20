---
name: design-research
description: Research an external subject and record the findings under record/research. Use for a repository, product, method, reference work or a deeper question from a prior note.
---

# design-research

Write a point-in-time account in `record/research/NNNN-<subject-and-question>.md` for discussion to consume. Load `design-writing` first.

## Rules

1. Lead with findings and structure. Collect key conclusions and primary references in Source locations, with commit and file or symbol for code, or link and observation date for websites. State access limits.
2. Prefer original code, specifications and direct observations. Name conflicts and follow primary evidence.
3. Put applicable unknowns in Unverified. Omit irrelevant sections.

## Workflow

1. Establish the subject, entry point, observation date and commit or version. Search earlier notes for relevant findings.
2. Read focused sources yourself. For large or independent subsystems, delegate read-only research in parallel using the briefs.
3. Answer a focused question in one pass. For broad exploration, first present an overview and proposed deeper questions. Expand selected questions under `## D1. <question>` and revise any overview claims superseded by evidence.
4. Draft from the note skeleton. Write the summary yourself, comparing with the workspace glossary and map. Verify material findings at the source, collect references and run `./check.sh`.
5. Send findings to discussion when they inform design. The note is committed and freezes with the discussion that consumes it. New evidence after freeze gets a new note identifying the older claims it supersedes.

| File | When to use |
|---|---|
| [assets/note.md](assets/note.md) | Research note skeleton. |
| [assets/briefs.md](assets/briefs.md) | Delegated read-only research briefs. |
