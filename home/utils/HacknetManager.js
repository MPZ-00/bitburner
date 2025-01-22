import {
    linesplit,
    linesplitBottom,
    linesplitTop,
    cprint
} from "./customprint.js"

/** @param {NS} ns **/
export async function main(ns) {
    var paybackLimit = 24 * 60 * 60
    var sleepMilliseconds = 5 * 1000
    var budgetPercentage = 0.6

    linesplitTop(ns, true)
    cprint(ns, `Hacknet Manager Started`, true)
    linesplitBottom(ns, true)

    while (true) {
        var budget = ns.getServerMoneyAvailable('home')
        budget *= budgetPercentage //Don't want to spend all money on hacknet, allow 33% but change this if wanted
        var nodeNumber = ns.hacknet.numNodes()
        var actionList = []

        if (nodeNumber > 0) {
            for (var i = 0; i < nodeNumber; i++) {
                var nodeActions = []
                nodeActions.push(new RamAction(ns, i))
                nodeActions.push(new CoreAction(ns, i))
                nodeActions.push(new LevelAction(ns, i))
                nodeActions.forEach(action => actionList.push(action))
            }
        }

        actionList.push(new NewNodeAction(ns, 1))
        actionList = actionList.filter(action => action.payBackTime() < paybackLimit)

        if (actionList.length > 0) {
            actionList = actionList.filter(action => action.cost < budget)
            if (actionList.length > 0) { // Second check, we don't want to escape the script if there are actions we will be able to afford later
                actionList.sort(function (x, y) {
                    x.payBackTime() - y.payBackTime()
                })
                actionList[0].doAction()
            }
            await ns.sleep(sleepMilliseconds)
        } else {
            cprint(ns, `All Hacknet Nodes are fully productive.`)
            linesplitBottom(ns)
            break
        }
    }
}

class Action {
    constants = {
        MaxLevel: 200,
        MaxRam: 64,
        MaxCores: 16,
        MoneyGainPerLevel: 1.5,
        HackNetNodeMoneyBitNode: 0.25
    }
    sys
    nodeIndex

    cost
    originalProd
    prodIncrease
    name
    multProd
    ram
    level
    cores
    ns

    doAction = () => {
        return null
    }

    constructor(ns, nodeIndex) {
        this.ns = ns
        this.sys = ns.hacknet
        this.nodeIndex = nodeIndex
        this.multProd = ns.getHacknetMultipliers().production
        var stats = this.sys.getNodeStats(nodeIndex)
        this.name = stats.name
        this.ram = stats.ram
        this.level = parseFloat(stats.level)
        this.cores = parseFloat(stats.cores)
        this.originalProd = parseFloat(stats.production)
    }

    payBackTime() {
        return this.cost / this.prodIncrease
    }

    upgradedProdRate(ns) {
        var updatedRate = this.calculateMoneyGainRate(this.level, this.ram, this.cores, this.multProd)
        return updatedRate
    }

    calculateMoneyGainRate(level, ram, cores, mult) {
        const gainPerLevel = this.constants.MoneyGainPerLevel
        const levelMult = level * gainPerLevel
        const ramMult = Math.pow(1.035, ram - 1)
        const coresMult = (cores + 5) / 6.0

        var result = levelMult
        result *= ramMult
        result *= coresMult
        result *= mult
        result *= this.constants.HackNetNodeMoneyBitNode

        return result
    }
}

class RamAction extends Action {
    constructor(ns, nodeIndex) {
        super(ns, nodeIndex)
        this.cost = this.sys.getRamUpgradeCost(this.nodeIndex, 1)

        if (isFinite(this.cost) && this.cost > 0) {
            ++this.ram
            this.prodIncrease = this.upgradedProdRate(ns)
            this.prodIncrease -= this.originalProd
            this.doAction = () => {
                this.sys.upgradeRam(nodeIndex, 1)
                cprint(ns, `Upgrading Ram on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 3600)} hours`)
            }
        } else {
            this.prodIncrease = 0
        }
    }
}

class LevelAction extends Action {
    constructor(ns, nodeIndex) {
        super(ns, nodeIndex)
        this.cost = this.sys.getLevelUpgradeCost(this.nodeIndex, 1)

        if (isFinite(this.cost) && this.cost > 0) {
            ++this.level
            this.prodIncrease = this.upgradedProdRate(ns)
            this.prodIncrease -= this.originalProd
            this.doAction = () => {
                this.sys.upgradeLevel(nodeIndex, 1)
                cprint(ns, `Upgrading Level on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 3600)} hours`)
            }
        } else {
            this.prodIncrease = 0
        }
    }
}

class CoreAction extends Action {
    constructor(ns, nodeIndex) {
        super(ns, nodeIndex)
        this.cost = this.sys.getCoreUpgradeCost(this.nodeIndex, 1)

        if (isFinite(this.cost) && this.cost > 0) {
            ++this.cores
            this.prodIncrease = this.upgradedProdRate(ns)
            this.prodIncrease -= this.originalProd
            this.doAction = () => {
                this.sys.upgradeCore(nodeIndex, 1)
                cprint(ns, `Upgrading Core on node ${this.nodeIndex}, payback time is ${Math.ceil(this.payBackTime() / 3600)} hours`)
            }
        } else {
            this.prodIncrease = 0
        }
    }
}

class NewNodeAction extends Action {
    constructor(ns, nodeIndex) {
        super(ns, 0)
        this.ram = 1
        this.level = 1
        this.cores = 1
        this.originalProd = 0
        this.cost = this.sys.getPurchaseNodeCost()

        if (isFinite(this.cost) && this.cost > 0) {
            this.prodIncrease = this.upgradedProdRate(ns)
            this.prodIncrease -= this.originalProd
            this.doAction = () => {
                this.sys.purchaseNode()
                cprint(ns, `Purchasing a new node. payback time is ${Math.ceil(this.payBackTime() / 3600)} hours`)
            }
        } else {
            this.prodIncrease = 0
        }
    }
}