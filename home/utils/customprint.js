//! Script location home/utils/customprint.js

import {
    maxLineLength
} from "../minify/pasteme.js"

/**
 * Prints a horizontal line split with customizable borders and character.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {boolean} terminal - If true, use tprint; otherwise, use print.
 * @param {number} max - Maximum length of the line (default: 50).
 * @param {string} char - Character used for the line (default: '─').
 * @param {string} prefix - Prefix for the line (default: '├').
 * @param {string} suffix - Suffix for the line (default: '┤').
 */
export function linesplit(ns, terminal = false, max = maxLineLength, char = "─", prefix = "├", suffix = "┤") {
    let maxLines = Math.max(max, this.minLineLength) // Ensure a minimum line length
    maxLines -= (prefix.length + suffix.length) // Adjust for prefix and suffix

    const line = char.repeat(maxLines)
    const lineSplit = prefix + line + suffix

    if (terminal) {
        ns.tprint(lineSplit)
    } else {
        ns.print(lineSplit)
    }
}

/**
 * Prints a horizontal line split with customizable borders and character.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {boolean} terminal - If true, use tprint; otherwise, use print.
 * @param {number} max - Maximum length of the line (default: 50).
 * @param {string} char - Character used for the line (default: '─').
 * @param {string} prefix - Prefix for the line (default: '├').
 * @param {string} suffix - Suffix for the line (default: '┤').
 */
export function linesplitMiddle(ns, terminal = false, max = maxLineLength, char = "─", prefix = "├", suffix = "┤") {
    linesplit(ns, terminal, max, char, prefix, suffix)
}

/**
 * Prints a horizontal line split with customizable borders and character.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {boolean} terminal - If true, use tprint; otherwise, use print.
 * @param {number} max - Maximum length of the line (default: 50).
 * @param {string} char - Character used for the line (default: '─').
 * @param {string} prefix - Prefix for the line (default: '┌').
 * @param {string} suffix - Suffix for the line (default: '┐').
 */
export function linesplitTop(ns, terminal = false, max = maxLineLength, char = "─", prefix = "┌", suffix = "┐") {
    linesplit(ns, terminal, max, char, prefix, suffix)
}

/**
 * Prints a horizontal line split with customizable borders and character.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {boolean} terminal - If true, use tprint; otherwise, use print.
 * @param {number} max - Maximum length of the line (default: 50).
 * @param {string} char - Character used for the line (default: '─').
 * @param {string} prefix - Prefix for the line (default: '└').
 * @param {string} suffix - Suffix for the line (default: '┘').
 */
export function linesplitBottom(ns, terminal = false, max = maxLineLength, char = "─", prefix = "└", suffix = "┘") {
    linesplit(ns, terminal, max, char, prefix, suffix)
}

/**
 * Prints text with a border, wrapping to new lines if it exceeds the max length.
 * Each line is padded with spaces to ensure the suffix aligns at the specified max position.
 * Entire words are moved to a new line if they exceed the limit.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {string[]} args - Array of strings to print.
 * @param {boolean} terminal - If true, use tprint; otherwise, use print.
 * @param {number} max - Maximum width of the text (default: 50).
 * @param {string} prefix - Prefix for each line (default: '│').
 * @param {string} suffix - Suffix for each line (default: '│').
 */
export function cprint(ns, args, terminal = false, max = maxLineLength, prefix = "│", suffix = "│") {
    let maxLines = Math.max(max, maxLineLength) // Ensure minimum length
    maxLines -= (prefix.length + suffix.length) // Adjust for prefix and suffix

    args = [args] // Ensure args is an array
    const words = args.join(' ').split(' ') // Split text into words
    let currentLine = ''

    for (const word of words) {
        if ((currentLine + word).length > maxLines) {
            // Print the current line and reset
            const paddedLine = currentLine.padEnd(maxLines, ' ')
            const lineSplit = prefix + paddedLine + suffix
            if (terminal) {
                ns.tprint(lineSplit)
            } else {
                ns.print(lineSplit)
            }
            currentLine = ''
        }
        currentLine += (currentLine.length > 0 ? ' ' : '') + word
    }

    // Print any remaining text
    if (currentLine.length > 0) {
        const paddedLine = currentLine.padEnd(maxLines, ' ')
        const lineSplit = prefix + paddedLine + suffix
        if (terminal) {
            ns.tprint(lineSplit)
        } else {
            ns.print(lineSplit)
        }
    }
}

/**
 * Shortcut for terminal printing with wrapping.
 *
 * @param {NS} ns - Bitburner NS object.
 * @param {string[]} args - Array of strings to print.
 * @param {number} max - Maximum width of the text (default: 50).
 */
export function tcprint(ns, args, max = maxLineLength) {
    cprint(ns, args, true, max)
}

export class CustomPrint {
    static PRESETS = {
        single: {
            middleChar: '─',
            topChar: '─',
            bottomChar: '─',
            middlePrefix: '├',
            middleSuffix: '┤',
            topPrefix: '┌',
            topSuffix: '┐',
            bottomPrefix: '└',
            bottomSuffix: '┘',
            printPrefix: '│',
            printSuffix: '│'
        },
        double: {
            middleChar: '═',
            topChar: '═',
            bottomChar: '═',
            middlePrefix: '╠',
            middleSuffix: '╣',
            topPrefix: '╔',
            topSuffix: '╗',
            bottomPrefix: '╚',
            bottomSuffix: '╝',
            printPrefix: '║',
            printSuffix: '║'
        },
        mixed: {
            middleChar: '─',
            topChar: '═',
            bottomChar: '═',
            middlePrefix: '╞',
            middleSuffix: '╡',
            topPrefix: '╒',
            topSuffix: '╕',
            bottomPrefix: '╘',
            bottomSuffix: '╛',
            printPrefix: '│',
            printSuffix: '│'
        },
        thickThin: {
            middleChar: '─',
            topChar: '─',
            bottomChar: '─',
            middlePrefix: '╟',
            middleSuffix: '╢',
            topPrefix: '╓',
            topSuffix: '╖',
            bottomPrefix: '╙',
            bottomSuffix: '╜',
            printPrefix: '║',
            printSuffix: '║'
        }
    }

    /**
     * Initializes the CustomPrint class with a Bitburner NS object and optional default values.
     * @param {NS} ns - Bitburner NS object.
     * @param {number} [max=50] - Default maximum length of the line (default: 50).
     * @param {PRESETS} preset 
     */
    constructor(ns, max = 50, preset = 'single') {
        this.ns = ns
        this.minLineLength = 10
        this.maxLineLength = Math.max(max, this.minLineLength)

        this.setPreset(preset)
    }

    /**
     * Get's the border and character preset for the CustomPrint class
     * @param {any} preset - The preset to get the config
     * @returns {CustomPrint.PRESETS}
     */
    getConfig(preset) {
        if (preset === typeof CustomPrint.PRESETS) {
            return preset
        }
        if (preset in CustomPrint.PRESETS) {
            return CustomPrint.PRESETS[preset]
        }
        return CustomPrint.PRESETS.single
    }
    /**
     * Set's the border and character preset for the CustomPrint class
     * @param {PRESETS} preset 
     */
    setPreset(preset) {
        const config = getConfig(preset)

        this.middleChar = config.middleChar
        this.topChar = config.topChar
        this.bottomChar = config.bottomChar
        this.middlePrefix = config.middlePrefix
        this.middleSuffix = config.middleSuffix
        this.topPrefix = config.topPrefix
        this.topSuffix = config.topSuffix
        this.bottomPrefix = config.bottomPrefix
        this.bottomSuffix = config.bottomSuffix
        this.printPrefix = config.printPrefix
        this.printSuffix = config.printSuffix
    }

    /**
     * Prints a horizontal line split with customizable borders and character.
     *
     * @param {boolean} terminal - If true, use tprint; otherwise, use print.
     * @param {number} [max] - Maximum length of the line (default: this.maxLineLength).
     * @param {string} [char='─'] - Character used for the line (default: '─').
     * @param {string} [prefix='├'] - Prefix for the line (default: '├').
     * @param {string} [suffix='┤'] - Suffix for the line (default: '┤').
     */
    linesplit(terminal = false, max = this.maxLineLength, char = "─", prefix = "├", suffix = "┤") {
        let maxLines = Math.max(max, this.minLineLength) - (prefix.length + suffix.length)
        const line = char.repeat(maxLines)
        const lineSplit = prefix + line + suffix

        terminal ? this.ns.tprint(lineSplit) : this.ns.print(lineSplit)
    }

    /**
     * Prints a horizontal line split with customizable borders and character.
     *
     * @param {boolean} terminal - If true, use tprint; otherwise, use print.
     */
    linesplitMiddle(terminal = false) {
        this.linesplit(terminal, this.maxLineLength, this.middleChar, this.middlePrefix, this.middleSuffix)
    }

    /**
     * Prints a horizontal line split with customizable borders and character.
     *
     * @param {boolean} terminal - If true, use tprint; otherwise, use print.
     */
    linesplitTop(terminal = false) {
        this.linesplit(terminal, this.maxLineLength, this.topChar, this.topPrefix, this.topSuffix)
    }

    /**
     * Prints a horizontal line split with customizable borders and character.
     *
     * @param {boolean} terminal - If true, use tprint; otherwise, use print.
     */
    linesplitBottom(terminal = false) {
        this.linesplit(terminal, this.maxLineLength, this.bottomChar, this.bottomPrefix, this.bottomSuffix)
    }

    /**
     * Prints text with a border, wrapping to new lines if it exceeds the max length.
     * Each line is padded with spaces to ensure the suffix aligns at the specified max position.
     * Entire words are moved to a new line if they exceed the limit.
     *
     * @param {string[]} args - Array of strings to print.
     * @param {boolean} terminal - If true, use tprint; otherwise, use print.
     * @param {number} [max] - Maximum width of the text (default: this.maxLineLength).
     * @param {string} [prefix='│'] - Prefix for each line (default: '│').
     * @param {string} [suffix='│'] - Suffix for each line (default: '│').
     */
    cprint(args, terminal = false, max = this.maxLineLength) {
        let prefix = this.printPrefix
        let suffix = this.printSuffix
        let maxLines = Math.max(max, this.minLineLength) - (prefix.length + suffix.length)

        if (!Array.isArray(args)) args = [args]
        const words = args.join(' ').split(' ')
        let currentLine = ''

        for (const word of words) {
            if ((currentLine + word).length > maxLines) {
                const paddedLine = currentLine.padEnd(maxLines, ' ')
                terminal ? this.ns.tprint(prefix + paddedLine + suffix) : this.ns.print(prefix + paddedLine + suffix)
                currentLine = ''
            }
            currentLine += (currentLine.length > 0 ? ' ' : '') + word
        }

        if (currentLine.length > 0) {
            const paddedLine = currentLine.padEnd(maxLines, ' ')
            terminal ? this.ns.tprint(prefix + paddedLine + suffix) : this.ns.print(prefix + paddedLine + suffix)
        }
    }

    /**
     * Shortcut for terminal printing with wrapping.
     *
     * @param {string[]} args - Array of strings to print.
     */
    tcprint(args) {
        this.cprint(args, true)
    }
}