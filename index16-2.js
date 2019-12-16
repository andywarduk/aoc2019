const fs = require('fs')
const path = require('path')

/*
const ex1 = '03036732577212944063491565474664'

process(ex1, 100)
*/

// Load input
const input = fs.readFileSync(path.join(__dirname, 'input16.txt'), {encoding: 'utf8'})

process(input, 100)


function process(input, iter)
{
    const offset = parseInt(input.substr(0,7))

    const inDigits = input.trim().split('').map(x => {
        return parseInt(x)
    })

    if (offset < (inDigits.length * 10000) / 2) {
        console.log("Can't use this method")
        process.exit()
    }

    const backLen = (inDigits.length * 10000) - offset
    const workArray = new Array(backLen)

    // Build digit array
    for (let i = 0; i < backLen; i++) {
        workArray[i] = inDigits[(i + offset) % inDigits.length]
    }

    // Create sums array
    const sums = new Array(backLen)

    for (let i = 0; i < iter; i++) {
        // Calculate sums
        sums[0] = workArray[0]
        for (let j = 1; j < backLen; j++) {
            sums[j] = (sums[j - 1] + workArray[j])
        }

        // Calc new digits
        for (let j = 0; j < backLen; j++) {
            workArray[j] = Math.abs(sums[sums.length - 1] - (j == 0 ? 0 : sums[j - 1])) % 10
        }
    }

    // Print answer
    console.log(workArray.slice(0, 8).join(''))
}
