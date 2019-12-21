const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input17.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

run(mem)

function run(mem)
{
    const lines = []
    let curLine = ''

    IntCode.exec(false, mem, () => 0, (val) => {
        if (val == 0x0a) {
            lines.push(curLine)
            console.log(curLine)
            curLine = ''
        } else {
            curLine += String.fromCharCode(val)
        }
    })

    let apSum = 0
    for (let y = 1; y < lines.length - 1; y++) {
        for (let x = 1; x < lines.length - 1; x++) {
            if (lines[y][x] != '#') continue
            if (lines[y - 1][x] != '#') continue
            if (lines[y + 1][x] != '#') continue
            if (lines[y][x - 1] != '#') continue
            if (lines[y][x + 1] != '#') continue

            let ap = x * y
            apSum += ap
        }
    }

    console.log(apSum)
}