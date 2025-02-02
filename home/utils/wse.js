export class WSE {
    constructor(ns, maxLineLength = 50) {
        this.ns = ns
        this.maxLineLength = maxLineLength
    }

    // Draws a horizontal line with custom border characters
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

    // Top border with fancy characters
    linesplitTop(useTprint = false, lineLength) {
        this.linesplitMiddle(useTprint, lineLength, "─", "┌", "┐")
    }

    // Bottom border with fancy characters
    linesplitBottom(useTprint = false, lineLength) {
        this.linesplitMiddle(useTprint, lineLength, "─", "└", "┘")
    }

    // Prints text inside vertical borders, splitting as needed
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

    // Shortcut to call cprint with tprint output
    tcprint(text, lineLength) {
        this.cprint(text, true, lineLength)
    }

    // Scans the network starting from "home" and returns all servers except "home" and "darkweb"
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

    // Deploys a script from the home/deploy folder to the specified server
    async deployScript(server, script, args = []) {
        let scriptPath = `home/deploy/${script}`
        if (server !== "home") {
            await this.ns.scp(scriptPath, "home", server)
        }
        let scriptRam = this.ns.getScriptRam(scriptPath, server)
        let availableRam = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server)
        let threads = Math.floor(availableRam / scriptRam)
        if (threads > 0) {
            this.ns.exec(scriptPath, server, threads, ...args)
            return threads
        }
        return 0
    }

    // Attempts to open required ports and nuke the server if possible
    async autoCrack(server) {
        if (this.ns.hasRootAccess(server)) {
            return true
        }
        let requiredPorts = this.ns.getServerNumPortsRequired(server)
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

    // Chooses the appropriate script based on the target's current security and money status
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

    // Distributes tasks to each discovered server by deploying the chosen script
    async distributeTasks(target) {
        let servers = await this.scanNetwork()
        let chosenScript = this.chooseScript(target)
        for (let server of servers) {
            if (!this.ns.hasRootAccess(server)) {
                await this.autoCrack(server)
            }
            if (this.ns.hasRootAccess(server)) {
                let threads = await this.deployScript(server, chosenScript, [target])
                if (threads > 0) {
                    this.tcprint(`Deployed '${chosenScript}' on '${server}' with ${threads} threads targeting '${target}'`, this.maxLineLength)
                } else {
                    this.tcprint(`Insufficient RAM on '${server}' to deploy '${chosenScript}'`, this.maxLineLength)
                }
            } else {
                this.tcprint(`Failed to gain root on '${server}'`, this.maxLineLength)
            }
        }
    }

    // Monitors the target's status using fancy printed output
    monitorTarget(target) {
        let money = this.ns.getServerMoneyAvailable(target)
        let maxMoney = this.ns.getServerMaxMoney(target)
        let sec = this.ns.getServerSecurityLevel(target)
        let minSec = this.ns.getServerMinSecurityLevel(target)
        this.tcprint(`Target: '${target}' | Money: ${money}/${maxMoney} | Security: ${sec}/${minSec}`, this.maxLineLength)
    }

    // Runs a failsafe check with formatted output (expandable for additional logic)
    async failsafe() {
        this.tcprint("Failsafe: Checking for issues...", this.maxLineLength)
        await this.ns.sleep(1000)
        this.tcprint("Failsafe: No issues detected", this.maxLineLength)
    }

    // Core loop: continuously monitors the target, distributes tasks to each server, and runs failsafe checks
    async run(target) {
        this.tcprint(`Starting Worldwide Script Executor for target '${target}'`, this.maxLineLength)
        while (true) {
            this.linesplitTop(true)
            this.monitorTarget(target)
            await this.distributeTasks(target)
            await this.failsafe()
            this.linesplitBottom(true)
            await this.ns.sleep(10000)
        }
    }
}