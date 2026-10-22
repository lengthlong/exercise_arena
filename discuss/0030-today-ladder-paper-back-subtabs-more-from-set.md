# 0030 Today 的本周目标、阶梯图与升级；作答页的返回；材料折叠沿用；从已有题组再找题；Exercises 与 Papers 分子标签

> 状态：**讨论中（2026-10-22）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 This week 的句子怎样改 | 已裁 | A 的鼓励句；另按用户补充：Next 7 days 改为 This week、Last 7 days 改为 Last week，都按日历周（周一到周日），都用 Last 7 days 那种组合图 | 二·D1 |
| D1a This week 的图怎样画还没到的天、目标句放哪 | 已裁 | A：今天之前与今天画实际作答，今天上面与以后各天画虚线的计划柱；目标句放图下，不另画圆点 | 二·D1 |
| D2 Ladders 画成什么样的梯子 | 已裁 | A：竖梯五级；另按用户补充：This week 与 Last week 各画两架梯子（左为周初、右为周末或此刻），之间播放爬升动画 | 二·D2 |
| D2a 独立的 Ladders 一块还留不留 | 已裁 | A：去掉；This week 的右梯就是此刻的阶梯 | 二·D2 |
| D2b 两架梯子怎样数、怎样动 | 已裁 | A：周内新录的题算在左梯第 1 级（标「+N new」），只给升级的题播动画，退回的只写一行；另按用户补充：周初已掌握的题不放进左梯（周末仍掌握的），标「N mastered」；图下一行写升到各级的题数 | 二·D2 |
| D3 「moved up」放在哪、要不要动画 | 已裁 | A 的位置（从 Last 7 days 拿掉），动画用 D2 的两架梯子 | 二·D3 |
| D4 作答页与卷子详情的返回按钮 | 已裁 | A 的位置与改名；离开不确认 | 二·D4 |
| D4a 离开后作答怎样保留 | 已裁 | 用户原话：只存每日卷，直接存在卷子上（不另设 drafts）；检验卷不存 | 二·D4 |
| D5 照片与材料的展开状态沿用到同材料的下一题 | 已裁 | 用户原话直接定 | 二·D5 |
| D6 Record 能否选已有题组让 AI 再找题 | 已裁 | A：Record 页选题组，再写提示，点 Read with AI | 二·D6 |
| D6a 再找题时找哪些题 | 已裁 | B：没录的都可以起草，用户可写提示指定哪些 | 二·D6 |
| D6b 当时没做错的题，错因怎样填 | 已裁 | B：AI 照样猜一个错因 | 二·D6 |
| D7 Exercises 按科目分子标签 | 已裁 | A | 二·D7 |
| D8 Exercises 每科小结写什么 | 已裁 | A：专题图加两列小榜 | 二·D8 |
| D9 Papers 分 Daily 与 Check 两个子标签 | 已裁 | A | 二·D9 |
| D10 每日卷只列最近 7 天 | 已裁 | A：默认最近 7 天，底下「Show older (N)」 | 二·D10 |
| D11 每日卷按天分组（agent 提议） | 已裁 | A | 二·D11 |

## 目的

用户原话：「Improve the app's UI and UX. Some hints: 1. for Today page: 1. the sentences in 'NEXT 7 DAYS-THIS WEEK' is not encouraging. improve it or remove it. 2. the diagram in 'LADDERS', it does not look like a ladder. improve it. 3. the 'xxx move up' in 'LAST 7 DAYS' is not clear. Should we use an animation to show the 'move up'? should this animation be shown under 'LADDERS'? 2. for Paper Detail page: 1. the position of the stop button is not intuitive. should we move it to the top left corner of the page? (and rename it to 'back', like most of the Apple apps do?) Also, should we change the 'previous' button to 'back' in the first question page? 2. the 'images' and the 'material' should keep as it was(folded or expanded) for the next question with the same 'images' and 'material'. 3. for Record page: 1. Can I select a existing material and ask AI to extract other questions from it? 4. for Exercises page: 1. should we show the subjects as sub-tabs? 2. for the summary for each subject, can we make it more meaningful. (like, show the topics that the user improved and need to work more on, etc. use more diagrams.) 5. for 'Papers' page: 1. should we show 'daily' and 'examine' as sub-tabs? 2. for 'daily' papers, should we show only the ones in recent 7 days? 6. other improvements you can think of.」

用户说的「Paper Detail page」有 Stop 按钮，即作答页（`renderPaperRun`）；卷子详情（View details，`renderPaperSheet`）一并按同一规则处理。「examine」卷即术语表的 Check paper（检验卷）。「material」即题组材料，「images」即照片。

本轮具体交付：

1. 实现：`app/arena.html` 的 Today、作答页、卷子详情、Record、Exercises、Papers；新规则写成纯函数，断言写进 `app/logic.test.js`。
2. 重新发布到原网址。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳用 10-22 读出的线上数据副本以 Sophia 逐页看过，符合裁决；375 宽看一次，没有横向滚动；发布后读回线上页面核对。

## 输入

- 同主题未完成讨论：无（0001–0029 均为 ✅）。
- 0019（已完成）：Ladders 改环形图；Exercises 每科小卡；卷子列表的类型标签、Kind 等四个筛选。本轮 D2、D8、D9 改它们。
- 0024（已完成）：作答页最后一张卡的 Next 换成 Hand in。

---

## 一、证据

以下数字取自 2026-10-22 从线上 `db` 读出的副本：302 道错题（英文 288、科学 14），归属人都是 Sophia；49 个题组，都有照片；107 张卷。按 Sophia 的视图算。

### E1 This week（`planBlock`）

两行，前面一个圈或勾：「Practise on 6 days: 3/6」；「Check papers: 0/1 — try one on Vocabulary & collocations」（`paperTry`）。只说差多少，没有夸做到的；周三时 3/6 读起来像落后。

### E2 Ladders（`progressBlock`）

环形图加五行图例：1st redo (day 1) 152 · 50%、2nd redo (day 3) 135 · 45%、3rd redo (day 7) 15 · 5%、4th 0、Mastered 0；环心「302 questions」。环形图看不出「一级一级往上爬」。

### E3 Last 7 days 的统计行（`reviewLine`）

「233 answers: 157 right · 8 partly · 68 wrong · 147 moved up · practised on 6 of 7 days」。「147 moved up」是最近 7 天做对而升了一级的题数（`weekReview.moved`，按题去重），没说升到哪、从哪升。按次数拆开：升到 2nd redo 142 次、到 3rd 15 次、到 4th 0、掌握 0；做错退回 1st 的 5 次。

### E4 作答页与卷子详情的返回

- 作答页（`renderPaperRun`）顶上一行：类型与科目标签、卷名，右边「Hand in」与一个小的「Stop」。Stop 直接退出（`exit-run`），没交的作答全部丢掉，不确认。交卷后 Stop 不见，摘要卡右上角是「← Back to today」。
- 卷子详情（`renderPaperSheet`）：摘要卡右上角「← Back to papers」。
- 两处卡片底部：左「← Previous」、右「Next →」；第一张的 Previous 不可点（`cardNav`）。

### E5 材料与照片的展开状态

- 材料（`materialBlock`）是 `<details>`：作答页默认收起，详情页默认展开；展开或收起记在 `S.run.openSets` / `S.paperOpenSets`，翻到同组下一题时沿用。
- 照片（`photosBlock`，「Show photo (n)」）也是 `<details>`，默认收起，不记状态：材料里的照片、题目自己的照片，翻一题就又收起。49 个题组都有照片；70 道错题自带照片。

### E6 Record（`renderRecord`、`recognise`）

只能拍照或贴文字，从头识别；识别结果里的题组都是新题组。草稿可以挂到已有题组（`setRef` 为已有题组 id，Exercises 编辑时已在用）。`sample` 的 `images` 接受 `Blob[]`（运行时契约 0.2.89 文档）；已有题组的照片是 asset id，页面能用 `/_blob/<id>` 取到（`<img>` 已这样用），用 `fetch` 取成 Blob 未实测。

### E7 Exercises 的每科小结（`subjectCards`）

每科一张卡：「English · 288」、阶梯横条、「269 due · 0 mastered · wrong 1.3× on average」、前三专题按题数、错因计数。点卡按科筛选；Subject 也在筛选下拉里。说的都是存量，没有「哪里在进步、哪里还要练」。Sophia 英文各专题最近 7 天（作答 ≥5 次的）：

| 专题 | 题数 | 7 天作答 | 做对 | 正确率 | 升级次数 |
|---|---|---|---|---|---|
| Vocabulary & collocations | 108 | 68 | 46 | 68% | 46 |
| Prepositions | 42 | 29 | 21 | 72% | 21 |
| Spelling | 20 | 14 | 10 | 71% | 10 |
| Gerunds, infinitives & modals | 16 | 13 | 10 | 77% | 10 |
| Tenses | 17 | 14 | 9 | 64% | 9 |
| Connectors | 17 | 11 | 7 | 64% | 7 |
| Synthesis & transformation | 14 | 10 | 5 | 50% | 5 |
| Pronouns | 11 | 9 | 6 | 67% | 6 |
| Nouns & articles | 10 | 6 | 4 | 67% | 4 |
| Adjectives & adverbs | 10 | 7 | 4 | 57% | 4 |
| Subject-verb agreement | 8 | 7 | 4 | 57% | 4 |

升级次数基本跟题数走，不能说明进步；正确率能分出强弱。

### E8 Papers（`renderPapers`）

上面「Make a check paper」，下面一个列表混列两种卷，靠 Kind 筛选与类型标签区分。Sophia 能看到 28 张：检验卷 2 张、每日卷 26 张（她交过的才列，`visiblePapers`），其中 25 张是最近 7 天的；每天每科交一张就多一张，一个月约 100 张。每日卷都是她交过的，Status 筛选对它没有意义；Owner 都是 Sophia。

---

## 二、逐题

### D1 This week 的句子怎样改

证据：E1。

- A（推荐）**改成一条本周日历加一句鼓励的话。** 周一到周日 7 个小圆点，有作答的那天实心打勾，今天描边；右边一句按情况换：达标「🎉 6 practice days — goal reached!」；还来得及「3 days done — 3 more to reach 6. Keep going!」；本周剩下的天不够了「3 days done this week — every day counts!」。检验卷一行：做够了「✓ Check paper done — nice work!」，没做「A check paper shows what you've mastered — try Vocabulary & collocations.」。代价：多一个出句子的纯函数与断言，取代 `paperTry`。
- B **删掉 This week。** 代价：每周目标在页面上就看不到了，Settings 里的两个目标设置失去作用，要一起删或另找地方显示。

**裁决（2026-10-22）：A，并改两个区。** 用户原话：「A. Change 'NEXT 7 DAYS' to 'THIS WEEK' and change 'LAST 7 DAYS' to 'LAST WEEK'. And use the same kind diagram as 'LAST 7 DAYS' for both weeks.」Next 7 days 改名 This week，按本周一到周日；Last 7 days 改名 Last week，按上周一到周日；两块都用 Last 7 days 现在的组合图（叠柱加正确率线）。

D1a This week 的图怎样画还没到的天（依赖 D1）：

- A（推荐）**虚线计划柱。** 周一到今天画实际作答的叠柱与正确率线；今天那一列在实际柱上再叠一段虚线空心柱，写此刻还到期的题数；今天以后各天画虚线空心柱，写按全对推算的计划题数（同现在的 Next 7 days）。图例加「Planned」。A 的目标句（如「3 days done — 3 more to reach 6. Keep going!」）放在图下，不另画周历圆点（图已经看得出哪天练过）。代价：周六起只看得到本周剩下的一两天。
- B **以后各天只写数字「20 planned」，不画柱。**

**裁决（2026-10-22）：A。**

本轮跟着变的（D1 的机械落实）：最近 7 天滚动统计只留给 Today 的两句提示（「Read the Key idea again…」与检验卷建议的专题）；Last week 的问候数字、统计行、组合图与 Newly mastered 都按上周一到周日；Exercises 的「最近 7 天正确率」（D8）照旧滚动 7 天。

### D2 Ladders 画成什么样的梯子

证据：E2。

- A（推荐）**竖着的一架梯子，自下而上五级。** 两根竖杆、五根横档：最下 1st redo，往上 2nd、3rd、4th，最上 Mastered（★，绿色）。每根横档右边：级名与间隔（「2nd redo · day 3」）、题数、百分比，和一条按题数比例的横条（颜色沿用现在的蓝阶与绿）。总题数写在梯子顶上「302 questions on the ladder」。题数为 0 的级照画横档、横条为空。代价：环形图换掉；梯子比环形图高约 60px。
- B **楼梯（台阶自左向右升高）**，每级台阶上写题数。代价：是台阶不是梯子；五级在窄屏上每级很窄，题数挤。

**裁决（2026-10-22）：A，并在两周里各加两架梯子。** 用户原话：「A. And add 'Ladder' diagram to 'THIS WEEK' and 'LAST WEEK'. for the diagram, we draw two ladders, one the left is a ladder for the first day of the week, on the right is a ladder for the last day of the week(today for this week). And we play a animation between these two ladders to show how many questions climbed up.」

D2a 独立的 Ladders 一块还留不留（依赖 D2）：A（推荐）去掉，Today 只剩 Today、This week、Last week 三块，This week 的右梯（带题数与百分比）就是此刻的阶梯；B 留在最下面，与 This week 的右梯重复。

**裁决（2026-10-22）：A。**

D2b 两架梯子怎样数、怎样动（依赖 D2）。本周（10-19 周一到此刻）的例子：周初 268 道，之后新录 34 道；1st→2nd 83 道、2nd→3rd 10 道、2nd→1st 3 道。

- A（推荐）**周内新录的题算在左梯第 1 级**，标「+34 new」；右梯是周末（本周为此刻）的状态。小圆点从左梯某级飞到右梯更高的一级，每股旁写「↑ 83」；没动的不播；退回的不播，只写一行「↓ 3 back to level 1」。进入视野时播一次，点梯子重播，系统要求减少动态效果时不播。上周读作「268 new」「65 to level 2、5 to level 3」。
- B **新录的题只出现在右梯**。代价：上周的题都是那周录的，左梯是空的，看不到爬升。

**裁决（2026-10-22）：A，另加两条。** 用户原话：「A. and, Left ladder with questions mastered during last week removed from its last rung, marked 'xx mastered'. Caption: xx climbed to level 2, xx climbed to level 3, xx mastered. In a good format.」落实：

1. 周初已经掌握、到周末仍掌握的题不放进左梯的顶级（也不放进右梯），在左梯顶上标「N mastered」；周初掌握、周内又做错的题留在左梯顶级，退回算进「↓ back to level 1」。右梯的顶级只是本周新掌握的。
2. 图下一行按到达的级写：「↑ 83 to level 2 · ↑ 10 to level 3 · ★ 0 mastered」，为 0 的项不写（全为 0 时写「No climbs yet — every right answer moves a question up.」）。一道题本周从 1 级升到 3 级只算「to level 3」一次。
3. 梯子的级名按用户的说法写 Level：横档旁写「Level 1 · day 1」…「Level 4 · day 14」，顶上「★ Mastered」。

### D3 「moved up」放在哪、要不要动画

证据：E3。依赖 D2。

- A（推荐）**从 Last 7 days 拿掉，放进 Ladders 的横档之间，加一次爬升动画。** 两档之间写「↑ 142」（最近 7 天从下一级升到这一级的次数），梯子下方一句「157 climbs in the last 7 days」。每次打开 Today，小圆点沿梯子从下一档爬到上一档（约 1.2 秒，次数为 0 的两档之间不动），之后静止；系统设了减少动态效果时不播。退回 1st 的次数不写。Last 7 days 的统计行只剩对、部分对、错与练习天数。代价：多一个按级数升级次数的纯函数与断言；「147 题」改为按次数数（157 次），口径变了。
- B **留在 Last 7 days，改写成「147 questions climbed a rung」**，不加动画。代价：仍看不出升到哪一级。
- C **A 的位置与数字，不加动画。** 代价：少一点「往上爬」的感觉；更简单。

**裁决（2026-10-22）：A 的位置，动画按 D2。** 用户原话：「A. but for the animation, we use the one I described in the previous question. (two ladders side by side, and little questions climbing from the left one to the right one.)」Last week 的统计行去掉「moved up」；升级只在两架梯子之间显示（D2b）。

### D4 作答页与卷子详情的返回按钮

证据：E4。

- A（推荐）**左上角一个「‹ Back」，两页都是；第一张卡的 Previous 也换成「‹ Back」。** 作答页：顶上一行最左「‹ Back」，接着标签与卷名，最右「Hand in」；Stop 去掉；交卷后的「← Back to today」移到同一位置。作答时已经答了题再点 Back，先问一句「Leave this paper? Your answers won't be saved.」[Leave] [Keep answering]，没答任何题直接退出。卷子详情：「‹ Back」从摘要卡右上角移到页面左上角。两页第一张卡左下的 Previous 换成「‹ Back」，与左上角的同一动作（含确认）。代价：第一张卡上 Back 与 Next 并排，误点 Back 会走（有确认兜底）。
- B **只把 Stop 移到左上角改名 Back，第一张卡的 Previous 照旧不可点。**
- C **A，但离开时不确认。** 代价：误点就丢掉没交的作答（现在 Stop 也是这样）。

**裁决（2026-10-22）：A 的位置与改名，离开不确认。** 用户原话：「A. Not confirmation is needed. We just automatically save the answers. And when reopen the paper, load the questions with saved answers.」

D4a 作答怎样自动保存（依赖 D4）：agent 给的选项是存在本人私有的 `db` 区、存在卷子上按人分的 `drafts` 字段、或只存在本设备。用户原话：「we don't save the answers for 'check' paper, we only save the answers for 'daily' paper. So, we save the answers directly to the paper and no 'drafts' field is needed. Because we know the paper is not 'hand-in'.」

**裁决（2026-10-22）：只存每日卷，存在卷子上。** 落实（机械）：

1. 每日卷在作答阶段，回答一变，停顿约 1 秒后把整份回答写进这张卷的 `responses`（错题 id → 回答）；Back 离开时先把没写的写掉。交卷时 `responses` 写成 `null`。这不是作答：阶梯与金币仍只在交卷时变。
2. 再点这一科的每日重做时，今天这一科本人没交的那张每日卷**接着做**（不再删掉重组），带出 `responses`，从第一张卡开始；没有这样的卷才新组一张。更早没交的每日卷照旧不接着做、不列出。
3. 检验卷不存：作答阶段点 Back，没交的回答照旧丢掉（不确认）。
4. 术语表 Daily paper「没交的会被新的一张取代」、DATA.md「每日卷只属于 for 的用户，不接着做」一段及其已知代价随之改写。

### D5 照片与材料的展开状态沿用到同材料的下一题

证据：E5。用户原话已定：「the 'images' and the 'material' should keep as it was (folded or expanded) for the next question with the same 'images' and 'material'」。做法：材料照旧按题组记；照片按「这组照片」（照片 id 依次连成的串）记展开或收起，作答页与卷子详情各记各的，翻到有同一组照片的下一题时沿用；默认值不变（材料作答页收起、详情页展开，照片收起）。离开作答页或详情页后不保留。

**裁决（2026-10-22）：用户原话直接定。**

### D6 Record 能否选已有题组让 AI 再找题

证据：E6。

- A（推荐）**Record 页加一块「Find more in a saved question set」。** 先选科目，再选题组（下拉，每项「义卖会传单 · 3 recorded」，按录入新的在前）；点「Find more with AI」：把这组的照片、材料文字和组里已录的题干一起交给 AI，请它只起草还没录的题；草稿挂在这个题组上（不新建题组），照常逐条检查、保存。归属人用 Record 现有的 Owner。代价：多一个提示词与一段取照片的代码；用 `fetch('/_blob/<id>')` 取照片成 Blob 未实测，失败时提示「Couldn't load the set's photos」并只用文字。
- B **入口放在 Exercises 的题组详情（Edit set 旁）**，点了跳到 Record 并选好这个题组。代价：要先找到这组里的一道题才能进。
- C **不做。**

D6a 再找题时找哪些题（依赖 D6）：

- A（推荐）**与录入同一规则：** 看得出 Sophia 做错的只起草做错的，看不出就起草全部；已录的跳过。新题仍是错题（术语表 Exercise：做错后被录入的题）。
- B **起草全部没录的题，不管当时对没对。** 代价：做对的题也成了「错题」，与术语表 Exercise 的定义不符，错因（必填）与当时的错答没法填；要改术语表与 DATA.md。

**裁决（2026-10-22）：D6 选 A。D6a 选 B，并加提示框。** 用户原话（D6a）：「B. And user can input some hint for the agent to choose specific questions.」

D6b 当时没做错的题，错因怎样填（依赖 D6a）：A（推荐）错因可空（新增「— Not wrong」，存 `null`）；B AI 照样猜一个错因。用户原话：「When finding more questions in a saved set, first I choose the set, then I input some hint, then I click the 'read with AI' button to let AI find more questions from the set according to my hint. AI returns some questions, with the a 'cause' filled up with guesses.」

**裁决（2026-10-22）：B，流程按用户原话。** 落实：Record 的录入块里加「From a saved question set」下拉（先按 Subject 筛；默认「— New photos or text」）。选了题组：拍照与选照片两个按钮收起，文字框的标签改为「Hint for AI (optional)」，占位「e.g. Questions 5 to 8 only」；Subject 跟题组；点原来的「Read with AI」，把这组的照片、材料文字、组里已录的题干与提示交给 AI，请它按提示起草还没录的题（没给提示就起草全部没录的），错因照样猜，看得见 Sophia 的错答就填；草稿挂在这个题组上。照片取不到时照常提示并只用文字。

本轮跟着变的（D6a 的机械落实）：术语表 Exercise 的定义改为「录入练习场、要重做的一道题：做错后录入的，或从已录题组的材料里补录的」；Record 的定义加一句「也可以选一个已有题组，让 AI 补录组里还没录的题」。错因照旧必有。

### D7 Exercises 按科目分子标签

证据：E7。

- A（推荐）**筛选块上面一行子标签：「All 302 · English 288 · Science 14」**（只列有错题的科目，带题数，按 Owner 筛选后的数）。子标签取代 Subject 下拉与点小卡筛选；选中某科时 Topic 下拉才可用（同现在选了 Subject）；所选子标签在本设备上记住，同主标签。代价：现有的 Subject 筛选从下拉移到子标签，「Clear filters」不清子标签。
- B **不加，照旧用 Subject 下拉与小卡。**

**裁决（2026-10-22）：A。**

### D8 Exercises 每科小结写什么

证据：E7。依赖 D7。

- A（推荐）**选了一科时，列表上方一块该科的小结，三部分：**
  1. 一行数字：「288 exercises · 269 due · 0 mastered」。
  2. **专题图**：每个专题一行横条（按题数排，最多 8 行，其余并成「Other topics」），横条按阶梯五级分段着色（同 D2 的颜色），行尾写最近 7 天的正确率「68%」（作答不到 5 次写「—」）。点一行 = 按这个专题筛选。
  3. **两列小榜：**「Getting stronger」：最近 7 天作答 ≥5 次、正确率最高的 3 个专题（如 Gerunds, infinitives & modals 77%、Prepositions 72%、Spelling 71%）；「Needs more work」：同样条件下正确率最低的 3 个（如 Synthesis & transformation 50%、Adjectives & adverbs 57%、Subject-verb agreement 57%），带错的次数。正确率按 Last 7 days 同一口径（部分对不算对，含检验卷）。
  错因一行改成一条分段横条加图例。选「All」时显示现在的每科小卡（点卡切到那科的子标签）。代价：多一个按专题汇总的纯函数与断言；小结一块约 300px 高。
- B **只在现在的小卡上加「Getting stronger」「Needs more work」两行文字**，不加专题图。代价：没有图。

**裁决（2026-10-22）：A。**

### D9 Papers 分 Daily 与 Check 两个子标签

证据：E8。

- A（推荐）**两个子标签「Check papers 2 · Daily papers 26」，默认 Check。** Check 下：「Make a check paper」与检验卷列表，筛选 Owner、Subject、Status 与四种排序；Daily 下：每日卷列表，筛选只留 Subject（Owner 与 Status 对它无意义，E8），排序照旧。Kind 筛选与行首的类型标签去掉（子标签已说明），左侧色条也去掉。所选子标签在本设备上记住。代价：两种卷不能混在一个列表里排。
- B **不分，照旧用 Kind 筛选。**

**裁决（2026-10-22）：A。**

### D10 每日卷只列最近 7 天

证据：E8。依赖 D9。

- A（推荐）**默认只列最近 7 天（今天与前 6 天）的每日卷；列表底下「Show older (N)」，点了列全部。** 代价：多一个开关状态。
- B **只列最近 7 天，没有办法看更早的。** 代价：更早的卷只能从错题详情的作答记录里看到，进不了卷子详情。
- C **全部列出（照旧）。**

**裁决（2026-10-22）：A。**

### D11 每日卷按天分组（agent 提议）

证据：E8。依赖 D9。每天有一到两张每日卷（每科一张），每行都写「Created 22 Oct 08:15」。

- A（推荐）**Daily 子标签里按天分组**：小标题「Today」「Yesterday」「Mon 20 Oct」，组下每行只写科目、得分与交卷时刻；排序固定为新的在前，Daily 下不再有排序下拉。代价：Daily 下不能按 Score 等排序。
- B **不分组**，同 Check 一样每行写日期，保留排序。

**裁决（2026-10-22）：A。**

---

## 三、核销表

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1、D3 | `app/arena.html` 纯逻辑 | `weekReview(done, papers, from, to, uid)` 改为按区间（含两端）算：`days` 为 from…to 每天一项（今天以后各天为 0），`newlyMastered` 按区间，去掉 `moved`；`reviewLine` 去掉「N moved up」一项，其余字样不变。调用：Last week 用上周一到上周日；This week 的实际柱用本周一到本周日；Today 的 `keyIdeaTip` 与检验卷建议照旧用最近 7 天（today−6…today） |
| 2 | D1a | `app/arena.html` 纯逻辑 | 加 `weekPlan(todo, today, from)`：from 起 7 天每天的计划题数：今天以前 0；今天为此刻到期的题数（`dueNowIds` 的个数）；今天以后取 `dueByDay` 同一天的数 |
| 3 | D1 | `app/arena.html` 纯逻辑 | 加 `goalLines(g, st, today, weekEnd, practisedToday, topic)` 取代 `paperTry`，返回 `[{ ok, text }]`：天数一行——达到「🎉 N practice days — goal reached!」；还差 k 天且本周剩下能练的天数（今天以后的天数，今天没练过再加 1）≥ k：g.days 为 0 时「New week, fresh start — practise on N days to reach your goal.」，否则「D day(s) done — k more to reach N. Keep going!」；来不及时「D day(s) done this week — every day counts!」（D 为 0 时「Every day counts — start today!」）。`st.papersPerWeek` > 0 时检验卷一行——达到「✓ P check paper(s) done — nice work!」，否则「A check paper shows what you've mastered — try one on <topic>.」（没有错得多的专题时「mixed topics」）。`paperTry` 删去 |
| 4 | D2b | `app/arena.html` 纯逻辑 | 加 `ladderAt(e, date)`：按 `ladderInput` 与 `deriveState` 同一套逐次规则，只看 `date` ≤ 给定日的作答，返回 1–4 或 5（掌握）；`createdAt` 晚于该日返回 `null`。加 `weekLadders(todo, from, to)`：每道题 `a = ladderAt(e, from−1)`、`b = ladderAt(e, to)`；`b` 为 null 跳过；`a` 为 null 时 `a = 1` 并计入 `fresh`；`a`、`b` 都是 5 时计入 `masteredBefore`，不进两架梯子；其余计入 `left[a]`、`right[b]`；`b > a` 计入 `up[b]`（2、3、4、5）与流 `{from: a, to: b, n}`；`b < a` 计入 `down`。返回 `{ left, right, fresh, masteredBefore, up, down, flows }`（`left`、`right` 是 1–5 五项） |
| 5 | D1、D1a、D2、D2a | `app/arena.html` Today | Today 只剩三块：Today（不动）、This week、Last week；`planBlock`、`reviewBlock`、`progressBlock` 改写，独立的 Ladders 块删去。**This week**：小标题「This week」与日期「19–25 Oct」；图例「Correct rate · Right · Partly · Wrong · Planned」；组合图周一到周日（今天一列写「Today」，其余写星期），计划柱为虚线空心、写计划数，叠在今天实际柱之上、以后各天单独立；左轴顶取各天（实际 + 计划）的最大值，正确率线只连有作答的天；目标句（行 3）一行一句，前面达到为 ✓、没达到为 ○；下面两架梯子（行 7，from 本周一、to 今天）。**Last week**：小标题「Last week」与「12–18 Oct」；「N questions reviewed」与统计行（行 1）；同一组合图（没有计划柱）；两架梯子（from 上周一、to 上周日）；上周有新掌握的才列「Newly mastered」。每列提示与 `aria-label` 照旧写日期、对错次数与正确率，计划柱加「N planned」 |
| 6 | D2、D2b | `app/arena.html` Today | 加 `ladderPair(wl, opts)` 画两架梯子：一个 SVG，左梯、中间一列级名、右梯；五根横档自下而上「Level 1 · day 1」「Level 2 · day 3」「Level 3 · day 7」「Level 4 · day 14」「★ Mastered」（顶级绿色，其余用现有的 `--lad1…4` 蓝阶）；每架梯子横档上写该级题数，右梯另写百分比（`ladderShares`）；左梯第 1 级旁「+N new」（N 为 0 不写），左梯顶上「N mastered」（为 0 不写）；右梯各级旁「↑ n」（`up`）。图下说明一行：「↑ 83 to level 2 · ↑ 10 to level 3 · ★ 2 mastered」，为 0 的项不写，都为 0 时「No climbs yet — every right answer moves a question up.」；`down` > 0 时再写一行小字「↓ 3 back to level 1」。`role="img"`、`aria-label` 写左右各级题数与说明行 |
| 7 | D2b | `app/arena.html` Today | 爬升动画：每股流 `{from, to, n}` 放 `min(n, 10)` 个小圆点，从左梯 from 级飞到右梯 to 级（经过中间列上方的弧线），每个约 1.2 秒、依次错开 80ms，落定后消失；块第一次进入视野时播一次（`IntersectionObserver`），本次打开页面里重画不再自动播；点梯子重播；`prefers-reduced-motion: reduce` 时不播 |
| 8 | D4 | `app/arena.html` 作答页、卷子详情 | 作答页顶上一行：最左「‹ Back」（`exit-run`），再是标签与卷名，最右作答阶段的「Hand in」；「Stop」删去；交卷后摘要卡右上角的「← Back to today」删去，顶上一行的 Back 照留。卷子详情：页面顶上一行最左「‹ Back」（`paper-view-close`），摘要卡里的「← Back to papers」删去。`cardNav`：第一张卡左下不可点的「← Previous」改为「‹ Back」，动作同顶上的 Back；其余卡照旧 Previous。离开都不确认 |
| 9 | D4a | `app/arena.html` 作答页与事件 | 每日卷作答阶段：作答框输入、点选项或词表后，停顿 1 秒把 `S.run.responses` 整份 `update` 进 `papers/{id}` 的 `responses`；同一张卷一次只有一个写入在途，写完再写最新的；Back 时先把待写的写掉再退出；写入失败显示在作答页的错误提示里。交卷写 `handedIn` 的同一次 `update` 带上 `responses: null`。`start-daily`：今天这一科本人没交的每日卷（`openDailyPaper`）存在就接着做，`responses` 取卷上的、从第一张卡开始；不存在才按这一科此刻的一批新组一张；删卷的代码去掉。检验卷不存回答 |
| 10 | D5 | `app/arena.html` | `photosBlock` 加 `data-photos`（照片 id 用逗号连起来）与展开参数；作答页记在 `S.run.openPhotos`，卷子详情记在 `S.paperOpenPhotos`（`paper-view` 时清空），`toggle` 监听照记；渲染题目照片与材料照片时按记下的状态展开，默认收起。材料的记法不变 |
| 11 | D6、D6a、D6b | `app/arena.html` Record | 录入块加下拉「From a saved question set」：第一项「— New photos or text」，其余为有错题挂着的题组（Subject 选了某科时只列这科），每项「<title> · N recorded」（不是所选科目时前面加科目），按 `createdAt` 新的在前、再按标题。选了题组：Subject 设为题组的科目并锁定；拍照、选照片两个按钮与托盘收起；文字框标签改为「Hint for AI (optional)」、占位「e.g. Questions 5 to 8 only」；说明行改为「AI reads this set's material and drafts the questions not recorded yet.」。点「Read with AI」：用 `fetch('/_blob/<id>')` 把题组照片取成 Blob（取不到的跳过，并在结果提示里说「Couldn't load N photo(s); used the text only」），用新提示词 `morePrompt(set, recorded, hint)`（字段与录入同一套；写明组里已录的题干，别再起草；按提示选题，没有提示就起草全部没录的；看得见 Sophia 的回答就填 `wrongAnswer`，错因照样给最可能的一项；不返回 `sets`，每份草稿都属于这个题组）调 `S.sample.json`；草稿 `setRef` 为这个题组的 id、`images` 为空；结果提示「Found N drafts for "<title>".」。归属人、检查与保存照旧。识别成功后清空提示，题组保持选中 |
| 12 | D7 | `app/arena.html` Exercises | 筛选块上方一行子标签「All 302 · English 288 · Science 14」（只列按 Owner 筛选后有错题的科目，数字随 Owner 变），驱动 `S.filters.subject`，所选写进本地存储 `arena.exSubject`（读取失败按 All）；Subject 下拉删去；Topic 下拉在选了某科时可用；「Clear filters」不清子标签；All 下的每科小卡点了切到那科的子标签 |
| 13 | D8 | `app/arena.html` 纯逻辑 | 加 `topicSummary(exs, subject, today)`：该科每个有错题的专题 `{ topic, n, steps: [1,2,3,4,掌握], answers, right, wrong, rate }`，`answers` 等取 today−6…today 的作答（视图里本人的全部作答，含检验卷），`rate` = 做对 / 作答取整百分比，作答不到 5 次为 `null`；按 n 多到少、再按 id。另返回 `stronger`（`rate` 非空，按 rate 高到低、再按 n 多到少、再按 id，前三）与 `weaker`（`rate` 非空且不在 `stronger` 里，按 rate 低到高、再按 wrong 多到少、再按 id，前三） |
| 14 | D8 | `app/arena.html` Exercises | 选了某科时，筛选块下方一块小结：一行「288 exercises · 269 due · 0 mastered」；专题图：每个专题一行（最多 8 行，其余合成一行「Other topics」），专题名、按阶梯五级分段的横条（长度按题数、相对最多的专题）、行尾最近 7 天正确率（`null` 写「—」），点一行设 Topic 筛选（「Other topics」不可点）；「Getting stronger」「Needs more work」两列，每行专题名与正确率，后者加「N wrong」，为空时写「Not enough answers in the last 7 days yet.」；错因一条分段横条加图例（错因名与题数）。选 All 时照旧每科小卡（`subjectCards` 不变） |
| 15 | D9 | `app/arena.html` Papers | Papers 顶上一行子标签「Check papers N · Daily papers N」（`visiblePapers` 里两种各几张），状态 `S.paperTab`，写进本地存储 `arena.paperTab`，默认 check。Check：「Make a check paper」与检验卷列表，筛选 Owner、Subject、Status，四种排序照旧。Daily：每日卷列表（行 16），筛选只有 Subject。Kind 筛选删去；列表行首的类型标签与左侧色条（`k-daily`、`k-check` 行样式）删去；Today、作答页、卷子详情里的类型标签照旧 |
| 16 | D10、D11 | `app/arena.html` 纯逻辑与 Papers | 加 `dailyGroups(papers, from, all)`：只取每日卷，`all` 为假时只取 `createdAt` ≥ from（today−6）；按 `createdAt` 分组，新的在前，组内按 `madeAt` 新的在前、再按 id；另返回没列出的张数 `older`。Daily 子标签按组列：组标题「Today」「Yesterday」或「Mon 20 Oct」，行内科目标签、得分「8/10」、「Done 08:15」、Delete；没有排序下拉；`older` > 0 时底下「Show older (N)」，点了列全部（`S.dailyAll`，换子标签或离开 Papers 时复原） |
| 17 | D1 | `app/arena.html` Settings | 设置页小字「The goal shows in Next 7 days on Today.」改为「The goal shows in This week on Today.」 |
| 18 | D1–D11 | `app/logic.test.js` | 改写并导出：`weekReview` 按区间（含今天以后为 0、`newlyMastered` 按区间、无 `moved`）、`reviewLine` 无 moved；删去 `paperTry` 的断言，加 `goalLines`（达到、来得及（0 天与非 0 天）、来不及（0 天与非 0 天）、检验卷达到与没达到、`papersPerWeek` 为 0 时无检验卷行）；加 `weekPlan`（今天以前 0、今天为到期数、以后同 `dueByDay`）、`ladderAt`（未录为 null、升级、掌握、做错回 1、检验卷上做对不升）、`weekLadders`（新录算左梯 1 级与 `fresh`、跨两级只算一次 `up`、退回计 `down`、周初掌握且仍掌握计 `masteredBefore` 不进梯子、周初掌握后做错留在左梯顶级）、`topicSummary`（不到 5 次为 null、`stronger` 与 `weaker` 不重复、排序）、`dailyGroups`（最近 7 天、`all`、组序与组内序、`older`） |
| 19 | D4a | `DATA.md` | `papers/{id}` 表加一行：`responses` | 对象，可省 | 每日卷：本人还没交时已填的回答，错题 id → 回答；作答阶段停顿后写入，交卷时写成 `null`；不是作答，不进阶梯与金币；检验卷不写。「每日卷只属于 `for` 的用户，不接着做：…」一段改为：每日卷只属于 `for` 的用户。再次开始这一科的每日重做时，本人今天这一科没交的每日卷接着做，带出 `responses`；没有才新生成一张。更早没交的每日卷不再接着做，不列出，文档不删；旧式混合每日卷（`subject` 为 `null`）同样不接着做。已知代价改为：同一用户在两台设备上同时开着同一张没交的每日卷时，后写的 `responses` 覆盖先写的。写入规则「交卷即保存」加一句：每日卷交卷时一并把 `responses` 写成 `null` |
| 20 | D4a、D6a | `CONTEXT.md` | Exercise：定义改为「录入练习场、要重做的一道题：做错后录入的，或从已录题组的材料里补录的；连同正确答案、讲解、当时的回答、错因和归类。错题可以属于一个题组，有一个归属人。」（`_Avoid_` 不变）。Record：加一句「也可以选一个已有题组，由 AI 按提示补录组里还没录的题。」Daily paper：「没交的会被新的一张取代」改为「今天没交的下次接着做，留着已填的回答；更早没交的被新的一张取代」 |
| 21 | 影响面 | 验证（不改文件） | 检索「Next 7 days」「Last 7 days」「moved up」「Stop」「paperTry」「progressBlock」「k-daily」「k-check」「Kind」「不接着做」「做错后被录入」在 `CONTEXT.md`、`DATA.md`、`adr/`、`app/` 的出现，逐处改或确认不适用（`paperTag` 的 `.chip.k-daily`/`.chip.k-check` 标签样式保留）；`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；落盘者逐行对照本表核对实际稿 |
| 22 | 完成标准 | 验证（不改文件） | 本地测试壳（内存 `db`、`assets`、`user`，`sample` 用假件返回固定 JSON；10-22 读出的线上数据副本，Sophia，时钟定在 10-22）：Today 三块，This week 柱与虚线计划柱、目标句、两架梯子（左 268 道含「+34 new」，「↑ 83 to level 2 · ↑ 10 to level 3」，「↓ 3 back to level 1」）与动画、Last week 两架梯子（「+268 new」）；每日卷答两题后 Back，再点同一科继续、回答还在，交卷后 `responses` 为 null；检验卷首卡 Back；同组两题翻页时照片与材料保持展开；Record 选题组、写提示、点 Read with AI，草稿挂在该题组、提示词含已录题干与提示；Exercises 子标签、English 小结（「Getting stronger」首行 Gerunds, infinitives & modals 77%）；Papers 两个子标签、Daily 按天分组与「Show older」。375 宽与 1100 宽、亮暗两套各看一遍，`scrollWidth` 不超过视口；控制台无错误 |
| 23 | 发布 | 线上页面 | 发布前读线上，核对与上次提交的 `app/arena.html` 相同；发布到原网址，能力与契约不变（省略 `capabilities`）；读回线上，去掉外壳后与本地文件相同；不改数据 |
| 24 | —— | 不改 | `adr/` 不改：没有新的取舍需要长期记理由（作答存在卷子上的理由是用户的裁决：每日卷只属于一个人、交卷前没有作答）。已冻结的讨论不改。提交只含 `app/arena.html`、`app/logic.test.js`、`CONTEXT.md`、`DATA.md` 与本讨论文件；测试壳与数据副本不进提交 |
