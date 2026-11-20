# 用户旅程

按日常使用顺序排列。每条旅程只解决一个目标；跨旅程复用不占编号。

| ID | Actor | Goal | Body | Status | TODO |
|---|---|---|---|---|---|
| 0001 | User | Record a wrong exercise | [0001-record-a-wrong-exercise.md](./0001-record-a-wrong-exercise.md) | detailed | — |
| 0002 | User | Do today’s daily redo | [0002-do-todays-daily-redo.md](./0002-do-todays-daily-redo.md) | detailed | — |
| 0003 | User | Take a check paper | [0003-take-a-check-paper.md](./0003-take-a-check-paper.md) | detailed | — |
| 0004 | User | Review progress | [0004-review-progress.md](./0004-review-progress.md) | detailed | — |
| 0005 | User | Play a match | [0005-play-a-match.md](./0005-play-a-match.md) | detailed | — |
| 0006 | User | Manage settings | [0006-manage-settings.md](./0006-manage-settings.md) | detailed | — |

## Scope slices

| Slice | Included steps and extensions | Excluded | Prerequisites and substitutes | Cross-role dependencies |
|---|---|---|---|---|
| First usable loop | 0001 全部；0002 主线 1–4 | 0003–0006 | 可用 Claude 账号；至少一道已录错题 | operator/0002 发布后可用 |
