const fs = require('fs')
const path = require('path')

// Get map
const [map, skip] = getMap(0)

// Print map
console.log("  012345678901234567890123456789012345678901234567890123456789012345678901234567890")
map.map((e, i) => console.log((i % 10) + " " + e.join("")))

// Find keys
const keys = map.reduce((keys, line, y) => {
    return line.reduce((keys, block, x) => {
        if (block == '@' || isLowerCase(block)) {
            keys = {
                ...keys,
                [block]: {
                    x,
                    y
                }
            }
        }

        return keys
    }, keys)
}, {})

// Find routes between all keys
for (let k1 of Object.keys(keys)) {
    const key = keys[k1]

    key.routes = {}
    for (let k2 of Object.keys(keys)) {
        if (k2 != k1 && k2 != '@') {
            let route = findRoute(key, k2, skip)
            // console.log(`${k1} -> ${k2} ${route.dist}`)
            if (!route) {
                console.error(`Unable to route from ${k1} to ${k2}`)
                process.exit()
            }
            key.routes[k2] = route
        }
    }
}

collectKeys(keys)

function collectKeys(keys)
{
    const distCache = {}
    const keyArr = Object.keys(keys).filter(e => isLowerCase(e)).sort()

    const bestDist = step('@', keyArr, 0)

    console.log(bestDist)

    function step(curPos, remainingKeys)
    {
        // Look in the cache
        let cacheKey = `${curPos}-${remainingKeys.join('')}`
        if (distCache[cacheKey]) {
            // console.log("Cache hit")
            return distCache[cacheKey]
        }

        // Get list of accesible keys
        const keyChoice = remainingKeys.filter(k => {
            // Got keys to the doors?
            for (let door of keys[curPos].routes[k].doors) {
                if (remainingKeys.indexOf(door.toLowerCase()) >= 0) {
                    return false
                }
            }

            return true
        })

        // Calculate distances
        const choices = keyChoice.map(key => {
            return {
                key,
                dist: keys[curPos].routes[key].dist
            }
        })

        if (remainingKeys.length == 1) {
            if (choices[0].key == remainingKeys[0]) return choices[0].dist
            else return -1
        }

        // Move
        let bestDist = -1
        for (let choice of choices) {
            let nextKeys = [...remainingKeys]
            nextKeys.splice(nextKeys.indexOf(choice.key), 1)

            let thisDist = step(choice.key, nextKeys)
            if (thisDist > 0) {
                thisDist += choice.dist
                if (bestDist == -1 || thisDist < bestDist) {
                    // console.log(`  ${cacheKey} : ${thisDist}`)
                    bestDist = thisDist
                }
            }
        }

        // console.log(`${cacheKey} : ${bestDist}`)
        distCache[cacheKey] = bestDist

        return bestDist
    }
}

function findRoute(pos, dest)
{
    let kx = pos.x
    let ky = pos.y

    const visited = {}
    visited[vKey(kx, ky)] = true

    return walk(kx, ky, dest, 0, [], visited)

    function vKey(x, y)
    {
        return `x${x}y${y}`
    }

    function walk(curX, curY, dest, dist, doors, visited, lastX, lastY)
    {
        function checkChoice(xAdd, yAdd) {
            let newX = curX + xAdd
            let newY = curY + yAdd

            if (map[newY][newX] != '#' && (newX != lastX || newY != lastY)) {
                let lastDist = visited[vKey(newX, newY)]
                if (lastDist === undefined) {
                    choices.push([newX, newY])
                }
            }
        }

        // console.log(`${curX},${curY}`)

        let choices
        do {
            choices = []

            checkChoice(0, -1)
            checkChoice(1, 0)
            checkChoice(0, 1)
            checkChoice(-1, 0)

            if (choices.length == 0) {
                // Dead end
                return null

            } else if (choices.length == 1) {
                // Only one choice
                lastX = curX
                lastY = curY

                curX = choices[0][0]
                curY = choices[0][1]

                ++dist

                if (map[curY][curX] == dest) {
                    // Reached destination
                    return {
                        dist,
                        doors
                    }
                }

                if (isUpperCase(map[curY][curX])) {
                    // Going past a door
                    doors = [...doors, map[curY][curX]]
                }

            } else {
                // Junction point
                const results = []

                for (let choice of choices) {
                    let x = choice[0]
                    let y = choice[1]

                    let nextDoors = doors

                    if (map[y][x] == dest) {
                        // Reached destination
                        return {
                            dist: dist + 1,
                            doors
                        }
                    }

                    if (isUpperCase(map[y][x])) {
                        // Going past a door
                        nextDoors = [...nextDoors, map[y][x]]
                    }
    
                    let res = walk(x, y, dest, dist + 1, nextDoors, {...visited, [vKey(curX, curY)]: dist + 1}, curX, curY)
                    if (res) results.push(res)
                }

                if (results.length > 0) {
                    if (results.length == 1) return results[0]
                    else {
                        // console.log("Multiple results")
                        return results.sort((a, b) => a.dist - b.dist)[0]
                    }
                }

                return null
            }
        } while (true)
    }
}

function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}

function isUpperCase(str)
{
    return str == str.toUpperCase() && str != str.toLowerCase();
}

function getMap(mapNo)
{
    let map
    let input
    let skip

    switch (mapNo) {
    case 0:
        // Load input
        input = fs.readFileSync(path.join(__dirname, 'input18.txt'), {encoding: 'utf8'})

        // Break in to lines
        map = input.split('\n')

        // Split in to chars
        map = map.map(e => e.split(""))

        // Ignore start point
        skip = {
            x: 40,
            y: 40
        }

        break

    case 1:
        map = [
            '#########',
            '#b.A.@.a#',
            '#########'
        ]

        // Split in to chars
        map = map.map(e => e.split(""))

        break

    case 2:
        map = [
            '########################',
            '#f.D.E.e.C.b.A.@.a.B.c.#',
            '######################.#',
            '#d.....................#',
            '########################'
        ]

        // Split in to chars
        map = map.map(e => e.split(""))

        break

    case 3:
        map = [
            '########################',
            '#...............b.C.D.f#',
            '#.######################',
            '#.....@.a.B.c.d.A.e.F.g#',
            '########################'
        ]

        // Split in to chars
        map = map.map(e => e.split(""))

        break
        
    case 4:
        map = [
            '#################',
            '#i.G..c...e..H.p#',
            '########.########',
            '#j.A..b...f..D.o#',
            '########@########',
            '#k.E..a...g..B.n#',
            '########.########',
            '#l.F..d...h..C.m#',
            '#################'
        ]

        // Split in to chars
        map = map.map(e => e.split(""))

        break
        
    case 5:
        map = [
            '########################',
            '#@..............ac.GI.b#',
            '###d#e#f################',
            '###A#B#C################',
            '###g#h#i################',
            '########################'
        ]

        // Split in to chars
        map = map.map(e => e.split(""))

        break

    }

    return [map, skip]
}