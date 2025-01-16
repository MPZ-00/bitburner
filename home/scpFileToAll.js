/** @param {NS} ns */
export async function main(ns) {
    const args = ns.args
    const fileNames = args.slice(0, -3) // File names to copy
    const targetServer = args[args.length - 3] // Target server
    const sourceServer = args[args.length - 2] // Source server
    const autoExecute = args[args.length - 1] === "--execute" // Flag for auto-execute

    if (fileNames.length === 0 || !targetServer || !sourceServer) {
        ns.tprint("Usage: run scpFileToAll.js [file names...] [target server] [source server] [--execute]")
        return
    }

    for (const fileName of fileNames) {
        try {
            if (!ns.fileExists(fileName, sourceServer)) {
                throw new Error(`${fileName} does not exist on ${sourceServer}`)
            }

            await ns.scp(fileName, sourceServer, targetServer)
            ns.print(`Copied ${fileName} from ${sourceServer} to ${targetServer}`)

            if (autoExecute) {
                const maxThreads = Math.floor((ns.getServerMaxRam(targetServer) - ns.getServerUsedRam(targetServer)) / ns.getScriptRam(fileName))
                if (maxThreads > 0) {
                    ns.exec(fileName, targetServer, maxThreads)
                    ns.tprint(`Executed ${fileName} on ${targetServer} with ${maxThreads} threads`)
                } else {
                    throw new Error(`Not enough RAM on ${targetServer} to execute ${fileName}`)
                }
            }
        } catch (error) {
            ns.print(`Error handling ${fileName} on ${targetServer}: ${error.message}`)
            ns.tprint(`Error: ${error.message}`)
        }
    }

    ns.tprint(`Finished processing files for ${targetServer}`)
}