/**
 * 
 * CONTRACT 455313: FoodNStuff
 * 
 * Shortest Path in a Grid
 * You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.
 * 
 * 
 * You are located in the top-left corner of the following grid:
 * 
 *   [[0,0,0,0,0,0,0,0,0,0,0],
 *    [0,0,0,0,0,0,0,0,1,0,0],
 *    [0,0,0,0,1,1,1,0,0,0,1],
 *    [0,0,0,0,1,0,1,0,1,0,0],
 *    [0,1,1,0,0,0,0,1,0,1,0],
 *    [0,1,1,0,0,0,1,0,0,0,1],
 *    [0,1,1,1,0,1,1,0,1,0,0],
 *    [1,0,1,0,0,0,0,0,0,0,0],
 *    [0,0,1,0,1,0,0,0,0,0,0],
 *    [1,0,0,0,1,0,0,0,0,1,1],
 *    [0,1,0,0,1,0,0,0,0,0,0]]
 * 
 * You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.
 * 
 * Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path
 * 
 * NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
 * NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
 * 
 * Examples:
 * 
 *     [[0,1,0,0,0],
 *      [0,0,0,1,0]]
 * 
 * Answer: 'DRRURRD'
 * 
 *     [[0,1],
 *      [1,0]]
 * 
 * Answer: ''
 * 
 * 
 * If your solution is an empty string, you must leave the text box empty. Do not use "", '', or ``.
 */
export function findShortestPath(grid) {
    const rows = grid.length
    const cols = grid[0].length
    const directions = [
        [0, 1, 'R'], // Right
        [1, 0, 'D'], // Down
        [0, -1, 'L'], // Left
        [-1, 0, 'U'] // Up
    ]

    // Check if start or end points are blocked
    if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) {
        return ''
    }

    const queue = [
        [0, 0, '']
    ]
    const visited = new Set()
    visited.add(`0,0`)

    while (queue.length > 0) {
        const [x, y, path] = queue.shift()

        // Check if we've reached the bottom-right corner
        if (x === rows - 1 && y === cols - 1) {
            return path
        }

        for (const [dx, dy, move] of directions) {
            const newX = x + dx
            const newY = y + dy

            if (
                newX >= 0 && newX < rows &&
                newY >= 0 && newY < cols &&
                grid[newX][newY] === 0 &&
                !visited.has(`${newX},${newY}`)
            ) {
                queue.push([newX, newY, path + move])
                visited.add(`${newX},${newY}`)
            }
        }
    }

    return '' // No path exists
}

// Example usage
const grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]
]

console.log(findShortestPath(grid)) // Output: Path as a string, e.g., 'DRRRDD...'