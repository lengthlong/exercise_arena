# Operational tools

See [model/operate/INDEX.md](../model/operate/INDEX.md) for the active operation contracts.

| Work group | Tools or configuration | Instructions | Contract |
|---|---|---|---|
| maintain | `./check.sh`, `node impl/logic.test.js impl/arena.html` | Run checks and inspect affected behavior | [maintain/SPEC.md](../model/operate/maintain/SPEC.md) |
| deploy | Manual Claude artifact publication | Publish only after acceptance and explicit authorization | [deploy/SPEC.md](../model/operate/deploy/SPEC.md) |
| recover | `operate/recover/backup.mjs` with the Claude Artifact tools | [recover/README.md](./recover/README.md) | [recover/SPEC.md](../model/operate/recover/SPEC.md) |
| capacity | `operate/capacity/shrink-legacy.mjs` with the Claude Artifact tools | [capacity/README.md](./capacity/README.md) | [capacity/SPEC.md](../model/operate/capacity/SPEC.md) |
| plan | `operate/plan/plan.mjs` with the Claude Artifact tools | [plan/README.md](./plan/README.md) | [plan/SPEC.md](../model/operate/plan/SPEC.md) |
