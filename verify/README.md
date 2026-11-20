# Acceptance entries

See [model/verify/SPEC.md](../model/verify/SPEC.md) for the acceptance contract. Acceptance is run by the verify stage and recorded under `record/verify/`; running an entry while debugging is not an acceptance verdict.

## Local entries (real, narrow)

| Entry | Run | What it covers | What it does not cover |
|---|---|---|---|
| Workspace consistency | `./check.sh` | Structure, links, managed block | Any runtime behavior |
| Pure-logic regression | `node impl/logic.test.js impl/arena.html` | Page helpers in a VM: ladder, judging, due/draw/layout, assessment, protected-paper selection, recovery state, preview and set-ownership checks, rewards, matches | DOM handlers, platform calls, AI, uploads |

## Substitute entry (fake platform)

| Entry | Run | What it covers | What it does not cover |
|---|---|---|---|
| [fake-platform-smoke.js](./fake-platform-smoke.js) | `node verify/fake-platform-smoke.js impl/arena.html` (needs `playwright` and Chromium) | The real page in headless Chromium against an in-memory fake db: protected daily-paper recovery on Today and Hand in, new-paper marker initialization, last-member set cleanup (kept for legacy sets and failed reads), new set-link rejection, stale check-preview refusal, material edit patching and legacy edit block, missing-question notice on a recovered paper, legacy sets disabled in the saved-material list, "couldn't read your data" on a failed settings or snapshot read, identity failure, registration-failure notice | Real db query behavior (including the `where('setId')` membership read), identity, assets, AI, concurrent writes, retention timing, matches, publication |

A pass here supports only the declared fake-platform boundary. It is a substitute, not integrated acceptance.

## Runtime walkthrough (not yet run)

Integrated acceptance needs an authorized test Artifact, test actors and named test data (see [deploy tools](../operate/deploy/README.md)). Until that exists, these boundaries are **unverified**: identity and registration, owner-scoped subscriptions and reload, the complete-membership read, AI and photo recording, partial-write and marker-failure recovery on the real db, same-owner set edits and legacy compatibility, retention, matches, and the published target. The required cases are listed in the acceptance contract.
