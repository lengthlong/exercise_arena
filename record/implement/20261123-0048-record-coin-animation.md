# Recording-only coin pill and treasure-bowl save animation (0048)

> status: completed (2026-11-23)
> location: branch `develop`, commits `ba35aac..d8fe0e1`

## Upstream
<!-- upstream -->

- 0048 Q1 implemented
- 0048 Q2 implemented

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0001 Record exercises | Step 1 | Header pill "N from recording" = own recordings this week × 2 in the selected library; daily-redo coins excluded; explanation in hover title |
| 0001 Record exercises | Step 6 | Treasure bowl with dancing coins and "Saving i of n…" while saving. One coin per acknowledged new write flies into the pill (+2). Finale: burst, "+N coins" badge flies into the pill, pill glows. Nothing for edits or zero-coin saves. Reduced-motion fallback |
| S2, S3 | Record save | Animation runs beside the writes; it never gates or delays them |

## Implementation choices

- The animation lives on `document.body`, outside `#app`, so snapshot re-renders don't restart it. `S.recAnim` holds the pill value shown during a run; after the finale the pill returns to the derived value.
- The save loop doesn't await coin flights. The result line renders as soon as writes finish, and the finale waits for in-flight coins before bursting.
- The bowl is an inline SVG (gold bowl with ingots, square-holed coins and a red 福 band) behind rotating rays. Flying coins are CSS square-holed coins; the pill keeps the 🪙 icon.
- Reduced motion (`prefers-reduced-motion: reduce`): no dancing, flights, burst or rays. A static bowl and badge show, and the pill updates directly.
- Upstream cites 0048 questions rather than write-off rows. The frozen 0048 write-off table has an extra empty column (same formatting slip as 0047), so the checker indexes no rows.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: passed (no pure-logic change; the `recorded` count already had tests from 0047).
- `./check.sh`: passed.
- Manual preview on the local fake platform (scratchpad only):
  - pill 2 → 8 over a three-draft batch;
  - bowl and caption, coin flights, burst and badge all appear, and everything is removed afterwards;
  - with `prefers-reduced-motion` forced via a `matchMedia` override, a single-draft save showed no flying coins, a static bowl and badge, "Saved 1 · +2 coins" and the pill at 10.
- Not covered: the real platform, real phone rendering, and frame-rate on low-end devices.
