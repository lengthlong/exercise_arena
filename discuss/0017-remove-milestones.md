# 0017 去掉里程碑（徽章）；问候下一行改为今天的对题数、新掌握数与连续天数

> 状态：**讨论中（2026-10-15）** —— 第 1 批本地实现已落盘，commit `41215b4`；原网址发布待完成。

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 Today 问候行去掉徽章 | 已裁 | 用户原话直接定 | 二·D1 |
| D2 里程碑这个概念与代码 | 已裁 | A：概念、代码与断言一起删 | 二·D2 |
| D3 问候下一行的内容 | 已裁 | 「✅ N right today · ⭐ N mastered today · 🔥 N-day streak」（格式以预览为准），新掌握为 0 时不出那一项；鼓励语去掉 | 二·D3 |
| D3a 这一行的样式 | 已裁 | 手写体蓝字，15px | 二·D3 |
| D3b 对题数、连续天数为 0 时 | 已裁 | 照常显示 | 二·D3 |

## 目的

用户问「what does 'next ★ in 10' mean?」，听了解释后说：「ok, remove '徽章'」。

核销表确认前，用户追加：「change the message to "x right, x mastered, x-days streak" with emoj/icons.」

本轮具体交付：

1. 设计：`CONTEXT.md` 删 Milestone 词条。
2. 实现：`app/arena.html` 去掉徽章的显示与计算、问候下一行改为三项统计、去掉鼓励语；`app/logic.test.js` 删相应断言、补新断言。
3. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；`CONTEXT.md`、`DATA.md`、`adr/`、`app/` 不再有里程碑、徽章、`MILESTONES`、`masteryPeak` 与徽章的显示代码；本地测试壳看 Today 问候行；发布后线上能打开。

## 输入

- 同主题未完成讨论：无（0001–0016 均为 ✅）。
- 讨论 0006、0009（已完成）：Today 看板与里程碑的来历。

---

## 一、证据

### E1 里程碑出现在哪里（2026-10-15 `grep`，讨论、研究与内核 skill 之外）

- `CONTEXT.md`「Milestone（里程碑）」词条：一位用户已掌握的错题数第一次达到 10、25、50、100 道，达到后在 Today 显示为徽章。别的词条不引用它。
- `app/arena.html` 纯逻辑：`MILESTONES`、`masteryPeak`（历史最高掌握数），`dashboardData` 返回的 `peak`、`badges`、`next`、`toGo` 与一句注释。`masteryTransitions`、`masteredOn` 另被「新掌握」统计（`newMastered7`、`newMasteredToday`、Last 7 days 的 Newly mastered）用到。
- `app/arena.html` 问候行：「★N」「next ★ in N」、悬停提示、`.hello-meta .star` 样式、两处注释。
- `app/logic.test.js`：`masteryPeak` 两条断言、`dashboardData` 里 `peak`/`badges`/`next`/`toGo` 三处、「里程碑」两处注释、导出清单。
- `DATA.md`、`adr/`、`CLAUDE.md` 都没有提到。

---

## 二、提议与裁决

### D1 Today 问候行去掉徽章

证据：E1。用户原话已定。问候行去掉徽章；这一行的内容后来由 D3 取代（复审 F4）。

**裁决（2026-10-15）：用户原话直接定。**

### D2 里程碑这个概念与代码

证据：E1。去掉显示后，里程碑在页面上不再出现。

- A（推荐）**概念、代码与断言一起删。** 术语表删 Milestone 词条；删 `MILESTONES`、`masteryPeak` 与 `dashboardData` 的 `peak`、`badges`、`next`、`toGo`；`masteryTransitions`、`masteredOn` 留着（新掌握在用）。理由：本工作区的取向是没用的设计删干净；以后要再加，按那时的需要重新设计。
- B **只拿掉显示，概念与代码保留。** 代价：术语表留一个页面上看不到的概念，代码里留着不用的计算。

**裁决（2026-10-15）：A。**

### D3 问候下一行的内容

证据：问候下一行现在是鼓励语（`encouragement` 按顺序取一句，如「30 right today!」「Keep the streak!」「All caught up!」）接「🔥 N day(s)」。用户原话：改成「x right, x mastered, x-days streak」并配图标。「x right」按刚改的口径是今天在每日重做上做对的作答数（`dashboardData.todayRight`，检验卷不算）；「x-day streak」是连续天数（`streakInfo`，照旧算检验卷）。

追问「x mastered」指哪个数：A（推荐）已掌握的总数（同页面底部「Mastered 0/95」）；B 今天新掌握的（`newMasteredToday`）。

**裁决（2026-10-15）：B，为 0 时不显示这一项。** 用户原话：「B, if 0, don't show 'x mastered'」。格式以 B 的预览为准（复审 F6）：「✅ 30 right today · ⭐ 2 mastered today · 🔥 1-day streak」，连续 1 天写单数「1-day」。推论：鼓励语整句被这一行取代，`encouragement` 与只给它用的 `todayAny` 不再用，一并删。

第二次复审引出两题：

- D3a 这一行的样式（复审 F2）。A（推荐）正文字体、墨色、约 15px，三项齐全时手机上多半一行；B 保留原鼓励语的手写体蓝字（19px），手机上多半折行。**裁决：B，字号 15px。** 用户原话：「B. 15px.」
- D3b 对题数、连续天数为 0 时（复审 F5）。A（推荐）照常显示，如「✅ 0 right today · 🔥 2-day streak」；B 为 0 也不显示。**裁决：A。**

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D2 | `CONTEXT.md` | 删「Milestone（里程碑）」整个词条（标题、定义、`_Avoid_`） |
| 2 | D2、D3 | `app/arena.html` 纯逻辑 | 删 `MILESTONES` 与 `masteryPeak`；`dashboardData` 不再算、不再返回 `peak`、`badges`、`next`、`toGo`、`todayAny`，注释里「里程碑」去掉，「鼓励语的今天对了几题…」注释改为「问候行的今天对了几题只数每日重做（检验卷不算），与重做区一致；连续天数照旧数检验卷」（复审 F3）；`masteryTransitions`、`masteredOn` 不动 |
| 3 | D3 | `app/arena.html` 纯逻辑 | 删 `encouragement`；加 `helloStats(d)` 返回这一行的各项文字，按顺序：「✅ N right today」、新掌握大于 0 时「⭐ N mastered today」、「🔥 N-day streak」（`d` 取 `dashboardData` 的 `todayRight`、`newMasteredToday`、`streak`） |
| 4 | D1、D3 | `app/arena.html` 问候行 | 「Hi 名字」下一行为 `helloStats` 的各项用「 · 」连起来，手写体蓝字、15px（D3a；原手写体蓝字与小字两段合成一段，放不下时折行）；为 0 的对题数与连续天数照常显示（D3b）；删 `.cheer-msg`、`.hello .cheer-msg`、`.hello-meta` 及其 `b`、`.star` 样式与悬停提示，新样式类名为 `.hello-stats`；`helloBlock` 不再收鼓励语参数；`renderPractice` 里只为鼓励语算的「没交的检验卷」变量删去；块标题与函数注释改为「问候、今天的对题数、新掌握数与连续天数」 |
| 5 | D2、D3 | `app/logic.test.js` | 导出清单删 `masteryPeak`、`encouragement`，补 `helloStats`；删 `masteryPeak` 两条断言与其注释；`dashboardData` 断言去掉 `peak`、`badges`、`next`、`toGo`（`dd` 那一条删、`ds` 那一条去掉 `peak` 一项）；删「里程碑」一节（`mast27`、`dm` 与其断言）与「作答、里程碑、连续天数看 done」注释里的里程碑；删鼓励语六条断言与 `base`；`dEnc` 只断言 `todayRight`，「鼓励语各分支」「鼓励语的今天对了几题」两处注释改写（复审 F3）；加 `helloStats` 断言：三项齐全、新掌握为 0 时只两项、对题数与连续天数为 0 照常出现、连续 1 天写「1-day streak」 |
| 6 | 完成标准 | 验证（不改文件） | `./check.sh` 与测试通过；`grep -rniE "milestone|里程碑|徽章|鼓励语|masteryPeak|badges|toGo|todayAny|\bpeak\b|class=\"star\"|\.star \{|stars|nextB|next ★|encouragement|cheer-msg"` 在 `CONTEXT.md`、`DATA.md`、`adr/`、`app/` 中无结果（阶梯的「★ mastered」保留，不在检索词里）；落盘者逐行对照本表核对实际稿；本地测试壳（10-15 的真实数据副本）以 Aaron、Sophia 各看问候下一行，实际文字落盘时照实记录；375 宽看一次 |
| 7 | 发布 | 线上页面 | 发布到原网址，以发布工具回报为准；能力与契约不变；不改数据 |
| 8 | —— | 不改 | `DATA.md`、ADR 不涉及；0006、0009 等冻结的讨论不改 |

---

## 四、复审

第一次复审（核销表只含 D1、D2 时）三条低级发现已并入：验证的 grep 补词（行 6）、目的与验证范围一致、验证写成「照实记录」。之后用户追加 D3，核销表重写，再派复审。

第二次复审（新上下文 subagent），逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 检索词 `\.star` 会命中 `.startsWith` | 成立 | 机械：行 6 改为 `class="star"` 与 `\.star \{` |
| F2 行 4 的字体、颜色、字号是未裁的新决定 | 成立 | 回第 3 步，D3a，用户裁 B（手写体蓝字）、15px；改行 4 |
| F3 删鼓励语后 `todayAny` 与几处注释残留 | 成立 | 机械：行 2、5 补删改，行 6 检索补「鼓励语|todayAny」 |
| F4 D1 正文与 D3 对不上 | 成立 | 机械：D1 正文注明由 D3 取代 |
| F5 对题数、连续天数为 0 时未裁 | 成立 | 回第 3 步，D3b，用户裁 A（照常显示）；改行 4、5 |
| F6 文字格式超出原话 | 成立（以预览为准） | 机械：D3 写明格式以预览为准 |

重写了行 2、4、5、6，按简报自查：每行对得上登记表；行 4、5 随 D3a、D3b 改，其余为补漏；不必再派复审。


## 分批核销（第 1 批，2026-10-15）

授权：用户在本会话直接要求「finish the work in 0017-remove-milestones.md」，按本轮现有完整核销表落实。登记表上的裁决均继续有效。

分批理由：本会话没有 Claude Artifact 发布工具；已检索可用插件，未找到相应能力。原网址在本会话浏览器中显示「Sign in to view this page.」。本地实现能独立验证、提交；第 7 行发布及线上打开仍待完成，不以本地通过代替发布，不冻结本轮。

| 核销表行 | 状态 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | `CONTEXT.md` 已删 Milestone 的标题、定义与 `_Avoid_`，相邻词条未改 |
| 2 | ✅ | 删常量、历史最高掌握计算与指定返回字段；改问候行注释；`masteryTransitions`、`masteredOn` 未改 |
| 3 | ✅ | `helloStats(d)` 按已裁顺序返回各项；新掌握大于 0 才加入；删原函数 |
| 4 | ✅ | 问候下一行合为 `.hello-stats`，以「 · 」连接；15px、原手写体与蓝色、允许折行；旧样式、悬停提示、参数及只给旧文案用的变量均已删 |
| 5 | ✅ | 导出与断言按表删改；新增四条问候统计断言，覆盖三项、隐藏零新掌握、保留零对题数与零连续天数、连续 1 天。先运行修改后的测试，因页面尚无 `helloStats` 失败；实现后完整逻辑测试通过 |
| 6 | 本地通过，线上待验证 | `./check.sh` 与 `node app/logic.test.js app/arena.html` 均退出 0；全部内联脚本通过语法解析，`git diff --check` 通过；核销表所列检索词在 `CONTEXT.md`、`DATA.md`、`adr/`、`app/` 无命中。逐行对照实际稿：删除范围、统计口径、文字、样式与零值行为均符合核销表，无表外新语义。没有改图 |
| 7 | 待完成 | 未发布、未生成新线上版本、未改远端数据。原网址要求登录，当前会话缺少发布能力，线上显示未验证 |
| 8 | ✅ | `DATA.md`、ADR、冻结讨论均未改 |

本地页面验证复用 10-15 留下的真实数据副本 `d5691078-d8f4-45d2-846f-10f34c68619c/scratchpad/db2`，沿用既有测试壳的模拟平台接口，日期固定为 2026-10-15；只是读取旧副本，没有重新读取线上数据。临时文件在 `/private/tmp/arena-0017/`，不进提交。

- Aaron：`✅ 30 right today · 🔥 1-day streak`。
- Sophia：`✅ 13 right today · 🔥 2-day streak`。
- 两位用户的新掌握均为 0，页面均不出现该项；三项齐全由上述断言验证。
- 两位用户均检查 375px 宽：页面 `scrollWidth` 与视口宽均为 375，无横向溢出；计算样式为 `15px`、`"Patrick Hand", Lexend, cursive`、蓝色 `rgb(142, 167, 255)`。

本批实现提交：`41215b4`。后续在具备 Claude Artifact 发布能力的会话中，先核对原网址有无更新，再将本批源码发布到原网址，保持能力与契约并验证线上打开；第 7 行完成前不写整轮完成。
