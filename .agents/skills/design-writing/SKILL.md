---
name: design-writing
description: 写或复审本工作区的设计文字（write / review design docs）：领域、架构、详设、能力清单、研究笔记、给人看的总述。用于：新写或改写这些文件；复审它们的写法。
---

# design-writing

本工作区是软件系统设计。各文件的一句话用途与权威见 `CLAUDE.md` 的地图。所有设计文字先按 `design-discuss` 的 `WRITING.md` 共守语义规则写，改写后按它核对实际稿；ADR 与术语表的专属写法也在该文件。这里规定其余设计文件的专属要求、表达与验证。

## 各文件只写什么

各设计文件各答一个问题，互不复述：

| 文件 | 写什么 | 不做什么 |
|---|---|---|
| `domain/CONTEXT.md` | 一两句话的定义 + `_Avoid_` 列表（写法见 `WRITING.md`） | 不讲理由 |
| `adr/` | 理由与取舍（写法见 `WRITING.md`） | 不复述模型结构 |
| `domain/OVERVIEW.md` | 结构与关系，引用 ADR | 不复述论证 |
| `CAPABILITIES.md` | 待建能力 | 不解释模型 |
| `architecture/CONTAINERS.md` | 运行单元、边界、主要连接与组件归属 | 不展开组件内部职责 |
| `architecture/components/<container>.md` | 单个 Container 内的软件职责、操作与状态责任 | 不混入其他 Container 的组件分解 |
| `architecture/RUNTIME.md` | 关键场景与时序 | 不成为另一份领域规则 |
| `design/<topic>/` | 已有内容的主题目录是字段形状、提交、校验步骤与错误分支的权威；改变领域语义仍回 `domain/CONTEXT.md` / ADR | 不预建空目录；不复述 ADR 理由；不是新的领域 |

- **领域文件约束架构文件。** 架构为领域行为分配软件责任，不自行改变领域规则；规则要变，先裁决、再同步领域文件。架构收录要开发、部署、维护的软件单元，按应用与内部组件分层，不平铺成一层。
- **组件身份与领域概念身份是两条轴。** 多数组件不是模型术语；少数组件因某条领域规则离开它就说不出来，同时是 `domain/CONTEXT.md` 的词条。

## 内容标准

- **领域 Overview 只装必要概念。**
- **设计文档描述模型，不描述 MVP 边界。** 模型说「是什么」，「先做哪一半」留给规划期。

## 表达方式

用户的写作取向。

1. **能画图就画，一律 PlantUML。** 概念与关系画类图，结构画组件图，交互画时序图；不用 mermaid 或 ASCII 图。研究笔记按 `design-research` 的骨架与本目录的 [RESEARCH-SECTIONS.md](./RESEARCH-SECTIONS.md) 画。
2. **按成熟方法组织。** 架构按 C4（System Context / Container / Component，交互用 Dynamic）；领域按 DDD（统一语言、不变式、限界上下文）；需要时用 arc42 等其他方法补齐。
3. **给人看的总述按这个结构**（研究笔记按它自己的骨架）：概述（背景、目标）→ 方案（总览：Container 视图、领域视图、亮点 → 各核心对象的契约：数据形状、接口、工作方式 → 目录清单）→ 讨论 → 参考。要发布时按 `design-publish`。
4. **文字要像人写的。** 结论先行，句子短，少嵌套括号，不堆术语。

## 改完之后

- **按实际影响同步、跑 `./check.sh`**，见 `WRITING.md`。
- **新增或改动的每个 PlantUML 图**，落盘验证时经启用集成的「图的校验」；没有启用提供它的集成时，按 `design-publish` 的能力退路跳过，并在讨论的核销里披露。
