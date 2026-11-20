# Acceptance record template

Copy this outline to `record/verify/YYYYMMDD-<topic>.md`. Use `in-progress`, `completed` or `aborted`. Record the branch in `location` and the tested commit in `baseline`. Only `record/` may differ between the baseline and the record commit. Freeze on completion or abort and create a new record on retest.

List covered implementation records by filename without extension. Number every judgment. Implementation references a defect as `<record-name> #k`.

```markdown
# <Topic>

> status: completed (YYYY-MM-DD)
> location: branch `<branch>`
> baseline: <commit>

## Upstream
<!-- upstream -->

- 20261117-handoff-records
- 20261118-integration

## Scope and size

- Slice or requested journey steps and scenarios. Identify scope that has yet to be decided.
- Entries run and journey steps walked through, with the basis for that size.
- History changes affecting ancestry of recorded implementation commits, if any.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|

List any non-exempt changes, or write None.

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | <Condition> | <pass, fail or unverified> | <Evidence> |

## Substitutes and unverified boundaries

- <List these or write None.>
```
