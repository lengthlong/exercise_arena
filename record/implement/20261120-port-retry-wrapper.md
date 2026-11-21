# Port the production write-retry wrapper

> status: completed (2026-11-20)
> location: branch `develop`, commits `379078d..3301773`

## Upstream
<!-- upstream -->

- 20261120-read-failure-presentation

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `node impl/logic.test.js impl/arena.html` | Changed: asynchronous assertions for the retry helpers (retry count, delay window, only the `unavailable` code, writes only, id and path kept); the success line prints only after they pass | All write steps (user/0001 6, 0002 5-6, 0006 3, 0007 5, 0008 5, 0009 4) |
| `verify/fake-platform-smoke.js` | Changed: the page's own write path retries `unavailable` and does not retry another code; the membership-failure override now targets the plain db | Same write steps |
| `verify/README.md` | Changed: coverage line | operator/0003 |
| `./check.sh` | Affected; passes | None |

## Implementation choices

- This is authorized maintenance restoring established production behavior, not a 0039 row. The live production Artifact (version `1794376291-ecf5`) retries database writes that fail with `unavailable`, up to two times, 0.5 to 1.5 seconds apart, and shows other error codes immediately. Its header credits user feedback with no discussion. No commit in this repository contained it, so the repository page lacked it.
- Ported: `retryUnavailable` and `retryingDb`, placed in the logic block so the logic tests cover them. `S.db` is the retrying wrapper for writes. `S.rawDb` is the plain db for reads, because the wrapper has no `where` or `get` and the set-cleanup membership read needs them.
- The wrapper retries only `set`, `update` and `delete`. The page's writes are whole-document or per-field replacements and deletes, so repeating one gives the same result.
- `collection(...).doc()` with no argument lets the platform generate the id.
- Not ported: the live "resume an interrupted daily hand-in" feature. It is superseded by the confirmed 0039 protected-paper recovery, which reopens the newest protected paper from saved attempts.
- Not ported: the live rule that a daily paper without `handedIn` counts as not handed in. `DATA.md` keeps the legacy inference (saved attempts mean handed in). Production data may contain older daily papers, so this difference is an open question for you, not an implementation choice.
- The model's runtime contract does not yet mention write retry; the model files were left unchanged.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: exit 0, "all logic tests passed". Breaking the retry condition in a copy of the page makes the suite fail.
- `./check.sh`: exit 0.
- `node verify/fake-platform-smoke.js impl/arena.html`: exit 0. With the wrapper disabled in a copy, the injected `unavailable` error propagates and the smoke fails. This is a substitute against a fake platform.
- Outside verification coverage:
  - The real platform's `unavailable` behavior was not exercised; retry timing was checked only on a fake db.
  - This candidate (every write now goes through the wrapper) has not run on the real test Artifact. The earlier real-platform observations were made on `a0422fb`.
  - The legacy daily-paper rule difference above is untested against production data.
- Acceptance handoff: needs an acceptance record whose baseline is this tree before delivery.
