# 0049 Softer Record coin header

> status: completed (2026-11-23)
> location: branch `develop`, baseline `e7dc134` (`develop`)
> confirmation: "Option B looks good. make the \"coins from recording this week\" gold." (2026-11-23); scope: Q1 change below; implementation in this session authorized; ONLINE publication not authorized.

Light path. Refines the header pill agreed in 0048 Q1.

## Q1 Header style

- **Request** (user, 2026-11-23): "refine the header on Record page, it looks too rigid now."
- **Evidence** Current page (`impl/arena.html`, `.rec-coins`): a flat amber pill with a bold Lexend number on its own row between the tab bar and the sub-tabs. The page already uses the hand-written font (`--font-hand`) for friendly figures, e.g. the stats under "Hi" on Today.
- **Options** (scratchpad demo shown to the user):
  - A: the count on the right end of the sub-tab row, with a hand-written number and a gently rocking coin; no extra row.
  - B: a borderless hand-written line under the tab bar, like Today's stats.
  - C: a small treasure bowl with a hand-written number on the right end of the sub-tab row; the save badge flies into it.
- **Decision** (user, 2026-11-23): B, with "coins from recording this week" in gold. Agent details (confirmed with the decision): the number is larger and also gold; the "· +2 for each question" hint stays muted; the coin rocks gently (still under reduced motion); the save badge lands on the number, which glows when it arrives.
- **Change** `model/arch/arena/SPEC.md` C2 Coins on Record: "short pill" becomes "a hand-written line". Journey 0001 is unchanged (it doesn't name the form).
- **Actual result** Write-off applied to SPEC C2; `./check.sh` passed.
