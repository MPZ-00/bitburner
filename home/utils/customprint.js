//! Script location home/utils/customprint.js

import { maxLineLength } from "../minify/pasteme.js"

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