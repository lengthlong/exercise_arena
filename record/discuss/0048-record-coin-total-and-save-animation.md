# 0048 Record coin total and save animation

> status: completed (2026-11-23)
> location: branch `develop`, baseline `3029329` (`develop`)
> confirmation: "Build it" (2026-11-23), after demo 3; scope: rows 1–3 with Q1 (recording-only, short header) and Q2 (bowl transit, burst, badge flying into the header pill); implementation in this session authorized; ONLINE publication not authorized.

Light path. It revises 0047 Q10 (header total, user decision 2026-11-23: "all coins this week") and refines the celebration that 0047 agreed.

## Background and goal

User request (2026-11-23): "when saving, show a transit animation. when saved, show a final animation. the final animation should be more fancy. And the 'x coins this week' should be the total coins earned by recording, not including the coins earned from daily papers."

Current behavior (release 95, `impl/arena.html` `renderRecord`, `celebrateCoins`):
- The header shows C7's earned figure: daily redo plus recording coins.
- After a save, one "+N coins" pill floats up in the middle of the screen and the header number bumps.
- Nothing moves while drafts are saving.

Affected: journey 0001 steps 1 and 6; `model/arch/arena/SPEC.md` C2 "Coins on Record". Coin, Balance, DATA and the Games and Starboard figures are unchanged.

## Q1 Header total

- **Evidence** `coinsFor` already returns `recorded` (count of own exercises recorded this week in scope); the recording coins are `recorded × 2`.
- **Decision** (user, 2026-11-23): show only coins earned by recording this week in the selected library. This revises 0047 Q10 A.
- **Header wording** (user, 2026-11-23: "make the header shorter"): "🪙 N from recording", with "this week, +2 per question" moved into the hover title. Confirmed 2026-11-23.
- **Proposed change** 0001 step 1; SPEC C2 Coins on Record.

## Q2 Save animation

- **Decision** (user, 2026-11-23): a transit animation while saving and a fancier final animation when saved.
- **Proposed model** (agent recommendation; pending confirmation):
  - **Transit, per acknowledged exercise write:**
    - A coin flies from the save button (or the draft being saved) to the header total.
    - On arrival, the total ticks up by 2.
    - The save button shows "Saving 2 of 3…" while the batch runs.
  - **Final, once the save finishes and it earned coins:**
    - A burst of coins and confetti from the header total.
    - A large "+N coins" badge with a shine sweep that settles and fades.
    - The header total glows.
    - About 2 s.
  - **No coins:** a save that earns nothing (edits; all failed or skipped) plays no animation.
  - **Reduced motion:** no flying or burst; the total updates and a static "+N coins" badge shows briefly.
  - **Delegated to implementation:** exact visuals, timing and colours.
- **Revision** (user, 2026-11-23, after the first demo): "While saving, show a '聚宝盆' with coins dancing out of it in the middle of the page."
- **Revised proposal** (agent; confirmed 2026-11-23 with demo 3):
  - **Transit:** a treasure bowl (聚宝盆) appears in the middle of the screen, with coins hopping out and falling back in. The caption reads "Saving 2 of 3…". For each acknowledged exercise write, one coin flies from the bowl to the header pill, which ticks up by 2.
  - **Final:** the bowl bursts (coins and confetti), then gives way to the "+N coins" badge with a shine sweep, and the header pill glows.
  - **Reduced motion:** the bowl and caption are static; nothing flies or bursts.
- **Revision** (user, 2026-11-23, after demo 2): "when saved, the big gold '+6 coins' badge moves from the middle to the header." The badge pops up where the bowl stood, holds briefly, then flies into the header pill and shrinks into it. The pill glows when the badge lands.
- **Proposed change** 0001 step 6; SPEC C2 Coins on Record.

## Write-off plan
<!-- write-off -->

| # | Question | Target | Change | Verification | Actual result and verification |
|---|---|---|---|---|---|
| 1 | Q1 | `journey/0001-record-a-wrong-exercise.md` step 1 | "coins they have earned by recording this week in that library" | `./check.sh` || Done: step 1 and diagram label; `./check.sh` passed |
| 2 | Q2 | `journey/0001-record-a-wrong-exercise.md` step 6 | Transit while saving, then a final celebration when coins were earned | `./check.sh` || Done: step 6 rewritten; `./check.sh` passed |
| 3 | Q1, Q2 | `model/arch/arena/SPEC.md` C2 Coins on Record | Recording-only total; transit per acknowledged write; final celebration; reduced-motion fallback; visuals delegated | `./check.sh` || Done: Coins on Record replaced; `./check.sh` passed |

## Write-off verification (2026-11-23)

- `./check.sh` passed. The changed Mermaid label in 0001 was not rendered (no Mermaid integration enabled); it is a label-text edit only.
- Handoff: rows 1–3 and the current model go to implementation (`impl/arena.html`). The demo used for confirmation lived in the scratchpad only.
