# 0010 用户与归属：每人用自己的 Claude 账号，错题有归属人，各自的 Today 与作答历史

> 状态：**讨论中（2026-10-15）** —— 分批落盘：第 1 批（核销行 1–19、21–22）已落盘于 7149925；第 2 批（行 20：迁移真实数据并重新发布）待用户另行确认

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| D1 本轮交付什么、范围到哪里 | 已裁（部分被取代 → 0011 D1、D1a） | 用户已定：用户经自己的 Claude 账号登录（现为三个账号）；设置属于一个用户；错题属于一个归属人，归属人为空表示公开、谁都可以看和重做；每人在设置里定自己录入时的默认归属人（初始为空）；每人有自己的 Today 与作答历史；其中「归属人为空表示公开」「默认归属人初始为空」已被 0011 取代 | 二·D1 |
| K1 Sophia 自己的 Claude 账号与条款（实质顾虑） | 已裁 | `sophia.zm.shi@gmail.com` 由家长持有使用，在练习场里代表 Sophia 的错题与进度，照常当一个用户；是否符合条款由账号持有人判断 | 二·K1 |
| D2 怎样认出是哪个用户 | 已裁 | 用平台给的 id：谁能打开由分享菜单决定，每人第一次打开时登记 `users/{id}`，只存 id，名字显示时用 `profiles()` 现取 | 二·D2 |
| D3 有归属人的错题谁能看、谁能重做 | 已裁 | 谁都能看、能重做，不论归属人是谁；当前用户设置里的默认归属人（如 A）决定点「Start today's redo」时默认重做谁的错题 | 二·D3 |
| D3a 默认归属人为空时，每日重做取哪些错题 | 被取代 → 0011 D1a | 只取没有归属人的错题；「空」是归属人的一个值 | 二·D3a |
| D3b 默认归属人是否也是新录入错题的归属人 | 已裁 | 是；录入时归属人默认填它，保存前可改 | 二·D3b |
| D4 公开错题被几个人重做时，阶梯与作答怎样分人存 | 已裁 | 作答仍嵌在错题里，每条记下作答人 `by`；阶梯不再存，页面按当前用户的作答现算 | 二·D4 |
| D4a 能看、能改判谁的作答 | 已裁 | 错题详情里能看所有人的作答（按人分组），只能改判自己的；Today 的计划、回顾与连续天数只算自己的 | 二·D4a |
| D5 已有的 86 道错题与作答归谁 | 已裁 | 错题的归属人与作答的作答人都设为 Sophia；作答迁移等 D2 实测拿到 Sophia 的 id | 二·D5 |
| D6 设置怎样分人存，默认归属人能选谁 | 被取代 → 0011 D1、D1a | 每人一份 `settings/<用户 id>`，加默认归属人（用户 id 或空，初始空，可选自己与打开过练习场的用户）；`settings/main` 迁成 Sophia 的，默认归属人设为 Sophia；0011 改为：默认归属人初始为本人、不能选公开 | 二·D6 |
| D7 检验卷属于谁 | 已裁 | 所有人都能看、都能做；得分按人分开算 | 二·D7 |
| D7a 检验卷怎样按人记完成、出现在谁的 Today | 已裁 | 每人每张卷做一次，完成与得分由本人带 `paperId` 的作答算出，卷子不再存 `status`、`finishedAt`；卷子记下组卷时的归属人，Today 只列归属人等于我的默认归属人、我还没做的卷子 | 二·D7a |
| D7b 组卷时按谁的阶梯挑题 | 被取代 → 0011 D1a | 按卷子归属人的阶梯排；归属人为空时按组卷人自己的 | 二·D7b |
| D8 题组要不要归属人 | 已裁 | 没有；归属人只在错题上，一次录入的一组题默认同一个归属人，保存后可逐题改 | 二·D8 |
| D11 Today 页各区块按哪些错题算 | 已裁 | 要做的（今天的重做、计划、掌握进度与阶梯分布）按默认归属人的错题、用我的阶梯；做过的（连续天数、里程碑、回顾、本周目标）按我在所有错题上的作答 | 二·D11 |
| D12 从没做过某题的用户，阶梯从哪里起算 | 已裁 | 照起点算：没有作答时 `step 1`、录入次日到期、错 1 次，不另定规则 | 二·D12 |
| D13 谁能改、删错题与检验卷 | 已裁 | 照旧谁都能改能删（含改归属人）；删错题的确认句写明所有人的作答一起删 | 二·D13 |
| D9 术语表怎样改 | 已裁 | 加 User（用户）与 Owner（归属人）两条；默认归属人写进 `DATA.md`；写死 Sophia 的定义改为不指名 | 二·D9 |
| D10 ADR 怎样改 | 已裁 | 重写 ADR 0002 并改名，含归属人只做默认筛选的理由；改 ADR 0004：作答记作答人、阶梯现算、补同时写的代价 | 二·D10 |

## 目的

用户原话：「I want to improve the 'account' design and implementation of this app: 1. all users need to login with an claude account. (For now, there are 'lengthlong@gmail.com' 'sophia.zm.shi@gmail.com' and 'xidianyy@gmail.com'). 2. the settings belongs to one user. 3. the exercises belongs to one user, which is called 'exercise owner'. The default 'owner' for each user is 'empty', meaning 'public' that any user can see and redo. The default owner of current user can be changed in 'settings'. 4. each user has his/her own 'today' page, where he/she can redo the exercises. each user has his/her own history.」

本轮具体交付：

1. 设计：`CONTEXT.md`（用户、归属人等词条，及现在写死「Sophia」的定义）、`DATA.md`（用户、设置、错题归属、按人分开的作答与阶梯、旧数据的迁移）、`adr/`（取代 ADR 0002 的账号决定；按 D4 决定是否改 ADR 0004）。
2. 实现：`app/arena.html` 认出当前用户、按用户筛错题与作答、设置页加默认归属人、录入与编辑可改归属人；`app/logic.test.js` 为新的纯逻辑加断言。
3. 数据：按 D5 迁移真实数据。

完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；本地测试壳里以两个模拟用户各看一遍 Today、错题、检验卷与设置，数字逐项核对。重新发布、在分享菜单里邀请另两个账号、以另两个账号实际打开验证，由用户决定何时做（发布与邀请是对外动作）。

## 输入

- 讨论 0001–0009（已完成）。0001 与 ADR 0002 定下「经家长账号使用，不区分学生与家长」，本轮会推翻；0003 定下作答嵌在错题里（ADR 0004），本轮的 D4 会碰到它。
- 同主题未完成讨论：无。

---

## 一、证据

### E1 现在的身份与数据（读源码与 `DATA.md`）

- 页面不认人：声明的能力是 `db`、`assets`、`sample`、`downloads`，没有 `user`。界面写死「Hi Sophia」，识别提示词与空状态文字也写「Sophia」。
- 全部数据共享一份：`exercises/*`、`sets/*`、`papers/*`、`settings/main`。阶梯的派生字段（`step`、`due`、`mastered`…）存在错题文档上，只有一套。
- 真实数据：86 道错题（0009 的 E2，2026-10-15 实测），作答只有两张英文检验卷的 25 次。

### E2 平台怎样告诉页面「谁在看」（读运行时契约 0.2.80 的 `user.d.ts`、`db.d.ts`）

- 打开页面本来就要登录 claude.ai；未登录时 `claude.use("db")` 返回 `null`。谁能打开由 Artifact 的分享菜单决定：主人所在组织的成员，加上按邮箱邀请的访客（guest）。页面自己不能邀请人。
- 声明 `user: {}` 后，`id()` 给当前用户一个不透明的 id，在「拥有本 Artifact 的组织」这个范围内永久稳定，可以存进 `db` 当键。契约要求只存 id，名字、头像、邮箱每次显示时用 `profiles(ids)` 现取。
- 加 `scopes: ["profile","email"]` 可以取名字与邮箱，但「还要该用户所在组织允许」，取不到时为 `null`。
- **未知，影响 D2：** 契约写明「a guest the platform gives none」与「an editor invited from outside the organization writes and may have none」—— 从组织外邀请的访客可能拿不到 id。三个都是 gmail 账号，lengthlong 之外的两个大概率是访客。拿不到 id 就无法按人存数据。需要实测：发一个只读 `user` 的探针页，邀请另一个账号打开，看 id 与邮箱是否有值。
- `db` 的权限按路径与分享级别定（`view` < `interact` < `admin` < `owner`），默认登录者能读共享文档、`interact`（分享菜单的 Contributor）及以上能写。`data/users/{self}/` 只有本人能读写，连 Artifact 主人和 agent 的 `ArtifactData` 也读不到。权限不能按文档里的字段（如归属人）区分。
- `db` 每个文档上限 256 KiB；同一文档同一时刻只宜一处写入。

### E3 现在作答怎样写（读 `arena.html` 第 1432 行附近）

写作答时读出整份 `attempts`，追加一条，连同派生字段一起 `update` 回去。两个人同时给同一道错题写作答，后写的会覆盖先写的那条。

### E4 术语表里写死 Sophia 的词条（读 `CONTEXT.md`）

Exercise Arena、Exercise、Error cause、Attempt、Review ladder 的定义都以「Sophia」为主语，例如「Sophia 做错后被录入练习场的一道题」。有了多个用户，这些定义要改主语。

### E5 身份探针（2026-10-15，实测）

- 发布私有探针页 `https://claude.ai/artifact/R2AUK76d52LSUwySR5ZgNp`，只声明 `user`，显示 `id`、名字、邮箱、`isOwner`、`canEdit`、`can("data.write")`，不存数据。
- 声明 `scopes: ["profile","email"]` 时平台拒绝发布：「unknown scope (use "profile")」。**本账号拿不到邮箱**，页面不能按邮箱认人。
- 用户回报的结果（2026-10-15）：

  | 账号 | `id` | 名字 | 邮箱 | `isOwner` | `canEdit` | `can("data.write")` |
  |---|---|---|---|---|---|---|
  | Sophia（受邀 Editor） | `u_NXoYbNGfkKlQUeHFusW3KQ` | Sophia Shi | 无 | false | true | 无（`null`） |
  | Aaron（主人） | `u_p8FtsixDb3mSGROTa5WIAw` | AaronShi | 无 | true | true | true |

- 结论（实测）：组织外受邀的 Editor 拿得到 id 与名字。`can("data.write")` 对她返回 `null`，按契约是「平台没说」，页面要保留写入控件、由写入是否被拒决定。
- 推断：契约写明 id 在「拥有该 Artifact 的组织」范围内对所有 Artifact 相同，探针与练习场同属 Aaron，所以上表的 id 就是她们在练习场里的 id，可直接用于迁移。xidianyy 未测；它与 Sophia 同是组织外受邀的 Editor，推断结果相同，落盘后打开练习场时确认。

---

## 二、提议与裁决

### D1 本轮交付什么、范围到哪里

已裁（用户原话，见「目的」）。

### K1 Sophia 自己的 Claude 账号与条款（实质顾虑）

证据：ADR 0002 的背景写明，Anthropic 消费者条款要求用户至少 18 岁或达到当地法定同意年龄；Sophia 是小学五年级学生，「不能有自己的账号」，所以当时定为经家长账号使用。本轮名单里的 `sophia.zm.shi@gmail.com` 看名字是 Sophia 本人的账号。

这条顾虑不由 agent 下结论，请用户确认：这个账号由谁持有、是否符合条款。它影响 D5（旧数据归谁）与 D10（ADR 0002 怎样改）。

- A **由家长持有使用**：在练习场里代表 Sophia 的错题与进度，照常当一个用户；ADR 写明是否符合条款由账号持有人判断。
- B 本轮只用两个家长账号，Sophia 的进度挂在一位家长名下；代价是以后加账号要再迁移。
- C 三个账号都当普通用户，条款的事由用户负责。

**裁决（2026-10-15）：A，由家长持有使用。**

同一次答复里，对「发探针页、邀请另一个账号实测 id」的回答是：「The app will not be shared to 'visitors'.」见 D2。

### D2 怎样认出是哪个用户

用户补充（2026-10-15）：「These three are independent accounts. The other two are 'Editor' of this app.」即三个是各自独立的个人账号，另两个已在分享菜单里被邀请为 Editor。按 E2，它们对 lengthlong 拥有的 Artifact 而言是组织外邀请的访客，契约说这样的 Editor「may have none」（可能没有 id）。用户说的「不分享给 visitors」指不分享给这三个账号之外的人，不改变这一点。

取证：发一个只读 `user` 的探针页实测（见 E5）。

候选（按实测结果二选一）：

- A **用平台给的 id。** 谁能打开练习场由分享菜单决定（现在就是三个账号）。页面声明 `user`，每人第一次打开时写一份 `users/{id}`，只存 id；名字每次显示时用 `profiles()` 现取。前提：三个账号都拿得到 id。
- B **实测拿不到 id 时的退路：页面里自选身份。** `db` 里存三个用户的显示名；第一次打开时选「我是谁」，记在这台设备的浏览器里。代价：谁都能选成别人，换设备要重选，页面不能核实身份。

实测结果见 E5：A 的前提成立。未测：一位用户能否取到别人的名字（契约：访客只看得到平台已向其显示名字的人）；取不到时显示「Someone」。

**裁决（2026-10-15）：A，用平台 id。**

**暂缓（2026-10-15，已由实测解除）：** 用户：「Skip the probe for now; continue discussing D3–D10 and mark D2 as depending on the probe.」D3–D10 按「每个用户有一个稳定的标识」来讨论，A、B 都满足这一点；落盘前必须先测完再裁 D2。

### D3 有归属人的错题谁能看、谁能重做

证据：用户原话只说了公开错题「any user can see and redo」。按 E2，`db` 的权限不能按字段区分，所以无论选哪项，限制都只在页面上做：三个账号都是 Editor，agent 的 `ArtifactData` 也能读到全部。

例子：xidianyy 拍下 Sophia 科学卷的错题，录入时归属人是 Sophia。

- A（推荐）**只有归属人能看、能重做。** 在 xidianyy 的「错题」列表、Today 和检验卷里都看不到这道题；要看要改，就用 Sophia 的账号打开（按 K1，这个账号由家长持有）。代价：录入的人保存后在自己的账号里就看不到这道题了。
- B **谁都能看、能改，只有归属人能重做。** xidianyy 的「错题」列表里看得到这道题，可以改；Today 和检验卷只排给 Sophia。代价：「错题」列表要加按归属人筛选，否则几个人的错题混在一起。
- C **归属人和录入的人都能看。** 错题多存一个「录入人」字段。代价：多一个概念；录入人能看能改，但不能重做，规则更绕。

**裁决（2026-10-15）：三项都不取。** 用户原话：「Every one can see and redo the exercises, no mater whom they belong to. The 'current' user has a 'default owner'(Let's say the value is A) in his or her settings. And by default, the current user will redo A's exercises after clicking 'Start today's redo' button on his 'Today' page.」

即：归属人不限制谁能看、谁能重做；设置里的默认归属人决定当前用户的每日重做默认取谁的错题。由此要澄清的点另立 D3a、D3b。

### D3a 默认归属人为空时，每日重做取哪些错题

用户最初说「The default 'owner' for each user is 'empty', meaning 'public'」。例子：xidianyy 的默认归属人为空，库里有 80 道归属 Sophia 的错题和 6 道没有归属人的错题。

- A（推荐）**只取没有归属人的错题。** xidianyy 的每日重做只排那 6 道。与「空即公开」一致。
- B **取全部错题。** 86 道都排。代价：「空」在这里的意思变成「不筛」，与录入时「空即公开」不是一回事。

**裁决（2026-10-15）：A。**

### D3b 默认归属人是否也是新录入错题的归属人

用户最初说「The default owner of current user can be changed in 'settings'」，没说录入时用不用它。

- A（推荐）**是。** xidianyy 的默认归属人设为 Sophia 后，录入的错题归属人默认填 Sophia，保存前可改。一个设置管两处。
- B **不是，录入时另选。** 每次录入都选归属人，或另设一个「录入默认归属人」。代价：多一个设置或多一步操作。

**裁决（2026-10-15）：A。**

### D4 公开错题被几个人重做时，阶梯与作答怎样分人存

证据：按 D3，谁都能重做任何一道错题；按 D1，每人有自己的作答历史，所以复习阶梯也要按人算。现在阶梯的派生字段（`step`、`due`、`mastered`、`wrongCount`、`lastAttemptAt`）在错题文档上只有一套，页面直接读它们（E1）；`deriveState` 由 `createdAt` 与作答依次推出，86 道错题在页面加载时重算一遍不费事。E3：两个人同时给同一道错题写作答，后写的会覆盖先写的。

例子：Sophia 与 xidianyy 都重做「义卖会传单」第 3 题，Sophia 做对升到第 2 级，xidianyy 做错留在第 1 级。

- A（推荐）**作答仍嵌在错题里，每条作答记下是谁做的（`by`）；阶梯不再存，页面按当前用户的作答现算。** 错题文档只多一个作答字段，ADR 0004 的「嵌在错题里」不变，只删掉「派生字段随作答写回」。代价：用 `ArtifactData` 看数据的 agent 要自己用 `deriveState` 算阶梯；两人同时重做同一道题仍可能丢一条作答（一家人用，很少碰上）。
- B **作答仍嵌在错题里，阶梯按人分开存**：错题上存一个按用户 id 分开的阶梯表，写作答时写回当前用户那一份。代价：多存一份要保持一致的数据；同时写的风险与 A 相同。
- C **每人每题一份进度文档**（如 `progress/<用户>__<错题>`），存这个人对这道题的作答与阶梯，错题文档不再存作答。代价：推翻 ADR 0004，要迁移全部作答，页面要把两个集合拼起来；好处是不同人的作答不会互相覆盖。

**裁决（2026-10-15）：A。**

### D4a 能看、能改判谁的作答

证据：现在作答可以改判（`judgedBy: "parent"`，界面显示「改判」），ADR 0002 定下谁都能用全部功能。按 K1，家长持有 Sophia 的账号，要看 Sophia 的历史可以换账号打开。

例子：xidianyy 打开「义卖会传单」第 3 题的详情。

- A（推荐）**只看、只改判自己的作答。** 详情、Today 的回顾与检验卷结果都只显示 xidianyy 自己的作答；看 Sophia 的作答要用 Sophia 的账号。符合「每人有自己的历史」。
- B **能看所有人的作答，只改判自己的。** 详情里按人分组列出全部作答。代价：详情页要显示作答人名字，界面更挤。
- C **能看、能改判所有人的作答。** 代价同 B，另外别人能改动你的阶梯。

**裁决（2026-10-15）：B，能看所有人的，只改判自己的。** Today 的计划、回顾、连续天数与里程碑仍只按当前用户自己的作答算（D1「each user has his/her own 'today' page」）。显示作答人名字要用 `profiles()`，访客的名字能否取到同样待 E5 实测；取不到时显示「Someone」之类的占位。

### D5 已有的 86 道错题与作答归谁

证据：现有 86 道错题都是 Sophia 做错的题；25 次作答都是 Sophia 在 10-14 做的两张英文检验卷（E1）。作答的 `by` 要填 Sophia 的用户 id，这取决于 D2 的实测，所以作答的迁移排在 D2 之后。

- A（推荐）**错题的归属人都设为 Sophia，作答的作答人都设为 Sophia。** Sophia 的账号默认归属人设为她自己后，Today 照旧。
- B **错题都设为公开（空），作答人设为 Sophia。** 三个人默认都能在 Today 里重做这 86 道。代价：与这些题实际属于 Sophia 不符。

**裁决（2026-10-15）：A，都归 Sophia。**

### D6 设置怎样分人存，默认归属人能选谁

证据：现在只有一份 `settings/main`（`dailyLimit` 18、`practiceDays`、`papersPerWeek`）。`data/users/{self}/` 下的文档连 agent 的 `ArtifactData` 也读不到（E2）。

- A（推荐）**每人一份 `settings/<用户 id>`**，在现有三项之外加默认归属人（用户 id，或空表示公开；初始为空）。默认归属人从「打开过练习场的用户」与「公开」里选，可以选自己。现有的 `settings/main` 迁成 Sophia 的设置，默认归属人设为 Sophia。
- B **放在每人的私有路径 `data/users/{self}/settings`。** 别人与 agent 都读不到。代价：agent 无法帮忙查或修设置。

**裁决（2026-10-15）：A。**

### D7 检验卷属于谁

证据：检验卷存为 `papers/*`，作答带 `paperId`。按 D3，每日重做默认取当前用户默认归属人的错题。

例子：xidianyy 的默认归属人是 Sophia，组一张科学检验卷。

- A（推荐）**检验卷属于组卷的人（多存 `by`），只在他自己的检验卷列表里出现；从默认归属人的错题里抽题，是否已掌握按组卷人自己的阶梯算。** xidianyy 从 Sophia 的科学错题里抽题，卷子只出现在 xidianyy 那里，由 xidianyy 来做。
- B **检验卷所有人都看得到、都能做。** 代价：一张卷可能被几个人做，「得分」要按人分开算，列表也混在一起。

**裁决（2026-10-15）：B。** 由此要定的点另立 D7a、D7b。

### D7a 检验卷怎样按人记完成、出现在谁的 Today

证据：现在交卷时一次写入每题一条作答（`mode: "paper"`、`paperId`），再把卷子的 `status` 改为 `done`（`arena.html` 第 1511–1514 行）。Today 的「Check papers to do」列出全部 `status: "open"` 的卷子；每周目标数做完的卷子。

例子：xidianyy 的默认归属人是 Sophia，组了一张科学卷。

- A（推荐）**每人每张卷做一次；某人做没做完、得几分，都由此人带这张卷 `paperId` 的作答算出，卷子上不再存 `status` 与 `finishedAt`。卷子记下组卷时的归属人（即组卷人的默认归属人，可为空）；Today 只列「归属人等于我的默认归属人、我还没做」的卷子。** 这张科学卷出现在 Sophia 的 Today（她的默认归属人是自己），不出现在 xidianyy 的 Today，但 xidianyy 在「检验卷」列表里看得到、也能做。每周目标数我自己做完的卷子。
- B **同上，但 Today 列出所有我还没做的卷子，不看归属人。** 代价：家长为 Sophia 组的卷子也会堆在家长自己的 Today 里。

**裁决（2026-10-15）：A。** 已有的两张英文检验卷随 D5 记归属人为 Sophia；它们的完成由 Sophia 的作答算出。

### D7b 组卷时按谁的阶梯挑题

证据：`drawPaper` 在选定科目与专题的错题里，按错的次数、是否掌握、上次作答排序取前 N 道；这三项按 D4 都按人算。D3 定下组卷与每日重做一样从组卷人的默认归属人的错题里取。

例子同上：xidianyy 为 Sophia 组卷，xidianyy 自己从没做过这些题。

- A（推荐）**按卷子归属人的阶梯排；归属人为空（公开题）时按组卷人自己的。** 为 Sophia 组的卷子挑的是 Sophia 错得最多的题。
- B **一律按组卷人自己的阶梯。** 规则只有一条；代价：家长为 Sophia 组卷时，家长没做过这些题，排序等于没排。

**裁决（2026-10-15）：A。**

### D8 题组要不要归属人

证据：题组（`sets/*`）只存共享的材料与词表，错题各自指向它（ADR 0003）。

- A（推荐）**题组没有归属人。** 归属人只在错题上；一次录入的一组题默认同一个归属人，各题保存后可以分别改。
- B **题组有归属人，组里的错题跟着它。** 代价：错题的归属人有两个来源，改组的归属人要连带改题。

**裁决（2026-10-15）：A。**

### D11 Today 页各区块按哪些错题算

证据：起草核销表时发现的新选择。Today 页（0009 定）从上到下：问候与鼓励（连续天数、里程碑）→ 今天（每日重做、未做的检验卷）→ 计划 Next 7 days（预计题数、本周目标）→ 回顾 Last 7 days（复习了几题、新掌握、对比、建议）→ 掌握进度与阶梯分布。按 D3，每日重做只取默认归属人的错题；按 D4a，Today 只算当前用户自己的作答。两者都没说「掌握进度、回顾、里程碑」数哪些错题。

例子：xidianyy 的默认归属人是 Sophia，上周还重做过几道公开错题。

- A（推荐）**「要做的」按默认归属人的错题，「做过的」按我在所有错题上的作答。** 今天的重做、计划的预计题数、掌握进度与阶梯分布只数 Sophia 的错题（用 xidianyy 自己的阶梯）；连续天数、里程碑、回顾、本周目标数 xidianyy 在任何错题上的作答。
- B **全部只按默认归属人的错题。** 回顾与里程碑里看不到 xidianyy 做的公开错题。代价：改了默认归属人，连续天数与回顾跟着变。
- C **全部按所有错题。** 代价：计划与阶梯分布里混进不会排进每日重做的题，预计题数对不上。

**裁决（2026-10-15）：A。**


### D12 从没做过某题的用户，阶梯从哪里起算

证据：复审 F6。按 D4，一位用户对一道错题的阶梯由该用户的作答现算；没有作答时就是起点：`step = 1`、`due = createdAt + 1 天`、`wrongCount = 1`（`DATA.md`「派生字段」）。所以 Aaron 把默认归属人改成 Sophia 后，86 道题几乎全部立刻到期（按每日上限截断），每道都显示「错 1 次」，计划区会提示积压；而 Sophia 在 10-14 做对的题已经顺延到 10-16。

- A（推荐）**照起点算，不另定规则。** 从没做过的题对这位用户都算到期，按每日上限慢慢做；「错 1 次」照旧算录入时那次错。规则最少；代价：第一次换默认归属人时积压大，计划与建议会提示加大上限。
- B **录入时那次错只算在归属人身上。** 别人从「错 0 次」起算；到期仍从录入日起算。代价：`deriveState` 要知道作答人是不是归属人，多一条规则；组卷排序（按错的次数）对公开题也会变。

**裁决（2026-10-15）：A。**

### D13 谁能改、删错题与检验卷

证据：复审 F9。D3 只裁了「谁都能看、能重做」。现在页面上谁都能编辑、删除错题（删除时整道题连同全部作答一起删，`arena.html` 第 1344 行），谁都能删检验卷；ADR 0002 现行写的是「所有功能谁都可以用」。有了多位用户，删一道错题会连别人的作答一起删掉。

- A（推荐）**照旧，谁都能改、能删，包括改归属人。** 删除确认句改为「删除后不能恢复，所有人在这道题上的作答一起删掉」。不引入角色；与 ADR 0002 的「不分学生与家长」一致。
- B **只有归属人能删错题；公开错题谁都能删。** 代价：多一条按人的权限规则，而 `db` 不能真正限权（E2），只是页面上藏按钮。

**裁决（2026-10-15）：A。**

### D9 术语表怎样改

证据：E4，五个词条以「Sophia」为主语；本轮新出现的概念是用户、归属人、默认归属人。

改主语是已裁内容的机械落实（Exercise、Attempt、Error cause、Exercise Arena 的定义改成不指名某个人；Streak、Milestone、Mastered、Review ladder、Daily redo、Check paper 写明按用户算），在核销表里逐条列出，不另设题。要裁的是加哪些词条：

- A（推荐）**加两条：User（用户）与 Owner（归属人）。** User：用自己的 Claude 账号打开练习场的人。Owner：错题所属的那位用户；为空的错题是公开错题。默认归属人是一项设置，写进 `DATA.md`，在 Owner 的定义里不另立词条。
- B **加三条：再加 Default owner（默认归属人）。** 代价：多一个词条；好处是界面与讨论里常用这个词，有统一说法。

**裁决（2026-10-15）：A。** 定稿词条：

```markdown
### User（用户）

用自己的 Claude 账号打开练习场的人。每位用户有自己的设置、作答与复习阶梯。

_Avoid_: 账号、成员

### Owner（归属人）

错题所属的那位用户。归属人为空的错题是公开错题。归属人不限制谁能看、谁能重做。

_Avoid_: 所有者、拥有者、主人
```

### D10 ADR 怎样改

证据：ADR 0002「练习场经家长账号使用，不区分学生与家长」的决定被推翻；ADR 0004 写着「阶梯的派生字段随作答一并写回这份文档」，按 D4 不再成立。「归属人不限制谁能看、谁能做，只决定默认重做谁的题」容易让后人困惑，且有真实取舍（`db` 不能按字段限权）。

- A（推荐）**重写 ADR 0002 并改名**（如 `0002-each-user-opens-the-arena-with-their-own-claude-account.md`），一并写进归属人只做默认筛选、不限权的理由；**改 ADR 0004**：作答记作答人、阶梯现算，补两人同时写可能丢作答的代价。
- B **重写 ADR 0002、改 ADR 0004，另立 ADR 0005** 专讲归属人只做默认筛选。代价：多一个文件；好处是一个 ADR 一个决定。

**裁决（2026-10-15）：A。**

---

## 三、核销表

用词：「我」指当前用户（平台 `id()`）；「我的视图」指把每道错题的作答只留 `by` 等于我的、再用 `deriveState` 现算阶梯后的副本，原作答另存在 `allAttempts`；「某归属人的错题」指 `owner` 等于该值的错题，两边为空（`null` 或省略）也算相等。页面状态 `S.exercises` 始终存数据库里的原文档，视图在渲染时现算；所有写回错题的地方都从原文档出发。Sophia 的 id 为 `u_NXoYbNGfkKlQUeHFusW3KQ`，Aaron 的为 `u_p8FtsixDb3mSGROTa5WIAw`（E5）。别人的名字一律 `name || "Someone"`（D2 的未测项）。下文函数都放进纯逻辑块（`LOGIC:BEGIN…END`）。

| # | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | D9 | `CONTEXT.md` | 开头一句改为「录入错题（文字或照片），每位用户按复习阶梯重做，用检验卷确认是否掌握」。在「Exercise Arena」后加 User（用户），在「Exercise」后加 Owner（归属人），定义与 `_Avoid_` 按 D9 定稿；新 `_Avoid_` 词不进 `terms`（「账号」「主人」等有合法用法） |
| 2 | D1、D3、D3a、D4、D7、D11 | `CONTEXT.md` | 改写不指名：Exercise Arena「为用户录入错题、安排重做、组检验卷的网页」；Exercise「做错后被录入练习场的一道题，连同正确答案、讲解、当时的错答、错因和归类。错题可以属于一个题组，可以有一个归属人」；Error cause「当初做错的主要原因…」；Attempt「一位用户对一道错题的一次作答，连同判定结果…」；Review ladder 后加「每位用户对每道错题各有一条阶梯」；Due「错题对一位用户的下次重做日已到或已过」；Daily redo「当天为一位用户列出的到期错题，取自其默认归属人的错题（默认归属人为空时取公开错题），大致以题数上限为准；同一题组的题不拆开」；Streak、Milestone、Weekly goal 前加「一位用户的」；Mastered「错题在一位用户的复习阶梯第 4 级做对后的状态…」；Check paper「选定科目、专题和题数后，从一位归属人的错题或公开错题里抽出的一次性小测，用来确认掌握；每位用户各做一次」。其余词条不动 |
| 3 | D2、D6 | `DATA.md` | 新增 `users/{id}` 一节：文档 id 是平台给的用户 id（不透明，只在拥有本 Artifact 的组织范围内可比），字段 `joinedAt`（日期）；页面在当前用户第一次打开、文档不存在时写入；名字、头像不存，显示时向平台现取。开头补一句「用户 id 一律存平台 `id()` 的原值」 |
| 4 | D3、D3b、D4、D5、D8、D12 | `DATA.md` | `exercises` 表：加 `owner`（用户 id 或 `null`，可省，省略等同 `null`，即公开错题；题组没有归属人）；`wrongAnswer` 说明改为「当时的错答」；派生字段一行改为「不再写入，已有的忽略；按用户现算，见『派生字段』」。作答表加 `by`（用户 id，必填，作答人）；`response` 说明改为「作答人的回答」 |
| 5 | D7、D7a | `DATA.md` | `papers` 表：加 `owner`（用户 id 或 `null`：组卷时组卷人的默认归属人）；`status`、`finishedAt` 并入「不再写入，已有的忽略」那一行（与 `takenOn`、`score` 同）；表下写：一位用户做完一张卷，当且仅当有带本卷 `paperId`、`by` 为本人的作答；完成时刻取这些作答中最晚的 `at`（没有 `at` 时取 `date`）；每位用户每张卷只做一次 |
| 6 | D6 | `DATA.md` | `settings/main` 一节改为 `settings/{用户 id}`：每位用户一份，缺文档时全按默认值；表加 `defaultOwner`，默认 `null`（公开），值为用户 id，不是字符串时读成 `null`；保存时四个字段一起写 |
| 7 | D4、D12 | `DATA.md` | 「派生字段」改为：一位用户对一道错题的阶梯，由 `createdAt` 与该用户的作答（`by` 等于其 id）依次推出，页面渲染时现算、不存；没有作答时为起点（原代码块保留），对所有用户相同 |
| 8 | D4、D4a、D7a、D13 | `DATA.md` | 「写入规则」加：**作答只动自己的。** 新作答写本人的 `by`；改判只改 `by` 为本人的作答；写回 `attempts` 时保留别人的作答，不写派生字段。**删除错题连带所有人的作答。** 并发的代价见 ADR 0004 |
| 9 | D10、D2、D3、D13、K1 | `adr/0002-…` | 删除 `0002-arena-is-used-through-the-parent-account.md`，新建 `0002-each-user-opens-the-arena-with-their-own-claude-account.md`。背景：多人各有设置与历史；平台 `user` 能力给稳定的不透明 id，受邀的组织外 Editor 也拿得到（E5 实测），拿不到邮箱；`db` 只能按路径与分享级别限权。决定：每人用自己的 Claude 账号打开，谁能打开由分享菜单决定；页面按平台 id 认人、只存 id；不分学生与家长，全部功能谁都能用，包括改、删错题与检验卷（D13）；归属人只决定每日重做与组卷默认取谁的错题，不限制谁能看、能做、能改（D3）。理由：平台现成的身份免去自建登录（用户裁决 D2）；`db` 不能按字段限权，页面上的限制挡不住受邀者直接改数据（agent 的论证）。代价：受邀者都能读改全部数据，删错题会连别人的作答一起删；id 不能跨组织带走（导出数据里是 id）；`sophia.zm.shi@gmail.com` 由家长持有使用，是否符合 Anthropic 条款由账号持有人按条款原文判断，本 ADR 不下结论 |
| 10 | D10、D2 | `adr/0001-…` | 「决定」与「代价」第三条的能力列表加 `user`（认出当前用户）；「代价」第二条改为「页面经每位用户自己的 Claude 账号打开，见 [ADR 0002](./0002-each-user-opens-the-arena-with-their-own-claude-account.md)。」 |
| 11 | D10、D4 | `adr/0004-…` | 决定改为：作答存在错题文档的 `attempts` 数组里，每条记下作答人；阶梯按用户由作答现算，不存。理由改为：读一道错题就拿到所有人的全部作答，推出任一用户的阶梯、改判与看板都不用跨集合查找；几位用户的阶梯都由同一份作答推出，不必为每人另存一份要保持一致的数据。代价加：两位用户同时给同一道错题写作答，后写的会覆盖先写的那条；读数据的 agent 要自己按作答人重算阶梯；作答随人数增长，单个文档上限 256 KiB |
| 12 | D2 | `app/arena.html` 启动 | 头部注释的能力加 `user`（scope `profile`）。启动时取 `user` 与 `me().id`；拿不到 `db` 或 id 时显示说明「请用受邀的 Claude 账号登录后打开本页。」（替换「请用家长的 claude.ai 账号打开本页」那段），不读写数据。`users/{我}` 不存在时写入 `{ joinedAt: 今天 }`。订阅 `users` 集合与 `settings/{我}`（替换 `settings/main`）。`<title>`、导出文件头的「Sophia's Exercise Arena」是练习场的名字，不改 |
| 13 | D4、D4a、D12 | `app/arena.html` 纯逻辑与写入 | 加 `viewFor(exs, uid)`（我的视图）；加 `ownedBy(exs, owner)`；加 `attemptGroups(e, uid)`：把原文档的全部作答按作答人分组，我在最前，组内按时间。`writeAttempts(e, attempts)` 只写 `attempts`，数组由原文档的全部作答加上或改动本人的那条组成。`saveDraft` 新录入时写 `owner`、`attempts: []`，不写派生字段；编辑时写回原文档的全部作答与（可能改过的）`owner`，不写派生字段 |
| 14 | D3、D3a、D11 | `app/arena.html` 纯逻辑与 Today 页 | 加 `todayScope(exs, uid, defaultOwner)`：返回 `todo`＝我的视图里默认归属人的错题，`done`＝我的视图里的全部错题。用 `todo`：今天要重做的题与「N are due」「Next redo comes up on」两句、计划的预计题数与积压结论、掌握进度条与阶梯分布、回顾里的过期题数与第 4 级题数（「Almost there」）以及由它们而来的建议；用 `done`：连续天数、里程碑、鼓励语里的今天新掌握、回顾（复习了几题、作答次数、练了几天、新掌握、错得最多的专题）、本周目标进度。`dashboardData`、`weekReview` 改为分别接收 `todo` 与 `done`，现有规则不变。全库没有错题时照旧显示空页说明；有错题但 `todo` 为空时，今天一块写「No questions for <归属人名字或 public> yet — choose a default owner in 设置.」。问候「Hi Sophia」改为「Hi <我的名字>」，取不到名字时「Hi」 |
| 15 | D7、D7a、D7b | `app/arena.html` 纯逻辑与检验卷 | 纯逻辑：`paperDoneOn(p, view)` 由我在视图里带本卷 `paperId` 的作答算出完成时刻（没有为 `null`）；`goalProgress`、`weekReview` 判卷子做完改用它，不再看 `status`、`finishedAt`；加 `papersToDo(papers, view, defaultOwner)`：`owner` 等于我的默认归属人、我还没做的卷子；加 `rankView(exs, owner, uid)`＝`viewFor(exs, owner || uid)`。组卷：卷子写 `owner` 为我的默认归属人；从该归属人的错题里抽，`drawPaper` 用 `rankView` 排序；组卷表单的专题计数与预览里的「错 N 次」用同一视图。交卷：已做判断与「该题已有本卷作答」都只看我的作答；只写作答，不再改卷子。卷面详情的完成时间取 `paperDoneOn`。「检验卷」列表列出全部卷子，每行加归属人名字（公开写「公开」），状态与得分按我的作答，我还没做的卷子带「开始」按钮。Today 的「Check papers to do」用 `papersToDo`。生成后的提示改为「检验卷已生成。」 |
| 16 | D3、D3b、D8、D13 | `app/arena.html` 录入、编辑与删除 | 录入页加「归属人」选择（公开 + `users` 里的每位用户），默认我的默认归属人，一次录入的整批共用；编辑错题时可改归属人。删除确认句改为「删除后不能恢复，所有人在这道题上的作答一起删掉。」空列表说明里的「拍一张 Sophia 做错的题」改为「拍一张做错的题」；「她当时的答案」等录入与详情字段名去掉「她」（「当时的答案」） |
| 17 | D4a | `app/arena.html` 错题详情与列表 | 显示归属人名字；「作答记录」按 `attemptGroups` 分人列出，每组标作答人名字，表头「她的回答」改为「回答」；只有我那一组带改判下拉框，别人的结果只读。「阶梯」一格显示我的阶梯。错题列表的排序（到期、阶梯）用我的视图 |
| 18 | D6 | `app/arena.html` 设置页与导出 | 加「默认归属人」选择（公开 + `users` 里的每位用户，可选自己）；四个字段经 `readSettings` 后写入 `settings/{我}`；`readSettings` 加 `defaultOwner`。导出：错题、题组、卷子按数据库原文档导出（含全部作答与 `by`），卷子不再附算出的 `score`；另带 `users` 的 id 列表与我的设置 |
| 19 | D2–D13 | `app/logic.test.js` | 导出清单补 `viewFor`、`ownedBy`、`attemptGroups`、`todayScope`、`paperDoneOn`、`papersToDo`、`rankView`，并跟上改了签名的函数。加断言：`viewFor` 只留本人作答、两人对同一题阶梯不同（一人做对到第 2 级、另一人做错留第 1 级）、没有作答时为起点（错 1 次、录入次日到期）；`ownedBy` 的 `null` 与省略相等、按 id 筛；`attemptGroups` 我在前；`todayScope` 的 `todo` 只含默认归属人的错题、`done` 含全部、默认归属人为空时 `todo` 只含公开错题；`paperDoneOn` 按人：一人做完、另一人未做，完成时刻取最晚 `at`、没有 `at` 时取 `date`；`papersToDo` 按归属人与是否做过筛；`rankView` 归属人为空时用组卷人；`goalProgress` 只数我做完的卷；`readSettings` 的 `defaultOwner` 缺省与非字符串为 `null`。现有断言里用到 `status`、`finishedAt` 与 `score` 导出的改成由作答判完成 |
| 20 | D5 | 真实数据（`ArtifactData`） | **落盘验证后另请用户确认再执行**（对外动作），顺序：① 把四个集合全部读出，存到 scratchpad 备份；② `exercises` 每份 `update`：`owner` 设 Sophia 的 id，每条作答加 `by` 为 Sophia 的 id；`papers` 每份 `update`：`owner` 设 Sophia 的 id；写 `settings/{Sophia 的 id}`：`settings/main` 的三个字段加 `defaultOwner` 为 Sophia 的 id；写 `users/{Sophia 的 id}`、`users/{Aaron 的 id}`，`joinedAt` 为当天；③ 紧接着重新发布 `app/arena.html`，能力为 `db`、`assets`、`sample`（images）、`downloads`、`user`（`profile`）；④ 发布后删除 `settings/main`；⑤ 读回各集合核对；请用户用 xidianyy 打开一次，确认拿得到 id（E5 的推断） |
| 21 | 完成标准 | 验证（不改文件） | `./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；落盘者对照本表逐行核对实际稿，记录保真结果；本地测试壳（模拟 `user` 与 `db`）用 10-15 读出的真实数据副本，先按第 20 行在内存里迁移，再以 Sophia、Aaron 两个模拟用户各看 Today、错题、详情、检验卷、设置：Sophia 的 Today 与迁移前一致；Aaron 默认归属人为空时今天一块显示「No questions…」提示；改成 Sophia 后几乎全部到期、按上限截断、都在第 1 级、错 1 次（D12）；Aaron 做一题后 Sophia 的阶梯不变，详情里两组作答、只有自己那组能改判；Aaron 组的卷出现在 Sophia 的 Today，Aaron 在列表里也能开做，两人得分分开；编辑一道 Sophia 做过的题后她的作答还在；拿不到 id 时显示说明页 |
| 22 | —— | 不改 | `CLAUDE.md`、`.design/workspace.yaml`：地图与流程不变。照片识别提示词（`arena.html` 约第 1692–1717 行）仍写「their daughter Sophia」、录入框占位「Sophia chose (1)」、CSS 注释里的 Sophia：只影响 AI 草稿措辞或是示例，不在本轮范围，留给以后。错题列表不加按归属人筛选（D3 未要求） |

---

## 四、复审

派新上下文的 subagent 按简报复审讨论文件与核销表初稿（不给对话）。逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1 `saveDraft` 编辑时整份重写、写派生字段，用视图会冲掉别人的作答 | 成立（`arena.html` 约第 1662、1669 行） | 机械：表头写明 `S.exercises` 存原文档；行 13 补 `saveDraft` |
| F2 列表里没有开做入口，别人的卷子做不了 | 成立（列表只有「查看详情」「删除」） | 机械：行 15 加「开始」按钮 |
| F3 「家长账号」说明、「她的回答」等字样与 `DATA.md` 两处说明漏了 | 成立 | 机械：行 4、12、16、17 补；名字、示例与提示词写进行 22 不改 |
| F4 ADR 0001 能力列表、ADR 0004 理由残留 | 成立 | 机械：行 10、11 补，256 KiB 写进代价 |
| F5 卷面完成时间、交卷判断、组卷计数、导出没覆盖 | 成立（约第 1387、1503、1509 行，`exportData`） | 机械：行 15、18 补 |
| F6 从没做过的用户阶梯起点未裁，行 21 预期写错 | 成立 | 回第 3 步 → D12 裁 A；行 7、19、21 跟着写 |
| F7 D11、D7a、D7b 的规则只在渲染里，没有断言 | 成立 | 机械：行 14、15 改成纯函数 `todayScope`、`papersToDo`、`rankView`，行 19 加断言与 `paperDoneOn` |
| F8 取不到别人名字时的占位没进表 | 成立 | 机械：表头写 `name \|\| "Someone"`；D2 记下未测项 |
| F9 ADR 写进了未裁的「能改」，理由来源未标 | 成立 | 回第 3 步 → D13 裁 A；行 9 标明理由出自 agent、引 D13 |
| F10 Check paper 没覆盖公开卷；Due 没写按用户 | 成立 | 机械：行 2 改 |
| F11 Today 的空状态、`allDue`、`next`、第 4 级题数、`newMasteredToday` 归属未定 | 成立 | 机械：行 14 逐项归入 `todo` / `done`，加 `todo` 为空时的一句 |
| F12 先删 `settings/main` 再发布有间隙 | 成立 | 机械：行 20 改为发布后再删 |
| F13 缺 D9 标题，登记表三行缺「详见」 | 成立 | 机械：已在讨论文件里补上 |

改裁后重写了行 2、4、7–21，并按简报自查：每行对得上登记表的现行裁决；D12、D13 的结论只出现在行 4、7、8、9、16、19、21，与裁决原文一致；「我的视图」「某归属人的错题」只在表头定义一次；行 14 的 `todo` / `done` 分法与 D11 原文一致。改动多但都是补漏与两题的直接落实，没有新的设计方向，认为不必再派复审。

## 分批核销（第 1 批，2026-10-15）

分批理由：用户确认核销表时说「land it (rows 1–19, 21–22); ask me again before row 20's migration and publish」。本批是设计文件、页面源码与测试，能独立验证；第 2 批是行 20，改线上数据并重新发布，属对外动作，等用户另行确认。

| # | 结果 | 实际改动与验证 |
|---|---|---|
| 1 | ✅ | `CONTEXT.md` 开头一句改写；加 User（用户）、Owner（归属人）两条，定义与 `_Avoid_` 同 D9 定稿；`terms` 未动 |
| 2 | ✅ | 按表改写 Exercise Arena、Exercise、Error cause、Attempt、Review ladder、Due、Daily redo、Streak、Milestone、Weekly goal、Mastered、Check paper；Streak、Milestone 两处把「一位用户的」顺成「一位用户一连串…」「一位用户已掌握的…」，含义不变 |
| 3 | ✅ | `DATA.md` 开头补「用户 id 一律存平台 `id()` 的原值」；新增 `users/{id}` 一节与 `joinedAt` |
| 4 | ✅ | `exercises` 表加 `owner`，派生字段行改为「不再写入，已有的忽略」，`wrongAnswer` 说明改；作答表加 `by`，`response` 说明改；`sets` 节加一句「题组没有归属人」 |
| 5 | ✅ | `papers` 表加 `owner`；`status`、`finishedAt` 并入「不再写入」一行；表下写按人判完成、完成时刻、每人做一次 |
| 6 | ✅ | `settings/{用户 id}` 一节，加 `defaultOwner` 与读写规则 |
| 7 | ✅ | 「派生字段」改为按用户现算、不存，起点对所有用户相同 |
| 8 | ✅ | 写入规则加「作答只动自己的」「删除错题连带所有人的作答」 |
| 9 | ✅ | `git rm` 旧 ADR 0002；新建 `adr/0002-each-user-opens-the-arena-with-their-own-claude-account.md`，背景、决定、理由、代价同表；理由第二条标明是 agent 的论证。起草时多写的一条理由（「家里轮流练、归属人当默认筛选已经够用」）不在表内，已删 |
| 10 | ✅ | ADR 0001 的决定与代价第三条加 `user`，代价第二条改为新 ADR 0002 的链接；全仓再无指向旧文件名的链接（冻结的讨论除外） |
| 11 | ✅ | ADR 0004 的决定、理由与代价按表改 |
| 12 | ✅ | 头部注释加 `user`（profile）；启动取 `user` 与 `me().id`，拿不到时显示「请用受邀的 Claude 账号登录后打开本页。…」；登记 `users/{我}`；订阅 `users` 与 `settings/{我}`；`<title>` 与导出文件头未改 |
| 13 | ✅ | 纯逻辑加 `viewFor`、`sameOwner`（内部）、`ownedBy`、`attemptGroups`；`writeAttempts` 只写 `attempts`，`addAttempt` 写本人 `by`；`saveDraft` 新录入写 `owner`、不写派生字段，编辑写回原文档全部作答与 `owner`。`S.exercises` 存原文档，页面用 `mine()` 现算我的视图 |
| 14 | ✅ | 加 `todayScope`；`dashboardData(todo, done, today)`、`weekReview(todo, done, papers, today)` 按表分开；今天一块的「N are due」「Next redo」用 `todo`；`todo` 为空时显示「No questions for <名字或 public> yet — choose a default owner in 设置.」；问候改为「Hi <名字>」，取不到时「Hi」 |
| 15 | ✅ | `paperDoneOn(paper, view)`、`papersToDo`、`rankView`；`goalProgress` 改用 `paperDoneOn`；组卷用 `paperPool()`（默认归属人的错题、按 `rankView` 排），表单加一行说明从谁的错题里抽；卷子写 `owner`；交卷只看我的作答、不再改卷子；卷面详情完成时间取 `paperDoneOn`，改判下标取原文档；列表每行加归属人、按我的作答显示得分或「我未做」与「开始」按钮；Today 用 `papersToDo`；提示「检验卷已生成。」 |
| 16 | ✅ | 录入页「科目」旁加「归属人」选择（默认我的默认归属人，整批共用）；编辑错题表单加归属人；删除确认句、空列表说明、录入字段名去掉「她」 |
| 17 | ✅ | 详情显示归属人；作答按 `attemptGroups` 分人，表头「回答」，只有我那组有改判下拉框；改判处理里另加一道检查，不是本人的作答不写；阶梯一格与列表排序用我的视图 |
| 18 | ✅ | 设置页加「默认归属人」选择；保存写 `settings/{我}`；`readSettings` 加 `defaultOwner`（空串也读成 `null`，与「公开」同义）；导出带 `users` 与我的设置，卷子不附 `score` |
| 19 | ✅ | `app/logic.test.js` 导出清单补 7 个函数；按表加断言；改签名的 `dashboardData`、`weekReview`、`goalProgress`、`exportData` 断言随之改写；`node app/logic.test.js app/arena.html` 输出 all logic tests passed |
| 20 | 第 2 批 | 未执行，待用户确认 |
| 21 | ✅ | `./check.sh` 退出码 0；测试通过。node 比对（10-15 读出的真实数据副本，内存迁移，今天 10-15）：存的派生字段与 `deriveState` 现算 0 处不一致；Sophia 迁移后的每日清单、计划、回顾、看板与旧页面逐项相同（上限 23：每日 23 题、65 道到期、10-21 清完）。本地测试壳（模拟 `user`、`db`）：Sophia 的 Today 同上，问候「Hi Sophia Shi」；Aaron 默认归属人为空时显示「No questions for public yet…」；改成 Sophia 后 86 道都在第 1 级、错 1 次、81 道到期、按上限 10 截断，两张旧卷进他的 Today；Aaron 重做一题、做旧卷，作答带他的 `by`，Sophia 的阶梯与该卷得分（7/10）不变、Aaron 得 0/10；详情两组作答、我在前，只有自己那组能改判，伪造改判 Sophia 那条被忽略；编辑一道题改归属人后两人的作答都在、派生字段不再写入；Aaron 组的科学卷 `owner` 为 Sophia，出现在 Sophia 的 Today；拿不到 id 时显示说明页；新用户第一次打开写入 `users/{id}`，录入默认「公开」，取不到名字显示「Someone」；375 宽深色下详情页无横向滚动。照片识别需要 `sample`，测试壳未走录入保存的 AI 一段 |
| 22 | ✅ | `CLAUDE.md`、`.design/workspace.yaml`、识别提示词、占位文字与 CSS 注释未改 |

实际稿对照核销表逐行核对：事实、字段、条件与界面句一致；表外的改动只有三处，都不带新语义：Milestone、Streak 的措辞顺句；`readSettings` 把空串读成 `null`；改判处理里的本人检查。

未验证：真实 claude.ai 里受邀账号能否取到别人的名字；xidianyy 能否拿到 id；AI 识别后保存新错题的整条路径；线上发布后的页面（第 2 批）。
