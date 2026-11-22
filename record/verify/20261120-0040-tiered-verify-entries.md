# Tiered verify entries on the unchanged page

> status: completed (2026-11-20)
> location: branch `develop`
> baseline: 93ab062

## Upstream
<!-- upstream -->

- 20261120-0040-tiered-verify-entries

## Scope and size

- Slice: discussion 0040 (tiered acceptance). The candidate page `impl/arena.html` has sha256 `4032676d6977d45fcd03ef9b299fff0f80761925cffed18f0986ba9729ff44b5`, the same digest as the candidate of the latest release (version 92); nothing under `impl/` changed since that release. This is therefore an acceptance of the page's behavior with the new entries, not of a new page version, and it is not a release candidate. Scope beyond the slice is undecided: whether to also accept the journeys without a simulated case.
- Sizing basis: the paired entry (`verify/fake-platform-smoke.js`, changed and run in full, 15 cases) and its affected journey steps 0001, 0002, 0004, 0007, 0008, 0010; the entry's own tier contract (`model/verify/SPEC.md`); uncovered commits (below). Journeys 0003, 0005, 0006, 0009 and the progress projections of 0004 have no case and are judged unverified rather than sized in. The user may widen this.
- Environment: the simulated runtime only (headless Chromium in the cloud container, in-memory platform fake). No test Artifact was published, so the authorized runtime did not run: it needs separate authorization and is required only for a release candidate.
- Registered checks were re-run as a sanity check, not counted as acceptance evidence (SPEC): `./check.sh` with GNU awk 5.2.1 installed in this session, and `node impl/logic.test.js impl/arena.html`.
- History: the baseline contains one merge of parallel work from the remote (no rewritten history). The remote branches `main` and one other session branch are not part of the baseline and were not verified.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `20333c0` | Toolkit upgrade to v0.44.0 and layout migration (journeys renumbered, records renamed, managed skills and checker); no runtime change | Mechanical upgrade; covered by judgment 2 |
| `c64b7c7` | Design write-off of 0040 (SPEC, journey 0013, deploy and maintain contracts, ADR 0005); design only | Covered by judgment 2; contract consistency, no runtime scope |
| `e0c6598` | Merge of the remote's work into the local discussion commits; no content of its own | Covered by judgment 1 (tree identity) |
| `9daa07b`, `62ba420`, `16dfdcf`, latest release commit | Record files only | Exempt |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | Precondition: the baseline tree outside `record/` matches the end commit of an implementation record | pass | `git diff 719b41b 93ab062 -- . ':!record'` is empty; that commit ends the 0040 implementation record |
| 2 | Precondition: that implementation record's registered tests passed (`./check.sh` and the logic suite) | fail | `./check.sh` exits 1 with one error about the upstream line of the latest release record, existing on the remote before this slice; discussion 0040 Q6 option A left it as written. The logic suite exits 0 ("all logic tests passed"). Not a defect of this slice; it blocks an all-green precondition |
| 3 | 0002 step 2 and extension 2a: protected unfinished papers are shown and recovered, not replaced | pass | Simulated runtime, `daily-protected-recovery-and-handin`: Today lists "Unfinished hand-ins" and `1/2 saved`; start shows "Recovered: 1 answer already saved"; one paper remains |
| 4 | 0002 step 5: hand-in saves only the missing attempts, then the actor's marker | pass | Same case: marker written, existing attempt unchanged, one new attempt for the second question |
| 5 | 0002 extension 5a: a failed marker write keeps saved attempts, reports the failure, keeps the paper visible, and a retry writes only the marker | pass | Simulated runtime, `daily-marker-write-fails-then-recovers` (marker write failed by path filter): attempt saved, marker absent, error present on the run, Today shows `2/2 saved`, retry writes the marker, one attempt remains |
| 6 | 0002 extension 2b: a paper whose referenced question was deleted shows the missing content and still recovers the rest | pass | Simulated runtime, `daily-paper-with-deleted-question` |
| 7 | 0002 and 0004 extension 4a, 0002 retention: only daily papers handed in more than 30 days ago are deleted, attempts survive, a failed delete changes nothing | pass | Simulated runtime, `retention-prunes-only-old-handed-in-daily-papers` (31-day paper deleted; 30-day, 29-day, unsubmitted, another user's and check papers kept; attempts kept) and `retention-failed-delete-is-ignored` |
| 8 | 0002 success: every started batch is handed in and fully assessed; a partly done day is reported as such | unverified | No simulated case for self-judgment of written answers, judgment write failure, batch cap or day completeness; no authorized runtime |
| 9 | 0001 success and extension 6b: new set references obey same-owner membership; a conflicting link is rejected; unresolved legacy material cannot receive new links | pass | Simulated runtime, `set-link-validation` and `legacy-set-not-selectable-in-saved-material`. The link check calls the page's `draftLinkError` in the page context rather than saving through the UI |
| 10 | 0001 success: each confirmed write belongs to the selected owner, appears in the library and starts the ladder due next day; unsuccessful drafts stay distinguishable | unverified | No simulated case for the recording write path; upload and AI need the authorized runtime |
| 11 | 0007 success and extensions 4a, 4b, 5b, 6b: edits preserve owner, subject and unchanged bank fields; invalidating bank edits are rejected naming the questions; legacy sets cannot be edited; cleanup deletes only on proven complete membership | pass | Simulated runtime, `material-edit-keeps-bank-and-blocks-legacy` and `set-cleanup-uses-complete-membership` (owned set removed with its last member; legacy set kept with a notice; failed membership read keeps the set and says so) |
| 12 | 0007 extensions 5a and 6c: a failed edit write is reported; concurrent membership changes | unverified | No case for the edit write failure; concurrent integrity is deferred by design and not claimed |
| 13 | 0008 extension 5a: a preview from another owner or scope is refused and requires re-preview | pass | Simulated runtime, `check-paper-stale-preview-and-marker` |
| 14 | 0008 success: an acknowledged paper contains the confirmed available references; a new paper starts with an empty marker map | unverified | The marker map is asserted (`{}`); the case does not assert the paper's references or the failed-creation extension 5b |
| 15 | 0010 extensions 2a, 4a, 5a: absent identity or database shows unavailable, a failed own-settings or required read is not shown as ready or empty | pass | Simulated runtime, `identity-failure`, `read-failure-settings`, `read-failure-exercises` |
| 16 | 0010 extension 3a: a registration failure is reported while practice stays usable | pass | Simulated runtime, `registration-failure` |
| 17 | 0010 extensions 5a (old subscription generations discarded), 5b, 5c (legacy sets stay readable with a warning), 6a (AI or assets unavailable) | unverified | No simulated case; platform subscription behavior needs the authorized runtime |
| 18 | Write path: unavailable errors are retried once and land, other error codes fail at once without landing | pass | Simulated runtime, `write-path-retries-only-unavailable` |
| 19 | 0003 take a check paper, 0004 progress projections, 0005 match, 0006 settings, 0009 own-judgment override: success conditions | unverified | No simulated case and no authorized runtime for these journeys |
| 20 | Platform boundaries: real identity and registration, real db query and permission behavior (including the membership read), upload and AI, declared runtime contract, partial-write recovery on the real db | unverified | The authorized runtime did not run; it is not required for a slice that is not a release candidate and needs separate authorization |
| 21 | 0013: the record identifies the candidate, actual coverage, results and uncovered boundaries; an accepted verdict needs the required evidence | pass | This record states the digest, entries run, per-condition verdicts and unverified boundaries, and does not issue an accepted verdict for release |

Verdict: page-side behavior covered by the 15 simulated cases passes (judgments 3-7, 9, 11, 13, 15, 16, 18). The slice is not accepted for release: judgment 2 fails (existing checker error), and judgments 8, 10, 12, 14, 17, 19 and 20 are unverified. A release of this candidate would again rest on the same evidence gaps as the previous one, unless the missing cases and the authorized runtime are added.

## Substitutes and unverified boundaries

- The simulated runtime is a declared substitute (SPEC, ADR 0005): the real page against an in-memory platform fake with failure injection. Its passes prove page behavior against the data contract only. Several cases drive page internals directly (for example `draftLinkError`, `newSetDraft` and the click helper), not only user-visible UI.
- Unverified: judgments 8, 10, 12, 14, 17, 19 and 20 above. No authorized runtime ran, so every platform boundary is unverified, and earlier test-Artifact evidence for older candidates is stale and not carried over.
- Defect routed to implementation: none. The failing checker error is a known pre-existing condition returned to the toolkit (discussion 0040), not an implementation defect.
- Missing coverage to hand to implementation if wanted: simulated cases for judgments 8, 10, 12, 14, 17 and 19.
