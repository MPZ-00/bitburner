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
        execute: false, // Default execution flag
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

    // Print parsed arguments for debugging (optional)
    ns.tprint(`Root Server: ${rootServer}`)
    ns.tprint(`Execute Flag: ${execute}`)
    ns.tprint(`File Names: ${fileNames.join(", ")}`)
    ns.tprint(`Source Server: ${sourceServer}`)

    // Add your logic for copying files and optionally executing them here
    ns.tprint("Processing files...")

    const serversToVisit = scanNetwork(ns, rootServer)

    for (const server of serversToVisit) {
        if (!ns.hasRootAccess(server)) {
            tryNuke(ns, server)
        }

        if (!ns.hasRootAccess(server)) {
            ns.tprint(`Skipping ${server}, no Root access`)
            continue
        }

        let canHackResult = canHack(ns, server)
        if (canHackResult.success) {
            await copyAndExecute(ns, server, fileNames, sourceServer, execute)
            continue
        }
        ns.tprint(`Skipping ${server}, ${canHackResult.error}`)
    }

    ns.tprint("Finished processing files for all rooted servers.")
}