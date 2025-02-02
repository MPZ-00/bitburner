const maxLineLength = 50
function linesplitMiddle(t, n = false, i = maxLineLength, e = "─", l = "├", p = "┤") { let r = Math.max(i, maxLineLength); r -= l.length + p.length; let o = e.repeat(r), f = l + o + p; n ? t.tprint(f) : t.print(f) }
function linesplitTop(t, n = false, i = maxLineLength, e = "─", l = "┌", p = "┐") { linesplitMiddle(t, n, i, e, l, p) }
function linesplitBottom(t, n = false, i = maxLineLength, e = "─", l = "└", p = "┘") { linesplitMiddle(t, n, i, e, l, p) }
function cprint(t, n, i = false, e = maxLineLength, l = "│", p = "│") { let r = Math.max(e, maxLineLength); r -= l.length + p.length; let o = ""; for (let f of n) { if (o.length + 1 > r) { let $ = o.padEnd(r, " "), c = l + $ + p; i ? t.tprint(c) : t.print(c), o = "" } o += f } if (o.length > 0) { let x = o.padEnd(r, " "), g = l + x + p; i ? t.tprint(g) : t.print(g) } }
function tcprint(t, n, i = maxLineLength) { cprint(t, n, true, i) }