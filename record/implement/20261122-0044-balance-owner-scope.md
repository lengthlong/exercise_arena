# Balance follows the selected owner scope (0044)

> status: completed (2026-11-22)
> location: branch `develop`, commits `418bf99..3c09ead`

## Upstream
<!-- upstream -->

- 0044 #1 no-implementation
- 0044 #2 implemented
- 0044 #3 no-implementation
- 0044 #4 no-implementation
- 0044 #5 no-implementation
- 0044 #6 no-implementation
- 0044 #7 no-implementation
- 0044 #8 implemented

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `simulated-runtime` (`verify/fake-platform-smoke.js`) | Added case `games-balance-follows-owner-scope`: real Settings owner switch and back, stored-owner and legacy matches, and a real match start storing `owner`; fails on the page before the fix | 0004 3/3c, 0005 1/1a/3, 0006 4/5b |
| `offline-identity-owner` (`verify/README.md`) | Walkthrough gains a step: balance in the second owner excludes the first owner's coins and stakes and returns on switching back | 0006 4/5b, 0004 3c |
| `verify/README.md` catalog | `simulated-runtime` journeys and known-gaps text narrowed to what the new case covers | 0004, 0005, 0006 |

## Implementation choices

- `matchInScope(mt, scope, owners)` is a pure function inside the `LOGIC` block: a non-empty string `owner` decides; otherwise a match belongs to the scope only when every player's current Default owner (missing settings read as the player) equals the scope; no players means no scope; an unset scope means no filtering, so existing callers and tests keep their meaning.
- `coinsFor` takes optional `scope` and `owners`; `coinInfo` passes `S.settings.defaultOwner` and `S.owners`. Eligibility and the extra-stake limit use the same `coinInfo`, so they follow the same scope.
- `startMatch` writes `owner: S.settings.defaultOwner` with the committed start; no migration of existing matches and no write of inferred owners.

## Tests and checks

- `./check.sh`: exit 0.
- `node impl/logic.test.js impl/arena.html`: exit 0 (`all logic tests passed`), including new scope, legacy-inference and unscoped assertions.
- `node verify/fake-platform-smoke.js impl/arena.html`: 15 of 15 cases pass in headless Chromium; the new case fails on `impl/arena.html` at `418bf99` with "balance 0, not negative" and passes after the fix.
- Outside verification coverage: real platform behavior (other-device owner change, real match persistence) is covered only by the `offline-identity-owner` manual entry.
