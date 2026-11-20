# Maintain support contract

- **Journey or trigger** operator/0001
- **Operator and authorization** Workspace maintainer with repository access; no external writes.
- **Environment and dependencies** Local checkout, Node.js, and the workspace checker.

## Run checks

- **Prerequisites and scope** Read the affected journey, model, data contract, and implementation before changing them.
- **Success and failure** `./check.sh` and `node impl/logic.test.js impl/arena.html` both exit 0; any failure is a defect or model gap.
- **Verification and recovery** Rerun after fixes. If behavior differs from the model, route the gap to design discussion.
- **Implementation** `check.sh` and `impl/logic.test.js`.
