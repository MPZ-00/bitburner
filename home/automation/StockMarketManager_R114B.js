/** @param {NS} ns */
export async function main(ns) {
    while (true) {
        await checkStocks()
        await new Promise(resolve => setTimeout(resolve, scriptTimer))
    }
}

async function getForecast(symbol) {
    try {
        const forecast = ns.stock.getForecast(symbol)
        return forecast
    } catch (e) {
        console.log(`Error getting forecast for ${symbol}:`, e.message)
        return null
    }
}

async function checkStocks() {
    try {
        if (ns.money < moneyKeep) return

        let symbols = await ns.stock.getSymbols()
        
        const forecasts = {}
        for (let sym of symbols) {
            forecasts[sym] = await getForecast(sym)
        }

        for (let symbol in forecasts) {
            if (!forecasts.hasOwnProperty(symbol)) continue
            
            const currentPriceAsk = ns.stock.getAskPrice(symbol)
            const currentPriceBid = ns.stock.getBidPrice(symbol)
            const volatility = TIX.getVolatility(symbol); // Assuming this exists
            let sharesLong = ns.stock.getShares(symbol, 'long')
            let sharesShort = ns.stock.getShares(symbol, 'short')

            if (!currentPriceAsk || !currentPriceBid) continue

            const avgPrice = (currentPriceAsk + currentPriceBid) / 2
            
            // Buy Conditions
            if ((forecasts[symbol] > stockBuyOver_Long || 
                forecasts[symbol] < -stockBuyUnder_Short) &&
                volatility <= stockVolatility) {
                
                let maxSharesToBuy = ns.money * (maxSharePercent)
                const sharesPossible = Math.floor(maxSharesToBuy / currentPriceAsk)

                if (forecasts[symbol] > stockBuyOver_Long && !sharesLong) {
                    await buyStock(symbol, 'long', sharesPossible)
                    sendNotification(`Bought ${symbol} Long`)
                } else if (forecasts[symbol] < -stockBuyUnder_Short && shortUnlock && !sharesShort) {
                    await sellStock(symbol, 'short', sharesPossible); // Use appropriate function
                    sendNotification(`Sold Short on ${symbol}`)
                }
            }

            // Sell Conditions
            if ((currentPriceAsk / avgPrice > 1.05 || 
                currentPriceBid / avgPrice < 0.95) ||
                forecasts[symbol] <= sellThreshold_Long ||
                (shortUnlock && forecasts[symbol] >= -sellThreshold_Short)) {
                
                if (sharesLong > minSharePercent) {
                    await sellStock(symbol, 'long', sharesLong)
                    sendNotification(`Sold Long on ${symbol}`)
                }
                if (shortsSharesShort > minSharePercent) { // Adjust as needed
                    await buyStock(symbol, 'short', shortsPossible); // Use appropriate function
                    sendNotification(`Covered Short on ${symbol}`)
                }
            }

        }
    } catch (e) {
        console.log("Error in checkStocks:", e.message)
    }
}

async function handleStocks(symbol, type, shares) {
    try {
        if (!shares || !symbol) return
        
        const price = ns.stock.getAskPrice(type === 'long' ? symbol : `-${symbol}`)
        const totalCost = shares * price

        if (ns.money >= totalCost && maxSharePercent) {
            await buyStock(symbol, type, shares)
            sendNotification(`Handled ${shares}x${symbol} successfully`)
        }
    } catch (e) {
        console.log("Error handling stocks:", e.message)
    }
}

function sendNotification(message) {
    ns.toast(message, 'green', 5000); // Adjust colors and timing as needed
}

async function buyStock(symbol, type, shares) {
    try {
        if (!shares || !symbol) return
        
        const price = ns.stock.getAskPrice(type === 'long' ? symbol : `-${symbol}`)
        await ns.stock.buy(symbol, type, shares)
    } catch (e) {
        console.log("Error buying stock:", e.message)
    }
}

async function sellStock(symbol, type, shares) {
    try {
        if (!shares || !symbol) return
        
        const price = ns.stock.getBidPrice(type === 'long' ? symbol : `-${symbol}`)
        await ns.stock.sell(symbol, type, shares)
    } catch (e) {
        console.log("Error selling stock:", e.message)
    }
}

init()