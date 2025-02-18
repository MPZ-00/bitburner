// Import necessary BitBurner functions
const ns = getNs()

class OrderManager {
    constructor(ns) {
        this.ns = ns
    }

    async placeMarketBuy(sym, shares) {
        return this.ns.tix.buyStock(sym, shares)
    }

    async placeMarketSell(sym, shares) {
        return this.ns.tix.sellStock(sym, shares)
    }

    async placeShort(sym, shares) {
        return this.ns.tix.sellShort(sym, shares)
    }

    async cancelOrder(sym, shares, price, type, pos) {
        return this.ns.tix.cancelOrder(sym, shares, price, type, pos)
    }
}

class TradeStrategy {
    constructor(ns) {
        this.ns = ns
        this.orderManager = new OrderManager(ns)
    }

    async execute() {
        const symbols = this.ns.tix.getSymbols()
        for (const sym of symbols) {
            const forecast = this.ns.tix.getForecast(sym)
            if (forecast > 0.52) {
                await this.buyStock(sym)
            } else if (forecast < 0.48) {
                await this.sellStock(sym)
            }
        }
    }

    async buyStock(sym) {
        const maxShares = this.ns.tix.getMaxShares(sym)
        const askPrice = this.ns.tix.getAskPrice(sym)
        const cost = this.ns.tix.getPurchaseCost(sym, maxShares, "Long")
        if (cost <= ns.getServerMoneyAvailable("home")) {
            await this.orderManager.placeMarketBuy(sym, maxShares)
            ns.print(`Bought ${maxShares} shares of ${sym} at $${askPrice}`)
        }
    }

    async sellStock(sym) {
        const position = this.ns.tix.getPosition(sym)
        if (position[0] > 0) { // Long position
            await this.orderManager.placeMarketSell(sym, position[0])
            ns.print(`Sold ${position[0]} shares of ${sym}`)
        }
    }

    async shortStock(sym) {
        const maxShares = this.ns.tix.getMaxShares(sym)
        if (maxShares > 0) {
            await this.orderManager.placeShort(sym, maxShares)
            ns.print(`Shorted ${maxShares} shares of ${sym}`)
        }
    }
}

class StockMarketManager {
    constructor(ns) {
        this.ns = ns
        this.tradeStrategy = new TradeStrategy(ns)
        this.updateInterval = 6000 // Update every 6 seconds
    }

    async start() {
        while (true) {
            await this.trade()
            await this.ns.sleep(this.updateInterval)
        }
    }

    async trade() {
        const bonusTime = this.ns.getServer("home").bonusTime
        if (bonusTime > 0) {
            ns.print(`Running at ${this.updateInterval / 2}ms due to bonus time.`)
            this.updateInterval = 3000 // Run faster during bonus time
        } else {
            this.updateInterval = 6000 // Normal update interval
        }
        await this.tradeStrategy.execute()
    }
}

// Main function
async function main(ns) {
    const stockMarketManager = new StockMarketManager(ns)
    await stockMarketManager.start()
}