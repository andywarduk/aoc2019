const fs = require('fs')
const path = require('path')

main(0)

function main(mapNo)
{
    const map = getMap(mapNo)

    const portals = processMap(map)

    walk(map, portals)
}

function processMap(map)
{
    const portals = {}

    // Split in to chars
    map = map.map(e => e.split(""))

    function findEdge(xAdd, yAdd, inner)
    {
        let x
        let y

        if (xAdd != 0) {
            y = Math.floor(map.length / 2)
            if (inner) {
                x = Math.floor(map[0].length / 2)
            } else {
                x = (xAdd > 0 ? 0 : map[0].length - 1)
            }
        } else {
            x = Math.floor(map[0].length / 2)
            if (inner) {
                y = Math.floor(map.length / 2)
            } else {
                y = (yAdd > 0 ? 0 : map.length - 1)
            }
        }

        while (map[y][x] != '.' && map[y][x] != '#') {
            x += xAdd
            y += yAdd
        }

        return (xAdd != 0 ? x : y)
    }

    function addPortal(inX, inY, outX, outY, xAdd, yAdd)
    {
        let char1 = map[outY][outX]
        let char2 = map[outY + yAdd][outX + xAdd]

        let portal
        if (xAdd < 0 || yAdd < 0) {
            portal = char2 + char1
        } else {
            portal = char1 + char2
        }

        const route = {
            inX,
            inY,
            outX,
            outY
        }

        console.log(`  ${portal} in at ${inX},${inY} out at ${outX},${outY}`)

        if (portals[portal] === undefined) {
            portals[portal] = {
                routes: [route]
            }
        } else {
            portals[portal].routes.push(route)
        }
    }

    function findPortals(l, t, r, b, add)
    {
        let x
        let y

        // Top edge
        y = t + add
        for (x = l + add; x <= r - add; x++) {
            if (map[y][x] != ' ') {
                addPortal(x, y - add, x, y, 0, add)
            }
        }

        // Right edge
        x = r - add
        for (y = t + add; y <= b - add; y++) {
            if (map[y][x] != ' ') {
                addPortal(x + add, y, x, y, -add, 0)
            }
        }

        // Bottom edge
        y = b - add
        for (x = l + add; x <= r - add; x++) {
            if (map[y][x] != ' ') {
                addPortal(x, y + add, x, y, 0, -add)
            }
        }

        // Left edge
        x = l + add
        for (y = t + add; y <= b - add; y++) {
            if (map[y][x] != ' ') {
                addPortal(x - add, y, x, y, add, 0)
            }
        }
    }

    // Get dimensions
    const ol = findEdge(1, 0, false)
    const ot = findEdge(0, 1, false)
    const or = findEdge(-1, 0, false)
    const ob = findEdge(0, -1, false)

    const il = findEdge(-1, 0, true)
    const it = findEdge(0, -1, true)
    const ir = findEdge(1, 0, true)
    const ib = findEdge(0, 1, true)

    console.log("Outside portals:")
    findPortals(ol, ot, or, ob, -1)
    console.log("Inside portals:")
    findPortals(il, it, ir, ib, 1)

    return portals
}

function walk(map, portals)
{
    let fronts

    let dists = []

    // Initialise distance array
    for (let y = 0; y < map.length; y++) {
        dists[y] = []
        for (let x = 0; x < map[y].length; x++) {
            dists[y][x] = -1
        }
    }

    fronts = [[portals['AA'].routes[0].inX, portals['AA'].routes[0].inY]]

    // Walk the maze
    function newFront(x, y, curDist, nextFronts)
    {
        while (true) {
            if (map[y][x] == '#') {
                // Wall
                return
            }

            if (map[y][x] != '.') {
                // Handle portal
                let portal = findPortal(x, y)
                if (portal.inRoute == null) {
                    // Either in or out
                    switch (portal.name) {
                    case 'AA':
                        // Skip
                        return
                    case 'ZZ':
                        // Finished
                        console.log(`Distance to ZZ: ${curDist}`)
                        return
                    default:
                        // Unexpected
                        console.error("No in route for portal")
                        process.exit()
                    }
                }

                x = portal.inRoute.inX
                y = portal.inRoute.inY

                continue
            }

            if (dists[y][x] != -1 && dists[y][x] <= curDist) {
                // Another front got here earlier
                return
            }

            break
        }

        dists[y][x] = curDist
        nextFronts.push([x, y])
    }

    let curDist = 0
    while (fronts.length > 0) {
        const nextFronts = []

        for (let f of fronts) {
            let x = f[0]
            let y = f[1]

            newFront(x, y + 1, curDist, nextFronts)
            newFront(x + 1, y, curDist, nextFronts)
            newFront(x, y - 1, curDist, nextFronts)
            newFront(x - 1, y, curDist, nextFronts)
        }

        fronts = nextFronts
        ++curDist
    }

    function findPortal(x, y)
    {
        let res = null

        for (let p of Object.keys(portals)) {
            for (let rn in portals[p].routes) {
                rn = parseInt(rn)
                const r = portals[p].routes[rn]

                if (r.outX == x && r.outY == y) {
                    let inRoute = null
                    if (rn == 0) {
                        if (portals[p].routes.length > 1) inRoute =  portals[p].routes[1]
                    } else {
                        inRoute = portals[p].routes[0]
                    }

                    res = {
                        name: p,
                        portal: portals[p],
                        outRoute: r,
                        inRoute
                    }

                    break
                }
            }
            if (res) break
        }

        return res
    }

}

function getMap(mapNo)
{
    let input
    let map

    switch (mapNo) {
    case 0:
        // Load input
        input = fs.readFileSync(path.join(__dirname, 'input20.txt'), {encoding: 'utf8'})

        // Break in to lines
        map = input.split('\n').filter(e => e != '')

        break

    case 1:
        // Example 1
        map = [
            '         A           ',
            '         A           ',
            '  #######.#########  ',
            '  #######.........#  ',
            '  #######.#######.#  ',
            '  #######.#######.#  ',
            '  #######.#######.#  ',
            '  #####  B    ###.#  ',
            'BC...##  C    ###.#  ',
            '  ##.##       ###.#  ',
            '  ##...DE  F  ###.#  ',
            '  #####    G  ###.#  ',
            '  #########.#####.#  ',
            'DE..#######...###.#  ',
            '  #.#########.###.#  ',
            'FG..#########.....#  ',
            '  ###########.#####  ',
            '             Z       ',
            '             Z       ',
        ]

        break

    case 2:
        // Example 2
        map = [
            '                   A               ',
            '                   A               ',
            '  #################.#############  ',
            '  #.#...#...................#.#.#  ',
            '  #.#.#.###.###.###.#########.#.#  ',
            '  #.#.#.......#...#.....#.#.#...#  ',
            '  #.#########.###.#####.#.#.###.#  ',
            '  #.............#.#.....#.......#  ',
            '  ###.###########.###.#####.#.#.#  ',
            '  #.....#        A   C    #.#.#.#  ',
            '  #######        S   P    #####.#  ',
            '  #.#...#                 #......VT',
            '  #.#.#.#                 #.#####  ',
            '  #...#.#               YN....#.#  ',
            '  #.###.#                 #####.#  ',
            'DI....#.#                 #.....#  ',
            '  #####.#                 #.###.#  ',
            'ZZ......#               QG....#..AS',
            '  ###.###                 #######  ',
            'JO..#.#.#                 #.....#  ',
            '  #.#.#.#                 ###.#.#  ',
            '  #...#..DI             BU....#..LF',
            '  #####.#                 #.#####  ',
            'YN......#               VT..#....QG',
            '  #.###.#                 #.###.#  ',
            '  #.#...#                 #.....#  ',
            '  ###.###    J L     J    #.#.###  ',
            '  #.....#    O F     P    #.#...#  ',
            '  #.###.#####.#.#####.#####.###.#  ',
            '  #...#.#.#...#.....#.....#.#...#  ',
            '  #.#####.###.###.#.#.#########.#  ',
            '  #...#.#.....#...#.#.#.#.....#.#  ',
            '  #.###.#####.###.###.#.#.#######  ',
            '  #.#.........#...#.............#  ',
            '  #########.###.###.#############  ',
            '           B   J   C               ',
            '           U   P   P               ',
        ]

        break

    }

    return map
}