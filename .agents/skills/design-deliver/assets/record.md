# Delivery record template

Copy this outline to `record/deliver/<version>[-<environment>][-<sequence>].md`. Omit the environment for a single target. Omit the first delivery's sequence and start retries at `-2`. Use `in-progress`, `completed` or `aborted` and freeze each delivery record when it ends.

Record the mainline and merged candidate. Follow the delivery contract for when to commit the record on that mainline, after verifying delivery and before pushing. List one covered acceptance record name per line without its extension. Report push results separately in conversation.

```markdown
# <Version>

> status: completed (YYYY-MM-DD)
> location: mainline `<branch>`, candidate `<commit>`

## Upstream
<!-- upstream -->

- 20261118-release-walkthrough

## Delivery

- Version
- Target environment
- Scope authorized by the user

## Release notes

<Summary of user-visible or notable changes in this version, matching any tag or release announcement. Omit or write None if not applicable.>

## Verification

- <Evidence required by the delivery contract.>

## Steps omitted

- <Authorized steps omitted and why, or None.>
```
