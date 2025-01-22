function linesplit(t, n = !1, i = 50, e = "─", l = "├", p = "┤") { let r = Math.max(i, 10); r -= l.length + p.length; let o = e.repeat(r), f = l + o + p; n ? t.tprint(f) : t.print(f) }
function linesplitTop(t, n = !1, i = 50, e = "─", l = "┌", p = "┐") { linesplit(t, n, i, e, l, p) }
function linesplitBottom(t, n = !1, i = 50, e = "─", l = "└", p = "┘") { linesplit(t, n, i, e, l, p) }
function cprint(t, n, i = !1, e = 50, l = "│", p = "│") { let r = Math.max(e, 50); r -= l.length + p.length; let o = ""; for (let f of n) { if (o.length + 1 > r) { let $ = o.padEnd(r, " "), c = l + $ + p; i ? t.tprint(c) : t.print(c), o = "" } o += f } if (o.length > 0) { let x = o.padEnd(r, " "), g = l + x + p; i ? t.tprint(g) : t.print(g) } }
function tcprint(t, n, i = 50) { cprint(t, n, !0, i) }