const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input13.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

countBlocks(mem)

function countBlocks(mem)
{
    const screen = []

    let num = 0
    let x
    let y

    // Execute
    IntCode.exec(false, mem, () => 0, (val) =>{
        switch(num) {
        case 0:
            x = val
            break
        case 1:
            y = val
            break
        case 2:
            if (!screen[y]) screen[y] = []
            screen[y][x] = val
            break
        }
        ++num
        if (num == 3) num = 0
    })

    let blocks = 0
    for (let line of screen) {
        if(line) {
            for (let col of line){
                if (col == 2) ++blocks
            }
        }
    }

    console.log(`Block count: ${blocks}`)
}
