# 记录链切换：旧顶层讨论与研究整体迁入 `record/`

> 状态：**✅ 已完成（2026-11-20）**
> 位置：分支 `develop`，提交 `8391833..1b9fcbf`

## 上游

- 切换点：0038

## 正文

本工作区随 discuss-design v0.43.0 升级，首次迁入 `record/` 记录链：原顶层 `discuss/`（38 份）与 `research/`（1 份）整体 `git mv` 进 `record/discuss/` 与 `record/research/`，39 份均为 100% 重命名、内容不改；`CONTEXT.md` 移到 `model/domain/GLOSSARY.md`，`adr/` 移到 `model/adr/`，`app/` 移到 `impl/`。此前冻结的讨论（至 0038）是否落实，按各提交说明里的「落实 NNNN」判断；历史 `落实 0038` 的提交是 `997a1f5`。后续实现只接手已在自己基线里的上游记录，不再从旧讨论差异重推。

## 配对的验收入口与受影响的旅程步骤

| 验收入口 | 新增／改动／受影响 | 受影响的旅程步骤 |
|---|---|---|
| `./check.sh`（工作区检查器） | 受影响（升级到 v0.43.0 并迁移旧路径） | 无（本工作区尚未建 journey/） |

## 自定的实现取舍

- 块后地图同步改为新现状；`design-writing` 由新工具包托管，原工作区专属写法保留为用户所有的 `arena-writing`。

## 测试与检查

- 登记的测试：`node impl/logic.test.js impl/arena.html`，输出 `all logic tests passed`
- `./check.sh`：退出码 0
- 没覆盖的项：无
