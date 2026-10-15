# 数据契约

练习场页面的 `db` 里存什么、怎样写。页面（`app/arena.html`）与用 `ArtifactData` 改数据的 agent 都按这里读写；数据比代码活得久，旧数据要能照常读。改字段、写入方式或派生规则时先改这里。

所有日期是设备本地日期，写成 `YYYY-MM-DD`；时刻是设备本地时间，写成 `YYYY-MM-DDTHH:mm`。

## `exercises/{id}`：错题

作答嵌在错题文档的 `attempts` 数组里，不单独成集合：一份数据库最多 25,000 份文档，嵌入后文档数只随错题数增长。

| 字段 | 类型 | 说明 |
|---|---|---|
| `subject` | `"english"` · `"math"` · `"science"` | 必填 |
| `topic` | 字符串 | 专题 id，必填，取自页面内嵌的归类体系（见下文「归类体系」） |
| `concept` | 字符串或 `null` | 概念 id |
| `qtype` | 字符串或 `null` | 题型 id |
| `format` | `"mcq"` · `"pick"` · `"short"` · `"open"` | 作答形式：选择、选词、短答、主观 |
| `stem` | 字符串 | 题目文字；只有照片时可以为空；`[[词]]` 显示为下划线 |
| `images` | 字符串数组 | 照片的 asset id |
| `options` | 字符串数组 | 选择题的选项，按 A、B、C、D 顺序；其他形式为空数组 |
| `answer` | 字符串 | 选择题为选项字母；选词题为所属题组词表中的词；短答题为首选答案；主观题为标准答法（句子改写写整句） |
| `accepted` | 字符串数组 | 短答题的全部可接受答案，含 `answer`；其他形式为空数组 |
| `solution` | 字符串 | 讲解，按 `Key idea:` / `Steps:` / `Watch out:` 三段写；得分关键词写成 `[[关键词]]` |
| `wrongAnswer` | 字符串 | Sophia 当时的错答 |
| `mustUse` | 字符串数组，可省 | 只用于主观题：必须用的词；用「…」分开的项表示须按顺序出现的几部分，例如 `Neither…nor` |
| `cause` | `"concept"` · `"misread"` · `"careless"` · `"incomplete"` | 错因：概念没懂、审题错、粗心、答法不完整 |
| `source` | 字符串 | 出处，例如「2026 P5 SA2 卷二第 7 题」 |
| `createdAt` | 日期 | 录入日期 |
| `recordedAt` | 时刻，可省 | 录入时刻；新录入的都写，旧错题没有 |
| `attempts` | 作答数组 | 见下表，按时间顺序追加 |
| `step` · `due` · `mastered` · `wrongCount` · `lastAttemptAt` | 派生 | 见「派生字段」；每次写 `attempts` 时一并写回 |
| `setId` | 字符串或 `null`，可省 | 所属题组；省略等同 `null`，即独立的错题 |
| `setPos` | 数，可省 | 组内顺序；本批按草稿顺序，后来补录的取组内最大值加一 |
| `test` | 布尔，可省 | 测试数据标记 |

作答：

| 字段 | 类型 | 说明 |
|---|---|---|
| `date` | 日期 | 作答日 |
| `mode` | `"daily"` · `"paper"` | 每日重做或检验卷 |
| `paperId` | 字符串或 `null` | 检验卷 id |
| `response` | 字符串 | 她的回答 |
| `result` | `"right"` · `"partial"` · `"wrong"` | 对、部分对、错 |
| `judgedBy` | `"auto"` · `"self"` · `"parent"` | 自动判、自评、改判（存储值仍为 `"parent"`，界面显示「改判」） |
| `at` | 时刻，可省 | 作答时刻；旧作答没有 |

## `sets/{id}`：题组

| 字段 | 类型 | 说明 |
|---|---|---|
| `subject` | 同错题 | 必填；组里的错题与它同科目 |
| `title` | 字符串 | 例如「义卖会传单」 |
| `text` | 字符串 | 材料文字；只有照片时可以为空 |
| `images` | 字符串数组 | 材料照片的 asset id |
| `wordBank` | 字符串数组，可省 | 词表；组内选词题从中选答 |
| `source` | 字符串 | 出处 |
| `createdAt` | 日期 | |
| `test` | 布尔，可省 | 测试数据标记 |

## `papers/{id}`：检验卷

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | 字符串 | 例如「Science · Water, Reproduction · 14 Oct」；没选专题时写 All topics |
| `createdAt` | 日期 | |
| `subject` | 同错题 | |
| `topics` | 字符串数组 | 专题 id；空数组表示该科目全部专题 |
| `count` | 数 | 要的题数 |
| `exerciseIds` | 字符串数组 | 抽出的错题，按卷面顺序 |
| `status` | `"open"` · `"done"` | 未做、已出结果 |
| `finishedAt` | 时刻，可省 | 完成时刻；旧检验卷没有 |
| `takenOn` · `score` | —— | 不再写入，已有的忽略；得分每次显示时由带本卷 `paperId` 的作答算出 |
| `test` | 布尔，可省 | 测试数据标记 |

## `settings/main`

| 字段 | 默认 | 说明 |
|---|---|---|
| `dailyLimit` | `10` | 每日重做的题数上限，1–50 |

## 派生字段

错题的派生字段完全由 `createdAt` 与 `attempts` 依次推出（页面里的 `deriveState`，断言在 `app/logic.test.js`）。新录入、没有作答的错题写起点：

```text
step = 1, due = createdAt + 1 天, mastered = false, wrongCount = 1, lastAttemptAt = null
```

## 写入规则

- **先题组、后错题。** 题组随组内第一道错题保存时写入。`db` 没有事务，中途失败可能留下没有错题挂着的题组；页面不显示这样的题组。
- **题组随最后一道错题消失。** 一道错题移出题组或被删除后，原题组里没有错题挂着，就删除这个题组。
- **选词题的答案在词表里。** 选词题必须属于带词表的题组；改词表时，组内选词题的答案不能落空。
- **题目文字或照片至少一项**，属于题组的可以由题组的材料满足。
- **照片先传后写。** 照片先上传到页面的 `assets`，再把 id 写进题组或错题的 `images`。

## 归类体系

三个科目的专题、概念、题型 id 与中英名称内嵌在 `app/arena.html` 的 `TAX`（`TAXONOMY:BEGIN…END` 之间），以它为准。

- 科学、数学取自两张知识图：科学 `https://claude.ai/artifact/28476983-ebca-49fd-b882-f428e4e45012`（MOE 2023 大纲），数学 `https://claude.ai/artifact/8ujg7zbHmtuCPqTVMs3hvK`（MOE 2021 大纲）。练习场只取 id 与名称，讲解留在知识图里；知识图更新后要重新提取。概念与题型链接到 `<知识图链接>#<id>`；claude.ai 外壳是否把 `#` 传给页面未实测。
- 英文体系由 agent 按新加坡小学英文语法与 PSLE 英文卷二的结构起草，未对照 MOE 大纲或 SEAB 考纲原文。
