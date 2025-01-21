/**
 * CONTRACT 21629: Darkweb
 * 
 * Find All Valid Math Expressions
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * 
 * You are given the following string which contains only digits between 0 and 9:
 * 
 * 4689531
 * 
 * You are also given a target number of -11. Return all possible ways you can add the +(add), -(subtract), and *(multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)
 * 
 * The provided answer should be an array of strings containing the valid expressions. The data provided by this problem is an array with two elements. The first element is the string of digits, while the second element is the target number:
 * 
 * ["4689531", -11]
 * 
 * NOTE: The order of evaluation expects script operator precedence.
 * NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression.
 * 
 * Examples:
 * 
 * Input: digits = "123", target = 6
 * Output: ["1+2+3", "1*2*3"]
 * 
 * Input: digits = "105", target = 5
 * Output: ["1*0+5", "10-5"]
 * 
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */

/**
 * Finds all valid math expressions that evaluate to the target.
 *
 * @param {string} digits - String of digits to form expressions.
 * @param {number} target - Target number to evaluate.
 * @return {string[]} - Array of valid expressions that evaluate to the target.
 */
export function findAllValidMathExpressions(digits, target) {
    const results = [] // Store all valid expressions

    /**
     * Recursive backtracking function to explore all possibilities.
     *
     * @param {number} index - Current index in the digits string.
     * @param {string} path - Current expression being formed.
     * @param {number} value - Cumulative value of the current expression.
     * @param {number} prev - The value of the last operand for handling multiplication precedence.
     */
    function backtrack(index, path, value, prev) {
        // Base case: If we've processed all digits
        if (index === digits.length) {
            // Check if the current expression evaluates to the target
            if (value === target) {
                results.push(path) // Add the valid expression to the results
            }
            return
        }

        // Explore all substrings starting from the current index
        for (let i = index; i < digits.length; i++) {
            // Skip invalid numbers with leading zeros
            if (i > index && digits[index] === '0') break

            // Extract the current number from the substring
            const current = parseInt(digits.slice(index, i + 1))

            if (index === 0) {
                // First number in the expression, initialize the path and values
                backtrack(i + 1, `${current}`, current, current)
            } else {
                // Add '+' operator: Update the cumulative value and path
                backtrack(i + 1, `${path}+${current}`, value + current, current)

                // Add '-' operator: Subtract the current number from the cumulative value
                backtrack(i + 1, `${path}-${current}`, value - current, -current)

                // Add '*' operator: Adjust for multiplication precedence
                // Remove the last operand (prev) from the value and add the product of prev and current
                backtrack(i + 1, `${path}*${current}`, value - prev + prev * current, prev * current)
            }
        }
    }

    // Start the backtracking with initial values
    backtrack(0, '', 0, 0)

    return results // Return all valid expressions
}

// Example usage
const input = ["4689531", -11]
console.log(findAllValidMathExpressions(input[0], input[1]))