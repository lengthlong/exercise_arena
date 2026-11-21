# Acceptance record template

Copy this outline to `record/verify/YYYYMMDD-<topic>.md`. Set `> scope:` to `feature` (Feature Verify) or `integration` (Integration Verify)—required on all newly authored acceptance records. Use `in-progress`, `completed` or `aborted`: keep `in-progress` whenever any judgment is `fail`, and mark `completed` only with zero `fail`. Record the branch in `location` and the tested commit in `baseline`. Only `record/` may differ between the baseline and the record commit.

Unreleased acceptance records stay updatable in place across defect-fix or drift re-runs: keep the existing `YYYYMMDD-<topic>.md` filename (updating the `> status:` date) and preserve existing judgment row numbers (append new judgments at the end). Once any completed release covers the record's work (or on `aborted`), the record freezes permanently globally.

List covered implementation records by filename without extension. Number every user-perspective journey judgment; never list `./check.sh` or registered implementation tests as judgment rows. Implementation cites `<record-name> #k` in `## Upstream` only for separate, frozen or aborted acceptance records; for an `in-progress` acceptance record that will update in place, implementation logs the fixed `#k` in its round notes to keep upstream links acyclic.

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
- Entries run and journey steps walked through (including unaffected-journey regression for `integration`), with the basis for that size.
- History changes affecting ancestry of recorded implementation commits, if any.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|

List any non-exempt changes (scoped to the feature for `feature`, or since the last release for `integration`), or write None.

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | <User-perspective condition> | <pass, fail or unverified> | <Evidence> |

## Substitutes and unverified boundaries

- <List these (including prod-only boundaries when `model/verify/SPEC.md` declares no `OFFLINE` environment) or write None.>

## Round notes

- <Optional concise notes for unreleased rerun rounds.>
```
