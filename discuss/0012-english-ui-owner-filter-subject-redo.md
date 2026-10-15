# 0012 页面全改英文、页面名去掉 Sophia；错题与卷子加归属人筛选；每日重做按科目开始；设置页重排

> 状态：**✅ 已完成（2026-10-15）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 页面名改为 Exercise Arena | 已裁 | 用户原话直接定：`<title>`、导出文件头去掉「Sophia's」 | 二·D1 |
| D2 Exercises 与 Papers 加 Owner 筛选 | 已裁 | 用户原话直接定；筛选只作用于列表，默认 All | 二·D2 |
| D3 「全改英文」改到哪 | 已裁 | 只改页面上看得到的文字；代码注释、设计文件仍用中文；`TAX` 不动 | 二·D3 |
| D4 按科目开始时，每日上限怎样算 | 已裁 | 清单照旧按上限装满，再按科目分开；一天总量不变 | 二·D4 |
| D5 按科目的按钮之外，还留不留「全部科目」一个按钮 | 已裁 | 不留；新每日卷只含一个科目，当天未交的旧式混合卷交卷前仍可 Continue | 二·D5 |
| D6 设置页怎样排 | 已裁 | 分三组（Whose exercises / Daily redo / Weekly goal）、保存按钮在最后；阶梯说明、导出各成面板 | 二·D6 |

## 目的

用户原话：「improve the app: 1. change it from 'Sophia's Exercise Arena' to 'Exercise Arena' 2. for 'Exercises' page and 'Papers' page, add 'Owner' as filter. 3. for 'Start today's redo' in 'Today' page', add one button for each subject. 4. Change all Chinese into English. 5. Re-arrange the widgets in 'Settings' page to make it more user friendly.」

本轮具体交付：

1. 设计：按裁决改 `CONTEXT.md`（Daily redo、Daily paper 的定义）、`DATA.md`（每日卷的 `subject`、界面显示名）。
2. 实现：`app/arena.html` 的标题、两处筛选、Today 的开始按钮、全部界面文字、设置页；`app/logic.test.js` 补断言、改随文案变的断言。
3. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳里看 Today、Exercises、Papers、Settings（375 宽与桌面、深浅色），页面上看不到中文；发布后线上能打开。

## 输入

- 同主题未完成讨论：无（`grep -m1 '^> 状态' discuss/*.md`，0001–0011 均为 ✅）。
- 讨论 0010、0011（已完成）：归属人、默认归属人、每日卷的现行规则。

---

## 一、证据

### E1 标题里的名字（读 `arena.html`）

「Sophia's Exercise Arena」出现在 `<title>`（发布后即 Artifact 的标题）与导出文件的第一行 `# Sophia's Exercise Arena export (YAML)`。页面上没有可见的大标题（0009 去掉了）。AI 识别的提示词里写「their daughter Sophia」，那是给 Claude 的上下文，不是页面名。

### E2 现在的两个列表（读 `renderExercises`、`renderPapers`）

- Exercises：筛选有科目、专题、错因、状态四项，列出全部错题（不分归属人），按我的阶梯显示。
- Papers：上半是「组一张检验卷」，从默认归属人的错题里抽；下半「历次检验卷」列全部检验卷加我的每日卷，每行已显示「归属人 X」（每日卷除外）。
- 线上数据（2026-10-15 读 `db`）：86 道错题、2 张检验卷，归属人都是同一位用户。

### E3 现在的每日重做（读 `todayBlock`、`dailyList`、`start-daily`）

Today 有一个「Start / Continue today's redo」按钮。`dailyList` 把默认归属人的到期题按题组合成单元、按最早到期排，装到 `dailyLimit` 为止；点开始时把这份清单生成一张每日卷（`kind: "daily"`、`subject: null`），当天没交的接着用。题组里的题同科目，按科目分不会拆开题组。

### E4 页面上的中文（读 `arena.html`，2026-10-15）

- Today 基本是英文，夹着「设置」两处。录入、错题、检验卷、设置四个标签的标签名和全部文字是中文（代码里这一段的注释写着「管理标签（中文）」）：表单标签、按钮、提示、错误信息、作答记录表头、判定方式（自动 / 自评 / 改判）、错因与作答形式的名称。
- 专题、概念、题型在 `TAX` 里各有中英两个名字，录入与错题页显示中文名；AI 识别的提示词只用英文名。
- 代码注释、`logic.test.js` 的注释是中文；`logic.test.js` 有一条断言的建议文字含「设置」。
- 线上数据里没有中文：86 道错题、17 个题组、2 张卷子的所有字符串字段都不含汉字（2026-10-15 扫描）。

### E5 现在的设置页（读 `renderSettings`）

一个面板里两列四个输入框：每日上限、每周练几天、每周几张检验卷、默认归属人；下面一行说明每周目标、一个保存按钮、一段复习阶梯的说明。第二个面板是导出。默认归属人决定每日重做、组卷和录入取谁，却排在最后；复习阶梯的说明夹在保存按钮下面。

---

## 二、提议与裁决

### D1 页面名改为 Exercise Arena

证据：E1。用户原话已定。`<title>` 与导出文件头改为「Exercise Arena」；术语表的 Exercise Arena 词条不变。AI 识别提示词里的 Sophia 是孩子的名字、不是页面名，不在本题范围。

**裁决（2026-10-15）：用户原话直接定。**

### D2 Exercises 与 Papers 加 Owner 筛选

证据：E2。用户原话已定。做法：两页各加一个「Owner」下拉，选项为 All 与每位用户（本人标 (me)），默认 All，和现有筛选一样只存在本次打开的页面里。Papers 页的筛选只作用于「历次检验卷」列表；组卷仍从默认归属人取（0010 已定），不随筛选变。数据契约不变。

**裁决（2026-10-15）：用户原话直接定，细节按上。**

### D3 「全改英文」改到哪

证据：E4。

- A（推荐）**页面上看得到的文字全改英文；代码注释、设计文件仍用中文。** 包括标签名、表单、按钮、提示、错误信息、悬停提示、照片的替代文字；专题、概念、题型、错因、作答形式都显示英文名。`TAX` 保留中英两列不动（它是从知识图提取的原样，以后重新提取时形状不变），页面只是不再用中文那列。改判在界面上叫「Override」，`DATA.md` 跟着改。代价：工作区的文档与代码注释仍是中文，读代码的人看到的是两种语言。
- B **页面文字与代码注释都改英文。** 代价：要重写约 100 处注释；本工作区的设计文件都是中文，注释与设计文件会脱节。

**裁决（2026-10-15）：A。**

### D4 按科目开始时，每日上限怎样算

证据：E3。

- A（推荐）**今天的清单照旧按 `dailyLimit` 装满，再按科目分开。** 例：上限 10，清单里英文 7、科学 3，就出「English · 7」「Science · 3」两个按钮。做完一科交卷后，空出来的名额照旧可由其他到期题补上（现在交卷后也能再生成）。代价：一天的总量与现在相同，「Next 7 days」的预计不用改。
- B **每个科目各自装到 `dailyLimit`。** 例：上限 10 时，三个科目最多一天 30 题。代价：总量可能翻几倍，「Next 7 days」的预计要按科目重算，设置里的「每日上限」的意思也变了。

**裁决（2026-10-15）：A。**

### D5 按科目的按钮之外，还留不留「全部科目」一个按钮

证据：E3。用户原话是「add one button for each subject」。

- A（推荐）**只有按科目的按钮，不留全部科目的按钮。** 每张新的每日卷只含一个科目，`subject` 写这个科目。当天已经开了、还没交的旧式混合每日卷（`subject: null`），在交卷前仍以一个「Continue today's redo」按钮出现。代价：想一口气做完所有科目要点两三次。
- B **按科目的按钮加一个「All subjects」按钮。** 代价：同一道题可能同时在混合卷与科目卷里；要规定开了一种之后另一种怎样计数、怎样避免重做，多一套规则。

**裁决（2026-10-15）：A。**

### D6 设置页怎样排

证据：E5。

- A（推荐）**分三组、一个保存按钮在最后。** 第一组「Whose exercises」：默认归属人，附一句它决定什么；第二组「Daily redo」：每日上限；第三组「Weekly goal」：每周练几天、每周几张检验卷，附一句按周一到周日算、在哪里显示。保存按钮在三组之后。复习阶梯的说明单独成一个「How the review ladder works」面板，导出面板排最后。代价：页面变长一些。
- B **同样分三组，改成改了就存，去掉保存按钮。** 代价：数字输入框边打边存，要处理打到一半的值（例如清空后正要输入）；保存成功的提示要换成每组旁边的小字。
- C **只调顺序：默认归属人移到最前，阶梯说明移出表单，仍是一个两列的网格。** 代价：改动最小，但几项的用途仍要读长标签才明白。

**裁决（2026-10-15）：A。**

## 三、核销表

用词：「今天的清单」指 `dailyList` 按默认归属人的错题、`dailyLimit` 装出的清单（现行规则，不改）；「旧式混合每日卷」指 `kind: "daily"`、`subject: null` 的每日卷。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D4、D5 | `CONTEXT.md` | Daily redo 的「以每日卷作答」改为「按科目分成每日卷作答」；Daily paper 改为「为一位用户的每日重做、按当天清单里一个科目的题生成的卷子。只给这位用户做，不算检验卷。」`_Avoid_` 不变 |
| 2 | D4、D5 | `DATA.md` `papers` | `subject` 说明改为「同错题，或 `null`；每日卷为它所含的科目，旧的每日卷为 `null`」；`title` 的例子加每日卷「English redo · 15 Oct」。表下「只有 `createdAt` 是今天、本人还没交过的每日卷才接着用」改为「每个科目只接着用 `createdAt` 是今天、本人还没交过的那张（缺 `subject` 按 `null` 算）；当天没交的旧式混合每日卷交卷前也接着用」，其余不变（沿用本节已有的写法） |
| 3 | D3 | `DATA.md` | 作答 `judgedBy` 的「界面显示「改判」」改为「界面显示 Override」 |
| 4 | D1 | `app/arena.html` | `<title>` 与文件头注释改为「Exercise Arena」；导出文件第一行改为 `# Exercise Arena export (YAML)`。AI 识别提示词里的 Sophia 不动 |
| 5 | D2 | `app/arena.html` | Exercises 的筛选加「Owner」：All 与每位用户（`S.userIds` 加数据里出现过的归属人，本人标「(me)」），按 `sameOwner` 筛；Papers 的「历次检验卷」列表上方加同样的「Owner」下拉，按卷子的 `owner` 筛（每日卷也按它的 `owner`）。两处默认 All，不存 `db`、不存浏览器存储；组卷区不变 |
| 6 | D3 | `app/arena.html` | 页面上看得到的文字全改英文：标签名 Today / Record / Exercises / Papers / Settings；表单标签、按钮、占位例子、提示、确认、错误与状态信息、表头、悬停提示与替代文字；科目、专题、概念、题型显示 `TAX` 的英文列；`SUBJECTS`、`CAUSES`、`RESULT` 去掉中文列，`FORMATS` 换成英文名 Multiple choice / Word pick / Short answer / Open-ended，`JUDGE` 为 Auto / Self / Override；用词按 `CONTEXT.md` 的英文词条。录入页占位例子译成英文，其中「Sophia chose (1)」照留（孩子的名字，不是页面名；AI 提示词同理）。`nodb` 提示、录入、错题详情与编辑、作答页、卷面详情一并改。`TAX` 与代码注释不动。原先只为中文界面设的字体（`--font-zh`、`.zh`，用在标签栏、表单标签、拍照按钮）改用正文字体 `--font-body`；不再用到的 `--font-zh` 与 Google Fonts 里的 Noto Sans SC 一并删去，正文字体栈保留系统中文字体作退路（用户自己输入的中文仍能显示） |
| 7 | D4、D5 | `app/arena.html` 纯逻辑 | 把 `SUBJECTS`、`SUBJ` 移进 `LOGIC` 块（测试只执行这一块）。加 `dailyBySubject(list)`：把今天的清单按 `SUBJECTS` 顺序分成 `[科目, 题]`，组内保持清单顺序，空科目不出；`makeDailyPaper` 多一个 `subject` 参数，写进卷子，标题为「<科目英文名> redo · <日期>」；`openDailyPaper` 多一个 `subject` 参数，只取 `subject` 相同的那张（传 `null` 取旧式混合卷；缺 `subject` 字段按 `null` 算，比照 `sameOwner`） |
| 8 | D4、D5 | `app/arena.html` Today | 有旧式混合每日卷时只出一个「Continue today's redo」按钮（同现在）。否则每个科目一个按钮：该科有今天没交的每日卷就写「Continue <科目> · N」、N 取这张卷的题数，否则写「<科目> · N」、N 取今天清单里这科的题数，点了生成该科的每日卷；没有题的科目不出按钮。大数字为各按钮 N 之和（D4「总量不变、按科目分」的推论）；边界：某科有没交的卷时，清单里后补进来的该科题要等这张卷交了才出现，与现在「交卷后还有到期题可再生成」一致。「N are due; today's set is capped at …」照旧。鼓励语的「今天有事可做」改为任一科有今天没交的每日卷、或清单不空、或有没做的检验卷 |
| 9 | D6 | `app/arena.html` 设置页 | 设置面板分三组：「Whose exercises」（默认归属人，附一句它决定每日重做、组卷与录入取谁）、「Daily redo」（每天最多几题，1–50）、「Weekly goal」（每周练几天 1–7、每周几张检验卷 0–3，附一句按周一到周日算、显示在 Next 7 days、Last 7 days 用它比较）；保存按钮与保存提示在三组之后，四个字段仍一起写。复习阶梯说明单独成「How the review ladder works」面板，导出面板排最后 |
| 10 | D3、D4、D5 | `app/logic.test.js` | 导出清单补 `dailyBySubject`；断言：按科目顺序、组内顺序、题组不拆、空科目不出、各科题数之和等于清单；`makeDailyPaper` 的 `subject` 与标题；`openDailyPaper` 按科目取（别的科目、旧式混合卷不被取到，传 `null` 只取旧式混合卷，缺 `subject` 的卷按 `null`）；现有 `makeDailyPaper`、`openDailyPaper` 断言按新签名改；建议文字里的「设置」改「Settings」 |
| 11 | 完成标准 | 验证（不改文件） | `./check.sh` 与测试通过；落盘者对照本表逐行核对实际稿；`grep` 页面源码中注释与 `TAX` 之外没有汉字；本地测试壳（真实数据副本）：以 Sophia 看 Today 的按科目按钮（英文、科学各一）、点英文生成只含英文的每日卷、离开后是「Continue English」、交卷后英文按钮按新清单变化；Exercises、Papers 的 Owner 筛选；设置页三组与保存；录入、错题详情与编辑、作答页、卷面详情（改判）各看一次是英文；375 宽与桌面、深浅色 |
| 12 | 发布 | 线上页面 | 先读出线上页面，与提交 `f12334a` 的 `app/arena.html` 比对，没有别处的改动后，以新的 `app/arena.html` 重新发布到 `https://claude.ai/artifact/626tqFyFmmfXKdMHYnbJAh`，能力与运行时契约不变；读回确认标题为 Exercise Arena。不改数据 |
| 13 | —— | 不改 | ADR：不新立，0001–0004 不受影响。`CLAUDE.md` 首句写给 Sophia 设计，是工作区的目的，不是页面名，不改。数据不迁移（E4：线上没有中文） |

---

## 四、复审

派新上下文的 subagent 按简报复审讨论文件与核销表初稿（不给对话）。逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 `SUBJECTS`、`SUBJ` 在 `LOGIC` 块外，新断言取不到 | 成立（`arena.html` 751 行 `LOGIC:END`，756–757 行才定义） | 机械：行 7 补「移进 `LOGIC` 块」 |
| F2 `SUBJECTS` 等常量的中文列去留未写；作答形式没有英文名 | 成立 | 机械：行 6 写明去掉中文列并列出作答形式的英文名（D3 的直接落实） |
| F3 讨论标题说去掉 Sophia 的名字，D1 只管页面名；占位例子里有 Sophia | 成立 | 机械：标题收窄为「页面名去掉 Sophia」；行 6 写明占位例子里的 Sophia 照留 |
| F4 删 Noto Sans SC 不在 D3 内；英文标签仍用 `--font-zh` | 成立 | 机械：`--font-zh` 只为中文界面而设，界面全英文后改用正文字体是 D3 的落实；行 6 写明改用 `--font-body`、删去不再用到的字体，确认核销表时请用户看这一行 |
| F5 缺 `subject` 字段怎么算 | 成立 | 机械：行 2、7、10 补「按 `null` 算」 |
| F6 鼓励语的参数只看一张每日卷；「Start today's redo to begin a streak!」 | 前半成立，后半不成立：「today's redo」指每日重做这件事，仍然准确 | 机械：行 8 补鼓励语的条件；文字不改 |
| F7 大数字的算法与边界 | 成立 | 机械：行 8 写明是 D4 的推论及边界 |
| F8 验证没覆盖录入、详情、作答页等 | 成立 | 机械：行 11 补 |
| F9 `DATA.md` 写进页面规则 | 部分成立：「每个科目接着用」改的是本节已有的一句，沿用；「页面只显示英文名」不必加 | 机械：行 3 删去这句 |

重写了行 2、3、6、7、8、10、11，按简报自查：每行对得上登记表 D1–D6；新增内容都是已裁项的落实或补漏，没有新的设计决定；不必再派复审。

## 五、核销（2026-10-15）

用户原话：「Confirmed. Land the whole table of discussion 0012, rows 1–13, including the republish in row 12.」

| # | 结果 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | `CONTEXT.md`：Daily redo 改「按科目分成每日卷作答」；Daily paper 改为按当天清单里一个科目的题生成；`_Avoid_` 未动 |
| 2 | ✅ | `DATA.md` `papers`：`subject` 说明、`title` 例子、表下「每个科目只接着用……（缺 `subject` 按 `null` 算）；当天没交的旧式混合每日卷（`subject` 为 `null`）交卷前也接着用」按表改 |
| 3 | ✅ | `DATA.md` 作答 `judgedBy`：界面显示 Override |
| 4 | ✅ | `<title>Exercise Arena</title>`、文件头注释、导出第一行 `# Exercise Arena export (YAML)`；AI 提示词未动 |
| 5 | ✅ | 加 `ownerFilterOptions`（All、`S.userIds` 加数据里出现过的归属人、本人标 (me)）；Exercises 的筛选多一项 Owner（`S.filters.owner`，错因统计也按它筛）；Papers 列表标题行加 Owner 下拉（`S.paperOwner`，change 动作 `paper-owner`），按卷子 `owner` 筛，筛空时提示「No papers for this owner.」；组卷区未动 |
| 6 | ✅ | 页面文字全改英文：标签名、录入、题组与错题表单、错题列表与详情、作答记录表、检验卷组卷与列表、卷面详情、设置、导出、`nodb`、全部状态与错误信息；`CAUSES`、`RESULT` 去掉中文列，`FORMATS` 为 Multiple choice / Word pick / Short answer / Open-ended，`JUDGE` 为 Auto / Self / Override；专题、概念、题型显示 `TAX` 英文列，`topicLabel` 去掉语言参数。占位例子里的「Sophia chose (1)」照留。`--font-zh`、`.zh` 规则、`renderManage` 外层的 `zh` 类与 Google Fonts 的 Noto Sans SC 删去，标签栏、表单标签、拍照按钮改用正文字体；正文字体栈保留 PingFang SC、Microsoft YaHei 作退路 |
| 7 | ✅ | `SUBJECTS`（两列）、`SUBJ` 移进 `LOGIC` 块；加 `dailyBySubject`；`makeDailyPaper` 多 `subject` 参数、标题「<科目> redo · <日期>」；`openDailyPaper` 多 `subject` 参数，`(p.subject \|\| null) === (subject \|\| null)` |
| 8 | ✅ | 加 `redoButtons`：有旧式混合每日卷时只出「Continue today's redo」，否则每科一个「<科目> · N」或「Continue <科目> · N」，没有题的科目不出；大数字为各按钮 N 之和；鼓励语的条件改为清单不空、或有没做的检验卷、或任一按钮带着没交的每日卷。`start-daily` 按按钮的 `data-subject` 取或生成该科每日卷 |
| 9 | ✅ | 设置面板分三组（`set-group`，组间细线）：Whose exercises、Daily redo、Weekly goal，保存与提示在三组之后，四个字段一起写；「How the review ladder works」与 Export 各成面板 |
| 10 | ✅ | `logic.test.js`：导出补 `dailyBySubject`；新断言覆盖科目顺序、组内顺序、题组经 `dailyList` 后仍连排、空清单、各科之和；`makeDailyPaper` 的 `subject` 与标题；`openDailyPaper` 按科目、旧式混合卷与缺 `subject` 按 `null`；建议文字改「Settings」。`node app/logic.test.js app/arena.html`：all logic tests passed |
| 11 | ✅ | `./check.sh` 退出码 0。源码中注释与 `TAX` 之外没有汉字（`grep`）。本地测试壳（线上 `db` 的副本：86 道错题、17 个题组、2 张卷子、2 份设置、2 位用户；`window.claude` 用内存模拟）：Sophia 把每日上限存成 50 后，Today 为「English · 47」「Science · 3」，大数字 50；点 Science 生成 `subject: science`、3 题、标题「Science redo · 15 Oct」的每日卷；Stop 后按钮为「Continue Science · 3」，再点仍是同一张；交卷后 3 题有作答、`handedIn` 有 Sophia；回 Today 只剩「English · 50」（名额由英文补满，D4）。Aaron：Exercises 的 Owner 下拉为 All / AaronShi (me) / Sophia Shi，选自己 0 道、选 Sophia 86 道；Papers 选自己时「No papers for this owner.」。Today、录入、错题列表、错题详情、编辑题组、编辑错题、删除确认、抽题预览、卷面详情、设置各页可见文字、占位、悬停、替代文字与下拉项都没有汉字（页面内脚本扫描）。375 宽浅色与深色、桌面看过 Today、Record、Papers、Settings，无横向滚动 |
| 12 | ✅ | 发布前读出线上第 11 版（`1792056233-8d17`）逐行读完，去掉平台外壳后与提交 `f12334a` 的 `app/arena.html` 逐字相同；以新的 `app/arena.html` 发布为第 12 版（`1792057851-10bb`），能力与运行时契约 0.2.77 沿用。读回：`<title>Exercise Arena</title>`，线上内容含本地文件全文。未改数据 |
| 13 | ✅ | 未立 ADR；`CLAUDE.md`、`.design/workspace.yaml` 未改；未迁移数据 |

实际稿对照核销表逐行核对。表外改动两处，都是落实已裁内容：375 宽下英文标签较长，「Settings」被挤到第二行，于是在 480px 以下把标签栏按钮的左右内边距收到 6px、字号 14px，改后五个标签一行放下；Papers 列表的小标题由「历次检验卷」改为「Papers」，以与标签名一致。

未验证：真实 claude.ai 里由三个账号打开新版本；跨天后旧式混合每日卷作废的路径只在断言里验证；AI 识别后保存的整条路径未在测试壳里走（测试壳没有真的 `sample`）。
