# 0005 合并两侧、去掉打印与历史、导出与错题排序

> 状态：**✅ 已完成（2026-10-14）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 本轮交付什么、范围到哪里 | 已裁 | 按用户七点改进：照片默认收起、讲解更有结构、去掉两侧切换并合并、去掉历史标签、设置里导出 YAML、错题列表加时间、排序与分页、去掉打印及相关功能；设计、实现、重新发布 | 二·D1 |
| D2 哪些照片默认收起 | 已裁 | 题目照片与题组材料照片都默认收起，显示「Show photo (n)」，点开才看；材料文字照常显示 | 二·D2 |
| D3 讲解（Why）怎么结构化 | 已裁 | 讲解固定分三段：Key idea、Steps（编号）、Watch out；仍存在原字段，用简单标记分段；识别按此格式写；已有错题的讲解由 agent 改写、经确认后写回（落盘时为 72 道，用户确认全部改写） | 二·D3 |
| D4 合并后的界面语言 | 已裁 | 做题的页面（Today、每日重做、做检验卷）用英文，管理的页面（录入、错题、检验卷、设置）用中文；标签栏「Today · 录入 · 错题 · 检验卷 · 设置」 | 二·D4 |
| D5 「家长在场、Claude 功能由家长用」是否保留为使用约定 | 已裁（改裁） | 不保留约定：不再区分学生与家长，所有功能谁都可以用；ADR 0002 只保留「用家长账号」，不写谁操作什么 | 二·D5 |
| D6 导出 YAML 的内容与形状 | 已裁 | 完整备份：`exercises`（全部字段含作答与阶梯状态）、`sets`（含词表）、`papers`（附算出的得分）、`settings`，带 id；照片字段换成张数；开头写导出时刻；经 `downloads` 保存为 `arena-export-<日期>.yaml` | 二·D6 |
| D7 错题列表的排序键、默认顺序与每页条数 | 已裁 | 排序键：录入时间、到期日、错的次数、上次作答，各可切换升降序；默认录入时间新的在前；无到期日的排最后；每页 20 条，上一页/下一页与页码；改筛选或排序回到第 1 页 | 二·D7 |
| D8 导出文件存成什么 | 已裁 | 内容为 YAML，文件名 `arena-export-<日期>.yaml.txt`（平台不允许保存 `.yaml`） | 二·D8 |
| D9 排序的空值与并列 | 已裁 | 没有值的（从未作答、没有到期日）无论升降序都排最后；值相同时按录入时间新的在前；只有日期的旧题按当天 00:00 算 | 二·D9 |
| D10 `CLAUDE.md` 首行 | 已裁 | 用户直接指示改为中性说法：「为 P5 学生 Sophia 设计一个练习场（Exercise Arena）：录入她的错题（文字或照片），按复习阶梯重做，用检验卷确认是否掌握。」 | 二·D10 |

## 目的

用户原话（经主会话转达，逐字）：

> Improve this app in these area:
> 1. collapse picture by default in the questions.
> 2. Make the 'why' section more structural, so that it is more appropriate to read the content in this section.
> 3. remove the 'Sophia & Parent' switch. Merge 'Sophia' page into the tabs in 'Parent'. Remove 'Student side & Parent side' related functions, as student and parents share the same account.
> 4. remove the 'history' tab. As we can click the 'click for more detail' button of the 'Test History' list item in '检验卷' tab to check the history.
> 5. Add a 'export' function in 'settings' so that I can export all the data including all the questions\ tests out as yaml, without pictures.
> 6. in 'Exercise' tab, add a 'timestamp' to each exercise and add a sorting function to sort the list by import time, by due day, by error count, etc. Add 'pagination' function.
> 7. remove the 'download paper' function and related functions and concepts, as we all ways do test online.

用户已经明确的（直接记录，不再询问）：七点各自的方向。第 3、4、7 点推翻了先前的裁决：0001 的 D3、D14 与 ADR 0002 的两侧划分，0001 的 D9 与 0003 的 D3 中的打印与纸上结果，0003 的 D7、D10 的作答历史标签。

本轮具体交付：

1. 设计：`domain/CONTEXT.md`、`domain/OVERVIEW.md`、`adr/0002`（改写）、`design/arena/README.md`、`architecture/`、`CAPABILITIES.md` 按裁决更新。
2. 实现：`app/arena.html`、`app/logic.test.js`，重新发布 `https://claude.ai/artifact/626tqFyFmmfXKdMHYnbJAh`。

完成标准：设计落盘并通过 `./check.sh`；逻辑测试通过；本地测试壳走通七点；已有错题、题组、检验卷照常；页面重新发布。

## 输入

- 讨论 0001–0004（已完成）。
- 同主题未完成讨论：无。

---

## 一、证据

### E1 受影响的现行设计与实现（读设计与源码，实测）

- 两侧：`domain/CONTEXT.md` 的「家长侧」「练习侧」词条；ADR 0002 的决定「页面分家长侧和练习侧，调用 Claude 的功能只在家长侧，两侧切换不设锁」；README 视图表按两侧分；页面顶部「Sophia / 家长」切换，练习侧界面为英文、家长侧为中文。
- 打印：README 检验卷第 6 步、`downloads` 用于打印、`takenOn = "printed"`、「录入纸上结果」视图与 `judgedBy = "parent"` 的卷上作答；CAPABILITIES「检验卷：打印」。
- 作答历史：术语「Work history」、README「作答历史」一节、家长侧「历史」标签。
- 照片：题目照片与题组材料照片现在都直接展开显示。
- 讲解：`solution` 是一段自由文字，`[[ ]]` 高亮；真实数据里有长段落（例如一道连接词选择题的讲解约 600 字符，没有分段）。
- 错题列表：按 `createdAt`（日期）倒序，没有排序与分页；错题只有录入日期，没有时刻。
- 导出：没有。`downloads` 能力已声明（目前用于打印），可以用来保存文件。

### E2 真实数据（`ArtifactData` 读取，实测）

11 道错题、1 张检验卷、若干题组；没有带 `takenOn = "printed"` 的检验卷，也没有 `judgedBy = "parent"` 的纸上作答（只有改判产生的 `parent`）。

## 二、提议与裁决

### D1 本轮交付什么、范围到哪里

见「目的」。

### D2 哪些照片默认收起

选项：A 全部收起（推荐）；B 只收起题目照片。

**裁决（2026-10-14）：A。**

### D3 讲解（Why）怎么结构化

例子：一道连接词选择题的讲解约 600 字符、不分段。选项：A 固定三段 Key idea / Steps / Watch out，存原字段、用标记分段（推荐）；B 拆成三个字段；C 只做分段与列表显示。

- A：字段不变；识别按格式写；已有讲解改写一次。代价：靠约定，不按格式写的显示为普通段落。
- B：数据最清楚；改字段、多三个输入框、要迁移。
- C：最简单；长段落仍要录入时自己分。

**裁决（2026-10-14）：A。**

### D4 合并后的界面语言

选项：A 做题页英文、管理页中文（推荐）；B 全中文；C 全英文。

**裁决（2026-10-14）：A。**

### D5 「家长在场、Claude 功能由家长用」是否保留为使用约定

实质顾虑（主会话提出）：ADR 0002 因 claude.ai 条款（至少 18 岁或当地法定同意年龄，取较高者）把调用 Claude 的功能只放在家长侧，由界面保证；两侧合并后界面不再拦。选项：A 保留为书面使用约定并改写 ADR 0002（推荐）；B 不再写。

~~**裁决（2026-10-14）：A。**~~

**改裁（2026-10-14）：B。** 用户原话：「for question D5, no need to keep the convention. all functions are used by users. we don't distinguish students and parents any more.」

### D6 导出 YAML 的内容与形状

选项：A 完整备份、字段原样、照片只留张数（推荐）；B 可读版（按科目、解析名称，不可恢复）；C 两份都导出。

**裁决（2026-10-14）：A。**

### D7 错题列表的排序键、默认顺序与每页条数

录入时刻随第 6 点定下：新录入的错题多存录入时刻，旧错题只显示日期。选项：A 四种排序可切换升降序、每页 20 条（推荐）；B 方向固定、每页 50 条。

**裁决（2026-10-14）：A。**

### D8 导出文件存成什么

复审 F1 引出：`downloads` 只允许 `gif png jpg jpeg webp mp4 webm mov txt json md` 等扩展名（`downloads.d.ts`，文档），`.yaml` 会被拒（`rejected_extension`）。选项：A YAML 内容存成 `.yaml.txt`（推荐）；B 改用 JSON；C 存成 `.md`；D 页面显示文本供复制。

**裁决（2026-10-14）：A。**

### D9 排序的空值与并列

复审 F6 引出。选项：A 空值无论升降序都排最后，并列按录入时间新的在前，旧题按当天 00:00（推荐）；B 空值排最前。

**裁决（2026-10-14）：A。**

### D10 `CLAUDE.md` 首行

复审 F11 引出：首行写着「家长录入她的错题……家长用检验卷确认」，与 D5 不符；`CLAUDE.md` 属流程文件，须用户直接指示。

**裁决（2026-10-14）：改，用户直接指示。**

## 三、核销表

统一规则（D5）：以「家长」为执行者或以「家长侧 / 练习侧」划分的句子，改为中性（省略主语或「用户」）；「Sophia / 她」作为错题与作答的主人（她的错答、她作答、她自评）保留。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D1（第 3、4、7 点）、D5 | `domain/CONTEXT.md` | 删除「Parent side（家长侧）」「Practice side（练习侧）」「Work history（作答历史）」三条；引言 L3「家长录入 Sophia 的错题……」改为「录入 Sophia 的错题……」；「Record」去掉「家长可以」、「保存前都经家长确认」改为「保存前都经确认」；「Daily redo」去掉「练习侧」；「Check paper」L111「家长选定」改为「选定」 |
| 2 | D1、D5 | `adr/0002-…` 改名为 `adr/0002-arena-is-used-through-the-parent-account.md` 并重写 | 背景：claude.ai 条款要求至少 18 岁或当地法定同意年龄（取较高者），Sophia 不能有账号。决定：页面经家长账号打开；不区分学生与家长，所有功能谁都可以用。理由：引用用户原话「student and parents share the same account」「all functions are used by users. we don't distinguish students and parents any more.」；同一账号下分两侧只增加切换与重复界面。代价：界面不再限制谁使用识别等调用 Claude 的功能，是否符合条款由账号持有人按条款原文判断。历史：2026-10-14 推翻原先的家长侧 / 练习侧划分与「调用 Claude 只在家长侧」。原「未决」段（年满可用年龄后是否脱离家长账号）删除，账号仍是家长的，这条不再相关 |
| 3 | D5 | `adr/0001-…` | L14「家长在对话里录入」改为「在对话里录入」；L22「页面只能经家长账号打开，Sophia 不能自己随时使用，见 ADR 0002」改为「页面只能经家长账号打开，见 ADR 0002」，链接与名称随第 2 行更新 |
| 4 | D1（第 3、4、7 点）、D5、D7 | `domain/OVERVIEW.md` | ADR 0002 链接与名称；类图「错题」的「出处、录入日期」改为「出处、录入日期与时刻」，「作答」的「判定方：自动 / 自评 / 家长」改为「自动 / 自评 / 改判」，「检验卷」去掉「完成方式」；L59「家长可以改判」改为「可以改判」；L94「家长改判后」改为「改判后」；L101「家长选科目」改为「选科目」；检验卷段去掉「（屏幕作答，或家长录入纸上结果）」与「Sophia 可以只读回看做完的检验卷」，「家长在任何地方改判」改为「在任何地方改判」 |
| 5 | D1（第 3、7 点）、D5、D6 | `architecture/CONTAINERS.md` | 两个参与者合为「用户」（家长与 Sophia 共用家长账号）；箭头改为「录入、做题、组检验卷、改判、导出」；页面职责去掉「家长侧与练习侧」；L34「在家长确认后」改为「确认后」；参与者行改为「用户 / 参与者 / 使用全部功能」 |
| 6 | D1、D2、D5 | `architecture/RUNTIME.md` | L5「家长在家长侧拍下」改为「在录入页拍下」；时序图 `actor 家长` 与三处「家长 ->」改为「用户」；L33「家长在 Claude Code 对话里……家长确认后」改为中性；L37「Sophia 在练习侧打开每日重做」改为「在 Today 打开每日重做」，「材料在第一题完整显示，之后默认收起」后补「照片另行默认收起」；L41 去掉「家长在家长侧」、打印与纸上结果两句、「Sophia 在练习侧」改为「在 Today」 |
| 7 | D1–D9 | `design/arena/README.md` | 能力表：`downloads` 改为「导出：保存 YAML 文件」，拿不到时「隐藏导出入口」。字段：`response` 去掉「打印卷由家长勾选时为空」；`judgedBy` 的 `"parent"` 说明改为「改判」（存储值不变）；`title` 去掉「家长侧」；`count` 改为「要的题数」；`takenOn` 改为「不再写入，已有的忽略」；`dailyLimit` 去掉「家长侧」；错题加 `recordedAt`（录入时刻，设备本地 `YYYY-MM-DDTHH:mm`，可省，旧错题没有；页面录入与对话录入都写）。L109、L122 改判的主语去掉「家长」「家长侧」，位置写为错题详情与检验卷详情。讲解格式（D3）：`solution` 按三段标记书写——`Key idea:` 一行、`Steps:` 后每行一步（`1.` 或 `- ` 开头）、`Watch out:` 一行或几行；显示为三个带小标题的块，`[[ ]]` 照常高亮；没有这些标记时按空行分段显示。照片（D2）：做题与查看的各处（Today 每日重做、做检验卷、错题详情、检验卷详情）题目照片与题组材料照片都默认收起为「Show photo (n)」，点开显示；收起的题组材料展开后其中照片仍需再点；录入草稿区的缩略图照常显示；材料文字照常显示。检验卷：第 1 步「家长选」改为「选」；第 5 步「Sophia 在练习侧打开」改为「在 Today 打开」；删去第 6 步打印与「录入纸上结果」；检验卷详情去掉「（家长侧）」、完成方式与推断；删去「回看（练习侧）」段（做完的检验卷在「检验卷」标签列表点「查看详情」）；删除检验卷后，相关作答在错题详情的作答记录里显示「检验卷（已删除）」。删去「作答历史」一节。错题列表（D7、D9）：显示录入时刻（旧错题只显示日期）；排序键录入时间、到期日、错的次数、上次作答，各可升降序；默认录入时间新的在前；没有值的无论升降序都排最后；值相同按录入时间新的在前；旧错题按当天 00:00；每页 20 条，上一页 / 下一页与页码；改筛选或排序回第 1 页。导出（D6、D8）：设置页按钮；YAML 内容：`exportedAt`（本地 `YYYY-MM-DDTHH:mm`）、`settings`、`exercises`（全部字段含 `attempts` 与阶梯派生字段，带 `id`）、`sets`（带 `id`，含 `wordBank`）、`papers`（带 `id`，`score` 以算出的 `{right, partial, wrong, total}` 覆盖旧值）；各处 `images` 字段保留名称、值换成照片张数；字符串按 YAML 双引号转义；经 `downloads` 保存为 `arena-export-<日期>.yaml.txt`，被拒或不可用时提示原因。视图（D4）：一排标签「Today · 录入 · 错题 · 检验卷 · 设置」，打开时在 Today，去掉顶部切换；Today 含每日重做与未做的检验卷，英文；录入、错题、检验卷、设置为中文；视图表按标签重写。识别：L185「家长选科目」改为「选科目」；提示词要求讲解按三段格式写；草稿表单讲解输入提示三段格式。对话录入：L205「家长确认」改为「确认」，并写 `recordedAt` |
| 8 | D1–D7 | `CAPABILITIES.md` | 「谁用」一列删除（不再区分）；「说明」去掉「家长核对」「家长确认」中的「家长」；删去「检验卷：打印」「检验卷：回看」「作答历史」三行；「检验卷：查看与改判」说明去掉「与方式」；加「导出」「错题列表：排序与分页」两行；「错题管理」补录入时刻；「每日重做」补讲解分三段、照片默认收起 |
| 9 | D10 | `CLAUDE.md` 首行 | 改为「为 P5 学生 Sophia 设计一个练习场（Exercise Arena）：录入她的错题（文字或照片），按复习阶梯重做，用检验卷确认是否掌握。」 |
| 10 | D1–D9 | `app/arena.html` | 按第 7 行实现：去掉顶部切换、`S.side` 与依赖它的 `locked()` 分支，合并为五个标签，默认 Today；Today 合并原练习侧首页（每日重做、未做的检验卷），去掉 Past papers 与只读回看分支（`renderPaperSheet` 只留一套，中文管理界面）；去掉「历史」标签与 `renderHistory`；去掉打印（`printPaper`）、录入纸上结果（`paper-entry`）的代码与按钮；`takenOn` 不再写入；`JUDGE` 的 `parent` 显示为「改判」，`METHOD` 删除；照片收起；讲解三段显示；错题列表录入时刻、排序与分页；新录入写 `recordedAt`；设置页导出；识别提示词讲解格式；重新发布，能力声明不变（`downloads` 改为用于导出） |
| 11 | D3、D6、D7、D9 | `app/logic.test.js` | 删去 `paperMethod`、`historyDays` 的导出与断言；加断言：讲解三段解析（有标记、无标记、步骤 `1.` 与 `- `）；YAML 序列化（字符串转义、嵌套、空数组、`images` 换张数、`score` 覆盖）；错题排序（四键、升降序、空值排最后、并列按录入时间、旧题 00:00）与分页（页数、边界） |
| 12 | D3 | 真实数据（`ArtifactData`） | 把已有错题的讲解改写为三段格式（落盘时数据库已有 72 道，2026-10-14 用户确认全部改写，先看 3 道样稿）：先在对话里列出改写稿，用户确认后用一次批量写入（每条按读到的 `version` 固定），不改其他字段 |
| 13 | 完成标准 | 验证（不改文件） | 本地测试壳走通：五个标签、默认 Today、无切换；每日重做与做检验卷；照片收起与展开（题目与材料，含材料收起时）；讲解三段显示与无标记的旧讲解；检验卷列表查看详情与改判，无打印、无纸上结果入口；删除检验卷后错题详情显示「检验卷（已删除）」；错题列表录入时刻、四种排序升降、空值排最后、翻页；导出内容（`images` 为张数、带 `score`、`.yaml.txt` 文件名）；已有题组、选词题、句子改写提醒照常。发布后读回 `exercises` 一次 |
| 14 | D1（第 7 点） | `adr/0003-…` | 「代价与被否的方案」中「录入、每日重做、检验卷与打印都要按组处理」去掉「与打印」 |
| 15 | —— | `.design/workspace.yaml`、`design/arena/TAXONOMY.md` | 不改：配置与归类体系不受影响 |

落盘验证：设计文字按 `WRITING.md` 对照裁决核对保真；`./check.sh` 退出码 0；PlantUML 图无可用的「图的校验」集成，按能力退路跳过并披露；`node app/logic.test.js app/arena.html` 通过。

## 四、复审

独立复审（新上下文 subagent，2026-10-14）交回 F1–F11，主 agent 逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 `downloads` 不能存 `.yaml` | 成立（`downloads.d.ts` 扩展名清单，文档） | 回第 3 步 → D8 |
| F2 「家长」执行者在多处未覆盖 | 成立（逐处 grep） | 机械：加统一规则，逐处列进第 1、3–8 行 |
| F3 ADR 0002 缺理由与未决；ADR 0001 L22 | 成立 | 机械：第 2、3 行补齐，理由引用用户原话 |
| F4 导出 `images` 改名、漏列字段、`score` 与时刻格式 | 成立 | 机械：第 7 行保留 `images` 名、补全字段、定 `score` 与格式 |
| F5 测试仍引用将删的函数 | 成立（`logic.test.js` L5、L84–88） | 机械：第 11 行补删除 |
| F6 排序空值与并列未裁 | 成立 | 回第 3 步 → D9 |
| F7 照片收起与材料收起的叠加、范围 | 成立 | 机械：第 6、7 行写明 |
| F8 OVERVIEW 类图未补录入时刻 | 成立 | 机械：第 4 行补 |
| F9 CAPABILITIES「方式」「谁用」 | 成立 | 机械：第 8 行 |
| F10 默认标签、已删卷显示位置、对话录入时刻 | 成立 | 机械：第 7 行写明 |
| F11 `CLAUDE.md` 首行 | 成立 | 回第 3 步 → D10（用户直接指示） |

改写后主 agent 按简报自查第 1–15 行：每行对应已裁题（D1–D10）；F1–F11 的处置均已落进对应行；未见未裁的新决定。改动是机械修补与 D8–D10 的落实，结构未变，不认为需要再派复审。

## 五、核销（2026-10-14）

| # | 目标 | 实际改动 | 验证 |
|---|---|---|---|
| 1 | `domain/CONTEXT.md` | 删除「家长侧」「练习侧」「作答历史」三条；引言、「Record」「Daily redo」「Check paper」改为中性 | 对照 D1、D5；`grep` 不再有「家长侧 / 练习侧」；`./check.sh` 通过 |
| 2 | `adr/0002-arena-is-used-through-the-parent-account.md`（由原 0002 改名） | 重写：背景、决定（经家长账号打开；不区分学生与家长）、理由（引用用户原话）、代价（是否合规由账号持有人判断）、历史（2026-10-14 取代两侧划分）；原「未决」删除 | 对照 D5 与复审 F3 |
| 3 | `adr/0001-…` | 背景与理由中去掉「家长」执行者；代价一条改为「页面只能经家长账号打开」并更新链接 | 链接指向新文件名，`./check.sh` 通过 |
| 4 | `domain/OVERVIEW.md` | ADR 0002 链接；类图录入时刻、判定方「改判」、检验卷去掉完成方式；改判、组卷主语中性；检验卷段去掉完成方式与只读回看 | 对照第 4 行；剩余「Sophia」均为作答的人 |
| 5 | `architecture/CONTAINERS.md` | 参与者合为「用户（家长与 Sophia，共用家长账号）」；箭头与表格；平台补 `downloads` | 无「家长侧」「Parent」残留 |
| 6 | `architecture/RUNTIME.md` | 三节去掉两侧用语；时序图参与者改「用户」；每日重做补照片另行收起；检验卷删去打印与纸上结果 | 无「家长」「练习侧」「打印」残留 |
| 7 | `design/arena/README.md` | 能力表、字段（`recordedAt`、`response`、`judgedBy` 说明、`takenOn`、`title`、`count`、`dailyLimit`）、改判主语、新增「讲解格式」「照片」「错题列表」「导出」四节、检验卷第 1、4、5 步与详情、删去打印、回看、「作答历史」一节、视图改为五个标签、识别与对话录入 | 对照 D1–D9 与复审 F2、F4、F7、F10；无「家长」「练习侧」「打印」残留 |
| 8 | `CAPABILITIES.md` | 重写：去掉「谁用」列；删去打印、回看、作答历史；加「错题列表：排序与分页」「导出」；每日重做、判对、改判、设置更新 | 对照第 8 行 |
| 9 | `CLAUDE.md` 首行 | 改为「为 P5 学生 Sophia 设计一个练习场（Exercise Arena）：录入她的错题（文字或照片），按复习阶梯重做，用检验卷确认是否掌握。」 | 托管块未动，`./check.sh` 比对通过 |
| 10 | `app/arena.html` | 去掉顶部切换与 `S.side`，五个标签（默认 Today，做题时标签禁用）；Today 去掉 Past papers；去掉「历史」标签、`renderHistory`、打印（`printPaper`）、录入纸上结果、只读回看与 `paperMethod`；检验卷详情单一中文版；`JUDGE.parent` 显示「改判」；照片 `photosBlock` 默认收起；讲解 `parseExplanation` + `explanationHtml` 三段显示；错题列表 `sortExercises`、`pageSlice`、录入时刻与翻页；新录入写 `recordedAt`，编辑保留；交卷不再写 `takenOn`；设置页导出（`toYaml`、`exportData`、`downloads` 保存 `.yaml.txt`）；识别提示词与讲解输入框提示三段格式。重新发布为版本 7，能力声明不变 | 三个脚本语法检查通过 |
| 11 | `app/logic.test.js` | 删去 `paperMethod`、`historyDays`；加 20 条断言（讲解三段 3 条、排序 7 条、分页 4 条、YAML 2 条、导出 1 组） | `node app/logic.test.js app/arena.html` 全部通过；另用真实错题生成的导出经 Ruby `YAML.safe_load` 读回与原数据相等 |
| 12 | 真实数据 | 落盘时数据库已有 72 道错题（全部英文，讲解均为一整段）。用户确认全部改写并认可 3 道样稿后，72 道讲解改写为三段格式，分两批（50 + 22）用 `ArtifactData` 原子写入，每条按读到的 `version` 固定 | 写前机械核对：72 道全覆盖、原讲解的每个 `[[关键词]]` 都保留、三段标记齐全；写后读回：72/72 与改写稿一致，其他字段与写前相同 |
| 13 | 验证 | 本地测试壳走通：五个标签、默认 Today、无切换、无 Past papers；每日重做中题组材料照片与题目照片默认收起、可展开；旧讲解按段落显示、三段讲解显示 Key idea / Steps / Watch out 且关键词高亮；检验卷列表只有「查看详情」「删除」，详情显示完成时刻、无方式，改判后判定显示「改判」、得分 0/1 → 1/1；错题列表录入时刻（旧题只显示日期）、默认新的在前、错的次数降序与升序、翻到第 2 页、切换方向回到第 1 页；挂在已删检验卷上的作答显示「检验卷（已删除）」；导出文件名 `arena-export-<日期>.yaml.txt`、不含照片 id、旧 `score` 被算出的得分覆盖。发布后读回 `exercises`：72 道都在 | 见下方「未验证」 |
| 14 | `adr/0003-…` | 「代价」去掉「与打印」 | —— |
| 15 | 不改 | `.design/workspace.yaml`、`design/arena/TAXONOMY.md` | —— |

偏差：第 12 行范围由 11 道扩大到 72 道（数据增长），经用户确认。

未验证（用户于 2026-10-14 接受）：

- 在真正的 claude.ai 页面里登录后运行版本 7，包括真实的 `downloads` 保存 `.yaml.txt`。
- 真实识别能否按新提示词写出三段讲解。
- 新录入写入 `recordedAt`：代码路径简单，测试壳里没有单独走手填录入。
- PlantUML 图：没有启用提供「图的校验」的集成，按能力退路跳过。
