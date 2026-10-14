# 归类体系

每道错题必有科目与专题，可选概念与题型（见 `domain/OVERVIEW.md`）。数学、科学的体系取自知识图；英文的体系是起草稿，**请家长过目后再定**。页面里内嵌这三套体系的 id 与中英名称。

## 知识图

| 科目 | 知识图 | 链接 |
|---|---|---|
| 科学 | 新加坡小学科学知识图（MOE 2023 大纲） | `https://claude.ai/artifact/28476983-ebca-49fd-b882-f428e4e45012` |
| 数学 | 新加坡小学数学知识图（MOE 2021 大纲） | `https://claude.ai/artifact/8ujg7zbHmtuCPqTVMs3hvK` |

- 练习场只取 id 与中英名称，讲解、例题与易错点留在知识图里。
- 概念与题型链接到 `<知识图链接>#<id>`。知识图的脚本按 `#` 后的 id 选中该概念或题型；claude.ai 外壳是否把 `#` 传给页面，未实测，不传时停在知识图首页。
- 知识图更新后，页面里的体系要重新提取。

## 科学

主题层（只用于分组显示）与专题：

| 主题层 | 专题（id） |
|---|---|
| 多样性 Diversity | 生物与非生物 `D-living` · 材料 `D-mat` |
| 循环 Cycles | 生命周期 `C-life` · 物质 `C-matter` · 水 `C-water` · 繁殖 `C-repro` |
| 系统 Systems | 植物系统 `S-plant4` · 人体系统 `S-human4` · 植物的运输与气体交换 `S-plant5` · 人体呼吸与循环 `S-human5` · 电系统 `S-elec` |
| 相互作用 Interactions | 磁铁 `I-mag` · 力 `I-force` · 环境中的相互作用 `I-env` |
| 能量 Energy | 光 `E-light` · 热 `E-heat` · 光合作用 `E-photo` · 能量转换 `E-conv` |
| 科学探究 Science Practices | 设计实验 `P-design` · 处理数据 `P-data` · 解释与决定 `P-comm` |

另有 77 个概念（例：凝结 `c-cond`）、21 种题型（例：实验设计与公平测试 `qt-fair`）。

## 数学

| 层 | 专题（id） |
|---|---|
| 整数与钱 Whole numbers & money | 数的认识 `W-num` · 四则运算 `W-ops` · 因数与倍数 `W-fm` · 钱 `W-money` |
| 分数与小数 Fractions & decimals | 分数 `F-frac` · 小数 `F-dec` |
| 百分比、比与比率 Percentage, ratio & rate | 百分比 `R-pct` · 比 `R-ratio` · 比率 `R-rate` |
| 规律与代数 Patterns & algebra | 规律 `A-pat` · 代数 `A-alg` |
| 测量 Measurement | 长度、质量与容量 `M-len` · 时间 `M-time` · 面积与周长 `M-area` · 体积 `M-vol` · 圆 `M-circ` |
| 几何 Geometry | 平面与立体图形 `G-shape` · 角与线 `G-angle` · 三角形与四边形 `G-poly` · 对称与展开图 `G-sym` |
| 统计 Statistics | 统计图表 `S-graph` · 平均数 `S-avg` |
| 解题方法 Problem solving | 解题步骤与书写 `P-steps` · 画图与列表 `P-rep` · 有根据地猜 `P-guess` · 走一遍过程 `P-walk` · 改变问题 `P-change` |

另有 77 个概念（例：四舍五入与估算 `w-round`）、22 种题型（例：变化前后：差不变 `qt-diff`）。

## 英文（起草稿，待家长过目）

依据：agent 对新加坡小学英文语法教学与 PSLE 英文卷二结构的了解，**未对照 MOE 大纲或 SEAB 考纲原文**。和知识图一样分层，专题下列概念。

### 专题与概念

| 层 | 专题（id） | 概念（id） |
|---|---|---|
| 动词 Verbs | 时态 `en-tense` | 一般现在时 `en-t-simpres` · 现在进行时 `en-t-prescont` · 一般过去时 `en-t-simpast` · 过去进行时 `en-t-pastcont` · 现在完成时 `en-t-presperf` · 过去完成时 `en-t-pastperf` · 将来时 `en-t-future` |
| 动词 Verbs | 主谓一致 `en-sva` | either/neither…or/nor `en-sva-eithor` · each/every/everyone `en-sva-each` · 集合名词 `en-sva-collective` · one of the… `en-sva-oneof` · 远离主语的谓语 `en-sva-distance` |
| 动词 Verbs | 主动与被动 `en-voice` | 被动语态的构成 `en-v-form` · 被动语态的时态 `en-v-tense` |
| 动词 Verbs | 非谓语与情态 `en-verbforms` | 动名词 `en-vf-gerund` · 不定式 `en-vf-inf` · 情态动词 `en-vf-modal` |
| 词类 Word classes | 名词与冠词 `en-noun` | 可数与不可数 `en-n-count` · a/an/the `en-n-article` · 量词 `en-n-quant` |
| 词类 Word classes | 代词 `en-pron` | 人称与物主代词 `en-p-personal` · 反身代词 `en-p-reflexive` · 关系代词 who/whom/whose/which `en-p-relative` |
| 词类 Word classes | 介词 `en-prep` | 时间与地点介词 `en-pp-timeplace` · 固定搭配介词 `en-pp-fixed` |
| 词类 Word classes | 形容词与副词 `en-adj` | 比较级与最高级 `en-a-compare` · 词形变化 `en-a-wordform` |
| 词类 Word classes | 连接词 `en-conj` | 并列与转折 `en-c-coord` · 原因与结果 `en-c-cause` · 条件与让步 `en-c-condition` |
| 句子 Sentences | 反意疑问句 `en-qtag` | 肯定句接否定尾 `en-q-pos` · 否定词与特殊主语 `en-q-special` |
| 句子 Sentences | 条件句 `en-cond` | 真实条件 `en-cd-real` · 虚拟条件 `en-cd-unreal` |
| 句子 Sentences | 直接与间接引语 `en-speech` | 时态后移 `en-s-backshift` · 人称与时间地点词 `en-s-pronoun` · 间接疑问句 `en-s-question` |
| 句子 Sentences | 句子合并与改写 `en-synth` | Despite / In spite of `en-sy-despite` · Although / Even though `en-sy-although` · Neither…nor `en-sy-neither` · Not only…but also `en-sy-notonly` · No sooner…than `en-sy-nosooner` · too…to / so…that `en-sy-tooto` · Unless `en-sy-unless` · 关系从句合并 `en-sy-relative` · Instead of `en-sy-instead` · 被动改写 `en-sy-passive` · 间接引语改写 `en-sy-reported` |
| 书写 Mechanics | 拼写 `en-spell` | 常错拼写 `en-sp-common` · 加后缀的拼写 `en-sp-suffix` |
| 书写 Mechanics | 标点 `en-punct` | 引号与逗号 `en-pu-quote` · 撇号 `en-pu-apos` |
| 词汇 Vocabulary | 词汇与搭配 `en-vocab` | 短语动词 `en-vo-phrasal` · 习语 `en-vo-idiom` · 近义词辨析 `en-vo-synonym` |

### 题型

按 PSLE 英文卷二（Language Use and Comprehension）的各部分：

语法选择 `en-qt-gmcq` · 词汇选择 `en-qt-vmcq` · 词汇完形 `en-qt-vcloze` · 图文理解 `en-qt-visual` · 语法完形 `en-qt-gcloze` · 改错（拼写与语法） `en-qt-editing` · 理解完形 `en-qt-ccloze` · 句子合并与改写 `en-qt-synth` · 阅读理解问答 `en-qt-compoe`
