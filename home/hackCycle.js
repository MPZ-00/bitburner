/** @param {NS} ns */
export async function main(ns) {
    const host = ns.args[0] || ns.getHostname()
    while (true) {
        const hackResult = await ns.hack(host)
        if (hackResult > 0) {
            ns.print(`Successfully hacked, gained ${Math.round(hackResult)} money.`)
        }

        for (let i = 0; i < 3; i++) {
            await ns.grow(host)
            ns.print(`Growth attempt ${i + 1} completed`)
        }

        for (let i = 0; i < 2; i++) {
            await ns.weaken(host)
            ns.print(`Weaken attempt ${i + 1} completed`)
        }

        await ns.sleep(500)
    }
}