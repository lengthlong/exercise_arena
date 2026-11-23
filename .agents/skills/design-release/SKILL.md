---
name: design-release
description: Release an accepted version to users under the workspace deploy contract and record the result. Use when deploying an accepted release candidate to an ONLINE environment and announcing a new version with release notes.
---

# design-release

Distinguish **deploy** (placing an artifact into an `OFFLINE` environment for QA/`verify/` or an `ONLINE` environment for live users) from **release** (announcing a new verified version of the solution to users with release notes). Use `model/operate/deploy/SPEC.md` and the deploy/release entry in the workspace map. The candidate is the commit on the target release branch (such as mainline or `release/*`) used for release. The user acts as a target-system operator and separately authorizes the release. Use Integration Verify records as input.

## Rules

1. Obtain explicit user authorization and its scope. Credentials, remotes and deployment capability confer no authorization.
2. Confirm irreversible actions individually with the user, including `ONLINE` deployment, migration, a push, a formal tag or external release announcement.
3. Write contract-defined outputs and the release record (`record/release/`). Route missing contracts to discussion and missing entries to implementation.
4. Return evidence gaps to acceptance—never waive acceptance (there is no `waived:` upstream syntax). A matching baseline and candidate have identical trees outside `record/`. Acceptance and registered implementation tests belong to their respective stages.
5. Standalone pre-announcement `ONLINE` dark launches follow the same Integration Verify (`scope: integration`, or legacy omitted `scope`) gate, and do not freeze upstream implementation or acceptance records until release completes.

## Workflow

1. **Verify authorization and Integration Verify coverage:** Confirm candidate, target release branch, target environment/audience, release notes and authorization scope. Run `./check.sh --status` to mechanically confirm:
   - At least one completed, zero-`fail` **Integration Verify** record (`> scope: integration` or legacy omitted `> scope:`; `> scope: feature` is ineligible) matches the candidate tree outside `record/` (`MATCHING_INTEGRATION_VERIFY != none`).
   - Every unreleased implementation record since `RELEASE_BASE` is covered (`UNCOVERED_IMPLEMENT_RECORDS=none`).
   - Zero unresolved `in-progress` implementation or acceptance records remain open (`OPEN_IMPLEMENT_OR_VERIFY_COUNT=0`; paused `in-progress` discussions under `design-discuss` do not block release).
   Confirm all non-exempt commits in `UNRECORDED_PRODUCT_COMMITS` have been accounted for in the acceptance record. If `model/operate/deploy/SPEC.md` explicitly names specific automated `pass` judgments as mandatory release prerequisites, verify those judgments are `pass` (routing missing prerequisites back to `design-verify`). Disclose every `unverified` judgment listed under `[unverified]` in `--status` (including prod-only boundaries when `verify/SPEC.md` declares no `OFFLINE` environment, host-capability fallbacks, and user-skipped cases) before `ONLINE` deploy; proceeding after the user's confirmation is their disposition. Gather known issues for this version: the previous completed release's still-open `## Known issues` plus still-`open` `## Carry-forward` items in covered records, minus items those records close. A merge that changes the tree outside `record/` requires matching evidence.
2. **Read the deploy contract and entry:** Review prerequisites, `ONLINE` environment placement, release announcement channel, verification (including post-deploy live verification for prod-only boundaries), recovery and record timing in `model/operate/deploy/SPEC.md`, then read the registered deploy/release entry and instructions. If the candidate was already dark-launched to `ONLINE` as an authorized routine operation, locate the contract's read-only live-identity check.
3. **Preflight and rehearse:** Run preflight and rehearsal per the deploy contract (including fast-forward lightweight preflight or full rehearsal when applicable—distinct from acceptance). Stop before real changes if either fails; resolve and retry.
4. **Execute authorized steps:** Confirm irreversible steps individually and run only authorized actions:
   - Deploy the candidate to `ONLINE` when applicable, or—if already dark-launched—run the contract's read-only live-identity check to verify the running `ONLINE` artifact matches the accepted candidate (stop if live identity cannot be verified).
   - Prepare or publish the version announcement and release notes per the contract.
   - Report the stopping point if confirmation covers only part of the flow.
5. **Verify, record and close:** Verify `ONLINE` availability and candidate identity against the deploy contract. Commit the release record (`record/release/<version>[-<environment>][-<sequence>].md`) on the target release branch or mainline at the contracted pre-push point (noting version, target environment/audience, location, applicable release notes, verification evidence including the preflight or rehearsal path the deploy contract ran and each disclosed `unverified` judgment with `disclosed at release confirmation`, cumulative `## Known issues` numbered `<version> KI-<n>`, and any authorized steps omitted). Completing the release freezes the release record and **permanently freezes globally** every covered `record/implement/` and `record/verify/` (both `scope: feature` and `scope: integration`) in the released candidate tree. Push and externally announce only with confirmation, reporting post-commit push/announcement verification in conversation without editing the frozen record. On failure, follow contract stop/recovery instructions, report completed actions and recovery commands, record `aborted` when appropriate—freezing only that `aborted` release record so upstream implementation and acceptance records remain updatable for fixes—and use a new numbered record (`-2`) for retries. Take stock after release.

*Legacy compatibility:* Older Chinese acceptance records, legacy acceptance records omitting `> scope:`, and frozen `record/deliver/` records in upgraded workspaces remain readable alongside structured records and `record/release/`.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Release record format. |
