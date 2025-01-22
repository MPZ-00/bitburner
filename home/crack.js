/**
 * @param {NS} ns 
 * @param {string} targetServer
 */
export async function main(ns) {
    let targetServer = ns.args[0]
    if (ns.args.length < 1) {
        throw new Error(`Missing targetServer`)
    }

    if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(targetServer)
    if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(targetServer)
    if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(targetServer)
    if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(targetServer)
    if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(targetServer)

    try {
        ns.nuke(targetServer)
        ns.tprint(`Nuke complete on ${targetServer}.`)
    } catch (e) {
        ns.tprint(`Nuke failed on ${targetServer}`, e)
        return false
    }
    return true
}