/**
 * CONTRACT
 * 
 * Sanitize Parentheses in Expression
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * 
 * Given the following string:
 * 
 * ())a)()(
 * 
 * remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results. The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.
 * 
 * IMPORTANT: The string may contain letters, not just parentheses.
 * 
 * Examples:
 * 
 * "()())()" -> ["()()()", "(())()"]
 * "(a)())()" -> ["(a)()()", "(a())()"]
 * ")(" -> [""]
 * 
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 *
 * @param {string} s
 * @return {string[]}
 */
export function sanitizeParentheses(s) {
    if (!s) return [""]

    const isValid = (str) => {
        let count = 0
        for (const char of str) {
            if (char === '(') count++
            if (char === ')') count--
            if (count < 0) return false
        }
        return count === 0
    }

    const result = new Set()
    const queue = [s]
    const visited = new Set()
    visited.add(s)
    let found = false

    while (queue.length > 0) {
        const current = queue.shift()

        if (isValid(current)) {
            result.add(current)
            found = true
        }

        if (found) continue

        for (let i = 0; i < current.length; i++) {
            if (current[i] !== '(' && current[i] !== ')') continue

            const next = current.slice(0, i) + current.slice(i + 1)

            if (!visited.has(next)) {
                queue.push(next)
                visited.add(next)
            }
        }
    }

    return Array.from(result)
}

// Example usage
const input = ")()a)()("
console.log(sanitizeParentheses(input))
