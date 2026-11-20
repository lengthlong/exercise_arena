# 0025 段落里的题，题干写成原文中含这道题的整句

> 状态：**✅ 已完成（2026-10-18）**

| 题 | 状态 | 现行裁决 | 详见 |
|---|---|---|---|
| S1 哪些题的题干写成整句 | 已裁 | A：题号、空格或划线在题组材料文字里的题 | 二·S1 |
| S2 整句里别的题的空格与划线怎样处理（含线上 32 道） | 已裁 | B：只留本题的编号与空格或划线；别的空格写成「…」，别的划线词照原文写、不划线不编号 | 二·S2 |
| S3 整句由谁来写 | 已裁 | A：AI 识别时写，只改识别提示词 | 二·S3 |
| S4 规则写在哪里 | 已裁 | A：提示词之外也写进 `DATA.md` 的 `stem` 一行 | 二·S4 |

## 目的

用户要求（原话）：「开讨论：改识别提示词，段落里的题（改错、完形、选词等）题干写成原文中含这道题的整句。」

起因：用户先前指出「Travelling salesman」改错题「(41) [[purrsistent]]」这类题题干太短，要求改成原文中的整句。已按用户直接指示把线上 65 道这样的题改好（见 E3），本轮只管以后录入的题。

本轮交付：按裁决改 `app/arena.html` 的识别提示词（`recognisePrompt`），必要时同步 `DATA.md`；重新发布到原网址。完成标准：`./check.sh` 与 `node app/logic.test.js app/arena.html` 通过；发布后读回核对。

## 输入

- 同主题未完成讨论：无。

---

## 一、证据

- E1 识别提示词（读 `recognisePrompt`）：几道题共用一篇文章、图、表或实验装置时，材料放进 `sets` 一次，题目用 `set` 指向它，并写明「the stem of such a question holds only that question」。改错题另有一句：每个划线词在材料与题干里都写成 `[[word]]`，例子是「(3) [[recieve]]」。材料要照抄、保留空格编号如「(1) ____」。没有要求题干带上下文。
- E2 显示（读 `questionBody`、`materialBlock`）：作答卡上先显示题干，题组材料放在卡片下方、默认收起。所以只写「(41) [[purrsistent]]」时，看不到上下文就答不了，要先点开材料去找第 41 处。
- E3 线上数据（2026-10-18 读 `exercises` 与 `sets`）：题干不超过 4 个词、且属于有材料文字的题组的错题共 65 道，分布在改错（29）、理解完形（9）、语法完形选词（8）、词汇完形（14）、词汇选择（2）等题型，没有一道落在题组之外。已按用户直接指示用脚本从材料里取出含本题编号的那句写回题干；同句里别的题的划线去掉、编号保留（例如「My most vivid memories of you [[be]] (35) how … stories of sirvieval (36) during the Japanese Occupation.」）。改前的题干另有备份。
- E4 `DATA.md` 的 `stem` 一行只写「题目文字；只有照片时可以为空；`[[词]]` 显示为下划线」，没有写段落题的题干怎样取。ADR 0003 定的是题组存材料、阶梯逐题算，没有规定题干的写法。
- E6 用户追加（原话）：「also improve some the questions, like "(26) ____ the first year, a child's bones (27) ____ little calcium and great flexibility.". There are two or more 'blanket/problem's in the question, and I don't know which one should I fill/fix.」线上数据（同日读，含 E3 改过的题干）：题干里有两个及以上编号的错题共 32 道，多数是完形（例如上面的第 26、27 空，两道各是一道错题），也有 E3 改出来的改错题（别的题的划线已去，编号还在）。题干里看不出哪一个是本题。
- E5 页面别处对题干的用法：错题列表与搜索读题干全文（`matchesQuery` 也搜材料），检验卷抽题预览显示题干。题干变长不影响判对（判对只看 `answer`、`accepted`）。

---

## 二、逐题

### S1 哪些题的题干写成整句

证据：E1、E3。

- A（推荐）**按位置定：题号、空格或划线在题组材料文字里的题**，题干写含它的那一整句。新题型也适用；阅读理解问答、科学 (a)(b) 这类题号不在材料里的题不受影响。
- B **只列改错、语法完形、理解完形、词汇完形四种题型**。代价：别的段落题仍会太短，新题型要再加。

**裁决（2026-10-18）：A。**

### S2 整句里别的题的空格与划线怎样处理

证据：E3、E6。用户追加的原话即本题的问题：一句里有两个及以上的空或错，看不出该填、该改哪一个。

- A（推荐）**已知答案就填上，否则写「…」**：同组里有那道题就填它的正确答案，改错词知道改法就写正确的词。代价：做本题时会看到别的题的答案。
- B **别的一律写成「…」**：只留本题的编号与空格或划线；别的空格写「…」，别的改错词照原文写、不划线也不带编号。例：「(26) ____ the first year, a child's bones … little calcium and great flexibility.」。不泄露别的题的答案。代价：句子有缺口。
- C **保留全部、页面加提示**：题干照原文，页面在题干上方写「Answer blank (27)」并高亮。代价：要改显示代码，句子里仍有好几个空。

**裁决（2026-10-18）：B。** E3 改过的题干里「别的题编号保留」的做法随之改掉，线上 32 道题干有两个及以上编号的题一并按本裁决改。

### S3 整句由谁来写

证据：E1。依赖 S1、S2。

- A（推荐）**AI 识别时写**：只改识别提示词，草稿保存前人看得到、可改。代价：AI 偶尔没照做，要靠草稿阶段看出来。
- B **页面保存时自动取**：按题号从材料里取句并按 S2 处理。代价：多一段代码与断言，题号格式不规则时可能取错。

**裁决（2026-10-18）：A。**

### S4 规则写在哪里

证据：E4。

- A（推荐）**也写进 `DATA.md` 的 `stem` 一行**，以后直接改数据或手工录入也照做。代价：多改一个文件。
- B **只写在识别提示词里**。代价：数据契约里看不到，直接改数据时可能又写短。

**裁决（2026-10-18）：A。**

---

## 三、核销表

| 行 | 裁决 | 目标文件 | 改动 |
|---|---|---|---|
| 1 | S1、S2、S4 | `DATA.md` | `exercises` 表 `stem` 一行改为：「题目文字；只有照片时可以为空；`[[词]]` 显示为下划线。题号、空格或划线在所属题组材料文字里的题，题干是材料中含本题的那一整句，照原文抄：只留本题的编号与空格或划线，同句里别的空格写成「…」，别的划线词照原文写、不划线也不带编号」 |
| 2 | S1、S2、S3 | `app/arena.html` | `recognisePrompt`：① 「the stem of such a question holds only that question」改为「… holds only that question (not the whole material)」，其后加：「When the question's number, blank or underlined word sits inside the shared text (for example editing or cloze), its stem is the whole sentence from that text that contains it, copied exactly. Keep only this question's number and its blank or [[underlined word]]; in that sentence write every other blank as "…" and every other underlined word as plain text without its number.」② 字段说明「stem: the question exactly as printed …」后加「; for a question inside the shared text, the whole sentence as described above」。③ 改错一句由「write every underlined word as [[word]] in the set text and in the question stem (for example "(3) [[recieve]]")」改为「write every underlined word as [[word]] in the set text; in a question's stem only its own underlined word (for example "Other times, he finds that people refuse to open the door despite his (41) [[purrsistent]] knocking.")」。④ 录入草稿表单的标签「Question text (only this question; the material is in the set)」改为「Question text (for a question inside the material: the sentence that holds it)」 |
| 3 | S1、S2 | 线上数据 `exercises`（32 道） | 用 `ArtifactData` 改题干里有两个及以上编号的 32 道错题的 `stem`：按出处 `source` 末尾的题号认出本题，从所属题组的材料里重新取含本题编号的整句（行 1 的「照原文抄」），再把别的「(N) ____」写成「…」，别的「[[词]] (N)」「词 (N)」「(N) 词」写成「词」；先备份原题干；带版本号写入。拟改的 32 条题干列在下方「拟改题干」 |
| 4 | —— | `app/arena.html` | 发布前读回线上版本确认没有别处改动后，重新发布到 `https://claude.ai/artifact/626tqFyFmmfXKdMHYnbJAh` |
| 5 | —— | —— | 验证：`./check.sh` 退出码 0；`node app/logic.test.js app/arena.html` 通过；检索 `app/arena.html` 与 `DATA.md` 中「holds only that question」「(3) [[recieve]]」「stem」的说法，确认与新规则一致；读回线上 32 道的题干，每道只剩本题这一个编号、且只出现一次；读回发布后的页面，提示词含新句子；用 AI 识别跑一次改错段落样例未做（需要真实 AI 调用），披露 |
| 6 | —— | —— | 提交：`git commit -- DATA.md app/arena.html discuss/0025-passage-question-stem-full-sentence.md` |

术语表与 ADR 不改：术语表没有题干的写法；ADR 0003 定的是题组存材料、阶梯逐题算，本轮不改它的取舍。

### 拟改题干（行 3，复审后按材料原句重取）

- `1l132zw9f851v50nisxq`：… the ticketing counter, she asked the lady who was manning the counter how much it (3) ____ to get in.
- `281xjjssxc5kdvwdt06z`：Probably the world's most famous therapy cat, Oscar is known for his (8) ____________ to sense when terminally ill patients are nearing the … of their lives.
- `379h6qzenrq8kqwwk736`：(3) ____, the mother cat's owner was friends with a veterinarian, Dr. Ralph Tran, who agreed to adopt this special needs cat and … her the necessary love and medical care.
- `3f4xwze45cacmfdrrr2z`：My most vivid memories of you [[be]] (35) how your eyebrows would become knitted together whenever you narrated your stories of sirvieval during the Japanese Occupation.
- `3g9wap8tadro89cge42l`：It generally (57) ____ about four to eight weeks to regenerate the red blood cells lost … a blood donation.
- `7kxslvjklugzm2301gol`：I simply could not wrap my head [[on]] (33) the idea that I will be persueing my studies in England for the next four years and how much I will miss you.
- `9genhdgn25pc4ro8iwad`：… mating season, the male frogs will actually stay in the burrow to … their eggs and will send out little chirps as (9) ____ of their calls.
- `9hfaax2uybnvdj3ysw1e`：You might hear unpleasant things said about you (50) ____ of frustration and be tempted to defend …, but what you might not know … that this is part of the healing process — your active listening recognises the hurt that person is experiencing.
- `b2q6oq3gh54m0sg6l55e`：The intruders size … their opponents, then back (5) ____.
- `b8li0rgaid3wsyt337nj`：They (7) ____ have the right to enjoy their childhood and receive the things that … child should have.
- `buocmekywvjx47lkhpq0`：Mice … are allowed to eat during a 9 – 12 hour period during their active phase are drastically healthier (33) ____ mice that are allowed to eat over a 24-hour period.
- `f02jkmxy70o6ql7ojdbb`：In some countries … calcium-rich food is scarce, calcium deficiency (34) ____ affect the people living there.
- `f3jnllsu6c3teqf8jzkm`：For so long, I have been living in my own [[bliss]] (31) world, thinking no matter how hard things become, they will outimately get better with you around.
- `fi9b9kcw44magt0kezad`：(41) ____ our fit of anger, we might … our patience and hurt someone we care about with our words or actions.
- `gk7fyrqcy38srqpm4soy`：The intruders size (4) ____ their opponents, then back ….
- `kog06d477fvcdgwql3cs`：… mating season, the male frogs will actually stay in the burrow to (8) ____ their eggs and will send out little chirps as … of their calls.
- `kw67xl0asjdbpsl2tutc`：It generally … about four to eight weeks to regenerate the red blood cells lost (58) ____ a blood donation.
- `ljevojldyfhd5g8vzpui`：After (59) ____ from his injuries months later, Alistair returned to work as a guide but with a renewed … of wonder.
- `nue7e8yv0gnl42w5inip`：(5) ____ 40 cm-tall creatures hold onto the figs with their forepaws before licking the juicy flesh … their tongues.
- `og1zlst5prtj46xc5pr0`：At last, after facing some (14) ____ storms and almost drowning because of their capsized vessel, they arrived at a safe ….
- `os43vk6o1o6ewewsz4fh`：After … from his injuries months later, Alistair returned to work as a guide but with a renewed (60) ____ of wonder.
- `p2xtjemi85lw1f2f4e6w`：I simply could not wrap my head on the idea that I will be [[persueing]] (34) my studies in England for the next four years and how much I will miss you.
- `pee5v6llwio9ugi57y3k`：Occasionally, he will do this … he is burrowing so that whatever is grabbing for him is (14) ____ to pull him out of his hole.
- `pn1b60q5jpqmr4ra4fvm`：Mice (34) ____ are allowed to eat during a 9 – 12 hour period during their active phase are drastically healthier … mice that are allowed to eat over a 24-hour period.
- `qnyp7xx094ls9a9a81oc`：Probably the world's most famous therapy cat, Oscar is known for his … to sense when terminally ill patients are nearing the (9) ____________ of their lives.
- `t3nvct6hjr2vvuau7evs`：The lady-frogs will secrete a special sticky substance … their backs, so that the male frogs can climb on and stay (6) ____ while mating.
- `vdln5ai6tts1bx47flq3`：The lady-frogs will secrete a special sticky substance (5) ____ their backs, so that the male frogs can climb on and stay … while mating.
- `vk262ux0ycjkmx775w2p`：In some countries (33) ____ calcium-rich food is scarce, calcium deficiency … affect the people living there.
- `wc00prpu1d8r6xa3sehn`：(26) ____ the first year, a child's bones … little calcium and great flexibility.
- `zbdvfdf538cj3nkdlyem`：Actions (53) ____ louder than words so if you have damaged someone's property, have it … or replaced.
- `zllr0e8ae2cvuqpjmfdn`：Despite the painful memories evoked, you would always concluded by saying, "The war brought about a generation capable of [[overcame]] (38) all odds."
- `zxj4x0jgcjina6j8b5pl`：This occasion has always been regarded … a time for children to enjoy themselves (2) ____ celebrations taking place in schools and a school holiday declared for all primary school children.

## 四、复审（2026-10-18）

派新上下文的 subagent 复审核销表。逐条核验：

| 发现 | 核验 | 处置 |
|---|---|---|
| F1（高）`og1zlst5…` 的编号被挪到句首，与材料「some (14) ____ storms」不符；这是当初识别就写错的 | 成立，读材料 | 行 3 改为从材料重新取整句，此条变为「At last, after facing some (14) ____ storms …」 |
| F2（中）字段说明「stem: the question exactly as printed」与整句规则矛盾 | 成立，读提示词 | 行 2 ② |
| F3（中）改错一句要求题干里每个划线词都写 `[[ ]]`，与 S2 B 冲突 | 成立 | 行 2 ③ |
| F4（中）「holds only that question」紧挨新句，易被读成题干不带上下文 | 成立 | 行 2 ① |
| F5（中）7 条拟改题干带着非原文的「Fill in blank (N).」、或句子不全 | 成立，与材料逐条对照 | 行 3 改为从材料重取整句；材料里「Dr.」会把句子断开，`379h6qze…` 保留原拟改（已是整句） |
| F6（低）「只剩一个编号」有两种读法 | 成立 | 行 5 改写 |
| F7（低）括号读起来像封闭的题型清单，与 S1 A 不合 | 成立 | 行 2 改为「for example editing or cloze」 |
| F8（低）录入表单标签「only this question」 | 成立 | 行 2 ④ |
| 边界：题号在标题、表格格子或列表项里，没有整句可取 | 成立，S1 没覆盖 | 记为留白：本轮不定，遇到时由草稿审阅时手改 |

自查重写的行 2、3、5：对得上登记表，都是落实 S1、S2 的机械修补，没有新的设计选择。行 3 从「只改标记」扩为「按材料重取整句再改标记」，仍在 S1、S2 之内，确认核销表时向用户说明。

## 五、核销（2026-10-18）

| 行 | 实际改动 | 验证 |
|---|---|---|
| 1 | `DATA.md` 的 `stem` 一行照核销表改 | `./check.sh` 退出码 0 |
| 2 | `recognisePrompt` 按 ①②③ 改；录入草稿表单标签按 ④ 改 | `node app/logic.test.js app/arena.html` 通过；检索「holds only that question」只剩加了「(not the whole material)」的那一处，「(3) [[recieve]]」已无 |
| 3 | 先把 32 道的原题干备份在本机草稿区；带版本号一批写入 32 条 `stem`，全部成功 | 重读线上全部 268 道错题：32 道的题干与拟改的逐字相同，每道只剩本题这一个编号且只出现一次；全库再没有题干带两个及以上编号的错题 |
| 4 | 发布前读回线上第 46 版，与上次提交的 `app/arena.html` 一致；发布为第 47 版 | 读回第 47 版的页面文件，去掉平台外壳后与本地 `app/arena.html` 逐字相同，含新的提示词句子 |
| 5 | 见上 | 未验证：没有用真实 AI 识别跑一次改错或完形段落，新提示词的效果要等下次录入时在草稿里看 |
| 6 | 见提交 | —— |

留白：题号在标题、表格格子或列表项里、取不出整句的情形，本轮不定，遇到时在草稿审阅时手改。
