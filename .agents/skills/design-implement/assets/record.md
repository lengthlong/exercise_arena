# Implementation record template

Copy this outline to `record/implement/YYYYMMDD-<topic>.md`. Choose a distinct topic on a filename collision. Commit the implementation first. The recorded commit range excludes its start and includes its end.

Use `in-progress`, `completed` or `aborted`. An unreleased implementation record stays updatable in place on same-feature re-runs when every intervening commit since the prior `<end>` is a non-product commit (product paths per the checker contract; `./check.sh --status` applies them) or part of the same feature: keep the existing `YYYYMMDD-<topic>.md` filename (update the `> status:` date) and `<start>`, advance `<end>`, and log defect fixes in `## Round notes` without adding circular `<verify-record> #k` upstream entries. Open a new record if unrelated product commits intervened, a fix spans multiple unreleased implementation records, or for a post-merge integration retest. Once any completed release covers the record's work (or on `aborted`), the record freezes permanently globally.

List one upstream item per line and keep upstream links strictly acyclic: a discussion design row or question, `maintenance: <basis>` for authorized maintenance without design rows (name the authorization and what is restored or applied), an affected prior implementation record name without extension (for integration retests or new records fixing an `in-progress` acceptance record that will update in place—note the fixed `<verify-record> #k` in `## Round notes`), or `<verify-record> #k` strictly for defects from a separate, frozen or aborted acceptance record. Give every discussion reference an outcome (`implemented`, `no-implementation`, or `not-implemented` with a reason). Keep upstream links only.

Optionally add `## Carry-forward` for items this stage deliberately leaves to a later stage, one per line as `- <id> <status> — <description>` with an id unique in the record (such as `CF-1`) and status `open`, `fixed` or `dropped by maintainer`. Omit the section when there are none. The first implementation record that takes over a discussion copies that discussion's still-`open` carry-forward items (observations to make) so acceptance can report them.

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
- maintenance: user request 2026-11-24 — restore the documented retry limit

## Affected journey steps and scenarios

| Journey or scenario | Steps / behaviors affected | Notes |
|---|---|---|

## Implementation choices

- <List internal behavior decisions individually, or write None.>

## Tests and checks

- Registered tests for the changed area and results
- `./check.sh` exit status
- Items outside verification coverage

## Carry-forward

- CF-1 open — <Optional: item left to a later stage, such as an observation copied from the discussion.>

## Round notes

- <Optional concise notes for unreleased defect-fix or rerun rounds, referencing any in-progress acceptance judgment fixed without circular upstream links.>
```
