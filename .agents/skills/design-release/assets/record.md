# Release record template

Copy this outline to `record/release/<version>[-<environment>][-<sequence>].md`. Omit the environment for a single target. Omit the first release's sequence and start retries at `-2`. Use `in-progress`, `completed` or `aborted` and freeze each release record when it ends.

Record the mainline and merged candidate. Follow the deploy contract for when to commit the record on that mainline—after verifying contracted pre-push results and before pushing or externally announcing. List one covered acceptance record name per line without its extension. Report post-commit push and external announcement verification separately in conversation.

```markdown
# <Version>

> status: completed (YYYY-MM-DD)
> location: mainline `<branch>`, candidate `<commit>`

## Upstream
<!-- upstream -->

- 20261118-release-walkthrough

## Release

- Version
- Target environment / audience
- Scope authorized by the user
- Announcement / publication channel (if applicable)

## Release notes

<Summary of user-visible or notable changes in this version, matching any tag or release announcement. Omit or write None if not applicable.>

## Verification

- <Evidence required by the deploy contract (e.g. ONLINE deploy or dark-launch live-identity verification).>

## Steps omitted

- <Authorized steps omitted and why, or None.>
```
