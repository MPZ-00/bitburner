/** @param {NS} ns */
export function scanNetwork(ns, startServer, visited = new Set()) {
    const servers = []

    function recursiveScan(server) {
        if (visited.has(server)) return
        visited.add(server)
        servers.push(server)

        const neighbors = ns.scan(server)
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                recursiveScan(neighbor)
            }
        }
    }

    recursiveScan(startServer)
    return servers
}

/** @param {NS} ns */
export function tryNuke(ns, server) {
    if (ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server)
    if (ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(server)
    if (ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server)
    if (ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(server)
    if (ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server)

    try {
        ns.nuke(server)
    } catch (error) {
        ns.print(`Failed to nuke ${server}: ${error}`)
    }
}

/** @param {NS} ns */
export function canHack(ns, server) {
    return ns.hasRootAccess(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
}

/** @param {NS} ns */
export async function copyAndExecute(ns, server, fileNames, sourceServer, autoExecute) {
    let totalThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(fileNames[0]))
    const threadsPerFile = Math.floor(totalThreads / fileNames.length)

    for (const fileName of fileNames) {
        try {
            if (!ns.fileExists(fileName, sourceServer)) {
                throw new Error(`${fileName} does not exist on ${sourceServer}`)
            }

            await ns.scp(fileName, sourceServer, server)
            ns.print(`Copied ${fileName} from ${sourceServer} to ${server}`)

            if (autoExecute && threadsPerFile > 0) {
                ns.exec(fileName, server, threadsPerFile)
                ns.tprint(`Executed ${fileName} on ${server} with ${threadsPerFile} threads`)
            } else if (autoExecute) {
                ns.print(`Not enough threads for ${fileName} on ${server}`)
            }
        } catch (error) {
            ns.print(`Error handling ${fileName} on ${server}: ${error.message}`)
            ns.tprint(`Error: ${error.message}`)
        }
    }
}