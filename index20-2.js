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

    function addPortal(inX, inY, outX, outY, xAdd, yAdd, inner)
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
            outY,
            dimAdd: (inner ? 1 : -1)
        }

        // console.log(`  ${portal} in at ${inX},${inY} out at ${outX},${outY} dimension add ${route.dimAdd}`)

        if (portals[portal] === undefined) {
            portals[portal] = {
                routes: [route]
            }
        } else {
            portals[portal].routes.push(route)
        }
    }

    function findPortals(l, t, r, b, add, inner)
    {
        let x
        let y

        // Top edge
        y = t + add
        for (x = l + add; x <= r - add; x++) {
            if (map[y][x] != ' ') {
                addPortal(x, y - add, x, y, 0, add, inner)
            }
        }

        // Right edge
        x = r - add
        for (y = t + add; y <= b - add; y++) {
            if (map[y][x] != ' ') {
                addPortal(x + add, y, x, y, -add, 0, inner)
            }
        }

        // Bottom edge
        y = b - add
        for (x = l + add; x <= r - add; x++) {
            if (map[y][x] != ' ') {
                addPortal(x, y + add, x, y, 0, -add, inner)
            }
        }

        // Left edge
        x = l + add
        for (y = t + add; y <= b - add; y++) {
            if (map[y][x] != ' ') {
                addPortal(x - add, y, x, y, add, 0, inner)
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

    // console.log("Outside portals:")
    findPortals(ol, ot, or, ob, -1, false)
    // console.log("Inside portals:")
    findPortals(il, it, ir, ib, 1, true)

    return portals
}

function walk(map, portals)
{
    let fronts

    let dists = []

    function addDistDim(dim)
    {
        dists[dim] = []

        // Initialise distance array
        for (let y = 0; y < map.length; y++) {
            dists[dim][y] = []
            for (let x = 0; x < map[y].length; x++) {
                dists[dim][y][x] = -1
            }
        }
    }

    addDistDim(0)

    fronts = [[portals['AA'].routes[0].inX, portals['AA'].routes[0].inY, 0]]

    // Walk the maze
    function newFront(x, y, dim, curDist, nextFronts)
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
                        if (dim == 0) {
                            // Finished
                            console.log(`Distance to ZZ: ${curDist}`)
                            process.exit()
                        }
                        // Treat as wall
                        return
                    default:
                        // Unexpected
                        console.error("No in route for portal")
                        process.exit()
                    }
                }

                let dimAdd = portal.inRoute.dimAdd

                if (dimAdd == 1 && dim == 0) {
                    // Outer portals at top dimension are walls
                    return
                }

                dim += dimAdd
                if (dists[dim] === undefined) {
                    addDistDim(dim)
                }

                x = portal.inRoute.inX
                y = portal.inRoute.inY

                continue
            }

            if (dists[dim][y][x] != -1 && dists[dim][y][x] <= curDist) {
                // Another front got here earlier
                return
            }

            break
        }

        dists[dim][y][x] = curDist
        nextFronts.push([x, y, dim])
    }

    let curDist = 0
    while (fronts.length > 0) {
        const nextFronts = []

        for (let f of fronts) {
            let x = f[0]
            let y = f[1]
            let dim = f[2]

            newFront(x, y + 1, dim, curDist, nextFronts)
            newFront(x + 1, y, dim, curDist, nextFronts)
            newFront(x, y - 1, dim, curDist, nextFronts)
            newFront(x - 1, y, dim, curDist, nextFronts)
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
        // Example 1 (26 steps)
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
            '             Z L X W       C                 ',
            '             Z P Q B       K                 ',
            '  ###########.#.#.#.#######.###############  ',
            '  #...#.......#.#.......#.#.......#.#.#...#  ',
            '  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  ',
            '  #.#...#.#.#...#.#.#...#...#...#.#.......#  ',
            '  #.###.#######.###.###.#.###.###.#.#######  ',
            '  #...#.......#.#...#...#.............#...#  ',
            '  #.#########.#######.#.#######.#######.###  ',
            '  #...#.#    F       R I       Z    #.#.#.#  ',
            '  #.###.#    D       E C       H    #.#.#.#  ',
            '  #.#...#                           #...#.#  ',
            '  #.###.#                           #.###.#  ',
            '  #.#....OA                       WB..#.#..ZH',
            '  #.###.#                           #.#.#.#  ',
            'CJ......#                           #.....#  ',
            '  #######                           #######  ',
            '  #.#....CK                         #......IC',
            '  #.###.#                           #.###.#  ',
            '  #.....#                           #...#.#  ',
            '  ###.###                           #.#.#.#  ',
            'XF....#.#                         RF..#.#.#  ',
            '  #####.#                           #######  ',
            '  #......CJ                       NM..#...#  ',
            '  ###.#.#                           #.###.#  ',
            'RE....#.#                           #......RF',
            '  ###.###        X   X       L      #.#.#.#  ',
            '  #.....#        F   Q       P      #.#.#.#  ',
            '  ###.###########.###.#######.#########.###  ',
            '  #.....#...#.....#.......#...#.....#.#...#  ',
            '  #####.#.###.#######.#######.###.###.#.#.#  ',
            '  #.......#.......#.#.#.#.#...#...#...#.#.#  ',
            '  #####.###.#####.#.#.#.#.###.###.#.###.###  ',
            '  #.......#.....#.#...#...............#...#  ',
            '  #############.#.#.###.###################  ',
            '               A O F   N                     ',
            '               A A D   M                     '
        ]

        break

    }

    return map
}