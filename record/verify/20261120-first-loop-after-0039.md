# First usable loop after the 0039 handoff

> status: completed (2026-11-20)
> location: branch `develop`
> baseline: 4eebc5b

## Upstream
<!-- upstream -->

- 20261120-record-chain-cutover
- 20261120-0039-paper-recovery-set-ownership

## Scope and size

- Decided slice: the first usable loop from the user journey index, covering user/0010 access, user/0001 recording and user/0002 daily redo. The behaviors changed by the 0039 handoff (user/0007 set edits and cleanup, user/0008 check-paper creation) are judged under the acceptance contract's required changed-boundary cases. Other goals are out of scope.
- Sizing basis: the entries paired with the changed steps in the implementation record, plus the slice's journey steps. Entries run: `./check.sh`, `node impl/logic.test.js impl/arena.html`, `node verify/fake-platform-smoke.js impl/arena.html`. No runtime walkthrough was run because no authorized test Artifact, test actors or test data exist.
- Baseline `4eebc5b`: its tree outside `record/` is identical to `9c2c90a`, the end of the 0039 implementation record (`git diff 9c2c90a HEAD -- . ':!record'` is empty). The cutover record's page code is unchanged between `1b9fcbf` and `f987efe`.
- History: no rewritten history. No delivery record exists, so the history since the first commit is in scope. Page changes before the cutover are accounted for by the legacy `落实 NNNN` convention that the cutover record names.
- Two throwaway probes were run against the fake platform to confirm gaps found by inspection (judgments 8 and 11). They are not registered entries and are not committed.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `e2e5626` | Workspace refine for v0.43.0: journeys, models, operate and verify READMEs; no change under `impl/` | Covered by the local consistency entry; no runtime coverage needed |
| `f987efe` | Design write-off of 0039; no change under `impl/` | Same; the contract says a design-only write-off needs local consistency evidence and a handoff only |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | Local consistency: workspace structure, links and managed hash | pass | `./check.sh` exit 0 on `4eebc5b` ("Checks passed") |
| 2 | Pure-logic regression for the declared helper coverage | pass | `node impl/logic.test.js impl/arena.html` exit 0, "all logic tests passed". This covers helpers only, not handlers or platform calls |
| 3 | user/0010 success: identity, database and scope are ready on the platform | unverified | No authorized test Artifact. The fake-platform smoke boots with a fake identity and db only (substitute) |
| 4 | user/0010 success: own settings and defaults are effective; a failed read is not shown as a ready, correct scope | unverified | Not run on a platform. By inspection the own-settings snapshot error callback is empty (`impl/arena.html`, `db.doc('settings/' + me).onSnapshot(..., () => {})`), so a failed read leaves the page on "Opening the exercise book…" and never reaches an unavailable message. Registration errors are also swallowed. Not probed |
| 5 | user/0001 success: each confirmed write belongs to the selected owner, appears in the library and starts the ladder due the next day | unverified | Recording, AI and uploads were not run on a platform. The smoke does not exercise a full recording save |
| 6 | user/0001 success: new set references obey same-owner membership | unverified | Substitutes only: logic assertions on the link check and the smoke's direct call of the page's link validation (legacy, other-owner and valid sets). The Record save sequence after an owner switch was not walked |
| 7 | user/0001 success: unsuccessful drafts stay distinguishable from recorded content | unverified | Not run; no platform write failures were injected |
| 8 | user/0001 extension 2a: when a saved set's ownership is unresolved, supplementation into it is blocked while its existing questions stay usable | fail | Probe against the fake platform: a legacy set with a member is listed in Record "From saved material", its card is enabled, selecting it succeeds, and no ownership warning is shown. The refusal only happens at save, after AI drafting. Route to implementation as `20261120-first-loop-after-0039 #8` |
| 9 | user/0002 success: no due items or protected submissions remain, every started batch is handed in and fully assessed, and a partial day is reported as such | unverified | The smoke showed recovery, Hand in writing the marker and saving the missing attempt, and "Fully assessed" on a fake db (substitute). Real db behavior and a multi-batch day were not run |
| 10 | user/0002 step 1 and extension 1a: protected submissions are listed even when no question is due | unverified | The smoke showed the "Unfinished hand-ins" entry on Today, but its seed still had due questions. The zero-due case was not run |
| 11 | user/0002 extension 2b: a protected paper whose referenced questions were deleted shows the missing content and the failed-recovery boundary | fail | Probe: a protected paper with two of three questions deleted opens recovery showing only the one remaining question; the page text says nothing about missing or deleted questions. Route to implementation as `20261120-first-loop-after-0039 #11` |
| 12 | user/0002 extension 5a and 6a: attempt, marker or judgment write failures stop at the failed write, report partial effects and allow retry of only the missing writes | unverified | No write failures were injected. The smoke covered only the successful path from a protected state |
| 13 | Changed boundary: new Daily and Exam papers start with an empty marker map, legacy absent-map papers keep inference, and a modern paper with a saved attempt and failed marker is recovered after no question is due | unverified | Logic assertions on the new marker and on legacy inference; smoke saw the created exam paper with `handedIn` of `{}`. A real marker failure and restart was not run |
| 14 | Changed boundary: partial attempt writes, multiple protected papers, a missing paper, untouched-draft replacement, and the all-written zero-attempt limit | unverified | Logic assertions cover selection of protected and replaceable papers and recovery state. Write failures, restarts and the missing-paper display were not run (see 11) |
| 15 | Changed boundary: a handed-in mixed paper with pending written judgments keeps them in the denominator; an empty paper is not mastery evidence | unverified | Logic assertions on the derived assessment. The on-screen wording on Today, review and paper detail was not walked |
| 16 | Changed boundary: an existing-set supplementary draft retained across an owner switch is rejected at save | unverified | Link validation was called directly in the smoke and in logic assertions. The UI sequence was not walked |
| 17 | Changed boundary: a check preview made under one owner then created under another requires re-preview | unverified | The smoke set the stale state directly, saw creation refused and then a fresh preview create a paper with `handedIn` of `{}`. The owner-reload path was not walked |
| 18 | Changed boundary: set cleanup deletes only for a valid owner and a proven empty membership, and retains otherwise | unverified | Smoke on the fake db: an owned set was deleted, a legacy set was kept with a notice, and a failed membership read kept the set with a notice. Whether the real platform accepts the `where('setId')` membership read is unknown |
| 19 | Changed boundary: word-bank edits keep every member answer, reject invalidating edits naming the questions, and never overwrite unchanged fields from a stale form | unverified | Smoke: a stale-form title edit left the changed bank, owner and subject intact; a removal that orphans an answer was rejected naming the question; a legacy set edit was refused. The blocked-when-membership-unreadable branch was not exercised |
| 20 | Changed boundary: legacy single-owner-candidate, mixed-owner, memberless, invalid-owner and incomplete cases stay readable and warned, with no automatic owner write | unverified | Logic assertions cover the legacy and conflict states only. The page has no candidate-owner inference (by design); readability and the warning were not walked beyond the Edit set note |
| 21 | Changed boundary: compatible unchanged legacy references allow Exercise content and attempt writes | unverified | Smoke called the link validation for an unchanged legacy reference on edit. No edit or attempt write was walked against a legacy set |
| 22 | Changed boundary: actor differs from owner, own-only judgment correction, and match eligibility needing supporting snapshots | unverified | Not run; no second actor or platform |

## Substitutes and unverified boundaries

- Substitutes: the fake in-memory platform smoke (a Chromium run against a mock db and identity) and VM-extracted helper tests. They prove only the declared boundary.
- Unverified: identity and registration, owner-scoped subscriptions and reload, the membership query, AI and photo recording, real write failures and restarts, retention timing, matches, concurrent writes, the published target and rollback. These need an authorized test Artifact, test actors and named test data.
- Defects routed to implementation: judgments 8 and 11. Observation for implementation: judgment 4 (a settings read failure never reaches an unavailable message); it was not run, so it is not a verdict.
- Verdict: the slice is not accepted. Two judgments failed and the runtime conditions are unverified, so delivery stays blocked.
