const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input21.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

//  @ 
// ############
//   ABCDEFGHI

run(mem)

function run(mem)
{
    let curLine = ''

    const springScript = [
        'OR I J',
        'OR F J',
        'AND E J',
        'OR H J',
    
        'AND D J',
    
        'OR A T',
        'AND B T',
        'AND C T',
        'NOT T T',
    
        'AND T J',
    
        'RUN'
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
