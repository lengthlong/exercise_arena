# 0034 精简界面：设置去掉每周目标与导出、自动保存；交卷页紧凑；点题号不回顶；其他重复信息

> 状态：**✅ 已完成（2026-10-30）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| S1 设置里去掉「每周练习天数」「每周检验卷张数」及相关功能 | 已裁 | 用户原话：去掉，相关功能一并去掉（Today 底部的目标句、目标算法、`practiceDays` 与 `papersPerWeek` 字段、术语 Weekly goal） | 二·S1 |
| S2 「How the review ladder works」默认展开 | 已裁 | 用户原话 | 二·S2 |
| S3 设置自动保存 | 已裁 | 用户原话：去掉 Save 按钮，改一项存一项；保存结果的提示怎样写见 S3a | 二·S3 |
| S3a 自动保存后怎样提示 | 已裁 | A：旁边一个小的「Saved」，出错走页面顶部的错误条 | 二·S3 |
| S4 去掉 Export YAML 及相关功能 | 已裁 | 用户原话：去掉导出按钮、`toYaml`、`exportData`、`downloads` 能力的使用，与 ADR 里提到导出的句子 | 二·S4 |
| H1 交卷页怎样压紧 | 已裁 | A：交卷后的摘要压成一行（得分、金币），不再写对错文字；卷子详情的摘要同样压成一行 | 二·H1 |
| H2 点题号不回到页面顶部 | 已裁 | 用户原话：点翻页条的题号时不重置滚动位置；Next / Previous 按钮见 H2a | 二·H2 |
| H2a Next / Previous 翻题要不要回顶 | 已裁 | B：所有翻题（题号与卡片底部的 Next / Previous）都不回顶（用户选，推翻推荐） | 二·H2 |
| O1 其他重复信息去哪些 | 已裁 | 去 1 Papers 面板标题、2 Papers 列表无筛选时的「N papers」、3 Exercises 小结的「N exercises」、4 设置块标题；不动 5（检验卷表单的两段说明） | 二·O1 |
| W1 This week / Last week 的统计行放哪、写什么 | 已裁 | 用户原话（第一次回复核销表时）：统计行移到大数字右边；去掉「practised on x of x days」（看图即知） | 二·W |
| W2 组合图的轴标题 | 已裁 | 用户原话：去掉左上的「Answers」与右上的「Correct」 | 二·W |
| W3 梯子块的标题与「moved down」 | 已裁 | 用户原话：去掉小标题「Ladder」；「x moved down」从底部移到右梯第 1 级的右边，写成向下的箭头加红色数字 | 二·W |
| O2 其他重复或没用的信息（用户授权 agent 自行找） | 已裁 | 用户授权；agent 提议两项：卷子详情页的返回行并进摘要行；两架梯子各级去掉「/百分比」 | 二·O2 |
| R1 Record 页顶上的说明句 | 已裁 | 用户原话：去掉「Take a photo or paste the question text; AI splits it into drafts…」那句 | 二·R |
| R2 Record 页的 Subject 下拉 | 已裁 | 用户原话：去掉，一律由 AI 判断科目（选已有题组补录时科目随题组） | 二·R |
| R3 Record 页的 Owner 下拉与 Papers 组卷表单的默认归属人说明 | 已裁 | 用户原话「always let ai decide / … in Settings」指的一句没找到原文，用户在两个候选里选了「两个都去掉」：Record 去掉 Owner 下拉，新录入的错题一律归 Default owner；Papers 组卷表单去掉「Questions are drawn from the default owner's … change it in Settings.」 | 二·R |
| P1 Papers 两个列表里的 Delete 按钮 | 已裁 | 用户原话：去掉（检验卷与每日卷两个列表都去） | 二·P |

## 目的

用户原话：「improve the experience of this app, there are many redundant informations on the UI, can you compact them. Some hints: 1. Settings: 1. remove 'Practice days per week' and 'Exam papers per week' from settings, and remove related features. 2. Expand 'How the review ladder works' by default 3. 'Save' automatically in 'Settings' 4. remove 'Export YAML' and related features. 2. Hand-in Page: 1. Compact the 'hand-in' section.(remove the summary wording? we can induce the summary from the 'indexes') 2. do not auto reset the page's scroll position when switching questions by clicking the question indexes. 3. Other redundants.」

「Hand-in 页」即交卷后的作答页（`renderPaperRun` 的 `review` 阶段）；「the indexes」即卡片上方的翻页条（`cardPager`），它按题给颜色（对、部分对、错、待自评）。

本轮具体交付：

1. 实现：`app/arena.html` 的 Settings、Today 底部目标句、周块的统计行与梯子、作答页与卷子详情的摘要、翻页点击；新规则写成纯函数，断言改进 `app/logic.test.js`。
2. 设计文件同步：`CONTEXT.md`（去掉 Weekly goal）、`DATA.md`（`settings` 字段）、ADR 0001、0002 里提到导出的句子。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳逐页看过，375 宽没有横向滚动。重新发布到原网址另问用户（见核销表末行）。

## 输入

- 同主题未完成讨论：无（0001–0030 均为 ✅）。
- 0030（已完成）：加了 Today 底部的目标句、作答页的 Back 与翻页条。本轮 S1 去掉目标句；H2 改它的翻页点击。
- 0024（已完成）：最后一张卡的 Next 换成 Hand in；本轮不动。

---

## 一、证据

来源：读 `app/arena.html` 当前代码（基线 9ee4845）。

### E1 每周目标

`SETTINGS_DEFAULT` 与 `readSettings` 读写 `practiceDays`、`papersPerWeek`；`goalLines` 用它们生成 Today 底部的两句目标（`weekGoals` → `todayBlock` 的 `.today-goals`）；`goalProgress` 数本周有作答的天数与交过的检验卷张数，`weekReview` 取它的 `days` 作 `practised`（「practised on N of 7 days」）、`papers` 作 `papersDone`，`papersDone` 在页面里没有别处用到。设置页有两个输入框与一行「Weeks run Monday to Sunday…」的说明；保存提示里也写这两项。`logic.test.js` 里 `readSettings`、`goalLines`、`goalProgress` 都有断言。术语表有「Weekly goal」词条，`DATA.md` 的 `settings` 表有这两个字段。

### E2 设置页现状

一块：Default owner、Questions per batch、两个目标框、Save 按钮与保存提示；「How the review ladder works」是收起的 `<details>`；底部一块 Export YAML（`exportAll`、`exportData`、`toYaml`、`S.downloads`、`S.exportMsg`），`boot` 里 `use('downloads')`，文件头注释写着能力含 `downloads`。ADR 0001「代价」第一条与 ADR 0002「代价」第二条提到导出。

### E3 交卷页

交卷后（`R.phase === 'review'`）顶上一块摘要：一行「Handed in · saved」（保存中为「Saving…」）；一行大分数加「x right · y partly · z wrong · n to self-mark」；每日卷再一行金币；再一句提示（「Any you missed go back to the start of the ladder.」或自评说明）。同时翻页条每题已按对、部分对、错、待自评着色，对错分布看翻页条即知；得分 x/n 与翻页条也能互相推出。卷子详情（`renderPaperSheet`）的摘要卡：卷名、大分数加「Right · Partly · Wrong」、「Handed in 时刻」。

### E4 翻题的滚动

`card-go` 与 `sheet-go` 两个动作既是翻页条的题号按钮，也是卡片底部 Previous / Next 的按钮，处理后都 `window.scrollTo(0, 0)`。翻页条在卡片上方，材料在卡片下方；点题号时用户视线在页面上部，每次被拉回顶端，需要对照下面的材料时会打断。

### E5 其他重复

- Papers：子标签「Check papers 5」之下的面板又写标题「Check papers」；「Daily papers」同；列表栏「5 papers」与子标签上的数字重复（无筛选时）。
- Exercises：选了一科后的小结第一行「N exercises · N due · N mastered」，N exercises 与科目子标签上的数字重复；小卡阶梯条的图例在下方专题图里已有。
- 设置页：块标题「Settings」与标签名「Settings」重复。
- 做检验卷表单：两段说明（题从默认归属人的错题里抽、Draw order…）各占一段。

### E6 周块与梯子（用户第二次回复补充）

- `thisWeekBlock`、`lastWeekBlock`：大数字加「questions reviewed」一行（`.rv-head`），下面一行小字 `reviewLine`（「233 answers: 157 right · 8 partly · 68 wrong · practised on 6 of 7 days」），再是组合图；组合图左上有「Answers」、右上有「Correct」两个轴标题（`.ax-t`），轴上的数字与百分比已说明各自是什么。
- 梯子块：`.sub` 里一个 h3「Ladder」，下面是两架梯子；下降的题数在梯子图下另起一行小字「↓ N moved down」（`.lad-down`）。右梯各级旁写「题数/百分比」，第 2–4 级和掌握后面带「↑本周升到此级的题数」，第 1 级旁没有东西。
- 两架梯子各级旁都写「题数/百分比」，一共十个百分比，题数一定的前提下百分比可由图上的数算出。
- 卷子详情页顶上先是单独一行的 Back，下面才是摘要卡（卷名一行、分数与时间一行）：返回行占一行高却只放一个按钮。

### E7 Record 与 Papers 列表（用户第三次回复补充）

- Record 页（`renderRecord`）：顶上「Record exercises」下有一句说明；有一个 Subject 下拉（首项「Let AI decide」，选了已有题组时锁定为题组的科目）和一个 Owner 下拉（`S.recOwner`，缺省读 Settings 的 Default owner）；`S.recSubject` 还用来筛「From a saved question set」的题组与传给 AI 的提示（`recognisePrompt`）。
- Papers 组卷表单有一句「Questions are drawn from the default owner's (名字) exercises; change it in Settings.」。
- 检验卷列表每行、每日卷列表每行都有 Delete 按钮（`delBox`，点后行内确认）；删卷的动作是 `ask-del` / `paper-delete` / `cancel-del`，其中 `ask-del`、`cancel-del` 与错题详情的删除共用。

---

## 二、逐题

### S1 去掉每周目标

用户原话直接定。范围按 E1：设置页两个输入框与说明行、保存提示里的两项；`SETTINGS_DEFAULT`、`readSettings` 里的两个字段；`goalLines`、`weekGoals`、Today 底部 `.today-goals` 与样式；`weekReview` 的 `papersDone`（无人使用）；`goalProgress` 只留数天数的部分，改名为 `practisedDays`（`practised on N of 7 days` 仍要用）或直接并进 `weekReview`——实现细节，不另设题。`settings` 文档里已有的这两个字段忽略，下次保存时 `set` 整份覆盖掉。

### S2 阶梯说明默认展开

用户原话直接定：`<details class="panel" open>`。

### S3 自动保存

用户原话直接定：去掉 Save 按钮。Default owner 的下拉与 Questions per batch 的输入框，`change` 时（输入框即失焦或回车）就按 `readSettings` 收紧后写入 `settings/{我}`，并立即更新 `S.settings`。输入框被收紧时（例如 99 改成 50）重画后显示收紧后的值。

**S3a 提示怎样写**（裁决：A）

- A（推荐）：保存成功后设置块标题右边出一个小的「Saved」，下次改动或离开设置页就消失；写失败走已有的页面顶部错误条（`S.errMsg`）。代价：几乎不占地方；不再逐项复述写了什么。
- B：保留一句「Saved: up to 10 questions per batch; default owner …」。代价：重复了用户刚填的内容，与本轮目标相反。

### S4 去掉导出

用户原话直接定。删：设置页导出块、`exportAll`、`exportData`、`toYaml` 及其辅助（`yamlScalar`、`yamlKey`）、`S.exportMsg`、`export` 点击分支、`boot` 里对 `downloads` 的使用与文件头注释里的 `downloads`；`logic.test.js` 里 YAML 与导出的断言。设计文件：ADR 0001「代价」第一条整条删去（改写后「要在 Obsidian 里看」的出口不再有，该句是现状描述，不留「为什么不做」）、ADR 0002「代价」里「导出的数据里是 id…」整条删去。`downloads` 是发布时声明的运行时能力，页面不再使用后，下次发布时从声明里去掉；本轮是否重发见核销表末行。

### H1 交卷页怎样压紧

证据 E3。选项：

- A（推荐，裁决）：交卷后摘要压成一行：左边大分数 x/n，右边金币（每日卷，原样「🪙 +N coins (climbed…)」），保存中或没保存时在分数旁出一个小状态（「Saving…」「Not saved yet」），保存成功不写字。去掉「x right · y partly · z wrong」文字（翻页条已按题着色；待自评的题仍由翻页条的待自评色标出，并保留一句短提示「Mark your written answers」只在还有待自评题时出现）；去掉「Any you missed go back…」。卷子详情的摘要卡同样压成一行：卷名与大分数、右边交卷时刻，去掉对错文字。代价：翻页条上没有直接的数字，要数颜色；用户已同意这一点（「we can induce the summary from the indexes」）。
- B：只去对错文字，保留标题行「Handed in · saved」与提示句。代价：压得少。

### H2 点题号不回顶

用户原话直接定：翻页条的题号按钮不再 `scrollTo(0, 0)`。

**H2a Next / Previous / Back 要不要回顶**

- A（推荐）：卡片底部的 Next / Previous 仍回顶，因为用户是从页面下端点的，不回顶就停在新卡的底部；只有翻页条里的题号不回顶。
- B：所有翻题都不回顶。代价：点底部的 Next 后停在上一张的位置，卡片较短时落在页面空白处。

裁决：B（用户选，推翻推荐）。`card-go` 与 `sheet-go` 一律不再 `scrollTo(0, 0)`；翻页条在卡片上方、Next 在卡片下方，两处都留在原位。

### O1 其他重复信息

证据 E5。逐项勾选，每项都是去掉重复，不加东西：

1. Papers 两个子标签下面板里的标题「Check papers」「Daily papers」，去掉。
2. Papers 列表栏的「N papers」，在没有筛选时去掉（有筛选时保留，那时它和子标签数字不同）。
3. Exercises 选了一科后小结第一行的「N exercises · N due · N mastered」中的 N exercises，去掉（due 与 mastered 保留）。
4. 设置块的标题「Settings」，去掉。
5. 做检验卷表单的两段说明并成一句。

裁决：做 1、2、3、4，不做 5。代价：都是细节，没有数据或行为变化；3 的 exercises 总数仍在子标签上。

### W 周块与梯子

用户原话直接定：

1. 统计行移到大数字右边：大数字左，右边上下两行（「questions reviewed」与统计行）。统计行去掉「practised on x of x days」，只剩「233 answers: 157 right · 8 partly · 68 wrong」。因此 `weekReview` 的 `practised`、`goalProgress` 都不再有用，随 S1 一并删。
2. 组合图去掉「Answers」「Correct」两个轴标题。读屏用的 `aria-label` 里的说明保留。
3. 梯子块去掉小标题「Ladder」；下降的题数写在右梯第 1 级「题数/百分比」之后：红色的向下箭头加数字（「↓5」），没有下降时不写；底部那行小字去掉。

### O2 其他重复或没用的信息

用户授权 agent 自行找。找到两项（证据 E6），都是纯删重复，不改行为：

- 卷子详情页：Back 并进摘要行——一行里依次是 Back、类型标签、卷名（放不下时省略号）、分数，交卷时刻写在卷名下一行小字（H1 的「一行」据此落实）。
- 两架梯子各级旁的「/百分比」去掉，只留题数（右梯第 2–4 级后面的「↑N」留）。代价：看不到各级占比的数字，但梯子本来就是用高低表达的；占比在 Exercises 的阶梯条上仍有。

### R Record 页

用户原话直接定 R1、R2：去掉顶上的说明句；去掉 Subject 下拉，一律由 AI 判断科目（`recognisePrompt` 不再给科目，让 AI 在三科里判；选已有题组补录时科目取题组的科目）。「From a saved question set」的题组列表不再按科目筛。`S.recSubject` 随之去掉。

R3：用户列的第二条里还有一句「Save for xxxx in Settings)」，Record 页代码里没有原文；agent 列出最接近的两处（Record 的 Owner 下拉；Papers 组卷表单里以 in Settings 结尾的说明），用户选「两个都去掉」。后果：Record 页不能再给别人的名下录题，新录入的错题一律归 Settings 里的 Default owner（要换人先去 Settings 改）；已有错题的归属人仍在编辑错题时可改。`S.recOwner` 去掉，`recOwner()` 直接读 Default owner。

### P 去掉卷子列表的 Delete

用户原话直接定。后果：界面上没有删卷的入口，误组的检验卷只能由 agent 用 `ArtifactData` 删；每日卷被新卷取代时的自动删除不变。`delBox`、`paper-delete` 去掉；`ask-del`、`cancel-del`、`confirmDel` 留给错题详情的删除。

---

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | S1、W1 | `app/arena.html` 纯逻辑 | `SETTINGS_DEFAULT` 与 `readSettings` 只留 `dailyLimit`、`defaultOwner`；删 `goalLines`、`goalProgress`；`weekReview(done, from, to)` 去掉 `papers`、`uid` 两个参数，返回里去掉 `practised`、`papersDone`、`topWrong`；`reviewLine` 去掉「practised on N of 7 days」，写成「233 answers: 157 right · 8 partly · 68 wrong」 |
| 2 | S1 | `app/arena.html` Today、样式 | 删 `weekGoals`、`todayBlock` 的 `goals` 参数与 `.today-goals`、`.goals` 样式；`renderPractice` 里不再算 `recent`；三处 `weekReview` 调用改新签名 |
| 3 | W1 | `app/arena.html` 周块 | `thisWeekBlock`、`lastWeekBlock`：`.rv-head` 改成左大数字、右两行（`h2`「questions reviewed」与小字统计行），单独的统计行 `<p>` 去掉；样式随改 |
| 4 | W2 | `app/arena.html` 组合图 | `activityChart` 去掉两个 `.ax-t` 与它们的样式（`.combo` 网格第一行随之去掉） |
| 5 | W3、O2 | `app/arena.html` 梯子 | 周块里梯子外的 `.sub` 与 h3「Ladder」去掉（梯子 `ladpair` 直接放在组合图下，保留与上面的分隔线）；`ladderPair`：右梯第 1 级的数字后加红色的「↓N」（`wl.down` 大于 0 时，类 `nd`，用 `--c-wrong`），删 `.lad-down` 那行；各级数字去掉「/百分比」，`ladderShares` 若别处不用则一并删；aria-label 仍写 moved down |
| 6 | S1、S2、S3、S3a、O1-4 | `app/arena.html` Settings | `renderSettings`：块标题「Settings」去掉；只留 Default owner（带一行说明）与 Questions per batch，无 Save 按钮、无目标框与周说明；块右上角小「Saved」（`S.settingsMsg`，下次改动或离开设置页清掉）；阶梯说明 `<details open>`。`change` 事件：`#set-owner`、`#set-limit` 改动即 `readSettings` 后写 `settings/{我}`、更新 `S.settings`、重画；失败走 `S.errMsg`。删 `save-settings` 点击分支 |
| 7 | S4 | `app/arena.html` | 删导出块、`exportAll`、`exportData`、`toYaml`、`yamlScalar`、`yamlKey`、`export` 点击分支、`S.exportMsg`、`boot` 对 `downloads` 的使用与 `S.downloads`，文件头注释能力去掉 `downloads` |
| 8 | H1 | `app/arena.html` 作答页 | `review` 阶段摘要压成一行：大分数 x/n、每日卷的金币（`runCoinsLine` 原样）、保存中或没保存时一个小状态，保存成功不写字；去掉「Handed in · saved」标题、对错文字与「Any you missed…」提示；还有待自评题时只留一句「Mark your written answers」 |
| 9 | H1、O2 | `app/arena.html` 卷子详情 | `renderPaperSheet`：单独的 Back 行与摘要卡合成一行（Back、类型标签、卷名、分数），交卷时刻写在卷名下一行小字；去掉「Right · Partly · Wrong」；卷已删时的返回行保持 |
| 10 | H2、H2a | `app/arena.html` | `card-go`、`sheet-go` 两个分支不再 `scrollTo(0, 0)` |
| 11 | O1-1、O1-2 | `app/arena.html` Papers | 去掉两个子标签下面板里的 h3「Check papers」「Daily papers」；检验卷列表栏的「N papers」在 `anyPF` 为假时不出 |
| 12 | O1-3 | `app/arena.html` Exercises | 小结第一行去掉 N exercises，只留 due 与 mastered |
| 13 | R1、R2、R3 | `app/arena.html` Record | `renderRecord`：去掉顶上的说明句、Subject 下拉与 Owner 下拉（`rec-go` 一行只剩 Read with AI 按钮）；去掉 `S.recSubject`、`S.recOwner`、`rec-subject` / `rec-owner` 的事件分支；`recOwner()` 读 Default owner；题组列表不再按科目筛；`recognisePrompt` 与新题组草稿的科目：非补录时由 AI 判断，补录时取题组的科目 |
| 14 | R3 | `app/arena.html` Papers | 组卷表单去掉「Questions are drawn from the default owner's … change it in Settings.」 |
| 15 | P1 | `app/arena.html` Papers | 检验卷与每日卷列表去掉 Delete 按钮；删 `delBox`、`paper-delete`；每日卷行的 `drow` 里只剩 Done 时刻 |
| 16 | S1、S4、W1 | `app/logic.test.js` | `readSettings` 断言改两个字段；删 `goalLines`、`goalProgress`、YAML、导出的断言；`weekReview` 四处调用改新签名、去掉 `practised`、`topWrong` 断言；`reviewLine` 断言改新写法 |
| 17 | S1 | `CONTEXT.md` | 删词条「Weekly goal」 |
| 18 | S1 | `DATA.md` | `settings` 表去掉 `practiceDays`、`papersPerWeek` 两行；下面一段改为「`dailyLimit` 缺字段或不是数按默认值读，超出范围收紧到范围内；`defaultOwner` 不是非空字符串时读成本人的 id。设置页改一项就写，两个字段一起写；旧文档里已有的 `practiceDays`、`papersPerWeek` 忽略，下次写入时被覆盖」 |
| 19 | S4 | `adr/0001-*.md`、`adr/0002-*.md` | 0001「代价」第一条删去，第三条运行时能力里去掉 `downloads`；0002「代价」里「导出的数据里是 id…」一条删去 |
| 20 | 全部 | 发布 | 不在本轮核销内：重新发布需要先确认；`downloads` 能力在重发时从声明里去掉 |

## 四、复审

未派独立复审者（本会话的运行规则不允许未经用户要求派 subagent），由主 agent 自查：

- 核对 `recent` 只供 `weekGoals` 用（`renderPractice` 注释写明）→ 行 2 一并删；`papersDone`、`topWrong`、`practised` 随目标句与统计行的改动不再有人用 → 行 1 去掉，`goalProgress` 整个删。用户第二次回复（W1–W3、O2 授权）后重写了核销表，重写的行 1、3、4、5、9 已按新裁决对照；第三次回复后加行 13–15，原行 13–17 顺延为 16–20。
- 术语表只有「Weekly goal」一条提到每周目标；ADR 里没有，DATA.md 两处（字段表与读写段）→ 行 17、18 已覆盖。
- 自动保存用 `change` 事件，数字框收紧后重画显示收紧值；没有新的设计选择。
- 未验证：`downloads` 能力从声明里去掉的效果，要等重发时才能确认。

## 五、核销（2026-10-30）

用户在第三轮回复后确认完整核销表（「Confirmed and proceed」）；复审一节的未验证项与第 20 行（不重发布）一并被接受。

| # | 实际改动与验证 |
|---|---|
| 1 | `app/arena.html`：`SETTINGS_DEFAULT`、`readSettings` 只留 `dailyLimit`、`defaultOwner`；删 `goalLines`、`goalProgress`；`weekReview(done, from, to)` 去掉 `practised`、`papersDone`、`topWrong`；`reviewLine` 不再写「practised on…」。`node app/logic.test.js app/arena.html` 通过 |
| 2 | 删 `weekGoals`、`todayBlock` 的 `goals` 参数、`.goals`、`.today-goals`；`renderPractice` 不再算 `recent`；两处 `weekReview` 调用改新签名 |
| 3 | 周块：大数字左、右边「questions reviewed」与统计行两行（`.rv-txt`）；本地测试壳 375 宽看过 |
| 4 | `activityChart` 去掉两个轴标题与 `.ax-t` 样式 |
| 5 | 去掉 h3「Ladder」，`ladpair` 直接放在图下并保留分隔线；右梯第 1 级数字后出红色「↓N」（测试壳里造了一道升后又退的题，看到「↓1」）；各级去掉「/百分比」，`ladderShares` 随之删；`.lad-down`、`.np` 样式删 |
| 6 | `renderSettings` 只留 Default owner 与 Questions per batch、无标题、无 Save；`change` 即存并更新 `S.settings`，块底小「Saved」，切标签清掉；数字框填 99 重画后显示 50（测试壳）；阶梯说明 `<details open>` |
| 7 | 删导出块、`exportAll`、`exportData`、`toYaml`、`yamlScalar`、`yamlKey`、`export` 分支、`S.exportMsg`、`S.downloads` 与 `boot` 对 `downloads` 的使用，文件头能力去掉 `downloads` |
| 8 | 作答页交卷后摘要一行：x/n、金币（每日卷）、保存中或没保存时小字、待自评时一句提示（测试壳走了一遍检验卷交卷） |
| 9 | 卷子详情：Back、类型标签、分数一行，卷名与交卷时刻在下一行（手机宽放不下一行，所以名字折到下一行；比核销表写的「一行」多一行，披露）；删 `.sum-head`、`.sum-txt` 样式 |
| 10 | `card-go`、`sheet-go` 不再 `scrollTo`；测试壳点翻页条题号后 `scrollY` 不变 |
| 11 | 两个 h3 标题去掉；检验卷列表栏的「N papers」仅在有筛选时出 |
| 12 | Exercises 小结第一行只留 due 与 mastered |
| 13 | Record：去掉说明句、Subject 下拉与 Owner 下拉；`S.recSubject`、`S.recOwner` 删；`recOwner()` 读 Default owner；题组列表不再按科目筛；`recognisePrompt('', …)`；`.rec-go` 只剩按钮。`subjectOptions` 仍给草稿表单用，去掉了不再用的 `withAuto` 参数（核销表没写，属于删死参数） |
| 14 | Papers 组卷表单去掉默认归属人说明 |
| 15 | 两个列表去掉 Delete；`delBox`、`paper-delete`、`.side.drow` 删；`ask-del`、`cancel-del` 留给错题详情 |
| 16 | `app/logic.test.js`：改 `readSettings`、`weekReview`、`reviewLine` 断言；删 YAML、导出、`goalProgress`、`goalLines`、`ladderShares` 断言与导出表里的名字 |
| 17 | `CONTEXT.md`：删词条 Weekly goal |
| 18 | `DATA.md`：`settings` 表去掉两行，读写段改写 |
| 19 | ADR 0001：删导出一条，运行时能力去掉 `downloads`；另按「设计文件只写现状」把第 9 行的「导出文件用页面的 `downloads`」也去掉（核销表没单列，披露）；ADR 0002：删「导出的数据里是 id」一条 |
| 20 | 不重新发布；`downloads` 能力要等下次发布时从声明里去掉 |

验证：`./check.sh` 退出码 0；`node app/logic.test.js app/arena.html` 通过；用 playwright 的本地测试壳（桩掉 `window.claude`，数据是造的）在 375 宽逐页看过 Today、Record、Papers 两个子标签、卷子详情、设置、作答与交卷，没有横向滚动。

未验证项：

- 没有用线上数据副本看；没有 `sample`，Record 页的 AI 识别没跑。
- 交卷前的提醒态在 375 宽有横向溢出（494 对 375），改动前同样如此，不是本轮引入，本轮没改。
- 独立复审未派（运行规则不允许未经用户要求派 subagent），只有主 agent 自查。
- 线上页面没有重发，网址上仍是旧版；`downloads` 能力的声明要等重发时去掉。

## 六、合并说明（2026-10-30）

落盘后推送被拒：远端 `develop` 已有 0031（照片识别提速）到 0033 与几处用户直接指示的改动。合并时改后合并的这一份的编号：本文件原为 0031，改为 0034（守则第 2 条）；文中「0031」的指称都指本文件。在远端的基础上逐处合并，与上文核销记录不同的地方：

- Record 页：远端已没有 Owner 下拉，页面上与「Save for xxxx in Settings)」对应的是一行「Saved for …（the default owner; change it in Settings）」。本轮把它去掉（核销行 13 的意图），Subject 下拉去掉；`recSubject` 删，题组列表与「共用照片的一批错题」两处的科目筛选都只在选了补录来源时按它的科目。
- 检验卷在远端改名为 Exam paper：核销行 11、14 的「Check papers」标题与说明相应是「Exam papers」「Make an exam paper」。
- 作答页交卷摘要（行 8）：远端 0033 在每日卷交卷后的摘要卡里加了两架梯子（`paperLadders`）。保留它，只去掉它的小标题「Ladder」，其余摘要压成一行。
- 梯子各级不再写百分比，`ladderShares` 没有别处用到，随之删除（0033 的 `paperLadders` 不用它）；`goalLines` 随每周目标删除。
- `DATA.md「加载」` 与 `CONTEXT.md` 里提到每周目标与导出的两句同步删去。
- 刚好有一条远端的新规则（已交每日卷满 30 天由页面删除）与行 15（去掉卷子列表的 Delete）并存：界面上不再有手动删卷入口，过期的每日卷由页面自己清。
