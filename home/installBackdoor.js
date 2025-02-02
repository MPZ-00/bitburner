import {
    scanNetwork,
    tryNuke,
    parseArguments
} from "utils.js"
import {
    tcprint,
    linesplitTop,
    linesplitMiddle,
    linesplitBottom,
    cprint
} from './utils/customprint.js'

const maxLineLength = 70
/** @param {NS} ns */
export async function main(ns) {
    const defaults = {
        rootServer: "home" // Default root server
    }

    const helpUsage = "Usage: run installBackdoor.js [--root='value']"

    linesplitTop(ns, true, maxLineLength)
    tcprint(ns, helpUsage, maxLineLength)
    linesplitMiddle(ns, true, maxLineLength)

    // Parse the arguments
    const args = parseArguments(ns, ns.args, defaults)

    // Extract parsed arguments
    const {
        rootServer
    } = args

    tcprint(ns, `Root Server: ${rootServer}`, maxLineLength)
    linesplitMiddle(ns, true, maxLineLength)

    // Statistics tracking
    let totalServers = 0
    let backdoorsInstalled = 0
    let skippedServers = 0
    let failedServers = 0

    const serversToVisit = scanNetwork(ns, rootServer)

    for (const server of serversToVisit) {
        totalServers++

        // Check if server already has a backdoor
        if (ns.getServer(server).backdoorInstalled) {
            tcprint(ns, `Skipping '${server}', backdoor already installed`, maxLineLength)
            backdoorsInstalled++
            continue
        }

        // Ensure root access
        if (!ns.hasRootAccess(server)) {
            try {
                tryNuke(ns, server)
            } catch (e) {
                tcprint(ns, `Skipping '${server}', failed to gain root access: ${e.error}`, maxLineLength)
                skippedServers++
                continue
            }
        }

        // Verify root access again
        if (!ns.hasRootAccess(server)) {
            tcprint(ns, `Skipping '${server}', no Root access`, maxLineLength)
            skippedServers++
            continue
        }

        // Attempt to install backdoor
        try {
            linesplitMiddle(ns, true, maxLineLength)
            tcprint(ns, `Connecting to '${server}' to install backdoor`, maxLineLength)
            ns.connect(server)
            await ns.installBackdoor()
            tcprint(ns, `Backdoor installed on '${server}'`, maxLineLength)
            backdoorsInstalled++
        } catch (e) {
            tcprint(ns, `Failed to install backdoor on '${server}': ${e.error}`, maxLineLength)
            failedServers++
        } finally {
            // ns.connect("home") // Ensure return to home even on failure
            linesplitMiddle(ns, true, maxLineLength)
        }
    }

    // Output final statistics
    cprint(ns, `─────[Summary]─────`, true, maxLineLength, '├')
    linesplitMiddle(ns, true, maxLineLength)
    tcprint(ns, `Total Servers Scanned: ${totalServers}`, maxLineLength)
    tcprint(ns, `Backdoors Installed:   ${backdoorsInstalled}`, maxLineLength)
    tcprint(ns, `Failed Servers:        ${failedServers}/${totalServers - skippedServers}`, maxLineLength)
    tcprint(ns, `Skipped Servers:       ${skippedServers}/${totalServers - backdoorsInstalled}`, maxLineLength)
    linesplitBottom(ns, true, maxLineLength)
}