# 运行时场景

## 照片录入

家长在家长侧拍下一页卷子，页面把照片存进 `assets`，请 Claude 拆成错题草稿，家长逐条确认后保存。识别不可用或拆得不准时，家长在同一张表单里手填，原照片照样挂在错题上。

```plantuml
@startuml
actor 家长
participant "练习场页面" as Page
participant assets
participant "sample" as Sample
database db

家长 -> Page : 选科目，拍照或选照片
Page -> assets : upload(照片)
assets --> Page : 照片 id
Page -> Sample : 照片 + 专题、题型清单 + 输出格式
alt 识别成功
  Sample --> Page : 错题草稿（一道或几道）
else 未授权、失败或格式不对
  Page -> Page : 给出一张空白草稿，挂上照片
end
家长 -> Page : 逐条核对、修改草稿
家长 -> Page : 保存
Page -> db : 写 exercises（第 1 级，次日到期）
@enduml
```

## 对话录入

家长在 Claude Code 对话里发文字或照片。agent 先把草稿列在对话里，家长确认后，agent 用 `ArtifactData` 写进 `exercises`；有照片时，先把照片传进 `assets`，再把 id 写在错题上。

## 每日重做

Sophia 在练习侧打开每日重做，逐题作答。选择题和短答题提交后立即判对；主观题提交后显示讲解与得分关键词，由她自评。每次作答写进 `attempts`，并按复习阶梯更新错题的级与到期日。

## 检验卷

家长在家长侧选科目、专题和题数，页面抽题生成检验卷。Sophia 在练习侧一次做完、交卷，交卷后才看到答案，主观题自评。也可以打印：卷面只有题目，答案另起一页；纸上做完后，家长在家长侧逐题勾选结果。每道题的结果都写成一次作答，并更新阶梯。
