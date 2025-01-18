import {
    scanNetwork,
    tryNuke,
    canHack,
    copyAndExecute,
    parseArguments
} from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const defaults = {
        rootServer: "home", // Default root server
        execute: false // Default execution flag
    }

    const helpUsage = "Usage: run scpFileToAll.js [file names...] [source server] [--execute] [--root='value']"

    // Parse the arguments
    const args = parseArguments(ns, ns.args, defaults)

    // Check for usage errors
    if (args._positional.length < 1) {
        ns.tprint(helpUsage)
        return
    }

    // Extract parsed arguments
    const {
        rootServer,
        execute,
        _positional
    } = args
    const fileNames = _positional.slice(0, -1) // All but the last positional argument are file names
    const sourceServer = _positional[_positional.length - 1] // Last positional argument is the source server

    if (fileNames.length === 0) {
        ns.tprint(helpUsage)
        return
    }

    ns.tprint(`Root Server: ${rootServer}`)
    ns.tprint(`Execute Flag: ${execute}`)
    ns.tprint(`File Names: ${fileNames.join(", ")}`)
    ns.tprint(`Source Server: ${sourceServer}`)

    // Statistics tracking
    let totalServers = 0
    let hackedServers = 0
    let failedNukes = 0
    let skippedServers = 0
    let insufficientPorts = 0

    const serversToVisit = scanNetwork(ns, rootServer)

    for (const server of serversToVisit) {
        totalServers++

        const requiredPorts = ns.getServerNumPortsRequired(server)
        const availablePortTools = [
            ns.fileExists("BruteSSH.exe", "home") && ns.brutessh(server),
            ns.fileExists("FTPCrack.exe", "home") && ns.ftpcrack(server),
            ns.fileExists("relaySMTP.exe", "home") && ns.relaysmtp(server),
            ns.fileExists("HTTPWorm.exe", "home") && ns.httpworm(server),
            ns.fileExists("SQLInject.exe", "home") && ns.sqlinject(server)
        ].filter(Boolean).length

        if (requiredPorts > availablePortTools) {
            ns.tprint(`Skipping ${server}, requires ${requiredPorts} ports but only ${availablePortTools} tools available`)
            insufficientPorts++
            skippedServers++
            continue
        }

        if (!ns.hasRootAccess(server)) {
            try {
                tryNuke(ns, server)
            } catch (e) {
                ns.tprint(`Failed to nuke ${server}: ${e.error}`)
                failedNukes++
                skippedServers++
                continue
            }
        }

        if (!ns.hasRootAccess(server)) {
            ns.tprint(`Skipping ${server}, no Root access`)
            skippedServers++
            continue
        }

        let canHackResult = canHack(ns, server)
        if (canHackResult.success) {
            await copyAndExecute(ns, server, fileNames, sourceServer, execute)
            hackedServers++

            // Verify the script is running
            const processes = ns.ps(server)
            const running = processes.some((p) => fileNames.includes(p.filename))
            if (!running) {
                ns.tprint(`Warning: Script failed to execute on ${server}`)
            }
            continue
        }
        ns.tprint(`Skipping ${server}, ${canHackResult.error}`)
        skippedServers++
    }

    // Output final statistics
    ns.tprint("----- Summary -----")
    ns.tprint(`Total Servers Scanned: ${totalServers}`)
    ns.tprint(`Successfully Hacked: ${hackedServers}`)
    ns.tprint(`Failed Nukes: ${failedNukes}`)
    ns.tprint(`Skipped Servers Due to Insufficient Ports: ${insufficientPorts}`)
    ns.tprint(`Skipped Servers: ${skippedServers}`)
    ns.tprint("Finished processing files for all rooted servers.")
}