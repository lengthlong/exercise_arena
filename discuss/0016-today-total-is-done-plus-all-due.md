# 0016 Today 的「一共」与今天一格是今天的总数、只数每日重做；Check papers 列出没做与今天做完的卷

> 状态：**✅ 已完成（2026-10-15）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 按钮与大数字的分母 | 已裁 | A：已做 + 此刻全部到期（例：English · 23/81） | 二·D1 |
| D2 Next 7 days 今天一格 | 已裁 | 今天到期的总数，与分母相同（例：81） | 二·D2 |
| D3 重做区的数字不数检验卷 | 已裁 | 用户原话直接定：「今天做过」只数每日重做的作答 | 二·D3 |
| D4 Today 的检验卷一块 | 已裁 | 标题改「Check papers」；列没做的与今天做完的；每张显示已做/总题数，做完的加得分 | 二·D4 |
| D4a 点今天做完的卷 | 已裁 | 不能点；详情去 Papers 页看 | 二·D4 |

## 目的

用户原话（第一段）：「Check the 'Today' page for Sophia, why there are 58 for today in 'NEXT 7 DAYS' and 23/33 on 'Redo' button (58 != 33).」查清原因后，用户选了 A，并问：「for the number on 'Today' of 'Next 7 days', should it also be the same to 81?」

用户原话（第二段，核销表确认前追加）：「Also for the numbers in 'redo' sections, don't count the questions in 'Test Paper'; rename 'Check papers to do' to 'Check papers' and show the question numbers for each paper.」

本轮具体交付：

1. 实现：`app/arena.html` 的 Today 分母、Next 7 days 今天一格、「今天做过」的口径、检验卷一块；`app/logic.test.js` 的断言。
2. 重新发布到原网址。

完成标准：`./check.sh` 与测试通过；本地测试壳用 10-15 读出的真实数据副本以 Sophia 看 Today：按钮「English · 23/81」、大数字 23/81、Next 7 days 今天一格 81；以 Aaron 看重做区不数检验卷、Check papers 一块列今天交的两张检验卷；发布后线上能打开。

## 输入

- 同主题未完成讨论：无（0001–0015 均为 ✅）。
- 0013 D1（已完成）：「已做/一共」里一共 = 已做与还要做的并集，还要做的当时就是按钮上的题。
- 0015 D1d、D4（已完成）：每科各算一批；Next 7 days 每格是那天真正到期的题数，今天一格含过期。

---

## 一、证据

### E1 Sophia 今天的数（2026-10-15 再读 `db`，用页面的纯逻辑计算）

- Sophia 的「Questions per batch」是 10（Aaron 是 24）；默认归属人是她自己，121 道错题（英文 107、科学 14）。
- 今天已做 23 道（都在每日卷上：对 13、错 10）；此刻还到期 58 道（没有过期的）。
- 按钮「English · 23/33」：33 = 已做 23 + 这一批 10。Next 7 days 今天一格 58 = 此刻还到期的（今天做过的已经不到期：对的排到以后、错的排到明天）。
- 所以两个数口径不同：一个是「已做 + 这一批」，一个是「此刻还剩」。今天真正的总量是 23 + 58 = 81。0015 把格子从模拟数改成真实到期数后，这个差别才露出来。

### E2 Aaron 今天的检验卷（同一次读 `db`）

Aaron 今天交了两张英文检验卷：10 题的一张 20:06 交、12 题的一张 20:14 交，组卷日都是 10-14，归属人都是 Sophia（Aaron 的默认归属人）。他今天在检验卷上做过 19 道不同的题，其中 11 道今天在每日卷上也做过。

---

## 二、提议与裁决

### D1 按钮与大数字的分母

证据：E1。

- A（推荐）**已做 + 此刻全部到期。** 按钮「English · 23/81」，大数字 23/81；点按钮照旧只组一批（10 道）。81 − 23 = 58，与格子对得上。代价：按钮上看不出这次出几道。
- B **A 再加上这一批的题数。** 「English · 23/81 · next 10」。代价：按钮长，手机上可能换行。
- C **不改**，接受口径不同。

**裁决（2026-10-15）：A。**

### D2 Next 7 days 今天一格

证据：E1。依赖 D1。

- A（推荐）**今天到期的总数，与分母相同（81）。** 今天做过的题今天也到过期，算进来；一天里基本不变，和后面几天「那天到期多少」同义。代价：格子里看不出还剩多少，剩的看按钮（23/81）。
- B **此刻还剩的（58）。** 保持现状；代价：一天里不断变小，与按钮的分母不是同一个数。

**裁决（2026-10-15）：A。** 初记推论「今天一格可能含只在检验卷上做过的题」，被 D3 取代：「今天做过」只数每日重做，今天一格因此不含只在检验卷上做过的题。

### D3 重做区的数字不数检验卷

证据：0013 D2、0014 D4 定了「已做」也数检验卷上做的题；`todayCounts` 的「今天做过」取我今天的全部作答（不论 `mode`）；E2。用户原话已定：重做区（大数字、按钮的「已做/一共」）不数检验卷上的题；Next 7 days 今天一格由 D2「与分母相同」带出，也随之不数（复审 F5）。做法：`todayCounts` 的「今天做过」只取 `mode` 不是 `"paper"` 的作答。真实数据：Sophia 今天的作答都在每日卷上，她的数不变（23/81、81）；Aaron 今天在检验卷上做过的题不再计入。阶梯规则（0014）不变；连续天数、练习天数、Last 7 days、鼓励语照旧数检验卷（0014 D5）。

**裁决（2026-10-15）：用户原话直接定，推翻 0013 D2 与 0014 D4。** 连带（复审 F4）：只做了检验卷的那天，Today 的标题与下一行按「今天做过」判断，会显示「Nothing due today」一类而不是「All caught up」；今天到期的题在检验卷上做错后排到明天，又不算今天做过，今天一格会因此变小 —— D2 说的「一天里基本不变」只对每日重做成立。

### D4 Today 的检验卷一块

证据：Today 现在有一块「Check papers to do」，列默认归属人的、我还没交的检验卷，每张写「N questions」与组卷日期，点了开始做（`papersToDo`）。

用户原话要求改名并「show the question numbers for each paper」。追问的选项：A 列出全部检验卷（含做过的），每张显示「已做/总题数」，做完的再写得分；B 只列没做的，把题数放得更显眼；C 显示每张卷上的题号。

**裁决（2026-10-15）：A，做完的只列今天做完的。** 用户原话：「A. for the finished papers, limit the ones that are finished today.」即：标题「Check papers」；列默认归属人的检验卷中，我还没交的，加上我今天交的；每张显示「已做/总题数」（已做是我在这张卷上有作答的题数），做完的再写得分。

D4a（复审 F2 引出）：点今天做完的卷。现在卷子列表的「View details」会跳到 Papers 页的卷面详情，返回键回 Papers，不回 Today。A（推荐）不能点，详情去 Papers 页看；B 跳到 Papers 的卷面详情。**裁决：A。**

## 三、核销表

用词：「此刻全部到期」指默认归属人的错题中，按我的阶梯未掌握且 `due` 不晚于今天的题（不按一批截断）；「今天做过」指我今天有 `mode` 不是 `"paper"` 的作答的题（D3）。今天一格与分母都是两者的并集，实现注释写「今天做过与此刻到期的并集」，不写「今天到期」。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1、D2 | `app/arena.html` 纯逻辑 | 加 `dueNowIds(todo, today)`：此刻全部到期的题 id。`dueByDay` 今天一格改为 `todayCounts(todo, today, dueNowIds(todo, today)).total.all`，其后各天不变；注释改为「今天一格是今天做过与此刻到期的并集（已掌握的不算，今天做过的除外）；其后各天为 due 等于那天」 |
| 2 | D3 | `app/arena.html` 纯逻辑 | `todayCounts` 的「今天做过」只取 `mode` 不是 `"paper"` 的今天的作答；注释改为「每日重做上今天做过的题（检验卷不算），一题一次」 |
| 3 | D1、D3 | `app/arena.html` Today | `todayBlock` 里 `todayCounts` 的第三个参数改为 `dueNowIds(todo, today)`；`todayBlock` 开头注释「已做含检验卷上做的题」改为「已做只数每日重做」，标题处注释「只说还剩的是什么题」改为「说这一批是什么题」（复审 F1）。不改：`redoButtons`（点下去仍只组这一科的一批）、标题 `head` 与下一行的判断代码（随 D3 的口径变，见 D3 连带）、按钮行的显示条件、打勾标签、「N more due after these」、`leftMix` |
| 4 | D4 | `app/arena.html` 纯逻辑 | `papersToDo` 改名 `todayPapers(papers, view, defaultOwner, uid, today)`：默认归属人的检验卷中，我没交的，加上我交卷时刻在今天的；每日卷不在其中；排序在这里定：没交的在前、按组卷日期新的在前，交过的在后、按交卷时刻早的在前（复审 F3）。加 `paperProgress(paper, view)` 返回 `{ done, total }`：`total` 为卷上仍在的题数，`done` 为其中我在本卷有作答的题数（按 `paperAttempts`） |
| 5 | D4、D4a | `app/arena.html` Today | 那一块标题「Check papers」；按 `todayPapers` 的顺序列出；每张右边写「已做/总题数」（如 0/10），交过的再写「· N right」（N 为 `paperScore` 的 right；交了卷、主观题没自评时已做小于总题数，照实显示）；下面一行照旧「科目 · set <组卷日>」。没交的是按钮，点了开始做（同现在）；交过的不是按钮、不能点（D4a）。`renderPractice` 里鼓励语的「有事可做」只数没交的检验卷 |
| 6 | D1–D4 | `app/logic.test.js` | 导出补 `dueNowIds`、`todayPapers`、`paperProgress`，删 `papersToDo`；断言：`todayPapers` 的排序；`dueNowIds` 取未掌握、`due` 不晚于今天的题；`dueByDay` 今天一格算进今天做过、已不到期的题，仍到期的只算一次，今天做到掌握的也算，等于 `todayCounts(todo, today, dueNowIds(todo, today)).total.all`；`todayCounts` 不数今天只在检验卷上的作答（改写 0013 那几条里「检验卷与每日卷都算已做」的断言）；`todayPapers` 列没交的与今天交的、不列昨天交的、不列每日卷、按默认归属人；`paperProgress` 没作答为 0、交过时按作答计、已删的题不计；原 `papersToDo` 的断言改为 `todayPapers`；第 194 行附近注释同步 |
| 7 | —— | 不改 | `CONTEXT.md`、`DATA.md` 不涉及（页面计数与列表，不是概念或数据）；0013、0014、0015 冻结不改 |
| 8 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；落盘者逐行对照本表核对实际稿；本地测试壳（今天固定 2026-10-15，10-15 再读的真实数据副本）以 Sophia 看 Today：按钮「English · 23/81」、大数字 23/81、Next 7 days 今天一格 81、其后各天与改前相同；以 Aaron 看：已做里不再有只在检验卷上做的题，今天一格等于大数字的分母，Check papers 一块列今天交的两张检验卷（10/10、12/12 与得分，不能点，E2）；375 宽看一次 |
| 9 | 发布 | 线上页面 | 发布到原网址，以发布工具回报为准核对线上没有别处的新版本；能力与契约不变；不改数据 |

---

## 四、复审

第一次复审（核销表只含 D1、D2 时）的五条发现都是机械修补，已并入上表：F1 抽 `dueNowIds` 并断言同源相等（行 1、6）；F2 注释与「今天做到掌握的也算」（行 1、6）；F3 列明不改的几处、改一处注释（行 3）；F4 验证写「其后各天与改前相同」（行 8）；F5 用词写「今天做过与此刻到期的并集」（用词）。之后用户追加 D3、D4，核销表重写，再派复审。

第二次复审（新上下文 subagent），逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 开头注释「已做含检验卷」与 D3 矛盾，行 3 没写 | 成立 | 机械：行 3 分开写两处注释 |
| F2 点交过的卷会跳到 Papers、回不到 Today，超出裁决 | 成立 | 回第 3 步，新题 D4a，用户裁 A（不能点），改行 5 |
| F3 得分写法、交过的排序、日期、没自评时的显示 | 成立 | 机械：行 4 定排序并断言，行 5 写明各处 |
| F4 D3 对标题、下一行与今天一格的连带影响 | 成立 | 机械：D3 写连带，行 3 写「随 D3 变」 |
| F5 今天一格不数检验卷是 D2 推出，不是用户原话 | 成立 | 机械：D3 改写 |
| F6 Aaron 的数没有证据；完成标准只写了 D1、D2 | 成立 | 机械：补 E2，完成标准补 Aaron |

重写了行 3–6、8，按简报自查：每行对得上登记表；行 5 随 D4a 改；其余为补漏，没有新的设计决定；不必再派复审。

## 五、核销（2026-10-15）

| # | 结果 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | 纯逻辑加 `dueNowIds`；`dueByDay` 今天一格为 `todayCounts(todo, today, dueNowIds(todo, today)).total.all`，注释按表 |
| 2 | ✅ | `todayCounts` 的「今天做过」只取 `mode` 不是 `"paper"` 的今天的作答，注释按表 |
| 3 | ✅ | `todayBlock` 的 `todayCounts` 第三个参数改为 `dueNowIds(todo, today)`；两处注释按表；所列不改的几处未动 |
| 4 | ✅ | `papersToDo` 改为 `todayPapers(papers, view, defaultOwner, uid, today)`，排序在其中；加 `paperProgress` |
| 5 | ✅ | 标题「Check papers」；右边「已做/总题数」，交过的加「· N right」；下一行「科目 · set 组卷日」；没交的是按钮，交过的是不可点的行；鼓励语只数没交的检验卷（`renderPractice` 里 `cps` 过滤出没交的） |
| 6 | ✅ | `app/logic.test.js` 导出补 `dueNowIds`、`todayPapers`、`paperProgress`，删 `papersToDo`；加今天一格四种情形与同源相等、`dueNowIds`、`todayPapers`（没交与今天交、排序、每日卷、按归属人）、`paperProgress`（含已删的题）断言；改写 `todayCounts` 两条（只在检验卷上做过的不算已做）；第 194 行注释同步 |
| 7 | ✅ | `CONTEXT.md`、`DATA.md` 未动 |
| 8 | ✅ | `./check.sh` 退出码 0，测试通过；落盘者逐行对照本表核对实际稿，没有表外的新语义。本地测试壳（今天固定 2026-10-15，10-15 再读的真实数据副本；题组用较早的副本，只影响材料显示）：Sophia 的 Today 为 23/81、按钮「English · 23/81」、Next 7 days 81、50、13、0、0、0、0（后面各天与改前相同）；Aaron 的 Today 为 48/80（只在检验卷上做过的不再计入，改前 56）、按钮「English · 48/80」、今天一格 80，Check papers 列今天交的两张「10/10 · 9 right」「12/12 · 12 right」，都是不可点的行；375 宽无横向滚动 |
| 9 | ✅ | 发布为第 21 版（version id 1792075156-fb81），发布工具没有报告线上有别处的新版本；能力与契约不变；没有改数据 |

验证中另见（不在本轮范围）：Sophia 的 Check papers 里那两张 10-14 的检验卷显示为没交、进度 10/10。原因：Sophia 10-14 就做完了（作答带这两张卷的 `paperId`），那时卷上没有 `handedIn`；10-15 Aaron 交卷时建了 `handedIn` 且只记了 Aaron，按 `DATA.md`「有 `handedIn` 时以它为准」，Sophia 就算没交。这是 0011 的规则与旧数据之间的缺口，影响卷子列表、每周检验卷目标与这一块，留给用户决定修法。

未验证：真实 claude.ai 里的显示（测试壳模拟了 `db`）。
