# Acceptance record template

Copy this outline to `record/verify/YYYYMMDD-<topic>.md`. Set `> scope:` to `feature` (Feature Verify) or `integration` (Integration Verify)—required on all newly authored acceptance records. Use `in-progress`, `completed` or `aborted`: keep `in-progress` **only** whenever any judgment is `fail`, and mark `completed` whenever zero `fail` (even when some rows are `unverified` or user-skipped). Record the branch in `location` and the tested commit in `baseline` (after committing any `verify/` edits made in this round). Only `record/` may differ between `baseline` and the record commit.

Unreleased acceptance records stay updatable in place across defect-fix or drift re-runs: keep the existing `YYYYMMDD-<topic>.md` filename (updating the `> status:` date) and preserve existing judgment row numbers (append new judgments at the end). Once any completed release covers the record's work (or on `aborted`), the record freezes permanently globally.

Optionally add `## Carry-forward` for items this stage deliberately leaves to a later stage, one per line as `- <id> <status> — <description>` with an id unique in the record (such as `CF-1`) and status `open`, `fixed` or `dropped by maintainer`. Omit the section when there are none. Before marking `completed`, give every non-blocking advisory from evaluators or walkthroughs a status there, and report the result of each observation that upstream implementation records carry forward.

List covered implementation records by filename without extension. Number every user-perspective journey judgment; never list `./check.sh`, `verify/` self-checks or registered implementation tests as judgment rows. Implementation cites `<record-name> #k` in `## Upstream` only for separate, frozen or aborted acceptance records; for an `in-progress` acceptance record that will update in place, implementation logs the fixed `#k` in its round notes to keep upstream links acyclic.

```markdown
# <Topic>

> status: completed (YYYY-MM-DD)
> location: branch `<branch>`
> scope: integration
> baseline: <commit>

## Upstream
<!-- upstream -->

- 20261117-handoff-records
- 20261118-integration

## Scope and size

- Mode (`feature` or `integration`), slice or requested journey steps and scenarios. Identify scope that has yet to be decided.
- Entries run and journey steps walked through (including catalog defaults, any `verify/`-only commits made in this round, and any user-directed widening, narrowing or skipping with reason).
- History changes affecting ancestry of recorded implementation commits, if any.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|

List the non-exempt commits in `UNRECORDED_PRODUCT_COMMITS` from `./check.sh --status` (scoped to the feature for `feature`, or since the last release for `integration`), or write None. Discussion write-off commits taken over by an implementation record are already covered there.

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | <User-perspective condition> | <pass, fail or unverified> | <Evidence, or skip reason if unverified> |

## Substitutes and unverified boundaries

- <List substitutes, prod-only boundaries when `verify/SPEC.md` declares no `OFFLINE` environment, host-capability fallbacks, and user-skipped cases with reason, or write None.>

## Carry-forward

- CF-1 <open, fixed or dropped by maintainer> — <Optional: non-blocking advisory or observation result.>

## Round notes

- <Optional concise notes for unreleased rerun rounds.>
```
