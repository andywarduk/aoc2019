const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input19.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

run(mem)

function run(mem)
{
    let x
    let y

    // Find the tractor beam
    y = 50
    x = 0
    while (scanPos(x, y, mem) == 0) ++x

    while (scanPos(x + 99, y - 99, mem) != 1) {
        y++
        while (scanPos(x, y, mem) == 0) ++x
        // console.log(`${x},${y}`)
    }

    console.log(`LHS: ${x},${y}`)

    y -= 99

    console.log(`Answer: ${x},${y}`)

    const margin = 10

    console.log(`Plotting ${x - margin},${y - margin} -> ${x + 100 + margin + 1},${y + 100 + margin}:`)
    for (let py = y - margin; py < y + 100 + margin ; py++) {
        let line = ''
        for (let px = x - margin; px < x + 100 + margin; px++) {
            if (scanPos(px, py, mem)) {
                if (px >= x && px <= x + 99 && py >= y && py <= y + 99) line += String.fromCharCode(0x30 + ((px - x + 1) % 10))
                else line += '#'
            }
            else {
                if (px >= x && px <= x + 99 && py >= y && py <= y + 99) line += '?'
                line +='.'
            }
        }
        console.log(line)
    }

    console.log((x * 10000) + y)
}

function scanPos(x, y, mem)
{
    let inputNo = 0
    let result

    IntCode.exec(false, [...mem], () => {
        let res

        switch (++inputNo) {
        case 1:
            res = x
            break
        case 2:
            res = y
            break
        }

        return res
    }, (val) => {
        result = val
    })

    return result
}