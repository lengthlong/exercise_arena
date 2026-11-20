# Fix acceptance defects #8 and #11 of the first-loop acceptance

> status: completed (2026-11-20)
> location: branch `develop`, commits `7ed370b..33d2906`

## Upstream
<!-- upstream -->

- 20261120-first-loop-after-0039 #8 corrected the defect
- 20261120-first-loop-after-0039 #11 corrected the defect

## Paired acceptance entries and affected journey steps

| Entry | Added, changed or affected | Journey steps |
|---|---|---|
| `node impl/logic.test.js impl/arena.html` | Changed: assertions for the supplement block and missing-question count | user/0001 2, user/0002 2 |
| `verify/fake-platform-smoke.js` | Changed: covers a recovered paper with a deleted question and a legacy set in the saved-material list (the new assertions fail on the pre-fix page) | user/0001 2a, user/0002 2b |
| `verify/README.md` | Changed: coverage line for the smoke entry | operator/0003 |
| `./check.sh` | Affected; passes | None |

## Implementation choices

- The saved-material gate reuses the existing set-link check, so what the list disables and what save later refuses cannot diverge.
- Blocked cards stay visible and disabled with the reason, so the legacy set is still seen but cannot be used.
- Selecting a blocked set is ignored. A retained selection that becomes blocked, for example after an owner change, is cleared on render. Drafting from it stops before AI with an error message.
- Photo-group sources are not sets and are not gated.
- Missing questions are counted against the current owner-scoped exercises and shown as a note on the answer and recovery page, and as a "deleted" count on the Today "Unfinished hand-ins" row. The remaining questions stay answerable.

## Tests and checks

- `node impl/logic.test.js impl/arena.html`: exit 0, "all logic tests passed".
- `./check.sh`: exit 0.
- `node verify/fake-platform-smoke.js impl/arena.html`: exit 0. Run against the pre-fix page it fails on the missing-question assertion. This is a substitute against a fake platform, not integrated acceptance.
- Outside verification coverage:
  - Judgment #4 of the acceptance record is an unverified observation, not a defect verdict, and is untouched: a failed own-settings read leaves the page on "Opening the exercise book…" instead of an unavailable message.
  - Every runtime judgment of that record stays unverified until an authorized test Artifact and test data exist.
- Acceptance handoff: ready for a fresh acceptance run of the affected portion, which needs a new acceptance record.
