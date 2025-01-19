/** @param {NS} ns */
export async function main(ns) {
    let targetServer = ns.args[0]

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(targetServer)
        ns.print(`Executed: BruteSSH.exe`)
    }

    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(targetServer)
        ns.print(`Executed: FTPCrack.exe`)
    }

    if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(targetServer)
        ns.print(`Executed: relaySMTP.exe`)
    }

    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(targetServer)
        ns.print(`Executed: HTTPWorm.exe`)
    }

    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(targetServer)
        ns.print(`Executed: SQLInject.exe`)
    }


    try {
        ns.nuke(targetServer)
        ns.tprint(`Nuke complete on ${targetServer}.`)
    } catch (e) {
        ns.tprint(`Nuke failed on ${targetServer}`, e)
    }
}