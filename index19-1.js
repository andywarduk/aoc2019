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
    let affected = 0

    for (let y = 0; y < 50; y++) {
        let line = ''
        for (let x = 0; x < 50; x++) {
            if (scanPos(x, y, mem)) {
                ++affected
                line += '#'
            }
            else {
                line +='.'
            }
        }
        console.log(line)
    }

    console.log(affected)
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