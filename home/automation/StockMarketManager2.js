import CustomPrint from '../utils/customprint.js'

/** @param {NS} ns */
export class StockExchangeManager {
    constructor(ns) {
        this.ns = ns
        this.scriptTimer = 2000
        this.moneyKeep = 1000000000
        this.stockBuyOver_Long = 0.60
        this.stockBuyUnder_Short = 0.40
        this.stockVolatility = 0.05
        this.minSharePercent = 5
        this.maxSharePercent = 1.00
        this.sellThreshold_Long = 0.55
        this.sellThreshold_Short = 0.40
        this.shortUnlock = false
        this.runScript = true
        this.toastDuration = 15000

        // Notation formats
        this.extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30]
        this.extraNotations = ["q", "Q", "s", "S", "o", "n"]
        this.decimalPlaces = 3

        this.customPrint = new CustomPrint(this.ns, 60)
    }

    async run() {
        while (this.runScript) {
            const orderedStocks = this.ns.stock.getSymbols().sort((a, b) =>
                Math.abs(0.5 - this.ns.stock.getForecast(b)) - Math.abs(0.5 - this.ns.stock.getForecast(a))
            )
            let currentWorth = 0

            this.ns.clearLog()
            this.customPrint.linesplitTop()
            this.customPrint.cprint("Stock Exchange Manager")
            this.customPrint.linesplitMiddle()

            for (const stock of orderedStocks) {
                const position = this.ns.stock.getPosition(stock)

                if (position[0] > 0 || position[2] > 0) {
                    this.sellIfOutsideThreshold(stock)
                }

                this.buyPositions(stock)
                currentWorth += this.calculateProfit(position, stock)
            }

            // Print final status
            this.ns.print("Current Stock Worth: " + this.formatReallyBigNumber(currentWorth))
            this.ns.print("Current Net Worth:  " + this.formatReallyBigNumber(currentWorth + this.ns.getPlayer().money))
            this.ns.print(new Date().toLocaleTimeString() + " - Running...")

            await this.ns.sleep(this.scriptTimer)
        }
    }

    buyPositions(stock) {
        const [position, askPrice, forecast, volatilityPercent] = [
            this.ns.stock.getPosition(stock),
            this.ns.stock.getAskPrice(stock),
            this.ns.stock.getForecast(stock),
            this.ns.stock.getVolatility(stock)
        ]
        const playerMoney = this.ns.getPlayer().money

        // Buy Long
        if (forecast >= this.stockBuyOver_Long && volatilityPercent <= this.stockVolatility) {
            const shares = Math.min((playerMoney - this.moneyKeep - 100000) / askPrice,
                (this.ns.stock.getMaxShares(stock) * this.maxSharePercent) - position[0]
            )

            if (shares > 0) {
                this.ns.stock.buyStock(stock, shares)
                this.ns.toast(`Bought ${shares} Long shares of ${stock} for ${this.formatReallyBigNumber(shares * askPrice)}`, 'success', 15000)
            }
        }

        // Buy Short
        if (this.shortUnlock && forecast <= this.stockBuyUnder_Short && volatilityPercent <= this.stockVolatility) {
            const shares = Math.min((playerMoney - this.moneyKeep - 100000) / askPrice,
                (this.ns.stock.getMaxShares(stock) * this.maxSharePercent) - position[2]
            )

            if (shares > 0) {
                this.ns.stock.buyShort(stock, shares)
                this.ns.toast(`Bought ${shares} Short shares of ${stock} for ${this.formatReallyBigNumber(shares * askPrice)}`, 'success', 15000)
            }
        }
    }

    sellIfOutsideThreshold(stock) {
        const position = this.ns.stock.getPosition(stock)
        const forecast = this.ns.stock.getForecast(stock)

        if (position[0] > 0) {
            const threshold = this.sellThreshold_Long
            const profit = position[0] * (this.ns.stock.getBidPrice(stock) - position[1]) - 200000

            if (forecast < threshold) {
                this.ns.stock.sellStock(stock, position[0])
                this.ns.toast(`Sold ${position[0]} Long shares of ${stock} for ${this.formatReallyBigNumber(position[0] * this.ns.stock.getBidPrice(stock))}`, 'success', 15000)
            }
        }

        if (position[2] > 0 && this.shortUnlock) {
            const threshold = this.sellThreshold_Short
            const profit = position[2] * Math.abs(this.ns.stock.getBidPrice(stock) - position[3]) - 200000

            if (forecast > threshold) {
                this.ns.stock.sellShort(stock, position[2])
                this.ns.toast(`Sold ${position[2]} Short shares of ${stock} for ${this.formatReallyBigNumber(position[2] * this.ns.stock.getBidPrice(stock))}`, 'success', 15000)
            }
        }
    }

    calculateProfitLoss(stock) {
        const position = this.ns.stock.getPosition(stock)
        const bidPrice = this.ns.stock.getBidPrice(stock)

        return {
            longProfit: position[0] * (bidPrice - position[1]) - 200000,
            shortProfit: position[2] * Math.abs(bidPrice - position[3]) - 200000
        }
    }

    formatReallyBigNumber(number) {
        if (number === Infinity) return "∞"

        const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30]
        const extraNotations = ["q", "Q", "s", "S", "o", "n"]

        for (let i = 0; i < extraFormats.length; i++) {
            if (number >= extraFormats[i] && number < extraFormats[i] * 1000) {
                const scaledNumber = number / extraFormats[i]
                return this.format(scaledNumber, "0." + "0".repeat(decimalPlaces)) + extraNotations[i]
            }
        }

        if (Math.abs(number) < 1000) {
            return this.format(number, "0." + "0".repeat(decimalPlaces))
        }

        const str = this.format(number, "0." + "0".repeat(decimalPlaces) + "a")

        if (str === "NaN") return this.format(number, "0." + " ".repeat(decimalPlaces) + "e+0")

        return str
    }

    format(number, pattern) {
        try {
            const formatter = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            })
            return formatter.format(number)
        } catch (e) {
            return number.toString()
        }
    }

    // Helper functions for printing
    printLine() {
        this.linesplitBottom(this.ns, true, maxLineLength)
    }

    printTitle(text) {
        const lines = text.split('\n')

        this.linesplitTop(this.ns, true, maxLineLength)
        for (const line of lines) {
            this.tcprint(line)
        }
        this.linesplitBottom(this.ns, true, maxLineLength)
    }

    // Print current stock portfolio
    printStocks() {
        const stocks = this.ns.stock.getSymbols()

        if (stocks.length === 0) return

        for (const stock of stocks) {
            const position = this.ns.stock.getPosition(stock)
            const forecast = this.ns.stock.getForecast(stock).toFixed(2)

            this.linesplitTop(this.ns, true, maxLineLength)
            this.ns.print(`${stock}:`)
            this.ns.print(`Long: ${position[0]}, Price: ${position[1]}`)
            this.ns.print(`Short: ${position[2]}, Price: ${position[3]}`)
            this.ns.print(`Forecast: ${forecast}%`)
            this.linesplitBottom(this.ns, true, maxLineLength)
        }
    }

    // Print current net worth and stock portfolio
    printSummary() {
        const currentWorth = this.ns.stock.getStockValue()
        const netWorth = currentWorth + this.ns.getPlayer().money

        this.printTitle([
            `Current Stock Worth: ${this.formatReallyBigNumber(currentWorth)}`
            `Net Worth: ${this.formatReallyBigNumber(netWorth)}`
            `Time: ${new Date().toLocaleTimeString()}`
        ].join('\n'))
    }
}