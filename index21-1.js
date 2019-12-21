const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input21.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

run(mem)

//  @ 
// #######
//   ABCD

// Jumps 3 spaces (ie to D in diagram above)

function run(mem)
{
    let curLine = ''

    // J = (!C && D) || !A
    let springScript = [
        'NOT C J',
        'AND D J',
        'NOT A T',
        'OR T J',
        'WALK'
    ]
    let ssLine = 0
    let ssChar = 0

    IntCode.exec(false, mem, () => {
        let res

        if (ssChar == springScript[ssLine].length) {
            res = 0x0a
            ++ssLine
            ssChar = 0
        } else {
            res = springScript[ssLine].charCodeAt(ssChar)
            ++ssChar
        }

        return res
    }, (val) => {
        if (val == 0x0a) {
            console.log(curLine)
            curLine = ''
        } else if (val > 0xff) {
            console.log(val)
        } else {
            curLine += String.fromCharCode(val)
        }
    })
}
