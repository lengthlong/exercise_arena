# 0018 Next 7 days 按全对推算以后各天；Today 的消息按四个主区归位

> 状态：**✅ 已完成（2026-10-16）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 Next 7 days 以后各天的数怎么算 | 已裁（改裁） | 今天一格不变，以后各天按「到期的题都在到期那天做对」推算；格子下不加说明 | 二·D1 |
| D2 Today 的主区 | 已裁 | 用户原话直接定：TODAY、NEXT 7 DAYS、LAST 7 DAYS、LADDERS 四个主区 | 二·D2 |
| D3 Tips 一块拆掉、各条建议归位 | 已裁 | A：拆掉 Tips；过期、少练、Great week 删去；做检验卷接在目标行后；重读 Key idea 放进 TODAY | 二·D3 |
| D4 每周目标放在哪、Compared with your goals 怎么办 | 已裁 | A：This week 留在 NEXT 7 DAYS，删掉 Compared with your goals | 二·D4 |
| D5 Newly mastered 与它的替补句 | 已裁 | A：只在有新掌握时出现；「moved up」并进 Last 7 days 统计行；「Almost there」删去 | 二·D5 |
| D6 TODAY 大数字旁的说明 | 已裁 | A：「58 overdue · 50 due today」，下一行「Mostly <专题> and <专题>.」 | 二·D6 |
| D6a 主要专题按哪些题算 | 已裁 | A：按全部还没做的到期题算 | 二·D6 |

## 目的

用户原话：「Improve the "Today" page: 1. For 'NEXT 7 DAYS", there are 108 due questions today and 13 tomorrow, for Sophia. There should also be due questions for next 5 days.(Event all due questions will be answered correctly today and tomorrow) 2. For "This week" "TIPS" "COMPARED WITH YOUR GOALS" "NEWLY MASTERED" sections, the messages are messy. All the messages on this page look messy. Please re-org and refine them. So they reside in or adjacent to their related sections. Main sections are: TODAY, NEXT 7 DAYS, LAST 7 DAYS, LADDERS.」

本轮具体交付：

1. 实现：`app/arena.html` 的 Next 7 days 计算与 Today 各区的消息；`app/logic.test.js` 的断言。
2. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳用 10-16 读出的真实数据副本以 Sophia 看 Today：Next 7 days 与四个主区符合裁决；375 宽看一次；发布后线上能打开。

## 输入

- 同主题未完成讨论：无（0001–0017 均为 ✅）。
- 0015 D4、D4a（已完成）：Next 7 days 每格是那天真正到期的题数，去掉「If every answer is right」的模拟与「At 24 a day …」那一行；D5 把 Tips 移到 Next 7 days。本轮 D1 重议 D4 的口径。
- 0016 D2（已完成）：今天一格 = 今天做过与此刻到期的并集，与大数字的分母相同。
- 0017（已完成）：问候下一行为「✅ N right today · ⭐ N mastered today · 🔥 N-day streak」。

---

## 一、证据

### E1 Sophia 的 Next 7 days 为什么只有两天有数（2026-10-16 读 `db`，用页面的纯逻辑算）

Sophia 的 121 道错题（英文 107、科学 14），阶梯现状：

- 58 道在等第 1 次重做、10-15 到期（过期）；50 道在等第 1 次重做、10-16 到期；13 道在等第 2 次重做、10-17 到期（10-15 做对的）。
- 现在七格：108、13、0、0、0、0、0。108 = 58 + 50。

现在的口径（0015 D4）只看每道题此刻的下次重做日。今天这 108 道还没做，下次重做日还没有排出来，所以以后各天是 0；做完以后才会出现在 10-18（做对）或 10-17（做错）。

按「每道到期题都在到期那天做对」往后推（不设每天题数上限），七格是：108、13、108、0、0、13、108。今天的 108 道做对后在第 2 次重做（隔 2 天，10-18）；10-17 的 13 道做对后在第 3 次重做（隔 4 天，10-21）；10-18 的 108 道做对后隔 4 天到 10-22。Aaron 看同一批题（默认归属人是 Sophia）：现在 91、30、0、0、0、0、0，推算后 91、30、91、0、0、30、91。

与 0015 删掉的模拟不同：那次按「每天做一批（Questions per batch）」模拟，会把今天做不完的推到明天；现在每科做完一批还能再开一批，一天的题数没有上限，所以推算不需要批数。

### E2 现在 Today 上的消息（2026-10-16，本地测试壳，Sophia，375 宽）

从上到下：

1. 问候：「Hi Sophia」「Fri, 16 Oct」「✅ 0 right today · 🔥 2-day streak」。
2. 无标题的今天区：大数字「0/108」；「20 first redos · 88 more due after these」「Mostly Vocabulary & collocations (6) and Electrical system (4), plus 8 other topics.」；按钮「English · 0/94」「Science · 0/14」；有检验卷时一块「Check papers」。
3. NEXT 7 DAYS：七格；THIS WEEK（日历周，周一到周日）「Practise on 6 days: 2/6」「Check papers: 2/2」；TIPS「58 questions are overdue — do them first.」「Little and often: aim for 6 days a week — you practised on 2 of the last 7.」「Read the Key idea again for Prepositions before you redo it.」。
4. LAST 7 DAYS：「36 questions reviewed」「48 answers: 29 right · 0 partly · 19 wrong · practised on 2 of 7 days」、图例与柱状图；NEWLY MASTERED 下是替补句「13 questions moved up the ladder in the last 7 days.」；COMPARED WITH YOUR GOALS「Practised on 2 of 7 days · goal 6」「Check papers: 2 · goal 2」「58 questions are overdue」。
5. 无标题的阶梯区：MASTERED「0 / 121」与说明；WAITING FOR 五行。

### E3 乱在哪里（从 E2 归纳）

- **同一件事说了几遍。** 练习天数出现 4 次（This week、第 2 条 Tip、Last 7 days 的统计行、Compared 第 1 行）；检验卷目标 2 次（This week、Compared 第 2 行）；过期题 2 次（第 1 条 Tip、Compared 第 3 行）。
- **两种「一周」混用。** This week 按日历周（周一起，今天周五，`goalProgress`）；Compared、第 2 条 Tip、统计行按最近 7 天（`weekReview`）。两者今天碰巧都是 2，平时会不一样。术语表 Weekly goal 定义为日历周。
- **放错了区。** Tips 放在 Next 7 days，但三条分别说今天要先做的（过期）、过去 7 天的练习天数、过去 7 天错得最多的专题（`topWrong`）；没有一条说未来 7 天。
- **标题与内容不符。** 没有新掌握时，Newly mastered 标题下放的是「moved up the ladder」或「Almost there: N … waiting for the 4th redo」；后者说的是阶梯现状。
- **两个区没有标题。** 今天区与阶梯区没有与另两区同级的标题。
- **今天区的说明难懂。** 「20 first redos」说的是两个按钮这一批（英文 10、科学 10）的构成，「88 more due after these」是其余到期题；用户看到的是 0/108，要自己把 20 + 88 对上。

---

## 二、提议与裁决

### D1 Next 7 days 以后各天的数怎么算

证据：E1。重议 0015 D4（当时选「每格是那天真正到期的题数」）。

- A（推荐）**按「到期的题都在到期那天做对」推算。** 今天一格不变（今天做过与此刻到期的并集）；其后各天把每道未掌握的题从它的下次重做日（过期的算今天）起，按 1、2、4、7 天的间隔往后推，落在哪天就数进哪天，做对第 4 次重做后不再出现。七格下加一行小字「If every redo is right」。Sophia 今天：108、13、108、0、0、13、108。代价：以后各天是推算，做错的题实际会提前（第二天就回来），格子会变；要多一个纯函数与断言。
- B **格子照旧是现排的到期数，另加一行推算。** 代价：两行数，七格里多一层概念，手机上更挤。
- C **不改。** 代价：今天没做完之前，以后各天总是 0，看不出接下来的量。

用户先问为什么是这几个数。答：108 道在等第 1 次重做（58 道过期按今天算，加 50 道今天到期），13 道在等第 2 次重做、10-17 到期；108 道今天做对，隔 2 天到 10-18；13 道 10-17 做对，隔 4 天到 10-21；108 道 10-18 做对，隔 4 天到 10-22；19、20 日没有题。成块是因为 121 道都在 10-14 录入。

**裁决（2026-10-16）：A。** 随后改裁（2026-10-16），用户原话：「remove "If every redo is right"」——照 A 推算，格子下不加说明。

### D2 Today 的主区

用户原话已定：主区是 TODAY、NEXT 7 DAYS、LAST 7 DAYS、LADDERS。做法：今天区与阶梯区补上同样的小标题「Today」「Ladders」；问候与日期、问候下一行（0017）留在最上面，不算主区。

**裁决（2026-10-16）：用户原话直接定。**

### D3 Tips 一块拆掉、各条建议归位

证据：E2、E3。依赖 D2、D4、D6。现在的建议（`weekTips`）有五种：过期、少练、做检验卷、重读 Key idea、Great week。D6 已把过期放进 TODAY 的说明行；D4 已把目标只留在 This week。

- A（推荐）**拆掉 Tips 一块；过期、少练两条删去，做检验卷挂在目标行，重读 Key idea 放进 TODAY，Great week 删去。** 过期已在 TODAY 说明行；少练已由 This week 的「○ Practise on 6 days: 2/6」表明。检验卷目标没达到时，这一行后接「— try one on Prepositions」（没有错得多的专题时「— try one on mixed topics」）。最近 7 天某专题错了 3 次以上时，TODAY 专题行下加「Read the Key idea again for Prepositions before you redo it.」。目标全打勾已经说明这周好，不另说 Great week。代价：`weekTips` 拆散，断言重写。
- B **同 A，但 Great week 留在 LAST 7 DAYS 底部。** 代价：多一句、多一个条件。
- C **Tips 一块整体移进 TODAY，内容不变。** 代价：过期、少练仍与别处重复。

**裁决（2026-10-16）：A。**

### D4 每周目标放在哪、Compared with your goals 怎么办

证据：E2、E3。Compared 的三行在别处都有：练习天数与检验卷在 This week（日历周），过期在 Tips；Weekly goal 按术语表是日历周。D3 依赖本题（「做检验卷」那条建议放在目标旁）。

- A（推荐）**This week 留在 NEXT 7 DAYS，删掉 Compared with your goals。** 目标只按日历周说一次；Last 7 days 统计行的「practised on 2 of 7 days」作为过去 7 天的事实保留。代价：页面上仍有两种「一周」，但一个是目标、一个是统计。
- B **This week 移到 LAST 7 DAYS，替代 Compared。** 代价：Last 7 days 一区里混着最近 7 天与日历周两种口径；Next 7 days 只剩七格。

**裁决（2026-10-16）：A。** 随后用户问能不能只留一种「一周」；给的选项是「目标改按最近 7 天、放进 LAST 7 DAYS」（推荐）与「只用日历周、统计行去掉 practised on」。用户收回：「I revoke my request. Keep D4 as A.」

### D5 Newly mastered 与它的替补句

证据：E2、E3。替补句有两种：「N questions moved up the ladder in the last 7 days.」（最近 7 天做对而升级的题数）；「Almost there: N questions are waiting for the 4th redo.」（阶梯现状，与 LADDERS 里「4th redo (day 14)」那一行同一个数）。

- A（推荐）**Newly mastered 只在有新掌握时出现；「moved up」并进 LAST 7 DAYS 的统计行，「Almost there」删去。** 统计行如「48 answers: 29 right · 0 partly · 19 wrong · 13 moved up」。代价：没有「Almost there」的鼓励语气。
- B **同 A，但「Almost there」移到 LADDERS 的 Waiting for 下面。** 代价：与第 4 次重做那一行的数重复。
- C **两句都删。** 代价：「升级了几题」页面上别处没有。

**裁决（2026-10-16）：A。**

### D6 TODAY 大数字旁的说明

证据：E2、E3。D3 依赖本题（过期那条建议是否并进这一行）。重做按钮本来按下次重做日从早到晚取题（`dailyList`），过期的总在前面，「do them first」不用另说。

- A **一行说到期的构成，一行说主要专题。** 「58 overdue · 50 due today」，下一行「Mostly Vocabulary & collocations and Electrical system.」（去掉括号里的题数与「plus 8 other topics」）。代价：两行。
- B（推荐）**只留一行到期的构成。** 「58 overdue · 50 due today」；没有过期时只说「50 due today」。专题那行去掉。代价：看不到这一批主要是哪些专题（进卷子才看到）。
- C **照旧。** 「20 first redos · 88 more due after these」与专题行不变。代价：E3 说的「要自己把 20 + 88 对上」照旧。

数字都按还没做的算：做了一些后，过期与今天到期各自减少。都做完时照旧出「All caught up for today!」与下次重做日。

**裁决（2026-10-16）：A。** 第一次问时用户没有作答（插问 D4），再问后选 A。

D6a（由 D6 引出）：主要专题现在按两个按钮这一批（20 道）算，上一行改说全部还没做的到期题（108 道）之后，两行口径不同。

- A（推荐）**按全部还没做的到期题算。** 与上一行同一批题。代价：说的不一定是下一张卷上的专题。
- B **照旧按这一批算。** 代价：两行说的是不同的题。

**裁决（2026-10-16）：A。**

---

## 三、核销表

页面上四个主区从上到下：Today、Next 7 days、Last 7 days、Ladders；问候两行在最上面不变。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1 | `app/arena.html` 纯逻辑 | `dueByDay(todo, today)`：今天一格照旧（`todayCounts(…).total.all`）；其后各天改为推算：每道未掌握、有 `due` 的题，从 `due`（早于今天的算今天）与当前 `step` 起，在那天算一次，第 4 次重做后停，否则 `step` 加一、往后隔 `GAPS[step]` 天再算一次，直到超出第 7 天；只数落在今天之后的。注释同步。Sophia 10-16：108、13、108、0、0、13、108 |
| 2 | D1 | `app/arena.html` Next 7 days | 格子下不加说明；悬停提示照旧「<日期>: N questions」 |
| 3 | D2 | `app/arena.html` Today、Ladders | 今天区顶上加小标题「Today」，跨两列（`grid-column: 1 / -1`）；阶梯区顶上加小标题「Ladders」，`aria-label` 由「Progress」改「Ladders」；两者与「Next 7 days」「Last 7 days」同样式。阶梯区原有「Mastered」「Waiting for」作为其下的小节保留，套用 `.sub` 的分隔线（复审 F4） |
| 4 | D6、D6a | `app/arena.html` 纯逻辑与 Today | 加纯函数 `dueSplit(todo, today)` 返回 `{ overdue, today }`：未掌握、`due` 早于今天的题数与 `due` 等于今天的题数。还有要做的题时，说明第一行「<N> overdue · <M> due today」，为 0 的一项不出；第二行「Mostly <专题> and <专题>.」，专题按全部此刻到期的题（`dueNowIds`）数，取前两个，只有一个时「Mostly <专题>.」，去掉括号里的题数与「plus N other topics」。去掉「first redos / missed last time / to review」与「N more due after these」；`leftMix` 只算专题（删 `first`、`missed`、`review`），注释同步。没有要做的题时照旧（All caught up / Nothing due today 与下次重做日） |
| 5 | D3 | `app/arena.html` 纯逻辑与 Today | 加纯函数 `keyIdeaTip(week, name)`：`topWrong.n >= 3` 时返回「Read the Key idea again for <专题> before you redo it.」，否则空。放在专题行下；专题行只在还有要做的题时出现，这句随之（复审 F3） |
| 6 | D3、D4 | `app/arena.html` 纯逻辑与 Next 7 days | 删 Tips 一块与 `.tips` 的样式；加纯函数 `paperTry(week, name)` 返回「 — try one on <专题>」（`topWrong` 为空时「 — try one on mixed topics」）；This week 的检验卷行在本周（日历周）没达到时后接它；练习天数行不变；`planBlock` 注释改为「未来 7 天每天的题数（今天之后按全对推算）与本周目标」 |
| 7 | D4、D5 | `app/arena.html` 纯逻辑与 Last 7 days | 删 Compared with your goals；Newly mastered 只在有新掌握时出现；加纯函数 `reviewLine(week)` 返回统计行「N answers: R right · P partly · W wrong · K moved up · practised on D of 7 days」，K 为 0 时不出「moved up」那一项 |
| 8 | D3、D4、D5 | `app/arena.html` 纯逻辑 | 删 `goalChecks`、`weekTips`；`weekReview` 去掉 `fallback`、`overdue` 与只为它们用的 `todo` 参数（改为 `weekReview(done, papers, today, uid)`，注释同步），加 `moved`（最近 7 天做对而升级的题数，即原 `moved.size`）；`renderPractice`、`planBlock`、`reviewBlock` 的参数随之收拢。「Almost there」整句删去（复审 F2） |
| 9 | D4 | `app/arena.html` 设置页 | 「Weeks run Monday to Sunday. The goal shows in Next 7 days on Today, and Last 7 days compares against it.」改为「Weeks run Monday to Sunday. The goal shows in Next 7 days on Today.」 |
| 10 | D1–D6 | `app/logic.test.js` | `dueByDay` 断言改为推算（今天含过期、已掌握不算、做对后按间隔落到以后各天、第 4 次重做后不再出现、7 个连续日期、今天一格等于 Today 的一共）；删 `goalChecks`、`weekTips` 的断言与导出；`weekReview` 断言按新签名，`fallback`、`overdue` 换成 `moved`，删 `wsplit` 一组；`leftMix` 断言只留专题；加 `dueSplit`（过期、今天、已掌握不算）、`keyIdeaTip`（错 2 次空、3 次出句）、`paperTry`（有专题、mixed topics）、`reviewLine`（moved 为 0 时不出）的断言并导出（复审 F1） |
| 11 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；`grep -nE "goalChecks|weekTips|fallback|Compared with|Almost there|Little and often|Great week|more due after|first redo|missed last time|to review|Make a check paper|other topic|\.tips|class=\"tips"` 在 `app/` 无结果；落盘者逐行对照本表核对实际稿。本地测试壳（今天固定 2026-10-16，10-16 读出的真实数据副本）以 Sophia 看 Today：四个主区有标题；说明「58 overdue · 50 due today」，专题行照实记录；「Read the Key idea again for Prepositions before you redo it.」；七格 108、13、108、0、0、13、108；This week 两行（检验卷 2/2 已达到，不出 try one，这条由断言覆盖）、没有 Tips；Last 7 days 统计行含「13 moved up」、没有 Newly mastered 与 Compared；375 宽看一次（复审 F6） |
| 12 | 发布 | 线上页面 | 发布到原网址，以发布工具回报为准核对线上没有别处的新版本；发布后读回线上页面，核对有「Ladders」与「moved up」、没有「Tips」与「Compared with」；能力与契约不变；不改数据（复审 F7） |
| 13 | —— | 不改 | `CONTEXT.md`、`DATA.md` 不改：没有新概念，Weekly goal 仍按日历周，Due 的定义不变（推算只是显示）。不立 ADR（可逆、无数据迁移）。0015、0016 冻结不改。提交只含 `app/arena.html`、`app/logic.test.js` 与本讨论文件；验证用的 `.claude/launch.json` 与测试壳不进提交（复审 F8） |

## 四、复审

复审者（新上下文 subagent）交回 8 条，逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 新规则写在渲染函数里，没有断言 | 成立：地图规定页面行为以断言为准；「错 3 次才出」「mixed topics」原有断言会随 `weekTips` 删掉 | 机械：行 4–7 把规则收进纯函数 `dueSplit`、`keyIdeaTip`、`paperTry`、`reviewLine`，行 10 补断言 |
| F2 `weekReview` 的 `todo` 参数删后没用 | 成立：只供 `s4` 与 `overdue` | 机械：行 8 删参数、改签名与注释；行 10 删 `wsplit` 一组 |
| F3 行 5「且还有要做的题时」超出 D3 | 成立，但来自「放在专题行下」 | 机械：行 5 写明来由 |
| F4 标题挤进两列 grid、层级、`aria-label` | 成立：`.today` 是两列 grid | 机械：行 3 写明跨列、`aria-label`、`.sub` 分隔 |
| F5 `.tips` 样式、`planBlock` 注释、检索词没列全 | 成立 | 机械：行 6、11 补齐 |
| F6 验证期望写成条件式 | 成立：E2 已显示 Prepositions | 机械：行 11 写定 |
| F7 发布后没写读回 | 成立 | 机械：行 12 补读回 |
| F8 未跟踪的 `.claude/launch.json` | 成立 | 机械：行 13 写明提交范围 |

重写了行 3–8、10–13，按简报自查：每行对得上登记表；新加的四个纯函数只是把已裁的文字与条件放进可断言的位置，没有新的设计选择；不必再派复审。

## 五、核销（2026-10-16）

授权：用户确认完整核销表（「确认 0018 的完整核销表，按表落盘、验证、发布并提交」）。

| 核销表行 | 状态 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | `dueByDay` 今天一格照旧，其后各天按表中规则推算；注释同步。测试壳 Sophia 七格 108、13、108、0、0、13、108 |
| 2 | ✅ | 七格下没有说明；悬停提示未改 |
| 3 | ✅ | 今天区加「Today」（`.today-h` 跨两列）；阶梯区加「Ladders」，`aria-label` 改「Ladders」，「Mastered」「Waiting for」两块加 `.sub` 分隔线（`.dash .sub` 并入原规则） |
| 4 | ✅ | 加 `dueSplit`；说明行「58 overdue · 50 due today」，专题行按 `dueNowIds` 取前两个，测试壳为「Mostly Vocabulary & collocations and Prepositions.」；`leftMix` 只算专题，first/missed/review 与「more due after these」已删 |
| 5 | ✅ | 加 `keyIdeaTip`，只在还有要做的题时放在专题行下；测试壳出「Read the Key idea again for Prepositions before you redo it.」 |
| 6 | ✅ | 删 Tips 一块与 `.tips` 样式；加 `paperTry`，接在 This week 检验卷行后（本周未达到时）；`planBlock` 注释已改。Sophia 本周 2/2，测试壳不出，由断言覆盖 |
| 7 | ✅ | 删 Compared with your goals；Newly mastered 只在有新掌握时出现；加 `reviewLine`，测试壳为「48 answers: 29 right · 0 partly · 19 wrong · 13 moved up · practised on 2 of 7 days」 |
| 8 | ✅ | 删 `goalChecks`、`weekTips`；`weekReview(done, papers, today, uid)` 去掉 `fallback`、`overdue`，加 `moved`；三个渲染函数参数收拢；「Almost there」已删 |
| 9 | ✅ | 设置页说明改为「Weeks run Monday to Sunday. The goal shows in Next 7 days on Today.」 |
| 10 | ✅ | 断言按表改写与补齐（`dueByDay` 推算含第 4 次重做后不再出现、`dueSplit`、`keyIdeaTip`、`paperTry`、`reviewLine`、`weekReview` 新签名、`leftMix` 只留专题），导出同步；`wsplit` 一组已删 |
| 11 | ✅ | `./check.sh` 退出码 0；`node app/logic.test.js app/arena.html` 通过。检索在 `app/` 只命中 `arena.html` 1469 行 Papers 页的标题「Make a check paper」，那是组卷页标题、不是建议，保留。落盘者逐行对照本表核对实际稿，没有表外的新语义。本地测试壳（今天固定 2026-10-16 09:00，10-16 读出的真实数据副本，Sophia）四个主区标题、说明行、Key idea 句、七格、This week 两行、无 Tips、统计行与无 Compared 均如上；375 宽 `scrollWidth` 375，无横向滚动 |
| 12 | ✅ | 发布前读线上（版本 1792110661-c761），去掉外壳后与上次提交的 `app/arena.html` 逐字相同，没有别处的新版本；发布为第 26 版（1792114709-2d88），能力与契约照旧。读回线上，去掉外壳后与本地文件逐字相同；有「Ladders」「moved up」，没有 `class="tips"` 与「Compared with」 |
| 13 | ✅ | `CONTEXT.md`、`DATA.md`、`adr/` 未改；提交只含 `app/arena.html`、`app/logic.test.js` 与本讨论文件；`.claude/launch.json` 与测试壳不进提交 |

未验证：真实 claude.ai 里以 Sophia 账号打开的显示（测试壳模拟了 `db` 与用户）。
