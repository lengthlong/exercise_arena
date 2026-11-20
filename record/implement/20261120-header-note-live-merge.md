# Header note for the live features not carried over

> status: completed (2026-11-20)
> location: branch `develop`, commits `e91cc64..1ba9837`

## Upstream
<!-- upstream -->

- 20261120-port-retry-wrapper

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `./check.sh` | Affected; passes | None |
| `node impl/logic.test.js impl/arena.html` | Affected (comment-only change); passes | None |
| `node verify/fake-platform-smoke.js impl/arena.html` | Affected; passes | None |

## Implementation choices

- Comment-only change to the page header. Publishing to the production Artifact was refused until the live version's differences were reviewed. Those differences were the live "resume an interrupted hand-in" feature, the live rule that a daily paper without `handedIn` is not handed in, and the header lines documenting them. The header now records that the first is replaced by the 0039 protected-paper recovery and that the second is not carried over (`DATA.md` keeps legacy inference). No code changed.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: exit 0, "all logic tests passed".
- `./check.sh`: exit 0.
- `node verify/fake-platform-smoke.js impl/arena.html`: exit 0 (substitute).
- Outside verification coverage: unchanged from the retry-wrapper record; no runtime behavior changed.
- Acceptance handoff: needs an acceptance record whose baseline is this tree before delivery.
