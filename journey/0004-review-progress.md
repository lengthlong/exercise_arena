# 0004 Review my progress

- **Actor** User viewing their own practice outcomes.
- **Goal** Understand workload, mastery and weekly progress within the selected owner's library.
- **Trigger** The user wants to review practice or a completed paper.
- **Prerequisites** [0010](./0010-open-shared-arena.md); ready supporting snapshots.
- **Success** The user can distinguish due work, ladder distribution, recent activity, newly mastered exercises and rewards, and inspect available supporting details. This is a read-only goal.

```mermaid
sequenceDiagram
    actor U as User
    participant P as Exercise Arena page
    U->>P: 1. Inspect the selected library and actor scope
    P-->>U: 2. Show due work, ladders and recent activity
    P-->>U: 3. Show weekly progress, rewards and conditional forecast
    U->>P: 4. Open exercise or paper details
    U->>P: 5. Return to the overview
```

## Main success scenario

1. The user opens Today or Exercises and checks the selected content owner.
2. The user inspects their own due work, ladder distribution, streak and recent attempts on those exercises.
3. The user reviews weekly progress, newly mastered exercises, coins/balance and any conditional forecast.
4. The user opens available exercise history or paper details to understand an outcome.
5. The user returns to the overview without changing content or judgments.

## Extensions

- **1a. Owner scope changes.** Reload before showing new results. Selecting an owner does not impersonate that owner's attempts or ladder.
- **2a. There is no activity.** Show an empty state, not a loading/subscription failure disguised as zero progress.
- **3a. A forecast is shown.** It assumes on-time right answers; it is not a fixed assignment.
- **3b. A late correction or concurrent match spending affects balance.** Recompute from saved attempts/stakes; balance may be negative.
- **4a. Daily-paper retention or exercise deletion removed details.** Show their unavailability; attempts survive paper retention but not exercise deletion.
- **4b. Content needs correction.** Start [0007](./0007-maintain-exercise-library.md).
- **4c. An own judgment needs correction.** Start [0009](./0009-correct-own-judgment.md).

## Runtime trace

Progress reads Session/settings snapshots; it writes no aggregate. See [scenarios](../model/arch/SCENARIO.md) S9, [runtime contracts](../model/arch/arena/SPEC.md) C7 and [domain](../model/domain/DOMAIN.md). Detailed algorithms remain executable in the mapped source/tests.
