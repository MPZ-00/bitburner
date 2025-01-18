/** @param {NS} ns */
export async function main(ns) {
    let targetServer = ns.args[0]
    let securityLevelMin
    let currentSecurityLevel
    let serverMaxMoney
    let serverMoneyAvailable

    while (true) {
        securityLevelMin = ns.getServerMinSecurityLevel(targetServer) // Get the Min Security Level
        currentSecurityLevel = ns.getServerSecurityLevel(targetServer) // Get max money for server

        ns.print("---------------------------------------------------------------")
        ns.print("Starting attack on " + targetServer + " with " + ns.getHostname() + "...")

        while (currentSecurityLevel > securityLevelMin + 5) {
            ns.print("---------------------------------------------------------------")
            ns.print(targetServer + " min security level is " + securityLevelMin)
            ns.print("Current security level on " + targetServer + " is " + ns.formatNumber(currentSecurityLevel, "0.00") + ".")
            ns.print("Weakening " + targetServer + " with " + ns.getHostname() + "...")

            await ns.weaken(targetServer)
            currentSecurityLevel = ns.getServerSecurityLevel(targetServer)
        }

        ns.print("---------------------------------------------------------------")
        serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
        serverMaxMoney = ns.getServerMaxMoney(targetServer)

        ns.print("Minimum security level on " + targetServer + " reached !!!")

        while (serverMoneyAvailable < (serverMaxMoney * 0.75)) {
            ns.print("---------------------------------------------------------------")
            ns.print(targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, "$0.000a"))
            ns.print(targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, "$0.000a"))
            ns.print("Growing " + targetServer + " with " + ns.getHostname() + " to " + ns.formatNumber(serverMaxMoney * 0.75, "$0.000a") + "...")

            await ns.grow(targetServer)
            serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
            serverMaxMoney = ns.getServerMaxMoney(targetServer)
        }

        ns.print("---------------------------------------------------------------")
        ns.print("Optimal current money on " + targetServer + " reached !!!")
        ns.print(targetServer + " Current Money: " + ns.formatNumber(serverMoneyAvailable, "$0.000a"))
        ns.print(targetServer + " Max Money: " + ns.formatNumber(serverMaxMoney, "$0.000a"))
        ns.print("---------------------------------------------------------------")
        ns.print("Hacking " + targetServer + " with " + ns.getHostname() + "...")

        await ns.hack(targetServer)
        serverMoneyAvailable = ns.getServerMoneyAvailable(targetServer)
        serverMaxMoney = ns.getServerMaxMoney(targetServer)
    }
}