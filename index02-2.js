const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input02.txt'), {encoding: 'utf8'})

const initMem = input.split(',').map(x => {
    return parseInt(x)
})

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
    const mem = [...initMem]
    mem[1] = noun
    mem[2] = verb

    let pc = 0
    while(mem[pc] != 99) {
        let a1 = mem[pc + 1]
        let a2 = mem[pc + 2]
        let a3 = mem[pc + 3]

        switch(mem[pc]) {
        case 1:
            mem[a3] = mem[a1] + mem[a2]
            break
        case 2:
            mem[a3] = mem[a1] * mem[a2]
            break
        default:
            console.log('Opcode ' + mem[pc] + ' encountered')
            break
        }

        pc += 4
    }

    return mem[0]
}
