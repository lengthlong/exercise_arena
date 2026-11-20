# Maintain support contract

- **Journey / steps** operator/0001 1-5.
- **Operator and authorization** Repository maintainer applying frozen design scope or authorized contract-preserving maintenance. New semantics return to discussion. No production writes/publication.
- **Environment and dependencies** Local checkout, Node.js, checker, paired model/source/entry files and identified baseline.

## Maintain an aligned change

- **Prerequisites and scope** Identify authorized upstream rows, affected journey steps and both map sides. Preserve unrelated user changes. Toolkit-managed drift uses design-init, not kernel editing.
- **Actions** Apply the authorized change and inspect affected behavior; internal implementation choices remain within settled contracts.
- **Success** Scoped changes align with contracts; final registered checks pass; an implementation record states baseline, changed pairs, tests and remaining gaps.
- **Failure / stop** Failed checks do not authorize changing a settled rule. New boundary/design gaps stop affected work and return to discussion.
- **Verification / recovery** Re-run after fixes. Local evidence is not integrated acceptance; hand off candidate and record to operator/0003 under [acceptance SPEC](../../verify/SPEC.md).
- **Implementation** Checker/source tests exist; [operate maintain entry](../../../operate/maintain/README.md) currently supplies local commands, not proof that all runtime contracts are implemented.

## Registered local checks

Run from repository root:

```sh
./check.sh
node impl/logic.test.js impl/arena.html
```

Both must exit 0 after the final change. The checker verifies workspace structure/managed consistency; the logic suite extracts pure functions into a VM. It does not execute DOM handlers, platform writes, AI/uploads or publication.

## Records and limits

Record implementation results under `record/implement/`; keep secrets, child material and field logs out of the repo. Repository access does not confer acceptance, test-data or delivery authorization.
