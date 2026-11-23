# Markdown 行内链接扫描器与记录解析器：屏蔽代码块与行内代码。
# 支持单文件参数或 -v files_list=<文件列表> 的单进程批处理。
# mode=""（默认）: 扫描行内链接；mode="records": 校验记录生命周期与上游引用；
# mode="release": 读取合资格集成验收记录基线；mode="status": 输出流水线状态视图所需元数据。
BEGIN {
    if (files_list != "") {
        while ((status = getline f < files_list) > 0)
            if (f != "") ARGV[ARGC++] = f
        close(files_list)
        if (status < 0) { broken = 1; exit 2 }
        if (ARGC <= 1) { empty_run = 1; exit 0 }
    }
}

function reset_file_state() {
    delete original
    delete hidden
    delete boundary
    delete after
    delete prose
    delete list_columns
    file_lines = 0
    fence_char = ""; fence_size = 0
    fence_outer_quotes = 0; fence_inner_quotes = 0; fence_indent = 0
    open_paragraph = 0; previous_quotes = 0; list_depth = 0
    paragraph = ""
    removed_quotes = 0; container_ok = 0
}

function run_size(s, pos, ch,    n) {
    n = 0
    while (substr(s, pos + n, 1) == ch) n++
    return n
}

function code_end(s, pos, size,    j, n) {
    for (j = pos + size; j <= length(s); j++) {
        if (substr(s, j, 1) != "`") continue
        n = run_size(s, j, "`")
        if (n == size) return j + n - 1
        j += n - 1
    }
    return 0
}

function target_end(s, pos,    j, ch, depth, quote, had_space) {
    j = pos + 1
    while (substr(s, j, 1) ~ /[ \t\n]/ && j <= length(s)) j++
    if (substr(s, j, 1) == "<") {
        for (j++; j <= length(s); j++) {
            ch = substr(s, j, 1)
            if (ch == "\\") { j++; continue }
            if (ch == "<" || ch == "\n") return 0
            if (ch == ">") break
        }
        if (j > length(s)) return 0
        j++
    } else {
        depth = 0
        for (; j <= length(s); j++) {
            ch = substr(s, j, 1)
            if (ch == "\\") { j++; continue }
            if (ch ~ /[ \t\n]/ || (ch == ")" && depth == 0)) break
            if (ch == "<") return 0
            if (ch == "(") depth++
            if (ch == ")") depth--
        }
        if (depth != 0) return 0
    }
    had_space = 0
    while (substr(s, j, 1) ~ /[ \t\n]/ && j <= length(s)) { j++; had_space = 1 }
    if (substr(s, j, 1) == ")") return j
    # 目标后的文字只有成对的标题分隔符才属于链接，普通正文不能被吞掉。
    quote = substr(s, j, 1)
    if (!had_space || (quote != "\"" && quote != "\047" && quote != "(")) return 0
    if (quote == "(") quote = ")"
    for (j++; j <= length(s); j++) {
        ch = substr(s, j, 1)
        if (ch == "\\") { j++; continue }
        if (quote == ")" && ch == "(") return 0
        if (ch == quote) break
    }
    if (j > length(s)) return 0
    for (j++; j <= length(s) && substr(s, j, 1) ~ /[ \t\n]/; j++) {}
    return substr(s, j, 1) == ")" ? j : 0
}

function extract_destination(raw,    j, start, ch) {
    j = 1
    while (j <= length(raw) && substr(raw, j, 1) ~ /[ \t\n]/) j++
    if (substr(raw, j, 1) == "<") {
        start = j + 1
        for (j = start; j <= length(raw); j++) {
            ch = substr(raw, j, 1)
            if (ch == "\\") { j++; continue }
            if (ch == ">") break
        }
        return substr(raw, start, j - start)
    }
    raw = substr(raw, j)
    for (j = 1; j <= length(raw); j++) {
        ch = substr(raw, j, 1)
        if (ch == "\\") { j++; continue }
        if (ch ~ /[ \t\n]/) break
    }
    return substr(raw, 1, j - 1)
}

function inline_text(s,    i, ch, n, end, depth, dest) {
    if (index(s, "[") == 0) return
    depth = 0
    for (i = 1; i <= length(s); i++) {
        ch = substr(s, i, 1)
        if (ch == "\\") { i++; continue }
        if (ch == "`") {
            n = run_size(s, i, ch); end = code_end(s, i, n)
            if (end) { i = end; continue }
            i += n - 1; continue
        }
        if (ch == "[") { depth++; continue }
        if (ch == "]" && depth > 0) {
            depth--; end = 0
            if (substr(s, i + 1, 1) == "(") {
                end = target_end(s, i + 1)
                if (end) {
                    dest = extract_destination(substr(s, i + 2, end - i - 2))
                    if (dest != "") print cur_file "\t" dest
                }
            }
            if (end) i = end
        }
    }
}

function scan_paragraph() {
    if (paragraph != "" && index(paragraph, "](") > 0) inline_text(paragraph)
    paragraph = ""
}

# 只展开行首制表符；相对缩进以四列制表位计算。
function expand_indent(s,    i, col, ch, prefix) {
    if (substr(s, 1, 1) != " " && substr(s, 1, 1) != "\t") return s
    if (index(s, "\t") == 0) return s
    col = 0
    for (i = 1; i <= length(s); i++) {
        ch = substr(s, i, 1)
        if (ch == " ") col++
        else if (ch == "\t") col += 4 - col % 4
        else break
    }
    prefix = ""
    while (length(prefix) < col) prefix = prefix " "
    return prefix substr(s, i)
}

# 围栏所在容器按外层引用 → 列表缩进 → 内层引用拆开，保留交错顺序。
function strip_quotes(s, limit) {
    removed_quotes = 0
    while (removed_quotes < limit && sub(/^ ? ? ?>[ \t]?/, "", s)) {
        removed_quotes++; s = expand_indent(s)
    }
    return s
}

function container_text(s, outer, columns, inner,    indent) {
    sub(/\r$/, "", s)
    s = strip_quotes(expand_indent(s), outer)
    container_ok = removed_quotes == outer
    match(s, /^ */); indent = RLENGTH
    if (s !~ /^ *$/ && indent < columns) container_ok = 0
    s = substr(s, columns + 1)
    s = strip_quotes(s, inner)
    if (removed_quotes != inner) container_ok = 0
    return s
}

function prepare_line(line,    text, quotes, outer_quotes, inner_quotes, indent, base, prefix, marker, padding, fence, ch, n, rest, compact, heading) {
    if (hidden[line]) return
    if (fence_char != "") {
        fence = container_text(original[line], fence_outer_quotes, fence_indent, fence_inner_quotes)
        if (container_ok) {
            sub(/^ ? ? ?/, "", fence)
            n = run_size(fence, 1, fence_char)
            rest = substr(fence, n + 1)
            if (n >= fence_size && rest ~ /^[ \t]*$/) fence_char = ""
            hidden[line] = 1; open_paragraph = 0; return
        }
        fence_char = ""
    }
    text = original[line]
    sub(/\r$/, "", text)
    # 引用与列表里的围栏也属于代码块；普通引用正文仍扫描。
    quotes = 0
    text = expand_indent(text)
    while (sub(/^ ? ? ?>[ \t]?/, "", text)) {
        quotes++; text = expand_indent(text)
    }
    outer_quotes = quotes
    match(text, /^ */); indent = RLENGTH
    if (quotes != previous_quotes) {
        boundary[line] = 1; open_paragraph = 0; list_depth = 0
    }
    previous_quotes = quotes
    if (text ~ /^ *$/) { hidden[line] = 1; open_paragraph = 0; return }
    while (list_depth > 0 && indent < list_columns[list_depth]) list_depth--
    base = list_depth > 0 ? list_columns[list_depth] : 0
    text = substr(text, base + 1)
    # 扣除列表容器的缩进，再判断代码缩进；新的列表项先结束前一段。
    if (match(text, /^ ? ? ?([-+*]|[0-9]+[.)]) +/)) {
        prefix = substr(text, 1, RLENGTH)
        match(prefix, /^ */); indent = RLENGTH
        rest = substr(prefix, indent + 1)
        match(rest, /^([-+*]|[0-9]+[.)])/); marker = RLENGTH
        padding = length(rest) - marker
        if (padding > 4) padding = 1
        n = indent + marker + padding
        list_columns[++list_depth] = base + n
        text = substr(text, n + 1)
        boundary[line] = 1; open_paragraph = 0
    }
    inner_quotes = 0
    while (sub(/^ ? ? ?>[ \t]?/, "", text)) {
        inner_quotes++; text = expand_indent(text)
    }
    quotes += inner_quotes
    previous_quotes = quotes
    fence = text; sub(/^ ? ? ?/, "", fence)
    ch = substr(fence, 1, 1)
    n = (ch == "`" || ch == "~") ? run_size(fence, 1, ch) : 0
    if (n >= 3 && (ch != "`" || index(substr(fence, n + 1), "`") == 0)) {
        fence_char = ch; fence_size = n
        fence_outer_quotes = outer_quotes; fence_inner_quotes = inner_quotes
        fence_indent = list_depth > 0 ? list_columns[list_depth] : 0
        hidden[line] = 1; open_paragraph = 0; return
    }
    if (text ~ /^    / && !open_paragraph) {
        hidden[line] = 1; open_paragraph = 0; return
    }
    # 标题与分隔线都是块边界，行内代码不能跨这些块配对。
    heading = text ~ /^ ? ? ?##?#?#?#?#?([ \t]|$)/
    compact = text; gsub(/ /, "", compact)
    if (heading || compact ~ /^(\*\*\*+|___+|---+)$/) {
        boundary[line] = 1; after[line] = 1; open_paragraph = 0
    } else if (text ~ /^ ? ? ?(=+|-+)[ \t]*$/) {
        after[line] = 1; open_paragraph = 0
    } else open_paragraph = 1
    prose[line] = text
}

function process_current_file(    line) {
    for (line = 1; line <= file_lines; line++) prepare_line(line)
    if (mode != "") { scan_record(); return }
    for (line = 1; line <= file_lines; line++) {
        if (boundary[line] || hidden[line]) scan_paragraph()
        if (hidden[line]) continue
        if (paragraph != "") paragraph = paragraph "\n"
        paragraph = paragraph prose[line]
        if (after[line]) scan_paragraph()
    }
    scan_paragraph()
}

FNR == 1 {
    if (file_lines > 0) process_current_file()
    reset_file_state()
    cur_file = FILENAME
}
{ original[++file_lines] = $0 }
END {
    if (!broken && !empty_run && file_lines > 0) process_current_file()
    if (mode == "records" && !broken && !empty_run) {
        for (ref = 1; ref <= ref_count; ref++) check_record_ref(ref_file[ref], ref_item[ref])
        exit record_errors != 0
    }
    if (mode == "release" && !broken && !empty_run) exit record_errors != 0
    if (mode == "status" && !broken && !empty_run) {
        if (record_errors != 0) exit 2
        exit 0
    }
}

function record_error(file, message) {
    record_errors++
    if (mode == "records") print file ": " message
    else if (mode == "status") print file ": " message > "/dev/stderr"
}

function trim(s) {
    sub(/^[ \t]+/, "", s)
    sub(/[ \t]+$/, "", s)
    return s
}

function clean_tsv(s) {
    gsub(/[\t\r\n]/, " ", s)
    return trim(s)
}

# GFM tables may escape a pipe within a cell.
function record_table_fields(line, fields,    i, char, cell, count) {
    line = trim(line)
    for (i = 2; i <= length(line); i++) {
        char = substr(line, i, 1)
        if (char == "\\" && substr(line, i+1, 1) ~ /^[|\\]$/) {
            cell = cell substr(line, ++i, 1)
        } else if (char == "|") {
            fields[++count] = trim(cell); cell = ""
        } else cell = cell char
    }
    if (substr(line, length(line), 1) != "|" || cell != "") fields[++count] = trim(cell)
    return count
}

function table_separator(fields, count,    i) {
    for (i = 1; i <= count; i++) if (fields[i] !~ /^:?---+:?$/) return 0
    return 1
}

function emit_status_record(kind, file, name, norm_state, scope_out, baseline_out, fail_cnt, unverified_cnt, loc_out) {
    if (scope_out == "") scope_out = "-"
    if (baseline_out == "") baseline_out = "-"
    loc_out = clean_tsv(loc_out)
    if (loc_out == "") loc_out = "-"
    print "REC\t" kind "\t" file "\t" name "\t" norm_state "\t" scope_out "\t" baseline_out "\t" (fail_cnt + 0) "\t" (unverified_cnt + 0) "\t" loc_out
}

function scan_record(    file, kind, name, state, location, scope, baseline, candidate, confirmations, modern, legacy, header, i, line, heading, pending, section, marker, seen, row, question, fields, count, verdict, table, table_columns, judgments, failed, fail_cnt, unverified_cnt, before, upstream, html_comment, shape_error, legacy_state, legacy_location, legacy_final, legacy_upstream, legacy_refs, norm_state, loc_val, wo_rows, wo_n, q_list, q_n, q_seen, dnum, in_leg_wo, unv_rows) {
    file = cur_file; sub(/^\.\//, "", file)
    if (mode == "release") file = "record/verify/input.md"
    name = file; sub(/^.*\//, "", name); sub(/\.md$/, "", name)
    kind = file; sub(/\/[^\/]+$/, "", kind); sub(/^.*\//, "", kind)
    record_file[file] = 1
    if (kind == "discuss" && name ~ /^[0-9][0-9][0-9][0-9]-/ && !(substr(name, 1, 4) in discussions))
        discussions[substr(name, 1, 4)] = file

    header = 1; before = record_errors
    fail_cnt = 0; unverified_cnt = 0; wo_n = 0; q_n = 0
    for (i = 1; i <= file_lines; i++) {
        line = original[i]; sub(/\r$/, "", line)
        # Keep the legacy matching boundaries used by historical records.
        if (legacy_state == "" && line ~ /^> 状态/) legacy_state = line
        if (line ~ /^> 位置：/) legacy_location = line
        if (line ~ /^## /) legacy_upstream = (line ~ /^## 上游[ \t]*$/)
        if (line ~ /^## ((一|二|三|四|五|六|七|八|九|十)+、)?核销/ &&
            line !~ /^## ((一|二|三|四|五|六|七|八|九|十)+、)?核销表/) legacy_final = 1
        if (legacy_upstream && line ~ /^- /) legacy_refs[++legacy_refs[0]] = substr(line, 3)

        if (hidden[i]) {
            pending = ""
            if (table > 0) table = 3
            continue
        }
        heading = line
        sub(/^ ? ? ?/, "", heading)
        if (html_comment) {
            if (heading ~ /-->/) html_comment = 0
            continue
        }
        if (heading ~ /^<!--/ && heading !~ /-->/) {
            html_comment = 1; pending = ""
            continue
        }
        if (header && line ~ /^> (status|location|confirmation|baseline|scope):/) {
            modern = 1
            if (line ~ /^> status:/) {
                if (state != "") record_error(file, "Duplicate status field")
                state = line
            } else if (line ~ /^> location:/) {
                if (location != "") record_error(file, "Duplicate location field")
                location = line
            } else if (line ~ /^> scope:/) {
                if (scope != "") record_error(file, "Duplicate scope field")
                scope = line
            } else if (line ~ /^> baseline:/) {
                if (baseline != "") record_error(file, "Duplicate baseline field")
                baseline = line
            } else if (line ~ /^> confirmation: [^ \t]/) confirmations++
            else record_error(file, "Empty confirmation field")
            continue
        }
        if (header && line ~ /^> (状态|位置|确认)：/) legacy = 1
        if (line ~ /^>/) { pending = ""; if (table > 0) table = 3; continue }
        if (header && !state && !location && heading ~ /^# /) continue
        header = 0

        if (heading ~ /^##?([ \t]|$)/ || (i < file_lines && !hidden[i+1] &&
            line !~ /^[ \t]/ && original[i+1] ~ /^ ? ? ?(=+|-+)[ \t]*$/)) {
            section = ""; table = 0
        }
        if (pending && heading ~ /^<!-- (upstream|write-off-plan|write-off|acceptance-judgments) -->[ \t]*$/) {
            marker = heading
            sub(/^<!-- /, "", marker); sub(/ -->[ \t]*$/, "", marker)
            if (seen[marker]++) shape_error = "Duplicate section marker: " marker
            section = marker
            pending = ""
            continue
        }
        pending = (heading ~ /^##[ \t]/)
        if (kind == "discuss") {
            question = heading
            sub(/^###?#?#?#?[ \t]+/, "", question)
            sub(/^([-+*][ \t]+)?\*\*/, "", question)
            if ((question != heading) && match(question, /^Q[0-9]+([^A-Za-z0-9_]|$)/)) {
                question = substr(question, 1, RLENGTH)
                sub(/[^0-9]$/, "", question)
                record_question[file, question] = 1
                if (!q_seen[question]++) q_list[++q_n] = question
            }
        }
        if (section == "upstream" && line ~ /^- [^ \t]/) upstream[++upstream[0]] = substr(line, 3)
        if (heading ~ /^\|/ && (section == "write-off" || section == "write-off-plan" || section == "acceptance-judgments")) {
            count = record_table_fields(heading, fields)
            row = fields[1]; verdict = fields[3]
            if (table == 0 && count >= 2 && row != "" && row !~ /^[0-9]+$/) {
                table = 1; table_columns = count
            } else if (table == 1 && count == table_columns && table_separator(fields, count)) {
                table = 2
            } else if (table == 2 && count == table_columns && row ~ /^[0-9]+$/ && fields[2] != "") {
                if (section != "acceptance-judgments") {
                    record_row[file, row] = 1
                    if (section == "write-off") wo_rows[++wo_n] = row
                } else if (count < 3 || verdict !~ /^(pass|fail|unverified)$/ || record_row[file, row]++)
                    shape_error = "Malformed acceptance judgment row"
                else {
                    judgments++
                    if (verdict == "fail") { failed = 1; fail_cnt++ }
                    else if (verdict == "unverified") {
                        unverified_cnt++
                        unv_rows[++unv_rows[0]] = row "\t" fields[2]
                        gsub(/\t/, " ", unv_rows[unv_rows[0]]); sub(/ /, "\t", unv_rows[unv_rows[0]])
                    }
                }
            } else if (section == "acceptance-judgments") shape_error = "Malformed acceptance judgment table"
        } else if (table > 0) table = 3
    }

    if (!modern) {
        if (mode == "release") {
            if (legacy_state !~ /^> 状态：\*\*✅ 已完成/) return
            for (i = 1; i <= file_lines; i++) {
                if (original[i] ~ /^\|[^|]*\|[^|]*\| *未通过 *\|/) return
                if (baseline == "" && match(original[i], /^> 位置：.*基线 `[0-9a-f]+`/)) {
                    candidate = substr(original[i], 1, RLENGTH-1)
                    sub(/^.*`/, "", candidate)
                    if (length(candidate) >= 7 && length(candidate) <= 40) baseline = candidate
                }
            }
            if (baseline != "") print baseline
            return
        }
        if (mode == "status") {
            norm_state = "invalid"
            if (legacy_state ~ /^> 状态：\*\*✅ 已完成/) norm_state = "completed"
            else if (legacy_state ~ /^> 状态：\*\*⛔ 已中止/) norm_state = "aborted"
            else if (legacy_state ~ /^> 状态：\*\*待落盘/) norm_state = "pending-write-off"
            else if (legacy_state ~ /^> 状态：\*\*(进行中|讨论中)/) norm_state = "in-progress"
            if (norm_state == "invalid") {
                record_error(file, "Invalid legacy record status")
                return
            }
            if (kind == "verify") {
                for (i = 1; i <= file_lines; i++) {
                    if (original[i] ~ /^\|[^|]*\|[^|]*\| *未通过 *\|/) fail_cnt++
                    if (original[i] ~ /^\|[^|]*\|[^|]*\| *未验证 *\|/) unverified_cnt++
                    if (baseline == "" && match(original[i], /^> 位置：.*基线 `[0-9a-f]+`/)) {
                        candidate = substr(original[i], 1, RLENGTH-1)
                        sub(/^.*`/, "", candidate)
                        if (length(candidate) >= 7 && length(candidate) <= 40) baseline = candidate
                    }
                }
            }
            loc_val = legacy_location; sub(/^> 位置：/, "", loc_val)
            emit_status_record(kind, file, name, norm_state, (kind == "verify" ? "legacy" : "-"), (kind == "verify" ? baseline : "-"), fail_cnt, unverified_cnt, loc_val)
            if (kind == "discuss" && norm_state == "completed" && name ~ /^[0-9][0-9][0-9][0-9]-/) {
                dnum = substr(name, 1, 4)
                in_leg_wo = 0
                for (i = 1; i <= file_lines; i++) {
                    line = original[i]; sub(/\r$/, "", line)
                    if (line ~ /^## /) {
                        in_leg_wo = (line ~ /^## ((一|二|三|四|五|六|七|八|九|十)+、)?核销/ && line !~ /^## ((一|二|三|四|五|六|七|八|九|十)+、)?核销表/)
                        continue
                    }
                    if (in_leg_wo && line ~ /^\| *[0-9]+ *\|/) {
                        row = line; sub(/^\| */, "", row); sub(/ *\|.*$/, "", row)
                        wo_rows[++wo_n] = row
                    }
                }
                if (wo_n > 0) {
                    for (i = 1; i <= wo_n; i++) print "DROW\t" dnum "\t#" wo_rows[i]
                } else if (q_n > 0) {
                    for (i = 1; i <= q_n; i++) print "DROW\t" dnum "\t" q_list[i]
                }
            } else {
                for (i = 1; i <= legacy_refs[0]; i++) print "UP\t" kind "\t" name "\t" clean_tsv(legacy_refs[i])
            }
            return
        }
        legacy = (kind == "discuss" ? "讨论中|待落盘" : "进行中")
        if (legacy_state !~ ("^> 状态：\\*\\*(" legacy "|✅ 已完成|⛔ 已中止)")) record_error(file, "Invalid legacy record status")
        if (legacy_final && kind == "discuss" && legacy_state !~ /^> 状态：\*\*(✅ 已完成|⛔ 已中止)/)
            record_error(file, "A final write-off requires completed or aborted status")
        if (kind != "discuss") {
            if (legacy_location == "") record_error(file, "Missing legacy location field")
            if (!legacy_refs[0]) record_error(file, "Missing legacy upstream entries")
            for (i = 1; i <= legacy_refs[0]; i++) {
                ref_file[++ref_count] = file; ref_item[ref_count] = legacy_refs[i]
            }
        }
        return
    }
    modern_record[file] = 1
    if (shape_error != "") record_error(file, shape_error)
    if (legacy || legacy_state != "" && state == "") record_error(file, "Mixed record metadata formats")
    sub(/^> status: /, "", state)
    sub(/^> location: /, "", location)
    sub(/^> baseline: /, "", baseline)
    if (state !~ /^(in-progress|completed|aborted|pending-write-off) \([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\)[ \t]*$/ ||
        (state ~ /^pending-write-off / && kind != "discuss")) record_error(file, "Invalid record status")
    if (trim(location) == "" || location ~ /^> location:/) record_error(file, "Missing or empty location field")
    if (kind == "discuss") {
        if (seen["write-off"] && state !~ /^(completed|aborted) /)
            record_error(file, "A final write-off requires completed or aborted status")
        if (state ~ /^completed / && ((seen["write-off"] && !confirmations) || seen["write-off-plan"]))
            record_error(file, "A completed discussion requires confirmation and a finished write-off")
    } else if (!upstream[0]) record_error(file, "Missing marked upstream entries")
    if (scope != "") {
        if (kind != "verify") record_error(file, "Scope field is only allowed on verify records")
        else {
            if (!sub(/^> scope: /, "", scope)) scope = ""
            scope = trim(scope)
            if (scope != "feature" && scope != "integration") record_error(file, "Invalid acceptance scope")
        }
    }
    if (kind == "verify") {
        if (baseline !~ /^[0-9a-f]+$/ || length(baseline) < 7 || length(baseline) > 64) record_error(file, "Missing or malformed acceptance baseline")
        if (state ~ /^completed / && !judgments) record_error(file, "Missing numbered acceptance judgments")
    }
    if (mode == "release") {
        if (before == record_errors && state ~ /^completed / && !failed && scope != "feature") print baseline
    } else if (mode == "status") {
        if (before != record_errors) return
        norm_state = state; sub(/[ \t].*$/, "", norm_state)
        emit_status_record(kind, file, name, norm_state, (kind == "verify" ? (scope != "" ? scope : "legacy") : "-"), (kind == "verify" ? baseline : "-"), fail_cnt, unverified_cnt, location)
        if (kind == "verify") for (i = 1; i <= unv_rows[0]; i++) print "UNV\t" name "\t" unv_rows[i]
        if (kind == "discuss" && norm_state == "completed" && name ~ /^[0-9][0-9][0-9][0-9]-/) {
            dnum = substr(name, 1, 4)
            if (wo_n > 0) {
                for (i = 1; i <= wo_n; i++) print "DROW\t" dnum "\t#" wo_rows[i]
            } else if (q_n > 0) {
                for (i = 1; i <= q_n; i++) print "DROW\t" dnum "\t" q_list[i]
            }
        } else {
            for (i = 1; i <= upstream[0]; i++) print "UP\t" kind "\t" name "\t" clean_tsv(upstream[i])
        }
    } else {
        for (i = 1; i <= upstream[0]; i++) {
            ref_file[++ref_count] = file; ref_item[ref_count] = upstream[i]
        }
    }
}

function record_entry(file, id, question,    line, found) {
    if (modern_record[file]) return question ? record_question[file, id] : record_row[file, id]
    # Legacy references retain their historical matching rules.
    while ((getline line < file) > 0) {
        if (question ? line ~ (id "([^0-9]|$)") : line ~ ("^\\| *" id " *\\|")) {
            found = 1
            break
        }
    }
    close(file)
    return found
}

function check_record_ref(file, item,    kind, words, name, id, target, outcome) {
    kind = file; sub(/\/[^\/]+$/, "", kind); sub(/^.*\//, "", kind)
    gsub(/`/, "", item)
    item = trim(item)
    split(item, words, /[ \t]+/)
    name = words[1]; id = words[2]
    if (kind == "implement" && (item ~ /^cutover: [0-9][0-9][0-9][0-9]$/ || item ~ /^切换点：[0-9][0-9][0-9][0-9]$/)) {
        name = substr(item, length(item) - 3)
        if (!(name in discussions)) record_error(file, "Cutover discussion does not exist: " name)
        return
    }
    if (kind == "implement" && item ~ /^maintenance:/) {
        if (item !~ /^maintenance:[ \t]*[^ \t]/) record_error(file, "Maintenance upstream entry needs a basis: " item)
        return
    }
    if (kind == "implement" && name ~ /^[0-9][0-9][0-9][0-9]$/) {
        target = discussions[name]
        if (target == "") record_error(file, "Upstream discussion does not exist: " name)
        else if (id ~ /^#[0-9]+$/) {
            if (!record_entry(target, substr(id, 2), 0)) record_error(file, "Discussion " name " has no design row " id)
        } else if (id ~ /^Q[0-9]+$/) {
            if (!record_entry(target, id, 1)) record_error(file, "Discussion " name " has no question " id)
        } else record_error(file, "Discussion reference requires a design row #k or question Qn: " item)
        if (modern_record[file]) {
            outcome = item; sub(/^[^ \t]+[ \t]+[^ \t]+[ \t]+/, "", outcome)
            if (outcome !~ /^(implemented|no-implementation)([ \t]|$)/ &&
                outcome !~ /^not-implemented[ \t]+[^ \t]/) record_error(file, "Invalid implementation outcome: " item)
        }
        return
    }
    if (kind == "release" || kind == "deliver" || (kind == "implement" && id ~ /^#[0-9]+$/))
        target = "record/verify/" name ".md"
    else target = "record/implement/" name ".md"
    if (!(target in record_file)) record_error(file, "Upstream record does not exist: " name " (expected " target ")")
    else if (kind == "implement" && id ~ /^#[0-9]+$/ && !record_entry(target, substr(id, 2), 0))
        record_error(file, "Acceptance record " name " has no judgment " id)
}
