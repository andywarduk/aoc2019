const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input02.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

mem[1] = 12
mem[2] = 2

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

console.log(mem[0])
