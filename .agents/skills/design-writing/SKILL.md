---
name: design-writing
description: 写或复审本工作区的设计文字（write / review design docs）：术语表、ADR、数据契约、研究笔记、给人看的总述。用于：新写或改写这些文件；复审它们的写法。
---

# design-writing

本工作区是软件系统设计。各文件的一句话用途与权威见 `CLAUDE.md` 的地图。共守语义、设计与实现分工、面向人读的结构与表达（「一句话 + 图 + 编号要点 + 概念表」总述）、ADR 与术语表写法，按 `design-discuss` 的 `WRITING.md`。这里规定本工作区的文件边界、内容标准、方法与图格式。

## 各文件只写什么

各设计文件各答一个问题，互不复述：

| 文件 | 写什么 | 不做什么 |
|---|---|---|
| `CONTEXT.md` | 一两句话的定义 + `_Avoid_` 列表（写法见 `WRITING.md`） | 不讲理由 |
| `adr/` | 理由与取舍（写法见 `WRITING.md`） | 不复述数据契约 |
| `DATA.md` | `db` 的字段、派生字段、写入规则、归类体系的来源、留白 | 不写页面规则；页面规则写成 `app/logic.test.js` 的断言 |

## 内容标准

- **设计文件只写现状。** 决定变了就改写原文件（含 ADR），不加「历史」一节。
- **设计文档描述模型，不描述 MVP 边界。** 模型说「是什么」，「先做哪一半」留给规划期。

## 表达方式

1. **能画图就画，Markdown 文件里的图用 Mermaid。** 概念与关系画类图，结构画流程图/组件图，交互画时序图，不用 ASCII 图。研究笔记按 `design-research` 的骨架与本目录的 [RESEARCH-SECTIONS.md](./RESEARCH-SECTIONS.md) 适用节配图。发布到 Lark 时按启用集成转为 PlantUML。
2. **按成熟方法组织。** 架构按 C4（System Context / Container / Component，交互用 Dynamic）；领域按 DDD（统一语言、不变式、限界上下文）；需要时用 arc42 等其他方法补齐。

## 改完之后

- **按实际影响同步、跑 `./check.sh`**，见 `WRITING.md`。
- **新增或改动的每张图**，落盘验证时经启用集成的「图的校验」；没有启用提供它的集成时，按 `design-publish` 的能力退路跳过，并在讨论的核销里披露。
