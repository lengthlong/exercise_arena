# Exercise Arena acceptance contract

Integrated slice acceptance verifies an identified candidate against journey success conditions, not merely helper tests. [0013](../../journey/0013-accept-integrated-slice.md) owns this goal; [deploy SPEC](../operate/deploy/SPEC.md) supplies test candidates and separately authorized delivery.

## Journeys served

- [User index](../../journey/USER.md): 0001-0010, including their success conditions and affected extensions.
- [Operator index](../../journey/OPERATOR.md): 0011 aligned evidence, 0013 acceptance, 0012 target delivery.
- Scope slices are owned by the initiating journey index, not duplicated here.

## Environments and substitutes

| Environment/dependency | Provision | Real or substitute / limit |
|---|---|---|
| Workspace structure | `./check.sh` | Real local checker; no runtime integration |
| Pure page logic | `node impl/logic.test.js impl/arena.html` | Real source helpers in VM; substitute for runtime only within named logic cases |
| Authorized test Artifact | Candidate identity, compatible host and account supplied via deploy contract | Real integration; environment/data scope must be established |
| Platform identity, db, assets, AI | Authorized test actors and permitted writes/uploads | Real when exercised; mocked/source inspection proves only its declared boundary |
| Production target | Separately authorized accepted-candidate delivery | Real post-publication checks; not an acceptance sandbox |

Absent credentials, compatible runtime or authorized test data means unverified, not passed. The current source/tests have not implemented/accepted the new set, protected-submission or stale-preview boundaries.

## Entries and coverage

The actual entry index is [verify/README.md](../../verify/README.md). Its present broad local-coverage wording and published-page walkthrough are incomplete for this contract; implementation must align scoped runtime entries before acceptance.

| Entry | Named coverage | Required evidence |
|---|---|---|
| Local consistency | Workspace structure/links and managed hash | Final checker exits 0 |
| Pure-logic regression | Existing tested ladder/judging, due/draw/grouping, assessment helpers, rewards/matches, defaults/retention and duplicate/material projections | Current logic suite exits 0; identify actual helper/case coverage |
| Access/settings integration | 0010 and 0006; S1/S11, C1/C9 | Identity versus owner, defaults versus read failure, current subscription generation, material readiness and failure outcomes |
| Recording/library integration | 0001 and 0007; S2-S4, C2-C3 | Upload/AI/confirmation, duplicate decisions, per-write outcomes, new ownership, legacy restrictions and preservation |
| Daily/check integration | 0002, 0003, 0008; S5-S7, C4-C6 | Batches, preview scope, actual attempts/markers/judgments, partial writes/restarts and truthful completeness |
| Progress/override integration | 0004, 0009; S8-S9, C5/C7 | Actor projections, own-only override, recalculation, missing details and scope limits |
| Match integration | 0005; S10, C8 | Eligible actors/stakes, saved start/result, offline entrants and failure spending |
| Retention integration | 0002/0004; S12, C9 | Exact 30-day boundary, current scope/actor, attempt survival and failed delete limits |
| Support/delivery evidence | 0011-0013 and owning contracts | Candidate/upstream records, actual entries/verdict, separate authority, target identity/checks and honest recovery limits |

Local functions do not run DOM handlers, registration/profiles, subscriptions, AI, uploads, actual db writes or publication. They cannot certify all journeys.

## Required changed-boundary cases

- New Daily/Exam paper creation initializes an empty marker map; existing absent-map legacy documents retain their inference. Then test a new modern daily paper: objective attempt saved, marker fails, reopen after no questions remain due; recovery stays visible and preserves the paper/saved judgment.
- Partial attempt writes, multiple protected papers, missing/deleted paper, untouched fresh replacement and all-written zero-saved-attempt limits.
- Handed-in mixed paper with pending written judgments; existing unjudged questions stay in denominator; empty/deleted-content papers are not mastery evidence.
- Existing A-set supplementary draft, including partially saved new sets, then owner switch B before save: reject incompatible new links.
- Preview check paper under A, switch B or lose referenced questions, then create: require re-preview, not B ownership with A references.
- Valid owned set members and complete empty membership versus incomplete/failed reads; only the proven cleanup branch can delete, otherwise retain/defer.
- Word-bank add/reorder/remove preserving every member answer; invalidating edit rejected with affected questions; stale unrelated edits do not overwrite unchanged bank fields.
- Ownerless single-owner-candidate, mixed-owner, memberless, invalid-owner and incomplete-membership legacy sets: readable practice/history, warning, blocked set mutation/new links/cleanup, no automatic owner persistence.
- Compatible unchanged legacy Exercise content/attempt writes remain allowed without set repair.
- Actor differs from content owner; own-only judgment correction and resulting ladder/reward/balance changes; missing supporting snapshots cannot prove match eligibility.

Pure/fake-data cases may support portions of these, but command/lifecycle acceptance requires actual authorized runtime evidence. Do not mark deferred concurrent integrity or unsaved written-answer recovery as passed.

## Sizing and verdicts

Select the smallest coverage spanning changed journeys/components, cross-root writes, compatibility and failure paths; preserve unaffected regression checks. Record candidate identity, upstream implementation rows, environment/substitutes, observations and passed/failed/unverified boundaries under `record/verify/`. Required incomplete coverage prevents an accepted verdict. A defect returns to implementation; a new design boundary returns to discussion.

## External writes and confirmation

- Test publication, db/asset changes and cleanup need named environment/data authorization; no production data is implicitly authorized.
- Production publication/restoration needs separate delivery authority and matching acceptance evidence.
- Field logs, credentials and child content stay outside the repo; records retain non-sensitive identity/coverage/verdict evidence.

## Changes without implementation records

None for runtime slice acceptance. A design-only write-off may verify local consistency/regression and hand off gaps, but does not itself establish integrated acceptance.
