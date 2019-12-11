const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input11.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

// Initialise hull
const hull = []

for (let y = 0; y < 250; y++) {
    hull[y] = []
    for(let x = 0; x < 250; x++) {
        hull[y][x] = ' '
    }
}

// Position and direction
let x = 125
let y = 125
let xAdd
let yAdd
let dir

function setDir(newDir)
{
    dir = newDir

    switch(dir) {
    case 'N':
        xAdd = 0
        yAdd = -1
        break
    case 'E':
        xAdd = 1
        yAdd = 0
        break
    case 'S':
        xAdd = 0
        yAdd = 1
        break
    case 'W':
        xAdd = -1
        yAdd = 0
        break
    }
}

function turnRight()
{
    switch(dir) {
    case 'N':
        setDir('E')
        break
    case 'E':
        setDir('S')
        break
    case 'S':
        setDir('W')
        break
    case 'W':
        setDir('N')
        break
    }
}

function turnLeft()
{
    switch(dir) {
    case 'N':
        setDir('W')
        break
    case 'E':
        setDir('N')
        break
    case 'S':
        setDir('E')
        break
    case 'W':
        setDir('S')
        break
    }
}

// Set initial direction
setDir('N')

let outCnt = 0

// Max and min positions
let minX = x
let minY = y
let maxX = x
let maxY = y

// Initial square should be white
hull[y][x] = 'W'

function inputFn()
{
    // Return 1 if current square is white, 0 if black
    return (hull[y][x] == 'W' ? 1 : 0)
}

function outputFn(out)
{
    switch(outCnt % 2) {
    case 0: // Paint
        hull[y][x] = (out == 1 ? 'W' : 'b')

        if (out == 1) {
            minX = Math.min(x, minX)
            minY = Math.min(y, minY)
            maxX = Math.max(x, maxX)
            maxY = Math.max(y, maxY)    
        }

        break

    case 1: // Turn & walk
        if (out == 1) turnRight()
        else turnLeft()

        x += xAdd
        y += yAdd

        // console.log(`${dir} ${x},${y}`)

        break
    }

    ++outCnt    
}

// Execute program
IntCode.exec(false, mem, inputFn, outputFn)

// Print painting
for (let y = minY; y <= maxY; y++) {
    console.log(hull[y].slice(minX, maxX + 1).map((x) => x == 'W' ? '\u258a' : ' ').join(''))
}
