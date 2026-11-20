# 0023 Games 页：积分榜移到最上、精简说明、每场固定一局、原地播动画

> 状态：**✅ 已完成（2026-10-16）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| G1 Games 页的版面与文字 | 已裁 | 用户直接指示：积分榜移到最上；删去两段说明；参赛名单改成选手卡片（举重小人图，金币与状态为标签）；Start 后卡上小人原地举起，不换页；底部加本周历史，点开回放 | 二·G1 |
| G2 「总是一局」在设计里怎样落 | 已裁 | A：比赛固定一局；Round 与局分保留；`matches.rounds` 保留、只取 1 |
| G3 回放要不要存举起的重量（改 0022 L6） | 已裁 | A 存：`matches.lifts` 与 `points` 一一对应，每局一项，用户 id → 举起的 kg | 二·G3 |
| G4 历史列表列哪些比赛 | 已裁 | A：本组本周全部比赛（开赛日期在本周、参赛者里有本组用户），新的在上 | 二·G4 | 二·G2 |

## 目的

用户在 0022 发布后要求改 Games 页（原话）：

> 1. move Scoreboard to the top of this page.
> 2. remove "Each round of a game uses 10 coins from everyone in it. Coins start again from 0 every Monday." from "My coins this week"
> 3. remove "Everyone lifts once a round." and "Nobody chooses anything — just watch."
> 4. remove "Rounds (1 3 5)".( Always start one round.
> 5. Change the lifters list into a table of lifters waiting with their coins and status. When clicking 'Start', animate the lifters directly. (Do not open another page to show the animation).

本轮交付：按裁决改 `app/arena.html` 的 Games 页，第 4 条涉及的术语表、`DATA.md` 与断言随 G2 改；重新发布到原网址。完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳看 375 宽与桌面；发布后读回核对。

## 输入

- 同主题未完成讨论：无（0022 已完成）。

---

## 一、证据

- 术语表 Match：「一位用户开的一次比试：选一款游戏与局数（1、3 或 5）；…余额够付这几局的用户都参赛…」；Balance：「每参赛一场，按这场的局数每局 10 枚」；Round：「比赛中比出一次名次的一段」。
- `DATA.md`：`matches.rounds` 取 `1` · `3` · `5`；余额按 `rounds` × 10 扣；写入规则按局追加 `points`。
- 线上 `matches` 目前没有文档（0022 的测试只在本地测试壳里）。
- 页面：0022 的比赛另开一个视图（`renderMatch`），有 Next round、Leave 与结果页。

---

## 二、逐题

### G1 Games 页的版面与文字

**裁决（2026-10-16）：照用户原话第 1、2、3、5 条。** 积分榜移到页面最上；「My coins this week」删去「Each round of a game uses 10 coins…every Monday.」；举重说明删去「Everyone lifts once a round.」与「Nobody chooses anything — just watch.」；参赛名单改成表格（选手、金币余额、状态）；按 Start 后就在这张表的位置播举重动画，播完在原处显示名次与本场冠军，不另开视图。这些是页面版面，不改设计文件。

### G2 「总是一局」在设计里怎样落

用户第 4 条：去掉局数选择，总是开一局。证据见上：术语表 Match 写的是开赛人选局数（1、3 或 5），Balance 与 `DATA.md` 按局数扣余额。

- A（推荐）**比赛固定一局：Match 改为「选一款游戏」不再选局数；Round 词条保留（局分算法照旧，积分榜仍按局累计）；`matches.rounds` 字段保留、取值只有 `1`，余额照「`rounds` × 10」算，旧数据照常读。** 代价：一场就是一局，「本场冠军」就是这一局的第一名；Match 与 Round 两个词暂时指同一段比试。
- B **合并概念：删去 Round 词条，比赛就是一次比出名次；`matches.points` 改成单个对象、去掉 `rounds`。** 代价：改动最大；以后想恢复多局要再改回数据形状。
- C **模型照旧允许 1、3、5 局，只是页面总开一局。** 代价：术语表写「开赛人选局数」而页面不让选，设计与页面不一致。

**裁决（2026-10-16）：A。**

### 用户追加（2026-10-16）

请用户确认核销表时，用户追加（原话）：「also, add a history rounds (of this week) to 'Weightlifting' at the bottom, for each item in the list, show the result of each players. when clicking the item, expand it to show a animation of the history round」。版面部分（举重一块底部加本周历史，每项列各选手的结果，点开展开播这一局的动画）照原话做，归入 G1。

### G3 回放要不要存举起的重量（改 0022 L6）

证据：0022 的 L6 裁定「举起的重量只在当场动画里显示，不存」，`matches` 只存 `balances` 与 `points`。`points` 只有得分，推不出各人举了多少 kg；重量来自当场的随机数，事后算不回来。回放历史局的动画要有每人的 kg。线上还没有比赛文档。

- A（推荐）**存：`matches` 加 `lifts`，与 `points` 一一对应，每局一项，用户 id → 举起的 kg；写入时与 `points` 一起写。** 回放照 kg 播动画，名次与得分照旧从 `points` 读。代价：多一个字段；取代 0022 L6。
- B **不存：历史只列名次与得分，点开不播动画。** 代价：达不到「点开播动画」。

**裁决（2026-10-16）：A。**

### G4 历史列表列哪些比赛

用户原话「history rounds (of this week)」。积分榜已按 M10 只列本组。

- A（推荐）**本组本周的全部比赛：开赛日期在本周、参赛者里有本组用户的比赛，新的在上。** 与积分榜同一范围。代价：没参赛的那场也列出（例如余额不够那次）。
- B **只列我参赛的比赛。** 代价：同组里别人比的、我没参加的看不到。

**裁决（2026-10-16）：A。**

---

## 三、核销表

| 行 | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | G2 | `CONTEXT.md` | Match 改为：「一位用户开的一次比试：选一款游戏，比一局；默认归属人与开赛人的默认归属人相同、余额够付这一局的用户都参赛，至少两人，开赛人须在其中。开赛后所有选手都按游戏的规则自动比，对手不必在线。这一局得分最高者为本场冠军，可以并列。」 |
| 2 | G2 | `CONTEXT.md` | Balance 的「每参赛一场，按这场的局数每局 10 枚，开赛时就扣」改为「每参赛一局 10 枚，开赛时就扣」 |
| 2a | G2 | `CONTEXT.md` | Scoreboard 的「一场比赛的各局都计入开赛那天所在的周」改为「一场比赛计入开赛那天所在的周」 |
| 3 | G2 | `DATA.md` | `matches` 表 `rounds` 的取值由「`1` · `3` · `5`」改为「`1`」，说明「局数；比赛固定一局（术语表 Match）」；其余（余额按 `rounds` × 10、按局追加 `points`）不变 |
| 3a | G2 | `DATA.md` | 「写入规则」的「**开赛即写，每局算出就写。**」一条改为：「**开赛即写，算出就写。** 开赛时新建文档，写入 `game`、`by`、`players`、`rounds`、`balances`、`at` 与空的 `points`；这一局算出时把它追加进 `points` 写回，写成后再播动画。没写成这一局的场不再续写，余额照扣。」 |
| 3b | G3 | `DATA.md` | `matches` 表在 `points` 之后加 `lifts`：「对象数组，可省 · 举重每个已算出的局一项，与 `points` 一一对应；每项是用户 id → 举起的 kg」；行 3a 的写入规则相应写为「把这一局追加进 `points` 与 `lifts` 写回」 |
| 4 | G1、G2、G3、G4 | `app/arena.html` | Games 页顺序：积分榜、我的金币（删去「Each round of a game uses 10 coins…every Monday.」）、举重。举重一块分三段：① 说明：游戏规则一句（删去「Everyone lifts once a round.」与「Nobody chooses anything — just watch.」）；② Arena：本组每位用户一张选手卡（举重小人图与名字，余额与状态作标签）；去掉局数选择与 `S.gameRounds`，局数固定为 1；按 Start 后参赛者的卡上小人原地举起（可 Skip），播完卡上显示 kg、名次、得分与本场冠军；按 Done 卡片复原到等待开赛的样子；写入失败时原处显示错误与 Done；去掉单独的比赛视图、Next round 与 Leave；动画中标签禁用；③ 本周历史：按 G4 列本组本周的举重比赛，新的在上，每项显示开赛时刻与各选手的名次、kg、得分；点一项展开，照 `lifts` 播这一局的动画并显示结果，点 Done 或再点该项收起；没有 `lifts` 的只显示结果。本局写入时 `lifts` 与 `points` 一起追加。纯逻辑加 `weekMatches(matches, group, today)`（开赛日期在本周、`players` 与 `group` 有交集，按 `at` 新的在前），其余不变；`coinsFor` 注释的「中途离开也扣整场」改为「开赛即扣」；断言保留多局用例，作为函数的通用行为 |
| 4a | G4 | `app/logic.test.js` | 导出 `weekMatches` 并加断言：上周开赛的不列、与本组无交集的不列、按 `at` 新的在前 |
| 5 | —— | `app/arena.html` | 测试壳验证后重新发布到 `https://claude.ai/artifact/626tqFyFmmfXKdMHYnbJAh` |
| 6 | —— | —— | 验证：`./check.sh` 退出码 0；断言通过；检索 `CONTEXT.md`、`DATA.md`、`app/arena.html` 中「局数」「1、3 或 5」「这几局」「各局」「整场」「中途」「gameRounds」「renderMatch」，确认与新 Match 一致或已删；测试壳 375 宽与桌面截图核对积分榜在最上、无局数选择、Start 后原地播动画与结果；读回测试壳写的 `matches` 文档，`rounds` 为 1、`lifts` 与 `points` 同长且 kg 与动画一致；历史列表展开能播动画；发布后读回线上核对 |
| 7 | —— | —— | 提交：`git commit -- CONTEXT.md DATA.md app/arena.html app/logic.test.js discuss/0023-games-page-one-round.md` |

## 四、复审（2026-10-16）

派新上下文的 subagent 复审初版核销表。逐条核验，均成立，均为机械修补：

| 发现 | 处置 |
|---|---|
| M1 断言仍有 3、5 局用例 | 行 4 写明保留，作为函数的通用行为（G2 A 保留局分算法） |
| M2 `DATA.md` 写入规则仍是多局措辞 | 加行 3a |
| L1 Match「这一局的总分」 | 行 1 改「得分」 |
| L2 Scoreboard「各局都计入」 | 加行 2a |
| L3 检索词与文件太窄 | 行 6 扩大 |
| L4 「Play again」名实不符、出错显示没写、`startMatch` 措辞不准 | 行 4 改为「Done」回表格，写明出错显示与「去掉 `S.gameRounds`」；属 G1 的页面版面 |

自查重写的行 1、2a、3a、4、6：对得上登记表，没有新的设计选择。改动小，不另派复审。

用户追加 G3、G4 后加行 3b、4a，改行 4、6、7；自查：对得上登记表；`weekMatches` 是落实 G4 的纯函数，没有新的设计选择。

用户第三次追加（原话）：「for the table of lifters, show the lifters with pictures.」归入 G1 版面，写进行 4：表格里每位选手配举重小人图，Start 后原地举起。页面现在不读平台头像，图用页面自画的小人。

用户第四次追加（原话）：「for the '参赛名单', it is not a table of 3 columns. There are cards for all the lifters. On each card, there picture of the lifter with coins and status as tags.」行 4 的参赛名单改为选手卡片；选手图用举重小人（用户裁）。

用户第五次追加（原话）：「there are three sections in 'weightlifting': 1. general: description of the game. 2. arena: lifter cards for all the players. 'Start' to show the animations and the results. 'Done' to reset the cards. 3. history: a list of all rounds in this week. For each item, it shows the basic information. click each item to expand the item and show the animations and the results. click 'done' or the item again to remove the animations and collapse the item.」行 4 按此重写。用户几次回复都只细化行 4 的版面、没有异议其余行；以这次的三段描述为行 4 定稿，连同其余行视作确认，开始落盘。

## 五、核销（2026-10-16）

授权：见上一段（用户第五次追加后，以行 4 定稿连同其余行视作确认）。

| 核销表行 | 状态 | 实际改动与验证 |
|---|---|---|
| 1、2、2a | ✅ | `CONTEXT.md` 的 Match、Balance、Scoreboard 照表改写，逐字对照一致 |
| 3、3a、3b | ✅ | `DATA.md`：`rounds` 只取 `1`；`points` 后加 `lifts`；写入规则改为「开赛即写，算出就写」并写入 `lifts` |
| 4 | ✅ | `app/arena.html`：Games 页顺序为积分榜、我的金币、举重；删去指定的三句说明；举重分说明、Arena、This week 三段；Arena 为选手卡（举重小人、名字、余额与状态标签），Start 后卡上原地举起（可 Skip），播完显示 kg、名次、得分与冠军，Done 复原；本周历史每项显示时刻与各人名次、kg、得分，点开回放动画，Done 或再点收起；去掉 `S.gameRounds`、`renderMatch`、Next round、Leave；加 `weekMatches`；`coinsFor` 注释改为「开赛即扣」。另做一处落实细节：这一局播完前，积分榜与历史先不计入它，免得动画没播完就看到结果 |
| 4a | ✅ | `app/logic.test.js` 导出 `weekMatches` 并加断言（上周不列、与本组无交集不列、新的在前、空列表） |
| 5 | ✅ | 发布到原网址，第 36 版；发布前线上为第 35 版（本会话 0022 发布、提交 45aeb63），无他人改动 |
| 6 | ✅ | `./check.sh` 退出码 0；`node app/logic.test.js app/arena.html` 通过。检索「局数」「1、3 或 5」「这几局」「各局」「整场」「中途」：`CONTEXT.md` 无残留；`DATA.md` 剩「已比的局数是 `points` 的长度」「把各局的 `points` 加起来；整场计入…」「各局的过程数据」三处，按数组形状仍成立，保留；页面无 `gameRounds`、`renderMatch`、「中途离开」。测试壳（375 宽浅色、桌面深色）：积分榜在最上，无局数选择；Start 后原地播动画，期间积分榜与历史不提前变化，播完后更新；写入的文档 `rounds` 为 1，`points` 与 `lifts` 各一项、kg 与卡上一致；Done 复原卡片；历史展开回放、Done 与再点都能收起；控制台无错误。发布后读回线上第 36 版，与本地文件除平台外壳外一致，在其源码上跑断言通过 |
| 7 | ✅ | 按表提交，见 commit |

未验证项：真实账号还没在线上开过比赛。
