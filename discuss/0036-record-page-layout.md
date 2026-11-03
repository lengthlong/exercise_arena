# 0036 Record 页版面整理：去冗余、与别的页统一、控件分组

> 状态：**待落盘**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| L1 子标签的顺序与默认，「第一个子标签更重要」怎么落 | 已裁 | 用户：New photos or text 排第一、也是默认（与 0035 M3 一致；From saved material 排第二） | 二·L1 |
| L2 材料列表的科目筛选 | 已裁 | 用户：材料列表上的 All 与科目按钮全部去掉，不做科目筛选，列表只留搜索框 | 二·L2 |
| L3 翻页条放哪、「page-count」指什么 | 已裁 | 用户：参照 Papers 卷子详情页的翻页：列表上方一行紧凑页码（按宽度用省略号），列表下方左 Previous、右 Next；落实细节见 L3 | 二·L3 |
| L4 草稿区要不要分组加分隔线，按钮左右怎么排 | 已裁 | 用户：A 分组加分隔线，左放弃右确认 | 二·L4 |

## 一、目的

用户原话：「The layout of the 'Record' page is not good enough. Improve it. Some hints: 1. remove redundant elements. ( 'Record exercises', 'All', 2. align the theme with other pages. ( especially the sub-tab、pagination、 page-count ) 3. re-arrange the widgets properly, so that they provide a better user experience. ( group, divider, 'right for confirm, left for back', 'first sub-tab be more important') 4. others.」

本轮具体交付：

1. 设计：`CONTEXT.md` 与 `DATA.md` 预期不动（只改版面）。
2. 实现：`app/arena.html` 的 Record 页（两个子标签、材料列表、识别提示、草稿区的题组卡与草稿卡）与样式；纯逻辑预期不动，`app/logic.test.js` 只在有改动时改。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳里逐个状态看过（两个子标签、选了照片、选了材料、识别出草稿、保存后），桌面与 375 宽，无横向滚动。重新发布另问用户。

## 输入

- 同主题未完成讨论：无（0001–0035 均为 ✅）。
- 讨论 0035（从已存材料补录的列表与两格切换）、0008（录入页整理）、0034（去重复信息）。0035 已裁：默认停在「New photos or text」（M3）、提示框与「Read with AI」在列表之前、翻页条放在列表上方。

---

## 二、证据与选项

### 取证来源

读 `app/arena.html` 的 `renderRecord`、`draftForm`、`setForm`、`renderExercises` 的子标签与筛选行、`renderPapers` 的子标签与列表；用测试壳给 Record 页的几个状态截图（桌面 900 宽与 375 宽）。下面「别的页」指 Exercises 与 Papers。

### E1 现在 Record 页和别的页不一致的地方（读源码与截图）

- 标题：页面顶上有一行「Record exercises」，标签栏已经写着 Record。Papers 去掉过重复标题（讨论 0034 O1）。
- 子标签：Record 用的是药丸形切换 `.seg`；Exercises 与 Papers 的子标签是下划线式 `gtabs subtabs`，名字后面带灰色的数 `<span class="num muted">`。
- 科目筛选：药丸形切换里有一项「All」；Exercises 的科目子标签没有 All（讨论里去掉过），Papers 的筛选是「All subjects」下拉。
- 筛选行：Exercises 与 Papers 的筛选放在 `list-tools` 面板里，面板下半是一行 `list-bar`：左边「N exercises」，右边排序；Record 的搜索框与筛选直接裸在面板里。
- 翻页条：别的页放在列表下面，样式是「Previous、页码、Next」；Record 的放在列表上方（0035 按用户指定）。别的页的列表都没有「第几页 / 共几页」，只有页码按钮。
- 按钮左右：别的页的确认类主按钮靠左（例如 Papers 的「Preview the draw」「Create exam paper」）；Record 里「Save all」在左、「Discard all」在右；草稿卡右上角是「Discard this one」，左下角是「Save this one」。用户要的是左边返回 / 放弃、右边确认。

### E2 Record 页内部的问题（读源码与截图）

- 「Selected: …」「Choose material below」「Add them one by one, up to 5」这几句小字与按钮挤在一行或紧贴按钮，层次不清。
- 识别提示（绿或红的条）夹在「Read with AI」与搜索框之间，把「操作」和「选材料」两块隔开又不分组。
- 草稿卡（`draftForm`）是一个很长的扁平表单：科目、专题、概念、题型、作答形式、错因、所属题组、题干、选项、答案、讲解、出处依次排下去，没有分组与分隔线；题组卡（`setForm`）同样。截图里一张选择题草稿约 650 像素高。
- 草稿区的标题「To check: 1 exercise, 1 question set」带两个按钮，在窄屏上折行。

## L1 哪个子标签默认显示，「第一个子标签更重要」怎么落

用户的一句「first sub-tab be more important」有两种读法：

- A：把「From saved material」设成默认打开的子标签（它在第一格，也最常用）。这会推翻讨论 0035 M3 的裁决（用户当时选「始终停在 New photos or text」）。
- B：保持默认不变，只在版面上让第一个子标签更突出：排第一、带数字（材料份数），内容区更靠前；不动默认。

推荐 A：用户已说它是录入时用得最多的功能，「更重要」与默认一致最简单；代价是推翻 M3。这是用户自己的裁决，所以交用户重裁。

裁决：用户选了第三种，原话「'new photos or text' be the first tab and be default.」：New photos or text 排第一并作默认（M3 不变），From saved material 排第二。

## L2 材料列表的科目筛选没有「All」后怎么选

- A（推荐）：三个科目按钮（English、Math、Science）都是开关，点一下只看这一科，再点一下取消；一个都没选就是全部。没有「All」。
- B：改成与 Papers 一致的下拉「All subjects」。代价：多点一下，窄屏上下拉与搜索框各占一行。

推荐 A：材料通常只有几十份，一点就筛，不需要「All」。

裁决：用户选了第三种，原话「remove all the tabs/buttons for the material list.」：材料列表上的 All 与科目按钮一并去掉，不做科目筛选；卡片上仍显示科目标签，搜索框保留（搜索不是按钮或标签）。

## L3 翻页条放哪、「page-count」指什么

别的页的翻页条在列表下面，没有页数文字；用户要求与别的页一致，同时 0035 里他指定 Record 的翻页条在列表上方。「page-count」我读不出确切所指，有两种可能：子标签后的数字（别的页有）、列表上方「N exercises」那一行的数。

- A（推荐）：翻页条改到列表下面（与别的页一致，推翻 0035 里「在列表上方」）；列表上方加一行 `list-bar`：左边「N materials」（筛选时是匹配数），子标签「From saved material」后面带总份数。
- B：翻页条仍在列表上方，其余同 A。代价：和别的页不一致，列表很长时翻页要滚回顶部。

推荐 A：用户这次明确要求统一；翻页到下面后点完页码不必滚回去，只需要滚到列表顶（5 张一页，一屏内）。

裁决：用户选了第三种，原话「refer to the pagination of the 'paper detail' page」。读源码：Papers 卷子详情页的翻页是 `cardPager`（卡片上方一行紧凑页码，放不下时用 `pagerSlots` 加省略号，当前页 `aria-pressed`）加 `cardNav`（卡片下方，左「← Previous」、右「Next →」；第一张的左边换成「‹ Back」，最后一张的 Next 变灰）。落实：材料列表上方一行紧凑页码，下方左 Previous、右 Next；只有一页时两者都不显示。材料列表没有「Back」，第 1 页的 Previous 与最后一页的 Next 变灰。「page-count」按这页的做法理解为这一行页码，不再加「N materials」；子标签后的数字（Exercises 与 Papers 的子标签都有）加在 From saved material 后，作材料份数（落实时的小细节，核销表请用户确认）。

## L4 草稿区要不要分组加分隔线，按钮左右怎么排

- A（推荐）：
  - 草稿卡里分成几组，组间一条细分隔线，每组一个小标题（沿用 `.h3` 小标题样式）：Classify（科目、专题、概念、题型、错因）、Question（所属题组、作答形式、题干、选项）、Answer（答案、当时的回答、必用词）、Explain（讲解、出处）。题组卡同理：Basics（科目、标题、出处）、Material（材料文字、词表、照片）。
  - 按钮：每张草稿卡右上角的「Discard this one」移到卡片底部，放在左边，「Save this one」在右边；草稿区标题行里「Discard all」在左、「Save all」在右；「Read with AI」在右，「Stop」在它左边。
  - 去掉卡片里的「Draft」「Question set draft」小标题（卡片本身已经是草稿区的内容）。
- B：只调按钮左右，不分组。代价：长表单还是一长条，用户提的「group、divider」没做。

推荐 A：直接对应用户提的分组、分隔线与「左返回右确认」。

裁决：A（用户，2026-11-03）。

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | L2 | `app/logic.test.js`（先改断言）与 `app/arena.html` 的 `LOGIC:BEGIN…END` | `matchMaterial(item, query)` 去掉第三个参数（科目筛选）与相关断言（`matchMaterial(m, q, 'math')` 一类）；搜索规则不变（label、出处、材料文字去记号、题干，不分大小写）；`savedMaterials` 不动 |
| 2 | L1 | `app/arena.html` | 去掉页顶的「Record exercises」标题。两个子标签改成与 Exercises、Papers 同款的下划线式 `<nav class="gtabs subtabs" role="tablist">`（`aria-selected`），放在面板上方，顺序：「New photos or text」（第一个、默认，`recMode` 默认值与进入 Record 页时重置为 `'new'` 不变）、「From saved material」；后者名字后带灰色的材料份数（`<span class="num muted">`，取 `savedMaterials` 的长度）。识别中两个子标签禁用。药丸形切换及样式 `.rec-seg` 去掉 |
| 3 | L2、L3 | `app/arena.html` | From saved material 子标签里：去掉科目按钮与「All」（`mat-subj` 动作、`S.matSubject`、`resetRecMode` 里对应一项）；搜索框保留；去掉「Choose material below」提示（没选材料时按钮灰着即可）；列表翻页参照 Papers 卷子详情页：另写一个小函数（不改 `cardPager`、`cardNav`，免得波及作答页与详情页），沿用它们的样式 class：列表上方一行紧凑页码（`cardpager`、`pg-n`，当前页 `aria-pressed`，`title` 写「Page n」，页码从 1 起），位置数 `max` 按 `pagerSlots` 在窄屏用省略号，估算时在 `cardPager` 的可用宽度上再减去面板的内边距与边框 26 px，免得 375 宽下页码条越出面板；列表下方 `card-nav`：左「← Previous」、右「Next →」，第 1 页的 Previous 与最后一页的 Next 变灰；只有一页时页码与 `card-nav` 都不显示；原来的 `pager` 翻页条去掉；每页仍 5 张，点翻页不滚回顶部 |
| 4 | L4、「分组、分隔线、左返回右确认」 | `app/arena.html` | 动作区（两个子标签通用）：一行，左边是状态文字（From saved material 选了材料时写「Selected: 标题」，其余为空），右边依次是「Stop」（只在识别中出现）与主按钮「Read with AI」，即 Stop 在左、Read with AI 在右；识别提示条在这一行下面。New photos or text：照片组（两个大按钮、说明、缩略图）、分隔线、文字组（文字框）、分隔线、动作区，同在一个面板里。From saved material：提示框与动作区为一组，分隔线，搜索框、页码、列表、`card-nav` 为一组，同在一个面板里；识别提示条仍在动作区下面（0035 定的「提示框、按钮、列表」顺序不变） |
| 5 | L4 | `app/arena.html` | 草稿区：标题行「To check: …」单独一行；其下一行：左「Discard all」（ghost）、右「Save all」（primary）。草稿卡（`draftForm`）：新草稿去掉「Draft」小标题与右上角的「Discard this one」（编辑已有错题时仍有「Edit exercise」标题，改用 `.h2` 样式，与组标题 `.h3` 分出层次）；字段按四组排，组间一条细分隔线，每组一个 `.h3` 小标题：Classify（科目、专题、概念、题型、错因）、Question（所属题组、作答形式、题干、题目照片、选择题的选项与「Add an option」「Remove the last one」）、Answer（答案，含选择题的正确选项与当时选的、选词题的正确词与当时填的及缺词表时的红字提示、短答题的其他可接受答案与当时的回答、主观题的参考答案、当时的回答与必用词）、Explain（讲解、出处）；错误提示 `d.error` 放在底部按钮行之上；底部一行：新草稿左「Discard this one」、右「Save this one」，编辑时左「Cancel」、右「Save changes」。题组卡（`setForm`）：新题组去掉「Question set draft」小标题与右上角的「Discard set」；已部分保存的题组仍写「Question set (saved)」，编辑时仍写「Edit question set」（`.h2`）；分 Basics（科目、标题、出处）与 Material（材料文字、词表、照片）两组，组间分隔线加 `.h3` 小标题；「No questions belong to this set yet…」提示与 `sd.error` 在底部按钮行之上；底部一行：新题组与已部分保存的题组左「Discard set」（行为不变，仍可放弃），编辑时左「Cancel」、右「Save set」。字段、校验、保存规则不变。影响面：`draftForm` 与 `setForm` 的编辑态也在 Exercises 的详情页里用，所以那里的编辑页也随之改成左 Cancel、右 Save；Exercises 与 Papers 其余页面的按钮不动（Papers 组卷表单的「Preview the draw」「Create exam paper」仍在左，另开一轮再统一）。「动作区」「Stop 在左、Read with AI 在右」见第 4 行 |
| 6 | —— | `CONTEXT.md`、`DATA.md` | 不改：只改版面，没有新概念与新字段 |
| 7 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳逐个状态检查并截图（桌面 900、窄屏 375）：两个子标签的外观与 Exercises、Papers 一致；默认在第一个子标签；没有「Record exercises」「All」与科目按钮；新照片状态（未选、选了照片、满 5 张）；已存材料状态（没材料、有材料没选、选了、多页翻页与省略号、搜索）；识别中（Stop 在左、Read with AI 在右、子标签禁用）；识别出题组与草稿后（标题行、Discard all 左 / Save all 右、分组与分隔线、各卡底部 Discard 左 / Save 右）；Exercises 里编辑一道错题（Cancel 左 / Save changes 右，字段分组）；保存单题与全部保存、放弃仍可用；375 宽无横向滚动。重新发布：另问用户 |

## 四、复审

独立复审（新上下文 subagent，2026-11-03）交回主报告与 F1–F5，主 agent 对照源码核验：

- F1（`cardPager`、`cardNav` 不能原样复用：`data-v` 从 0 起而材料页码从 1 起；面板内按原公式取 `max`，在 375 宽下页码条越出面板约 4 px；L3 对详情页「两端变灰」的描述有误，第一张卡是「Back」）：成立。第 3 行改为另写小函数、沿用 class、`max` 再减 26 px；L3 里的描述更正。机械修补。
- F2（共用的 `draftForm`、`setForm` 编辑态在 Exercises 里用，改成右确认会波及；Papers 主按钮仍在左）：成立。这是影响面，不是新的设计选择：第 5 行写明，并列进待确认清单。
- F3（已部分保存题组的「Discard set」去留与位置没写）：成立，第 5 行写「行为不变，左边」。
- F4（增删选项按钮、选词缺词表提示、错误提示、「No questions belong…」没归组；「Edit exercise」与组标题同为 `.h3`）：成立，第 5 行逐项写明归属，编辑标题改用 `.h2`。
- F5（隐含的小决定没列出）：第 3 行与下面的「待确认清单」列出。
- 复审的「更好的方案」（另写页码函数，不改共用函数）：采纳，落进第 3 行，属实现层选择，不改裁决。
- 复审指出翻页不滚回顶部时视线会停在新一页末尾，卷子详情页同样不滚，所以一致，不再另议。

## 待确认清单（请用户在确认核销表时一并看）

1. 「page-count」理解为那一行页码，不再加「N materials」；From saved material 后面带材料份数。
2. Stop 在左、Read with AI 在右。
3. 只有一页时不显示页码与上一页 / 下一页；第 1 页的 Previous 变灰（不是「Back」）。
4. 去掉「Choose material below」。
5. Exercises 的编辑页随之改成左 Cancel、右 Save；Papers 的按钮不动，另开一轮。
