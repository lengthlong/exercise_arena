# Implement 0039: paper recovery, set ownership validation, scoped previews

> status: completed (2026-11-20)
> location: branch `develop`, commits `f987efe..9c2c90a`

## Upstream
<!-- upstream -->

- 0039 #1 implemented
- 0039 #2 no-implementation
- 0039 #4 no-implementation
- 0039 #5 no-implementation
- 0039 #6 no-implementation
- 0039 #7 no-implementation
- 0039 #8 no-implementation
- 0039 #9 no-implementation
- 0039 #10 no-implementation
- 0039 #11 no-implementation
- 0039 #12 no-implementation
- 0039 #13 no-implementation
- 0039 #14 no-implementation
- 0039 #15 no-implementation
- 0039 #16 no-implementation
- 0039 #17 no-implementation
- 0039 #18 implemented
- 0039 #19 implemented
- 0039 #20 no-implementation
- 0039 #21 implemented
- 0039 #22 implemented
- 0039 #23 implemented
- 0039 #24 no-implementation

The plan's sub-rows 3a-3f (journey bodies user/0001-0006) are journey-only (no-implementation) and are not listed above: the checker accepts only integer row references and does not count lettered rows, so they cannot be referenced here.

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `./check.sh` | Affected; passes on the final tree | None |
| `node impl/logic.test.js impl/arena.html` | Changed: assertions for new-paper marker, protected and replaceable daily papers, recovery state, assessment completeness, preview check, set ownership, link check, cleanup decision, bank edit and set patch | user/0002 1-6, user/0003 4-6, user/0007 3-6, user/0008 5 |
| `verify/fake-platform-smoke.js` | Added (substitute, fake in-memory platform) | user/0002 1-5, user/0007 3-6, user/0008 5, user/0001 6 |
| `verify/README.md` | Changed: narrowed local coverage, substitute entry, unverified runtime list | operator/0003 |
| `operate/maintain/README.md`, `operate/deploy/README.md` | Changed: awk requirement, candidate identity and manual test and publish steps | operator/0001 4-5, operator/0003 3, operator/0002 1-5 |
| Published-page walkthrough | Not run (no authorized test Artifact or data) | All runtime steps |

## Implementation choices

- New Daily and Exam papers are created with `handedIn: {}`; documents without the field keep the legacy inference.
- Starting a batch for a subject with a protected paper reopens the newest one in the answer phase instead of creating a batch. Hand in then retries only the missing writes, and saved questions are never rejudged from the response buffer.
- Today lists every protected paper under "Unfinished hand-ins", independent of due count.
- Only unsubmitted daily papers with no saved actor attempt are replaced by a new batch.
- Hand-in versus full assessment is derived by `paperAssessment`, with no stored field. It is shown as a pending count on Today, in the review panel and in paper detail.
- New sets store `owner`; a link must be same owner and subject, and an unchanged existing link is exempt on edit. A partially saved new set remembers its stored owner for later member saves.
- The membership read is `collection('exercises').where('setId', '==', id).get()`. A missing method, rejection or error counts as unconfirmed.
- Last-member cleanup deletes only when the set has a valid owner, no visible member conflicts and a fresh read shows no other member. Otherwise the set is kept and a notice names why.
- A material edit writes only fields that changed against the form's base. Removing words triggers the membership read, and a failed read blocks the edit.
- Legacy and conflicting sets have no Edit set button and the handler refuses them.
- Check creation compares the preview owner to the current owner and re-checks every referenced question in the current library; it clears the preview on owner reload.
- The page's existing set subscription is not owner-scoped, so legacy material loading needed no change.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: exit 0, "all logic tests passed".
- `./check.sh`: exit 0. It first failed in this container because mawk cannot compile the checker's regex; installing gawk fixed the container only.
- `node verify/fake-platform-smoke.js impl/arena.html`: exit 0, "fake-platform smoke passed". This is a substitute against an in-memory fake platform, not integrated acceptance.
- Outside verification coverage:
  - Whether the real platform supports the `where('setId')` membership query is unknown. If it is rejected, every cleanup is kept and destructive bank edits are blocked.
  - Identity, registration, assets, AI, real db behavior, concurrent writes, retention timing, matches and publication were not exercised.
  - Existing production sets have no `owner`. After delivery, supplementation and material editing for them stay blocked until a separately authorized ownership repair. No repair tool was added.
  - Written-answer recovery across sessions, stronger concurrent integrity and repair or migration remain deferred.
  - Model sentences saying the current code has not implemented these boundaries (in DATA.md, the runtime SPEC, COMPONENT.md, DOMAIN.md and the acceptance SPEC) now lag the source. They were left unchanged because status wording in model files is outside implementation scope.
- Acceptance handoff: ready for operator/0003 once an authorized test Artifact and test data exist. Delivery needs matching acceptance evidence and separate authorization.
