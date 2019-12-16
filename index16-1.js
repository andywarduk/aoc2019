const fs = require('fs')
const path = require('path')

const pattern = [0, 1, 0, -1]

// Load input
const input = fs.readFileSync(path.join(__dirname, 'input16.txt'), {encoding: 'utf8'})

const digits = input.trim().split('').map(x => {
    return parseInt(x)
})

console.log(fft(digits, 100, pattern, false).substr(0, 8))

/*
// Example
const ex1 = '12345678'.split('').map((x) => parseInt(x))

console.log(fft(ex1, 4, pattern, true))
*/

function fft(input, phases, pattern, debug)
{
    let nextInput
    const transform = []

    // Calculate transforms
    for (let tNo = 0; tNo < input.length; tNo++) {
        transform[tNo] = []

        // Calculate transform
        let pElem = 0
        const pMax = tNo + 1
        let pCnt = 1
        for (let t = 0; t < input.length; t++) {
            // Move to next pattern elemens
            if (pCnt == pMax) {
                pCnt = 0
                ++pElem
                if (pElem == pattern.length) {
                    pElem = 0
                }
            }
            transform[tNo][t] = pattern[pElem]
            ++pCnt
        }
    }

    for (let p = 0; p < phases; p++) {
        if (debug) console.log(`Phase ${p +1}:`)

        nextInput = input.map((x, i1) => {
            let sum = 0
            let line = ''
            for (let i2 = 0; i2 < input.length; i2++) {
                if (debug) {
                    let mult = `(${input[i2]} * ${transform[i1][i2]})`
                    if (line == '') line += mult
                    else line += ` + ${mult}`
                }
                sum += input[i2] * transform[i1][i2]
            }

            let res = Math.abs(sum) % 10

            if (debug) {
                line += ` = ${res}`
                console.log(line)
            }

            return res
        })

        input = nextInput
    }

    return input.join('')
}