// Constants
const scriptTimer = 6000 // Time script waits between checks (ms)
const moneyKeep = 100000 // Minimum money to keep before investing

// Trading Conditions
const stockBuyOver_Long = 75 // Buy long if forecast is above this percentage
const stockBuyUnder_Short = -25 // Buy short if forecast is below this percentage
const stockVolatility = 1.5 // Maximum allowed volatility for trading (adjust as needed)

// Variables to track portfolio and performance
let currentStocks = {} // Track owned stocks
let totalInvested = 0
let profitLoss = 0

/**
 * @param {NS} ns 
 */
export async function main(ns) {
    try {
        while (true) { // Infinite loop based on scriptTimer

            // Check if we have enough money to keep as per failsafe
            const currentMoney = await ns.getAccount()
            if (currentMoney < moneyKeep) {
                ns.toast(`Failsafe: Current balance below ${moneyKeep}.`, 'error')
                break
            }

            // Get all available stocks data from Bitburner's API
            const stockData = await getStocks()

            for (const sym in stockData) {
                if (!stockData[sym]) continue

                const stock = stockData[sym]

                // Check conditions for buying long or short based on forecast and volatility
                if ((stock.forecast > stockBuyOver_Long || stock.forecast < stockBuyUnder_Short)) {
                    if (Math.abs(stock.volatility) <= stockVolatility) {
                        evaluateTrade(sym, stock)
                    }
                }

            }

            await new Promise(resolve => setTimeout(resolve, scriptTimer))
        }
    } catch (error) {
        ns.toast(`Error in main loop: ${error.message}`, 'error')
        ns.exit() // Terminate the script
    }
}

// Function to get all available stocks data from Bitburner's API
async function getStocks() {
    try {
        const stockData = {}
        for (let i = 1; i <= 20; i++) { // Assuming up to 20 stocks are available
            const sym = `STOCK${i}`
            const data = await ns.tix.getBonusTime(sym)
            if (!data) continue

            stockData[sym] = {
                symbol: sym,
                price: data.price,
                forecast: data.forecast,
                volatility: data.volatility
            }
        }
        return stockData
    } catch (error) {
        ns.toast(`Failed to get stocks data: ${error.message}`, 'warning')
        return {}
    }
}

// Function to evaluate and execute trades based on conditions
async function evaluateTrade(sym, stock) {
    try {
        const currentPrice = await ns.tix.getBidPrice(sym)

        if (currentStocks[sym]) {
            // Already holding this stock check for exit condition or add more logic here
            return
        }

        let tradeAmount

        if (stock.forecast > stockBuyOver_Long) {
            // Buy Long Condition
            const investment = Math.min(moneyKeep, ns.getAccount() - moneyKeep)
            tradeAmount = investment / currentPrice
            await ns.tix.buy(sym, 'long', tradeAmount)

            totalInvested += investment
            profitLoss -= (currentPrice * tradeAmount) // Track PnL
        } else if (stock.forecast < stockBuyUnder_Short) {
            // Buy Short Condition
            const investment = Math.min(moneyKeep, ns.getAccount() - moneyKeep)
            tradeAmount = investment / currentPrice
            await ns.tix.buy(sym, 'short', tradeAmount)

            totalInvested += investment
            profitLoss -= (currentPrice * tradeAmount) // Track PnL
        }

        updatePortfolio() // Update portfolio display

    } catch (error) {
        ns.toast(`Trade failed for ${sym}: ${error.message}`, 'warning')
    }
}

// Function to update and display the current portfolio status
function updatePortfolio() {
    const totalValue = Object.values(currentStocks).reduce((acc, stock) =>
        acc + (stock.position * stock.price), 0)

    ns.toast(`Portfolio Update:
    Total Invested: ${totalInvested}
    Current Value: ${totalValue}
    Profit/Loss: ${profitLoss}`, 'info')
}

// Initial portfolio setup
export async function init() {
    try {
        currentStocks = await getStocks()
        updatePortfolio()

    } catch (error) {
        ns.toast(`Initialization failed: ${error.message}`, 'error')
        ns.exit()
    }
}