# Integration verify after 0048/0049 (prod-only baseline)

> status: completed (2026-11-23)
> location: branch `develop`
> scope: integration
> baseline: 7e5838d

## Upstream
<!-- upstream -->

- 20261123-0048-record-coin-animation
- 20261123-0049-gold-coin-line

## Scope and size

- Mode: `integration`, covering all unreleased work since release `95` (`3029329`) on candidate `02e2c5a`. The product tree matches `20261123-0048-record-coin-animation` (`d8fe0e1`). The only `impl/` change since release 95 is 0048.
- `verify/`-only commit `02e2c5a` updates the `record-coins-and-messages` case to the confirmed 0001 change (step 1 recording-only pill; step 6 bowl and finale):
  - the seed adds a daily-redo attempt so the pill must exclude redo coins;
  - it asserts the bowl or badge during the save and full clean-up afterwards;
  - Games now expects 8 earned (redo 2 + recording 6), and 4 after deleting `r1`, which removes both its recording and redo coins.
  - Oracle sanity check: the three changed assertions fail on the release 95 page (`3029329:impl/arena.html`) and pass on the candidate.
- Entries run:
  - `simulated-smoke` (`automated`, `on-touch`): all 5 cases passed on `02e2c5a`.
  - `live-spot-check` (`manual`): not run (prod-only; needs an authorized publication).

## Changes without implementation records

None (`UNRECORDED_PRODUCT_COMMITS=none`).

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | `0010` Arena opens into Today; a failed settings read shows an explicit error | pass | `simulated-smoke` `boot-and-read-failure` on `02e2c5a` |
| 2 | `0002`, `0009` Protected daily paper recovery, retry without duplicates, self-judge to Fully assessed with coins | pass | `simulated-smoke` `daily-paper-flow` |
| 3 | `0003`, `0004`, `0008`, `0009` Stale preview refused, new check paper unsubmitted, no coins on check review, override failure keeps the stored judgment | pass | `simulated-smoke` `check-paper-and-override` |
| 4 | `0001`, `0005`, `0006`, `0007` Set cleanup rules, owner-scoped Games balance, new match stores opener owner | pass | `simulated-smoke` `library-and-owner-scope` |
| 5 | `0001` step 1: the Record header shows only this week's coins from own recordings in the selected library, excluding daily-redo coins, legacy and others' recordings | pass | `record-coins-and-messages` on `7e5838d`: line "2 coins from recording this week" with a same-day redo coin, a legacy recording and another user's recording seeded |
| 6 | `0001` step 6: a save that earns coins shows the treasure bowl or its "+N coins" badge, reports "Saved 2 · +4 coins" with an amber remainder, and cleans up when done; the header then shows the new recording total | pass | `record-coins-and-messages`: `.bowl-wrap` present after Save all; notes `ok` and `warn`; `S.recAnim` cleared with no bowl or badge left; line "6 coins from recording this week" |
| 7 | `0001` success, `0004` step 3, `0005` step 1, `0007` success and 6a: saver recorded as Recorder; Games earned includes recording coins; edits keep the Recorder; deleting an own recording removes its coins | pass | `record-coins-and-messages`: `recordedBy: uS`; Games "8 earned", "3 recorded × 2"; `r3` keeps `uB`; `r2` gains none; after deleting `r1`, "4 earned" |
| 8 | `0001` step 6: transit coin flights, burst, badge flight into the pill and the reduced-motion fallback look and feel right | unverified | Not covered by an independent grader. The builder's local preview, including a forced reduced-motion run, is not acceptance evidence. Check during the post-publication `live-spot-check` |
| 9 | `0001`–`0010`, `0012` Real platform boundaries (identity, real `db` writes, real AI recognition, live runtime capabilities, phone rendering) | unverified | Prod-only workspace; `live-spot-check` not run |

## Substitutes and unverified boundaries

- **Substitute:** `verify/fake-platform-smoke.js` runs the unmodified `impl/arena.html` in local headless Chrome against an in-memory `db`/`user` fake and a fixed-output AI `sample` stub. It proves page behavior under `DATA.md` assumptions only.
- **Unverified (disclose before any `ONLINE` release):** `#8` animation look and feel, including reduced motion and phone; `#9` real platform boundaries.

## Carry-forward

- CF-1 open — After publication: on a phone, record one question and one batch, and watch the bowl, the coin flights, the burst and the badge landing in the pill. Then check the pill against Games ("recorded × 2"). With reduced motion on, confirm nothing flies. This covers `#8` and `#9`, and supersedes release 95 KI-1.

## Round notes

- Round 2 (2026-11-23): candidate moved to `7e5838d` to add `20261123-0049-gold-coin-line` (header pill → gold hand-written line).
  - `verify/` commit `7e5838d` updates the two header assertions to the new wording.
  - `simulated-smoke` passed 5 of 5 on `7e5838d`.
  - Judgments 5 and 6 were re-run with updated evidence; the others were re-run unchanged.
  - Judgment 8 (look and feel) now also covers the gold line; it is still `unverified`.
