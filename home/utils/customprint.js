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
    let maxLines = Math.max(max, 10) // Ensure a minimum line length
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

class CustomPrint {
    /**
     * Initializes the CustomPrint class with a Bitburner NS object and optional default values.
     *
     * @param {NS} ns - Bitburner NS object.
     * @param {number} [max=50] - Default maximum length of the line (default: 50).
     * @param {string} [middleChar='─'] - Character used for middle lines (default: '─').
     * @param {string} [topChar='─'] - Character used for top lines (default: '─').
     * @param {string} [bottomChar='─'] - Character used for bottom lines (default: '─').
     * @param {string} [middlePrefix='├'] - Prefix for middle lines (default: '├').
     * @param {string} [middleSuffix='┤'] - Suffix for middle lines (default: '┤').
     * @param {string} [topPrefix='┌'] - Prefix for top lines (default: '┌').
     * @param {string} [topSuffix='┐'] - Suffix for top lines (default: '┐').
     * @param {string} [bottomPrefix='└'] - Prefix for bottom lines (default: '└').
     * @param {string} [bottomSuffix='┘'] - Suffix for bottom lines (default: '┘').
     */
    constructor(ns, max = 50, middleChar = '─', topChar = '─', bottomChar = '─',
        middlePrefix = '├', middleSuffix = '┤', topPrefix = '┌', topSuffix = '┐',
        bottomPrefix = '└', bottomSuffix = '┘') {
        this.ns = ns
        this.maxLineLength = Math.max(max, 10); // Ensure a minimum line length
        this.middleChar = middleChar
        this.topChar = topChar
        this.bottomChar = bottomChar
        this.middlePrefix = middlePrefix
        this.middleSuffix = middleSuffix
        this.topPrefix = topPrefix
        this.topSuffix = topSuffix
        this.bottomPrefix = bottomPrefix
        this.bottomSuffix = bottomSuffix
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
        let maxLines = Math.max(max, 10) // Ensure a minimum line length
        maxLines -= (prefix.length + suffix.length) // Adjust for prefix and suffix

        const line = char.repeat(maxLines)
        const lineSplit = prefix + line + suffix

        if (terminal) {
            this.ns.tprint(lineSplit)
        } else {
            this.ns.print(lineSplit)
        }
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
    cprint(args, terminal = false, max = this.maxLineLength, prefix = "│", suffix = "│") {
        let maxLines = Math.max(max, 10) // Ensure minimum length
        maxLines -= (prefix.length + suffix.length) // Adjust for prefix and suffix

        if (!Array.isArray(args)) args = [args]; // Ensure args is an array
        const words = args.join(' ').split(' ') // Split text into words
        let currentLine = ''

        for (const word of words) {
            if ((currentLine + word).length > maxLines) {
                // Print the current line and reset
                const paddedLine = currentLine.padEnd(maxLines, ' ')
                const lineSplit = prefix + paddedLine + suffix
                if (terminal) {
                    this.ns.tprint(lineSplit)
                } else {
                    this.ns.print(lineSplit)
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
                this.ns.tprint(lineSplit)
            } else {
                this.ns.print(lineSplit)
            }
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

export default CustomPrint