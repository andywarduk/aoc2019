const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input10.txt'), {encoding: 'utf8'})

const map = input.split('\n')

/*
const map1 = [
    '.#..#',
    '.....',
    '#####',
    '....#',
    '...##'
]

const map2 = [
    '......#.#.',
    '#..#.#....',
    '..#######.',
    '.#.#.###..',
    '.#..#.....',
    '..#....#.#',
    '#..#....#.',
    '.##.#..###',
    '##...#..#.',
    '.#....####'
]

calcMax(map1)
calcMax(map2)
*/

calcMax(map)

function setCharAt(str, index, chr) {
    return str.substr(0, index) + chr + str.substr(index + 1);
}

function *genSweep(ax, ay, maxX, maxY)
{
    let dist = 1
    let sent

    function *sendCoord(x, y) {
        if (x >= 0 && x < maxX && y >=0 && y < maxY) {
            yield [x, y]
            ++sent
        }
    }

    do {
        sent = 0
        for (let dx = -dist; dx < dist; dx++) {
            yield *sendCoord(ax + dx, ay - dist)
        }
        for (let dy= -dist; dy < dist; dy++) {
            yield *sendCoord(ax + dist, ay + dy)
        }
        for (let dx = dist; dx > -dist; dx--) {
            yield *sendCoord(ax + dx, ay + dist)
        }
        for (let dy= dist; dy > -dist; dy--) {
            yield *sendCoord(ax - dist, ay + dy)
        }
        ++dist
    } while(sent > 0)
}

function gcd(a, b)
{
    if (b == 0) return a
    return gcd(b, a % b)
}

function obscure(ax, ay, xStep, yStep, map, maxX, maxY)
{
    let x = ax + xStep
    let y = ay + yStep

    const stepGcd = gcd(Math.abs(xStep), Math.abs(yStep))
    if (stepGcd > 1) {
        xStep /= stepGcd
        yStep /= stepGcd
    }

    while (x >= 0 && x < maxX && y >=0 && y < maxY) {
        if (map[y][x] == '#') {
            map[y] = setCharAt(map[y], x, 'X')
        }
        y += yStep
        x += xStep
    }
}

function calcMax(map)
{
    const maxY = map.length
    const maxX = map[0].length

    const asteroids = []

    for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < maxX; x++) {
            if (map[y][x] == '#') asteroids.push([x, y])
        }
    }

    let maxHits = 0
    let maxCoord

    for (let [ax, ay] of asteroids) {
        const workMap = [...map]
        let hits = 0

        for (let [hx, hy] of genSweep(ax, ay, maxX, maxY)) {
            if (workMap[hy][hx] == '#') {
                ++hits
                obscure(ax, ay, hx - ax, hy - ay, workMap, maxX, maxY)
            }
        }

        if (hits > maxHits) {
            maxHits = hits
            maxCoord = [ax, ay]
        }
    }

    console.log(`Max at ${maxCoord[0]},${maxCoord[1]} with ${maxHits} hits`)
}
