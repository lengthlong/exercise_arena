# 0038 Newly mastered：按科目分组，按 Key idea 列出，不列专题

> 状态：**讨论中（2026-11-08）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| M1 每一项列什么 | 已裁 | 用户原话：写这道题考的关键词汇或语法（不列专题、概念，也不列题干）；来源见 M1a | 二·M1 |
| M1a 关键词汇或语法从哪来 | 已裁 | A：用每道题讲解里现成的 Key idea；同科里一字不差的并成一行写 ×n；没有 Key idea 的退回写题干 | 二·M1a |
| M2 怎样按科目分组 | 已裁 | C：每科一个小标题（科目标签 · 道数），先列前 3 行，其余写「+N more」点开（用户选，推翻推荐 A） | 二·M2 |
| M3 点一道题能不能打开它 | 被取代 → M3′ | — | 二·M3 |
| M3′ 一行（一句 Key idea，可能 ×n）能不能点开 | 已裁 | C：点一行展开它代表的几道题的题干，每个题干再点开这道题的详情（用户选，推翻推荐 A） | 二·M3 改写 |

## 一、目的

用户原话：「Improve the "Newly mastered" section on Today page: 1. Group the items by subject in some way; 2. Don't list the topics, mastering one question dose not mean mastering one topic; 3 others you can think of」

本轮交付：Today 页 This week、Last week 两块里的「Newly mastered」小块改为按科目分组、按题列出；第 3 点由 agent 提议、逐题交用户裁。

1. 实现：`app/arena.html` 的纯逻辑 `weekReview` 的 `newlyMastered` 与渲染 `masteredList`；断言改进 `app/logic.test.js`。
2. 设计文件：`CONTEXT.md`、`DATA.md` 没有写 Newly mastered 的分组规则（取证见 E3），预计不改；核销时逐个核对。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳看过 This week、Last week 两块，375 宽没有横向滚动，深色主题可读。重新发布到原网址另问用户。

## 输入

- 同主题未完成讨论：无（0001–0037 均为 ✅）。

## 二、取证与题

### 证据

- E1（代码）：`weekReview(done, from, to)` 把区间内变成掌握、且现在仍掌握的错题，按「科目 + 概念」分组，没填概念的按「科目 + 专题」，每组记道数，按道数降序、再按 id 排。`masteredList` 每组一行：科目标签、概念名（链接到知识图）或专题名、道数大于 1 时写「×n」。没有新掌握时不显示这一小块。This week 与 Last week 两块都用它。
- E2（讨论 0009 D5）：当时选「按概念列、带道数，没填概念的按专题」，代价已写明「一个概念下还有没掌握的题，列出来不等于整个概念都会了」。用户这次指出的正是这个代价；概念与专题同样有此问题（术语表：掌握是一道错题在复习阶梯上的状态，概念、专题只是归类）。
- E3（设计文件）：`CONTEXT.md` 没有 Newly mastered 词条；`DATA.md` 只写字段与派生字段，不写 Today 的分组。规则只在 `app/logic.test.js` 一条断言里（「新掌握按概念分组，没填概念的按专题」）。
- E4（代码）：Exercises 列表每题一行，标题是题干的纯文字（`plain(e.stem)`），没有题干时写「(see the set material)」（属于题组）或「(photo only)」。卷子作答页已有 `goto-ex` 动作：切到 Exercises、打开这道题的详情。
- E5（数据量，讨论 0031、0032）：线上约 302 道错题，按每周新录十道估计；一批同一天录入、按时全做对的题会在同一天掌握，所以一周新掌握可以是几道，也可以是二三十道（推断，确定程度中：没有统计过历史上单周的最大值）。
- E6（代码）：科目固定三个，顺序 English、Math、Science（`SUBJECTS`）；科目标签 `subjChip` 带科目颜色。

### M1 每一项列什么

用户已定：不再列专题。概念同理（E2），一并不列。

- A（推荐）**列题目本身。** 每道新掌握的题一行，写题干的纯文字，一行放不下用省略号截断（悬停看全文）；没有题干时照 Exercises 列表写「(see the set material)」或「(photo only)」（E4）。例：「He was born [[in]] 1990.」显示为「He was born in 1990.」。设计里变的：`newlyMastered` 不再按概念 / 专题分组，改为逐题；「×n」去掉。代价：照片题、题组里的题只显示占位文字，认不出是哪道。
- B **不列题，只写每科几道。** 例：「English 3 · Math 1」。代价：看不到是哪几道，小块的信息量很少。
- C **列题目，后面灰字带专题。** 代价：用户说不要列专题，灰字仍可能被读成「这个专题会了」。

用户答（2026-11-08，未选上面三项）：「Can you summary the key vocabularies or grammars ?」—— 每一项写这道题考的关键词汇或语法，而不是题干。

补充证据：

- E7（代码与录入提示）：`solution` 按 `Key idea:` / `Steps:` / `Watch out:` 三段写；录入时 AI 的提示是「Key idea: one sentence naming what the question tests」；页面已有 `parseExplanation(text).keyIdea` 取出这一句（`app/logic.test.js` 有断言，例「Use [[contrast]] connectors.」）。数学、科学的题同样有这一句。
- E8：手录或旧题的讲解可能没有 `Key idea:` 标记，`keyIdea` 为空（`parseExplanation` 此时按空行分段）。线上有几道没有，未统计（未知；影响只是这些题要有退路）。

M1 改问：关键词汇或语法从哪来（见 M1a）。

### M1a 关键词汇或语法从哪来

- A（推荐）**用每道题讲解里现成的 Key idea 一句。** 每道新掌握的题一行写它的 Key idea（`[[ ]]` 照讲解的写法高亮）；同一科里 Key idea 一字不差的几道并成一行、写「×n」；没有 Key idea 的题退回写题干（再没有题干时照 Exercises 列表写「(photo only)」或「(see the set material)」）。例：「Use [[in]] before a year. ×2」。设计里变的：`newlyMastered` 改为按科目、按 Key idea 汇总，不新增字段、不调 AI。代价：Key idea 是一整句，比「in + year」这样的短语长；各题措辞不同时不会合并。
- B **打开页面时请 Claude 把本周新掌握的题总结成每科几条关键词汇或语法。** 设计里变的：页面要新声明「问 Claude」的运行能力，每次打开都要等回答，结果每次可能不同，要稳定还得把总结存进 `db`（新数据）。代价：慢、要花额度、新概念多。
- C **新加一个字段「关键点」（短语，如「born in + year」），录入时由 AI 写。** 设计里变的：`DATA.md` 加字段、录入提示加一项，旧题没有这个字段，要补写或退回 A 的写法。代价：多一个字段和一次补写，旧题仍要退路。

裁决（2026-11-08）：A。

### M2 怎样按科目分组

依赖 M1a：每一行是一句 Key idea（或退回的题干），一行可能代表几道题（×n）；下面的「道数」按题数。

- A（推荐）**每科一行摘要，可展开看题。** 每科一行：科目标签与道数（「English · 3 questions」），点一下展开该科新掌握的题（原生的展开 / 收起），默认收起；科目按固定顺序 English、Math、Science（E6），只列有新掌握的科目；科内的题按掌握日期新到旧。小块标题后写总数（「Newly mastered · 4」）。设计里变的：一周掌握二三十道时也只占两三行（E5），与 0034 精简界面的方向一致。代价：要点一下才看到题。
- B **每科一个小标题，下面全部列出。** 科目标签与道数作小标题，题全部展开列在下面。代价：一周掌握得多时这一块很长，This week 与 Last week 两块各一份。
- C **每科一行，先列前 3 道，其余「+N more」点开。** 代价：多一条「前几道」规则，摘要和展开各一套写法。

裁决（2026-11-08）：C（用户选，推翻推荐 A）。随之定下、核销表里写明供确认的机械细节：小块标题写总题数（「Newly mastered · 4」）；科目按 English、Math、Science 的固定顺序，只列有新掌握的科目；小标题是科目标签加该科题数；科内的行按道数降序、再按最近一道的掌握日期新到旧、再按文字；「+N more」的 N 是余下的行数，点了在原地展开（原生展开 / 收起）。

### M3 改写：一行能不能点开

M1a 之后一行是一句 Key idea，可能代表几道题（×n），原来的「点一道题打开详情」不再一一对应。

- A（推荐）**不能点，只是文字。** Key idea 已说明考什么；想看原题去 Exercises。设计里变的：无新动作。代价：看不到是哪道原题。
- B **只代表一道题的行能点，打开它的详情（沿用 `goto-ex`）；×n 的行不能点。** 代价：同一列表里有的能点、有的不能，规则不直观。
- C **点一行展开这几道题的题干，每个题干再点开详情。** 代价：列表里再套一层展开，与「+N more」叠在一起，层次多。

裁决（2026-11-08）：C（用户选，推翻推荐 A）。随之定下、核销表里写明供确认的机械细节：只代表一道题的行同样可展开（规则一致）；题干照 Exercises 列表写纯文字、一行截断，没有题干时写「(see the set material)」或「(photo only)」；点题干沿用已有的 `goto-ex`。退回写题干的行（没有 Key idea）本身就是题干，点它直接打开详情，不再展开一层。

M1 的原题已被 M1a 取代，第 3 点「其他」由 agent 提议的三项已并入：标题写总数（M2）、点开看原题（M3′）、没有 Key idea 时的退路（M1a）。

### M3 点一道题能不能打开它

依赖 M1 选 A。

- A（推荐）**能。** 每道题是一个按钮，点了切到 Exercises 打开这道题的详情，沿用作答页已有的 `goto-ex` 动作（E4）。设计里变的：这一块可以点，照片题、题组题的占位文字（M1 的代价）也能点开看原题。代价：几乎没有，不新增动作。
- B **不能，只是文字。** 代价：照片题与题组题认不出是哪道。

## 三、核销表

| 行 | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | M1、M1a、M2 | `app/arena.html` 纯逻辑 | `weekReview` 的 `newlyMastered` 改为按科目分组的数组：`[{ subject, n, rows }]`。取区间内变成掌握、现在仍掌握的错题（条件不变）；每道题取 `parseExplanation(e.solution).keyIdea`（去首尾空白）。同一科里 Key idea 一字不差的并成一行 `{ key, n, items, last }`；没有 Key idea 的题各自一行 `{ key: '', n: 1, items, last }`。`items` 是 `{ id, stem, setId, photo }`（`photo` 为有照片），`last` 为这一行里最近的掌握日期。行按 `n` 降序、`last` 新到旧、文字（Key idea 或题干）升序；科目按 `SUBJECTS` 的顺序，只出有新掌握的科目；科目的 `n` 是题数。不再按概念、专题分组 |
| 2 | M2、M3′ | `app/arena.html` 渲染 | `masteredList`：没有新掌握时不显示（不变）。标题「Newly mastered · 总题数」；每科一个小标题：科目标签与该科题数；先列前 3 行，其余放进「+N more」（N 为余下的行数，原生 `details` 原地展开）。Key idea 行：`details`，摘要是 Key idea（`[[ ]]` 照讲解高亮）与 `n > 1` 时的「×n」，展开后列这几道题的题干按钮；没有 Key idea 的行：直接是题干按钮。题干按钮写纯文字、一行截断（`title` 带全文），没有题干时写「(see the set material)」或「(photo only)」，点了走 `goto-ex` 打开这道题的详情。去掉概念链接与专题名。CSS 随之调整，375 宽不横向滚动 |
| 3 | M1a、M2 | `app/logic.test.js` | 改写「新掌握按概念分组」那条断言：同科 Key idea 相同的两题并成一行 ×2；没有 Key idea（讲解无标记）的题自成一行、`key` 为空；不同科分到各自组、按 English、Math、Science 的顺序；行序按道数、再按最近掌握日期；窗口外的题不算；掌握后又做错的不算。原有空列表断言保留 |
| 4 | — | `CONTEXT.md`、`DATA.md`、`adr/` | 不改：Newly mastered 的分组只是 Today 的显示，术语表与数据契约都没写它（E3）；不新增字段（M1a） |
| 5 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；落盘者对照本表逐行核对实际稿；本地测试壳造多科新掌握（含 Key idea 相同、没有 Key idea、照片题、题组题、某科超过 3 行）看 This week 与 Last week，点「+N more」、点行、点题干能打开详情；375 宽与深色主题下可读、无横向滚动 |
| 6 | 发布 | 线上 Artifact（外部操作） | 重新发布到 `app/arena.html` 文件头写的原网址，并更新文件头注释；**执行前单独问用户**，核销表确认不代表授权发布 |
