# 容器

练习场只有一个要开发、部署的软件单元：练习场页面。它运行在 claude.ai 的 Artifact 平台上，数据、照片与图片识别都用平台的运行时能力。

```plantuml
@startuml
actor "家长" as Parent
actor "Sophia" as Sophia
node "claude.ai Artifact 平台" as Platform {
  component "练习场页面\n(app/arena.html)" as Page
  database "db\nexercises / sets / papers / settings" as DB
  storage "assets\n题目照片" as Assets
  component "sample\n照片识别" as Sample
}
component "Claude Code 对话\n(agent)" as Agent
component "知识图页面\n科学、数学" as Maps

Parent --> Page : 家长侧：录入、改判、组检验卷
Sophia --> Page : 练习侧：每日重做、检验卷
Page --> DB : 读写
Page --> Assets : 上传、显示照片
Page --> Sample : 照片 → 题组与错题草稿
Parent --> Agent : 发文字或照片
Agent --> DB : 经 ArtifactData 写 exercises、sets
Agent --> Assets : 上传照片
Page ..> Maps : 链接到概念、题型
@enduml
```

| 单元 | 种类 | 职责 |
|---|---|---|
| 练习场页面 | Container（`app/arena.html`） | 家长侧与练习侧的全部界面；阶梯、判对、抽题的计算；读写 `db`、`assets`，调用 `sample` |
| claude.ai Artifact 平台 | 外部系统 | 托管页面；提供 `db`、`assets`、`sample`；家长账号登录 |
| Claude Code 对话 | 外部参与者（agent） | 在家长确认后，把对话里收到的错题与题组写进 `exercises`、`sets`，照片传进 `assets` |
| 知识图页面 | 外部系统 | 科学、数学的专题、概念、题型与讲解；练习场只链接过去 |
| 家长、Sophia | 参与者 | 分别使用家长侧与练习侧 |
