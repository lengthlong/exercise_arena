# 0015 每日卷只装此刻到期的题、没有就不组卷；Next 7 days 显示每天到期数并放建议；阶梯分布的标签

> 状态：**✅ 已完成（2026-10-15）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 重做按钮怎样出题 | 已裁（重议后） | 保留每日卷：点按钮按科目组一张，装最多一批（Questions per batch）此刻到期（含过期）的题；没有到期题就不组卷，显示完成提示 | 二·D1 |
| D1a 每科一个按钮还是一个 | 已裁 | 照旧每科一个 | 二·D1 |
| D1b 没交的每日卷再点时 | 已裁 | 删掉它，按此刻到期的题新组一张 | 二·D1 |
| D1d 一批按每科算还是全部科目合计 | 已裁 | A：每科各算一批（推翻 0012 D4 的「合计一批再按科目分」） | 二·D1 |
| D1c 完成提示的说法 | 已裁 | 标题「All caught up for today!」，下面「Next redo: Fri 16 Oct.」 | 二·D1 |
| D2 一次重做取多少题 | 被取代 → D1 | —— | 二·D2 |
| D3 以前的每日卷在卷子列表里怎么办 | 被取代 → D3a | —— | 二·D3 |
| D3a 卷子列表还列不列没交的每日卷 | 已裁 | A：只列交过的每日卷 | 二·D3 |
| D4 Next 7 days 每天的数怎么算 | 已裁 | B：每格是那天真正到期的题数（今天含过期），去掉模拟那一行 | 二·D4 |
| D4a 来自模拟的那条建议 | 已裁 | A：只留「有过期题先做」那条，模拟代码删掉 | 二·D4 |
| D5 Tips 移到 Next 7 days | 已裁 | 用户原话直接定 | 二·D5 |
| D6 阶梯分布的标签 | 已裁 | A：按「在等哪次重做」标，设置页说明同样改说法 | 二·D6 |

## 目的

用户原话：「In 'Today' page: 1. the redo button only choose the questions that are due today. If there are no more questions due today, a 'done' message is shown. (Do not create a daily-paper any more). 2. in 'NEXT 7 DAYS', show the due count for every day. Move 'TIPS' from 'LAST 7 DAYS' to this section. 3. in 'MASTERED' section, why there are 30 questions in 'Step 2' for me(Aaron)? Today is my 'Day 2' of using this app and 'Step 2' should only be reached after 'Day 3'.」

本轮具体交付：

1. 回答第 3 点的「为什么」（E4），按 D6 决定要不要改标签。
2. 设计：按裁决改 `CONTEXT.md`（Daily paper）与 `DATA.md`（每日卷）。
3. 实现：`app/arena.html` 的重做按钮与作答页、卷子列表、Next 7 days、Last 7 days、阶梯分布；`app/logic.test.js` 的断言。
4. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳用真实数据副本走一遍重做与 Today；发布后线上能打开。

## 输入

- 同主题未完成讨论：无（0001–0014 均为 ✅）。
- 讨论 0011、0012（已完成）：每日卷、按科目开始、交卷即存。本轮推翻「生成每日卷」。
- 讨论 0013（已完成）：Today 的已做/一共、交卷后补题（D3）、Daily redo 词条的「交了这一批后仍有到期题就再列」。

---

## 一、证据

### E1 现在的重做按钮（读 `redoButtons`、`start-daily`、`openDailyPaper`）

每个科目一个按钮。点了之后，若这一科今天有没交的每日卷就接着用；否则从今天的清单（默认归属人的到期题，`due` 不晚于今天，按「Questions per batch」装）里取这一科的题，生成一张每日卷（`papers` 里 `kind: "daily"`），再进作答页。作答写 `mode: "daily"`、`paperId` 为这张卷。每日卷只给本人做，列在卷子列表里。`DATA.md` 已允许作答的 `paperId` 为 `null`（旧的每日重做作答就是这样）。

### E2 现在的 Next 7 days（读 `planBlock`、`simulatePlan`）

七格的数不是到期数，而是模拟：假设每天做一批、每题都做对，各天会做几题，所以标着「If every answer is right」。下面一行「At 24 a day, you'll be caught up by …」也来自这次模拟；Tips 里「Doing N a day clears them…」同样用它。This week 的目标在这一块里。Tips 现在在 Last 7 days 里。

### E3 真实数据（2026-10-15 读 `db`，Aaron 的视图）

- 按现在的阶梯，每天真正到期的题数：今天（含过期）32，16 日 33，17 日 30，18–21 日 0。
- 七格现在显示的模拟数：24、24、24、24、24、24、22。

### E4 第 3 点：为什么 Aaron 有 30 道题在 Step 2

`db` 里 Aaron 是 `u_p8F…`（平台的显示名），他的作答全在 10-15。这 30 道题都是 10-14 录入的：第 1 次重做在第 1 天（10-15）到期，Aaron 10-15 在每日卷上做对了，于是升到第 2 级，下次重做在 10-17（第 3 天）。所以「Step 2」的意思是「第 1 天的重做已经做对，在等第 3 天的重做」，不是「已经到了第 3 天」。规则（间隔 1、2、4、7 天，即第 1、3、7、14 天）没有算错；容易误解的是标签。

---

## 二、提议与裁决

### D1 每日重做不再生成每日卷

证据：E1。用户原话已定：按钮只取今天到期的题，没有到期题时显示做完的提示，不再生成每日卷。做法：点按钮时从今天到期的题现取，直接进同一个作答页；交卷时写作答（`mode: "daily"`、`paperId: null`），不写卷子。离开作答页时这一批不保留（现在作答内容本来也不保留，只保留了卷上的题）。Daily paper 不再是现行概念：从术语表删去，`DATA.md` 把 `kind: "daily"` 写成旧数据。

初记为「用户原话直接定」。用户要求重议。

重议的证据：每日卷现在有三个作用 —— 固定这一批题（离开后「Continue」回到同一批，写过的答案不保留）、在卷子列表里留下得分记录、用 `handedIn` 记交卷。问题在第一个：题在组卷时就定死，没交之前，已经不再到期的题仍在卷上。

重议时给的选项：A 不再组卷（每次点按钮现取到期题，作答 `paperId: null`）；B 保留每日卷，接着做时去掉已不到期的题。

**裁决（2026-10-15，重议后）：两者都不选。** 用户原话：「When clicking 'Redo' button, create a daily paper with 24(batch count) questions that are (over) due today. If there are no more questions left, show a 'done' message (with better wording) and don't create the daily paper.」随后的三个细节：

- D1a：A（推荐）照旧每科一个按钮；B 一个「Redo」按钮、跨科目混合。**裁决：A。**
- D1b：A（推荐）没交的每日卷在再点时删掉（还没有写入的作答），按此刻到期的题新组一张，卷上就不会有已不到期的题；B 照旧接着做同一张。**裁决：A。**
- D1c：A（推荐）标题「All caught up for today!」，下面「Next redo: Fri 16 Oct.」；B「Nothing left to redo today.」与「Come back on Fri 16 Oct.」。**裁决：A。** 今天没做过题也没有到期题时，照旧「Nothing due today」。
- D1d（复审 F1 引出）：每科的卷「最多一批」是每科各算，还是全部科目合计。例：英文到期 30、数学到期 10。A（推荐）每科各算：英文卷 24 道、数学卷 10 道，与用户原话「一张 24 题的卷」一致；代价是一轮最多「一批 × 科目数」道，推翻 0012 D4。B 照 0012：全部科目合计按一批装成今天的清单再按科目分，例子里英文约 24、数学 0，数学要等英文交了才补上。**裁决：A。**

### D2 一次重做取多少题

证据：E1。依赖 D1。「到期」按术语表是下次重做日已到或已过，所以过期的也在内。

- A（推荐）**照旧按科目、按「Questions per batch」取。** 每科一个按钮，点一次取这一科到期题里排在前面的一批；做完交卷后还有到期题，按钮照旧出现（0013 D3）。代价：无新规则。
- B **一次取这一科全部到期题，不设上限。** 代价：「Questions per batch」设置没用了，要删；一次可能三十多题。

被 D1 取代：用户的重议裁决里已定「最多一批（24）」。

### D3 以前的每日卷在卷子列表里怎么办

证据：E1。线上有 2 张交过的每日卷。

- A（推荐）**交过的留在列表里当记录，不再出现新的；没交的不再列出。** 代价：列表里还有「Daily」标签与相关代码。
- B **列表里不再显示任何每日卷。** 文档不删，只是不显示。代价：看不到那两张的得分与详情（作答还在错题详情里）。

被 D1 取代：每日卷保留。由 D1b 引出新题 D3a：没交的每日卷再点会被替换，卷子列表还要不要列它（现在列出今天的、带 Start，从那里开始会回到旧的题）。A（推荐）只列交过的每日卷；B 照旧列今天没交的。

**裁决（2026-10-15）：A。**

### D4 Next 7 days 每天的数怎么算

证据：E2、E3。

- A（推荐）**每格是那天真正到期的题数，今天一格含过期的。** 今天的例子：32、33、30、0、0、0、0。去掉「If every answer is right」；下面一行「At 24 a day, you'll be caught up by …」照旧（它说的是按每批题数能不能赶上）。代价：格子与那一行一个是现状、一个是模拟，口径不同。
- B **每格到期数，同时去掉模拟那一行。** 代价：Tips 里「Doing N a day clears them」也来自模拟，要一起改或删。

**裁决（2026-10-15）：B。**

D4a（由 D4 引出）：那条建议怎么办。A（推荐）去掉模拟，只留已有的「有过期题时：N questions are overdue — do them first.」，模拟代码（`simulatePlan`、`planForecast`、`planLine`）不再用、一并删；代价是不再提示「每批调到几题才赶得上」。B 建议里照旧用模拟。**裁决：A。**

### D5 Tips 移到 Next 7 days

证据：E2。用户原话已定：Tips 从 Last 7 days 移到 Next 7 days，放在 This week 之后；内容不变。

**裁决（2026-10-15）：用户原话直接定。**

### D6 阶梯分布的标签

证据：E4。

- A（推荐）**按「在等哪一次重做」标。** 五行改为「1st redo (day 1)」「2nd redo (day 3)」「3rd redo (day 7)」「4th redo (day 14)」「Mastered」，标题写「Waiting for」。今天的例子：65 道在等第 1 次重做、30 道在等第 3 天的第 2 次重做。代价：设置页的阶梯说明要同样改说法。
- B **保留 Step 1–4，加一句说明。** 例如「Step 2 = got the day-1 redo right; next redo on day 3」。代价：标签不变，仍要读说明。

**裁决（2026-10-15）：A。**

另：用户在本轮中要求问题与选项用中文写；D3a、D4、D6、D4a 起用中文问。

## 三、核销表

用词：「这一科此刻的一批」指默认归属人的错题中这一科、按我的阶梯未掌握且 `due` 不晚于今天的题，按 `dailyList` 的排序与题组规则装到「一批」（设置 Questions per batch，`dailyLimit`）为止。页面上「step」的说法按 D6 统一换成「第几次重做」。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1、D1a、D1b、D1d | `app/arena.html` Today 与作答 | `redoButtons` 每科一个按钮，题数与题 id 取这一科此刻的一批（`dailyList` 只对这一科的题调用），不再取没交的每日卷；去掉旧式混合卷分支及 `todayBlock` 里 `!b.subject`、`redo.some(b => !b.subject)` 的处理；按钮文字「<科目> · 已做/一共」（去掉「Continue」）。`renderPractice` 里鼓励语的「有事可做」改为按钮不空或有没做的检验卷（去掉 `b.paper`）；「N more due after these」按全部到期数减各科这一批之和。`start-daily`：用 `openDailyPaper(…, subject)` 找本人今天这一科没交的每日卷，有就先删掉，再按这一科此刻的一批 `makeDailyPaper`（照旧写 `madeAt`）；这一批为空就不组卷；去掉 `if (!subj) break` 之外的混合卷路径，注释同步 |
| 2 | D1c | `app/arena.html` Today | 没有要做的题、今天做过题时：标题「All caught up for today!」，下一行「Next redo: <星期> <日 月>.」（如 Fri 16 Oct.；没有以后的到期题时照旧「Everything here is mastered.」）。都没有时标题与下一行照旧（「Nothing due today」「Next redo comes up on …」，复审 F3） |
| 3 | D3a | `app/arena.html` 纯逻辑 | `visiblePapers` 只列检验卷与本人交过的每日卷，去掉不再用的 `today` 参数；`openDailyPaper` 注释改为「今天这一科给我、我还没交的那张（再点重做时删它）」 |
| 4 | D4、D4a | `app/arena.html` 纯逻辑与 Next 7 days | 加 `dueByDay(todo, today)` 返回 7 个 `{date, count}`：今天为未掌握且 `due` 不晚于今天的题数，其后各天为 `due` 等于那天的题数。七格改用它（格子的星期与悬停提示用 `date`）；去掉「If every answer is right」与预测那一行。删 `simulatePlan`、`planForecast`、`planLine`；`weekTips(week, checks, settings, topicName)` 去掉 `plan` 参数与模拟分支，有过期题时照旧出「overdue — do them first」 |
| 5 | D5 | `app/arena.html` | Tips 从 Last 7 days 移到 Next 7 days 的 This week 之后，内容不变；`planBlock` 改收 `week` 与 `checks`，`reviewBlock` 不再出 Tips |
| 6 | D6 | `app/arena.html` | 阶梯分布：标题「On the ladder」改「Waiting for」，五行「1st redo (day 1)」「2nd redo (day 3)」「3rd redo (day 7)」「4th redo (day 14)」「Mastered」，删「Ladder: day 1 → 3 → 7 → 14」；「… right at step 4」改「… right on the 4th redo」。设置页阶梯说明改为「After an exercise is recorded, it comes back for a 1st, 2nd, 3rd and 4th redo on day 1, 3, 7 and 14. Right moves it on to the next redo, wrong sends it back to the 1st redo, partly right keeps it waiting for the same redo. Right on the 4th redo means mastered. On a check paper, right and partly right answers don't move a question; a wrong one sends it back to the 1st redo.」。阶梯圆点悬停「Review ladder step N」改「Waiting for the Nth redo」；「Almost there: N questions are at step 4.」改「… waiting for the 4th redo.」。「start of the ladder」「On the ladder」筛选、「moved up the ladder」不含 step，不改 |
| 7 | D1、D1b、D1d、D3a | `CONTEXT.md` | Daily redo 改为「当天为一位用户列出的到期错题，取自其默认归属人的错题，按科目列出，每科每次大致以题数上限为准，交了这一批后仍有到期题就再列；同一题组的题不拆开。每科一张每日卷作答。」Daily paper 改为「为一位用户的每日重做，按此刻其中一个科目的到期题（以题数上限为准）生成的卷子；没交的会被新的一张取代。只给这位用户做，不算检验卷。」（复审 F4）`_Avoid_` 不变 |
| 8 | D1b、D3a | `DATA.md` | `papers` 表下「每个科目只接着用 …；当天没交的旧式混合每日卷交卷前也接着用；当天改了设置也照用；更早没交的作废、不再列出，文档不删。」改为「每日卷不接着做：再次开始这一科的每日重做时，先删掉本人今天这一科没交的每日卷（没交的卷上没有作答，按上一段的「交过」规则），再新生成一张。没交的每日卷不列出；旧式混合每日卷（`subject` 为 `null`）不再接着做，文档不删。」写入规则不另加一条（复审 F6）。已知代价：同一用户在另一台设备上正开着被删的卷时，那边交卷写作答成功、写 `handedIn` 失败，作答仍在、卷子没了 |
| 9 | D1–D6 | `app/logic.test.js` | 删 `planForecast`、`planLine` 的断言与导出；`weekTips` 断言按新签名改，删模拟分支两条；加 `dueByDay` 断言（今天含过期、已掌握不算、其后各天按当天、7 个、日期连续）；`visiblePapers` 断言改为不列今天没交的每日卷、按新签名；`openDailyPaper` 的旧式混合卷断言（`subject` 为 `null`）删去，按科目取的断言保留；`weekReview` 的「Almost there」断言按新文字改 |
| 10 | 完成标准 | 验证（不改文件） | `./check.sh` 与测试通过；落盘者逐行对照本表核对实际稿。本地测试壳（今天固定 2026-10-15，10-15 的真实数据副本，Aaron，只有英文到期）：Next 7 days 为 32、33、30、0、0、0、0，Tips 在其下，Last 7 days 没有 Tips；阶梯分布为 65 / 30 / 0 / 0 / 0；点 English 组一张 24 题的英文卷，回 Today 不交再点，旧卷被删、新卷是此刻的 24 题；Papers 列表不出没交的每日卷；把到期题都做完后显示「All caught up for today!」与「Next redo: Fri 16 Oct.」；375 宽看一次。每科各算一批另由断言或在测试壳里临时加一道到期的数学题验证 |
| 11 | 发布 | 线上页面 | 发布到原网址，以发布工具回报为准核对线上没有别处的新版本（复审 F8）；能力与契约不变；不改数据 |
| 12 | —— | 不改 | 不立 ADR（可逆、无数据迁移）；0011、0012 冻结不改。D6 标签「(day 3)」等按从录入算的近似天数写，做错或部分对后实际日子会顺延，与设置页原有写法同样近似（复审 F7） |

---

## 四、复审

派新上下文的 subagent 按简报复审讨论文件与核销表初稿（不给对话）。逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 一批按每科还是合计没写明；验证「24 题英文卷」只在特定数据下成立 | 成立 | 回第 3 步，新题 D1d，用户裁 A（每科各算），重写行 1、7、10 |
| F2 「再点删卷」没断言；`openDailyPaper` 去留与混合卷断言 | 成立 | 机械：行 1 写明复用 `openDailyPaper` 找要删的卷，行 3 改注释，行 9 删混合卷断言。删卷本身在事件代码里，由行 10 的测试壳验证 |
| F3 「Nothing due today」时第二行改说法未经裁决 | 成立 | 机械：行 2 改为那种情形照旧 |
| F4 Daily paper 新定义有界面细节、用了「一批」、缺默认归属人 | 成立 | 机械：行 7 用复审建议的措辞 |
| F5 行 1、4、5 漏了几处要碰的代码 | 成立 | 机械：补进行 1、3、4、5 |
| F6 `DATA.md` 重复；删卷前提没写；另一台设备的情形 | 成立 | 机械：行 8 写明前提，去掉重复的写入规则，另一台设备的情形记为已知代价 |
| F7 「(day 3)」在做错、部分对后不准 | 成立（提醒） | 行 12 记下，D6 已裁 |
| F8 「线上仍是第 19 版」没有来源 | 成立 | 机械：行 11 以发布工具回报为准 |

重写了行 1–12，按简报自查：每行对得上登记表；行 1、7、10 随 D1d 改；其余为补漏，没有新的设计决定；不必再派复审。

## 五、核销（2026-10-15）

| # | 结果 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | 纯逻辑加 `subjectBatch(todo, today, limit, subject)`（这一科里按 `dailyList` 装一批）；`redoButtons(todo, today)` 每科一个、题取 `subjectBatch`，去掉混合卷分支与「Continue」；`todayBlock` 去掉 `!b.subject` 两处；鼓励语改为按钮不空或有没做的检验卷；`start-daily` 先用 `openDailyPaper` 找本人今天这一科没交的卷并删掉，这一批为空就不组卷，否则 `makeDailyPaper` 新组一张；注释同步 |
| 2 | ✅ | 没有要做的题、今天做过题时标题「All caught up for today!」，下一行「Next redo: Fri 16 Oct.」；都没有时照旧 |
| 3 | ✅ | `visiblePapers(papers, view, uid)` 只列检验卷与本人交过的每日卷；`openDailyPaper` 注释改写 |
| 4 | ✅ | 加 `dueByDay`；七格改用它，去掉「If every answer is right」与预测那一行；删 `simulatePlan`、`planForecast`、`planLine` 及 `.plan-line` 样式；`weekTips(week, checks, settings, topicName)` 去掉模拟分支 |
| 5 | ✅ | Tips 移到 Next 7 days 的 This week 之后；`planBlock(days, today, done, week, checks)`、`reviewBlock(week, checks)`，`checks` 在 `renderPractice` 里算一次 |
| 6 | ✅ | 阶梯分布标题「Waiting for」、五行新标签、删「Ladder: day 1 → 3 → 7 → 14」、掌握说明改「on the 4th redo」；标签列由 70px 加宽到 124px、不换行（新标签放得下，表外的版式修补）；设置页说明、圆点悬停、「Almost there」按表改 |
| 7 | ✅ | `CONTEXT.md` 的 Daily redo、Daily paper 按表改 |
| 8 | ✅ | `DATA.md` 每日卷一段按表改，含删卷前提与已知代价；没有另加写入规则 |
| 9 | ✅ | `app/logic.test.js`：删 `planForecast`、`planLine` 断言与导出；加 `dueByDay`、`subjectBatch` 断言；`weekTips` 按新签名、删模拟分支两条；`openDailyPaper` 混合卷断言删去，改为「昨天的、别人的、交过的英文卷都不取」；`visiblePapers` 断言改为不列没交的每日卷；「Almost there」两处按新文字 |
| 10 | ✅ | `./check.sh` 退出码 0，测试通过；落盘者逐行对照本表核对实际稿，表外只多了第 6 行注明的标签列宽度。本地测试壳（今天固定 2026-10-15，10-15 的真实数据副本，Aaron）：Next 7 days 32、33、30、0、0、0、0，Tips 在其下，Last 7 days 没有 Tips；Waiting for 65 / 30 / 0 / 0 / 0；点 English 组卷 `new1`（24 题），不交回 Today 再点：`new1` 被删、组了 `new2`（24 题）；Papers 列表只列 2 张交过的每日卷与 2 张检验卷；在内存里临时加一道到期的数学题：按钮为「English · 56/75」「Math · 0/1」（每科各算一批）；把到期题都做完：82/82、「All caught up for today!」「Next redo: Fri 16 Oct.」、两个打勾标签；375 宽看过 Next 7 days 与阶梯分布，无横向滚动 |
| 11 | ✅ | 发布为第 20 版（version id 1792073683-e290），发布工具没有报告线上有别处的新版本；能力与契约 0.2.77 不变；没有改数据 |
| 12 | ✅ | 没有立 ADR；0011、0012 未动 |

未验证：真实 claude.ai 里删卷（`papers/{id}` 的 `delete`）与重新组卷，测试壳模拟了 `db`；另一台设备开着被删的卷时的情形没有走（已记为已知代价）。
