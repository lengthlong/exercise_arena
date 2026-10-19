# 术语扫描：保留说明文字，保护 Markdown 的机器字面量；输出原文件与行号。
# 每次读取一个文件。块边界先处理，再按段落处理可跨行的行内代码与链接。
BEGIN {
    while ((status = getline term < terms_file) > 0)
        if (term != "") terms[++term_count] = term
    close(terms_file)
    if (status < 0) { broken = 1; exit 2 }
}

function run_size(s, pos, ch,    n) {
    n = 0
    while (substr(s, pos + n, 1) == ch) n++
    return n
}

# 保护区用空格替换，避免两侧的正文拼成一个不存在的词；换行保持不变。
function mask(s,    i, out) {
    out = ""
    for (i = 1; i <= length(s); i++)
        out = out (substr(s, i, 1) == "\n" ? "\n" : " ")
    return out
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

function reference_key(s) {
    gsub(/^[ \t\n]+|[ \t\n]+$/, "", s)
    gsub(/[ \t\n]+/, " ", s)
    return tolower(s)
}

function inline_text(s,    i, j, ch, n, end, depth, out, tail, label_start, label) {
    out = ""; depth = 0
    for (i = 1; i <= length(s); i++) {
        ch = substr(s, i, 1)
        if (ch == "\\") {
            out = out substr(s, i, 2); i++; continue
        }
        if (ch == "`") {
            n = run_size(s, i, ch); end = code_end(s, i, n)
            if (end) {
                out = out mask(substr(s, i, end - i + 1)); i = end; continue
            }
            out = out substr(s, i, n); i += n - 1; continue
        }
        if (ch == "[") { depth++; label_start[depth] = i + 1 }
        if (ch == "]" && depth > 0) {
            label = substr(s, label_start[depth], i - label_start[depth])
            depth--; end = 0
            if (substr(s, i + 1, 1) == "(") end = target_end(s, i + 1)
            if (substr(s, i + 1, 1) == "[") {
                for (j = i + 2; j <= length(s); j++) {
                    if (substr(s, j, 1) == "\n") break
                    if (substr(s, j, 1) == "\\") { j++; continue }
                    if (substr(s, j, 1) == "]") {
                        tail = substr(s, i + 2, j - i - 2)
                        if (tail == "") tail = label
                        if (reference_key(tail) in references) end = j
                        break
                    }
                }
            }
            if (end) {
                out = out ch mask(substr(s, i + 1, end - i)); i = end; continue
            }
        }
        tail = substr(s, i)
        if (match(tail, /^[A-Za-z][A-Za-z0-9+.-]*:\/\/[^[:space:]<>]+/) ||
            match(tail, /^mailto:[^[:space:]<>]+/) ||
            match(tail, /^<[^[:space:]<>]+@[^[:space:]<>]+>/)) {
            n = RLENGTH; out = out mask(substr(s, i, n)); i += n - 1; continue
        }
        out = out ch
    }
    return out
}

function exempt(s,    start, tail, end, reason, slashes, j) {
    while ((start = index(s, "<!-- design-terms-ignore:")) > 0) {
        slashes = 0
        for (j = start - 1; j > 0 && substr(s, j, 1) == "\\"; j--) slashes++
        tail = substr(s, start + length("<!-- design-terms-ignore:"))
        end = index(tail, "-->")
        if (!end) return 0
        reason = substr(tail, 1, end - 1)
        gsub(/^[ \t]+|[ \t]+$/, "", reason)
        if (reason != "" && slashes % 2 == 0) return 1
        s = substr(tail, end + 3)
    }
    return 0
}

function scan_paragraph(    parts, count, i, t, line) {
    if (paragraph == "") return
    count = split(inline_text(paragraph), parts, "\n")
    for (i = 1; i <= count; i++) {
        line = paragraph_start + i - 1
        if (exempt(parts[i])) continue
        for (t = 1; t <= term_count; t++) {
            if (index(parts[i], terms[t])) {
                print FILENAME ":" line ":" original[line]
                break
            }
        }
    }
    paragraph = ""
}

# 只展开行首制表符；相对缩进以四列制表位计算。
function expand_indent(s,    i, col, ch, prefix) {
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
    while (removed_quotes < limit && sub(/^ {0,3}>[ \t]?/, "", s)) {
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

function prepare_line(line,    text, quotes, outer_quotes, inner_quotes, indent, base, prefix, marker, padding, fence, ch, n, rest, compact, heading, definition, label, destination, continuation) {
    if (hidden[line]) return
    if (fence_char != "") {
        fence = container_text(original[line], fence_outer_quotes, fence_indent, fence_inner_quotes)
        if (container_ok) {
            sub(/^ {0,3}/, "", fence)
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
    while (sub(/^ {0,3}>[ \t]?/, "", text)) {
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
    if (match(text, /^ {0,3}([-+*]|[0-9]+[.)]) +/)) {
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
    while (sub(/^ {0,3}>[ \t]?/, "", text)) {
        inner_quotes++; text = expand_indent(text)
    }
    quotes += inner_quotes
    previous_quotes = quotes
    fence = text; sub(/^ {0,3}/, "", fence)
    ch = substr(fence, 1, 1)
    n = (ch == "`" || ch == "~") ? run_size(fence, 1, ch) : 0
    if (n >= 3 && (ch != "`" || index(substr(fence, n + 1), "`") == 0)) {
        fence_char = ch; fence_size = n
        fence_outer_quotes = outer_quotes; fence_inner_quotes = inner_quotes
        fence_indent = list_depth > 0 ? list_columns[list_depth] : 0
        hidden[line] = 1; open_paragraph = 0; return
    }
    if ((text ~ /^    / && !open_paragraph) ||
        (FILENAME == context_file && original[line] ~ /^[ \t]*_Avoid_[ \t]*(:|：)/)) {
        hidden[line] = 1; open_paragraph = 0; return
    }
    # 先收集有效定义，第二遍才处理行内引用，因此支持先引用、后定义。
    if (!open_paragraph && match(text, /^ {0,3}\[[^]]+\]:/)) {
        definition = substr(text, 1, RLENGTH)
        label = definition; sub(/^ *\[/, "", label); sub(/\]:$/, "", label)
        rest = substr(text, RLENGTH + 1)
        continuation = 0
        if (rest ~ /^[ \t]*$/ && line < NR) {
            base = list_depth > 0 ? list_columns[list_depth] : 0
            rest = container_text(original[line + 1], outer_quotes, base, inner_quotes)
            if (container_ok && rest !~ /^[ \t]*$/) continuation = 1
            else rest = ""
        }
        destination = "(" rest ")"
        if (target_end(destination, 1) == length(destination) && destination !~ /^\([ \t]*\)$/) {
            references[reference_key(label)] = 1
            if (continuation) hidden[line + 1] = 1
            hidden[line] = 1; return
        }
    }
    # 标题与分隔线都是块边界，行内代码不能跨这些块配对。
    heading = text ~ /^ {0,3}#{1,6}([ \t]|$)/
    compact = text; gsub(/ /, "", compact)
    if (heading || compact ~ /^(\*{3,}|_{3,}|-{3,})$/) {
        boundary[line] = 1; after[line] = 1; open_paragraph = 0
    } else if (text ~ /^ {0,3}(=+|-+)[ \t]*$/) {
        after[line] = 1; open_paragraph = 0
    } else open_paragraph = 1
    prose[line] = text
}

{ original[NR] = $0 }
END {
    if (!broken) {
        for (line = 1; line <= NR; line++) prepare_line(line)
        for (line = 1; line <= NR; line++) {
            if (boundary[line] || hidden[line]) scan_paragraph()
            if (hidden[line]) continue
            if (paragraph == "") paragraph_start = line
            else paragraph = paragraph "\n"
            paragraph = paragraph prose[line]
            if (after[line]) scan_paragraph()
        }
        scan_paragraph()
    }
}
