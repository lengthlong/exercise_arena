# 0047 Recording coins and Record page status messages

> status: completed (2026-11-23)
> location: branch `develop`, baseline `ed21458` (`develop`)
> confirmation: "Confirm and implement" (2026-11-23), whole write-off plan with Q1–Q10 as decided; implementation authorized in this session; ONLINE publication not authorized.

## Background and goal

The user asked for two changes to the Record page (journey 0001):

1. Whoever records questions receives 2 coins for each question they record.
2. The Record page status messages are messy and need refining.

Today coins come only from daily redo attempts (Glossary Coin; DATA "金币"), are derived rather than stored, are weekly (Monday to today) and are scoped to the selected library. DATA deliberately has no persisted recorder field ("录入者是命令执行人，不新增持久录入者字段"), so the page cannot tell who recorded an exercise.

Affected: journey 0001 (record), 0004 (progress shows coins), 0005 (balance gates matches), 0007 (deleting an exercise), Glossary Coin/Balance, DOMAIN Coin and Balance, DATA exercises and 金币 rule, `model/arch/arena/SPEC.md` Record.

Non-goals: changing daily redo coin amounts, match stakes, or the Record page layout settled in 0036 beyond message text and placement.

## Target model

Coin gains a second source: **recording reward**. Each exercise document created this week in the selected library by the user, as stamped by a new `recordedBy` field written on create, gives that user 2 coins. Like attempt coins it is derived, not stored: deleting the exercise removes the reward (balance may go negative, as for overrides). Legacy exercises without `recordedBy` give nothing.

Record page status messages follow one small message model (see Q5/Q6).

## Decisions for the user

**Q1 Who earns the recording reward?** — Decision (user, 2026-11-23): A, the recorder.

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | The person who saved it (`recordedBy` = actor id) | New field in DATA; a parent recording into Sophia's library earns the coins, not Sophia |
| B | The library owner | No new field, but Sophia gets coins for work a parent did; the recorder sees no reward |

**Q2 What counts as "a question"?** — Decision (user, 2026-11-23): A, each new Exercise created by Record (edits never count).

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | Every acknowledged exercise write, including supplementary questions from saved material and members of a set; question sets themselves earn nothing | Simple; matches the per-draft save report |
| B | Only exercises with a real wrong answer (`wrongAnswer` non-empty) | Rewards actual mistakes only, but supplementary recording earns nothing |

**Q3 Is there a limit?** — Decision (user, 2026-11-23): A, no limit (agent had recommended B). Two coins per question, 10 coins enter a match: five quick recordings buy a match, and the duplicate check can be overridden by individual save.

| Option | Approach | Cost |
|---|---|---|
| A | No limit | Simple; relies on the adult to notice junk entries (deleting them removes the coins) |
| B (recommended) | Weekly cap, e.g. 20 coins (10 questions) | Bounds farming; one more rule to explain |
| C | Daily cap | Same, finer grained |

**Q4 What if a recorded exercise is deleted or edited?** (agent recommendation, see Agent decisions)

**Q8 Agent-written exercises** (reopened by review 2) — Decision (user, 2026-11-23): A, the commanding user's id. When an agent adds exercises with `ArtifactData` on a user's command: A (recommended) write the commanding user's id, so they earn like a page save; B omit `recordedBy`, no reward.

**Q9 Starboard tie-break** (reopened by review 4) — Decision (user, 2026-11-23): A, all coins. Ties on stars break by coins earned this week. A (recommended) include recording coins, one Coin meaning everywhere; B redo coins only, so recording cannot decide ties.

**Q5 What feels messy in the status messages?** — Decision (user, 2026-11-23): adopt all four rules of the proposed model (short one-line form, colour by outcome, hide diagnostics, clear stale lines). Inventory of the Record page messages today (`impl/arena.html` `renderRecord`, `recognise`, `recogniseMore`, `save-all`):

- Reading status line (`recMsg`) under the buttons: "Preparing photos…", "Uploading photos…", "Thinking… this usually takes about half a minute.", "Reading… N questions found so far", "Stopped. The photos and text are still here.", "Found N question sets and N drafts. Check each one before saving; the answers were read or worked out by AI. (upload 3 s · first text 5 s · total 31 s)", "No questions found. The photos and text are still here; adjust them and press Read with AI again. (…timing…)", "Not added: …".
- Save result line (`saveMsg`) beside Save all: "Saved N exercises. N possible duplicates left for you to check. N still incomplete; see the notes below." shown red whenever anything is left, even when some saved.
- Fixed notices: "Reading with AI is unavailable right now…", photo limit text, "n / max chosen", a debug "Photo log (N)" panel.
- Per-draft notes: duplicate (amber), error (red), word-pick (red).

Observed problems: diagnostic timing appended to user messages; debug photo log always visible once filled; long two-sentence messages; a partially successful save rendered as an error; the "Found…" message stays at the top after drafts move below; no consistent shape (state, count, next step).

Proposed message model (recommended):

| Element | Rule |
|---|---|
| One status per area | Reading status under the Read button; save result under Save all; per-draft notes on drafts. Only the save area may show two lines, for a mixed result |
| Short form | `<what happened> · <next step>` in one line, e.g. "Found 4 drafts · check each before saving", "Saved 3 · +6 coins", "Nothing found · adjust the photos or text and try again" |
| Colour by outcome | neutral for progress and cancel; green success; amber needs attention (duplicates, incomplete drafts, partial save, partial photo skip, nothing saved because all were duplicates); red only for failure with nothing done. Exact strings delegated to implementation within this rule |
| Mixed save | Split: green "Saved 3 · +6 coins" and amber "2 need checking below" |
| Diagnostics | No timing in user messages; timing and the Photo log sit behind a collapsed Diagnostics toggle in both sub-tabs (placement delegated to implementation) |
| Stale lines | Reading status clears when photos/text change or a save happens |
| Single save | Individual save reports like Save all ("Saved 1 · +2 coins"); an edit save reports no coins |

**Q10 Coin total and celebration on the Record page** — Decision (user, 2026-11-23): A, all coins earned this week. (Added by user, 2026-11-23: "at the top of the record page, show the total coins received this week. when receiving new coins, show a animation celebrating the new coins received.")

Which total: A (recommended) coins earned this week from all sources (the same "earned" figure as Games, selected library), so the number matches everywhere; B only coins from recording this week. The celebration plays on the Record page when a save earns coins ("+N" flying into the total); it never plays for edits or saves earning nothing, and with reduced motion it shows the "+N" without movement (agent choice, confirmed 2026-11-23).

## Write-off plan
<!-- write-off -->


| # | Question | Target | Change | Verification | Actual result and verification |
|---|---|---|---|---|---|
| 1 | Q1, Q4 | `DATA.md` header, exercises | Add `recordedBy` (actor id, self-asserted like attempt `by`); new writes set it, edits keep the stored value or its absence, legacy never gets the editor's id; agent-written exercises per Q8; drop "no recorder field" sentence | `./check.sh` || Done: header sentence replaced; `recordedBy` row; write rule "录入人只在新建时写"; `./check.sh` passed |
| 2 | Q1–Q4, Q9 | `DATA.md` 金币, 余额, 星榜 | Recording reward: 2 per exercise with `recordedBy` = user, `createdAt` this week, in scope; no cap; derived; deletion added as a cause of negative balance; tie-break per Q9 | `./check.sh` || Done: 录入金币 sentence in 金币; deletion in 余额; 星榜 notes recording coins count; `./check.sh` passed |
| 3 | Q1–Q4, Q9 | `model/domain/GLOSSARY.md` intro, Coin, Starboard; new term Recorder（录入人） | Coin has two sources; intro line; Starboard tie-break per Q9 | `./check.sh` || Done: intro, Coin with two sources, new Recorder（录入人）; Starboard unchanged (uses Coin); `./check.sh` passed |
| 4 | Q1, Q4 | `model/domain/DOMAIN.md` line 22, relations diagram, invariant 3, Coin and Balance row | Recorder provenance introduced; Exercise→User "recorded by"; edits preserve `recordedBy`; Coin row traces 0001, 0007 | `./check.sh` || Done: line 22, `recorded by` relation, legacy recorders, Coin row, invariant 3; `./check.sh` passed |
| 5 | Q1, Q5, Q10 | `journey/0001-record-a-wrong-exercise.md` | Step 1 also shows this week's coin total; step 6 reports saved count and coins (individual and batch) with a celebration when coins are earned; success condition adds reward | `./check.sh` || Done: success, diagram 1/6, steps 1/6, 6c, 7a, 7b, runtime trace C7; `./check.sh` passed |
| 6 | Q4 | `journey/0007-maintain-exercise-library.md` | Edits preserve `recordedBy`; deleting a this-week exercise removes the recorder's reward, whoever deletes | `./check.sh` || Done: success and 6a; `./check.sh` passed |
| 7 | Q1–Q4 | `journey/0004-review-progress.md` step 3 / 3b, `journey/0005-play-a-match.md` step 1 | Coins shown with a "recorded × 2" part; negative balance also from deletion | `./check.sh` || Done: 0004 step 3 and 3b; 0005 step 1; `./check.sh` passed |
| 8 | Q1–Q5, Q10 | `model/arch/arena/SPEC.md` C2 Record outcome, C3 Preservation, C7 coin source and negative causes | Record header shows weekly coin total per Q10; save reports coins with celebration (reduced-motion safe); edits keep `recordedBy`; coins from attempts and recordings; status message model | `./check.sh` || Done: C2 Outcome, Coins on Record, Status messages; C3 Preservation; C7 sources, negatives, journeys; `./check.sh` passed |
| 9 | Q1, Q4 | `model/arch/SCENARIO.md` S2/S3 write, S9 | New exercise write carries `recordedBy`; coins derived from attempts and recordings | `./check.sh` || Done: S2/S3 diagrams, S9 trace and note; `./check.sh` passed |

## Evidence

### E1 Coins are derived from attempts only

`DATA.md` 金币 and `impl/arena.html` `coinsFor` (line ~1310): coins sum `attemptCoins` over the actor's attempts this week in the selected scope; balance subtracts in-scope stakes. No coin store (`model/arch/arena/SPEC.md` "no persisted ladder, score or coin side store").

### E2 No recorder is persisted

`DATA.md` header: recorder is the command executor; no persistent recorder field. Exercises carry `owner`, `createdAt`, `recordedAt` only. Inference: crediting the recorder needs a new field; crediting the owner does not.

### E3 Record page messages

`impl/arena.html`: `renderRecord` (~2265–2325), `timingNote` (~3346), `recognise` (~3383), `recogniseMore` (~3490), `save-all` (~3098). Timing was added by 0031 to measure real `sample` speed; 0031 noted the numbers were still to be read.

## Agent decisions

**Q4 Deletion and editing** (confirmed 2026-11-23) The reward is derived from existing exercise documents, so deleting one removes its 2 coins and may make balance negative, consistent with override corrections (0009 5a). Editing never re-awards. Declined: a persisted grant ledger, which would add the first coin store and contradict E1.

**Q6 Week and scope** (confirmed 2026-11-23) Same as attempt coins: `createdAt` from this Monday to today, only exercises in the selected library. Declined: lifetime rewards, which would dwarf weekly redo coins.

**Q7 Test data** (confirmed 2026-11-23) Exercises with `test: true` earn the same as others, matching attempt coins.

## Independent review (2026-11-23)

Reviewer: fresh-context read-only Explore sub-agent on Opus (the strongest available). Verdict: reconsideration needed for Starboard tie-break and agent-written exercises; core model holds. Findings 1, 3, 4, 5 verified at source (`impl/arena.html` 3269-3276 edit path copies only `recordedAt`/`test`; `DOMAIN.md:22`; `GLOSSARY.md` Starboard; `renderGames` 2733-2736).

| Finding | Verification | Disposition |
|---|---|---|
| 1 Edits would drop `recordedBy` | Confirmed: edit `set()` rebuilds the doc | Row 1, 4, 6, 8 now require edits to preserve it |
| 2 Agent-written recorder undecided | DATA header: agents also write via `ArtifactData` | Reopened as Q8 |
| 3 DOMAIN/GLOSSARY text contradicting new provenance | Confirmed | Rows 3, 4 widened; Recorder term added |
| 4 Starboard tie-break uses weekly coins | Confirmed: `weekCoins` = `coinInfo().coins` | Reopened as Q9 |
| 5 Games breakdown would not sum | Confirmed | Row 7 added |
| 6 SPEC C7, SCENARIO, DATA 余额, 0004 3b restate sources | Confirmed by grep | Rows 2, 7, 8, 9 |
| 7 Q2 wording includes edits | Confirmed | Q2 reworded |
| 8 Individual save silent | Confirmed (`save-draft` clears messages) | Message model "Single save" row |
| 9 Two lines vs one per area | Confirmed | Rule now allows two lines in save area only |
| 10 Colour gaps | Accepted | Neutral class and amber cases added; strings delegated |
| 11 Diagnostics in saved mode | Accepted | Delegated placement, both sub-tabs |
| 12 "questions" vs Draft term | Accepted | Example uses "drafts" |
| 13 Deleting another's exercise | Accepted | Row 6 names the recorder as loser |

## Write-off verification (2026-11-23)

- `./check.sh` passed after all edits (notice only: toolkit v0.49.0 installed, workspace v0.48.0).
- Changed Mermaid diagrams (0001 sequence labels, DOMAIN class relation, SCENARIO S2/S3 labels) were not rendered: no Mermaid integration is enabled. Edits are label text and one relation line in existing syntax.
- Handoff: frozen rows 1–9 and the current model go to implementation (`impl/arena.html`, `impl/logic.test.js`).
