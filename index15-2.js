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
                    case -2:
                        line += '*'
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
                    console.log(oxygenFill(oxX, oxY))
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

    function oxygenFill(x1, y1)
    {
        let boundary = []

        boundary.push({
            x: x1,
            y: y1
        })

        let step = 0
        while (boundary.length > 0) {
            ++step

            for (let b of boundary) {
                const x = b.x
                const y = b.y

                dungeon[y][x] = -2
            }

            const newBoundary = []
            for (let b of boundary) {
                const x = b.x
                const y = b.y

                if (dungeon[y - 1][x] == 1) {
                    newBoundary.push({
                        x,
                        y: y - 1
                    })
                }
                if (dungeon[y][x + 1] == 1) {
                    newBoundary.push({
                        x: x + 1,
                        y
                    })
                }
                if (dungeon[y + 1][x] == 1) {
                    newBoundary.push({
                        x,
                        y: y + 1
                    })
                }
                if (dungeon[y][x - 1] == 1) {
                    newBoundary.push({
                        x: x - 1,
                        y
                    })
                }
            }

            boundary = newBoundary

            // drawDungeon()
        }

        return step
    }

}