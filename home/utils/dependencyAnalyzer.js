import {
    cprint,
    linesplit,
    linesplitTop,
    linesplitBottom
} from "utils/customprint.js"

/**
 * Analyzes all servers, checks for file imports (including multiline imports),
 * verifies dependencies, and copies missing files from home.
 *
 * @param {NS} ns - Bitburner NS object.
 */
export async function main(ns) {
    const homeServer = "home" // Source server for missing files
    const servers = scanAllServers(ns) // Get all servers

    linesplitTop(ns, true)
    cprint(ns, ["Dependency Analyzer Started"], true)
    linesplit(ns, true)

    for (const server of servers) {
        const files = ns.ls(server, ".js") // Get all JavaScript files on the server
        if (files.length === 0) continue // Skip if no JS files

        cprint(ns, [`Analyzing server: ${server}`], true)

        for (const file of files) {
            const content = ns.read(file) // Read file content
            const imports = parseImports(content) // Extract imports from the file

            for (const importedFile of imports) {
                if (!ns.fileExists(importedFile, server)) {
                    cprint(ns, [`File ${importedFile} missing on ${server}. Copying from ${homeServer}...`], true)
                    await ns.scp(importedFile, homeServer, server) // Copy missing file from home
                } else {
                    cprint(ns, [`File ${importedFile} already exists on ${server}.`], true)
                }
            }
        }
    }

    linesplit(ns, true)
    cprint(ns, ["Dependency analysis and copying completed!"], true)
    linesplitBottom(ns, true)
}

/**
 * Scans the network and retrieves all servers.
 *
 * @param {NS} ns - Bitburner NS object.
 * @return {string[]} - List of all servers.
 */
function scanAllServers(ns) {
    const visited = new Set()
    const stack = ["home"]
    const servers = []

    while (stack.length > 0) {
        const current = stack.pop()
        if (!visited.has(current)) {
            visited.add(current)
            servers.push(current)
            stack.push(...ns.scan(current))
        }
    }

    return servers
}

/**
 * Parses a file's content to extract imported file names, including multiline imports.
 *
 * @param {string} content - The file content.
 * @return {string[]} - List of imported file names.
 */
function parseImports(content) {
    const importRegex = /import\s+?\{[\s\S]*?\}\s+?from\s+['"](.+?)['"]/g
    const simpleImportRegex = /import .*? from ['"](.+?)['"]/g
    const imports = []
    let match

    // Match simple and multiline imports
    while ((match = simpleImportRegex.exec(content)) !== null || (match = importRegex.exec(content)) !== null) {
        imports.push(match[1]) // Add the imported file name to the list
    }

    return imports
}