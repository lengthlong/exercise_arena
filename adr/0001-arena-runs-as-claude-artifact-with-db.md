# 0001 练习场是一个带数据库的 claude.ai Artifact 页面

## 背景

练习场要存错题和照片，要按日期安排重做、自动判对、抽题组卷，还要能接收家长用文字或照片录入的错题。候选的载体有三种：Obsidian 里的 Markdown 文件、本地 Web 应用、claude.ai Artifact 页面。

## 决定

练习场是一个 claude.ai Artifact 页面。错题、作答和检验卷存在页面的 `db` 里，照片存在页面的 `assets` 里，照片识别用页面的 `sample`。

## 理由

- 数据库、附件存储和图片识别都是平台现成的能力，不用自建后端。
- agent 能用 `ArtifactData` 读写同一个 `db`，家长在对话里录入的错题直接出现在页面上，不需要导出导入。
- 页面在手机、平板和电脑的浏览器里都能打开，家长用手机拍照就能录入。
- Markdown 文件在 Obsidian 里好读，但不会自己排期、判对或组卷，每次都要 agent 在对话里代劳。
- 本地 Web 应用最自由，但要部署和维护服务器，还要解决 Sophia 怎样访问的问题。

## 代价

- 数据存在 claude.ai 上，不在 Obsidian 库里。要在 Obsidian 里看，得另行导出。
- 页面只能经家长账号打开，Sophia 不能自己随时使用，见 [ADR 0002](./0002-sophia-uses-parent-account-claude-features-parent-side.md)。
- 运行时能力（`db`、`assets`、`sample`）的行为以平台为准，平台变化时页面要跟着改。
