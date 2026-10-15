#!/usr/bin/env bash
# 内核检查在本工作区所用版本的 design-discuss 里；本工作区专属的检查写在 check.local.sh。
cd "$(dirname "$0")" || exit 1
k=.agents/skills/design-discuss/check.sh
if [ ! -f "$k" ]; then
  echo "本工作区缺 discuss-design 的 skill 链接：先用 design-init 补链接（scaffold.sh link）"
  exit 1
fi
exec bash "$k"
