# Release record template

Copy this outline to `record/release/<version>[-<environment>][-<sequence>].md`. Omit the environment for a single target. Omit the first release's sequence and start retries at `-2`. Use `in-progress`, `completed` or `aborted` and freeze each release record when it ends. A completed release permanently freezes globally every covered `record/implement/` and `record/verify/` (both `feature` and `integration`) in the released candidate tree; an `aborted` release record freezes only itself so upstream records remain updatable for fixes before retry.

Record the target release branch (such as mainline or `release/*`) and candidate commit. Follow the deploy contract for when to commit the record on that branch—after verifying contracted pre-push results and before pushing or externally announcing. List one covered Integration Verify record name per line without its extension (`> scope: integration`, or legacy omitted `scope`; never `scope: feature` and no `waived:` syntax). Report post-commit push and external announcement verification separately in conversation.

```markdown
# <Version>

> status: completed (YYYY-MM-DD)
> location: branch `<branch>`, candidate `<commit>`

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

- <Evidence required by the deploy contract (e.g. ONLINE deploy, post-deploy live check, or dark-launch live-identity verification).>

## Steps omitted

- <Authorized steps omitted and why, or None.>
```
