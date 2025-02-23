/** @param {NS} ns */
export async function main(ns) {
    const config = {
        scriptTimer: 6000,
        moneyKeep: 100_000_000,
        stockBuyOver_Long: 0.6,
        stockBuyUnder_Short: 0.4,
        stockVolatility: 0.05,
        minSharePercent: 5,
        maxSharePercent: 1.0,
        sellThreshold_Long: 0.55,
        sellThreshold_Short: 0.4,
    }

    const toastConfig = {
        duration: 15000,
        extraFormats: [1e15, 1e18, 1e21, 1e24, 1e27, 1e30],
        extraNotations: ["q", "Q", "s", "S", "o", "n"],
        decimalPlaces: 3,
    }

    class StockManager {
        constructor(ns) {
            this.ns = ns
            this.shares = new Map()
            this.orders = []
        }

        async getPrices() {
            const companies = await this.ns.stock.getCompanies()
            return Promise.all(companies.map((c) => this.ns.stock.getPrice(c)))
        }

        isPublicCompany(company) {
            return company !== null && company.public
        }

        calculateVolatility(priceHistory, days = 7) {
            // Calculate average volatility over the last 'days' of trading
            const avg =
                priceHistory
                    .slice(-days)
                    .reduce((a, b) => a + b.volatilityChange, 0) / days
            return Math.abs(avg)
        }

        async decideAction(company, priceData) {
            if (!this.isPublicCompany(company)) return null

            // Check volatility thresholds first
            if (
                priceData.history[this.calculateVolatility(priceData.history)] >
                config.stockVolatility
            )
                return "hold"

            const forecast = await this.ns.stock.getForecast(company)

            let action
            if (
                forecast >= config.stockBuyOver_Long &&
                !this.shares.has(company.name)
            ) {
                action = "buy"
            } else if (
                forecast <= config.stockBuyUnder_Short &&
                !this.shares.has(company.name)
            ) {
                action = "short"
            }

            // Check sell thresholds
            const currentShares = this.shares.get(company.name) || 0
            if (
                (currentShares > 0 && forecast < config.sellThreshold_Long) ||
                (currentShares < 0 && forecast > config.sellThreshold_Short)
            ) {
                return "sell_all"
            }

            return action
        }
    }

    class OrderManager {
        constructor(ns, stockMgr) {
            this.ns = ns
            this.stockMgr = stockMgr
            this.openOrders = new Map()
        }

        async sellAllShares() {
            for (const [company, shares] of this.stockMgr.shares.entries()) {
                if (shares > 0 && (await this.ns.stock.hasShares(company))) {
                    const sold = await this.ns.stock.sellShare(company)
                    if (sold) ns.toast.create(`${company}: Sold ${sold} shares`)
                }
            }
        }

        async createStopLoss(orderData) {
            // Implement stop loss logic here
        }
    }

    const stockMgr = new StockManager(ns)
    const orderMgr = new OrderManager(ns, stockMgr)

    while (true) {
        await ns.sleep(config.scriptTimer)

        try {
            const companies = await ns.stock.getCompanies()

            for (const company of companies) {
                if (!stockMgr.isPublicCompany(company)) continue

                const priceData = ns.stock.getPrice(company)

                // Get current holdings
                let sharesHeld = stockMgr.shares.get(company.name) || 0

                // Process orders and update positions
                const action = await stockMgr.decideAction(company, priceData)

                if (action === "buy") {
                    if (
                        sharesHeld < config.maxSharePercent &&
                        ns.money > ns.stock.getPrice(company)
                    ) {
                        orderMgr.createOrder({
                            type: "buy",
                            company,
                            amount: Math.min(
                                config.maxSharePercent,
                                100 - sharesHeld
                            ),
                        })
                    }
                } else if (action === "short") {
                    // Implement short selling logic
                } else if (action === "sell_all") {
                    orderMgr.sellAllShares()
                }
            }
        } catch (error) {
            ns.toast.create(`Error: ${error.message}`, {
                duration: toastConfig.duration,
            })
        }
    }
}
