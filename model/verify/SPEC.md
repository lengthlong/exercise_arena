# Exercise Arena acceptance contract

Integrated slice acceptance verifies an identified candidate against journey success conditions, not merely helper tests. [0013](../../journey/0013-accept-integrated-slice.md) owns this goal; [deploy SPEC](../operate/deploy/SPEC.md) supplies the `OFFLINE` test candidate and the separately authorized release. [ADR 0005](../adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md) records why acceptance is tiered.

## Journeys served

- [User index](../../journey/USER.md): 0001-0010, including their success conditions and affected extensions.
- [Operator index](../../journey/OPERATOR.md): 0011 aligned evidence, 0013 acceptance, 0012 target release.
- Scope slices are owned by the initiating journey index, not duplicated here.

## Evidence tiers and substitutes

| Tier | Provision | Proves | Does not prove |
|---|---|---|---|
| Implementation-stage checks | `./check.sh` and `node impl/logic.test.js impl/arena.html`, run by implementation | Workspace consistency; pure page helpers | Not acceptance evidence; acceptance requires that the baseline tree matches an implementation record whose registered tests passed |
| Simulated runtime (declared substitute) | `verify/` entries drive the unmodified candidate page in a headless browser against an in-memory platform fake with fault injection | DOM handlers and write sequences against the `DATA.md` contract, including injected failures (write fails, owner or actor switch, document deleted mid-flow, delayed snapshot) | Real platform behavior; a call the fake models only by assumption is judged as page-side behavior only |
| Authorized runtime | Candidate on an authorized `OFFLINE` test Artifact with its own database and named test data, supplied via the deploy contract | Platform boundaries below | Production state |
| Production target | `ONLINE` release, separately authorized | Real post-release checks; not an acceptance sandbox | Acceptance |

Platform boundaries that only the authorized runtime can judge:

- Platform identity and first registration.
- Real db query, snapshot and permission behavior, including owner-scoped subscriptions and the membership read.
- Photo upload and AI recognition.
- Declared runtime contract and capabilities.
- Partial-write and marker-failure recovery observed on the real db.

Absent credentials, compatible runtime or authorized test data means unverified, not passed.

## Verdict rule

- A slice that is not a release candidate may be accepted on the page-side boundaries judged by the simulated runtime. Its record marks every platform boundary `unverified`.
- A release candidate needs authorized-runtime judgments of the same baseline before an accepted verdict that supports release. Evidence from another baseline is unverified.
- The authorized runtime runs once per release candidate, not per slice.

## Entries and coverage

The actual entry index is [verify/README.md](../../verify/README.md); it maps journey steps to entries and tiers. Entries are selected by the journey steps they cover.

| Coverage | Journeys and scenarios | Required evidence | Authorized runtime only |
|---|---|---|---|
| Access/settings | 0010 and 0006; S1/S11, C1/C9 | Identity versus owner, defaults versus read failure, current subscription generation, material readiness and failure outcomes | Real identity and registration; real subscription semantics |
| Recording/library | 0001 and 0007; S2-S4, C2-C3 | Upload/AI/confirmation, duplicate decisions, per-write outcomes, new ownership, legacy restrictions and preservation | Real upload and AI recognition; real membership read |
| Daily/check | 0002, 0003, 0008; S5-S7, C4-C6 | Batches, preview scope, actual attempts/markers/judgments, partial writes/restarts and truthful completeness | Recovery after a partial write on the real db |
| Progress/override | 0004, 0009; S8-S9, C5/C7 | Actor projections, own-only override, recalculation, missing details and scope limits | None beyond the shared platform boundaries |
| Match | 0005; S10, C8 | Eligible actors/stakes, saved start/result, offline entrants and failure spending | None beyond the shared platform boundaries |
| Retention | 0002/0004; S12, C9 | Exact 30-day boundary, current scope/actor, attempt survival and failed delete limits | Real delete behavior |
| Support/release evidence | 0011-0013 and owning contracts | Candidate/upstream records, actual entries/verdict, separate authority, target identity/checks and honest recovery limits | Identity of the `OFFLINE` target and candidate |

Implementation-stage checks and local functions do not run DOM handlers, registration/profiles, subscriptions, AI, uploads, actual db writes or publication.

## Boundary classes

Executable cases live in the `verify/` entries; each entry covers these classes.

- **Submission protection:** new Daily/Exam paper creation initializes an empty marker map, and absent-map legacy documents keep their inference. A saved objective attempt with a failed marker stays visible and recoverable after nothing is due. Partial attempt writes, multiple protected papers, missing or deleted papers, untouched fresh replacement and all-written zero-saved-attempt limits. A handed-in paper keeps unjudged questions in the denominator; empty or deleted-content papers are not mastery evidence.
- **Set ownership and membership:** a supplementary draft on a set from owner A is rejected for new links after the owner switches to B. Complete membership (including empty) versus incomplete or failed reads: only the proven cleanup branch deletes, otherwise retain or defer. Ownerless, mixed-owner, memberless, invalid-owner and incomplete-membership legacy sets stay readable with a warning, with set mutation, new links and cleanup blocked and no automatic owner persistence. Compatible unchanged legacy content and attempt writes remain allowed.
- **Stale preview:** a check paper previewed under A, then owner B or lost referenced questions, requires re-preview, never B ownership with A references.
- **Word bank:** add, reorder and remove preserve every member answer; an invalidating edit is rejected with the affected questions; a stale unrelated edit does not overwrite unchanged bank fields.
- **Actor versus owner:** own-only judgment correction with recalculated ladder, reward and balance; missing supporting snapshots cannot prove match eligibility.

Do not mark deferred concurrent integrity or unsaved written-answer recovery as passed.

## Sizing and verdicts

Select the entries covering the changed journey steps, cross-root writes, compatibility and failure paths; keep unaffected regression entries. A release candidate runs every simulated-runtime entry and the authorized runtime. Record candidate identity, upstream implementation records, environment and substitutes, observations and passed/failed/unverified boundaries under `record/verify/`. Required incomplete coverage prevents an accepted verdict. A defect returns to implementation; a new design boundary returns to discussion.

## External writes and confirmation

- Each authorized-runtime run needs named `OFFLINE` environment and test-data authorization, including db and asset writes and cleanup; no production data is implicitly authorized.
- Production release needs separate authority and matching acceptance evidence.
- Field logs, credentials and child content stay outside the repo; records retain non-sensitive identity/coverage/verdict evidence.

## Changes without implementation records

None for runtime slice acceptance. A design-only write-off may verify local consistency/regression and hand off gaps, but does not itself establish integrated acceptance.
