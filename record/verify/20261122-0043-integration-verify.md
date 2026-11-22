# Integration verify of simplified acceptance catalog and smoke suite (0043)

> status: completed (2026-11-22)
> location: branch `develop`
> scope: integration
> baseline: 18d012c

## Upstream
<!-- upstream -->

- 20261122-0043-simplify-acceptance-and-tests

## Scope and size

- Mode `integration` (single-slice integration pass covering all accumulated work since release 93, candidate `f887655`): discussion `0043` aligned `model/verify/SPEC.md`, `journey/0013`, `journey/0012`, `model/operate/deploy/SPEC.md`, `ADR 0005`, `CLAUDE.md`, `operate/deploy/README.md`, `verify/README.md`, and consolidated `verify/fake-platform-smoke.js` from 25 to 14 single-page-safe cases.
- Baseline product-tree match: the tree outside `record/` and `verify/` at `18d012c` is identical to `2d211c0` (`<end>` of `20261122-0043-simplify-acceptance-and-tests`, whose registered tests passed). `impl/arena.html` is unchanged since release 93 (sha256 `dc063d0f5e7f5f8991fcd05c4066f922eeece415e53eea59a9cb97544b886a9b`, `git diff 4b1ee49..HEAD -- impl/` is empty).
- `verify/`-only commit in this round: `18d012c` (`verify: support optional CHROME_PATH for local Chromium execution`) added optional `CHROME_PATH` support to `verify/fake-platform-smoke.js` and documented it in `verify/README.md` so the suite runs against a local Chrome binary without modifying product code.
- Entries run (catalog defaults from `verify/README.md` and `model/verify/SPEC.md`):
  - `simulated-runtime` (`Cost: automated`, `Cadence: always`, `Default phase: both`): executed all **14 of 14** consolidated cases in headless Chrome `157.0.8103.79` (`NODE_PATH=/Users/aaron/code/nxet_meta_platform_front/node_modules CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node verify/fake-platform-smoke.js impl/arena.html`), exit 0, zero page/console errors.
  - The four `manual` / `on-touch` `OFFLINE` entries (`offline-identity-owner`, `offline-db-writes-cleanup-retention`, `offline-photo-ai`, `offline-runtime-contract`): not triggered because `impl/arena.html` had zero changes since release 93; recorded `unverified` below.
- Registered implementation checks re-run as a precondition sanity check after `18d012c` (not counted as acceptance judgments): `./check.sh` exit 0, `node impl/logic.test.js impl/arena.html` exit 0.
- History: linear commits on `develop` since release 93 (`a084de3`, `6a76a28`, `2d211c0`, `d6b2916`, `18d012c`); no rewritten ancestry.

## Changes without implementation records

| Commit | Acceptance scope derived from the contract | Treatment |
|---|---|---|
| `a084de3` | Mechanical toolkit upgrade `v0.45.0 → v0.46.0` (skills, kernel block, config); no `impl/` or `operate/` runtime change | Exempt per `model/verify/SPEC.md` |
| `6a76a28` | Design write-off of `0043` (verify policy, 0013/0012 journeys, deploy SPEC, ADR 0005); no `impl/` or `operate/` runtime change | Exempt per `model/verify/SPEC.md` |

## Judgments
<!-- acceptance-judgments -->

| # | Journey step and success condition | Verdict | Evidence |
|---|---|---|---|
| 1 | 0002 steps 1–6: protected unfinished daily paper is recovered without replacement, failed marker write preserves attempts and retries marker-only, deleted question is surfaced, written answer self-judgment locks tabs until judged and awards exact coins | pass | Simulated runtime: `daily-recovery-and-marker-retry` and `daily-paper-written-answer-self-judge` passed in headless Chrome (`18d012c`). Page side only |
| 2 | 0003 steps 2–6, 0009 steps 3–4: check paper with a deleted question locks tabs, scores remaining questions with ladder and no coins, keeps deleted card unjudged, saves written self-judgment once, offers Override and unlocks tabs | pass | Simulated runtime: `check-paper-take-self-judge-and-deleted-q` passed (`18d012c`). Page side only |
| 3 | 0002 7c, 0003 1b, 0004 4/4d, 0009 1/1b: handed-in papers open on the unified Paper page via real row clicks (Today Exam, Papers Exam, Papers Daily) with Back to origin, accurate coins/ladder/pending wording, real Detail→Back to the same card, and legacy "No answer" vs "Not judged yet" wording | pass | Simulated runtime: `paper-page-navigation-review-and-legacy` passed (`18d012c`). Page side only |
| 4 | 0004 4, 0009 3–5: inline Override handles write failure without corrupting stored judgment/outcome, and retry updates only that own attempt (`judgedBy: parent`) and recalculates score, coins, ladder and Games balance | pass | Simulated runtime: `paper-page-override-recalc-and-fault` passed (`18d012c`). Page side only |
| 5 | 0002, 0004 4a/5: retention prunes only daily papers handed in >30 days ago while preserving attempts, and a failed delete leaves paper, attempts and page intact | pass | Simulated runtime: `retention-prunes-only-old-handed-in-daily-papers` and `retention-failed-delete-is-ignored` passed (`18d012c`). Page side only |
| 6 | 0001, 0007: last-member cleanup deletes owned sets only on a complete membership read and keeps legacy sets; `draftLinkError` rejects legacy/other-owner new links while allowing unchanged legacy edits; stale material edits preserve word bank/owner/subject, destructive bank edits are blocked, and legacy sets are blocked from editing and saved-material selection | pass | Simulated runtime: `set-cleanup-uses-complete-membership` and `set-material-edit-and-legacy-guards` passed (`18d012c`). Page side only |
| 7 | 0008: check-paper preview from another owner is rejected for re-preview, and new check papers start with an empty `handedIn` map | pass | Simulated runtime: `check-paper-stale-preview-and-marker` passed (`18d012c`). Page side only |
| 8 | 0010: failed settings/exercises reads show "Couldn't read your data", identity failure shows "Data unavailable", registration failure warns while staying usable, and `boot()` wraps `S.db` in the write-only `retryingDb` adapter | pass | Simulated runtime: `read-failure-settings`, `read-failure-exercises`, `identity-failure`, `registration-failure` passed (`18d012c`). Page side only |
| 9 | 0006, 0010 (`offline-identity-owner`): real platform identity, first registration and owner-scoped subscriptions | unverified | `on-touch` cadence: `Session/settings` in `impl/arena.html` untouched since release 93 |
| 10 | 0002–0004, 0007, 0009 (`offline-db-writes-cleanup-retention`): real db writes, membership cleanup and retention delete | unverified | `on-touch` cadence: `Platform/data gateway` and db paths in `impl/arena.html` untouched since release 93 |
| 11 | 0001 (`offline-photo-ai`): real photo upload and AI recognition | unverified | `on-touch` cadence: `Record` `assets`/`sample` paths in `impl/arena.html` untouched since release 93 |
| 12 | 0010, 0012 (`offline-runtime-contract`): declared runtime contract and capabilities match target | unverified | `on-touch` cadence: source header contract/capabilities untouched since release 93 |
| 13 | Known automated gaps (`0005` match, `0006` settings, `0004` progress projections, mastery after override, multiple protected papers, owner switch before save, 375px layout, photo/material toggles, check-paper partial-write failures) | unverified | No automated case in `verify/README.md`; untouched since release 93 |

## Substitutes and unverified boundaries

- Simulated runtime (`verify/fake-platform-smoke.js`): declared substitute running unmodified `impl/arena.html` in headless Chrome `157.0.8103.79` against an in-memory `db`/`user` fake (judgments 1–8). Proves page-side DOM/write-sequence behavior only, not real platform semantics.
- All four `manual` / `on-touch` `OFFLINE` platform boundary entries (judgments 9–12) and the known automated gaps (judgment 13) remain `unverified` because `impl/arena.html` was not modified since release 93.
- No `ONLINE` release is needed for this slice because `impl/arena.html` is byte-for-byte identical to live release 93 (`dc063d0f5e7f5f8991fcd05c4066f922eeece415e53eea59a9cb97544b886a9b`).

## Round notes

- Round 1 (`18d012c`): added optional `CHROME_PATH` support in `verify/fake-platform-smoke.js` so local Chrome executes the suite cleanly without bundled Playwright Chromium. All 14 of 14 consolidated cases passed on the first run with zero page or console errors. Zero `fail` judgments; record marked `completed`.
