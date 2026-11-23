# Recording coins, Record coin total and status messages (0047)

> status: completed (2026-11-23)
> location: branch `develop`, commits `2dc2ff8..6c46db6`

## Upstream
<!-- upstream -->

- 0047 #1 implemented
- 0047 #2 implemented
- 0047 #3 no-implementation
- 0047 #4 implemented
- 0047 #5 implemented
- 0047 #6 implemented
- 0047 #7 implemented
- 0047 #8 implemented
- 0047 #9 no-implementation

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|
| 0001 Record exercises | Steps 1, 6; extensions 3a, 6c, 7a, 7b | Header coin total; new exercises write `recordedBy`; batch and single saves report "Saved N · +2N coins" with celebration; mixed result green + amber; short reading messages; diagnostics collapsed. 7b (agent writes) has no page code: agents follow DATA |
| 0004 Review progress | Step 3, extension 3b | Coins include recording coins; deleting a recorded exercise lowers coins |
| 0005 Play a match | Step 1 | Games "Earned" breakdown adds "N recorded × 2"; balance includes recording coins |
| 0007 Maintain library | Success, 6a | Edits keep `recordedBy`; deletion removes the 2 coins (derived) |
| Starboard tie-break | Glossary Starboard | `weekCoins` now includes recording coins with no code change |
| S2, S3, S9 | Record writes, progress reads | `recordedBy` on create; coins derived from attempts and recordings |

## Implementation choices

- `saveSummary(saved, dups, left)` is a pure helper in the LOGIC block and returns one or two `{kind, text}` lines.
- The celebration is a fixed, viewport-centred "+N coins" pill appended to `body`, so re-renders after the save snapshot do not replay it. The header total gets a short bump. With `prefers-reduced-motion` the pill appears without movement for 1.8 s.
- Diagnostics reuse the existing photo log, renamed "Diagnostics" and collapsed by default, in both sub-tabs. Read timing goes there via `plog`.
- When an AI read fails with a specific reason, the message keeps that reason and adds "your photos and text are still here". An empty result says "No questions found · adjust the photos or text and try again".
- The reading status clears on typing in text or hint, adding or removing photos, picking material and switching sub-tab.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: passed. New assertions cover recording coins (own, others', legacy, last week, no cap, combined with attempt coins, negative balance) and `saveSummary` (all-saved, mixed, all duplicates, incomplete only, nothing).
- `./check.sh`: passed.
- `node verify/fake-platform-smoke.js impl/arena.html`: 4/4 passed. This is a regression run, not an acceptance verdict.
- Manual preview on a local fake platform (scratchpad only): checked the coin total (2 → 4 → 6), the "Found 3 drafts" line, "Saved 2 · +4 coins" with "1 incomplete below", the celebration with the header scrolled out of view, the Games breakdown "2 recorded × 2" and the failed-read wording.
- Not covered: the real platform (`recordedBy` writes via live `db`, real `sample` timing), a narrow phone viewport in the real Artifact wrapper, and screen-reader announcement of the coin total.
