# Address acceptance observation #4: failed required reads

> status: completed (2026-11-20)
> location: branch `develop`, commits `f27385d..f73fd7f`

## Upstream
<!-- upstream -->

- 20261120-first-loop-after-0039 #4 corrected the defect

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `verify/fake-platform-smoke.js` | Changed: the fake platform can inject read, identity and registration failures; four extra pages assert the new presentation (the settings assertion fails on the previous page, which stays on "Opening the exercise book…") | user/0010 3, 4, 5 |
| `verify/README.md` | Changed: coverage line | operator/0003 |
| `node impl/logic.test.js impl/arena.html` | Affected; passes (no pure logic changed) | None |
| `./check.sh` | Affected; passes | None |

## Implementation choices

- Judgment #4 was `unverified`, a code-inspection observation and not a defect verdict. This change brings the page in line with user/0010 extensions 3a, 4a and 5a and the runtime contract C1 and corrects the gap the observation named.
- A new `noread` status shows "Couldn't read your data", names what failed, says it is not an empty exercise book and asks for a reload. The old sign-in wording stays only for a missing db or identity.
- It applies to the own-settings read (only before settings were ever read) and the exercises, papers and question-set snapshots. A settings listener error after a successful read keeps the working page, as before.
- A failure obtaining the identity is treated like a missing db instead of an unhandled rejection.
- A registration failure does not block practice. A persistent warning explains that others may not see the user in matches.
- Recovery is a page reload; no in-page retry was added.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: exit 0, "all logic tests passed".
- `./check.sh`: exit 0.
- `node verify/fake-platform-smoke.js impl/arena.html`: exit 0. This is a substitute against a fake platform, not integrated acceptance.
- Outside verification coverage: real platform listener error behavior (whether and how the real db reports a failed read, and whether a listener can recover without reload) is unknown. Every runtime judgment of the first-loop acceptance record stays unverified until an authorized test Artifact and test data exist.
- Acceptance handoff: ready for a fresh acceptance run of the affected portion, which needs a new acceptance record.
