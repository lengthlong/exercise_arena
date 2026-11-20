# 0019 全站紧凑；卷子列表区分两种卷并加筛选排序；Ladders 改饼图；Exercises 每科小结

> 状态：**✅ 已完成（2026-10-16）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 控件收紧到什么程度、答题区要不要一起收 | 已裁 | A：全站按 Exercises 筛选的尺寸收紧，卷上的答题区不动| 二·D1 |
| D2 各区块的间距 | 已裁 | A：全站块间 12px、块内边距 12px、块内间距 8px，列表行一起收| 二·D2 |
| D3 Settings 页的布局 | 已裁 | A：一块四行左标签右控件；阶梯说明默认收起；Export 一行| 二·D3 |
| D4 卷子列表怎样区分每日卷与检验卷 | 已裁（颜色由 D4a 改裁） | A：一个列表，每行最前类型标签与左侧色条 | 二·D4 |
| D4a 类型标签与色条用什么颜色、每日卷标签叫什么 | 已裁 | A：每日卷灰（灰条、灰描边「Daily paper」），检验卷深色（`--ink` 左条、实心「Check paper」） | 二·D4 |
| D5 卷子列表的筛选与排序 | 已裁 | A：Owner、Kind、Subject、Status 筛选；Created、Done、Score、Questions 排序可切升降；20 张一页| 二·D5 |
| D6 Last 7 days 柱状图铺满宽度 | 已裁 | 用户原话直接定：柱状图随页面宽度横向拉伸、铺满 | 二·D6 |
| D7 Ladders 的饼图与原来的条形图 | 已裁 | 删 Mastered 一块与 Waiting for 标题（用户原话）；A：环形图加图例（题数、百分比），条形图去掉 | 二·D7 |
| D8 Exercises 每科小结写什么 | 已裁 | A：每科一张小卡（题数、阶梯横条、到期与掌握、平均错次、前三专题、错因），点卡按科筛选；原错因行去掉| 二·D8 |
| D8a 每科小结跟随哪些筛选 | 已裁 | A：只跟 Owner| 二·D8 |
| D9 Exercises 加不加文字搜索 | 已裁 | A：加搜索框，匹配题干与题组材料正文，忽略大小写| 二·D9 |

## 目的

用户原话：「Improve the app's UI/UX to make it more user friendly. Some hints: 1. make all the widgets(including buttons, dropdowns, edits, titles, captions, etc) on all pages more compact. (the filters on 'Exercises' page are good examples). 2. make all the sections on all pages more compact. (the 'Settings' section on 'Settings' page is a bad example.) 3. distinguish 'Daily' and 'Test' papers better, in the 'PAPERS' section of 'Papers' page. Add more filters and sorters. 4. make the bar diagram in 'LAST 7 DAYS' of 'Today' page expandable horizontally, fill the width of the page. 5. remove 'MASTERED' in 'LADDERS' section of 'Today' page. Add a pie char diagram to show the percentages of each ladder. remove 'WAITING FOR' title/caption. 6. Add a summary section for each subject to 'Exercises' page to better summarise the exercises. 7. etc. (don't limit to my hints. improve others if you can).」

用户说的「Test」卷即术语表的 Check paper（检验卷）；页面上照旧写「Check paper」。

本轮具体交付：

1. 实现：`app/arena.html` 的样式与 Today、Record、Exercises、Papers、Settings 各页；新规则写成纯函数，断言写进 `app/logic.test.js`。
2. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳用 10-16 读出的真实数据副本以 Sophia 逐页看过，符合裁决；375 宽看一次，没有横向滚动；发布后读回线上页面核对。

## 输入

- 同主题未完成讨论：无（0001–0018 均为 ✅）。
- 0018（已完成）：Today 四个主区 Today、Next 7 days、Last 7 days、Ladders；Ladders 下有「Mastered」「Waiting for」两小节。本轮 D7 改 Ladders 的内容。
- 0012（已完成）：页面全英文；Exercises 的筛选一行（下拉不加标签，第一项写「All …」，选了高亮）。

---

## 一、证据

### E1 各页现在的尺寸（2026-10-16，本地测试壳，Sophia，窗口宽 1024，页面内容最宽 880）

| 页 | 页面总高 | 各块高度 |
|---|---|---|
| Today | 1425 | 问候 53、Today 167、Next 7 days 226、Last 7 days 403、Ladders 357 |
| Exercises | 2405 | 筛选块 157、列表 2034（一页 20 条） |
| Papers | 951 | Make a check paper 424、Papers 365（8 张卷） |
| Settings | 1070 | Settings 550、How the review ladder works 156、Export 186 |
| Record | 768 | Record exercises 444 |

### E2 控件现在的尺寸（`app/arena.html` 样式）

- 正文 15.5px；按钮 `.btn` 内边距 8px 14px；输入框与下拉 8px 10px、15px，宽度占满整格。
- Exercises 的筛选用 `select.compact`：6px 8px、14px，下拉不加标签。用户举它为好的例子。
- 字段标签 `label.f` 13px，标签与控件间距 4px；`.h2` 17px。
- 区块：`.wrap` 块间距 18px；`.panel` 内边距 16px、内部间距 12px。
- Settings 一块（550 高）：三组（Whose exercises、Daily redo、Weekly goal）各有小标题、上方分隔线；每个数字输入框（1–50、1–7、0–3）占满整行宽 848px；说明文字各占一行；保存按钮单独一行。

### E3 卷子列表现在怎样区分两种卷（`renderPapers`）

- 每日卷：meta 行先是灰色小标签「Daily」，再是科目标签；检验卷：科目标签，再是「Owner Sophia」。两种卷的标题字号、底色、边框相同；检验卷没有类型标签。
- 只能按 Owner 筛选；固定按组卷日期新的在前。
- 每行有「View details」或「Start」与「Delete」两个按钮。
- 现在 8 张：6 张英文每日卷、2 张英文检验卷；列出的是检验卷全部，加我（Sophia）交过的每日卷（`visiblePapers`）。每日卷每科每次交卷一张，会越积越多。

### E4 Ladders 现在（`progressBlock`）

两小节：「Mastered」0 / 121、进度条与一句「A question is mastered when you get it right on the 4th redo.」；「Waiting for」五行条形图：1st redo (day 1) 108、2nd redo (day 3) 13、3rd 0、4th 0、Mastered 0。同一句阶梯说明在 Settings 的「How the review ladder works」里也有。

### E5 Last 7 days 柱状图（`activityChart`）

SVG 固定 280×120（7 天 × 40 宽），`max-width: 440px`；在 880 宽的块里只占左边一半。

### E6 Exercises 现有的汇总

筛选块底部一行错因计数：「Didn't get the idea 100 · Misread the question 8 · Careless slip 11 · Incomplete answer 2」（随 Owner、Subject 筛选变）。没有按科目的汇总。Sophia 现在的错题（按她的阶梯）：

| 科目 | 题数 | 到期 | 掌握 | 阶梯 1/2/3/4 | 题数最多的专题 | 错因 |
|---|---|---|---|---|---|---|
| English | 107 | 94 | 0 | 94/13/0/0 | Vocabulary & collocations 33、Prepositions 14、Tenses 9、Connectors 9 | 概念 89、粗心 11、审题 6、不完整 1 |
| Science | 14 | 14 | 0 | 14/0/0/0 | Electrical system 4、Materials 2、Matter 2、Water 2 | 概念 11、审题 2、不完整 1 |

---

## 二、逐题

### D1 控件收紧到什么程度、答题区要不要一起收

证据：E1、E2。

- A（推荐）**全站一套紧凑尺寸，以 Exercises 筛选为准；答题区保持现在大小。** 正文 15.5→14.5px；按钮 5px 12px、14px；输入框与下拉 5px 8px、14px（同 `select.compact`）；字段标签 12.5px、与控件间距 2px；`.h2` 17→15.5px；数字输入框按内容宽（约 7em），不再占满整行；Record 的两个照片大按钮内边距 18→10px。答题区（卷上的题干、选项、作答框、自评按钮）不动：Sophia 在上面写答案，字与点按区要大。代价：样式改动面大，逐页都要看一遍。
- B **答题区也一起收紧。** 代价：选项与自评按钮变小，平板上不好点；手写体作答框变小。
- C **只收紧管理页（Record、Exercises、Papers、Settings），Today 不动。** 代价：Today 与别页尺寸不一致。

**裁决（2026-10-16）：A。**

### D2 各区块的间距

证据：E1、E2。

- A（推荐）**块与块之间 18→12px；块内边距 16→12px，块内间距 12→8px；块内小节的分隔线上下 12→8px。** Today 的四个主区、Exercises 的列表行（10px 14px → 7px 12px）一起收。代价：无新概念；需要逐页核对没有挤在一起。
- B **只收 Settings 与 Papers，别页照旧。** 代价：用户说的是「all the sections on all pages」。

**裁决（2026-10-16）：A。**

### D3 Settings 页的布局

证据：E1、E2。依赖 D1、D2。

- A（推荐）**一块四行，每行左标签、右控件。** 「Default owner [下拉]」「Questions per batch [10]」「Practice days per week [6]」「Check papers per week [2]」；三组小标题去掉；说明缩成两行小字，放在相关行下（default owner 一句、weeks run Monday to Sunday 一句）；Save 按钮与保存结果同一行。「How the review ladder works」改为默认收起、点开才看；「Export」缩成一行：按钮加一句说明。代价：说明文字少了一半（「Today's redo and new check papers use this person's exercises…」缩为「Today, new check papers and new exercises use this person.」）。
- B **结构不变，只按 D1、D2 收紧尺寸。** 代价：三组标题与整行宽的输入框还在，估计仍有约 380 高。

**裁决（2026-10-16）：A。**

### D4 卷子列表怎样区分每日卷与检验卷

证据：E3。

- A（推荐）**一个列表，每行最前加类型标签与左侧色条。** 每日卷：蓝色「Daily redo」、蓝色左条；检验卷：琥珀色「Check paper」、琥珀色左条（与录入页题组卡片的琥珀左条同色系，不与 TEST 的红色混）。代价：一个列表里仍混着两种，靠颜色与标签分。
- B **分成两个列表：「Check papers」与「Daily redos」各一块。** 代价：D5 的排序与筛选要在两块里各做一遍，或者两块共用一套而 Kind 筛选失去意义；检验卷少、每日卷多，两块长短悬殊。

**裁决（2026-10-16）：A。**

D4a（复审 F5、F7 引出，重议 D4 的颜色）：D4 原定每日卷蓝、检验卷琥珀，但科目标签已用这两色——English 是蓝（`--pen`），Math 是琥珀（`--amber`），Science 是绿；TEST 标签是红。英文每日卷会有两枚蓝标签，数学检验卷两枚琥珀标签。另外术语表里每日卷叫 Daily paper，Daily redo 是每日重做的题单，D4 写的「Daily redo」用错了词，标签改为「Daily paper」（按术语表，机械更正）。

- A（推荐）**每日卷中性灰、检验卷深色实心。** 每日卷：灰色左条、灰色描边标签「Daily paper」；检验卷：深色左条（`--ink`）、实心标签「Check paper」（`--ink` 底、`--paper` 字）。不与三科的蓝、琥珀、绿和 TEST 的红撞；检验卷少而重要，更醒目。代价：没有彩色。
- B **仍用蓝与琥珀，类型标签改实心、科目标签保持描边。** 代价：同色只靠填充区分，要细看。
- C **检验卷新加一个紫色，每日卷灰。** 代价：多一个颜色，亮暗两套都要定。

**裁决（2026-10-16）：A。**

### D5 卷子列表的筛选与排序

证据：E3。依赖 D4。

- A（推荐）**筛选一行与排序，样式同 Exercises。** 筛选：Owner（照旧）、Kind（All kinds / Daily redo / Check paper）、Subject（All subjects / 各科）、Status（Any status / Not done by me / Done by me）。排序：Created（默认，新的在前）、Done、Score（对题占比）、Questions（题数），旁边升降切换；空值总在最后。另有卷数与「Clear filters」。超过 20 张分页（与 Exercises 同）。代价：多一个排序纯函数与断言。
- B **只加 Kind 与 Subject 两个筛选，排序固定。** 代价：用户要的「more sorters」没有。

**裁决（2026-10-16）：A。**

### D6 Last 7 days 柱状图铺满宽度

用户原话已定：「make the bar diagram in 'LAST 7 DAYS' of 'Today' page expandable horizontally, fill the width of the page」。做法：图宽 100%，7 列平分宽度，柱宽为列宽的 60%、最宽 56px；高度固定约 120px；字号不随宽度缩放。

**裁决（2026-10-16）：用户原话直接定。**

### D7 Ladders 的饼图与原来的条形图

证据：E4。用户原话已定：删「Mastered」一块（数字、进度条与那句说明）、删「Waiting for」标题、加饼图显示各级占比。阶梯说明仍在 Settings 的「How the review ladder works」。

- A（推荐）**环形图在左，图例在右；条形图去掉。** 五段：1st、2nd、3rd、4th redo 与 Mastered；阶梯四级用由浅到深的蓝，Mastered 用绿。图例每行：色块、「1st redo (day 1)」、题数、百分比，如「108 · 89%」。环心写总题数「121」与「questions」。题数为 0 的段不画，图例照列。窄屏时图例落到环形图下面。代价：条形图的长短对比没了，由百分比代替。
- B **饼图加在条形图旁边，条形图照留。** 代价：同一组数说两遍。

**裁决（2026-10-16）：A。**

### D8 Exercises 每科小结写什么

证据：E6。

- A（推荐）**筛选块下面每科一张小卡（有错题的科目才出），并排放，窄屏换行。** 每张：「English · 107」；一条按阶梯分段的横条（颜色同 D7）；一行「94 due · 0 mastered · wrong 1.2× on average」；一行「Top topics: Vocabulary & collocations 33 · Prepositions 14 · Tenses 9」；一行错因「Didn't get the idea 89 · Careless 11 · Misread 6 · Incomplete 1」（为 0 的不出）。点一张卡 = 把 Subject 筛选设为这一科，再点取消。筛选块底部原来的整页错因一行去掉（已并进各科）。代价：多一个汇总纯函数与断言；页面变长约 130px。
- B **每科只一行数字**：「English · 107 · 94 due · 0 mastered · top: Vocabulary & collocations」。原错因行照留。代价：看不到阶梯与错因的分布。

**裁决（2026-10-16）：A。**

D8a 每科小结跟随哪些筛选（依赖 D8）：

- A（推荐）**只跟 Owner。** 小结说的是这位归属人每科的全貌，不随专题、错因、状态筛选变；列表照旧跟全部筛选。代价：筛了专题后，小结与列表的数对不上。
- B **跟除 Subject 外的全部筛选。** 代价：筛了「Due today」后小结里的「due」与题数相同，信息重复；小结不再是全貌。

**裁决（2026-10-16）：A。**

### D9 Exercises 加不加文字搜索（agent 提议）

证据：E1、E6。现在 121 道错题，一页 20 条、7 页；要找某一道只能按专题筛再翻页。

- A（推荐）**筛选一行加一个搜索框「Search question text」。** 按题干与所属题组材料的文字匹配，忽略大小写；与其他筛选同时生效；「Clear filters」一并清空。代价：多一个纯函数与断言。
- B **不加。** 代价：找一道题照旧靠筛选与翻页。

**裁决（2026-10-16）：A。**

---

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1 | `app/arena.html` 样式 | `body` 15.5→14.5px；`input[type=search]` 并入输入框的通用样式；`.btn` 内边距 5px 12px、14px；`input[type=text/number/date]`、`select`、`textarea` 内边距 5px 8px、14px（`select.compact` 并入同一尺寸）；`input[type=number]` 宽 7em；`label.f` 12.5px、间距 2px；`.h2` 15.5px；`.seg`、`.tabs` 按钮内边距收小；Record 的 `.pick` 内边距 10px、`.pick-ico` 20px、`.rec-go .btn` 去掉放大。答题区不动：`.sheet` 写定 15.5px，使 `.opt` 等继承的字号不随正文变；作答框保持现在的实际尺寸——短答框（`input.answer-in`，现由 `input[type=text]` 定为 15px）15px、内边距 8px 10px，主观题框（`textarea.answer-in`）20px、内边距 8px 10px；`.stem`、`.selfmark button`、`.mark`、`.score` 不动（复审 F3） |
| 2 | D2 | `app/arena.html` 样式 | `.wrap` 块间距 12px（顶部 padding 同步，`.tabs` 的 `margin-top` 随之）；`.panel` 内边距 12px、内部间距 8px；`.today` 内边距 10px 12px；`.plan/.review/.dash .sub` 分隔线下 8px；`.item` 7px 12px；`renderManage` 外层 `gap:16px`→12px；`.days7 li` 内边距 6px 2px；`.material`、`.empty` 同比收小 |
| 3 | D3 | `app/arena.html` Settings | `renderSettings` 改为一块：小标题「Settings」，四行 `.form-row`（左标签、右控件）：「Default owner」下拉、「Questions per batch (1–50)」「Practice days per week (1–7)」「Check papers per week (0–3)」数字框（标签照旧带范围）；三组小标题与 `.set-group` 样式删去；Default owner 行下小字「Today, new check papers and new exercises use this person.」，最后一行下小字「Weeks run Monday to Sunday. The goal shows in Next 7 days on Today.」；Save 按钮与保存结果（`.note`）同一行。「How the review ladder works」改为 `<details class="panel">`，默认收起，正文不变。「Export」一块缩成一行：「Export YAML」按钮加小字「Saves arena-export-date.yaml.txt (drop the .txt if needed): every exercise with all answers, question set, paper and these settings; photos only as counts.」，不能存文件时的提示照旧。控件 id 与保存逻辑不变；窄屏（≤480）标签与控件上下排 |
| 4 | D4、D4a | `app/arena.html` Papers | 卷子列表每行（`.item`）加类 `k-daily` 或 `k-check`：左侧 3px 色条；meta 行最前是类型标签 `.chip.k-daily`「Daily paper」或 `.chip.k-check`「Check paper」；每日卷灰色左条（`--muted`）与灰色描边标签，检验卷深色左条（`--ink`）与实心标签（`--ink` 底、`--paper` 字）；原灰色「Daily」标签删去 |
| 5 | D5 | `app/arena.html` 纯逻辑 | 加纯函数 `filterPapers(papers, f, view, uid)`：`f` 含 `owner`、`kind`（`daily`/`check`）、`subject`、`status`（`todo` = 我没交、`done` = 我交过，按 `handedInAt`），空值不筛；加 `sortPapers(papers, key, dir, view, uid)`：`created`（`madeAt` 否则 `createdAt`）、`done`（`handedInAt`）、`score`（我交过的卷取 `paperScore` 的对题数 / 题数；我没交的卷、题数为 0 的卷算空，复审 F4）、`questions`（`paperScore` 的题数）；空值总在最后；并列按 `created` 新的在前、再按 id |
| 6 | D5 | `app/arena.html` Papers | 列表头一行：小标题「Papers」；筛选一行 `.filters`：Owner（「All owners」）、Kind（「All kinds」/「Daily paper」/「Check paper」）、Subject（「All subjects」/各科）、Status（「Any status」/「Not done by me」/「Done by me」），用 `select.compact`，选了高亮；下一行卷数「N papers」、有筛选时「Clear filters」、右侧排序下拉「Sort: Created / Done / Score / Questions」与升降按钮。超过 20 张用 `pageSlice` 分页，翻页条同 Exercises。状态：`S.paperFilters`（`owner` 取代 `S.paperOwner`）、`S.paperSort`（默认 `created` 降序）、`S.paperPage`；改筛选或排序回到第 1 页。没有卷时照旧的提示；筛选后没有卷时「No papers match these filters.」 |
| 7 | D6 | `app/arena.html` Today | `activityChart` 改为 HTML：7 列 grid 平分宽度、高 120px，每列一根自下而上叠的柱子（柱宽列宽 60%、最宽 56px，段间 2px 间隔、顶段圆角），柱顶数字、柱下「Mon…/Today」，每列 `title` 照旧「15 Oct: N right, N partly, N wrong」；没有作答的天一条 2px 底线；`role="img"` 与 `aria-label` 照旧。`.chart` 的 SVG 样式删去 |
| 8 | D7 | `app/arena.html` 纯逻辑 | 加纯函数 `ladderShares(ladder)`：按 1st、2nd、3rd、4th、Mastered 五段返回 `{ key, n, pct }`，百分比取整并用最大余数法使总和为 100；总数为 0 时全为 0 |
| 9 | D7 | `app/arena.html` Today | `progressBlock`：删「Mastered」小节（数字、进度条、那句说明）与「Waiting for」标题和条形图；改为环形图（SVG，环心「121」与「questions」）加图例，图例五行：色块、「1st redo (day 1)」…「Mastered」、题数与百分比（「108 · 89%」）；题数为 0 的段不画、图例照列。颜色：四级由浅到深的蓝，Mastered 绿，色板写成 token，亮色在 `:root`、暗色在 `@media (prefers-color-scheme: dark)` 与 `:root[data-theme="dark"]` 两处（复审 F10）。环形图 `role="img"`，`aria-label` 如「Ladders: 108 at 1st redo, 13 at 2nd redo, 0 at 3rd redo, 0 at 4th redo, 0 mastered」。窄屏图例落到环形图下。`.meter`、`.ladder-bars`、`.lb-*` 样式删去 |
| 10 | D8、D8a | `app/arena.html` 纯逻辑 | 加纯函数 `subjectSummary(exs, today)`：按 SUBJECTS 顺序，每个有错题的科目返回 `{ subject, n, due, mastered, steps: [1st,2nd,3rd,4th], wrongAvg, topics: 前三 {topic, n}（多到少，并列按专题 id 字母序）, causes: [cause, n]（多到少，并列按 id 字母序，只含 n>0）}`；`due` 同 `dueNowIds` 的口径。不引用 LOGIC 块外的 `CAUSES`（测试只抽 LOGIC 块运行，复审 F2；排序按多少，与 D8 示例一致，复审 F8） |
| 11 | D8、D8a | `app/arena.html` Exercises | 筛选块下加 `.subj-cards`：每科一张卡（按钮），内容「English · 107」、阶梯分段横条（颜色同第 9 行）、「94 due · 0 mastered · wrong 1.2× on average」、「Top topics: …」、错因行（页面现有的错因英文名，如「Didn't get the idea 89 · Careless slip 11 · Misread the question 6 · Incomplete answer 1」；D8 示例里的简称只是示意，复审 F8）；数据取 `mine()` 按 Owner 筛选后的错题，不随其他筛选与搜索变；当前 Subject 筛选的那张卡高亮；点卡把 Subject 设为这一科（清 Topic、回第 1 页），再点已选的卡清掉 Subject。筛选块底部原 `byCause` 错因一行删去 |
| 12 | D9 | `app/arena.html` 纯逻辑与 Exercises | 加纯函数 `matchesQuery(e, set, q)`：`q` 去首尾空白后为空时为真；否则把题干与 `set.text`（去掉 `[[ ]]` 标记）合起来，忽略大小写包含 `q` 即真。筛选一行加 `<input type="search" id="flt-q" placeholder="Search question text">`，输入时整页重画（题数、「Clear filters」、翻页条随之更新），重画后把焦点与光标放回搜索框（复审 F6），状态 `S.filters.q`；「Clear filters」一并清空；有搜索词算「有筛选」 |
| 13 | D1–D9 | `app/logic.test.js` | 加断言并导出：`filterPapers`（kind、subject、owner、status 各一例，空值不筛）、`sortPapers`（四种键、升降、空值在后（含没交的卷的 score）、并列按 created 新的在前）、`ladderShares`（百分比和为 100、总数为 0）、`subjectSummary`（样例：题数、到期、阶梯、平均错次、前三专题、错因按多少排且只含非 0）、`matchesQuery`（空词、大小写、题组材料、`[[ ]]` 去掉） |
| 14 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；`grep -nE "<p class=\"h3\">Waiting for|class=\"meter|ladder-bars|lb-row|Whose exercises|set-group|<p class=\"h3\">Daily redo</p>|paperOwner\b"` 在 `app/` 无结果（`ladderHtml` 的提示「Waiting for the … redo」保留，复审 F1）。本地测试壳（今天固定 2026-10-16，10-16 读出的真实数据副本，Sophia）逐页：Today 柱状图铺满块宽、Ladders 为环形图与五行图例（108 · 89%、13 · 11%）、无 Mastered 小节；Exercises 两张卡（English 107、Science 14），点卡筛选、搜索可用；Papers 两种卷的标签与色条、四个筛选与四种排序；Settings 四行、阶梯说明收起、Export 一行；卷上答题区尺寸未变。记录各页总高与 E1 对照；375 宽逐页 `scrollWidth` 不超过 375。落盘者逐行对照本表核对实际稿 |
| 15 | 发布 | 线上页面 | 发布前读线上，核对与上次提交的 `app/arena.html` 相同；发布到原网址；读回线上，去掉外壳后与本地文件相同；能力与契约不变；不改数据 |
| 16 | —— | 不改 | `CONTEXT.md`、`DATA.md`、`adr/` 不改：没有新概念，数据形状不变（筛选、排序、小结只在页面上算）。0012、0018 冻结不改。提交只含 `app/arena.html`、`app/logic.test.js` 与本讨论文件；`.claude/launch.json` 与测试壳不进提交 |

## 四、复审

复审者（新上下文 subagent）交回 10 条，逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 验证 grep 的「Waiting for」会命中 `ladderHtml` 的提示 | 成立：`app/arena.html` 816 行 | 机械：行 14 收窄 grep，写明保留 |
| F2 `CAUSES` 在 LOGIC 块外，测试抽块运行会报错 | 成立：`CAUSES` 在 788 行，块止于 782 行 | 机械：行 10 不引用 `CAUSES`，错因按多少排 |
| F3 「答题区不动」的写法做不到 | 成立：`.opt` 继承正文字号；短答框实际 15px（`input[type=text]` 压过 `.answer-in`） | 机械：行 1 写定 `.sheet` 字号与两种作答框的现有尺寸 |
| F4 没交的卷 score 会算 0 | 成立 | 机械：行 5 没交算空，行 13 加断言 |
| F5 类型色与科目色撞 | 成立：`.chip.s-english` 蓝、`.chip.s-math` 琥珀 | 改设计：新题 D4a 交用户重裁，行 4 引 D4a |
| F6 搜索只重画列表时题数与按钮不更新；通用样式不含 search | 成立 | 机械：行 12 整页重画并放回焦点；行 1 加 `input[type=search]` |
| F7 「Daily redo」与术语表不符 | 成立：术语表每日卷为 Daily paper | 机械：按术语表改「Daily paper」（行 4、6），写进 D4a 说明 |
| F8 错因的顺序与名称和 D8 示例不一致；「首次出现」不确定 | 成立 | 机械：按多少排（同示例），用页面现有错因名；并列按 id 字母序 |
| F9 Settings 改写丢了范围与「drop the .txt」 | 成立 | 机械：行 3 保留 |
| F10 `.set-group` 残留、色板三处、环形图无 aria、空筛选文案 | 成立 | 机械：行 3、6、9 补齐 |

重写了行 1、3、4、5、6、9、10、11、12、13、14，按简报自查：每行对得上登记表；除 D4a 外没有新的设计选择；F3 的「保持实际尺寸」是让 D1「答题区不动」成立，没有改变答题区的现状。D4a 裁后只影响行 4 的颜色，不必再派复审。

## 五、核销（2026-10-16）

授权：用户确认完整核销表（「确认 0019 的完整核销表，按表落盘、验证、发布并提交。」）。

| 核销表行 | 状态 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | 正文 14.5px、行高 1.55；`.btn` 5px 12px / 14px；输入框、下拉（含 `input[type=search]`）5px 8px / 14px，`select.compact` 规则并入通用样式后删去；数字框 7em；`label.f` 12.5px、间距 2px；`.h2` 15.5px；`.seg`、`.tabs` 收小；Record 照片按钮 10px、图标 20px，`.rec-go .btn` 放大规则删去。答题区：`.sheet` 写定 15.5px、行高 1.6，`.sheet input.answer-in` 15px、`.sheet textarea.answer-in` 20px，内边距均 8px 10px。测试壳里新旧页同开每日卷对照：选项 15.5px、高 43；选词按钮 15.5px、高 39；题干 16px；主观题框 20px、高 138——完全一致 |
| 2 | ✅ | `.wrap` 间距 12px、顶部 12px（`.tabs` 的 `margin-top` 同步）；`.panel` 12px / 8px；`.today` 10px 12px；三区 `.sub` 分隔线下 8px；`.item` 7px 12px；管理页外层间距 12px；`.days7 li` 6px 2px；`.material`、`.empty` 收小；`.dash` 的 18px 间距删去 |
| 3 | ✅ | Settings 一块四行 `.form-row`，标签带范围；两行小字照表；Save 与保存结果同一行；`.set-group` 样式删去；阶梯说明改为默认收起的 `<details class="panel">`，正文未改；Export 一行，说明照表（含「drop the .txt if needed」）。控件 id 与保存逻辑未改；≤480 宽上下排 |
| 4 | ✅ | 卷子行加 `k-daily` / `k-check`：每日卷灰色左条与灰色描边「Daily paper」，检验卷 `--ink` 左条与实心「Check paper」；原「Daily」标签已删 |
| 5 | ✅ | 加 `filterPapers`、`sortPapers`，规则照表；没交的卷 score 为空 |
| 6 | ✅ | 列表头「Papers」、四个筛选、卷数与「Clear filters」、排序下拉与升降、20 张一页；`S.paperFilters`、`S.paperSort`、`S.paperPage` 取代 `S.paperOwner`；筛选后为空时「No papers match these filters.」。测试壳：按 Score 降序为 7/10、8/12、13/24；Kind 选 Check paper 后「2 papers」 |
| 7 | ✅ | `activityChart` 改为 HTML 7 列叠柱，铺满块宽；柱宽 60%、最宽 56px，段间 2px；每列提示照旧；`.chart` 样式删去 |
| 8 | ✅ | 加 `ladderShares`（最大余数法）；Sophia 为 89% 与 11% |
| 9 | ✅ | Ladders 只剩环形图与五行图例（「108 · 89%」「13 · 11%」…），环心「121 questions」；为 0 的段不画；四级蓝与 Mastered 绿的 token 写在 `:root` 与两处暗色规则；`role="img"` 与 `aria-label`；≤420 宽图例落到图下。`.meter`、`.ladder-bars`、`.lb-*` 样式删去。色板用 dataviz 的校验脚本跑过：相邻色在色盲模拟下可分（亮色 ΔE 13.3、暗色 13.4），最浅一档对底色对比不足 3:1，但每段都有带数字的图例，这是脚本要求的补救做法 |
| 10 | ✅ | 加 `subjectSummary`，不引用 LOGIC 块外的 `CAUSES` |
| 11 | ✅ | 筛选块下每科一张卡；只按 Owner 筛选；点卡筛选，再点取消，选中高亮；原错因一行删去。测试壳：English 107（94 due · 0 mastered · wrong 1.2×，前三专题 Vocabulary & collocations 33、Prepositions 14、Connectors 9），Science 14；点 Science 卡后列表「14 exercises」 |
| 12 | ✅ | 加 `matchesQuery` 与搜索框（占满筛选块第一行）；输入时整页重画，并把焦点放回搜索框。测试壳：搜「stitch」得「4 exercises」（命中题组材料），焦点仍在 `flt-q`，出现「Clear filters」 |
| 13 | ✅ | 断言照表补齐并导出 |
| 14 | ✅ | `./check.sh` 退出码 0；`node app/logic.test.js app/arena.html` 通过；残留检索在 `app/` 无结果（`ladderHtml` 的「Waiting for the … redo」提示保留）；控制台无错误。落盘者逐行对照本表核对实际稿：除行 14 外，有三处表外的实现细节——搜索框占满第一行、图例最宽 360px、Settings 控件靠左——都只是排版，没有新语义。页面总高（宽 1024，对照 E1）：Today 1425→1072，Exercises 2405→2333（加了约 130 的小卡），Papers 951→847，Settings 首块 550→287（整页已不超过一屏）。375 宽五页 `scrollWidth` 均为 375；亮、暗两套都看过 |
| 15 | ✅ | 发布前读线上（1792115079-39f9），去掉外壳后与上次提交的 `app/arena.html` 逐字相同。发布为第 28 版（1792123109-5f7e），能力与契约照旧，数据未改。读回线上，去掉外壳后与本地文件逐字相同；有新内容（环形图、小卡、类型标签、筛选、搜索、收起的说明），没有已删的类名 |
| 16 | ✅ | `CONTEXT.md`、`DATA.md`、`adr/` 未改；提交只含 `app/arena.html`、`app/logic.test.js` 与本讨论文件；`.claude/launch.json` 与测试壳不进提交 |

未验证：在真实 claude.ai 里用 Sophia 账号打开的显示（测试壳模拟了 `db` 与用户）；平板上的实际点按手感。
