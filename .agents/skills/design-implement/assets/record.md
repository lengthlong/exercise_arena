# Implementation record template

Copy this outline to `record/implement/YYYYMMDD-<topic>.md`. Choose a distinct topic on a filename collision. Commit the implementation first. The recorded commit range excludes its start and includes its end. Freeze the record on completion or abort.

Use `in-progress`, `completed` or `aborted`. List one upstream item per line. Use a discussion design row or question, an acceptance judgment, or an implementation record name without extension for an integration record. Give every discussion reference an outcome. Use `not-implemented` with a reason. Keep upstream links only.

```markdown
# <Topic>

> status: completed (YYYY-MM-DD)
> location: branch `<branch>`, commits `<start>..<end>`

## Upstream
<!-- upstream -->

- 0049 #3 implemented
- 0049 #7 no-implementation
- 0049 #9 not-implemented Superseded by the current model.
- 20261110-web-e2e #2 corrected the defect

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|

## Implementation choices

- <List internal behavior decisions individually, or write None.>

## Tests and checks

- Registered tests and results
- `./check.sh` exit status
- Items outside verification coverage
```
