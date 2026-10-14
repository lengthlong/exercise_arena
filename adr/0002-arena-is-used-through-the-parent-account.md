# 0002 练习场经家长账号使用，不区分学生与家长

## 背景

练习场是 claude.ai 上的页面（见 [ADR 0001](./0001-arena-runs-as-claude-artifact-with-db.md)），打开它要登录 claude.ai。Anthropic 消费者条款要求用户至少 18 岁，或者达到当地法定同意年龄，取较高者。Sophia 是小学五年级学生，不能有自己的账号。

## 决定

- 页面经家长的账号打开。
- 页面不区分学生与家长：没有两侧切换，所有功能谁都可以用，包括调用 Claude 的照片识别。

## 理由

- 用户说明：「student and parents share the same account」；「all functions are used by users. we don't distinguish students and parents any more.」
- 同一个账号下再分两侧，只多出一个切换和两套重复的界面，没有带来实际的区分。

## 代价

- 界面不再限制谁使用调用 Claude 的功能。是否符合条款，由账号持有人按条款原文自行判断，本 ADR 不下结论。

## 历史

- 2026-10-14 之前，页面分家长侧与练习侧，调用 Claude 的功能只放在家长侧。这一划分在 2026-10-14 被上面的决定取代。
