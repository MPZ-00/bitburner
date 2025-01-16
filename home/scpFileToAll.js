import {
    scanNetwork,
    tryNuke,
    canHack,
    copyAndExecute
} from "home/utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const args = ns.args
    const fileNames = args.slice(0, -2) // File names to copy
    const sourceServer = args[args.length - 2] // Source server
    const autoExecute = args[args.length - 1] === "--execute" // Flag for auto-execute

    if (fileNames.length === 0 || !sourceServer) {
        ns.tprint("Usage: run scpFileToAll.js [file names...] [source server] [--execute]")
        return
    }

    const serversToVisit = []

    // Scan the network starting from "home"
    scanNetwork(ns, "home", serversToVisit)

    for (const server of serversToVisit) {
        if (!ns.hasRootAccess(server)) {
            tryNuke(ns, server)
        }

        if (canHack(ns, server)) {
            await copyAndExecute(ns, server, fileNames, sourceServer, autoExecute)
        } else {
            ns.tprint(`Skipping ${server}, insufficient hacking level or no root access`)
        }
    }

    ns.tprint("Finished processing files for all rooted servers.")
}