# 0043 Simplify acceptance policy, catalog and test cases

> status: completed (2026-11-22)
> location: branch `develop`, baseline `a084de3` (`develop`)
> confirmation: "Q2=A (25→15 single-page-safe), Q4=A (require passing automated simulated-runtime checks before ONLINE release), Confirm 0043 (Q1–Q4, A2), write off design files, and implement handoff in this session" (2026-11-22), full write-off rows 1–5, agent decision A2, and same-session handoff implementation (`CLAUDE.md` map, `verify/README.md`, `operate/deploy/README.md`, `verify/fake-platform-smoke.js`; `impl/logic.test.js` untouched); external `OFFLINE`/`ONLINE` actions excluded.

## Background and goal

The workspace just upgraded to `discuss-design` v0.46.0 (`a084de3`). The v0.46.0 direction separates stable acceptance policy from the concrete case catalog, tags entries by `Cost` (`automated` | `manual`) and `Cadence` (`always` | `on-touch`), allows user-directed widening/narrowing/skipping with `fail`-only `in-progress`, and lets `design-verify` edit `verify/` directly within the settled contract.

Current friction in the workspace (evidence E1–E3):

- [model/verify/SPEC.md](../../model/verify/SPEC.md) still carries the pre-v0.46.0 structure: a detailed per-feature coverage table, a 5-item concrete boundary-class list, and a rigid verdict rule requiring all manual authorized-runtime checks per release ("required incomplete coverage prevents an accepted verdict"). That rule collided with reality in recent releases (see `record/verify/` and `record/release/`), forcing repeated waiver wording even with zero failures.
- [journey/0013-accept-integrated-slice.md](../../journey/0013-accept-integrated-slice.md), [journey/0012-publish-artifact.md](../../journey/0012-publish-artifact.md), [model/operate/deploy/SPEC.md](../../model/operate/deploy/SPEC.md) and [ADR 0005](../../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md) still assume every release candidate requires the authorized runtime, block acceptance on incomplete coverage, and omit `unverified` boundary disclosure and any explicit automated release-prerequisite rule.
- [verify/README.md](../../verify/README.md) duplicates every case name from [verify/fake-platform-smoke.js](../../verify/fake-platform-smoke.js) (25 micro-cases) alongside a 7-step manual walkthrough, without v0.46.0's `Cost` / `Cadence` / `Default phase` tags. [CLAUDE.md](../../CLAUDE.md) still maps two `verify/` rows instead of a single `verify/` directory pointer.
- [verify/fake-platform-smoke.js](../../verify/fake-platform-smoke.js) has grown to 415 lines and 25 cases through incremental slice additions, including 10 Paper-page cases with direct overlap (`paper-page-override-and-detail-back` duplicates real-click cases) and a standalone retry test (`write-path-retries-only-unavailable`) whose pure retry logic is already tested in [impl/logic.test.js](../../impl/logic.test.js).
- [impl/logic.test.js](../../impl/logic.test.js) (926 lines) runs in `< 1s` with zero external dependencies and serves as the executable algorithm spec for 94 unique pure functions.

Goal: align the workspace's acceptance contract, catalog and test suites with `discuss-design` v0.46.0 so acceptance is low-friction, honest about unverified boundaries, and free of redundant test cases.

Non-goals: changing runtime behavior of `impl/arena.html`, weakening journey success conditions for user journeys 0001–0010, or performing external `OFFLINE`/`ONLINE` Artifact operations.

Affected journeys: 0013 (acceptance), 0011 (maintain), 0012 (release); user journeys 0001–0010 as coverage targets.

## Target model

1. **Stable policy only in [model/verify/SPEC.md](../../model/verify/SPEC.md):** keep journeys served, environments and substitutes (simulated runtime, authorized `OFFLINE` test Artifact, `ONLINE` production), **Phase and cadence policy** (`verify/README.md` as sole catalog; `cost: automated` defaults to `always` on `integration` and affected subset on `feature`; `cost: manual` defaults to `on-touch`; user-directed widening/narrowing/skipping marked `unverified` with reason; only `fail` keeps `record/verify/` `in-progress`), external-write confirmations, and exemptions (including `verify/`-only commits). Because all 8 logical components live in single-file `impl/arena.html` (`model/arch/arena/COMPONENT.md`), define **component/capability-level `on-touch` rules** in `## Sizing by change` (not file-path diffing):
   - `Session/settings` (`boot()`, identity/registration, owner-scoped subscriptions) → manual group 1 (identity/registration & owner switch).
   - `Platform/data gateway` or `db` write/delete/membership-query paths in `Papers`, `Exercise library`, or `Record` → manual group 2 (real db writes/cleanup/retention).
   - `Record` `assets` / `sample` paths → manual group 3 (photo upload & AI recognition).
   - Source header runtime contract / capabilities declaration or target contract pin → manual group 4 (runtime contract & capabilities).
   - Pure UI, layout, or derived-projection changes reusing unchanged write/query paths → simulated runtime only (manual groups untouched).
   Remove concrete case lists, per-slice micro-feature prose, and the old incomplete-coverage blocker.
2. **Sole tagged catalog in [verify/README.md](../../verify/README.md):** use the v0.46.0 catalog table (`Entry | Journey / area | Cost | Cadence | Default phase | Command / instructions`):
   - Automated simulated runtime (`verify/fake-platform-smoke.js`): `Cost: automated`, `Cadence: always`, `Default phase: both` (affected `--journeys` on `feature`, full suite on `integration`). Point to `--list` instead of mirroring individual case names.
   - Manual authorized-runtime walkthrough on `OFFLINE` test Artifact: 4 platform-boundary groups (matching the `on-touch` rules above), each tagged `Cost: manual`, `Cadence: on-touch`, `Default phase: integration`.
   - Keep a short "Known gaps (no automated case yet)" note below the catalog table preserving visibility of uncovered areas (`0005`, `0006`, `0004` progress projections, multiple protected papers, owner switch before save, 375px layout, photo/material toggles, check-paper partial-write failures).
3. **Aligned journeys, deploy contract, ADR and guide map:**
   - [journey/0013-accept-integrated-slice.md](../../journey/0013-accept-integrated-slice.md): update `Success`, Mermaid diagram step 3, Steps 2–5 (distinguishing `scope: feature` vs `scope: integration`, sizing from `verify/README.md`, user-directed widening/narrowing/skipping, establishing authorized `OFFLINE` only when touched `on-touch` manual boundaries are in scope), and Extensions 3a/5a (3a: stop on missing prerequisites unless the user explicitly skips and records `unverified` with reason, never substituting production upload; 5a: only `fail` keeps `record/verify/` `in-progress`; completed `scope: integration` with disclosed `unverified` boundaries may proceed to `0012`).
   - [journey/0012-publish-artifact.md](../../journey/0012-publish-artifact.md): update Steps 1–2 to require disclosing all `unverified` boundaries from `0013` before explicit publication authorization (and honoring any mandatory automated release prerequisite set in `model/operate/deploy/SPEC.md`).
   - [model/operate/deploy/SPEC.md](../../model/operate/deploy/SPEC.md): update "Supply an acceptance candidate" to `on-touch` manual cadence, and update "Publish an accepted page" with `unverified` boundary disclosure and the Q4 decision on whether passing automated simulated-runtime checks is a mandatory release prerequisite.
   - [ADR 0005](../../model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md): update Decision, Rationale, and Cost to reflect `on-touch` real-platform cadence and disclosed `unverified` boundaries on release candidates whose platform boundaries were untouched or user-skipped.
   - [CLAUDE.md](../../CLAUDE.md) workspace map (handoff): collapse the two `verify/` rows into a single `verify/` directory pointer (`verify/README.md` owns concrete entries, commands and tags). Update `operate/deploy/README.md` step note for `on-touch` cadence.
4. **Single-page-safe consolidation in [verify/fake-platform-smoke.js](../../verify/fake-platform-smoke.js) (if Q2 = A, zero harness changes, zero coverage loss):** collapse 25 cases → **15 cases** while keeping the existing per-case `addInitScript` harness untouched and retaining 100% of unique runtime assertions:
   - `daily-recovery-and-marker-retry` (`0002`): merges `daily-protected-recovery-and-handin` + `daily-marker-write-fails-then-recovers` + `daily-paper-with-deleted-question` (3 → 1).
   - `daily-paper-written-answer-self-judge` (`0002`): kept (1).
   - `check-paper-take-self-judge-and-deleted-q` (`0003,0009`): merges `check-paper-hand-in-self-judge-and-review` + `check-paper-with-deleted-question` (2 → 1).
   - `paper-page-navigation-review-and-legacy` (`0002,0003,0004,0009`): merges `paper-page-reopened-outcome-and-pending` + `paper-page-opens-from-every-row` + `paper-page-detail-button-real-click` + `legacy-handed-in-paper-reads-no-answer`, dropping synthetic-click duplicate `paper-page-override-and-detail-back` (5 → 1).
   - `paper-page-override-recalc-and-fault` (`0004,0009`): merges `paper-page-override-recalculates-outcome` + `paper-page-override-write-fails` and explicitly carries `judgedBy === 'parent'` (2 → 1).
   - `retention-prunes-only-old-handed-in-daily-papers` and `retention-failed-delete-is-ignored` (`0002,0004`): kept as 2 cases so boot-time `addInitScript` flags need zero harness changes (2).
   - `set-cleanup-uses-complete-membership` (`0007`): kept (1).
   - `set-material-edit-and-legacy-guards` (`0001,0007`): merges `material-edit-keeps-bank-and-blocks-legacy` + `legacy-set-not-selectable-in-saved-material` and folds in the 4-line `draftLinkError` check (including the unchanged-legacy-edit exemption outside `LOGIC:BEGIN..END`) from `set-link-validation` (3 → 1).
   - `check-paper-stale-preview-and-marker` (`0008`): kept (1).
   - `read-failure-settings`, `read-failure-exercises`, `identity-failure`, `registration-failure` (`0010`): kept as 4 compact boot-flag cases (total 7 lines, zero harness changes); drop standalone `write-path-retries-only-unavailable` (pure retry already tested in `impl/logic.test.js`) and assert `S.db` boot wiring (`S.db !== window.__db && typeof S.db.collection('exercises').where === 'undefined'`) inside `registration-failure` (5 → 4).
   *(Total: 15 cases, down from 25; zero harness edits; zero dropped runtime assertions.)*
5. **Keep [impl/logic.test.js](../../impl/logic.test.js) intact:** preserve all pure-function contract assertions (runs in `< 1s`, zero external dependencies, serves as the workspace's executable algorithm spec for 94 pure functions).

## Decisions for the user

**Q1 Align acceptance policy & cadence to `discuss-design` v0.46.0?** (decided by the user, 2026-11-22: option A)

Evidence: E1. Keeping the old "all manual checks mandatory per release" rule contradicts v0.46.0's `design-verify` and caused unnecessary waiver friction on recent releases. With independent review Finding 4 incorporated, `model/verify/SPEC.md` defines component/capability-level `on-touch` rules for single-file `impl/arena.html`.

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | Adopt v0.46.0 policy: slim `model/verify/SPEC.md` (with component/capability `on-touch` rules), tag `verify/README.md` with `automated`/`always` + `manual`/`on-touch`, align `0013`, `0012`, `deploy/SPEC.md`, `ADR 0005` & `CLAUDE.md` map (`verify/` pointer), `fail`-only `in-progress` | Manual platform checks run only when platform boundaries are touched (or widened by user); unrun boundaries stay disclosed as `unverified` |
| B | Keep mandatory all-7-step manual walkthrough per release; only reformat `verify/README.md` | Retains release friction when only UI/logic changes |

Recommendation: A (selected by user).

**Q2 Consolidate `verify/fake-platform-smoke.js` using single-page-safe merges (25 → 15 cases) or defer until Playwright is available?** (decided by the user, 2026-11-22: option A; reopened after independent review Findings 1–3 from prior 25 → 10)

Evidence: E2. Independent review showed two of the earlier 25 → 10 merges (`retention` reload and merging 4 boot-flag `0010` cases) fail against the existing `addInitScript` harness without blind harness refactoring, and three unique runtime assertions (`draftLinkError` unchanged-legacy exemption, `S.db` boot wiring, `judgedBy === 'parent'`) would have been dropped. Single-page-safe consolidation cuts 25 → 15 cases with zero harness changes and zero assertion loss. **Verification / recovery assumption:** `playwright` is not installed locally; edited cases will be syntax-checked (`node --check` + `--list`) now, verified on the next run in an environment with Playwright/Chromium before counting as passing acceptance evidence, and recovered if any consolidated case fails due to test code by fixing `verify/fake-platform-smoke.js` under `design-verify` Rule 3 or reverting the consolidation commit.

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | Single-page-safe consolidation: 25 → 15 cases now, zero harness changes, zero dropped runtime assertions (syntax-checked locally; runtime verification on next Playwright run) | Removes all real redundancy safely; carries minor blind-edit risk until next Playwright run |
| B | Defer `verify/fake-platform-smoke.js` edits until Playwright is available locally/cloud; only apply Q1 policy + `verify/README.md` catalog now | Zero risk of unexecuted browser-script edits; keeps 25 cases until the next Playwright session |

Recommendation: A.

**Q3 Leave `impl/logic.test.js` assertions intact?** (decided by the user, 2026-11-22: option A)

Evidence: E3. `impl/logic.test.js` runs in `< 1s`, passes locally, and `CLAUDE.md` explicitly delegates detailed algorithm rules to it.

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | Keep `impl/logic.test.js` untouched | Preserves complete executable spec with zero risk and `< 1s` runtime |
| B | Refactor `impl/logic.test.js` helpers to reduce boilerplate while keeping all assertions | Minor readability benefit; touches 926-line spec file |

Recommendation: A (selected by user).

**Q4 Should `model/operate/deploy/SPEC.md` require passing automated simulated-runtime checks as a mandatory release prerequisite?** (decided by the user, 2026-11-22: option A; raised by independent review Finding 5)

Evidence: `.agents/skills/design-release/SKILL.md:20` checks whether `model/operate/deploy/SPEC.md` explicitly names specific automated `pass` judgments as mandatory release prerequisites (routing missing ones back to `design-verify`) and discloses all `unverified` boundaries before `ONLINE` deploy. Currently `model/operate/deploy/SPEC.md` leaves this implicit.

| Option | Approach | Cost |
|---|---|---|
| A (recommended) | Require passing automated simulated-runtime checks (`verify/fake-platform-smoke.js`) in `model/operate/deploy/SPEC.md` before `ONLINE` release (manual `OFFLINE` checks remain `on-touch` and user-skippable with disclosure) | Prevents accidentally releasing untested DOM/write-sequence regressions; requires running Playwright in an environment with Chromium before releasing |
| B | Allow releasing even when automated simulated-runtime checks are skipped by the user (`unverified` with reason disclosed) | Allows releasing directly from a local machine without Playwright; relies on user judgment and `impl/logic.test.js` |

Recommendation: A (protects the main automated safety net while keeping manual platform checks `on-touch` and low-friction).

## Write-off
<!-- write-off -->

Design rows only (journey and model files). Freezing hands off implementation in the same session: `CLAUDE.md` map (`verify/` directory pointer), `verify/README.md` (v0.46.0 tagged catalog + known-gaps note), `operate/deploy/README.md` (`on-touch` clarification), `verify/fake-platform-smoke.js` (25 → 15 single-page-safe consolidation per Q2=A), and keeping `impl/logic.test.js` untouched (per Q3=A).

| # | Question | Target | Change | Verification | Actual result and verification |
|---|---|---|---|---|---|
| 1 | Q1 | `model/verify/SPEC.md` | Replace dense per-slice coverage table, concrete boundary-class list and incomplete-coverage blocker with v0.46.0 stable acceptance policy (`Phase and cadence policy`, `fail`-only `in-progress`, `verify/README.md` as sole catalog, component/capability-level `on-touch` sizing rules for single-file `impl/arena.html`, `verify/`-only commit exemption) | `./check.sh`, `node impl/logic.test.js impl/arena.html` | Applied: stable policy, environments/substitutes, phase & cadence policy, component/capability `on-touch` table, exemptions. `./check.sh` passed; `impl/logic.test.js` passed |
| 2 | Q1 | `journey/0013-accept-integrated-slice.md` | Update `Success`, Mermaid diagram step 3, Steps 2–5 (`scope: feature` vs `scope: integration`, `verify/README.md` sizing, user-directed skipping, `on-touch` authorized `OFFLINE`), and Extensions 3a/5a (`fail`-only `in-progress`, disclosed `unverified` proceeds to `0012`) | `./check.sh`, `node impl/logic.test.js impl/arena.html`, Mermaid check/disclosure | Applied to Success, sequenceDiagram, Steps 1–5, Extensions 1a/3a/4a/4b/5a and Support trace. `./check.sh` passed; `impl/logic.test.js` passed; Mermaid syntax checked manually (no diagram renderer integration enabled in config) |
| 3 | Q1, Q4 | `journey/0012-publish-artifact.md` | Update Steps 1–2 to require disclosing all `unverified` boundaries from `0013` before publication authorization (and honoring any mandatory automated prerequisite in `deploy/SPEC.md`) | `./check.sh`, `node impl/logic.test.js impl/arena.html` | Applied to sequenceDiagram, Steps 1–2/5 and Extension 1a. `./check.sh` passed; `impl/logic.test.js` passed; Mermaid syntax checked manually (no renderer integration enabled) |
| 4 | Q1, Q4 | `model/operate/deploy/SPEC.md` | Update "Supply an acceptance candidate" to `on-touch` manual cadence; update "Publish an accepted page" with `unverified` boundary disclosure and the Q4 decision on automated simulated-runtime release prerequisites | `./check.sh`, `node impl/logic.test.js impl/arena.html` | Applied: `on-touch` test-candidate supply, mandatory automated simulated-runtime `pass` release prerequisite, and `unverified` boundary disclosure before `ONLINE` publication. `./check.sh` passed; `impl/logic.test.js` passed; flowchart syntax checked manually |
| 5 | Q1 | `model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md` | Update Decision, Rationale, and Cost to reflect `on-touch` real-platform cadence and disclosed `unverified` boundaries on release candidates | `./check.sh`, `node impl/logic.test.js impl/arena.html` | Applied to Decision, Rationale and Cost. `./check.sh` passed; `impl/logic.test.js` passed |

## Evidence

### E1 Pre-v0.46.0 acceptance contract vs v0.46.0 toolkit

Sources: [model/verify/SPEC.md](../../model/verify/SPEC.md), [journey/0013-accept-integrated-slice.md](../../journey/0013-accept-integrated-slice.md), [journey/0012-publish-artifact.md](../../journey/0012-publish-artifact.md), [model/operate/deploy/SPEC.md](../../model/operate/deploy/SPEC.md), [verify/README.md](../../verify/README.md), [model/arch/arena/COMPONENT.md](../../model/arch/arena/COMPONENT.md), `.agents/skills/design-verify/SKILL.md`, `.agents/skills/design-release/SKILL.md`, `.agents/skills/design-writing/assets/skeletons.md`. Facts: v0.46.0 moves concrete case catalogs solely to `verify/README.md`, introduces `Cost` (`automated`/`manual`) and `Cadence` (`always`/`on-touch`), makes `fail` the sole condition for `in-progress`, lets `model/operate/deploy/SPEC.md` declare mandatory automated release prerequisites while disclosing `unverified` boundaries, and keeps only a `verify/` directory pointer in `CLAUDE.md`. All 8 logical components live inside `impl/arena.html`, so `on-touch` requires component/capability rules rather than file-path diffing.

### E2 Redundancy in `verify/fake-platform-smoke.js`, harness limits and local Playwright gap

Sources: [verify/fake-platform-smoke.js](../../verify/fake-platform-smoke.js) (415 lines, 25 cases), [impl/arena.html](../../impl/arena.html) (`draftLinkError` lines 1640–1652; `pruneDailyPapers` and `boot()` lines 3537–3569), [impl/logic.test.js](../../impl/logic.test.js) (lines 868–869, 900–925), and local `node -e "require('playwright')"` check. Facts:
- `paper-page-override-and-detail-back` duplicates real-click cases except for `judgedBy === 'parent'` (line 128), which must be carried forward.
- `draftLinkError` (`impl/arena.html:1640–1652`) sits outside `LOGIC:BEGIN..END` and tests the unchanged-legacy-edit exemption (`d.editId && ref === d.origSetId`) not covered by `L.checkSetLink`.
- `boot()` (`impl/arena.html:3555`) wires `S.db = retryingDb(db, ...)`—not covered by `impl/logic.test.js`, so a 1-line `S.db` wrapper check must be retained when dropping standalone `write-path-retries-only-unavailable`.
- The harness (`verify/fake-platform-smoke.js:397–401`) sets `k.opts.flags` and `[seed]` via `pg.addInitScript`, so boot-flag cases (`retention-failed-delete-is-ignored` and the four `0010` failure cases, 12 lines total) stay separate to avoid blind harness refactoring.
- Unknown and recovery: `playwright` is absent locally, so consolidated cases are verified by `node --check` and `--list` now, must pass a Playwright/Chromium run before counting as passing acceptance evidence, and if any consolidated case fails due to test code, recover by fixing `verify/fake-platform-smoke.js` under `design-verify` Rule 3 or reverting the consolidation commit.

### E3 `impl/logic.test.js` is fast and authoritative for pure logic

Sources: [impl/logic.test.js](../../impl/logic.test.js) (926 lines, 94 unique pure functions in `this.L`), [CLAUDE.md](../../CLAUDE.md), command output `node impl/logic.test.js impl/arena.html` (`all logic tests passed`, exit 0). Facts: runs locally in `< 1s` with no external dependencies.

## Agent decisions

**A1 Process** (superseded 2026-11-22: user requested independent review before confirmation) Full discussion path with fresh-context independent review completed before confirmation.

**A2 Catalog grouping for manual `OFFLINE` checks** (confirmed 2026-11-22) Group the 7 authorized-runtime steps into 4 `on-touch` manual boundary entries in `verify/README.md` (identity/registration & owner switch; real db writes/cleanup/retention; photo upload & AI recognition; runtime contract & capabilities) paired 1:1 with the component/capability `on-touch` rules in `model/verify/SPEC.md`.

## Independent review (2026-11-22)

Reviewer: fresh-context read-only subagent (session model; no separate model explicitly requested). Verdict: **Reconsideration needed** — overall v0.46.0 direction holds, with 3 substantive gaps (Q2 harness/coverage defects, single-file `on-touch` criteria, and unsettled `deploy/SPEC.md` automated release prerequisite / `0012` disclosure) plus mechanical plan omissions. All 11 findings verified at the source.

| Finding | Verification | Disposition |
|---|---|---|
| 1 `reconsideration`: `retention` reload and 4-in-1 `0010` merges break `addInitScript` harness (`fake-platform-smoke.js:397–401`, `arena.html:3537–3569`) | Verified at source: `pg.reload()` re-runs `addInitScript`; the 5 boot-flag cases total 12 lines | Reopened Q2; dropped both harness-breaking merges from Option A |
| 2 `reconsideration`: 3 unique runtime assertions dropped (`draftLinkError` legacy exemption `arena.html:1648`, `S.db = retryingDb` boot wiring `arena.html:3555`, `judgedBy === 'parent'` `fake-platform-smoke.js:128`) | Verified at source: all 3 are absent from `impl/logic.test.js` / remaining smoke cases | Corrected E2 and Target model #4 to preserve all 3 assertions explicitly |
| 3 `alternative` (all 3 thresholds hold): 25 → 15 single-page-safe consolidation (zero harness edits) + verify/recover criteria in E2 | Verified: eliminates blind harness risk while removing all true redundancy | Adopted as reopened Q2 Option A; added verify/recover plan to E2 |
| 4 `reconsideration`: `on-touch` criteria undefined for single-file `impl/arena.html` (`COMPONENT.md:42–52`) | Verified: file-path diffing would trigger all 4 manual groups on any UI edit | Added explicit component/capability-level `on-touch` rules to Target model #1 and Row 1 |
| 5 `reconsideration`: Unsettled automated release-gate prerequisite & missing `unverified` disclosure in `deploy/SPEC.md` and `journey/0012` (`design-release/SKILL.md:20`) | Verified: `deploy/SPEC.md:46–48` and `0012:22–23` omit both | Added Q4 for user decision; added Row 3 (`journey/0012`) and expanded Row 4 (`deploy/SPEC.md`) |
| 6 `mechanical`: Write-off plan Row 5 was an implementation handoff row with stale conditional wording | Verified (`design-discuss/SKILL.md:28`) | Removed Row 5 from `<!-- write-off-plan -->`; moved handoff summary to prose above table |
| 7 `mechanical`: Row 2 omitted `journey/0013` `Success`, Mermaid diagram step 3, Steps 2 & 5, and `feature` vs `integration` split | Verified (`journey/0013:5,14,23–26,31,34`) | Expanded Row 2 to cover all affected sections of `journey/0013` |
| 8 `mechanical`: ADR 0005 Cost section also contradicts `on-touch` (`ADR 0005:20`) | Verified | Expanded Row 5 to update Decision, Rationale, and Cost |
| 9 `mechanical`: Rows 1–4 omitted `node impl/logic.test.js impl/arena.html` (and Mermaid check) from Verification | Verified (`CLAUDE.md:74,108`) | Added registered logic test to all design rows and Mermaid check/disclosure to Row 2 |
| 10 `mechanical`: Off-by-one line counts and pure-function count (`415` lines, `926` lines, `94` unique pure functions) | Verified via `wc -l` and `this.L` inspection | Corrected all counts across Background, Target model, Q3, and E2–E3 |
| 11 `detail`: Keep uncovered-journey note in `verify/README.md` and note `on-touch` in `operate/deploy/README.md` | Verified (`verify/README.md:28`, `operate/deploy/README.md:14–16`) | Accepted into Target model #2/#3 and handoff scope |
