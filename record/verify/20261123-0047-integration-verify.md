# Integration verify after 0045/0046/0047 (prod-only baseline)

> status: completed (2026-11-23)
> location: branch `develop`
> scope: integration
> baseline: c863c35

## Upstream
<!-- upstream -->

- 20261122-0045-shrink-legacy-photos-tool
- 20261123-0046-simplify-deploy-runbook
- 20261123-0047-record-coins-status

## Scope and size

- Mode: `integration`, covering all unreleased work since release `94` (`7d34d81`) on candidate `c863c35`. The product tree matches `20261123-0047-record-coins-status` (`6c46db6`). The only `impl/` change since release `94` is 0047.
- `verify/`-only commit `c863c35`, covered by this baseline:
  - adds the `record-coins-and-messages` case from the success conditions of journey 0001 (steps 1 and 6, extension 6c), 0004 (step 3), 0005 (step 1) and 0007 (success condition, 6a);
  - adds an opt-in AI `sample` stub (`window.__sampleOut`) to the fake;
  - updates the `simulated-smoke` catalog row.
- Oracle sanity check on the new case: every one of its assertions fails against the pre-0047 page (`ed21458:impl/arena.html`) and passes on the candidate.
- Entries run:
  - `simulated-smoke` (`automated`, `on-touch`): touched by 0047; all 5 cases passed in about 18 s.
  - `live-spot-check` (`manual`, `on-touch`, `integration`): not run. The workspace is prod-only, so the touched real boundaries stay `unverified` until after a separately authorized publication.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `91cb20d` | `DATA.md` note on the completed `matches.owner` backfill; no runtime change | Exempt per `verify/SPEC.md` (design-only write-off); same treatment as `20261123-0046-integration-verify` |
| `6692327` | Initial local backup tool; no page behavior change | Exempt per `verify/SPEC.md` (backup tool verified by recover contract) |
| `66df996` | Design write-off of 0045; no page behavior change | Taken over by `20261122-0045-shrink-legacy-photos-tool`; exempt |
| `cb72168` | Mechanical toolkit upgrade and path moves; no page behavior change | Exempt per `verify/SPEC.md` (mechanical upgrade) |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | `0010` Arena opens cleanly into Today; a failed required settings read shows an explicit error | pass | `simulated-smoke` `boot-and-read-failure` on `c863c35` |
| 2 | `0002`, `0009` Protected daily paper recovers; a marker failure retries without duplicate attempts; self-judging reaches Fully assessed with coins | pass | `simulated-smoke` `daily-paper-flow` on `c863c35` |
| 3 | `0003`, `0004`, `0008`, `0009` Stale cross-owner preview refused; a new check paper starts unsubmitted; review shows no coins; override keeps the stored judgment after a write failure | pass | `simulated-smoke` `check-paper-and-override` on `c863c35` |
| 4 | `0001`, `0005`, `0006`, `0007` Owned set removed and legacy set kept on last-member delete; Games balance isolated by owner scope; new match stores opener owner | pass | `simulated-smoke` `library-and-owner-scope` on `c863c35` |
| 5 | `0001` step 1: Record shows this week's coins in the selected library; only own recordings count (not legacy or others') | pass | `record-coins-and-messages`: header "2 coins this week" with own, legacy and other-user recordings seeded |
| 6 | `0001` steps 3 and 6: reading reports one short green line with no timing; changing the input clears it | pass | `record-coins-and-messages`: "Found 3 drafts · …" with class `ok`, no timing; line removed after typing |
| 7 | `0001` step 6, extension 6c, success condition: a partial save reports a green "Saved 2 · +4 coins" and an amber remainder; a celebration shows; saved exercises name the saver as Recorder and stay in the selected owner's library; the total updates | pass | `record-coins-and-messages`: save area notes `ok` and `warn` with no `err`; `.coin-pop` "+4 coins"; both new exercises have `recordedBy: uS`, `owner: uS`; header "6 coins this week" |
| 8 | `0004` step 3, `0005` step 1: Games coins include recording coins with a recorded part | pass | `record-coins-and-messages`: Games "6 earned" and "3 recorded × 2" |
| 9 | `0007` success condition, 6a: edits keep the Recorder (a legacy exercise gains none); deleting an own recording this week removes its 2 coins | pass | `record-coins-and-messages`: edited `r3` keeps `recordedBy: uB`; edited `r2` has no `recordedBy`; after deleting `r1`, Games shows "4 earned" |
| 10 | `0001`–`0010`, `0012` Real platform boundaries: identity, real `db` writes of `recordedBy`, deletes, photo uploads, real AI recognition, live runtime capabilities | unverified | Prod-only workspace; `live-spot-check` not run; needs an authorized publication or ad-hoc test Artifact |
| 11 | `0001` step 6: the celebration looks right on a phone in the real Artifact wrapper, including with reduced motion | unverified | Not covered by an independent grader. The builder's local preview is not acceptance evidence. Check during the post-publication `live-spot-check` |

## Substitutes and unverified boundaries

- **Substitute:** `verify/fake-platform-smoke.js` runs the unmodified `impl/arena.html` in local headless Chrome against an in-memory `db`/`user` fake and a fixed-output AI `sample` stub. Passing judgments prove page behavior under `DATA.md` assumptions only.
- **Unverified (disclose before any `ONLINE` release):**
  - `#10`: real platform boundaries, including the first real `recordedBy` writes and real AI read messages.
  - `#11`: phone and reduced-motion presentation of the celebration in the real wrapper.

## Carry-forward

- CF-1 open — After publication, during `live-spot-check`: record one question on a phone and confirm the coin total, the "+2 coins" celebration and `recordedBy` on the saved document. This covers `#10` and `#11`.
