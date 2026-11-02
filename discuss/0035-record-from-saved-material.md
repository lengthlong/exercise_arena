# 0035 录入页「从已存材料录入」好找、好用

> 状态：**讨论中**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| M1 怎样挑已存材料：改成带缩略图、搜索、科目筛选、最近优先的卡片列表，还是只改下拉框 | 已裁 | 用户：A 卡片列表；列表与搜索框不放在 Record 页上，点「From saved material」才在新的对话框里显示 | 二·M1 |
| M2 Record 页上「From saved material」放哪、选中后页面怎样变 | 已裁 | 用户：B 两格切换「From saved material」|「New photos or text」；为合并用户另一句「点 From saved material 才显示列表」，点中第一格且还没选材料时直接打开对话框（见 M2 正文，核销表里请用户确认） | 二·M2 |
| M3 打开 Record 页默认停在哪一格 | 已裁 | 用户：C 始终停在「New photos or text」（推翻推荐 A） | 二·M3 |

## 一、目的

用户原话：「improve the 'record' page, the feature of 'From saved material' is not user-friendly: 1. it is the most used feature when 'recording'. 2. when recording 'from saved material', it's very difficult to find the right material.」

本轮具体交付：

1. 设计：`CONTEXT.md` 的「录入」词条若因此要改则改；`DATA.md` 预期不动（材料列表现算、不存）。
2. 实现：`app/arena.html` 的 Record 页「From saved material」一块；挑选与排序的规则写成纯函数，断言进 `app/logic.test.js`。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳里走通：挑一份材料、搜索、按科目筛选、换一份、改回新照片或文字、375 宽无横向滚动。重新发布不在本轮，留给用户决定。

## 输入

- 同主题未完成讨论：无（0001–0034 均为 ✅）。
- 讨论 0008（Record 页整理）、0031（按照片补录，Q7 定下补录来源有两类）、0034（R1、R2：Record 页去掉说明句与科目下拉）。

---

## 二、证据与选项

### 取证来源

读 `app/arena.html` 的 `renderRecord`、`recSource`、`recogniseMore`，纯函数 `photoGroups`（`app/logic.test.js` 里有断言），`DATA.md` 的 `sets` 与错题字段，`CONTEXT.md` 的「录入」词条。没有真实数据，下面关于「难找」的判断来自代码里列表怎么生成，不是实测；用户已说明确实难找。

### E1 现在怎么挑（读源码）

- 补录来源有两类：已录题组（`sets`，有错题指向它），与一批共用同一组照片、没有题组的独立题（`photoGroups`，现算）。
- 两类混在**一个原生下拉框**里，第一项是「— New photos or text」。每一项只有一行文字：题组是「科目 · 标题 · n recorded」，照片批次是「科目 · Photos · 出处或第一道题前 30 个字 · n recorded」。
- 排序：所有题组在前（按题组 `createdAt` 新到旧，同日按标题），所有照片批次在后（按批里最后一道题的录入时刻新到旧）。两类不交叉。
- 没有缩略图、没有搜索、没有科目筛选；选中之前科目只是每项开头的文字前缀，选中后列表只留同科目的。下拉项很多时只能滚。
- 没标题的题组显示「Untitled」，没出处的照片批次也可能显示第一道题的开头或「Untitled」；材料照片与材料文字在列表里都看不到，选了之后才在页面上出现（照片批次会显示缩略图）。

### E2 为什么难找（推断，依据 E1，确定程度：中高）

- 用户认的是「那篇文章、那张试卷的样子」，列表里只有标题和数字：标题常空，「n recorded」对认材料没帮助。
- 排序按题组的创建日期，而用户最常补录的多半是刚录过的那份：一份上周创建、昨天刚补录过一题的题组，排在今天新建的题组之后；照片批次则不论多新，一律排在所有题组之后。
- 两类放在一起又不交叉，用户得先知道它是哪一类才知道往哪段找。
- 未知：用户平均有多少份材料、怎样记它（按试卷名、按日期、还是按样子）。

### E3 术语与数据的约束（读源码与设计）

- 术语表没有专门的词指「题组或照片批次」的合称；页面文字用「saved material」。「概念从严」：不为这次改动新造术语表词条。
- 列表里要显示的每一项信息（科目、标题、出处、材料首张照片、材料文字开头、已录题数、最近录入时刻）题组与错题上都已有，不需要新字段；「最近录入时刻」取组里错题 `recordedAt` 的最大值（旧错题没有 `recordedAt`，退回 `createdAt`，页面里已有 `recordedKey`）。

## M1 怎样挑已存材料

- A（推荐）：把下拉框换成一块**卡片列表**。
  - 两类合成一个列表，按「最近录入」新到旧排（用户最常补录刚录过的）。
  - 每张卡：左边材料首张照片的缩略图（没照片时是材料文字开头的几行）；右边科目标签、标题或出处（都没有时用第一道题的开头）、「n recorded · 最近录入 15 Oct」；照片批次比题组多一个小标签「Photos」。
  - 列表上方一个搜索框（匹配标题、出处、材料文字、已录各题题干）与科目筛选（All / English / Math / Science，默认 All）。
  - 列表默认只露出最近几张，「Show all」展开全部（具体个数留给实现定，按手机一屏）；搜索或筛选时直接列出匹配的。
  - 点一张卡就选中；选中后列表收成这一张卡加「Change」，下面是给 AI 的提示框与「Read with AI」。
  - 用户追加：列表与搜索框不常驻在 Record 页上，点「From saved material」时才在一个新的对话框（或新页面）里显示；选中后对话框关闭，回到 Record 页。
  - 代价：多一块界面与几个纯函数（排序、搜索匹配），Record 页在手机上更长一些。
- B：保留下拉框，只改项目文字与排序：两类合并、按最近录入排、每项写成「科目 · 标题或出处 · n recorded · 15 Oct」。
  - 代价：仍没有缩略图、没有搜索；材料很多时下拉框依旧长，认不出样子的问题没解决。改动最小。

推荐 A：用户的两条诉求都落在「认出那份材料」上，缩略图与搜索直接解决；B 只能缓解。

裁决：A，并追加「列表与搜索框在点『From saved material』后的对话框里显示」（用户，2026-11-02）。

## M2 Record 页上「From saved material」放哪、选中后页面怎样变

M1 已定：材料列表在点「From saved material」后的对话框里。现在 Record 页的下拉框占着页面最上一行，下面是拍照 / 选照片与文字框。

- A（推荐）：页面最上方一个整行的大按钮「From saved material」（旁边小字「add more questions from a set or photos you already recorded」类的一句说明留给实现），紧接着现有的拍照 / 选照片与文字框，两者同时在页面上，互不切换。
  - 点大按钮打开对话框，挑一张卡后对话框关闭：拍照区与文字框收起，页面上只剩那张已选材料的卡（缩略图、标题、已录几题）加「Change」「Clear」，下面是给 AI 的提示框与「Read with AI」。「Clear」回到拍照与文字。
  - 没有任何已存材料时，大按钮禁用并写明「Nothing saved yet」。
  - 代价：页面比现在多一个大按钮；没有切换控件，概念最少。
- B：页面顶部放两格切换「From saved material」|「New photos or text」，选第一格才出现一个「Choose material」按钮，再开对话框。
  - 代价：同样的事多点一次，多一个控件；对最常用的操作路径变长。

推荐 A：已存材料最常用，一次点击就进选择；沿用现在「选了材料就不拍照」的行为，不加新模式。

裁决：B（用户，2026-11-02）。落实时的一处合并（推断，待核销表确认）：用户另说「点 From saved material 才显示列表」，所以点中第一格、且还没选材料时，对话框直接打开，不再要额外的「Choose material」按钮；已选材料时第一格下显示那张卡加「Change」（再开对话框）。选了材料后第二格仍可点，点了就清掉所选材料。

## M3 打开 Record 页默认停在哪一格

- A（推荐）：有已存材料时停在「From saved material」，没有时停在「New photos or text」；不记上次的选择。但停在第一格不自动弹出对话框，页面上是一个「Choose material」按钮，免得一进页面就被盖住。
  - 代价：想拍新照片的人要点一下第二格。
- B：记住上次选的一格，下次打开沿用（存在浏览器本地，换设备不带过去）。代价：多一份本地状态，行为取决于上次。
- C：始终停在「New photos or text」。代价：最常用的一种要多点一下。

推荐 A：最简单，让最常用的成为默认，不新增本地状态。

裁决：C（用户，2026-11-02，推翻推荐）。每次打开 Record 页都停在第二格。

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | M1、M2、M3 | `app/logic.test.js`（先写断言）与 `app/arena.html` 的 `LOGIC:BEGIN…END` | 新增纯函数 `savedMaterials(sets, exercises)`：把有错题指向的题组与 `photoGroups` 合成一个列表，每项含 `id`（题组 id，或 `photos:`＋批 key，与现在 `S.recSet` 的取值相同）、`kind`（`set` 或 `photos`）、`subject`、`title`、`source`、`text`、`images`、`ids`（已录错题 id）、`last`（组内错题 `recordedKey` 的最大值）、`label`（标题，没有用出处，再没有用第一道已录题题干的前 40 个字，都没有写 Untitled）；按 `last` 新到旧排，相同按 `id`。新增 `matchMaterial(item, query, subject)`：科目为空表示全部；`query` 去首尾空白后为空表示全部匹配，否则不分大小写，在 `label`、`source`、`text`、各已录题题干里找子串。两函数加进 `app/logic.test.js` 第 5 行导出列表并写断言（合并与排序、题组与照片批次交叉、`last` 取组内最大、`label` 的退路、搜索命中各字段、科目筛选、空列表）。`photoGroups` 与其断言不动 |
| 2 | M1 | `app/arena.html` | 新增对话框（`<dialog>`，`showModal`；手机上占满宽、内容可滚、有「Close」）：顶部搜索框与科目筛选（All / English / Math / Science，默认 All）；列表是卡片，每张含首张材料照片缩略图（没有照片用材料文字开头约 60 个字）、科目标签、`label`、「n recorded · 最近录入 15 Oct」，照片批次另有「Photos」小标签；无搜索无筛选时只列前 5 张，下面「Show all (n)」展开全部，有搜索或筛选时列出全部匹配；没有已存材料写「Nothing saved yet」，匹配为空写「No match」。点一张卡：设 `S.recSet` 为该项 `id`、清空 `recText`、关闭对话框。搜索词、科目筛选、展开状态只在对话框内存在，每次打开重置，不存库、不存本地 |
| 3 | M2、M3 | `app/arena.html` | Record 页最上方两格切换「From saved material」\|「New photos or text」，新状态 `S.recMode`（`'new'` 或 `'saved'`），每次进入页面为 `'new'`，不记上次。点第二格：`recMode='new'`，清掉 `S.recSet`。点第一格：`recMode='saved'`；还没选材料就直接打开对话框，对话框被关掉没选时页面停在第一格，显示「Choose material」按钮。第一格下选了材料后，拍照区与文字框收起，显示那张卡（同对话框里的卡，不含搜索）加「Change」（再开对话框）与现有的「Hint for AI (optional)」文本框与「Read with AI」；`recognise` 仍按 `S.recSet` 是否非空选 `recogniseMore`。识别中（`recBusy` 或 `recPrep`）两格与「Change」都禁用。去掉下拉框 `rec-set` 及其 `change` 分支；`recSource` 里「找不到就清掉 `S.recSet`」的行为保留 |
| 4 | M1、M2 | `CONTEXT.md` | 不改：「录入」词条已写「也可以选一个已有题组，或一批已录独立题共用的照片，由 AI 按提示补录还没录的题」，不涉及挑选的界面 |
| 5 | M1 | `DATA.md` | 不改：列表现算、不存；`last` 取已有字段 `recordedAt`（旧错题退回 `createdAt`），没有新字段 |
| 6 | —— | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳（Playwright 的 Chromium，模拟 `window.claude`、内存 `db`，造 12 份以上材料：题组与照片批次、三个科目、有与没有标题）走通：默认停在第二格；点第一格弹出对话框且最近录入的在最前、题组与照片批次交叉；搜索（标题、出处、材料文字、题干各命中一例）与科目筛选；「Show all」；点卡后对话框关闭、拍照区收起、卡与「Change」出现；「Change」换一份；点第二格清掉所选；对话框关掉没选时的「Choose material」按钮；没有材料时的「Nothing saved yet」；识别中控件禁用；375 宽对话框与页面无横向滚动。真实 `sample` 的补录、真机触屏、重新发布：不在本轮，重新发布另问用户 |
