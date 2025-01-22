import {
    scanNetwork,
    tryNuke,
    canHack,
    copyAndExecute,
    parseArguments
} from "./utils.js"
import {
    linesplitMiddle,
    linesplitBottom,
    tcprint,
    linesplitTop
} from "./utils/customprint.js"

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
        linesplitTop(ns, true)
        tcprint(ns, helpUsage)
        linesplitBottom(ns, true)
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
        tcprint(ns, helpUsage)
        return
    }

    linesplitTop(ns, true)
    tcprint(ns, `Root Server: ${rootServer}`)
    tcprint(ns, `Execute Flag: ${execute}`)
    tcprint(ns, `File Names: ${fileNames.join(", ")}`)
    tcprint(ns, `Source Server: ${sourceServer}`)

    // Statistics tracking
    let totalServers = 0
    let hackedServers = 0
    let failedNukes = 0
    let skippedServers = 0
    let insufficientPorts = 0

    const serversToVisit = scanNetwork(ns, rootServer)

    for (const server of serversToVisit) {
        linesplitMiddle(ns, true)
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
            tcprint(ns, `Skipping '${server}', requires ${requiredPorts} ports but only ${availablePortTools} tools available`)
            insufficientPorts++
            skippedServers++
            continue
        }

        if (!ns.hasRootAccess(server)) {
            try {
                tryNuke(ns, server)
            } catch (e) {
                tcprint(ns, `Failed to nuke '${server}': ${e.error}`)
                failedNukes++
                skippedServers++
                continue
            }
        }

        if (!ns.hasRootAccess(server)) {
            tcprint(ns, `Skipping '${server}', no Root access`)
            linesplitMiddle(ns, true)
            skippedServers++
            continue
        }

        let canHackResult = canHack(ns, server)
        if (canHackResult.success) {
            await copyAndExecute(ns, server, fileNames, sourceServer, execute, server)
            hackedServers++

            // Verify the script is running
            const processes = ns.ps(server)
            const running = processes.some((p) => fileNames.includes(p.filename))
            if (!running) {
                tcprint(ns, `Warning: Script failed to execute on '${server}'`)
            }
            continue
        }
        tcprint(ns, `Skipping '${server}', ${canHackResult.error}`)
        skippedServers++
    }

    // Output final statistics
    linesplitMiddle(ns, true)
    tcprint(ns, "                    SUMMARY")
    tcprint(ns, `Total Servers Scanned: ${totalServers}`)
    tcprint(ns, `Successfully Hacked: ${hackedServers}`)
    tcprint(ns, `Failed Nukes: ${failedNukes}`)
    tcprint(ns, `Skipped Servers Due to Insufficient Ports: ${insufficientPorts}`)
    tcprint(ns, `Skipped Servers: ${skippedServers}`)
    tcprint(ns, "Finished processing files for all rooted servers")
    linesplitBottom(ns, true)
}