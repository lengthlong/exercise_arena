# Discussion lifecycle and reviews

## Scope changes

Check the dependencies and assumptions of settled decisions. Keep unaffected decisions. Reopen affected questions for the user and update them in place. A new record alone does not reopen previous decisions. Preserve frozen records.

## Writing off in batches

Use batches for a real reason, such as an early user deliverable, an external blocker that leaves a verifiable batch, or a confirmed change needed for later evidence.

1. Record the reason, scope and plan for remaining questions. Confirm, apply and verify each batch as usual. Resolve the genuine trade-offs within that batch before it proceeds.
2. Keep status `in-progress` and the `<!-- write-off-plan -->` marker while more batches remain. Record each batch's date, scope, commit and actual results in a separate section. Return to pending questions.
3. After the final batch, replace the plan marker with `<!-- write-off -->` and set `completed`.

## Pause and resume

Pause before confirming the write-off. Keep `in-progress`. Record the stopping point, replacement work if any, and baseline in the body. Check and commit the record. On resumption, inspect `git log <baseline>..HEAD`, check decisions and evidence against intervening changes, reopen affected choices and update the baseline.

## Abort and hand off

Set `aborted` and record the reason in the body. State where work stopped, settled choices and their assumptions, open questions and where a successor should start. Commit the record.

## Review an applied design

Compare each decision, its planned change and the actual commit from `git show`. For a light discussion use the proposed change on each question. Trace implementation through upstream design-row or question references. For pre-cutover discussions use the historical `落实 NNNN` commit lookup. Record your conclusion in a new discussion.
