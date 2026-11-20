# Legacy record compatibility (design-implement)

Read this only when the workspace contains historical Chinese records or a record-chain cutover.

- Read both structured and legacy Chinese record formats in the same workspace.
- Map structured outcomes to legacy Chinese equivalents: `implemented` ↔ `落实`, `no-implementation` ↔ `无对应实现`, `not-implemented` ↔ `不落实`.
- Recognize both `cutover: NNNN` and legacy `切换点：NNNN` in cutover implementation records.
- For frozen discussions at or before the cutover ID, determine implementation status from historical Git commit messages containing `落实 NNNN`.
