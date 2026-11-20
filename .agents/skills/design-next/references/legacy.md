# Legacy record compatibility (design-next)

Read this only when the workspace contains historical Chinese records or a record-chain cutover.

- Read both structured and legacy Chinese record formats in the same workspace.
- Recognize legacy active discussion statuses alongside structured ones: `讨论中` (`in-progress`) and `待落盘` (`pending-write-off`).
- Interpret both sets of implementation handoff outcomes: `落实` (`implemented`), `无对应实现` (`no-implementation`) and `不落实` (`not-implemented`).
- Recognize both `cutover: NNNN` and legacy `切换点：NNNN` in cutover implementation records, and use historical Git commit messages containing `落实 NNNN` to determine implementation status for discussions at or before that cutover.
