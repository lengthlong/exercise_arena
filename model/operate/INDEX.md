# Operational support contracts

The maintain, deploy, recover, capacity and plan groups are active. Integrated acceptance belongs to [verify/SPEC.md](../../verify/SPEC.md), not a new operations group. Runtime retention and member cleanup belong to the page; the page never purges assets. Only an authorized capacity operation deletes assets.

| Work group | Responsibility | Journey or trigger | Contract |
|---|---|---|---|
| maintain | Produce an authorized aligned change and final local evidence | 0011 | [maintain/SPEC.md](./maintain/SPEC.md) |
| deploy | Supply test candidates and deliver accepted artifacts with separate authority | 0013 test prerequisite; 0012 delivery | [deploy/SPEC.md](./deploy/SPEC.md) |
| recover | Take and verify local backups of production records, page and photos; restore only with separate authority | 0014 | [recover/SPEC.md](./recover/SPEC.md) |
| capacity | One-off shrink of photos stored before the 2400 px limit, relinking and guarded asset deletion | User-authorized one-off repair, after a verified 0014 snapshot | [capacity/SPEC.md](./capacity/SPEC.md) |
| plan | Select sgexam.com School papers, build and re-plan a user's Paper plan in production `db`, each write confirmed | 0016, on the user's request | [plan/SPEC.md](./plan/SPEC.md) |

Actual tools are indexed in [operate/README.md](../../operate/README.md). Current manual entries still need downstream alignment with the expanded contracts; their existence does not establish acceptance or target recovery evidence.
