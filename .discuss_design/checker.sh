#!/usr/bin/env bash
# 内核检查与只读流水线状态：在工作区根目录运行（工作区的 ./check.sh 透传参数给受管副本 .discuss_design/checker.sh）。
# 无参：校验模式（最后若有 ./check.local.sh，接着跑它并合并退出码）；
# --status：只读流水线状态模式（不运行 check.local.sh，不执行 git fetch，退出码 0 成功 / 2 异常）。
# 只依赖 bash 3.2、git、find、grep、awk、shasum —— macOS 自带的版本即可。

set -euo pipefail
CHECKER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
fail=0
tmp="${TMPDIR:-/tmp}/design-check.$$"
trap 'rm -f "$tmp".*' EXIT
trap 'echo "Check failed at line $LINENO" >&2' ERR
die() { echo "$*" >&2; exit 2; }
# grep 的 1 是无命中，其他非零是扫描错误；条件表达式也不能吞掉错误。
grep_match() {
  local status
  if command grep "$@"; then return 0; else status=$?; fi
  [ "$status" -le 1 ] || die "Text scan failed: $*"
  return "$status"
}
grep_maybe() { grep_match "$@" || [ "$?" -eq 1 ]; }

MODE=check
if [ "$#" -eq 1 ] && [ "$1" = "--status" ]; then
  MODE=status
elif [ "$#" -gt 0 ]; then
  echo "Usage: ./check.sh [--status]" >&2
  exit 2
fi

CONFIG=.discuss_design/config.yaml
OLD_CONFIG=.discuss_design.yaml
LEGACY_CONFIG=.design/workspace.yaml
if [ -e "$LEGACY_CONFIG" ] || [ -L "$LEGACY_CONFIG" ]; then
  echo "Legacy config ${LEGACY_CONFIG} found. Use design-init upgrade directly with the old and new workspace maps. Resolve duplicate configs first." >&2
  [ "$MODE" = status ] && exit 2 || exit 1
fi
if [ -e "$OLD_CONFIG" ] || [ -L "$OLD_CONFIG" ]; then
  echo "Root config ${OLD_CONFIG} found. Run upgrade to move it to ${CONFIG}." >&2
  [ "$MODE" = status ] && exit 2 || exit 1
fi
if [ -L "$CONFIG" ] || [ ! -f "$CONFIG" ] || [ ! -r "$CONFIG" ]; then
  echo "Config missing, unreadable or not a regular file: ${CONFIG}" >&2
  [ "$MODE" = status ] && exit 2 || exit 1
fi

# ── 只读流水线状态模式（--status）────────────────────────────────
run_status_mode() {
  [ -e .git ] || die "Not a Git repository"
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a Git work tree"
  local head branch dirty toolkit_ver
  head=$(git rev-parse --verify HEAD 2>/dev/null) || die "Cannot resolve HEAD commit"
  branch=$(git symbolic-ref --short -q HEAD 2>/dev/null || echo "detached")
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then dirty=1; else dirty=0; fi
  toolkit_ver=$(awk '/^toolkit:/ { sub(/^toolkit:[ ]*/, ""); print; exit }' "$CONFIG" 2>/dev/null || true)
  [ -n "$toolkit_ver" ] || die "Missing toolkit version in $CONFIG"
  [ -r "$CHECKER_DIR/visible-text.awk" ] || die "Record reader missing or unreadable: $CHECKER_DIR/visible-text.awk"

  # 产品路径（checker/SPEC.md 推导规则 0，ADR 0040）：排除 guide 类位置、设计与记录目录、旧记录目录与 managed 清单路径
  local -a product_spec=(. ':(exclude)record' ':(exclude)verify' ':(exclude)journey' ':(exclude)model' ':(exclude)doc'
    ':(exclude)discuss' ':(exclude)research' ':(exclude)CLAUDE.md' ':(exclude)AGENTS.md' ':(exclude).discuss_design'
    ':(exclude).agents/skills' ':(exclude).claude/skills' ':(exclude)check.sh' ':(exclude)check.local.sh')
  local managed_path
  while IFS= read -r managed_path; do
    [ -n "$managed_path" ] && product_spec+=(":(exclude,literal)$managed_path")
  done < <(awk '/^managed:/ { on = 1; next } /^[^ #]/ { on = 0 } on && /^  - / { print $NF }' "$CONFIG" 2>/dev/null || true)

  : > "$tmp.st-records"
  local dir f
  for dir in record/discuss discuss record/implement record/verify record/release record/deliver; do
    for f in "$dir"/*.md; do
      [ -f "$f" ] || continue
      [ -s "$f" ] || die "Empty record: $f"
      printf './%s\n' "$f" >> "$tmp.st-records"
    done
  done
  : > "$tmp.st-meta"
  if [ -s "$tmp.st-records" ]; then
    LC_ALL=C awk -v files_list="$tmp.st-records" -v mode=status -f "$CHECKER_DIR/visible-text.awk" > "$tmp.st-meta" ||
      die "Failed to parse records for --status"
  fi

  # 1. 最近已完成发版与 RELEASE_BASE（单次 git log 逆序扫描，合并读取 record/release/ 与 record/deliver/，排除 aborted / in-progress）
  : > "$tmp.st-rel-log"
  git log --format='COMMIT	%H' --name-only -- record/release record/deliver > "$tmp.st-rel-log" 2>/dev/null || true
  LC_ALL=C awk -F '\t' -v meta="$tmp.st-meta" '
    BEGIN {
      while ((getline line < meta) > 0) {
        split(line, a, "\t")
        if (a[1] == "REC" && (a[2] == "release" || a[2] == "deliver") && a[5] == "completed") {
          rel_name[a[3]] = a[4]
          rel_loc[a[3]] = a[10]
        }
      }
      close(meta)
    }
    $1 == "COMMIT" {
      if (best_intro != "") exit
      cur_sha = $2; next
    }
    NF == 1 && ($1 in rel_name) {
      if (best_intro == "" || $1 > best_file) {
        best_intro = cur_sha
        best_file = $1
      }
    }
    END {
      if (best_intro != "") print best_intro "\t" rel_name[best_file] "\t" rel_loc[best_file]
    }
  ' "$tmp.st-rel-log" > "$tmp.st-rel-best"

  local last_rel="none" last_rel_cand="none" release_base="none"
  local best_intro="" best_loc=""
  local kind file name state scope base_val fail_cnt unv_cnt loc
  if [ -s "$tmp.st-rel-best" ]; then
    IFS=$'\t' read -r best_intro last_rel best_loc < "$tmp.st-rel-best"
  fi

  if [ -n "$best_intro" ]; then
    local cand_raw cand_sha=""
    cand_raw=$(printf '%s\n' "$best_loc" | awk '
      {
        s = $0; gsub(/`/, "", s)
        if (match(s, /(candidate|候选)[ :：]+[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]+/)) {
          m = substr(s, RSTART, RLENGTH)
          sub(/^.*[ :：]+/, "", m)
          print m; exit
        }
        best = ""
        while (match(s, /[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]+/)) {
          tok = substr(s, RSTART, RLENGTH)
          if (length(tok) <= 40) best = tok
          s = substr(s, RSTART + RLENGTH)
        }
        if (best != "") print best
      }')
    if [ -n "$cand_raw" ]; then
      cand_sha=$(git rev-parse --verify "${cand_raw}^{commit}" 2>/dev/null || true)
    fi
    last_rel_cand=${cand_sha:-none}
    release_base=$best_intro
    if [ "$last_rel_cand" != "none" ] &&
       git merge-base --is-ancestor "$best_intro" "$last_rel_cand" 2>/dev/null &&
       git merge-base --is-ancestor "$last_rel_cand" "$head" 2>/dev/null; then
      release_base=$last_rel_cand
    fi
  fi

  # 批量判定哪些 record/implement 与 record/verify 在 RELEASE_BASE 时已存在且之后未变动（单次 ls-tree + diff）
  : > "$tmp.st-in-base"
  : > "$tmp.st-changed-since-base"
  if [ "$release_base" != "none" ]; then
    git ls-tree -r --name-only "$release_base" -- record/implement record/verify > "$tmp.st-in-base" 2>/dev/null || true
    git diff --name-only "$release_base" "$head" -- record/implement record/verify > "$tmp.st-changed-since-base" 2>/dev/null || true
  fi

  # 2. 按类型分组的未关闭 in-progress 记录（含讨论 pending-write-off）
  local open_discuss="" open_impl="" open_verify="" open_release=""
  local open_iv_count=0 has_open_defect=0
  while IFS=$'\t' read -r tag kind file name state scope base_val fail_cnt unv_cnt loc; do
    [ "$tag" = "REC" ] || continue
    case "$kind" in
      discuss)
        if [ "$state" = "in-progress" ] || [ "$state" = "pending-write-off" ]; then
          open_discuss="${open_discuss:+$open_discuss }$name"
        fi ;;
      implement)
        if [ "$state" = "in-progress" ]; then
          open_impl="${open_impl:+$open_impl }$name"
          open_iv_count=$((open_iv_count + 1))
        fi ;;
      verify)
        if [ "$state" = "in-progress" ]; then
          open_verify="${open_verify:+$open_verify }$name"
          open_iv_count=$((open_iv_count + 1))
          [ "$fail_cnt" -gt 0 ] && has_open_defect=1
        fi ;;
      release|deliver)
        if [ "$state" = "in-progress" ]; then
          open_release="${open_release:+$open_release }$name"
        fi ;;
    esac
  done < "$tmp.st-meta"

  # 3. 待接手已冻结讨论设计行（跳 <= cutover，仅计 completed 讨论）
  local pending_rows
  pending_rows=$(LC_ALL=C awk -F '\t' '
    BEGIN { cutover = -1 }
    $1 == "UP" && $2 == "implement" {
      item = $4; gsub(/`/, "", item)
      sub(/^[ \t]+/, "", item); sub(/[ \t]+$/, "", item)
      if (item ~ /^cutover: [0-9][0-9][0-9][0-9]$/ || item ~ /^切换点：[0-9][0-9][0-9][0-9]$/) {
        c = substr(item, length(item) - 3) + 0
        if (c > cutover) cutover = c
        next
      }
      split(item, w, /[ \t]+/)
      if (w[1] ~ /^[0-9][0-9][0-9][0-9]$/ && (w[2] ~ /^#[0-9]+$/ || w[2] ~ /^Q[0-9]+$/)) {
        done_ref[w[1] w[2]] = 1
      }
      next
    }
    $1 == "DROW" {
      dnum = $2 + 0; key = $2 $3
      rows[++n] = dnum SUBSEP key
    }
    END {
      out = ""
      for (i = 1; i <= n; i++) {
        split(rows[i], p, SUBSEP)
        if (p[1] <= cutover) continue
        if (done_ref[p[2]]) continue
        if (seen[p[2]]++) continue
        out = (out == "" ? p[2] : out " " p[2])
      }
      print (out == "" ? "none" : out)
    }
  ' "$tmp.st-meta")

  # 4. 未发版实现记录、产品 tree 匹配与原始未记录产品提交
  : > "$tmp.st-unrel-impls"
  : > "$tmp.st-impl-details"
  : > "$tmp.st-covered-commits"
  local unrel_impls="" prod_matched="none"
  while IFS=$'\t' read -r tag kind file name state scope base_val fail_cnt unv_cnt loc; do
    [ "$tag" = "REC" ] && [ "$kind" = "implement" ] || continue
    [ "$state" != "aborted" ] || continue
    local is_unrel=0
    if [ "$release_base" = "none" ]; then
      is_unrel=1
    elif ! grep_match -qxF "$file" "$tmp.st-in-base"; then
      is_unrel=1
    elif grep_match -qxF "$file" "$tmp.st-changed-since-base"; then
      is_unrel=1
    fi
    [ "$is_unrel" -eq 1 ] || continue

    printf '%s\n' "$name" >> "$tmp.st-unrel-impls"
    unrel_impls="${unrel_impls:+$unrel_impls }$name"

    local range_raw start_ref="" end_ref="" start_sha="" end_sha="" hist_rewritten=0 pmatch="mismatch"
    range_raw=$(printf '%s\n' "$loc" | awk '
      {
        s = $0; gsub(/`/, "", s)
        if (match(s, /[A-Za-z0-9._\/-]+\.\.[A-Za-z0-9._\/-]+/)) {
          print substr(s, RSTART, RLENGTH); exit
        }
      }')
    if [ -n "$range_raw" ]; then
      start_ref=${range_raw%%..*}
      end_ref=${range_raw#*..}
      start_sha=$(git rev-parse --verify "${start_ref}^{commit}" 2>/dev/null || true)
      end_sha=$(git rev-parse --verify "${end_ref}^{commit}" 2>/dev/null || true)
      if [ -z "$start_sha" ] || [ -z "$end_sha" ] ||
         ! git merge-base --is-ancestor "$start_sha" "$head" 2>/dev/null ||
         ! git merge-base --is-ancestor "$end_sha" "$head" 2>/dev/null; then
        hist_rewritten=1
      else
        git rev-list "${start_sha}..${end_sha}" >> "$tmp.st-covered-commits" 2>/dev/null || true
      fi
      if [ -n "$end_sha" ] && git diff --quiet "$end_sha" "$head" -- "${product_spec[@]}" 2>/dev/null; then
        pmatch="match"
        [ "$state" = "completed" ] && prod_matched=$name
      fi
    fi
    printf '%s status=%s range=%s product-tree=%s%s\n' \
      "$name" "$state" "${range_raw:-unknown}" "$pmatch" \
      "$([ "$hist_rewritten" -eq 1 ] && printf ' history-rewritten' || true)" >> "$tmp.st-impl-details"
  done < "$tmp.st-meta"

  : > "$tmp.st-prod-commits"
  local scan_range=""
  if [ "$release_base" = "none" ]; then
    local init_base=""
    init_base=$(git log --diff-filter=A -n 1 --format=%H "$head" -- .discuss_design/config.yaml 2>/dev/null || true)
    [ -z "$init_base" ] || scan_range="${init_base}..${head}"
  else
    scan_range="${release_base}..${head}"
  fi
  if [ -n "$scan_range" ]; then
    git rev-list --reverse "$scan_range" -- "${product_spec[@]}" > "$tmp.st-prod-commits" 2>/dev/null || true
    # 被覆盖的讨论写盘提交：改过被未发版实现记录引用的讨论记录的提交（ADR 0040）
    local cited_disc
    for cited_disc in $(LC_ALL=C awk -F '\t' -v unrel="$tmp.st-unrel-impls" '
        BEGIN { while ((getline n < unrel) > 0) if (n != "") want[n] = 1; close(unrel) }
        $1 == "UP" && $2 == "implement" && ($3 in want) {
          item = $4; gsub(/`/, "", item); sub(/^[ \t]+/, "", item)
          split(item, w, /[ \t]+/)
          if (w[1] ~ /^[0-9][0-9][0-9][0-9]$/ && (w[2] ~ /^#[0-9]+$/ || w[2] ~ /^Q[0-9]+$/) && !seen[w[1]]++) print w[1]
        }' "$tmp.st-meta"); do
      git rev-list "$scan_range" -- ":(glob)record/discuss/${cited_disc}-*.md" >> "$tmp.st-covered-commits" 2>/dev/null || true
    done
  fi
  local unrec_commits
  unrec_commits=$(LC_ALL=C awk -v cov_file="$tmp.st-covered-commits" '
    BEGIN {
      while ((getline c < cov_file) > 0) if (c != "") cov[c] = 1
      close(cov_file)
    }
    $0 != "" && !cov[$0] {
      s = substr($0, 1, 7)
      out = (out == "" ? s : out " " s)
    }
    END { print (out == "" ? "none" : out) }
  ' "$tmp.st-prod-commits")

  # 5. 未发版验收记录、MATCHING_INTEGRATION_VERIFY 与 UNCOVERED_IMPLEMENT_RECORDS
  : > "$tmp.st-verify-details"
  : > "$tmp.st-unverified"
  : > "$tmp.st-int-covered-impls"
  local matching_int="" has_any_matching_completed_verify=0
  while IFS=$'\t' read -r tag kind file name state scope base_val fail_cnt unv_cnt loc; do
    [ "$tag" = "REC" ] && [ "$kind" = "verify" ] || continue
    [ "$state" != "aborted" ] || continue
    local is_unrel=0
    if [ "$release_base" = "none" ]; then
      is_unrel=1
    elif ! grep_match -qxF "$file" "$tmp.st-in-base"; then
      is_unrel=1
    elif grep_match -qxF "$file" "$tmp.st-changed-since-base"; then
      is_unrel=1
    fi
    # 提取该验收记录的上游实现记录列表
    local v_ups
    v_ups=$(LC_ALL=C awk -F '\t' -v vn="$name" '
      $1 == "UP" && $2 == "verify" && $3 == vn {
        item = $4; gsub(/`/, "", item)
        sub(/^[ \t]+/, "", item); sub(/[ \t]+$/, "", item)
        split(item, w, /[ \t]+/)
        if (w[1] != "") print w[1]
      }' "$tmp.st-meta")
    if [ "$is_unrel" -eq 0 ] && [ -s "$tmp.st-unrel-impls" ] && [ -n "$v_ups" ]; then
      local u
      for u in $v_ups; do
        if grep_match -qxF "$u" "$tmp.st-unrel-impls"; then is_unrel=1; break; fi
      done
    fi
    [ "$is_unrel" -eq 1 ] || continue

    local bsha="" tmatch="mismatch"
    if [ "$base_val" != "-" ] && [ -n "$base_val" ]; then
      bsha=$(git rev-parse --verify "${base_val}^{commit}" 2>/dev/null || true)
      if [ -n "$bsha" ] && git diff --quiet "$bsha" "$head" -- . ':!record' 2>/dev/null; then
        tmatch="match"
      fi
    fi
    if [ "$state" = "completed" ] && [ "$fail_cnt" -eq 0 ] && [ "$tmatch" = "match" ]; then
      has_any_matching_completed_verify=1
      if [ "$scope" = "integration" ] || [ "$scope" = "legacy" ]; then
        matching_int="${matching_int:+$matching_int }$name"
        [ -z "$v_ups" ] || printf '%s\n' "$v_ups" >> "$tmp.st-int-covered-impls"
      fi
    fi
    LC_ALL=C awk -F '\t' -v vn="$name" '$1 == "UNV" && $2 == vn { print $2 " #" $3 " " $4 }' "$tmp.st-meta" >> "$tmp.st-unverified"
    local ups_inline
    ups_inline=$(printf '%s\n' "$v_ups" | awk 'NF { out = (out == "" ? $0 : out "," $0) } END { print (out == "" ? "none" : out) }')
    printf '%s scope=%s status=%s baseline=%s fail=%s unverified=%s tree-match=%s upstream=%s\n' \
      "$name" "$scope" "$state" "${base_val:--}" "$fail_cnt" "$unv_cnt" "$tmatch" "$ups_inline" >> "$tmp.st-verify-details"
  done < "$tmp.st-meta"

  local uncovered_impls
  uncovered_impls=$(LC_ALL=C awk -v cov_file="$tmp.st-int-covered-impls" '
    BEGIN {
      while ((getline c < cov_file) > 0) if (c != "") cov[c] = 1
      close(cov_file)
    }
    $0 != "" && !cov[$0] {
      out = (out == "" ? $0 : out " " $0)
    }
    END { print (out == "" ? "none" : out) }
  ' "$tmp.st-unrel-impls")

  # 6. STAGE_HINT 派生（按 checker/SPEC.md 优先级）
  local has_unrel_work=0
  if [ -n "$unrel_impls" ] || [ "$unrec_commits" != "none" ]; then
    has_unrel_work=1
  fi
  local stage_hint="clean"
  if [ "$has_open_defect" -eq 1 ]; then
    stage_hint="in-progress-defect"
  elif [ -n "$open_impl" ] || [ "$pending_rows" != "none" ]; then
    stage_hint="pending-implement"
  elif [ "$has_unrel_work" -eq 1 ] && [ "$has_any_matching_completed_verify" -eq 0 ]; then
    stage_hint="pending-verify"
  elif [ "$has_unrel_work" -eq 1 ] && { [ -z "$matching_int" ] || [ "$uncovered_impls" != "none" ]; }; then
    stage_hint="pending-integration-verify"
  elif [ "$has_unrel_work" -eq 1 ] && [ -n "$matching_int" ] && [ "$uncovered_impls" = "none" ] && [ "$open_iv_count" -eq 0 ]; then
    stage_hint="ready-for-release"
  elif [ "$open_iv_count" -gt 0 ]; then
    stage_hint="pending-verify"
  fi

  # 7. 跨分支 record/ 差异（仅本地分支与已有远端跟踪 ref，不 fetch）
  : > "$tmp.st-branches"
  local other_branches="" full_ref ref
  while IFS=$'\t' read -r full_ref ref; do
    [ -n "$ref" ] || continue
    case "$full_ref" in */HEAD) continue ;; esac
    [ "$ref" != "$branch" ] || continue
    if ! git diff --quiet "$head" "$ref" -- record discuss research 2>/dev/null; then
      local diff_cnt merged_flag=""
      diff_cnt=$(git diff --name-only "$head" "$ref" -- record discuss research 2>/dev/null | wc -l | awk '{ print $1 }')
      if git merge-base --is-ancestor "$ref" "$head" 2>/dev/null; then
        merged_flag=" merged"
      else
        other_branches="${other_branches:+$other_branches }$ref"
      fi
      printf '%s record-diff-files=%s%s\n' "$ref" "$diff_cnt" "$merged_flag" >> "$tmp.st-branches"
    fi
  done < <(git for-each-ref --format='%(refname)	%(refname:short)' refs/heads refs/remotes 2>/dev/null)

  printf 'BRANCH=%s\n' "$branch"
  printf 'HEAD=%s\n' "$head"
  printf 'DIRTY=%s\n' "$dirty"
  printf 'TOOLKIT_VERSION=%s\n' "$toolkit_ver"
  printf 'LAST_RELEASE=%s\n' "$last_rel"
  printf 'LAST_RELEASE_CANDIDATE=%s\n' "$last_rel_cand"
  printf 'RELEASE_BASE=%s\n' "$release_base"
  printf 'OPEN_DISCUSS=%s\n' "${open_discuss:-none}"
  printf 'OPEN_IMPLEMENT=%s\n' "${open_impl:-none}"
  printf 'OPEN_VERIFY=%s\n' "${open_verify:-none}"
  printf 'OPEN_RELEASE=%s\n' "${open_release:-none}"
  printf 'OPEN_IMPLEMENT_OR_VERIFY_COUNT=%s\n' "$open_iv_count"
  printf 'PENDING_DISCUSS_ROWS=%s\n' "$pending_rows"
  printf 'UNRELEASED_IMPLEMENTS=%s\n' "${unrel_impls:-none}"
  printf 'PRODUCT_TREE_MATCHED_IMPLEMENT=%s\n' "$prod_matched"
  printf 'UNRECORDED_PRODUCT_COMMITS=%s\n' "$unrec_commits"
  printf 'MATCHING_INTEGRATION_VERIFY=%s\n' "${matching_int:-none}"
  printf 'UNCOVERED_IMPLEMENT_RECORDS=%s\n' "$uncovered_impls"
  printf 'OTHER_BRANCHES_WITH_RECORD_DIFF=%s\n' "${other_branches:-none}"
  printf 'STAGE_HINT=%s\n' "$stage_hint"
  if [ -s "$tmp.st-impl-details" ]; then
    printf '\n[implements]\n'
    cat "$tmp.st-impl-details"
  fi
  if [ -s "$tmp.st-verify-details" ]; then
    printf '\n[verifies]\n'
    cat "$tmp.st-verify-details"
  fi
  if [ -s "$tmp.st-unverified" ]; then
    printf '\n[unverified]\n'
    cat "$tmp.st-unverified"
  fi
  if [ -s "$tmp.st-branches" ]; then
    printf '\n[branches]\n'
    cat "$tmp.st-branches"
  fi
  exit 0
}

if [ "$MODE" = status ]; then
  run_status_mode
fi

# 本次配置一次解析；不缓存上次检查的结果。
awk -v base="$tmp" '
  BEGIN {
    split("patterns managed want recorded managed-version", files, " ")
    for (i in files) printf "" > (base "." files[i])
  }
  function want(n) { if (!seen[n]++) print n > (base ".want") }
  /^toolkit:/ && !got_version { recorded=$0; sub(/^toolkit:[ ]*/, "", recorded); got_version=1 }
  /^scan:/ { on="patterns"; next }
  /^managed:/ { on="managed"; next }
  /^integrations:/ { on="integrations"; next }
  on == "managed" && /^  # toolkit: / && !got_managed {
    version=$0; sub(/^  # toolkit: /, "", version); got_managed=1
  }
  on == "integrations" && /^  [A-Za-z0-9_-]+:/ {
    n=$1; sub(/:$/, "", n); want("design-publish-" n)
  }
  on ~ /^(patterns|managed)$/ && /^  - / {
    if (on == "managed" && $NF ~ /^\.agents\/skills\/[^\/]+\//) {
      n=$NF; sub(/^\.agents\/skills\//, "", n); sub(/\/.*/, "", n); want(n)
    }
    sub(/^  - /, ""); gsub(/^["'\'']|["'\'']$/, "")
    print > (base "." on); next
  }
  on && /^[^ #]/ { on="" }
  END { print recorded > (base ".recorded"); print version > (base ".managed-version") }
' "$CONFIG" || die "Cannot read workspace config"

# 工作区实体文件与顶层目录枚举：在 git 仓库里用 git ls-files（跳过忽略目录、子模块内部与嵌套工作树），
# 并补入 .agents/skills 下的实体文件（覆盖被 .gitignore 中 /.agents/skills/design-* 忽略的用户自有 skill）；
# 不在 git 仓库里才退回 find。全部文件路径统一为 ./<path> 格式。
# 循环整体重定向（fd 3 写顶层目录、fd 4 写文件），不逐行打开临时文件。
if [ -e .git ]; then
  git -c core.quotePath=false ls-files -z --cached --others --exclude-standard > "$tmp.paths" ||
    die "Cannot enumerate Git paths"
  last_d=""
  while IFS= read -r -d '' p; do
    case "$p" in
      */*) d=${p%%/*} ;;
      *) d=$p ;;
    esac
    if [ "$d" != "$last_d" ]; then
      last_d=$d
      [ -d "$d" ] && printf '%s\n' "$d" >&3
    fi
    [ -f "$p" ] && [ ! -L "$p" ] && printf './%s\n' "$p" >&4
    true
  done < "$tmp.paths" 3> "$tmp.tops" 4> "$tmp.files"
  if [ -d .agents/skills ]; then
    find .agents/skills -type f | sed 's#^\./##; s#^#./#' >> "$tmp.files"
  fi
  LC_ALL=C sort -u "$tmp.files" > "$tmp.all-files"
  LC_ALL=C sort -u "$tmp.tops" > "$tmp.tops-sorted"
else
  find . -type f -not -path './.git/*' | sort -u > "$tmp.all-files"
  : > "$tmp.tops-sorted"
fi

# 缓存检查范围内的文件列表（配置键 scan:；* 可跨目录，故 skills/**/*.md 也成立）
: > "$tmp.found"
if [ -s "$tmp.patterns" ] && [ -s "$tmp.all-files" ]; then
  # 模式先读进数组，避免每个文件重读一遍
  pats=()
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    p=${p#./}
    pats+=("$p" "${p//\/\*\*\//\/*}")
  done < "$tmp.patterns"
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    rel=${f#./}
    for p in ${pats[@]+"${pats[@]}"}; do
      # shellcheck disable=SC2254
      case "$rel" in
        $p) printf '%s\n' "$f"; break ;;
      esac
    done
  done < "$tmp.all-files" > "$tmp.found"
fi
LC_ALL=C sort -u "$tmp.found" > "$tmp.design"

# 工作区里所有纳入枚举的 md 实体文件（不跟符号链接），可再按参数排除若干顶层目录
md_files() {
  local f d
  while IFS= read -r f; do
    case "$f" in *.md) ;; *) continue ;; esac
    for d in "$@"; do
      case "$f" in "./$d/"*) continue 2 ;; esac
    done
    printf '%s\n' "$f"
  done < "$tmp.all-files"
}

# 链接目标一次读完：AGENTS.md 与两套 skill 入口里的链接，供后文用 link_target 查（不再逐个起 readlink）。
link_paths=()
for l in AGENTS.md .agents/skills/* .claude/skills/*; do
  [ -L "$l" ] && link_paths+=("$l")
done
link_targets=()
if [ "${#link_paths[@]}" -gt 0 ]; then
  readlink "${link_paths[@]}" > "$tmp.link-targets" || die "Cannot read symlink targets"
  while IFS= read -r t; do link_targets+=("$t"); done < "$tmp.link-targets"
  [ "${#link_targets[@]}" -eq "${#link_paths[@]}" ] || die "Unexpected symlink target count"
fi
link_target() { # 设 LT 为 $1 的链接目标；不是链接时为空
  local i=0
  LT=""
  while [ "$i" -lt "${#link_paths[@]}" ]; do
    if [ "${link_paths[$i]}" = "$1" ]; then LT=${link_targets[$i]}; return 0; fi
    i=$((i + 1))
  done
  return 1
}

# ── 0. AGENTS.md 是指向 CLAUDE.md 的符号链接 ───────────────────
link_target AGENTS.md || true
if [ ! -L AGENTS.md ] || [ "$LT" != "CLAUDE.md" ]; then
  echo "AGENTS.md must link to CLAUDE.md"
  fail=1
fi

# ── 1. 托管块标记（内容按 managed 的 block 哈希在第 7 项核对） ──────
begin='<!-- design-kernel:begin -->'
end='<!-- design-kernel:end -->'
markers_ok=0
if [ ! -f CLAUDE.md ]; then
  echo "Missing CLAUDE.md"; fail=1
else
  # 一次读：数标记，同时写出托管块与地图行（托管块的标准地图与块后地图都算地图）
  awk -v b="$begin" -v e="$end" -v blk="$tmp.block" -v map="$tmp.map" '
    $0 == e { ne++; inb = 0 }
    inb { print > blk }
    after && /^[[:space:]]*\|/ { print > map }
    $0 == b { nb++; inb = 1; after = 1 }
    END { printf "" > blk; printf "" > map; print nb + 0, ne + 0 }
  ' CLAUDE.md > "$tmp.markers" || die "Cannot read CLAUDE.md"
  read -r nb ne < "$tmp.markers"
  if [ "$nb" -ne 1 ] || [ "$ne" -ne 1 ]; then
    echo "CLAUDE.md needs one of each managed block marker ($begin / ${end})"
    fail=1
  else
    markers_ok=1
  fi
fi

# ── 2. 必备术语表与链接处理器 ────────────────────────────────
context="model/domain/GLOSSARY.md"
context_file="./${context}"
if [ ! -f "$context_file" ] || [ ! -r "$context_file" ]; then
  echo "Missing readable glossary: $context"; fail=1
fi
if [ ! -r "$CHECKER_DIR/visible-text.awk" ]; then
  echo "Link processor missing or unreadable: $CHECKER_DIR/visible-text.awk"
  fail=1
fi

# ── 3. 记录不被引用（按数组分批调用 grep，不用 xargs） ──────────
# 一个 awk 读所有 md 实体文件，按三类各自的豁免目录收集命中行；输出与 grep -nH 一致。
md_files > "$tmp.refs"
if [ -s "$tmp.refs" ]; then
  LC_ALL=C awk -v list="$tmp.refs" -v out="$tmp.refhits" '
    BEGIN {
      while ((s = getline f < list) > 0) if (f != "") ARGV[ARGC++] = f
      close(list)
      if (s < 0) exit 2
    }
    FNR == 1 {
      path = FILENAME; sub(/^\.\//, "", path); top = path; sub(/\/.*/, "", top); kind = ""
      if (top == "record") { kind = path; sub(/^record\//, "", kind); sub(/\/.*/, "", kind) }
      else if (top == "discuss" || top == "research") kind = top
      inrec = (top == "record" || top == "discuss" || top == "research")
    }
    {
      later = ($0 ~ /(^|[^A-Za-z0-9_-])record\/(implement|verify)\/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-/ || $0 ~ /(^|[^A-Za-z0-9_-])record\/(release|deliver)\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/)
      if (!inrec && top != "doc" && $0 ~ /(^|[^A-Za-z0-9_-])discuss\/[0-9]/) print "D\t" FILENAME ":" FNR ":" $0 > out
      if (!inrec && top != "doc" && $0 ~ /(^|[^A-Za-z0-9_-])research\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/) print "R\t" FILENAME ":" FNR ":" $0 > out
      if (!inrec && top != "doc" && later) print "X\t" FILENAME ":" FNR ":" $0 > out
      if (kind != "discuss" && top != "doc" && $0 ~ /(^|[^A-Za-z0-9_-])doc\/[A-Za-z0-9][A-Za-z0-9._-]*\.[A-Za-z]+/) print "C\t" FILENAME ":" FNR ":" $0 > out
      if ((kind == "discuss" || kind == "research") && later) print "W\t" FILENAME ":" FNR ":" $0 > out
      if ((kind == "implement" || kind == "verify") && $0 ~ /(^|[^A-Za-z0-9_-])record\/(release|deliver)\/[A-Za-z0-9][A-Za-z0-9._-]*\.md/) print "W\t" FILENAME ":" FNR ":" $0 > out
    }
    END { printf "" > out }
  ' || die "Record reference scan failed"
  ref_report() { # $1 = 类别；$2 = 标题
    local line any=0
    while IFS= read -r line; do
      case "$line" in "$1"$'\t'*) ;; *) continue ;; esac
      [ "$any" -eq 1 ] || { echo "$2"; any=1; }
      printf '  %s\n' "${line#*$'\t'}"
    done < "$tmp.refhits"
    [ "$any" -eq 0 ] || fail=1
  }
  ref_report D "References to discussion records. Put durable conclusions in design files."
  ref_report R "References to research records. Put needed facts in the text."
  ref_report C "References to individual files in doc/."
  ref_report X "References to implementation, acceptance or release records from design or skills."
  ref_report W "References to downstream records. Point to upstream or peer records only."
fi

# ── 4. 死链（屏蔽代码块与行内代码后提取行内链接，内建检查存在性） ─
{
  [ ! -s "$tmp.design" ] || grep_maybe '\.md$' "$tmp.design"
  while IFS= read -r f; do
    case "$f" in ./journey/*.md) printf '%s\n' "$f" ;; esac
  done < "$tmp.all-files"
  while IFS= read -r f; do
    case "$f" in ./.agents/skills/*.md) printf '%s\n' "$f" ;; esac
  done < "$tmp.all-files"
} | LC_ALL=C sort -u > "$tmp.dead-candidates"
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in ./discuss/*|./research/*|./record/*|./doc/*) continue ;; esac
  printf '%s\n' "$f"
done < "$tmp.dead-candidates" > "$tmp.dead-files"
if [ -s "$tmp.dead-files" ] && [ -r "$CHECKER_DIR/visible-text.awk" ]; then
  if ! LC_ALL=C awk -v files_list="$tmp.dead-files" -f "$CHECKER_DIR/visible-text.awk" > "$tmp.links"; then
    echo "Broken link scan failed"
    fail=1
  else
    while IFS=$'\t' read -r f t; do
      [ -n "$f" ] || continue
      case "$t" in *://*|mailto:*|\#*) continue ;; esac
      t="${t%%#*}"
      [ -z "$t" ] && continue
      d=${f%/*}
      [ -e "$d/$t" ] || printf '  Broken link  %s -> %s\n' "$f" "$t"
    done < "$tmp.links" > "$tmp.dead"
    if [ -s "$tmp.dead" ]; then echo "Broken links:"; cat "$tmp.dead"; fail=1; fi
  fi
fi

# Validate lifecycle and upstream references across both record formats.
for dir in record/discuss discuss record/implement record/verify record/release record/deliver; do
  for f in "$dir"/*.md; do
    [ -f "$f" ] || continue
    [ -s "$f" ] || { echo "Empty record: $f" >&2; fail=1; continue; }
    printf './%s\n' "$f"
  done
done > "$tmp.records"
if [ -s "$tmp.records" ] && [ -r "$CHECKER_DIR/visible-text.awk" ]; then
  LC_ALL=C awk -v files_list="$tmp.records" -v mode=records -f "$CHECKER_DIR/visible-text.awk" || fail=1
fi

# ── 6. 编号命名 ─────────────────────────────────────────────────
# 列出各目录的条目后由一个 awk 判前缀与重号（M = 要查前缀的 md，A = 参与查重的条目，E = 目录结束）。
{
  if [ -d journey ]; then
    for f in journey/*; do
      [ -f "$f" ] || continue
      b=${f##*/}
      case "$b" in USER.md|OPERATOR.md|README.md) continue ;; *.md) ;; *) continue ;; esac
      printf 'M\tjourney\t%s\n' "$f"
      printf 'A\tjourney\t%s\n' "$b"
    done
    printf 'E\tjourney\n'
  fi
  for d in discuss research record/discuss record/research model/adr doc; do
    [ -d "$d" ] || continue
    for f in "$d"/*; do
      [ -e "$f" ] || [ -L "$f" ] || continue
      b=${f##*/}
      case "$b" in *.md) [ -f "$f" ] && [ "$b" != README.md ] && printf 'M\t%s\t%s\n' "$d" "$f" ;; esac
      printf 'A\t%s\t%s\n' "$d" "$b"
    done
    printf 'E\t%s\n' "$d"
  done
} > "$tmp.numbered"
LC_ALL=C awk -F '\t' '
  $1 == "M" { if ($3 !~ /\/[0-9][0-9][0-9][0-9]-[^\/]*$/) { print "Filename needs an NNNN- prefix: " $3; bad = 1 } next }
  $1 == "A" { if ($3 ~ /^[0-9][0-9][0-9][0-9]/) cnt[substr($3, 1, 4)]++; next }
  $1 == "E" {
    out = ""; n = 0
    for (k in cnt) if (cnt[k] > 1) keys[++n] = k
    for (i = 2; i <= n; i++) { v = keys[i]; for (j = i - 1; j >= 1 && keys[j] > v; j--) keys[j + 1] = keys[j]; keys[j + 1] = v }
    for (i = 1; i <= n; i++) out = out keys[i] " "
    if (n > 0) { print $2 "/ has duplicate numbers: " out; bad = 1 }
    split("", cnt); split("", keys)
  }
  END { exit bad }
' "$tmp.numbered" || fail=1

# 实现与验收记录名是 YYYYMMDD-<主题>.md；发版记录（及旧交付记录）名是 <版本>[-<目标环境>][-<序号>].md，另查跨目录同名
for d in record/implement record/verify; do
  [ -d "$d" ] || continue
  for f in "$d"/*.md; do
    [ -f "$f" ] || continue
    b=${f##*/}
    case "$b" in
      [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-?*.md) ;;
      *) echo "Record filename must be YYYYMMDD-<topic>.md: $f"; fail=1 ;;
    esac
  done
done
if [ -d record/release ] && [ -d record/deliver ]; then
  for f in record/release/*.md; do
    [ -f "$f" ] || continue
    b=${f##*/}
    if [ -f "record/deliver/$b" ]; then
      echo "Duplicate release record filename across record/release/ and record/deliver/: $b"
      fail=1
    fi
  done
fi

# ── 7. 受管副本完整且与配置一致（批量 shasum） ──────────────────
IFS= read -r recorded < "$tmp.recorded"
IFS= read -r managed_version < "$tmp.managed-version"
if [ -z "$recorded" ] || [ "$managed_version" != "$recorded" ]; then
  echo "Managed version differs from toolkit. Restore with design-init link or upgrade."
  fail=1
fi
# 应有的受管 skill = managed 里登记过的 .agents/skills/<名>（下文逐项按哈希核对）+ 启用的集成。
want=""
IFS= read -r -d '' want < "$tmp.want" || true
if [ -z "$want" ]; then
  echo "No managed skills in manifest. Restore with design-init link or upgrade."; fail=1
fi
for n in $want; do
  if [ ! -d ".agents/skills/$n" ] || [ -L ".agents/skills/$n" ]; then
    echo "Missing managed skill .agents/skills/$n. Restore with design-init link or upgrade."; fail=1
  fi
  l=".claude/skills/$n"
  link_target "$l" || true
  if [ ! -L "$l" ] || [ "$LT" != "../../.agents/skills/$n" ]; then
    echo "$l is missing or points to the wrong target. Restore with design-init link."; fail=1
  fi
done

has_block=0
# 文件与链接一起交给一次 shasum：链接的目标串写进临时文件再算（与 printf '%s' 目标 | shasum 等价）。
managed_files=()
link_i=0
while IFS= read -r line; do
  [ -n "$line" ] || continue
  set -- $line
  [ "$#" -eq 3 ] || { echo "Malformed managed entry: $line"; fail=1; continue; }
  kind=$1; expected=$2; p=$3
  case "$expected" in
    *[!0-9a-f]*) echo "Invalid managed hash: $p"; fail=1; continue ;;
  esac
  [ "${#expected}" -eq 64 ] || { echo "Invalid managed hash: $p"; fail=1; continue; }
  printf '%s\n' "$p" >&3
  case "$kind" in
    file)
      if [ ! -f "$p" ] || [ -L "$p" ]; then echo "Managed file missing or of the wrong type: $p"; fail=1; continue; fi
      managed_files+=("$p")
      printf '%s\t%s\t%s\n' "$expected" "$p" "$p" >&4
      ;;
    block)
      if [ "$p" != CLAUDE.md ]; then echo "A managed block must be in CLAUDE.md: $p"; fail=1; continue; fi
      [ "$markers_ok" -eq 1 ] || continue
      has_block=1
      managed_files+=("$tmp.block")
      printf '%s\t%s\t%s\n' "$expected" "$tmp.block" "CLAUDE.md managed block. Restore with design-init link or upgrade." >&4
      ;;
    link)
      if [ ! -L "$p" ]; then echo "Missing managed symlink: $p"; fail=1; continue; fi
      link_i=$((link_i + 1))
      if link_target "$p"; then target=$LT; else target=$(readlink "$p") || die "Cannot read managed symlink: $p"; fi
      printf '%s' "$target" > "$tmp.link.$link_i" || die "Cannot hash managed symlink: $p"
      managed_files+=("$tmp.link.$link_i")
      printf '%s\t%s\t%s\n' "$expected" "$tmp.link.$link_i" "$p" >&4
      ;;
    *) echo "Invalid managed type: $kind"; fail=1; continue ;;
  esac
done < "$tmp.managed" 3> "$tmp.managed-paths" 4> "$tmp.expected-files"

if [ "${#managed_files[@]}" -gt 0 ]; then
  : > "$tmp.actual-shasum"
  idx=0
  while [ "$idx" -lt "${#managed_files[@]}" ]; do
    chunk=("${managed_files[@]:$idx:200}")
    shasum -a 256 "${chunk[@]}" >> "$tmp.actual-shasum" || die "Cannot hash managed files"
    idx=$((idx + 200))
  done
  awk -v actual_file="$tmp.actual-shasum" '
    BEGIN {
      while ((getline line < actual_file) > 0) {
        h = substr(line, 1, 64)
        p = substr(line, 67)
        actual[p] = h
      }
      close(actual_file)
    }
    {
      split($0, f, "\t")
      if (actual[f[2]] != f[1]) {
        print "Managed content differs from the recorded hash: " f[3]
        bad = 1
      }
    }
    END { exit bad }
  ' "$tmp.expected-files" || fail=1
fi

if [ "$markers_ok" -eq 1 ] && [ "$has_block" -eq 0 ] && ! grep -q ' CLAUDE.md$' "$tmp.managed"; then
  echo "Manifest needs a CLAUDE.md block entry. Restore with design-init link or upgrade."; fail=1
fi
LC_ALL=C sort "$tmp.managed-paths" > "$tmp.managed-sorted"
if [ -s "$tmp.managed-sorted" ] && [ -n "$(uniq -d "$tmp.managed-sorted")" ]; then
  echo "Duplicate managed paths"; fail=1
fi
{
  dirs=()
  for n in $want; do
    [ -d ".agents/skills/$n" ] && dirs+=(".agents/skills/$n")
    printf '%s\n' ".claude/skills/$n"
  done
  [ "${#dirs[@]}" -eq 0 ] || find "${dirs[@]}" \( -type f -o -type l \) -print
  printf '%s\n' AGENTS.md CLAUDE.md check.sh .discuss_design/checker.sh .discuss_design/visible-text.awk
} > "$tmp.actual-managed"
LC_ALL=C sort -u "$tmp.actual-managed" > "$tmp.actual-sorted"
if ! cmp -s "$tmp.managed-sorted" "$tmp.actual-sorted"; then
  echo "Managed paths differ from the expected set. Restore with design-init link or upgrade."
  diff "$tmp.managed-sorted" "$tmp.actual-sorted" > "$tmp.managed-diff" || true
  sed 's/^/  /' "$tmp.managed-diff"
  fail=1
fi

# 两套 agent 的入口都必须可读且位置正确。
for l in .agents/skills/*; do
  [ -d "$l" ] || [ -L "$l" ] || continue
  [ -f "$l/SKILL.md" ] && [ -r "$l/SKILL.md" ] || { echo "Skill needs a readable SKILL.md: $l"; fail=1; continue; }
  n=${l##*/}
  cl=".claude/skills/$n"
  link_target "$cl" || true
  if [ ! -L "$cl" ] || [ "$LT" != "../../.agents/skills/$n" ]; then
    echo "$cl is missing or points to the wrong target. Restore with design-init."; fail=1
  elif [ ! -f "$cl/SKILL.md" ] || [ ! -r "$cl/SKILL.md" ]; then
    echo "$cl has an unreadable target. Restore the corresponding .agents skill."; fail=1
  fi
done
for l in .claude/skills/*; do
  [ -d "$l" ] || [ -L "$l" ] || continue
  n=${l##*/}
  link_target "$l" || true
  if [ ! -L "$l" ] || [ "$LT" != "../../.agents/skills/$n" ] || [ ! -f ".agents/skills/$n/SKILL.md" ] || [ ! -r ".agents/skills/$n/SKILL.md" ]; then
    echo "$l must link to a readable same-name Agents skill"; fail=1
  fi
done

# ── 7b. journey/、model/、verify/、record/（及旧的 discuss/、research/）不能被 Git 忽略（否则其中文件被检查静默漏掉） ─
if [ -e .git ]; then
  probes=()
  for d in journey journey/user journey/operator model verify record record/discuss record/research record/implement record/verify record/release record/deliver discuss research; do
    [ ! -d "$d" ] || probes+=("$d/x")
  done
  status=0
  [ "${#probes[@]}" -eq 0 ] || git check-ignore -- "${probes[@]}" > "$tmp.ignored" || status=$?
  [ "$status" -le 1 ] || die "Cannot check ignore rules for design directories"
  if [ "${#probes[@]}" -gt 0 ]; then
    while IFS= read -r p; do
      d=${p%/x}
      echo "$d/ is ignored by Git and will be skipped. Update .gitignore to include $d/."
      fail=1
    done < "$tmp.ignored"
  fi
fi

# ── 8. 地图列全顶层目录 ─────────────────────────────────────────
if [ ! -e .git ]; then
  echo "Outside a Git repository. Skipping the top-level map check."
elif [ "$markers_ok" -eq 1 ]; then
  map_text=""
  IFS= read -r -d '' map_text < "$tmp.map" || true
  while IFS= read -r d; do
    [ -n "$d" ] || continue
    case "$d" in
      .*|journey|model|impl|operate|verify|record|doc) continue ;;
      discuss|research)
        echo "Top-level directory \`$d/\` is a legacy record location. Move it intact to record/$d/ as described in design-init."
        continue ;;
      deploy)
        echo "Top-level directory \`deploy/\` is a legacy operations location. See design-init for migration to operate/deploy/, or record why it stays in the map."
        continue ;;
    esac
    if case "$map_text" in *"\`$d/"*|*"\`$d\`"*) false ;; *) true ;; esac; then
      echo "Map is missing top-level directory \`$d/\`. Add its category, purpose and authority below the managed block in CLAUDE.md, or migrate it using design-init."
      fail=1
    else
      echo "Top-level directory \`$d/\` is outside the standard layout. Move implementation to impl/ with design-init or document why it stays."
    fi
  done < "$tmp.tops-sorted"
fi

# ── 8b. 旧布局只提示（ADR 0024、0025、0035、0036、0039；upgrade 不搬，由 agent 按 design-init 迁） ─
if [ -d model/journey ] || [ -d model/cuj ]; then
  echo "Legacy journey layout. Use design-init to plan the move to flat journey/ with USER.md and OPERATOR.md."
fi
if [ -d journey/user ] || [ -d journey/operator ]; then
  echo "Legacy journey subdirectories (journey/user/ or journey/operator/). Use design-init to migrate to flat journey/ with USER.md and OPERATOR.md."
fi
if [ -d record/deliver ]; then
  echo "Legacy record/deliver/ directory. Use design-init to move it intact to record/release/."
fi
if [ -d model/verify ]; then
  echo "Legacy verify contract directory at model/verify/. Use design-init upgrade to move verify/SPEC.md to verify/."
fi
if [ -d model/arch/component ]; then
  echo "Legacy component layout at model/arch/component/. Use design-init to move components to model/arch/<container>/COMPONENT.md."
fi
if [ -d model/spec ]; then
  echo "Legacy specification layout at model/spec/. Use design-init to migrate matched specifications to model/arch/<container>/SPEC.md. Retain unmatched specifications until a discussion addresses them."
fi

# ── 9. 本机装着其他版本时提示（不报红） ────────────────────
cur=""
[ ! -r "$HOME/.agents/skills/design-init/VERSION" ] || IFS= read -r cur < "$HOME/.agents/skills/design-init/VERSION" || true
if [ -n "$cur" ] && [ "$cur" != "$recorded" ]; then
  echo "Installed version: ${cur}. Workspace version: ${recorded}. Use design-init to upgrade."
fi

# ── 本工作区的扩展检查 ──────────────────────────────────────────
if [ -f check.local.sh ]; then
  bash check.local.sh || fail=1
fi

[ "$fail" -eq 0 ] && echo "✓ Checks passed"
exit "$fail"
