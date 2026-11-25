# Exercise Arena components

Logical responsibilities in one page; no required source split, new service or exclusive database writer. The only collections added are the PSLE plan's `plans` and `schoolPapers`, written mostly by the operator ([ADR 0006](../../adr/0006-paper-plan-is-agent-curated-data.md)).

```mermaid
flowchart TB
    U["User"]
    subgraph Arena["Exercise Arena page"]
        UI["Page UI/state<br/>Human entry"]
        Session["Session/settings<br/>Actor, owner and readiness"]
        Record["Record<br/>Input, AI and confirmation"]
        Library["Exercise library<br/>Content and own override"]
        Papers["Papers<br/>Prepare, submit, repair<br/>and PSLE plan"]
        Progress["Progress<br/>Read-only models"]
        Games["Games<br/>Start and round result"]
        G["Platform/data gateway<br/>Persistence and platform adapter"]
    end
    X["External platform"]
    U --> UI
    UI --> Session
    UI --> Record
    UI --> Library
    UI --> Papers
    UI --> Games
    UI -. Read .-> Progress
    Record -. Scope .-> Session
    Library -. Actor and membership .-> Session
    Papers -. Scope and attempts .-> Session
    Games -. Group .-> Session
    Record --> G
    Library --> G
    Papers --> G
    Games --> G
    Session --> G
    G --> X
    Progress -. Subscribed records .-> Session
    Papers -. Ladder and assessment .-> Progress
    Papers -. Record mistakes prefill .-> Record
    Games -. Balances and rankings .-> Progress
```

## Responsibilities

| Component | Entry/operations | Aggregate writes requested | State/read responsibility |
|---|---|---|---|
| Page UI/state | Decisions, navigation, confirmations and errors | None directly | Transient input, drafts, answers, previews/animation |
| Session/settings | Open/register, settings (including Questions per day), reload/readiness | User and own settings through gateway | Actor separate from owner; snapshots/generation; referenced legacy material; the actor's Paper plan and School papers |
| Record | New/saved input, uploads/AI, draft validation and saves; entry prefilled from a School paper | Set and Exercise through gateway | Draft scope, duplicates, partial-write outcomes, default Source label |
| Exercise library | Search/details, content/material edits/delete, own override | Exercise/Set through gateway | History preservation, bank/membership checks, conditional cleanup |
| Papers | Daily recovery, check creation, paper rows and the Paper page (taking, review, submit/judge, override), runtime retention; PSLE sub-tab (week × subject grid, done mark, score, undo, Record mistakes) | Paper and Exercise attempts through gateway; done mark, score and total of the actor's own School papers | Protected submissions, preview scope, acknowledgment versus assessment, one page for taking and reviewing |
| Progress | Ladder/due work, assessment, streak/mastery, rewards/rankings, Finish forecast and its weekly burndown, plan progress | None | Actor projections in selected scope |
| Games | Eligibility, stakes, start and automatic result | Match through gateway | Committed spending; animate after saved result |
| Platform/data gateway | Identity/profiles, db reads/writes, assets and sample | Sole logical persistence adapter for the page's writes to eight roots (Paper plan read-only) | Acknowledgment/failure, not transactions or automatic repair |

Coordinators validate actions and request gateway operations. Gateway snapshots update Session; components do not own competing persistent copies. Projection refresh is not a durable event bus.

## Collaboration and limits

- Papers owns partial-submission recovery and daily-paper retention through the gateway; neither is an operator cleanup service.
- New set links and check creation validate current owner scope. Existing compatible legacy references may survive ordinary content/attempt edits without automatic repair.
- Progress never writes a second ladder, score or coin store.
- [SPEC.md](./SPEC.md) owns runtime outcomes; [parent scenarios](../SCENARIO.md) map journey steps; DATA owns shapes/compatibility.
- Papers shows one Paper page per paper and one row meaning (Start or Review) in every list; Progress supplies its outcome block (C10).
- The PSLE sub-tab never creates, reschedules or deletes School papers; that is the operator's [plan contract](../../operate/plan/SPEC.md). Questions per day never reaches daily selection (C11, C7).
- Cache/helper/animation layout, tested draw/tie/duplicate algorithms and source modularization remain implementation choices.
- Current code has not implemented the new ownership/legacy, recovery or stale-preview boundaries. Strong concurrent integrity and complete unsaved written-answer recovery remain deferred.
