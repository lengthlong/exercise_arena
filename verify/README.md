# Acceptance entries

See [model/verify/SPEC.md](../model/verify/SPEC.md) for the acceptance contract.

| Entry | Instructions | Coverage |
|---|---|---|
| Local checks | Run `./check.sh` and `node impl/logic.test.js impl/arena.html` | All journey logic and workspace consistency |
| Manual page walkthrough | Inspect the affected journeys in the published page | Changed user-visible behavior |
| Paper page walkthrough | In an authorized test Artifact, open one daily and one check paper right after hand-in and again from Today, Papers Exam and Papers Daily; compare outcome blocks, check pending written answers read "Not judged yet", override inline, and Detail then Back returns to the same card | Paper page integration in [model/verify/SPEC.md](../model/verify/SPEC.md); local logic cases cover only rows, assessment, live overlay and ladders |
