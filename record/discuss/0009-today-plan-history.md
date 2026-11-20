# 0009 Today 页的一周计划与一周回顾，页面框架的整理

> 状态：**✅ 已完成（2026-10-15）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 本轮交付什么、范围到哪里 | 已裁 | 用户已定：Today 页加「计划」（未来 7 天，按内置的通行做法安排，部分参数在设置里可改）与「回顾」（最近 7 天：复习了几题、新掌握的概念、与计划对比、可行的建议）；重排 Today 页；去掉页面框架的标题或重排框架 | 二·D1 |
| D2 计划显示什么 | 已裁 | 未来 7 天（含今天）每天一格写预计重做几题，按上限模拟、假设都做对并注明是最好情况；一句积压结论；本周目标带进度 | 二·D2 |
| D3 设置里可改哪些计划参数、默认多少 | 已裁 | 三项：每日上限（已有，1–50）、每周练几天（1–7，默认 6）、每周做几张检验卷（0–3，默认 1）；预计题数仍按天天练来算 | 二·D3 |
| D11 本周目标的进度按哪段时间算 | 已裁 | 按日历周（周一到周日），周一归零；预计题数仍是未来 7 天，界面分开写；回顾按最近 7 天 | 二·D11 |
| D4 回顾里「复习了几题」怎么数 | 已裁 | 主数字按题去重（每日重做与检验卷都算）；附一行作答次数、对 / 部分对 / 错与练了几天 | 二·D4 |
| D5 「新掌握的知识点」指什么 | 已裁 | 最近 7 天变成掌握的错题按概念列、带道数，没填概念的按专题；没有时写第 4 级的题数，也为 0 时写本周升级了几道 | 二·D5 |
| D6 回顾怎样和计划对比 | 已裁 | 和目标比、不存计划：最近 7 天练了几天对目标、做完几张检验卷对目标、今天以前到期还没做的题几道（0 为跟上），达到打 ✓ | 二·D6 |
| D7 建议怎样产生 | 已裁（2026-10-15 改裁） | 内置规则最多 3 条，跟三行对比走、都按最近 7 天：① 积压未来 7 天清不完或有过期题 → 先做过期的 / 建议的最小上限；②「练了几天」未达标 → little and often；③ 检验卷未达标 → 用错得最多的专题组卷；④ 某专题错 ≥3 次 → 重读 Key idea；Great week 只在三行都 ✓ 且没有别的建议时出现 | 二·D7 |
| D8 Today 页从上到下怎么排 | 已裁 | 问候与鼓励一块 → 今天（重做与未做的检验卷一块）→ 计划 Next 7 days → 回顾 Last 7 days（14 天图改为 7 天放这里）→ 掌握进度与阶梯分布 | 二·D8 |
| D9 页面框架的标题怎么处理 | 已裁 | 去掉标题区；标签栏放最上面，滚动时贴住顶部；`<title>` 不变 | 二·D9 |
| D10 术语表是否加词条 | 已裁 | 只加「Weekly goal（每周目标）」；计划与回顾是页面区块，不进术语表 | 二·D10 |

## 目的

用户原话：「review and improve the 'Today' page of the app in this directory: 1. Add a 'plan' section to summarise next 7 days work or goals. For the plan, show a built-in best-practice review plan with some parameters configurable in 'settings'. 2. Add a 'history' section to summarise last 7 days work. For the history, summarise the number of questions reviewed, highlight the newly mastered knowledge points. Compare the progress with the plan and give some feasible advices. 3. Re-Organise the elements of the page to make it more user friendly. also improve others: remove the title of the page framework("Sophia's Exercise Arena, Redo the ones that tripped you up"), as it looks useless. Or re-organise the page framework to make it more user friendly.」

本轮具体交付：

1. 设计：`DATA.md` 的 `settings/main`（新的计划参数）；按 D10 决定是否改 `CONTEXT.md`。
2. 实现：`app/arena.html` 的 Today 页、设置页与页面框架；`app/logic.test.js` 为新的纯逻辑加断言。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳里用真实数据的副本看 Today 页（窄屏、深色主题），计划、回顾与建议的数字可以逐项核对。重新发布不在本轮，留给用户决定。

## 输入

- 讨论 0001–0008（已完成）。0006 定下 Today 页的进度看板与排布（D5），本轮会改排布。
- 同主题未完成讨论：无。

---

## 一、证据

### E1 现在的 Today 页与页面框架（读源码 `render`、`renderPractice`、`cheerBlock`、`progressBlock`）

框架：每个标签页顶上都有标题区，粗体「Sophia's Exercise Arena」加一行灰字「Redo the ones that tripped you up」；下面是标签栏 Today · 录入 · 错题 · 检验卷 · 设置，随页面滚走。浏览器标签上的 `<title>` 另是「Sophia's Exercise Arena」。

Today 页从上到下：日期与「Hi Sophia」；鼓励语、连续天数、里程碑徽章；今天要重做几题和开始按钮；未做的检验卷；进度看板（掌握进度与最近 7 天新掌握数、近 14 天作答柱状图、阶梯分布）。页面文字为英文（0006 定）。

### E2 真实数据（`ArtifactData` 读取，2026-10-15，实测）

- 86 道错题：英文 81、科学 5；83 道填了概念。全部录入于 10-14、10-15。
- 阶梯：第 1 级 70 道、第 2 级 16 道，没有掌握的。到期：今天（10-15）65 道，明天 21 道。
- 作答只有 10-14 的两张英文检验卷：25 次，对 16、错 9。每日重做还没做过。
- `settings/main`：`dailyLimit` 为 18。

### E3 按现有阶梯推算未来 7 天（用页面的 `dailyList` 与 `GAPS` 对真实数据模拟，实测）

假设每天按上限做、每题都做对。格式「当天做的题 / 当天到期的题」：

| 每日上限 | 10-15 | 10-16 | 10-17 | 10-18 | 10-19 | 10-20 | 10-21 |
|---|---|---|---|---|---|---|---|
| 10 | 10/65 | 10/76 | 10/76 | 10/76 | 10/73 | 10/73 | 10/76 |
| 18（现设置） | 18/65 | 18/68 | 18/68 | 18/65 | 18/65 | 18/64 | 18/46 |
| 30 | 30/65 | 30/56 | 30/56 | 30/56 | 30/31 | 6/6 | 25/25 |

即使全做对，按现在的上限 18，一周后仍有 46 道到期没做；上限 30 时第 6 天清完积压。只数已排好的到期日、不算本周做过又回来的题，会低估：例如今天做过的第 1 级题，两天后（10-17）又到期。

### E4 掌握要多久（读 `deriveState`、`logic.test.js`）

阶梯间隔 1、2、4、7 天，按时全做对，录入后第 14 天才掌握；检验卷的作答同样推动阶梯。现有的题最早约 10-28 掌握，所以回顾里的「新掌握」在头两周会是空的。

### E5 复习的通行做法（agent 已有知识，本轮未重新查证）

Dunlosky 等 2013 年的综述把「自测」与「分散练习」评为效用高，「交错练习」为中等。对应到本页：每天短时重做到期题（分散 + 自测）、不攒到一天做、定期做混合专题的检验卷（自测 + 交错）、积压先清。

### E6 术语表的约束（读 `CONTEXT.md`）

- 「Concept（概念）」的 `_Avoid_` 有「知识点」：用户说的「knowledge points」对应概念。
- 「Review ladder（复习阶梯）」的 `_Avoid_` 有「复习计划」：新的「计划」区块要用别的名字，不能叫复习计划。
- 0006 为看板加过「Streak」「Milestone」两条词条。

### E7 现在的设置页（读 `renderSettings`、`DATA.md`）

只有「每日重做最多几题」（`dailyLimit`，1–50，默认 10）和一行阶梯说明；另有导出。

---

## 二、提议与裁决

### D1 本轮交付什么、范围到哪里

已裁（用户原话，见「目的」）。

### D2 计划显示什么

- A（推荐）**每天的预计题数 + 本周目标。** 未来 7 天（含今天）每天一格，写预计要重做几题，按 E3 的办法模拟（按上限、假设都做对）；下面一句积压结论：「按每天 N 题，<日期> 清完」或「这周清不完，每天要 M 题」；再列本周目标（练几天、做几张检验卷，数字来自 D3），每项带进度。代价：多一个模拟函数；预计是最好情况，要在界面上写明。
- B **只列本周目标。** 最简单，但看不出 E3 那样的积压。
- C **每天的预计题数，不模拟。** 只数已排好的到期日加上前一天没做完的；逻辑简单，但按 E3 会低估。

**裁决（2026-10-15）：A。**

### D3 设置里可改哪些计划参数、默认多少

- A（推荐）**三项：** 每日上限（已有，1–50）；每周练几天（1–7，默认 6，即留一天休息）；每周做几张检验卷（0–3，默认 1）。预计题数仍按天天练来算。代价：`settings/main` 多两个字段。
- B **再加选休息日：** 把「练几天」换成勾选周几休息，计划里休息日写 0、题目顺延。更贴近实际，但设置与模拟都更复杂。
- C **只要上限与练几天：** 不设检验卷目标。最简单，但丢掉定期自测（E5）。

**裁决（2026-10-15）：A。**

### D11 本周目标的进度按哪段时间算

D2 定了「本周目标带进度」，计划又是「未来 7 天（含今天）」。按这个滚动窗口数进度，窗口每天往后挪，进度最多只有今天一天，永远到不了 6/6。要另定一段时间。

- A（推荐）**按日历周（周一到周日）。** 计划里写「This week: practised 2/6 days · check paper 0/1」，周一归零；回顾仍按最近 7 天，和目标比时按 7 天对 7 天。代价：计划的「7 天预计题数」与「本周目标」是两段时间，界面上分开写。
- B **按最近 7 天（含今天）。** 进度总有意义，但和回顾数的是同一段，计划区与回顾区重复。
- C **不在计划里显示进度，只列目标；进度全放回顾。** 最简单，改动 D2 的「带进度」。

**裁决（2026-10-15）：A。**

### D4 回顾里「复习了几题」怎么数

最近 7 天（含今天）。E2：10-14 两张检验卷共 25 次作答，其中有题在两张卷上都出现。

- A（推荐）**按题数（去重），附作答次数与对错。** 主数字是这 7 天里作答过的错题有几道（每日重做与检验卷都算，同一道做几次算一道）；下面一行「N answers: x right · y partly · z wrong · practised on d of 7 days」。代价：两个数并列，要写清哪个是题、哪个是次。
- B **按作答次数。** 和现有的柱状图口径一致；但同一题做两次算两题，和用户说的「questions reviewed」不符。

**裁决（2026-10-15）：A。**

### D5 「新掌握的知识点」指什么

「知识点」按术语表是概念（E6）。掌握是逐题的状态；E4：头两周不会有新掌握。

- A（推荐）**最近 7 天变成掌握的错题，按概念列出。** 每个概念一行，带道数（「Prepositions of time ×2」）；没填概念的题按专题列。没有新掌握时，改为鼓励一句「Almost there: N questions are at step 4」（第 4 级的题数；也为 0 时写本周升级了几道）。代价：一个概念下还有没掌握的题，列出来不等于整个概念都会了。
- B **整个概念掌握才算。** 一个概念下的错题全部掌握、且在最近 7 天第一次做到，才列出。更严格，但要新定「概念掌握」并按作答重放；像英文「近义词」这样一个概念下有 23 道题的（真实数据，35 个概念里最多），很久都不会出现。

**裁决（2026-10-15）：A。**

### D6 回顾怎样和计划对比

已定：目标是每周练几天、每周做几张检验卷（D3），计划写未来 7 天的预计题数（D2）。过去每天的计划现在没有存，事后推不回来（到期日随作答改变）。

- A（推荐）**和目标比，不存计划。** 三行，每行达到打 ✓：最近 7 天练了几天对每周目标（「Practised 5 of 7 days · goal 6」）；最近 7 天做完几张检验卷对目标；有没有跟上：今天以前就到期、还没做的题有几道（0 道为跟上）。代价：不比「预计 18 题、实际做了几题」。
- B **每天存一份计划，逐天比预计与实际。** 对比最精确；但要新加一个集合，打开页面就写数据，`DATA.md` 多一份契约。

**裁决（2026-10-15）：A。**

### D7 建议怎样产生

已定：回顾按三行和目标比（D6）；计划能算出积压何时清完（D2）。Today 页文字为英文，对 Sophia 说（E1）。

- A（推荐）**内置规则，最多 3 条。** 按顺序取成立的：① 计划显示这周清不完积压 →「N questions are waiting. Doing M a day clears them this week — change the daily limit in 设置.」（M 是能在 7 天内清完的最小上限，到 50 也清不完时改说每天都做、先做最早到期的）；② 本周练的天数照现在的进度到不了目标 →「Little and often: practise on X more days this week.」；③ 本周检验卷没做够 →「Make a check paper on <最近 7 天错得最多的专题>.」（没有错的就写 mixed topics）；④ 最近 7 天某专题错了 3 次以上 →「Read the Key idea again for <专题> before you redo it.」；都不成立时一条「Great week — keep the same rhythm!」。代价：规则是固定的，说法有限。
- B **请 Claude 写建议。** 回顾区放一个按钮，把这 7 天的数字发给 `sample`，返回几句建议。说法更灵活；但每次要调用、结果不固定、不能写成断言，没网或没有 `sample` 时没有建议。

**裁决（2026-10-15）：A。**

**改裁（2026-10-15，复审 F1、F8 引起）：** 原 ② 的「照现在的进度到不了」没有定义；原兜底「Great week」可能和没打 ✓ 的对比行矛盾（周一、最近 7 天没练、检验卷目标为 0、没有积压时，② 不成立，会说 Great week）。用户改选：建议跟着 D6 的三行对比走，都按最近 7 天：① 未来 7 天清不完积压，或有今天以前到期还没做的题 → 先做过期的 / 建议最小上限；②「练了几天」未达标 →「Little and often: aim for G days a week — you practised on d of the last 7.」；③ 检验卷未达标 → 用最近 7 天错得最多的专题组卷；④ 某专题最近 7 天错 ≥3 次 → 重读 Key idea；「Great week」只在三行都打 ✓、且没有别的建议时出现。被放弃的选项：② 按本周、没有空余天时提醒；② 按本周、没达标就提醒。

### D8 Today 页从上到下怎么排

现在的顺序见 E1。新加的计划（D2、D11）与回顾（D4–D7）要放进来；回顾自带最近 7 天的数字，和现有「近 14 天」柱状图重叠。

- A（推荐）**先做事，再看计划，再回顾。** ① 顶部一块：日期、「Hi Sophia」、鼓励语、连续天数与徽章（问候与鼓励合并）；② 今天：要重做几题与开始按钮，未做的检验卷并在同一块；③ 计划「Next 7 days」：每天一格的预计题数、积压结论、本周目标与进度；④ 回顾「Last 7 days」：复习了几题与作答行、最近 7 天的对错柱状图（原 14 天图改为 7 天）、新掌握、三行对比、建议；⑤ 总进度：掌握进度条与阶梯分布，放最下。代价：页面变长；14 天图不再有。
- B **同 A，但计划与回顾另开一个标签页「Week」。** Today 保持短，只放今天的事；但要多切一次标签才看到，标签栏多一项。
- C **同 A，但回顾在计划前。** 先看上周做得怎样、读完建议再看接下来，叙事顺；但和今天的事最相关的未来 7 天被推到更下面。

**裁决（2026-10-15）：A。**

### D9 页面框架的标题怎么处理

E1：标题区在每个标签页顶上，Today 页另有自己的「Hi Sophia」；标签栏随页面滚走。D8 之后 Today 页更长。

- A（推荐）**去掉标题区，标签栏放最上面并在滚动时贴住顶部。** 长页面（Today、错题列表）往下翻也能直接切标签。浏览器标签上的 `<title>` 不变。代价：贴顶要给标签栏加底色，窄屏上占一行高度。
- B **只去掉标题区。** 最简单；标签栏仍随页面滚走。
- C **压成一行：左边小字名称，右边标签。** 保留名称；窄屏上标签放不下时要折行。

**裁决（2026-10-15）：A。**

### D10 术语表是否加词条

已定的新东西：存进设置、在计划里显示进度、在回顾里对比、在建议里引用的「每周练几天、每周几张检验卷」（D3、D11、D6、D7）；以及两个页面区块「计划」「回顾」。0006 为看板只加了「连续天数」「里程碑」两个概念，没有为「看板」加词条。E6：「复习计划」已是复习阶梯的 `_Avoid_`。

- A（推荐）**只加「Weekly goal（每周目标）」。** 定义：每个日历周（周一到周日）要练习的天数与要做完的检验卷张数，在设置里定。`_Avoid_`：周计划、学习目标、复习计划。计划与回顾是页面区块，不进术语表。理由：它是存下来、被多处引用的概念；区块和「看板」一样只是视图。
- B **再加「Week plan（一周计划）」「Week review（一周回顾）」两条。** 用户和 agent 说起这两块时有统一叫法；但多两个只是视图的词条。
- C **都不加。** 最少；但「每周目标」在设置、计划、回顾、建议里都出现，没有定义容易叫法不一。

**裁决（2026-10-15）：A。**

---

## 三、核销表

页面文字为英文、对 Sophia 说（0006 已定），设置页为中文。「最近 7 天」含今天，即今天往前 6 天到今天；「本周」为含今天的周一到周日（D11），只用于计划区的目标进度；「未来 7 天」为今天起 7 天，只用于预计题数。界面句里「this week」只指本周，滚动的两段写「in the next 7 days」「in the last 7 days」。下文函数都放进纯逻辑块（`LOGIC:BEGIN…END`），今天的日期作为参数传入。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D10、D3、D11 | `CONTEXT.md` | 在「Milestone（里程碑）」之后加词条「Weekly goal（每周目标）」：每个日历周（周一到周日）要有作答的天数与要做完的检验卷张数，在设置里定。`_Avoid_`：周计划、学习目标。不加计划、回顾词条；新 `_Avoid_` 词有合法用法，不进 `terms` |
| 2 | D3 | `DATA.md` | `settings/main` 表加两行：`practiceDays`，默认 `6`，每周目标：每周有作答的天数，1–7；`papersPerWeek`，默认 `1`，每周目标：每周做完几张检验卷，0–3。表下加一句：缺字段或不是数时按默认值读，超出范围时收紧到范围内，`0` 照常保留；设置页保存时三个字段一起写 |
| 3 | D3 | `app/arena.html` 纯逻辑与读取 | 加 `readSettings(v)`：按第 2 行的规则返回三个字段；启动时的初值与读 `settings/main` 都改用它（替换现在的 `v && v.dailyLimit ? v.dailyLimit : 10`） |
| 4 | D2 | `app/arena.html` 纯逻辑 | 加 `planForecast(exs, today, limit)`：从今天起 7 天，每天用 `dailyList` 取当天的题、假设每题都做对（第 4 级做对即掌握，否则升一级、按 `GAPS` 排下次到期），返回每天的日期与题数；`waiting`＝今天及以前到期、未掌握的题数；`clearOn`＝第一天做完当天的题后再没有当天及以前到期的题，那一天的日期，7 天内没有为 `null`；`clearOn` 为 `null` 时 `needLimit`＝上限从当前值加一试到 50、能让 `clearOn` 落在 7 天内的最小值，都不行为 `null`。加 `planLine(plan, limit)` 给出积压结论：`clearOn` 是今天时「Today's set covers everything due.」，是以后某天时「At L a day, you'll be caught up by <日期>.」，为 `null` 时「At L a day, you won't catch up in the next 7 days.」，有 `needLimit` 时接「M a day would.」。不写数据 |
| 5 | D3、D11 | `app/arena.html` 纯逻辑 | 加 `weekStart(today)`（含今天的那个周一）；加 `goalProgress(exs, papers, from, to)`：区间内有作答的天数，以及区间内完成的检验卷张数（只算 `status` 为 `done` 的；完成日取 `finishedAt` 的日期，旧卷没有时取 `createdAt`）。计划区用本周，回顾的对比用最近 7 天 |
| 6 | D4、D5、D6 | `app/arena.html` 纯逻辑 | 加 `weekReview(exs, papers, today)`：最近 7 天作答过的错题道数（去重，每日重做与检验卷都算）；作答次数与对 / 部分对 / 错；练了几天；做完几张检验卷；每天的对 / 部分对 / 错（7 天，给柱状图）；新掌握＝当前已掌握、且 `masteredOn` 落在最近 7 天的错题，按概念分组计数，没填概念的按专题分组，按道数降序、再按 id；空时的替代句 `fallback`：第 4 级未掌握的题数 > 0 时「Almost there: N questions are at step 4.」，否则最近 7 天升级道数（最近 7 天里、作答时尚未掌握的题做对的道数，去重，按作答重放）> 0 时「N questions moved up the ladder in the last 7 days.」，再为 0 时为空、不显示这一小块；过期题数＝未掌握、`due` 早于今天的题数；最近 7 天错得最多的专题及其错的次数（并列按专题 id）。加 `goalChecks(week, settings)`：三行对比，各带是否达到——练了几天 ≥ `practiceDays`；做完检验卷 ≥ `papersPerWeek`（目标为 0 时这一行不出现）；过期题数为 0 |
| 7 | D7（改裁） | `app/arena.html` 纯逻辑 | 加 `weekTips(plan, week, checks, settings)`，按序取成立的，最多 3 条：① `plan.clearOn` 为 `null` 或过期题数 > 0：`clearOn` 为 `null` 且有 `needLimit` 时「N questions are waiting. Doing M a day clears them in the next 7 days — change the daily limit in 设置.」；`clearOn` 为 `null` 且没有 `needLimit` 时「N questions are waiting — do your redo every day, oldest first.」；`clearOn` 有日期、过期 K 道时「K questions are overdue — do them first.」；②「练了几天」未达到：「Little and often: aim for G days a week — you practised on d of the last 7.」；③ 检验卷未达到：「Make a check paper on <专题英文名>.」，专题取最近 7 天错得最多的，没有错的写「Make a check paper on mixed topics.」；④ 最近 7 天错得最多的专题错了 3 次或以上：「Read the Key idea again for <专题英文名> before you redo it.」；以上都不成立、且三行都达到时一条「Great week — keep the same rhythm!」 |
| 8 | D2、D11、D8 | `app/arena.html` Today 页 | 有错题时从上到下：① 一块：日期、「Hi Sophia」、鼓励语、连续天数与徽章（原问候与 `cheerBlock` 合并，鼓励语规则不变）；② 今天：要重做几题与开始按钮，未做的检验卷列在同一块；③「Next 7 days」：7 格（周几简写与题数，今天一格写 Today 并突出），一行小字「If every answer is right」，下面是 `planLine`；「This week」两行目标与本周进度：「Practise on G days: d/G」「Check papers: p/P」（`papersPerWeek` 为 0 时不显示这一行），达到打 ✓；④「Last 7 days」：主数字「N questions reviewed」，下一行「A answers: r right · p partly · w wrong · practised on d of 7 days」；对错柱状图改为 7 天（`activityChart` 按传入的天数画，图例保留）；「Newly mastered」列表，概念与专题名用英文，概念照现有方式链接到知识图，没有时显示 `fallback`，`fallback` 为空时不显示这一小块；「Compared with your goals」按 `goalChecks` 列出：「Practised on d of 7 days · goal G」「Check papers: p · goal P」「Caught up」或「K questions are overdue」，达到打 ✓；「Tips」列出 `weekTips` 的结果；⑤ 掌握进度条与阶梯分布：去掉 14 天图；进度条下的「+N in the last 7 days」去掉（新掌握已在回顾里），始终写「A question is mastered when you get it right at step 4.」。`dashboardData` 不改（仍算 14 天，供今天的计数与鼓励语）。没有错题时照旧只显示空页说明 |
| 9 | D9 | `app/arena.html` 框架 | 去掉 `header.top` 与 `.brand` 及其样式；标签栏为页面第一行，`position: sticky; top: 0`，加 `--paper` 底色与层级，深浅色主题都可读；`<title>` 不变 |
| 10 | D3 | `app/arena.html` 设置页 | 「每日重做最多几题」之外加「每周练几天」（1–7）与「每周做几张检验卷」（0–3）；保存时三个字段经 `readSettings` 收紧后一起写入 `settings/main`，提示「已保存：每日最多 n 题，每周练 g 天、做 p 张检验卷。」；导出照旧带上整份设置 |
| 11 | D2–D7 | `app/logic.test.js` | 导出清单补 `readSettings`、`planForecast`、`planLine`、`weekStart`、`goalProgress`、`weekReview`、`goalChecks`、`weekTips`。加断言：`readSettings` 缺字段、`0` 保留、超出范围收紧；预计题数（按上限、做过的题按间隔回来、题组不拆）；`clearOn` 是今天、以后某天、`null` 三种，`needLimit` 有值与 50 也不够，`planLine` 四种句子；`weekStart` 在周一、周日与跨月；`goalProgress` 的天数与检验卷（含旧卷用 `createdAt`、未完成的不算）；`weekReview` 的去重题数、作答次数、7 天边界、新掌握按概念与按专题分组、`fallback` 三支、过期题数、错得最多的专题；`goalChecks` 含目标为 0 时不出检验卷行；`weekTips` 每条规则成立与不成立、④ 在 2 次与 3 次的边界、最多 3 条、Great week 只在三行都达到时出现。现有 `dashboardData` 的断言不变 |
| 12 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；落盘者对照本表逐行核对实际稿，记录保真结果；本地测试壳用 2026-10-15 读出的真实数据副本（E2），把今天设为 10-15，核对计划与 E3 上限 18 一行一致，并核对回顾与建议的数字；另造多天作答、有新掌握、有过期题的数据看回顾与建议；窄屏（375 宽）与深色主题下看标签栏贴顶、7 格与柱状图可读；设置页保存后读回 |
| 13 | —— | ADR、`CLAUDE.md`、`.design/workspace.yaml` | 不改：计划与回顾由已有数据与设置推出，载体、数据模型与取舍不变；「不存每天的计划」（D6）只记在本讨论。纯逻辑块的注释在落盘时按新函数补写。重新发布不在本轮，留给用户决定 |

---

## 四、复审

派新上下文的 subagent 按简报复审讨论文件与核销表初稿（不给对话）。逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 建议 ② 的「到不了」与改写的句子没有裁决 | 成立（初稿行 6 自行解释成「没有空余天」并加了一支） | 回第 3 步 → D7 改裁 |
| F2「this week」同时指本周与滚动的 7 天 | 成立 | 机械：表头说明用词；界面句改为 in the next / last 7 days（行 4、6、7） |
| F3 读设置缺断言，现写法会把 `0` 读成默认值 | 成立（`app/arena.html` 读设置处 `v && v.dailyLimit ? … : 10`） | 机械：新增行 3 `readSettings`，第 2、10、11 行跟着写 |
| F4 积压结论、新掌握的替代句、检验卷行隐藏只写在渲染里 | 成立 | 机械：`planLine`、`fallback`、`goalChecks` 放进纯逻辑并加断言（行 4、6、11） |
| F5 「3 次以上」边界不清 | 成立 | 机械：写明 3 次或以上，断言 2 与 3 两个边界 |
| F6 新词条 `_Avoid_` 重复「复习计划」；「练习的天数」与「有作答的天数」不一致 | 成立 | 机械：行 1 去掉「复习计划」，定义改为「有作答的天数」 |
| F7 看板里「+N in the last 7 days」、`dashboardData` 的 14 天、逻辑块注释没有交代 | 成立 | 机械：行 8 去掉 +N、`dashboardData` 不改；行 13 写注释补写 |
| F8「Great week」可能和没打 ✓ 的对比行矛盾 | 成立 | 回第 3 步 → D7 改裁（与 F1 一并） |
| F9 验证计划缺数据快照日期与逐行对照 | 成立 | 机械：行 12 写明 10-15 副本、今天设为 10-15、逐行对照 |

改裁后重写了行 7，并按简报自查重写过的行 1–8、10–13：每行都能对上登记表的现行裁决；行 7 的四条规则与兜底条件与改裁原文一致；「this week」只出现在本周目标处；`0` 保留、③ 目标为 0 时不出现两处在行 2、6、11 一致。改动集中在建议规则一处，认为不必再派复审。

## 五、核销（2026-10-15）

用户确认核销表后落盘。

| # | 结果 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | `CONTEXT.md` 在「Milestone（里程碑）」后加「Weekly goal（每周目标）」，定义与 `_Avoid_`（周计划、学习目标）同核销表；`terms` 未动 |
| 2 | ✅ | `DATA.md` 的 `settings/main` 表加 `practiceDays`、`papersPerWeek` 两行，表下一句读写规则 |
| 3 | ✅ | 纯逻辑加 `SETTINGS_DEFAULT`、`readSettings`；`S.settings` 初值与读 `settings/main` 都改用它 |
| 4 | ✅ | 纯逻辑加 `simulatePlan`（内部）、`planForecast`、`planLine`，四种句子与表一致 |
| 5 | ✅ | 纯逻辑加 `weekStart`、`paperDoneOn`（内部）、`goalProgress` |
| 6 | ✅ | 纯逻辑加 `weekReview`、`goalChecks`；替代句只在没有新掌握时给出 |
| 7 | ✅ | 纯逻辑加 `weekTips`，四条规则、最多 3 条、Great week 条件与改裁一致；专题名由页面传入英文名 |
| 8 | ✅ | Today 页改为 `helloBlock` → `todayBlock`（检验卷并入）→ `planBlock` → `reviewBlock` → `progressBlock`；原 `cheerBlock` 并入问候；`activityChart` 按传入天数画、每根柱下写周几、最后一根写 Today；进度条下改为固定一句；`dashboardData` 未改。落实中发现 375 宽时「Today」一格的字顶到边，给窄屏的 7 格缩小字号与间距（样式，不改行为） |
| 9 | ✅ | 去掉 `header.top`、`.brand` 及样式；`.tabs` 贴顶、`--paper` 底色、`z-index: 10`；`<title>` 未改 |
| 10 | ✅ | 设置页三个输入框与一行说明；保存经 `readSettings` 后整份写入，提示句同表 |
| 11 | ✅ | `app/logic.test.js` 导出清单补 8 个函数，断言覆盖表中各项（含 ④ 的 2 次 / 3 次边界、周一没练不说 Great week）；`node app/logic.test.js app/arena.html` 输出 all logic tests passed |
| 12 | ✅ | `./check.sh` 退出码 0。本地测试壳（模拟 `window.claude`、内存 `db`、日期固定）：① 真实数据副本、今天 10-15、上限 18：7 格均为 18，与 E3 一致；积压句「At 18 a day, you won't catch up in the next 7 days. 23 a day would.」，node 复算上限 22 清不完、23 在 10-21 清完；回顾 22 道题、25 次作答（16 对 9 错）、练 1 天，没有新掌握时显示「16 questions moved up the ladder in the last 7 days.」；本周检验卷 2/1 ✓；建议两条（积压、练习天数）。② 造的多天数据（今天 10-30）：新掌握 9 道按概念分组（Fixed prepositions ×2 等），对比行 6/7 ✓、检验卷 1/2、过期 13 道，建议三条（过期、组卷、重读 Key idea），逐项与数据核对一致。③ 设置页填 20、9、0 保存：读回 `{dailyLimit: 20, practiceDays: 7, papersPerWeek: 0}`，Today 上检验卷行在计划与对比里都不再出现。④ 375 宽浅色、深色下：标签栏滚动时贴顶，7 格与柱状图可读，无横向滚动（scrollWidth 375）。⑤ 开始每日重做与退出正常。没有错题时的空页说明沿用原代码，测试壳未单独走这一支 |
| 13 | ✅ | ADR、`CLAUDE.md`、`.design/workspace.yaml` 未改；逻辑块开头注释补了「计划与回顾、设置」。未重新发布 |

实际稿对照核销表逐行核对：事实、数字、条件与界面句一致；窄屏 7 格的样式调整是唯一表外改动，不带新语义。

未验证：没有错题时的空页（代码未改，测试壳未走）；真机与 claude.ai 外壳里的贴顶效果；重新发布后的线上页面。
