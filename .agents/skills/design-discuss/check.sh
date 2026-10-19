#!/usr/bin/env bash
# 内核检查：在工作区根目录运行（工作区的 ./check.sh 调用本工作区所用版本里的这份脚本）。
# 读 .discuss_design.yaml；退出码 0 表示通过。最后若有 ./check.local.sh，接着跑它并合并退出码。
# 只依赖 bash 3.2、find、grep、awk、shasum —— macOS 自带的版本即可。

set -euo pipefail
KERNEL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
fail=0
tmp="${TMPDIR:-/tmp}/design-check.$$"
trap 'rm -f "$tmp".*' EXIT
trap 'echo "检查执行失败（第 $LINENO 行），未报告通过" >&2' ERR
die() { echo "$*" >&2; exit 2; }
# grep 的 1 是无命中，其他非零是扫描错误；条件表达式也不能吞掉错误。
grep_match() {
  local status
  if command grep "$@"; then return 0; else status=$?; fi
  [ "$status" -le 1 ] || die "文本扫描失败：$*"
  return "$status"
}
grep_maybe() { grep_match "$@" || [ "$?" -eq 1 ]; }

CONFIG=.discuss_design.yaml
LEGACY_CONFIG=.design/workspace.yaml
if [ -e "$LEGACY_CONFIG" ]; then
  echo "工作区仍有旧配置 ${LEGACY_CONFIG}；用已安装的新版本 design-init 执行 upgrade。新旧配置并存时也不会选择其一"
  exit 1
fi
if [ ! -f "$CONFIG" ]; then
  echo "不在设计工作区的根目录：找不到 $CONFIG"
  exit 1
fi

# 读配置里「键:」下的「  - 项」列表（只支持这一种列表写法）
yaml_list() {
  awk -v key="$1" '
    $0 ~ "^" key ":" { on = 1; next }
    on && /^  - / { sub(/^  - /, ""); gsub(/^["'\'']|["'\'']$/, ""); print; next }
    on && /^[^ #]/ { on = 0 }
  ' "$CONFIG"
}

# 按配置的 glob 列出设计文件（find 的 -path 里 * 可跨目录，故 skills/**/*.md 也成立）
design_files() {
  yaml_list design > "$tmp.patterns" || return
  : > "$tmp.found"
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    find . -type f -path "./$p" -not -path './.git/*' >> "$tmp.found" || return
  done < "$tmp.patterns"
  sort -u "$tmp.found"
}

# 工作区里所有 md 实体文件（不跟符号链接），可再排除若干顶层目录
md_files() {
  find . -type f -name '*.md' -not -path './.git/*' "$@" | sort
}

# ── 0. AGENTS.md 是指向 CLAUDE.md 的符号链接 ───────────────────
if [ ! -L AGENTS.md ] || [ "$(readlink AGENTS.md)" != "CLAUDE.md" ]; then
  echo "AGENTS.md 应是指向 CLAUDE.md 的符号链接（指令文件只有一份真身）"
  fail=1
fi

# ── 1. 托管块与内核逐字一致 ─────────────────────────────────────
begin='<!-- design-kernel:begin -->'
end='<!-- design-kernel:end -->'
if [ ! -f CLAUDE.md ]; then
  echo "缺 CLAUDE.md"; fail=1
else
nb=$(grep_maybe -cxF "$begin" CLAUDE.md); ne=$(grep_maybe -cxF "$end" CLAUDE.md)
  if [ "$nb" -ne 1 ] || [ "$ne" -ne 1 ]; then
    echo "CLAUDE.md 的托管块标记应各出现一次（$begin / ${end}）"
    fail=1
  else
    awk -v b="$begin" -v e="$end" '$0 == e { on = 0 } on { print } $0 == b { on = 1 }' CLAUDE.md > "$tmp.block"
    if ! cmp -s "$tmp.block" "$KERNEL_DIR/KERNEL.md"; then
      echo "CLAUDE.md 的托管块与本工作区所用版本的 KERNEL.md 不一致 —— 用 design-init 升级本工作区，不要手改："
      diff "$KERNEL_DIR/KERNEL.md" "$tmp.block" | head -20 | sed 's/^/  /' || true
      fail=1
    fi
  fi
fi

# ── 2. 术语违例 ─────────────────────────────────────────────────
# context 缺省为旧工作区的根目录术语表；模板只决定新建工作区的默认值。
context=$(awk '/^context:/ { sub(/^context:[ ]*/, ""); sub(/[ ]*$/, ""); print; exit }' "$CONFIG")
context=${context:-CONTEXT.md}
case "$context" in /*|..|../*|*/../*|*/..) die "context 须是工作区内的相对路径：$context" ;; esac
context_file="./${context#./}"
if [ ! -f "$context_file" ] || [ ! -r "$context_file" ]; then
  echo "缺少可读术语表：$context"; fail=1
fi
# 词表是 .discuss_design.yaml 的 terms：只收无条件违例的词。
yaml_list terms > "$tmp.terms"
if [ ! -r "$KERNEL_DIR/visible-text.awk" ]; then
  echo "术语处理器缺失或不可读：$KERNEL_DIR/visible-text.awk"
  fail=1
elif [ -s "$tmp.terms" ]; then
  design_files > "$tmp.design"
  if [ -s "$tmp.design" ]; then
    : > "$tmp.hits"
    while IFS= read -r f; do
      # ASCII 标记按字节处理；避免系统 awk 的多字节索引差异，中文词仍按原字节精确匹配。
      if ! LC_ALL=C awk -v terms_file="$tmp.terms" -v context_file="$context_file" -f "$KERNEL_DIR/visible-text.awk" "$f" >> "$tmp.hits"; then
        echo "术语处理器运行失败：$f"
        fail=1
      fi
    done < "$tmp.design"
    if [ -s "$tmp.hits" ]; then
      echo "术语违例（词表见 .discuss_design.yaml 的 terms，定义见 ${context}）："
      sed 's/^/  /' "$tmp.hits"
      fail=1
    fi
  fi
fi

# ── 3. 记录不被引用 ─────────────────────────────────────────────
# 讨论文件只被讨论文件引用；研究文件只被讨论与研究文件引用；publish/ 下的文件不被设计文件与 skill 引用。
refs() { # $1 = 正则；其余 = 允许引用它的顶层目录
  local re="$1"; shift
  local args=() d
  for d in "$@"; do args+=(-not -path "./$d/*"); done
  md_files "${args[@]}" > "$tmp.refs" || return
  while IFS= read -r f; do
    grep_maybe -nHE "$re" "$f" || return
  done < "$tmp.refs"
}
r=$(refs '(^|[^A-Za-z0-9_-])discuss/[0-9]' discuss publish)
[ -n "$r" ] && { echo "引用了讨论文件（讨论是终点，结论要写进设计文件）："; echo "$r" | sed 's/^/  /'; fail=1; }
r=$(refs '(^|[^A-Za-z0-9_-])research/[A-Za-z0-9][A-Za-z0-9._-]*\.md' discuss research publish)
[ -n "$r" ] && { echo "引用了研究文件（要用的事实写进正文，不留链接）："; echo "$r" | sed 's/^/  /'; fail=1; }
r=$(refs '(^|[^A-Za-z0-9_-])publish/[A-Za-z0-9][A-Za-z0-9._-]*\.[A-Za-z]+' discuss publish)
[ -n "$r" ] && { echo "引用了 publish/ 下的文件（发布物非权威）："; echo "$r" | sed 's/^/  /'; fail=1; }

# ── 4. 死链 ─────────────────────────────────────────────────────
# 跳过 discuss/、research/（冻结的记录，链接过时不算缺陷）与 publish/（正文多为他人所写）。
md_files -not -path './discuss/*' -not -path './research/*' -not -path './publish/*' > "$tmp.dead-files"
while IFS= read -r f; do
  d=$(dirname "$f")
  grep_maybe -oE '\]\([^)[:space:]]+\)' "$f" | sed -E 's/^\]\((.*)\)$/\1/' > "$tmp.targets"
  while IFS= read -r t; do
    case "$t" in *://*|mailto:*|\#*) continue ;; esac
    t="${t%%#*}"
    [ -z "$t" ] && continue
    [ -e "$d/$t" ] || echo "  死链  $f -> $t"
  done < "$tmp.targets"
done < "$tmp.dead-files" > "$tmp.dead"
if [ -s "$tmp.dead" ]; then echo "死链："; cat "$tmp.dead"; fail=1; fi

# ── 5. 讨论状态头只用四个词 ─────────────────────────────────────
if [ -d discuss ]; then
  for f in discuss/*.md; do
    [ -f "$f" ] || continue
    grep_match -qE '^> 状态：\*\*(讨论中|待落盘|✅ 已完成|⛔ 已中止)' "$f" \
      || { echo "讨论状态头不在四个词之内（讨论中 / 待落盘 / ✅ 已完成 / ⛔ 已中止）：$f"; fail=1; }
    # 已有核销记录（去序号后以「核销」开头、「核销」不紧跟「表」的二级标题），状态头必须是 ✅ 或 ⛔。
    # 「## 分批核销（……）」以「分批」开头，不算；分批落盘期间状态头保持「讨论中」。
    grep_maybe -E '^## ([一二三四五六七八九十]+、)?核销' "$f" > "$tmp.writeoff-all"
    grep_maybe -vE '^## ([一二三四五六七八九十]+、)?核销表' "$tmp.writeoff-all" > "$tmp.writeoff"
    if [ -s "$tmp.writeoff" ]; then
      status=$(grep_maybe -m1 '^> 状态' "$f")
      case "$status" in
        '> 状态：**✅ 已完成'*|'> 状态：**⛔ 已中止'*) ;;
        *) echo "${f} 已有核销记录，状态头却不是 ✅ / ⛔：${status} —— 落盘做完了就把状态头改成 ✅ 已完成（日期）"; fail=1 ;;
      esac
    fi
  done
fi

# ── 6. 编号命名 ─────────────────────────────────────────────────
for d in discuss research adr; do
  [ -d "$d" ] || continue
  for f in "$d"/*.md; do
    [ -f "$f" ] || continue
    b=$(basename "$f")
    [ "$b" = "README.md" ] && continue
    case "$b" in
      [0-9][0-9][0-9][0-9]-*) ;;
      *) echo "文件名缺 NNNN- 编号前缀：$f"; fail=1 ;;
    esac
  done
  dup=$(ls "$d" | grep_maybe -oE '^[0-9]{4}' | sort | uniq -d)
  [ -n "$dup" ] && { echo "$d/ 编号重复：$(echo "$dup" | tr '\n' ' ')"; fail=1; }
done

# ── 7. 受管副本完整且与配置一致 ─────────────────────────────────
recorded=$(awk '/^toolkit:/ { sub(/^toolkit:[ ]*/, ""); print; exit }' "$CONFIG")
managed_version=$(awk '/^managed:/ { on=1; next }
  on && /^  # toolkit: / { sub(/^  # toolkit: /, ""); print; exit }
  on && /^[^ #]/ { exit }' "$CONFIG")
if [ -z "$recorded" ] || [ "$managed_version" != "$recorded" ]; then
  echo "managed 绑定的工具包版本与 toolkit 不一致 —— 用 design-init 的 link 恢复副本，或升级工作区"
  fail=1
fi
want="design-discuss design-research design-publish"
for k in $(awk '/^integrations:/ { on = 1; next }
                on && /^  [A-Za-z0-9_-]+:/ { s = $1; sub(/:$/, "", s); print s; next }
                on && /^[^ #]/ { on = 0 }' "$CONFIG"); do
  want="$want design-publish-$k"
done
for n in $want; do
  if [ ! -d ".agents/skills/$n" ] || [ -L ".agents/skills/$n" ]; then
    echo "缺受管 skill 副本 .agents/skills/$n —— 用 design-init 的 link 恢复副本，或升级工作区"; fail=1
  fi
  l=".claude/skills/$n"
  if [ ! -L "$l" ] || [ "$(readlink "$l" 2>/dev/null)" != "../../.agents/skills/$n" ]; then
    echo "$l 缺失或指向错误 —— 用 design-init 的 link 恢复受管副本"; fail=1
  fi
done

# managed 每行是「类型 SHA-256 相对路径」；精确集合同时防止受管目录里多文件或少文件。
yaml_list managed > "$tmp.managed"
: > "$tmp.managed-paths"
while IFS= read -r line; do
  [ -n "$line" ] || continue
  set -- $line
  [ "$#" -eq 3 ] || { echo "managed 项格式错误：$line"; fail=1; continue; }
  kind=$1; expected=$2; p=$3
  printf '%s\n' "$expected" | grep_match -qE '^[0-9a-f]{64}$' ||
    { echo "managed 哈希格式错误：$p"; fail=1; continue; }
  printf '%s\n' "$p" >> "$tmp.managed-paths"
  case "$kind" in
    file)
      if [ ! -f "$p" ] || [ -L "$p" ]; then echo "受管文件缺失或类型错误：$p"; fail=1; continue; fi
      actual=$(shasum -a 256 "$p" | awk '{ print $1 }') || die "无法计算受管文件哈希：$p"
      ;;
    link)
      if [ ! -L "$p" ]; then echo "受管链接缺失：$p"; fail=1; continue; fi
      actual=$(printf '%s' "$(readlink "$p")" | shasum -a 256 | awk '{ print $1 }') || die "无法计算受管链接哈希：$p"
      ;;
    *) echo "managed 类型错误：$kind"; fail=1; continue ;;
  esac
  [ "$actual" = "$expected" ] || { echo "受管内容与配置哈希不一致：$p"; fail=1; }
done < "$tmp.managed"
sort "$tmp.managed-paths" > "$tmp.managed-sorted"
if [ "$(uniq -d "$tmp.managed-sorted" | wc -l | tr -d ' ')" -ne 0 ]; then
  echo "managed 存在重复路径"; fail=1
fi
: > "$tmp.actual-managed"
for n in $want; do
  [ -d ".agents/skills/$n" ] && find ".agents/skills/$n" \( -type f -o -type l \) -print >> "$tmp.actual-managed"
  printf '%s\n' ".claude/skills/$n" >> "$tmp.actual-managed"
done
printf '%s\n' AGENTS.md >> "$tmp.actual-managed"
sort -u "$tmp.actual-managed" > "$tmp.actual-sorted"
if ! cmp -s "$tmp.managed-sorted" "$tmp.actual-sorted"; then
  echo "managed 与应有的受管文件集合不一致 —— 用 design-init 的 link 恢复副本，或升级工作区"
  diff "$tmp.managed-sorted" "$tmp.actual-sorted" > "$tmp.managed-diff" || true
  sed 's/^/  /' "$tmp.managed-diff"
  fail=1
fi

# 本地写法属于工作区；两套 agent 的入口都必须可读且位置正确。
if [ ! -f .agents/skills/design-writing/SKILL.md ] || [ ! -r .agents/skills/design-writing/SKILL.md ]; then
  echo "缺本工作区可读的 .agents/skills/design-writing/SKILL.md —— 恢复本地写法文件"; fail=1
fi
for l in .agents/skills/*; do
  [ -d "$l" ] || [ -L "$l" ] || continue
  [ -f "$l/SKILL.md" ] && [ -r "$l/SKILL.md" ] || { echo "skill 缺少可读 SKILL.md：$l"; fail=1; continue; }
  n=$(basename "$l")
  l=".claude/skills/$n"
  if [ ! -L "$l" ] || [ "$(readlink "$l" 2>/dev/null)" != "../../.agents/skills/$n" ]; then
    echo "$l 缺失或指向错误 —— 用 design-init 恢复入口"; fail=1
  elif [ ! -f "$l/SKILL.md" ] || [ ! -r "$l/SKILL.md" ]; then
    echo "$l 的目标不可读 —— 先恢复对应的 .agents skill"; fail=1
  fi
done
for l in .claude/skills/*; do
  [ -d "$l" ] || [ -L "$l" ] || continue
  n=$(basename "$l")
  if [ ! -L "$l" ] || [ "$(readlink "$l")" != "../../.agents/skills/$n" ] || [ ! -f ".agents/skills/$n/SKILL.md" ] || [ ! -r ".agents/skills/$n/SKILL.md" ]; then
    echo "$l 须链接到可读的 Agents 同名 skill"; fail=1
  fi
done

# ── 8. 本机有更新的 current 时提示（不报红） ────────────────────
cur=$(cat "$HOME/.discuss-design/current/VERSION" 2>/dev/null || true)
if [ -n "$cur" ] && [ "$cur" != "$recorded" ]; then
  echo "提示：本机 current 是 ${cur}，本工作区用的是 ${recorded}；要换版本就用 design-init 升级本工作区"
fi


# ── 本工作区的扩展检查 ──────────────────────────────────────────
if [ -f check.local.sh ]; then
  bash check.local.sh || fail=1
fi

[ "$fail" -eq 0 ] && echo "✓ 检查通过"
exit "$fail"
