---
name: record-exercises
description: 在对话里录入 Sophia 的错题（record exercises）：用户发来卷子照片或题目文字，要写进练习场时使用。
---

# record-exercises

把对话里收到的错题与题组写进练习场页面的 `db`。字段与写入规则以仓库根目录的 `DATA.md` 为准；练习场的网址写在 `app/arena.html` 的文件头注释里。

1. **读契约与体系。** 读 `DATA.md`；从 `app/arena.html` 的 `TAX`（`TAXONOMY:BEGIN…END`）取该科目的专题、概念、题型 id。
   完成：每份草稿要用的 id 都能在 `TAX` 里找到。
2. **起草。** 按 `app/arena.html` 里 `recognisePrompt` 的起草要求拆题：只列看得出她做错的题；共用材料的列成题组；语法完形、改错、句子改写按其中的写法；讲解按三段格式。
   完成：每道题一份错题草稿，共用材料的各有一份题组草稿。
3. **在对话里列出草稿，等用户确认。** 每份写明科目、专题、作答形式、题目、答案、错因、所属题组；用户要改就改，再列一次。
   完成：用户明确确认了这一批。
4. **写入。** 有照片时先上传到练习场的 `assets`，拿到 id。用 `ArtifactData` 先写 `sets`，再写 `exercises`：`attempts` 为空，派生字段写起点，写 `createdAt` 与 `recordedAt`（当前本地日期与时刻），`setPos` 按草稿顺序（补录到已有题组的取组内最大值加一）。只写 `exercises`、`sets` 与 `assets`。
   完成：读回本批每份文档，字段齐全、`setId` 指向已写入的题组；把写入的条数告诉用户。
