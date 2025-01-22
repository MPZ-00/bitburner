import {
    scanNetwork
} from 'utils.js'
import {
    linesplit,
    linesplitBottom,
    linesplitTop,
    tcprint
} from './utils/customprint.js'

/** @param {NS} ns */
export async function main(ns) {
    const host = ns.getHostname()
    const networkServers = scanNetwork(ns, host)
    const playerHackingLevel = ns.getHackingLevel()
    const script = "crack.js"

    if (host !== "home") {
        ns.scp(script, host, "home")
    }

    const ramAvailable = ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
    const ramScript = ns.getScriptRam(script)

    if (ramAvailable - ramScript <= 0) {
        throw new Error([
            `Cannot run '${script}', not enough ram available on '${host}'!`,
            `Need ${ramScript}GB more available`
        ].join('\n'))
    }

    linesplitTop(ns, true)

    let crackedServers = 0
    let totalServers = networkServers.length
    let rootedServers = 0

    for (const server of networkServers) {
        const hasRoot = ns.hasRootAccess(server)
        const hasRequiredHackingLevel = ns.getServerRequiredHackingLevel(server)
        if (hasRoot || hasRequiredHackingLevel > playerHackingLevel) {
            tcprint(ns, `'${server}' ${hasRoot ? `already rooted.` : `${hasRequiredHackingLevel} hacking level required`}`)
            totalServers--
            rootedServers += hasRoot
            continue
        }
        crackedServers += ns.run(script, 1, server)
        rootedServers += ns.hasRootAccess(server)
    }

    linesplit(ns, true)
    tcprint(ns, `Cracked ${crackedServers}/${totalServers} servers. Using '${script}'`)
    tcprint(ns, `Rooted Servers: ${rootedServers}/${networkServers.length}`)
    linesplitBottom(ns, true)
}