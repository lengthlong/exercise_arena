# 0046 Simplify phase tests and release gate

> status: completed (2026-11-23)
> location: branch `develop`, baseline `cb72168` (`develop`)
> confirmation: "Confirm Q1=A, write off 0046, and implement deploy README handoff now" (2026-11-23), Q1=A write-off (`model/operate/deploy/SPEC.md`, `journey/0012`, `journey/0013`, `model/adr/0005`) and same-session handoff implementation (`operate/deploy/README.md`); `verify/` edits confirmed separately under `design-verify` Rule 3; external `OFFLINE`/`ONLINE` actions excluded.

## Background and goal

Exercise Arena is a fast-moving personal web app used only by the designer's family. Even after discussion `0043` trimmed acceptance from 25 to 15 simulated-runtime cases and moved manual `OFFLINE` walkthroughs to `on-touch`, three sources of test friction remain across phases:

- **Release gate (`model/operate/deploy/SPEC.md`, `journey/0012`, `model/adr/0005`):** makes passing `verify/fake-platform-smoke.js` a **mandatory** blocker before `ONLINE` publication, even though `playwright` is not installed locally on this machine, and still describes a separate authorized `OFFLINE` test Artifact with 4 manual walkthrough groups.
- **Acceptance (`verify/`, owned by `design-verify`):** still keeps 15 Playwright cases (363 lines) and 4 manual `OFFLINE` walkthrough groups, plus `v0.46.0` wording instead of `v0.48.0`'s exclusive `design-verify` ownership and explicit prod-only support.
- **Implementation (`impl/logic.test.js`):** runs in `< 1s` with zero external dependencies and serves as the executable pure-logic spec — kept intact.

Goal: relax the release and acceptance contracts (`model/operate/deploy/SPEC.md`, `journey/0012`, `journey/0013`, `model/adr/0005`, and handoff `operate/deploy/README.md`) for a fast-iterating personal prod-only app so releases are never blocked by Playwright or `OFFLINE` test-Artifact ceremony, while keeping `zero fail`, `unverified` disclosure, and explicit `ONLINE` publication confirmation. Changes inside `verify/` (`verify/SPEC.md`, `verify/README.md`, `verify/fake-platform-smoke.js`) stay exclusively with `design-verify` and are confirmed separately under its oracle-integrity rule.

Non-goals: changing runtime behavior in `impl/arena.html`, trimming `impl/logic.test.js`, or performing external `OFFLINE`/`ONLINE` Artifact operations.

## Q1 Relax the pre-release gate and drop the OFFLINE test-Artifact setup requirement

- **Evidence:**
  - `model/operate/deploy/SPEC.md` ("Supply an acceptance candidate" & "Publish an accepted page") currently makes passing `verify/fake-platform-smoke.js` a mandatory `ONLINE` release prerequisite and specifies supplying a separate authorized `OFFLINE` test Artifact for 4 manual platform-boundary groups.
  - Local inspection (`2026-11-23`) confirms `playwright` is not installed locally (`require.resolve('playwright')` fails), whereas Google Chrome is installed at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` and `node impl/logic.test.js impl/arena.html` runs in `< 1s` with zero external dependencies.
  - Under `discuss-design` `v0.48.0`, prod-only workspaces without a maintained `OFFLINE` environment are first-class: `design-verify` runs applicable local/simulated entries (which the user may also skip) and marks real-platform boundaries `unverified` (zero `fail`), disclosing them before `ONLINE` release.
- **Options:**
  - **A (recommended):** Relax `model/operate/deploy/SPEC.md`, `journey/0012-publish-artifact.md`, `journey/0013-accept-integrated-slice.md`, `model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md`, and handoff `operate/deploy/README.md`:
    - Remove the mandatory automated simulated-runtime pre-release blocker. Release requires: (1) passing local checks (`./check.sh` and `node impl/logic.test.js impl/arena.html`), (2) a matching completed `scope: integration` acceptance record (zero `fail`), (3) disclosure of all `unverified` boundaries, and (4) explicit `ONLINE` publication authorization + post-publish live check.
    - Declare the workspace prod-only by default (no maintained `OFFLINE` test Artifact); optional ad-hoc test Artifact supply remains allowed only if explicitly requested and authorized.
  - **B:** Keep passing automated simulated-runtime checks as a mandatory pre-release blocker, and only drop the `OFFLINE` test-Artifact setup requirement.
- **Decision:** A (decided by the user, 2026-11-23).
- **Proposed change (on confirmation):**
  1. `model/operate/deploy/SPEC.md`: drop mandatory automated smoke blocker from "Publish an accepted page"; simplify "Supply an acceptance candidate" to note prod-only default (no maintained `OFFLINE` test Artifact; optional ad-hoc test target only when explicitly authorized); update artifact flow diagram accordingly.
  2. `journey/0012-publish-artifact.md`: remove mandatory automated-prerequisite wording in Step 1 and Extension 1a; keep matching completed `scope: integration` record (zero `fail`), disclosure of `unverified` boundaries, explicit publication authorization, and live post-publish check.
  3. `journey/0013-accept-integrated-slice.md`: simplify Step 3 & Extension 3a to reflect prod-only default (simulated runtime or user-skipped `unverified` boundaries; no routine `OFFLINE` test-Artifact setup) and remove mandatory-automated-prerequisite phrasing in Step 5 / Extension 5a.
  4. `model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md`: update Decision/Rationale/Cost so the simulated runtime is an optional lightweight substitute (not a mandatory pre-release blocker) and real-platform boundaries are checked live post-release or left disclosed as `unverified`.
  5. Handoff to `design-implement`: update `operate/deploy/README.md` to match the simplified deploy contract.
- **Actual result:** Applied items 1–4 (`model/operate/deploy/SPEC.md`, `journey/0012-publish-artifact.md`, `journey/0013-accept-integrated-slice.md`, `model/adr/0005-acceptance-runs-the-real-page-on-a-simulated-platform.md`). `./check.sh` passed; `node impl/logic.test.js impl/arena.html` passed. Item 5 (`operate/deploy/README.md`) handed off to `design-implement`.
