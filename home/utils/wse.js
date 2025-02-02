export class WSE {
    constructor(ns) {
        this.ns = ns
        this.maxLineLength = ns.args[0] || 50
    }

    // --- Output Formatting Utilities ---

    linesplitMiddle(useTprint = false, lineLength, char = "─", leftChar = "├", rightChar = "┤") {
        lineLength = lineLength || this.maxLineLength
        let effective = Math.max(lineLength, this.maxLineLength)
        effective -= leftChar.length + rightChar.length
        let line = char.repeat(effective)
        let output = leftChar + line + rightChar
        if (useTprint) {
            this.ns.tprint(output)
        } else {
            this.ns.print(output)
        }
    }

    linesplitTop(useTprint = false, lineLength) {
        this.linesplitMiddle(useTprint, lineLength, "─", "┌", "┐")
    }

    linesplitBottom(useTprint = false, lineLength) {
        this.linesplitMiddle(useTprint, lineLength, "─", "└", "┘")
    }

    cprint(text, useTprint = false, lineLength) {
        lineLength = lineLength || this.maxLineLength
        let effective = Math.max(lineLength, this.maxLineLength)
        let contentWidth = effective - 2
        let buffer = ""
        for (let char of text) {
            if (buffer.length + 1 > contentWidth) {
                let line = buffer.padEnd(contentWidth, " ")
                let output = "│" + line + "│"
                if (useTprint) {
                    this.ns.tprint(output)
                } else {
                    this.ns.print(output)
                }
                buffer = ""
            }
            buffer += char
        }
        if (buffer.length > 0) {
            let line = buffer.padEnd(contentWidth, " ")
            let output = "│" + line + "│"
            if (useTprint) {
                this.ns.tprint(output)
            } else {
                this.ns.print(output)
            }
        }
    }

    tcprint(text, lineLength) {
        this.cprint(text, true, lineLength)
    }

    // --- Core Functionality ---

    // Recursively scans the network starting at a given server (default "home")
    async scanNetwork(startServer = "home") {
        let visited = new Set()
        let queue = [startServer]
        while (queue.length > 0) {
            let server = queue.shift()
            if (!visited.has(server)) {
                visited.add(server)
                let neighbors = this.ns.scan(server)
                for (let neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor)
                    }
                }
            }
        }
        return Array.from(visited).filter(server => server !== "home" && server !== "darkweb")
    }

    // Deploys a script to a target server. It copies the script from home if needed,
    // calculates available threads based on free RAM, and then executes the script.
    async deployScript(server, script, args = []) {
        if (server !== "home") {
            await this.ns.scp(script, "home", server)
        }
        let scriptRam = this.ns.getScriptRam(script, server)
        let availableRam = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server)
        let threads = Math.floor(availableRam / scriptRam)
        if (threads > 0) {
            this.ns.exec(script, server, threads, ...args)
            return threads
        }
        return 0
    }

    // Automatically opens ports and nukes the server if possible
    async autoCrack(server) {
        if (this.ns.hasRootAccess(server)) {
            return true
        }
        let tools = [
            this.ns.fileExists("BruteSSH.exe", "home") && (() => this.ns.brutessh(server)),
            this.ns.fileExists("FTPCrack.exe", "home") && (() => this.ns.ftpcrack(server)),
            this.ns.fileExists("relaySMTP.exe", "home") && (() => this.ns.relaysmtp(server)),
            this.ns.fileExists("HTTPWorm.exe", "home") && (() => this.ns.httpworm(server)),
            this.ns.fileExists("SQLInject.exe", "home") && (() => this.ns.sqlinject(server))
        ].filter(Boolean)
        for (let tool of tools) {
            tool()
        }
        if (this.ns.getServerNumPortsRequired(server) <= tools.length) {
            this.ns.nuke(server)
        }
        return this.ns.hasRootAccess(server)
    }

    // Chooses the appropriate script to run on the target based on its current state.
    // If the security level is high, choose weaken; if money is low, choose grow; otherwise hack.
    chooseScript(target) {
        let money = this.ns.getServerMoneyAvailable(target)
        let maxMoney = this.ns.getServerMaxMoney(target)
        let sec = this.ns.getServerSecurityLevel(target)
        let minSec = this.ns.getServerMinSecurityLevel(target)
        if (sec > minSec + 5) {
            return "weaken.js"
        }
        if (money < maxMoney * 0.75) {
            return "grow.js"
        }
        return "hack.js"
    }

    // Distributes tasks across all discovered servers.
    // For each server, it auto-cracks (if needed), then deploys the chosen script
    // (weaken.js, grow.js, or hack.js) targeting the specified server.
    async distributeTasks(target) {
        let servers = await this.scanNetwork()
        let chosenScript = this.chooseScript(target)
        for (let server of servers) {
            if (server !== "home" && !this.ns.hasRootAccess(server)) {
                await this.autoCrack(server)
            }
            if (this.ns.hasRootAccess(server)) {
                let threads = await this.deployScript(server, chosenScript, [target])
                if (threads > 0) {
                    this.ns.print(`Deployed ${chosenScript} on ${server} with ${threads} threads targeting ${target}`)
                }
            }
        }
    }

    // Monitors and logs the target server's current money and security levels
    monitorTarget(target) {
        let money = this.ns.getServerMoneyAvailable(target)
        let maxMoney = this.ns.getServerMaxMoney(target)
        let sec = this.ns.getServerSecurityLevel(target)
        let minSec = this.ns.getServerMinSecurityLevel(target)
        this.ns.print(`Target: ${target} Money: ${money}/${maxMoney} Security: ${sec}/${minSec}`)
    }

    // Failsafe mechanism – can be expanded to check for failed scripts or other issues
    async failsafe() {
        this.ns.print("Failsafe check complete")
    }

    // --- Core Loop ---
    // Continuously monitors the target, distributes tasks based on its current state,
    // and performs failsafe checks.
    async run(target) {
        this.ns.print("Starting Worldwide Script Executor...")
        while (true) {
            this.monitorTarget(target)
            await this.distributeTasks(target)
            await this.failsafe()
            await this.ns.sleep(10000)
        }
    }
}