import {
    scanNetwork,
    tryNuke,
    parseArguments
} from "utils.js"

/** @param {NS} ns */
export async function main(ns) {
    const defaults = {
        rootServer: "home" // Default root server
    }

    const helpUsage = "Usage: run installBackdoor.js [--root='value']"

    // Parse the arguments
    const args = parseArguments(ns, ns.args, defaults)

    // Extract parsed arguments
    const {
        rootServer
    } = args

    ns.print(`Root Server: ${rootServer}`)

    // Statistics tracking
    let totalServers = 0
    let backdoorsInstalled = 0
    let skippedServers = 0

    const serversToVisit = scanNetwork(ns, rootServer)

    for (const server of serversToVisit) {
        totalServers++

        // Check if server already has a backdoor
        if (ns.getServer(server).backdoorInstalled) {
            ns.print(`Skipping ${server}, backdoor already installed`)
            skippedServers++
            continue
        }

        // Ensure root access
        if (!ns.hasRootAccess(server)) {
            try {
                tryNuke(ns, server)
            } catch (e) {
                ns.print(`Skipping ${server}, failed to gain root access: ${e.error}`)
                skippedServers++
                continue
            }
        }

        // Verify root access again
        if (!ns.hasRootAccess(server)) {
            ns.print(`Skipping ${server}, no Root access`)
            skippedServers++
            continue
        }

        // Attempt to install backdoor
        try {
            ns.print(`Connecting to ${server} to install backdoor`)
            ns.connect(server)
            await ns.installBackdoor()
            ns.print(`Backdoor installed on ${server}`)
            backdoorsInstalled++
        } catch (e) {
            ns.print(`Failed to install backdoor on ${server}: ${e.error}`)
            skippedServers++
        } finally {
            ns.connect("home") // Ensure return to home even on failure
        }
    }

    // Output final statistics
    ns.tprint("----- Summary -----")
    ns.tprint(`Total Servers Scanned: ${totalServers}`)
    ns.tprint(`Backdoors Installed: ${backdoorsInstalled}`)
    ns.tprint(`Skipped Servers: ${skippedServers}`)
}