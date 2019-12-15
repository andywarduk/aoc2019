const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input15.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

explore(mem)

function explore(mem)
{
    let x = 25
    let y = 1
    let startX = x
    let startY = y
    let minX = x
    let maxX = x
    let minY = y
    let maxY = y
    let oxX
    let oxY

    let route = {}

    const dungeon = []
    let dir

    function getLoc(x, y)
    {
        if (dungeon[y] === undefined) {
            dungeon[y] = []
            return -1
        }

        if (dungeon[y][x] === undefined) {
            return -1
        }

        return dungeon[y][x]
    }

    function drawDungeon()
    {
        console.log(`====== ${minX},${minY} -> ${maxX},${maxY}`)
        for (let dy = minY; dy <= maxY; dy++) {
            let line = ''
            for (let dx = minX; dx <= maxX; dx++) {
                if (dx == x && dy == y) {
                    line += 'P'
                } else if (dx == oxX && dy == oxY) {
                    line += 'O'
                } else {
                    switch (dungeon[dy][dx]) {
                    case 0:
                        line += 'W'
                        break
                    case 1:
                        line += '.'
                        break
                    case 2:
                        line += 'O'
                        break
                    default:
                        line += ' '
                        break
                    }
                }
            }
            console.log(line)
        }
        console.log('======')
    }

    dungeon[y] = []
    dungeon[y][x] = 1

    // Execute
    IntCode.exec(false, mem, () => {
        dir = -1
        do {
            if (route.N === undefined && getLoc(x, y - 1) == -1) {
                dir = 1
            } else if (route.E === undefined && getLoc(x + 1, y) == -1) {
                dir = 4
            } else if (route.S === undefined && getLoc(x, y + 1) == -1) {
                dir = 2
            } else if (route.W === undefined && getLoc(x - 1, y) == -1) {
                dir = 3
            } else {
                if (route.parent == undefined) {
                    drawDungeon()
                    console.log(calcDistance(startX, startY, oxX, oxY))
                    process.exit()
                } else {
                    dir = route.parentDir
                }
            }
        } while (dir == -1)

        return dir

    }, (val) => {
        let yAdd
        let xAdd
        let dirName

        switch (dir) {
        case 1:
            xAdd = 0
            yAdd = -1
            dirName = 'N'
            break
        case 4:
            xAdd = 1
            yAdd = 0
            dirName = 'E'
            break
        case 2:
            xAdd = 0
            yAdd = 1
            dirName = 'S'
            break
        case 3:
            xAdd = -1
            yAdd = 0
            dirName = 'W'
            break
        }

        if (val == 2) {
            // Oxygen system
            console.log(`Oxygen system at ${x},${y}`)
            // drawDungeon()
            oxX = x
            oxY = y
            val = 1
        }

        dungeon[y + yAdd][x + xAdd] = val

        switch (val) {
        case 0:
            // Wall
            minX = Math.min(x + xAdd, minX)
            maxX = Math.max(x + xAdd, maxX)
            minY = Math.min(y + yAdd, minY)
            maxY = Math.max(y + yAdd, maxY)
            route[dirName] = 0
            break

        case 1:
            // Open
            x += xAdd
            y += yAdd

            if (x < 0) {
                console.log("Dungeon too small")
                process.exit()
            }

            minX = Math.min(x, minX)
            maxX = Math.max(x, maxX)
            minY = Math.min(y, minY)
            maxY = Math.max(y, maxY)

            if (y == 0) {
                // Extend
                dungeon.unshift([])
                y++
                minY++
                maxY++
                startY++
                oxY++
            }

            if (dir == route.parentDir) {
                route = route.parent
            } else {
                route[dirName] = {}
                route[dirName].parent = route
                switch (dir) {
                case 1:
                    route[dirName].parentDir = 2
                    break
                case 2:
                    route[dirName].parentDir = 1
                    break
                case 3:
                    route[dirName].parentDir = 4
                    break
                case 4:
                    route[dirName].parentDir = 3
                    break
                }
                route = route[dirName]
            }

            break

        }

        // drawDungeon()
    })

    function calcDistance(x1, y1, x2, y2)
    {
        let res

        function walk(x, y, from)
        {
            let res

            if (x == x2 && y == y2) {
                // Found
                return [true, 1]
            }

            if (from != 'S' && dungeon[y - 1][x] == 1) {
                res = walk(x, y - 1, 'N')
                if (res[0]) return [true, res[1] + 1]
            }
            if (from != 'W' && dungeon[y][x + 1] == 1) {
                res = walk(x + 1, y, 'E')
                if (res[0]) return [true, res[1] + 1]
            }
            if (from != 'N' && dungeon[y + 1][x] == 1) {
                res = walk(x, y + 1, 'S')
                if (res[0]) return [true, res[1] + 1]
            }
            if (from != 'E' && dungeon[y][x - 1] == 1) {
                res = walk(x - 1, y, 'W')
                if (res[0]) return [true, res[1] + 1]
            }

            return [false, 0]
        }

        res = walk(x1, y1, ' ')

        if (!res[0]) {
            console.log("Not found!")
            process.exit()
        }

        return res[1]
    }

}