/** @param {NS} ns */
export async function main(ns) {
    let targetServer = ns.args[0]

    if (ns.args.length < 1) {
        linesplitTop(ns, true)
        tcprint(ns, `Usage: run hack.js [server]`)
        linesplitBottom(ns, true)
        return
    }

    let securityLevelMin
    let currentSecurityLevel
    let serverMaxMoney
    let serverMoneyAvailable

    while (true) {
        securityLevelMin = ns.getServerMinSecurityLevel(targetServer) // Get the Min Security Level
        currentSecurityLevel = ns.getServerSecurityLevel(targetServer) // Get max money for server

        linesplitMiddle(ns)
        cprint(ns, "Starting attack on " + targetServer + " with " + ns.getHostname() + "...")

        while (currentSecurityLevel > securityLevelMin + 5) {
            linesplitMiddle(ns)
            cprint(ns, targetServer + " min security level is " + securityLevelMin)
            cprint(ns, "Current security level on " + targetServer + " is " + ns.formatNumber(currentSecurityLevel, "0.00") + ".")
            cprint(ns, "Weakening " + targetServer + " with " + ns.getHostname() + "...")

            await ns.weaken(targetServer)
            currentSecurityLevel = ns.getServerSecurityLevel(targetServer)
        }

        linesplitMiddle(ns)
        serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
        serverMaxMoney = ns.getServerMaxMoney(targetServer)

        cprint(ns, "Minimum security level on " + targetServer + " reached !!!")

        while (serverMoneyAvailable < (serverMaxMoney * 0.75)) {
            linesplitMiddle(ns)
            cprint(ns, "" + targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, 3))
            cprint(ns, "" + targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, 3))
            cprint(ns, "Growing " + targetServer + " with " + ns.getHostname() + " to " + ns.formatNumber(serverMaxMoney * 0.75, 3) + "...")

            await ns.grow(targetServer)
            serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
            serverMaxMoney = ns.getServerMaxMoney(targetServer)
        }

        linesplitMiddle(ns)
        cprint(ns, "Optimal current money on " + targetServer + " reached !!!")
        cprint(ns, targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, 3))
        cprint(ns, targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, 3))
        linesplitMiddle(ns)
        cprint(ns, "Hacking " + targetServer + " with " + ns.getHostname() + "...")

        await ns.hack(targetServer)
    }
}
function linesplitMiddle(t, n = !1, i = 50, e = "─", l = "├", p = "┤") { let r = Math.max(i, 10); r -= l.length + p.length; let o = e.repeat(r), f = l + o + p; n ? t.tprint(f) : t.print(f) }
function linesplitTop(t, n = !1, i = 50, e = "─", l = "┌", p = "┐") { linesplitMiddle(t, n, i, e, l, p) }
function linesplitBottom(t, n = !1, i = 50, e = "─", l = "└", p = "┘") { linesplitMiddle(t, n, i, e, l, p) }
function cprint(t, n, i = !1, e = 50, l = "│", p = "│") { let r = Math.max(e, 50); r -= l.length + p.length; let o = ""; for (let f of n) { if (o.length + 1 > r) { let $ = o.padEnd(r, " "), c = l + $ + p; i ? t.tprint(c) : t.print(c), o = "" } o += f } if (o.length > 0) { let x = o.padEnd(r, " "), g = l + x + p; i ? t.tprint(g) : t.print(g) } }
function tcprint(t, n, i = 50) { cprint(t, n, !0, i) }