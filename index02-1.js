const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input02.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

// Set memory
mem[1] = 12
mem[2] = 2

// Execute
IntCode.exec(false, mem, () => 0, console.log)

// Display mem loc 0
console.log(mem[0])