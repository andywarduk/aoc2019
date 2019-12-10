const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input10.txt'), {encoding: 'utf8'})

const map = input.split('\n')

/*
const exmap = [
    '.#....#####...#..',
    '##...##.#####..##',
    '##...#...#.#####.',
    '..#.....X...###..',
    '..#.#.....#....##'
]

shoot(exmap, 8, 3, 18)
*/

/*
const exmap = [
    '###',
    '###',
    '###',
]

shoot(exmap, 1, 1, 8)
*/

shoot(map, 26, 29, 200)

function shoot(map, baseX, baseY, shots)
{
    const maxY = map.length
    const maxX = map[0].length

    const asteroids = []

    if (map[baseY][baseX] != '#') {
        console.log("Base Error!")
        return
    }

    for (let y = 0; y < maxY; y++) {
        for (let x = 0; x < maxX; x++) {
            if (x == baseX && y == baseY) continue
            if (map[y][x] == '#') {
                const rx = x - baseX
                const ry = y - baseY
                const dist = Math.sqrt((rx * rx) + (ry * ry))
                const angleRad = Math.atan2(rx, -ry)
                let angleDeg = (angleRad / (Math.PI * 2)) * 360
                if (angleDeg < 0) angleDeg += 360

                asteroids.push({
                    x,
                    y,
                    rx,
                    ry,
                    dist,
                    angleRad,
                    angleDeg,
                    hit: false
                })
            }
        }
    }

    asteroids.sort((a, b) => {
        let diff = a.angleDeg - b.angleDeg
        if (diff == 0) diff = a.dist - b.dist
        return diff
    })

    let lastAngle = -1
    let a = 0
    for (let s = 0; s < shots; s++) {
        while (asteroids[a].hit || asteroids[a].angleRad == lastAngle) {
            ++a
            if (a >= asteroids.length) a = 0
        }
        lastAngle = asteroids[a].angleRad
        console.log(`hit ${s + 1}: [${asteroids[a].x},${asteroids[a].y}]`)
        asteroids[a].hit = true
    }
}
