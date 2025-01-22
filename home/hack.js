import {
    cprint,
    linesplit,
    linesplitTop
} from "./utils/customprint.js"

/** @param {NS} ns */
export async function main(ns) {
    let targetServer = ns.args[0]

    if (ns.args.length < 1) {
        throw new Error(`Missing targetServer`)
    }

    let securityLevelMin
    let currentSecurityLevel
    let serverMaxMoney
    let serverMoneyAvailable

    linesplitTop(ns)
    while (true) {
        securityLevelMin = ns.getServerMinSecurityLevel(targetServer) // Get the Min Security Level
        currentSecurityLevel = ns.getServerSecurityLevel(targetServer) // Get max money for server

        cprint(ns, "Starting attack on " + targetServer + " with " + ns.getHostname() + "...")

        while (currentSecurityLevel > securityLevelMin + 5) {
            linesplit(ns)
            cprint(ns, targetServer + " min security level is " + securityLevelMin)
            cprint(ns, "Current security level on " + targetServer + " is " + ns.formatNumber(currentSecurityLevel, "0.00") + ".")
            cprint(ns, "Weakening " + targetServer + " with " + ns.getHostname() + "...")

            await ns.weaken(targetServer)
            currentSecurityLevel = ns.getServerSecurityLevel(targetServer)
        }

        linesplit(ns)
        serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
        serverMaxMoney = ns.getServerMaxMoney(targetServer)

        cprint(ns, "Minimum security level on " + targetServer + " reached !!!")

        while (serverMoneyAvailable < (serverMaxMoney * 0.75)) {
            linesplit(ns)
            cprint(ns, targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, "$0.000a"))
            cprint(ns, targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, "$0.000a"))
            cprint(ns, "Growing " + targetServer + " with " + ns.getHostname() + " to " + ns.formatNumber(serverMaxMoney * 0.75, "$0.000a") + "...")

            await ns.grow(targetServer)
            serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
            serverMaxMoney = ns.getServerMaxMoney(targetServer)
        }

        linesplit(ns)
        cprint(ns, "Optimal current money on " + targetServer + " reached !!!")
        cprint(ns, targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, "$0.000a"))
        cprint(ns, targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, "$0.000a"))
        linesplit(ns)
        cprint(ns, "Hacking " + targetServer + " with " + ns.getHostname() + "...")
        linesplit(ns)

        await ns.hack(targetServer)
        serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
        serverMaxMoney = ns.getServerMaxMoney(targetServer)
    }
}