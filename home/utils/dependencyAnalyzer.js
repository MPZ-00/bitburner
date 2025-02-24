import {
    tcprint,
    linesplit,
    linesplitTop,
    linesplitBottom
} from "utils/customprint.js"
import {
    scanNetwork
} from "../utils.js"

/**
 * Analyzes all servers, checks for file imports (including multiline imports),
 * verifies dependencies, and copies missing files from home.
 *
 * @param {NS} ns - Bitburner NS object.
 */
export async function main(ns) {
    const homeServer = "home" // Source server for missing files
    const servers = scanNetwork(ns, homeServer) // gets all servers on the network without duplicates, home and darkweb

    linesplitTop(ns, true)
    tcprint(ns, "Dependency Analyzer Started")
    linesplit(ns, true)

    for (const server of servers) {
        const files = ns.ls(server, ".js") // Get all JavaScript files on the server
        if (files.length === 0) continue // Skip if no JS files

        tcprint(ns, `Analyzing server: ${server}`)

        for (const file of files) {
            const content = ns.read(file) // Read file content
            const imports = parseImports(content) // Extract imports from the file

            for (const importedFile of imports) {
                if (!ns.fileExists(importedFile, server)) {
                    tcprint(ns, `File ${importedFile} missing on ${server}. Copying from ${homeServer}...`)
                    await ns.scp(importedFile, server, homeServer) // Copy missing file from home
                } else {
                    tcprint(ns, `File ${importedFile} already exists on ${server}.`)
                }
            }
        }
    }

    linesplit(ns, true)
    tcprint(ns, "Dependency analysis and copying completed!")
    linesplitBottom(ns, true)
}

/**
 * Parses a file's content to extract imported file names, including multiline imports.
 * Adjusts relative imports to ensure they are valid paths.
 *
 * @param {string} filePath - The current file's path.
 * @param {string} content - The file content.
 * @return {string[]} - List of imported file names with normalized paths.
 */
function parseImports(filePath, content) {
    const importRegex = /import\s+?\{[\s\S]*?\}\s+?from\s+['"](.+?)['"]/g
    const simpleImportRegex = /import .*? from ['"](.+?)['"]/g
    const imports = []
    let match

    // Normalize relative imports
    const normalizePath = (importPath) => {
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const basePath = filePath.substring(0, filePath.lastIndexOf('/') + 1)
            return basePath + importPath
        }
        return importPath // Absolute or already normalized
    }

    // Match simple and multiline imports
    while ((match = simpleImportRegex.exec(content)) !== null || (match = importRegex.exec(content)) !== null) {
        imports.push(normalizePath(match[1])) // Normalize and add to the list
    }

    return imports
}