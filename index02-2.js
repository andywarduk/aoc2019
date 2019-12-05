const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input02.txt'), {encoding: 'utf8'})

const initMem = input.split(',').map(x => {
    return parseInt(x)
})

// Find noun and verb which produces 19690720
for (let noun = 0; noun < 100 ; noun++){
    for (let verb = 0; verb < 100 ; verb++){
        if (runProg(initMem, noun, verb) == 19690720) {
            console.log((100 * noun) + verb)
            break
        }
    }
}

function runProg(initMem, noun, verb)
{
    // Copy mem
    const mem = [...initMem]

    // Set noun and verb
    mem[1] = noun
    mem[2] = verb

    // Execute
    IntCode.exec(false, mem, () => 0, console.log)

    // Return location 0
    return mem[0]
}
