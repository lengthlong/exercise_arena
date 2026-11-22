# Exercise Arena runtime contracts

Observable page commands and platform failure boundaries. [DATA.md](../../../DATA.md) is the sole owner of stored fields, writes, local dates/timestamps and legacy shapes. This SPEC does not duplicate data tables, taxonomy or helper algorithms. [COMPONENT.md](./COMPONENT.md) assigns responsibilities; [SCENARIO.md](../SCENARIO.md) assigns collaborations.

## Platform adapter boundary

| Facility | Page usage | Required evidence/failure boundary |
|---|---|---|
| user | Actor identity and on-demand profiles | Missing identity blocks ordinary use; unavailable names may fall back. Account eligibility/sharing remain external |
| db | Document/collection reads, subscriptions, writes and deletes | Distinguish acknowledged write, failed write and snapshot readiness. No assumed transaction, complete pagination or cross-device serialization |
| assets | Prepared photo upload and referenced asset display | Upload/read failure affects material or recording; prior uploaded assets may remain |
| sample | Draft material/questions from confirmed input | Untrusted output; upload/AI/parse/cancel stages are distinct |
| Knowledge maps/fonts | Optional references and presentation | Reference availability is not boot readiness; local font fallbacks remain |

The source header records its platform runtime declaration; this review does not establish the live platform version. Complete membership access must be demonstrated before enabling successful destructive branches.

## C1 Open and reload scope

- **Journeys / scenarios** 0010 1-6, 0006 4-5; S1.
- **Prerequisites** Platform sharing/access and an opaque actor ID; own settings read before owner-scoped subscriptions.
- **Outcome** User registration/default settings and required current-scope views support a usable page. Actor remains distinct from owner, creator, assignee and attempt author.
- **Reload** Cancel old subscription generation and clear/reload scoped views; stale results cannot populate the new scope. A failure is not an empty library.
- **Legacy material** Owner-scoped set selection must also resolve material referenced by existing legacy questions. Do not hide it merely for a missing owner; show the ownership warning and restrict commands per DATA.
- **Limits** Display-ready does not prove complete global membership. Registration/profile/AI/assets failures have distinct effects. A failed own-settings read is not a confirmed missing document.

## C2 Record confirmed drafts

- **Journeys / scenarios** 0001 1-7; S2-S3.
- **Prerequisites** Ready current owner scope, confirmed usable input/material and valid content/answers under DATA.
- **Outcome** Per-draft acknowledged Exercise writes and, where applicable, same-owner/subject set writes. New set ownership is valid; supplementation creates a member only in its owning library.
- **User decisions** AI drafts are untrusted. Duplicate warnings prompt decisions: batch saving skips warned drafts, individual saving is deliberate confirmation.
- **Partial effects** Prepare/upload assets, save new set, then save members. No atomicity; a saved asset/set may outlive a failed member save. Keep unsaved drafts/input retryable in-session, not a promised durable draft store.
- **Scope changes** Revalidate new/changed references at save, including partially saved new-set drafts. Reject retained A-set references being saved as B-owned questions; never silently share/copy/reassign.
- **Legacy exception** Ordinary Exercise edits may retain a compatible unchanged legacy reference, owner and subject under C3; this exception is not a new member or automatic ownership repair.
- **Cancel/failure** Report upload, AI, parse, validation and persistence results distinctly; only acknowledged exercises count as recorded.
- **Saved photo reads** Resolve referenced assets for supplementation, reporting unreadable/skipped images. Use available set text/remaining photos when possible; a photo-only independent group with no readable images stops before AI. Platform image-limit algorithms remain delegated, not copied here.

## C3 Edit/delete content and material

- **Journeys / scenarios** 0007 1-6; S4.
- **Preservation** Ordinary edits preserve content owner, creation timestamps and embedded attempts. Ownership transfer is not added. Usable text/photo material and subject/reference consistency remain valid.
- **Material/bank edits** Preserve set owner/subject and member history. Permit add/reorder/remove only when every member word-pick correct answer remains in the resulting bank; reject and identify affected questions otherwise. No automatic answer rewrite, rejudgment or ladder reset.
- **Evidence** Destructive bank changes require complete current same-owner membership and valid ownership; unavailable/uncertain evidence blocks the affected edit.
- **Stale forms** An unrelated title/material edit does not rewrite unchanged owner/subject/word-bank fields. Field-update mechanics are delegated within this boundary.
- **Delete** Exercise deletion removes every actor's embedded attempts; missing Paper references stay visible. After deletion/removal of a member, cleanup deletes only a valid set document whose complete current membership is proven empty. Otherwise retain/defer, reporting content success separately.
- **Legacy** Missing/conflicting set ownership blocks set mutation, new member links and automatic cleanup, not validated ordinary Exercise edits preserving compatible existing links or actor attempt writes.
- **Limits** The page performs no global orphan purge or asset deletion; only an authorized operator action under the [capacity contract](../../operate/capacity/SPEC.md) deletes assets. Concurrent member/word-bank edits may invalidate serial checks; the policy is not strong concurrent reference integrity.

## C4 Start/recover daily batches

- **Journeys / scenarios** 0002 1-4/7; S5.
- **Selection** Actor's due ladder in selected owner/subject scope, capped per batch by effective settings; not a per-day total cap.
- **Untouched drafts** Save the fresh batch with overlapping responses carried and an explicit initial unsubmitted marker state before removing superseded untouched drafts. DATA requires new-paper marker initialization; absent-marker legacy documents retain their original inference. Legacy mixed-subject papers remain readable but are not resumed.
- **Protected submission** Never replace/delete an unsubmitted daily paper containing persisted actor attempts. Today exposes recovery even with zero due questions.
- **Recovery** Reopen the most recent protected paper for a subject and expose additional protected papers. Restore already-saved responses/judgments; retry missing writes/marker before a new batch in that subject. Existing saved answers are not rejudged from an empty buffer.
- **Failure** Missing/deleted paper/questions are explicit; no paper reconstruction guarantee. A marker failure on an all-written paper with zero saved actor attempts does not grant otherwise untouched-draft restart protection.
- **Completion** A partially completed day is explicit. All started batches need complete assessment; no due count alone establishes this.

## C5 Submit, self-judge and override

- **Journeys / scenarios** 0002 5-7, 0003 4-6, 0009 1-5; S5/S7/S8.
- **Separate states** Draft response, persisted Attempt/Judgment, hand-in acknowledgment and full assessment are not interchangeable.
- **Submission** Save missing objective attempts, stop at first write failure, then save the actor marker. Retry skips already-saved actor/paper attempts and preserves saved judgments. Marker failure is partial submission, not a transaction rollback.
- **Written items** Save a written Attempt at self-judgment in the current session. Pending existing questions stay in the score denominator with no invented result. A handed-in paper may still be incomplete.
- **Full assessment** All remaining referenced questions have actor judgments. No remaining content is an empty/deleted-content case, not mastery evidence.
- **Override** Change only an existing own judgment, not another actor's or a missing Attempt. Acknowledged correction replays derived consequences, including later ladder/rewards; failed write leaves prior stored result authoritative. The Paper page (C10) offers it for every judged card.
- **Legacy references** Own attempt/judgment writes may preserve existing compatible legacy set references without material/owner repair.
- **Durability limits** Unsaved written-answer/check-draft cross-session recovery is deferred. Daily response clearing, modern/legacy marker meaning and one-submission rule remain in DATA.
- **Concurrency** Embedded arrays and per-actor marker maps can lose concurrent writes; the single logical gateway does not solve these distinct risks.

## C6 Prepare/take check papers

- **Journeys / scenarios** 0008 1-6, 0003 1-6; S6-S7.
- **Preparation** Preview actual available subject/topic pool, including mastered questions; insufficient pool reports actual count, empty pool cannot yield meaningful success.
- **Creation** Validate preview scope/generation and current owner-scoped references before writing; initialize new-paper submission state as required by DATA. Owner change or unavailable/out-of-scope references requires re-preview, not silent cross-owner creation.
- **Taking** Each actor takes once; C5 governs acknowledgment/assessment and retries. Check wrong resets ladder; right/partial does not advance it; no coins.
- **References** Mutable/deletable content, not immutable snapshots. Scores count remaining exercises, including pending judgments; missing references are visible.
- **Limits** No durable pre-submit check drafts or guaranteed cross-session unsaved written answers.

## C7 Read progress and rewards

- **Journeys / scenarios** 0004 1-5 and outcome reads in 0002, 0003, 0005, 0009; S9.
- **Inputs/outcomes** Actor-specific derivation in selected owner scope; not the owner's personal attempt history. Names do not determine identity.
- **Rules** GLOSSARY/DATA own meanings and derivation contracts; exact algorithms stay executable in mapped source/tests. Keep taxonomy IDs in TAX.
- **Failure/limits** Empty activity differs from failed supporting reads. Forecasts are conditional; local dates/week boundaries are device-local. Corrections and concurrent match starts may cause negative balances; retained attempts may have unavailable paper details.
- **Writes** None: no persisted ladder, score or coin side store.

## C8 Start/finish matches

- **Journeys / scenarios** 0005 1-6; S10.
- **Prerequisites** At least two eligible entrants in opener's Default-owner group, including opener; each can afford standard stake, opener also optional extra stake. Required group/balance snapshots must be ready.
- **Outcome** Save committed start/spending, compute one Lift round, save result before animation. Other entrants may be offline; extra stake is not guaranteed victory.
- **Failure** Start failure differs from saved-start/failed-result; committed stake stays spent. No refund/automatic result recovery is promised.
- **Limits** Derived balances cannot prevent simultaneous-device overspending. Sprint/Climb rules remain deferred.

## C9 Persist settings and retain papers

- **Journeys / scenarios** 0006 1-5; 0002/0004 affected by S12; S11-S12.
- **Settings** Write only actor settings with acknowledgment; DATA owns defaults/clamping. Reload owner scope through C1, including another-device changes. Nonempty ID is not automatic validation of a registered owner.
- **Retention** After required current views are ready, delete only eligible submitted daily Paper documents for that actor/current owner scope using DATA's exact age boundary. Attempts survive.
- **Failure** Settings failure is unsaved, not success. Retention deletes are best-effort; unavailable scope cannot authorize a global purge.
- **Boundary** Runtime cleanup is not deployment, maintenance or ownership-migration authorization.

## C10 Open and use a paper page

- **Journeys / scenarios** 0002 1/4-7, 0003 1-6, 0004 4-5, 0009 1-5; S5, S7-S9, S13.
- **One page** Every paper the actor opens is one Paper page for that paper and actor, Taking before the actor's hand-in and Reviewing after. Right after hand-in and re-opened later are the same Reviewing page; its content is derived from the actor's stored attempts plus unsaved results of the current session, never from a second store. Daily and Exam papers differ only by the outcome rules below.
- **Entry rows** A paper row means Start when the actor has not handed in and Review when they have, wherever it appears (Today Exam rows, Papers Exam and Daily lists). Daily rows group by day and omit the creation time, otherwise rows carry the same name, tags and score. Unsubmitted daily papers stay out of Papers lists; their entry is C4. Back returns to the origin view; Detail on a card opens the exercise history and its Back returns to the same card.
- **Taking** One card at a time with a question pager and Hand in. Hand-in, partial-write and retry follow C5; a recovered protected paper (C4) opens here with its saved answers and judgments and a note saying so. Leaving keeps a daily draft's responses and discards an Exam draft (C6).
- **Reviewing** One outcome block, one card per remaining question and one judgment control per card:
  - Outcome block: score as right over remaining questions; assessment status, either "Fully assessed" or "Handed in, not fully assessed: N to judge" (a paper with no remaining questions says nothing is left to assess); deleted questions are marked and leave the denominator. Daily papers add coins earned on this paper; every paper shows the ladder before and after, with a marker for the selected question and a caption of its own climb, where Exam papers show only wrong answers sending a question back to level 1 and no coins (C6). Pending written answers stay at their original level.
  - Card states: judged (response, correct answer, explanation, result), pending (written, handed in, no saved judgment), no answer (an existing question on a legacy paper with no attempt of the actor), deleted. Pending reads "Not judged yet", never "No answer".
  - Judgment control: a pending written answer whose response is still in the current session offers Right/Partial/Wrong, saved per C5; once judged, the card offers the Override of C5 in both the just-handed-in and the re-opened page. A pending question without its response cannot get a created attempt (0009 1b).
- **Derived, not stored** Score, status, ladder and coins are recomputed from attempts after every acknowledged write, including an override; no field is added to DATA.
- **Failure/limits** A missing paper or question is explicit. A failed judgment or override write leaves the prior stored result authoritative. Unsaved written responses and Exam drafts are not recovered across sessions.

## Baseline gaps and handoff

| Target boundary | Current source evidence | Downstream work |
|---|---|---|
| Protected daily restart and marker distinction | New Daily/Exam creation omits the marker map, so current absent-field fallback infers submission from saved attempts; a modern explicit empty map behaves differently | Initialize new-paper marker state, preserve absent-field legacy inference, then provide protected recovery and failure/restart tests |
| Stored set ownership/legacy restrictions | New-set save omits owner; cleanup/edit validation uses scoped members | Owned writes, compatible loading, strict new links, validated bank edits and retain/defer cleanup |
| Retained scope references | Supplementary drafts retain set references; check preview survives owner reload | Validate recording references and check preview scope at save/create |
| Assessment/readiness honesty | Hand-in helper is not completeness; required/supporting reads have distinct errors | Pending assessments and correct readiness/failure presentation and evidence |
| Paper page consistency | Baseline had separate taking and detail renderers: outcome, judgment control, pending wording and row actions differed by entry | Single Paper page and row behavior of C10, pure helpers for score, status and outcome, and page-level acceptance cases |

The current pure-logic suite does not exercise these DOM/platform commands. Implementation must update affected handlers/tests and actual operate/verify entries under a later handoff; acceptance must supply runtime evidence. Full written-answer recovery, ownership repair tools/migration and stronger concurrent integrity remain deferred. No production operation is authorized by this SPEC.
