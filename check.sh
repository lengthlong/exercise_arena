#!/usr/bin/env bash
# 工作区检查入口：转调本工作区所用版本的检查器（受管副本 .discuss_design/），原样透传参数；本工作区专属的检查写在 check.local.sh。
cd "$(dirname "$0")" || exit 1
k=.discuss_design/checker.sh
if [ ! -f "$k" ]; then
  echo "Managed discuss-design files are missing. Restore with design-init (scaffold.sh link) or upgrade."
  exit 1
fi
exec bash "$k" "$@"
