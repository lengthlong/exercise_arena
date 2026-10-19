#!/usr/bin/env bash
# 内核检查在本工作区所用版本的 design-discuss 里；本工作区专属的检查写在 check.local.sh。
cd "$(dirname "$0")" || exit 1
k=.agents/skills/design-discuss/check.sh
if [ ! -f "$k" ]; then
  echo "本工作区缺 discuss-design 的受管副本：先用 design-init 恢复（scaffold.sh link）或升级"
  exit 1
fi
exec bash "$k"
