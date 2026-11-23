---
name: design-verify
description: Exclusively maintain verify/ and verify user-perspective slice behavior against journey success conditions in Feature Verify (scope: feature) or Integration Verify (scope: integration) mode using tiered graders, then record the result. Use after implementation, including before release or standalone ONLINE dark launch when matching integration evidence is missing.
---

# design-verify

Exclusively own `verify/` (`verify/SPEC.md`, `verify/README.md`, acceptance tools and rubrics) and run registered entries in one of two explicit modes—**Feature Verify (`scope: feature`)** or **Integration Verify (`scope: integration`)**—without adding a third regression mode. `verify/SPEC.md` holds stable acceptance policy (`OFFLINE` environments, substitutes, tiered-grader and cadence policy, oracle-integrity guard, external-write confirmations and exemptions); `verify/README.md` is the sole catalog of concrete entries, commands, tags (`journey/area`, `cost: automated | agent | manual`, `cadence: always | on-touch`, `default phase: feature | integration | both`) and `verify/` self-checks.

## Modes

- **Feature Verify (`scope: feature`):** checks a changed feature's user-facing functions against journey success conditions in a fast, isolated or simulated `OFFLINE` environment.
- **Integration Verify (`scope: integration`):** checks the whole release candidate across accumulated changes since the last release for that target, including unaffected-journey regression and applicable catalog entries in `verify/README.md` (`cost: automated` defaults to `always`, `cost: agent` and `cost: manual` default to `on-touch`, overridable per entry via `cadence`). If a prod-only workspace's `verify/SPEC.md` explicitly declares no `OFFLINE` environment exists, run applicable local/simulated entries and mark prod-only boundaries `unverified` (zero `fail`).
- **Simple or single-feature releases:** when one pass already covers Integration Verify requirements, skip a separate `scope: feature` pass and write one `> scope: integration` record.

## Rules

1. Never list `./check.sh`, `verify/` self-checks or registered `impl/` tests as acceptance judgment rows in `record/verify/`.
2. **Strict exclusive write boundary:** `design-verify` is the sole writer of `verify/` (`verify/SPEC.md`, `verify/README.md`, acceptance tools and rubrics) and `record/verify/`. Never modify `CLAUDE.md`, `journey/`, `model/`, `impl/` or `operate/`.
3. **Asymmetric oracle-integrity confirmation boundary when editing `verify/`:**
   - **Proceed directly** (no discussion bounce) when adding new cases derived from confirmed `journey/` success conditions, automating manual checks, or fixing bugs in `verify/` scripts/rubrics.
   - **Require explicit user confirmation right here in Step 2** (no discussion bounce) before making substantive policy edits to `verify/SPEC.md`, or before weakening/deleting existing acceptance cases, assertions or catalog tags (such as downgrading `always` → `on-touch` or `automated` → `agent`/`manual`) without a prior confirmed `journey/` change.
   - **Route to `design-discuss`** whenever a conflict or gap involves `journey/` success conditions or `model/operate/deploy/SPEC.md` release prerequisites.
4. **Area-scoped check after editing `verify/`:** Run `./check.sh` and any `verify/` self-checks registered in `verify/README.md`—**never rerun `impl/` tests** (and never count self-checks as acceptance verdicts). Commit passing `verify/` changes first, then record that commit as `> baseline:`.
5. Obtain separate user confirmation for steps that write external state, including `OFFLINE` environment deployment, real integrations, paid calls, shared environments or pushing records. Otherwise mark the boundary `unverified` and retain a local record.
6. **Three-tier execution, host-capability fallback and `fail`-only `in-progress`:**
   - Run `automated` first and **fail fast** before running `agent` or `manual` tiers.
   - Run touched `agent` entries by spawning a **fresh-context evaluator sub-agent** with `assets/evaluator-brief.md` inside an isolated `OFFLINE` environment (pass only `journey/` success conditions, the rubric and the `OFFLINE` workspace—never builder rationalizations). **Host-capability fallback:** if the host cannot spawn an independent fresh-context sub-agent, **never silently self-grade `pass` in the builder's session**; offer the user a `manual` spot-check or record `unverified` with the reason.
   - Run touched `manual` entries for human calibration, subjective spot-checks and real confirmation flows.
   - On any run (including `scope: integration`), the user may widen, narrow or skip specific cases; record unrun, simulated-only, stale or user-skipped cases as `unverified` with the reason (never `pass`). Keep `> status: in-progress` **only** when any judgment is `fail`; zero `fail` marks `completed`.

## Workflow

1. **Inspect pipeline state, verify product-tree match and select mode:**
   - Run `./check.sh --status` to inspect `RELEASE_BASE`, unreleased implementation records (including any `history-rewritten` flag), product-tree match on product paths, raw unrecorded product commits (discussion write-off commits taken over by an implementation record already count as covered), `[unverified]` details and existing acceptance records.
   - Confirm the baseline **tree on product paths** matches the `<end>` commit of a tested implementation record (per `--status`); route unmatched product trees to `design-implement` for a post-merge integration retest before investing in `verify/` edits.
   - Choose `scope: feature` or `scope: integration`, confirm the decided scope slice (or requested scenario/journey steps, noting undecided scope), and gather upstream implementation records (`feature`: selected feature record(s); `integration`: all unreleased implementation records since `RELEASE_BASE`). Under squash-merge workflows, run Feature Verify on the PR branch and Integration Verify after merge on the target/release branch.
   - Evaluate raw `UNRECORDED_PRODUCT_COMMITS` against `verify/SPEC.md` exemptions (`verify/`-only commits are logged in `## Scope and size` / `## Round notes` and covered by `> baseline:`):
     - In `scope: feature`, list and cover only unrecorded product changes affecting that feature's scope.
     - In `scope: integration`, list and cover all non-exempt unrecorded product commits since `RELEASE_BASE`.
2. **Maintain `verify/` (exclusive owner):**
   - Read upstream implementation records' `## Affected journey steps and scenarios`, the corresponding `journey/` success conditions, `verify/SPEC.md` and `verify/README.md`.
   - Maintain `verify/` if cases, rubrics, scripts, tags or `verify/SPEC.md` need updates—applying Rule 3 (asymmetric confirmation boundary) and Rule 4 (`./check.sh` + `verify/` self-checks only, never `impl/` tests). Commit passing `verify/` edits first so the working baseline includes them.
3. **Size the run from `verify/README.md`:**
   - In `scope: feature`, match upstream `## Affected journey steps and scenarios` and feature-scoped unrecorded product changes against `feature`/`both` entries in `verify/README.md`.
   - In `scope: integration`, apply catalog defaults across `integration`/`both` entries (`cost: automated` → `always`; `cost: agent` and `cost: manual` → `on-touch` for boundaries touched since `RELEASE_BASE`; explicit `cadence` overrides `cost` default), merged with all unreleased implementation records and non-exempt unrecorded product changes.
   Present the sizing plan so the user can widen, narrow or skip cases before execution.
4. **Prepare prerequisites and `OFFLINE` environment:** Trace environments, machines, credentials and dependencies to an operator journey, external responsibility or declared substitute. Stop on missing prerequisites unless the user explicitly skips the affected cases (`unverified` with reason). Use the `operate/deploy/` deploy entry to place the candidate in an `OFFLINE` environment as acceptance setup—never a release.
5. **Run entries in tier order:**
   - **Tier 1 (`automated`):** run deterministic code/outcome entries first; if a blocking automated entry fails, fail fast and skip expensive tiers unless the user asks to continue.
   - **Tier 2 (`agent`):** for each selected `agent` entry, dispatch a fresh-context evaluator sub-agent using `assets/evaluator-brief.md` against the isolated `OFFLINE` environment (applying Rule 6's host-capability fallback if unavailable).
   - **Tier 3 (`manual`):** conduct selected human spot-checks and confirmation walkthroughs.
6. **Judge, record and route:** Judge every numbered user-perspective success condition as `pass`, `fail` or `unverified` (citing concrete evidence or skip reason; never list `./check.sh`, `verify/` self-checks or `impl/` tests). Give every non-blocking advisory from evaluators or walkthroughs a status (`open`, `fixed`, `dropped by maintainer`) under `## Carry-forward` before setting `completed`, and report the result of each observation that upstream implementation records carry forward. Include required `> scope: feature` or `> scope: integration` using `assets/record.md`. Keep `> status: in-progress` **only** if any judgment is `fail`; set `completed` whenever zero `fail`. Commit on the acceptance branch:
   - On unreleased feedback-loop re-runs of the same slice or candidate, **update the existing acceptance record in place**: keep the `YYYYMMDD-<topic>.md` filename (updating the `> status:` date) and preserve existing judgment row numbers (append new judgments at the end), updating `> baseline:`, `## Upstream`, judgments, evidence and concise round notes. Records freeze permanently globally once any completed release covers their work (or on `aborted`).
   Report the mode, baseline, scope, rationale, substitutes and unverified/user-skipped boundaries. Fix `verify/`-only defects in Step 2 (commit new baseline, rerun and update in place), route product defects to `design-implement`, and route journey/deploy-contract gaps to `design-discuss`. If `scope: feature` completed with zero `fail`, proceed to Integration Verify (`scope: integration`) before release or standalone `ONLINE` dark launch; if `scope: integration` completed with zero `fail` and release is wanted, proceed to `design-release`. Otherwise take stock.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Acceptance record metadata (`scope`, `baseline`) and numbered judgments. |
| [assets/evaluator-brief.md](assets/evaluator-brief.md) | Fresh-context evaluator sub-agent instructions for `cost: agent` entries. |
