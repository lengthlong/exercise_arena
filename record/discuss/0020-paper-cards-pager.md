# 0020 卷子按卡片一题一题显示，用 Previous / Next 翻页

> 状态：**✅ 已完成（2026-10-16）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 哪些页面改成卡片 | 已裁 | A：作答页交卷前、交卷后与 Papers 的 View details 三处 | 二·D1 |
| D2 一张卡放什么 | 已裁 | A 并改：一题一张卡，题组材料在每张卡上方，默认收起 | 二·D2 |
| D2a 展开的材料在重画与翻页时怎样 | 已裁 | A：同一张卷上，题组材料点开后同组各卡都保持展开，直到再点收起；换卷重新收起 | 二·D2 |
| D3 翻页条的样子 | 已裁 | A 并改：Previous、题号 1…N（按状态着色）、Next，放在卡片上方 | 二·D3 |
| D4 Hand in 放在哪 | 已裁 | A：顶上一行，任何一张卡都能交 | 二·D4 |
| D5 交卷前提醒没答的题 | 已裁 | A：「No answer yet: questions 4, 7.」与必用词提醒一起，题号可点跳卡 | 二·D5 |
| D6 交卷后从哪张卡开始看 | 已裁 | A：第 1 张 | 二·D6 |
| D7 键盘左右键翻页（agent 提议） | 已裁 | B：不加 | 二·D7 |
| D8 卷子列表：去掉 View details，点行进入；没交的卷点行做什么 | 已裁 | 去掉 View details 与 Start，交过的点行进详情，没交的点行开始作答；Delete 留在行里 | 二·D8 |
| D9 类型与科目标签放到名字前，用「Daily / Check」 | 已裁 | 标签在名字前，写「Daily」「Check」；Kind 筛选也用「All kinds / Daily / Check」 | 二·D9 |
| D10 卷子名字缩短后写什么 | 已裁（用户自定） | 检验卷：组卷人名字，选了专题时接最多两个专题；每日卷：「Batch N」；去掉行里的「Owner」一项 |
| D10a 检验卷名字里的人是谁 | 已裁 | 组卷的人：检验卷新存 `madeBy`；已有两张检验卷记为 Aaron |
| D10b 检验卷名字里还写什么 | 已裁 | A 并改：人名，选了专题时接专题名，最多两个 |
| D10c Batch 怎么编号 | 已裁 | B：每人每天不分科目从 1 数 | 二·D10 |
| D11 短名字用在哪些地方 | 已裁 | B：所有显示卷名的地方都用短名字，前面加类型与科目标签 | 二·D10 |

## 目的

第二批用户原话（同日追加）：「also for the paper history list: 1. remove the 'View details' button. click each paper to enter its detail page. 2. move the subject and type tag before the paper's name/title. use "Daily/Check" instead of "Daily paper/Check paper". 3. Make the title of the papers shorter. Like, remove the redundant fields like "English" "All topics" and "15 Oct".」本轮交付随之加上 Papers 卷子列表（`renderPapers` 的列表部分）。

第一批：

用户原话：「Improve the 'Paper Detail' page, both redo and review state: Do not show all the questions in a list. Show them by cards. Also show a pagination and use "previous' and "next" to navigate the cards.」

用户说的「redo」是卷子的作答状态（交卷前），「review」是交卷后看对错与讲解的状态；两者是同一个作答页（`renderPaperRun`），每日卷与检验卷共用。

本轮具体交付：

1. 实现：`app/arena.html` 的作答页（与 D1 定下的其他页）改为一次一张卡、带翻页条；规则写成纯函数，断言写进 `app/logic.test.js`。
2. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳以 Sophia 做一张英文每日卷（含题组、选择、选词、主观题），交卷前后都翻一遍、交卷与自评照常保存；375 宽看一次；发布后读回线上核对。

## 输入

- 同主题未完成讨论：无（0001–0019 均为 ✅）。
- 0019（已完成）：卷上答题区（题干、选项、作答框、自评按钮）保持原尺寸。本轮不改这些尺寸。

---

## 一、证据

### E1 现在的作答页（`renderPaperRun`，2026-10-16 本地测试壳，Sophia，宽 1024）

- 顶上一行：卷名与「Stop」；下面所有题一张接一张（`.sheet`），同一题组的第一题前放材料（`materialBlock`，展开）；最底下「Hand in」。
- 英文每日卷一批 10 题，其中 3 段题组材料，含选择、选词、主观题。作答时页面高 4232px；交卷后每题下加对错、正确答案与讲解，页高 8221px。
- 交卷前只检查主观题的必用词（`mustUseNote`），有问题时列「Question 3: …」并要求再点「Hand in anyway」；没答的题不提醒。
- 交卷后顶上一块写得分「s.right/总题数」与「N to self-mark」；主观题在各自题下自评，自评即存。

### E2 Papers 页的「View details」（`renderPaperSheet`）

交过的卷从 Papers 列表点「View details」进来：顶上得分，下面每题一张 `.sheet`（作答、对错、讲解、改判下拉）。刚交的 10 题英文卷页高 8736px。它不是作答页，但与交卷后的样子几乎相同。

### E3 状态

作答页的状态在 `S.run`（`phase`、`responses`、`results`、`saved` 等），切页不写数据库；加一个「当前第几张卡」只是页面状态，不改 `DATA.md`。

### E4 卷子列表现在（0019 落盘后）

每行：标题（`p.title`）、右侧得分或「Not done by me」；meta 行依次是类型标签（「Daily paper」「Check paper」，0019 D4a）、科目标签、Owner、Created、Done，之后是「View details」（交过的）或「Start」（没交的）与「Delete」按钮。标题在建卷时写死存进数据库：每日卷「English redo · 15 Oct」，检验卷「English · All topics · 14 Oct」（选了专题时是专题名，如「English · Tenses, Prepositions · 14 Oct」）。2026-10-16 数据里 8 张卷的标题都只由科目、「redo」或「All topics」与日期组成；去掉科目、All topics 与日期后，每日卷只剩「redo」，检验卷什么都不剩。标题也显示在 Today 的 Check papers、作答页顶上一行与 View details 顶上。

---

## 二、逐题

### D1 哪些页面改成卡片

证据：E1、E2。

- A（推荐）**作答页的交卷前与交卷后，加上 Papers 的「View details」，三处同一种卡片翻页。** 三处长得像，用法一致。代价：「View details」也要改。
- B **只改作答页（交卷前与交卷后）。** 代价：「View details」仍是一长列，与交卷后的样子不一致。

**裁决（2026-10-16）：A。**

### D2 一张卡放什么

证据：E1。

- A（推荐）**一题一张卡；题组的题，每张卡上方都放这段材料（展开）。** 不用翻回去看材料。代价：材料在各卡重复出现，长材料卡片较高。
- B **一个题组一张卡（材料加组里全部题），独立题一题一张。** 代价：语法完形一组可能有 10 个空，一张卡又变得很长；卡数与题数对不上。

**裁决（2026-10-16）：A，并改：** 用户原话「A. Collapse the material by default.」——题组材料仍在每张卡上方，但默认收起，点开才看。

D2a（复审 F1 引出，依赖 D2）：材料默认收起后，Sophia 点开材料、再点一个选项，页面会重画（`render()`），材料又收起，边看材料边答题做不到。要定的是展开状态保留到哪里。

- A（推荐）**同一张卷上，一个题组的材料点开后，翻到这一组的其他卡也保持展开，直到再点收起；换卷或交卷后的 View details 重新从收起开始。** 代价：多记一个「哪些题组已展开」的页面状态。
- B **只在当前这张卡上保留展开；翻到同组下一张卡又收起。** 代价：同组每张卡都要再点一次展开。

**裁决（2026-10-16）：A。**

### D3 翻页条的样子

依赖 D2。

- A（推荐）**卡片下方一行：「Previous」、题号按钮 1…N、「Next」；当前题高亮。** 交卷前，答过的题号实心；交卷后，题号按结果着色（对绿、部分对琥珀、错红），主观题还没自评的描边提示。点题号直接跳到那张卡。卡片上方写「Question 3 of 10」。第一张卡「Previous」不可点，最后一张「Next」不可点。翻页后回到卡片顶部。代价：多一个算题号状态的纯函数与断言；题多时题号会折成两行。
- B **只有「Previous」「Next」与「3 / 10」。** 代价：看不出哪些题还没答，也不能跳题。

**裁决（2026-10-16）：A，并改：** 用户原话「A, and put the pagination at the top.」——翻页条放在卡片上方，不在下方；翻页后回到页面顶部。

### D4 Hand in 放在哪

证据：E1。

- A（推荐）**放在顶上一行（卷名、Stop 旁边），任何一张卡都能交。** 代价：还没翻到最后就能交，需要 D5 的提醒兜底。
- B **只在最后一张卡的翻页条旁出现。** 代价：想提前交要先翻到最后。

**裁决（2026-10-16）：A。**

### D5 交卷前提醒没答的题

证据：E1（现在只提醒必用词）。一题一张卡后，漏答更不容易看到。

- A（推荐）**有没答的题时，和必用词提醒放在一起：「No answer yet: questions 4, 7.」，同样要再点「Hand in anyway」。** 提醒里的题号可点，跳到那张卡。代价：多一条提醒、一个纯函数。
- B **不提醒没答的题，照旧。** 代价：漏答的题直接判错，回到阶梯第 1 级。

**裁决（2026-10-16）：A。**

### D6 交卷后从哪张卡开始看

- A（推荐）**从第 1 张开始。** 简单，与题号顺序一致。代价：错题要靠题号颜色去找。
- B **从第一道错题（或待自评的题）开始。** 代价：规则多一条；全对时还要回落到第 1 张。

**裁决（2026-10-16）：A。**

### D7 键盘左右键翻页（agent 提议）

- A **加：焦点不在输入框里时，← → 翻页。** 代价：多一段按键处理；平板上用不到。
- B（推荐）**不加。** Sophia 主要点按；按「简单优先」推迟。代价：电脑上翻页只能点按钮。

**裁决（2026-10-16）：B。**


### D8 卷子列表：去掉 View details，点行进入；没交的卷点行做什么

证据：E4。用户原话已定：去掉「View details」，点一行进入那张卷的详情页。没交的卷没有详情页（现在是「Start」按钮）。

- A（推荐）**交过的卷点行进 View details；没交的卷点行开始作答（同现在的 Start），「Start」按钮去掉。「Delete」按钮留在行里，点它不触发整行。** 代价：没交的卷误点就进了作答页（可点 Stop 退出，不写数据）。
- B **交过的卷点行进详情；没交的卷不能点行，保留「Start」按钮。** 代价：两种行的用法不同。

**裁决（2026-10-16）：A。**

### D9 类型与科目标签放到名字前，用「Daily / Check」

证据：E4。用户原话已定：类型与科目标签移到名字前面，类型标签写「Daily」「Check」（改 0019 D4a 的「Daily paper」「Check paper」）。颜色与左侧色条照 0019 D4a。要定的是 Kind 筛选的选项文字。

- A（推荐）**Kind 筛选也改成「All kinds / Daily / Check」。** 标签与筛选同一套词。代价：脱离上下文时「Daily」「Check」不如全称清楚。
- B **筛选保留「Daily paper / Check paper」。** 代价：同一页两套叫法。

**裁决（2026-10-16）：A。**

### D10 卷子名字缩短后写什么

证据：E4。用户原话已定：去掉「English」「All topics」「15 Oct」这类与标签、Created 重复的部分。去掉后多数卷什么都不剩，要定写什么。

- A（推荐）**页面上现算短名字，不改数据库里的标题：检验卷选了专题时写专题名，后接题数；没选专题与每日卷只写题数。** 例：「10 questions」「Tenses, Prepositions · 10 questions」。题数是卷上仍在的题数。代价：多一个纯函数与断言；数据库里的长标题照旧（导出里仍是长标题）。
- B **改建卷时存的标题，并把已有 8 张卷的标题改短。** 代价：要改数据与 `DATA.md`，还要一次迁移；按「简单优先」不推荐。

**裁决（2026-10-16）：用户自定。** 用户原话：「For check papers, add creator to title, and remove creator field; For daily papers, use "Batch 1/2/3/4".」检验卷的名字写组卷人，行里去掉那一项人名（现在是「Owner Sophia」）；每日卷写「Batch 1」「Batch 2」……。由此追问三题：

D10a 名字里的人是谁。证据：检验卷只存了 `owner`（题从谁的错题里抽，组卷人当时的默认归属人），谁组的卷没有记。选项：A 归属人（不改数据）；B 组卷的人（新存字段）。**裁决（2026-10-16）：** 用户原话「C. And the two checks are created by Aaron.」——按组卷的人理解（即 B），并说明已有的两张检验卷是 Aaron 组的。落实：检验卷新加字段 `madeBy`（组卷人的用户 id），组卷时写本人；已有两张检验卷（`cga6sx9773jjk3whwlen`、`m2xx1yc432t4pekaaz9w`，均为「English · All topics · 14 Oct」）补写 Aaron 的 id。

D10b 名字里还写什么。选项：A 人名，选了专题时接专题名（推荐）；B 只写人名；C 人名加题数。**裁决（2026-10-16）：A，并改：** 用户原话「A, when there are many topics, choose one or two to make the name 'short'.」——专题多时只写前两个，后接「+N」表示其余个数，如「Aaron · Tenses, Prepositions +2」。

D10c Batch 怎么编号。选项：A 每人每科每天从 1 数（推荐）；B 每人每天不分科目从 1 数。**裁决（2026-10-16）：B。** 落实：同一位用户（`for`）同一天（`createdAt`）的每日卷，只数这位用户交过的，按生成时刻（`madeAt`，没有时按 id）从 1 数；正在做、还没交的那张排在交过的之后。

D11 短名字用在哪些地方（依赖 D10）：

- A（推荐）**只用在 Papers 的卷子列表。** 列表行前有类型与科目标签，短名字够用；Today 的 Check papers、作答页与 View details 顶上没有这些标签，照旧用长标题。代价：同一张卷在不同地方名字不同。
- B **所有显示卷名的地方都用短名字，并在前面加类型与科目标签。** 代价：改动面大到 Today 与作答页。

**裁决（2026-10-16）：B。**

---

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D3、D5 | `app/arena.html` 纯逻辑 | 加纯函数 `runMarks(exs, phase, responses, results, saved)`：按卷面顺序每题一个状态。交卷前：作答去首尾空白后非空为 `answered`，否则 `todo`。交卷后：主观题未自评为 `tomark`，其余取 `results` 里的 `right`/`partial`/`wrong`，没有结果为 `none`。加 `sheetMarks(rows)`（`rows` 为 `paperAttempts` 的结果）：错题已删为 `gone`，没有作答为 `none`，否则为作答结果。加 `unansweredNos(marks)`：`todo` 的题号（从 1 起） |
| 2 | D1、D2、D3 | `app/arena.html` 作答页 | `renderPaperRun` 一次只画一张卡：状态 `S.run.idx`（从 0 起，开始作答时为 0）。顶上一行之下依次是：交卷后的得分块（照旧）；提醒（D5）；翻页条（第 3 行）；卡片。卡片是这一题的 `.sheet`；题属于题组时，卡片上方放这段材料，每张卡都放、默认收起；展开状态按 D2a 保留（重画不收起）。卡片内容（作答、交卷后的对错、正确答案与讲解、主观题自评）与现在每题一张 `.sheet` 时相同。`start-daily` 与 `start-paper` 两处建 `S.run` 时加 `idx: 0`。卡片的作答 key、`pick` 与 `input` 取 id、必用词提醒的题号统一按卷上仍在的题（`exs`）编号与取 id，修掉现在按 `p.exerciseIds` 下标取 id 的偏差（复审 F3、F5） |
| 3 | D3 | `app/arena.html` 翻页条 | 函数 `cardPager(marks, idx, act)`，作答页与 View details 共用：一行小字「Question 3 of 10」；下一行「Previous」、题号按钮 1…N、「Next」。当前题加粗描边（`aria-current="true"`）；`answered` 实心浅蓝，`right` 绿、`partial` 琥珀、`wrong` 红（浅底、同色字），`tomark` 虚线描边，`todo`/`none` 平常，`gone` 灰。第一张「Previous」、最后一张「Next」不可点。点任一按钮切到那张卡并回到页面顶部；切卡不写数据。按钮的 `title` 写状态（如「Question 4: not answered yet」）。题号按钮当前题用 `aria-pressed="true"`，与 Papers 列表的翻页一致（复审 F6）。点击动作：作答页 `data-act="card-go"`，View details `data-act="sheet-go"`，`data-v` 为目标下标（复审 F5）。作答页输入文字时只重画翻页条，题号随即变实心；已出的提醒文字要到再点 Hand in 才更新（复审 F4，接受） |
| 4 | D4 | `app/arena.html` 作答页 | 交卷前顶上一行：卷名、`grow`、「Hand in」（主按钮，有提醒时文字为「Hand in anyway」）、「Stop」。原页尾的「Hand in」一行删去。交卷后的「Save again」「Back to today」照旧在卡片下方 |
| 5 | D5 | `app/arena.html` 交卷 | 点 Hand in 时，提醒由两部分组成：必用词提醒（照旧，每题一行）；有没答的题时一行「No answer yet: questions 4, 7.」，题号是按钮，点了跳到那张卡。有任一提醒时第一次点只出提醒（照旧的 `R.warned` 机制），再点「Hand in anyway」才交。提醒放在顶上一行之下 |
| 6 | D6 | `app/arena.html` 交卷 | 交卷进入交卷后状态时 `R.idx` 置 0 |
| 7 | D1、D2、D3 | `app/arena.html` View details | `renderPaperSheet` 一次一张卡：状态 `S.paperIdx`，每次「View details」打开时置 0。顶上「← Back to papers」与得分块照旧；下面翻页条（`sheetMarks`）与卡片；题组材料同第 2 行（每张卡都放、默认收起，展开状态按 D2a）；卡片内容（作答、对错、讲解、改判下拉、「Exercise details」）照旧；已删的题照旧显示「This exercise has been deleted.」 |
| 8 | D7 | —— | 不加键盘翻页 |
| 9 | —— | `app/arena.html` 样式 | 加 `.cardpager` 与题号按钮各状态的样式，颜色用现有 token（`--pen-soft`、`--green-soft`/`--green`、`--amber-soft`/`--amber`、`--red-soft`/`--red`、`--muted`）；答题区尺寸不变（0019） |
| 10 | D1–D6 | `app/logic.test.js` | 加断言并导出：`runMarks`（交卷前空白算没答、交卷后主观题未自评为 tomark、客观题按结果）、`sheetMarks`（gone、none、结果）、`unansweredNos`（题号从 1 起） |
| 11 | 完成标准 | 验证（不改文件） | `./check.sh` 与断言通过（含行 21 的新断言）；本地测试壳以 Sophia 做英文每日卷：一次只见一张卡，题组材料默认收起、可展开；翻页条在卡片上方，Previous/Next 首尾不可点、题号跳卡；答几题后题号变实心；展开题组材料后点选项不收起，翻到同组下一张卡仍展开（按 D2a）；输入文字后当前题号变实心；不全答点 Hand in 出「No answer yet: …」且题号可跳，再点「Hand in anyway」交卷，回到第 1 张、题号按对错着色、主观题自评后颜色更新并保存；Papers 的 View details 同样翻页、改判可用。Papers 列表：行前是「Check」「English」标签，名字为「Aaron」（测试壳数据补上 `madeBy`）与「Batch 1」「Batch 2」「Batch 3」；点交过的行进详情、点没交的行开始作答、点 Delete 只出删除确认；Kind 筛选为 Daily / Check；Today 的 Check papers、作答页与 View details 顶上同样是标签加短名字。记录各状态页高与 E1、E2 对照；375 宽无横向滚动；控制台无错误。落盘者逐行对照本表核对实际稿 |
| 12 | 发布 | 线上页面 | 发布前读线上并核对与上次提交相同；发布到原网址；读回，去掉外壳后与本地文件相同；能力与契约不变；不改数据 |
| 15 | D8 | `app/arena.html` Papers 列表 | 每行改为整行可点：交过的（`handedInAt` 有值）`data-act="paper-view"`，没交的 `data-act="start-paper"`；「View details」与「Start」按钮删去；「Delete」与删除确认留在行里（点击按 `closest('[data-act]')` 先命中按钮，不触发整行）。行内不嵌套 `<button>`：整行用 `<div role="button" tabindex="0">`，并支持 Enter 键打开 |
| 16 | D9、D11 | `app/arena.html` 卷名显示 | 加 `paperTag(p)` 输出名字前的两枚标签：类型「Daily」（灰色描边，`.chip.k-daily`）或「Check」（深色实心，`.chip.k-check`），再接科目标签；左侧色条照 0019。Papers 列表、Today 的 Check papers、作答页顶上一行、View details 顶上，都写「标签 + 短名字」。Papers 列表 meta 行去掉类型、科目标签与「Owner …」一项，留 Created、Done、TEST 与 Delete。Kind 筛选选项改为「All kinds / Daily / Check」 |
| 17 | D10、D10a、D10b、D10c | `app/arena.html` 纯逻辑 | 加纯函数 `paperName(p, papers, view, uid, userName, topicName)`：检验卷为 `madeBy` 的名字（没有 `madeBy` 时为「Someone」），`topics` 非空时接「 · 」与前两个专题名（按 `topics` 顺序），多于两个时再接「 +N」；每日卷为「Batch N」，N 按 D10c（同 `for`、同 `createdAt`，只数 `for` 交过的，按 `madeAt` 再按 id 排；本卷没交时排在交过的之后） |
| 18 | D10a | `app/arena.html` 组卷 | `paper-create` 写入的文档加 `madeBy: S.me`；`title` 照旧写长名字（导出与旧数据兼容） |
| 19 | D10a | `DATA.md` | `papers/{id}` 表加一行：「`madeBy` · 字符串，可省 · 检验卷：组卷人的用户 id；组卷时写本人；每日卷不写」。`title` 一行补一句：「页面显示用短名字（检验卷为组卷人与所选专题，每日卷为当天的批次），不读这个字段」 |
| 20 | D10a | 线上数据 | 用 `ArtifactData` 对 `papers/cga6sx9773jjk3whwlen`、`papers/m2xx1yc432t4pekaaz9w` 做 update，只加 `madeBy: "u_p8FtsixDb3mSGROTa5WIAw"`（Aaron）。写前读这两张卷，核对标题仍是「English · All topics · 14 Oct」、没有 `madeBy`；写后读回核对；线上若有别的检验卷没有 `madeBy`，停下问用户 |
| 21 | D10 | `app/logic.test.js` | 加 `paperName` 断言并导出：检验卷有 `madeBy` 与无 `madeBy`、0/2/4 个专题（「+2」）；每日卷同一人同一天跨科目连续编号、没交的不占号、正在做的排在最后、别人的卷不计 |
| 13 | D2 | `adr/0003-question-set-holds-shared-material-questions-keep-own-ladder.md` | 「理由」第一条「材料只存一次、只显示一次，改一处就改全组」改为「材料只存一次，改一处就改全组。」：D2 让材料在同组每张卡上都出现，「只显示一次」不再成立；被否方案的代价「材料继续重复存放、重复显示」不改（复审 F2） |
| 14 | —— | 不改 | `CONTEXT.md` 与其他 ADR 不改：没有新概念（短名字只是显示）；当前第几张卡只是页面状态。提交只含 `app/arena.html`、`app/logic.test.js`、`adr/0003-…`、`DATA.md` 与本讨论文件；`.claude/launch.json` 不进提交 |

## 四、复审

复审者（新上下文 subagent）交回 6 条，逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 材料默认收起后，重画会把展开的材料收起 | 成立：`pick`（arena.html 1720）与 `paper-self` 都调 `render()`，`materialBlock` 按参数重新输出 | 改设计：新题 D2a 交用户裁；行 2、7 引 D2a，行 11 加验证 |
| F2 与 ADR 0003「只显示一次」的理由冲突 | 成立 | 机械：加行 13 改 ADR 理由，随核销表请用户确认 |
| F3 已删题时题号与取 id 错位（旧偏差） | 成立：key 用 `exs` 下标，`pick`、`input` 用 `p.exerciseIds[i]` 取 id（1720、1843），提醒按 `p.exerciseIds` 编号（1730） | 机械：行 2 统一按 `exs` |
| F4 输入后题号与提醒不实时更新 | 成立：`input` 只写 `responses` | 机械：行 3 输入后重画翻页条；提醒到再点 Hand in 才更新，写明接受 |
| F5 `S.run` 两处初始化与新动作没点名 | 成立：1717、1723 | 机械：行 2、3 写出 |
| F6 `aria-current` 与现有 `aria-pressed` 不一致 | 成立：Papers 列表翻页用 `aria-pressed` | 机械：行 3 改用 `aria-pressed` |

重写了行 2、3、7、11，加了行 13；按简报自查，除 D2a 外没有新的设计选择。

第二批（D8–D11）加了行 15–21，未再派复审；按简报自查：每行对得上登记表；行 15 的整行 `div role=button` 与 Enter 键、行 16 的 meta 精简（去掉与名字前标签重复的类型、科目）是落实 D8、D9、D10 的写法，没有新的选择；行 19–20 改 `DATA.md` 与线上数据，是本轮改动最大的部分，请用户确认时一并问要不要再派复审。

## 五、核销（2026-10-16）

授权：用户确认完整核销表（「确认 0020 的完整核销表（含行 15–21 与线上数据补写），不再派复审，按表落盘、验证、发布并提交。」）。

| 核销表行 | 状态 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | 加 `runMarks`、`sheetMarks`、`unansweredNos`，规则照表 |
| 2 | ✅ | `renderPaperRun` 一次一张卡；`S.run.idx` 在 `start-daily`、`start-paper` 两处建为 0；题组材料每张卡都放，默认收起，展开状态记在 `S.run.openSets`（用捕获阶段的 `toggle` 事件记录）；作答 key、`pick`、`input` 与必用词提醒改由 `runExs()`（卷上仍在的题）编号与取 id。测试壳：一次一张 `.sheet`；第 2 题的材料默认收起，展开后点选项仍展开，翻到同组下一张仍展开 |
| 3 | ✅ | `cardPager` 照表：「Question N of M」、Previous、题号、Next，当前题 `aria-pressed`，首尾不可点，`card-go`/`sheet-go` 切卡并回顶部。输入文字只重画翻页条：焦点仍在作答框，题号变为 answered |
| 4 | ✅ | Hand in 与 Stop 在顶上一行，有提醒时为「Hand in anyway」；页尾的 Hand in 已删；交卷后 Save again / Back to today 在卡片下方 |
| 5 | ✅ | 提醒为 `{ must, missing }`；测试壳只答一题时出「Question 1: Your answer must use "Had".」与「No answer yet: questions 1, 3, 4, …, 10.」，点题号跳到对应卡；再点 Hand in anyway 交卷 |
| 6 | ✅ | 交卷时 `R.idx = 0`；测试壳交卷后为「Question 1 of 10」，题号按对错着色，第 1 题（主观题）为 tomark；自评 Right 后变 right，并写入作答 |
| 7 | ✅ | `renderPaperSheet` 一次一张卡，`S.paperIdx`、`S.paperOpenSets` 在 `paper-view` 时清零；题号按 `sheetMarks` 着色，Next 与跳题可用；改判下拉与 Exercise details 照旧 |
| 8 | ✅ | 未加键盘翻页 |
| 9 | ✅ | 加 `.cardpager`、`.cp-row`、`.pg-n` 各状态样式与 `.linkbtn`，颜色用现有 token；答题区尺寸未动。另把 `.progress` 的间距收到 8px，按钮与卷名不折行：375 宽时「Hand in」原先折成两行，是表外的排版修补，没有新语义 |
| 10 | ✅ | 断言照表补齐并导出 |
| 11 | ✅ | `./check.sh` 退出码 0；断言通过；控制台无错误。页高（宽 1024）：作答 4232→768（卡片矮于一屏），交卷后 8221→1173，View details 8736→1192。375 宽时作答页、Papers 列表与详情 `scrollWidth` 均为 375。行 15–17 的验证见下。落盘者逐行对照本表核对实际稿：除行 9 所记的排版外没有表外语义 |
| 12 | ✅ | 发布前读到的线上版本是本会话发布的第 28 版（1792123109-5f7e），发布工具给出的差异只有本轮改动。发布为第 29 版（1792125436-81e4），能力与契约照旧。读回 `index.html`，去掉外壳后与本地文件逐字相同 |
| 13 | ✅ | ADR 0003 理由第一条改为「材料只存一次，改一处就改全组。」 |
| 14 | ✅ | `CONTEXT.md` 与其他 ADR 未改 |
| 15 | ✅ | 卷子列表整行为 `div role="button" tabindex="0"`：交过的 `paper-view`，没交的 `start-paper`；View details 与 Start 已删；删除确认的外框加 `data-act="none"`。另加 Enter 键处理。测试壳：点 Delete 只出删除确认、不进详情；点确认框空白处也不进详情；点行进详情 |
| 16 | ✅ | 加 `paperTag`、`pname`；Papers 列表、Today 的 Check papers、作答页顶上、View details 顶上都是「标签 + 短名字」；列表 meta 只留 Created、Done、TEST 与 Delete；Kind 筛选为 All kinds / Daily / Check |
| 17 | ✅ | 加 `paperName`。测试壳（测试数据给两张检验卷补了 `madeBy`）：列表为「Daily English Batch 1」「Check English Aaron」×2；Sophia 10-16 新开的英文每日卷顶上为「Batch 1」，交了一张后下一张为「Batch 2」 |
| 18 | ✅ | `paper-create` 写入 `madeBy: S.me`，`title` 照旧 |
| 19 | ✅ | `DATA.md`：`papers` 表加 `madeBy` 一行，`title` 一行补短名字的说明 |
| 20 | ✅ | 写前列出线上 `papers`：共 8 张，检验卷只有 `cga6sx9773jjk3whwlen`（版本 11）与 `m2xx1yc432t4pekaaz9w`（版本 5），标题都是「English · All topics · 14 Oct」，都没有 `madeBy`。批量 update 按版本钉住，原子提交，之后版本为 12 与 6。读回：按 `madeBy` 查询恰好命中这两张；文档只多了这一个字段 |
| 21 | ✅ | `paperName` 断言照表 |

未验证：在真实 claude.ai 里用 Sophia 账号打开的显示（测试壳模拟了 `db` 与用户）；平板上的点按手感。
