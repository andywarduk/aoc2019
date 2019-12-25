const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')
const rl = require('readline-sync')

const input = fs.readFileSync(path.join(__dirname, 'input25.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

let commandQueue =[]
let command = ''
let curLine = ''

IntCode.exec(false, mem, () => {
    let res

    if (command == '') {
        if (commandQueue.length == 0) {
            command = rl.question('> ')

            switch (command) {
            case 'pickup':
                commandQueue = pickupCommands()
                break
            case 'weigh':
                commandQueue = weigh()
                break
            }
        }

        if (commandQueue.length > 0) {
            command = commandQueue.shift()
            console.log(`>> ${command}`)
        }

        command = command + '\n'
    }

    res = command.charCodeAt(0)
    command = command.slice(1)

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

function pickupCommands()
{
    return [
        'north',
        'north',
        'take sand',
        'south',
        'south',
        'south',
        'take space heater',
        'south',
        'east',
        'take loom',
        'west',
        'north',
        'west',
        'take wreath',
        'south',
        'take space law space brochure',
        'south',
        'take pointer',
        'north',
        'north',
        'east',
        'north', // Back at start
        'west',
        'south',
        'take planetoid',
        'north',
        'west',
        'take festive hat',
        'south',
        'west'
    ]
}

function weigh()
{
    let commands = []

    const items = [
        'planetoid',
        'festive hat',
        'space heater',
        'loom',
        'space law space brochure',
        'sand',
        'pointer',
        'wreath',
    ]

    function addCommands(verb, mask)
    {
        const commands = []

        for (let bit = 0; bit < 8; bit++) {
            if (mask & (1 << bit)) {
                commands.push(`${verb} ${items[bit]}`)
            }
        }

        return commands
    }

    commands = commands.concat([...addCommands("drop", 0xff)])

    for (let i = 0; i < 255; i++) {
        commands = commands.concat([...addCommands("take", i)])
        commands.push("north")
        commands = commands.concat([...addCommands("drop", i)])
    }

    return commands
}