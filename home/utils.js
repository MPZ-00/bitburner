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
    return servers.filter(server => server !== "home")
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
        ns.tprint(`Failed to nuke ${server}: ${error}`)
    }
}

/** @param {NS} ns */
export function canHack(ns, server) {
    if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) {
        return {
            success: false,
            error: "Hacking level too low"
        }
    }
    if (!ns.hasRootAccess(server)) {
        return {
            success: false,
            error: "No root access"
        }
    }
    return {
        success: true
    }
}

/** 
 * @param {NS} ns 
 * @param {string} server target server
 * @param {string[]} fileNames
 * @param {string='home'} sourceServer
 * @param {boolean=true} autoExecute
 */
export async function copyAndExecute(ns, server, fileNames, sourceServer = 'home', autoExecute = false) {
    let totalThreads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(fileNames[0]))
    const threadsPerFile = Math.floor(totalThreads / fileNames.length)

    for (const fileName of fileNames) {
        try {
            if (!ns.fileExists(fileName, sourceServer)) {
                throw new Error(`${fileName} does not exist on ${sourceServer}`)
            }

            ns.scp(fileName, server, sourceServer)
            ns.tprint(`Copied ${fileName} from ${sourceServer} to ${server}`)

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

/**
 * Parses command-line arguments into an options object.
 * Supports arguments like `--flag`, `--key=value`, and positional arguments.
 *
 * @param {NS} ns - Bitburner's NS object.
 * @param {string[]} args - Command-line arguments (ns.args).
 * @param {Object} defaults - Default values for options.
 * @return {Object} Parsed arguments with flags, key-value pairs, and positional arguments.
 */
export function parseArguments(ns, args, defaults = {}) {
    const options = {
        ...defaults,
        _positional: []
    } // Clone defaults and add _positional array

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=")

            if (value === undefined) {
                // Handle flags like --execute
                options[key] = true
            } else {
                // Handle key-value pairs like --root=home
                options[key] = value
            }
        } else {
            // Collect positional arguments
            options._positional.push(arg)
        }
    }

    return options
}