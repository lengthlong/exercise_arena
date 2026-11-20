---
name: design-verify
description: Verify integrated slice behavior against journey success conditions and record the result. Use for integration or end-to-end acceptance after implementation, including before delivery when matching evidence is missing.
---

# design-verify

Run the registered `verify/` entries for a container scenario or journey slice. Use upstream implementation records and the workspace's `model/verify/SPEC.md` for environments, substitutes, coverage, sizing and exemptions. Implementation owns single-contract tests and writes or repairs acceptance entries. Acceptance writes its own record and may use the temporary or integration environment defined by the entry.

## Rules

1. If entries are absent or fail to cover the success conditions, send the gap to `design-implement`. Keep design, implementation and entries out of the acceptance change.
2. Obtain separate user confirmation for steps that write external state, including integration deployment, real integrations, paid calls, shared environments or pushing records. Otherwise mark the boundary unverified and retain a local record.
3. Mark unrun, simulated-only real boundaries or stale evidence unverified.

## Workflow

1. Select a decided scope slice or the user's specified scenario or journey steps. Note undecided scope. Use a committed baseline. Gather implementation records in its tree since the last delivery candidate for that target, or since the first commit. Include all for pre-delivery acceptance and select relevant ones for intermediate feedback. Include records from rewritten history and disclose ancestry differences. Read the relevant success conditions and contracts.
2. Match the baseline tree outside `record/` to the end commit of an implementation record with passing registered tests. Route unmatched merged trees to implementation for integration retesting. Identify commits since delivery outside record paths and outside covered implementation ranges, respecting contract exemptions. Derive their acceptance coverage from the contract.
3. Size the run from the union of paired entries and affected journey steps, the slice's steps and uncovered changes. Tell the user the sizing basis so they can adjust it.
4. Trace environments, machines, credentials and dependencies to an operator journey, external responsibility or declared substitute. Stop on missing prerequisites. Use the deploy entry for any confirmed integration deployment as acceptance setup.
5. Run the registered entries from the local map. Follow manual walkthrough instructions and record actual observations.
6. Judge every numbered success condition as `pass`, `fail` or `unverified` and cite evidence. Commit the record on the acceptance branch. Report the baseline, scope, rationale, substitutes and unverified boundaries. Route implementation defects back by `<record-name> #k` and write a fresh record after rerunning the affected portion. Return gaps in the success conditions to discussion. If all conditions pass and delivery is wanted, proceed to `design-deliver`. Otherwise take stock.

| File | When to use |
|---|---|
| [assets/record.md](assets/record.md) | Acceptance record metadata and numbered judgments. |
