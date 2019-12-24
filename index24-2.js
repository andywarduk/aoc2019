/*
// Example
const input = getInput(1)

run(input, 10, true)
*/

// Input
const input = getInput(0)

run(input, 200, false)

function run(input, steps, debug)
{
    let layout = [bitify(input)]
    layout.push(0)
    layout.unshift(0)
    let offset = 1

    if (debug) {
        console.log("Initial:")
        unbitify(layout, offset)        
    }

    for (let i = 0; i < steps; i++) {
        let [newLayout, newOffset] = step(layout, offset)
        layout = newLayout
        offset = newOffset
    }

    if (debug) {
        console.log(`After ${steps} steps:`)
        unbitify(layout, offset)
    }

    console.log(countBits(layout))
}

function step(layout, offset)
{
    let newLayoutArray = []

    for (let i = 0; i < layout.length; i++) {
        const oldLayout = layout[i]
        let newLayout = 0

        for (let bit = 0; bit < 25; bit++) {
            if (bit == 12) continue

            const bits = surroundingBits(bit, i)
            let bugCnt = 0

            for (let sb of bits) {
                let lookLevel = sb[1]
                if (lookLevel >= 0 && lookLevel < layout.length) {
                    if (layout[lookLevel] & (1 << sb[0])) ++bugCnt
                }
            }

            if (oldLayout & (1 << bit)) {
                // Currently infested - still infested unless 1 adjacent bug
                if (bugCnt == 1) newLayout |= (1 << bit)
            } else {
                // Curently empty - infested if 1 or 2 adjacent bugs
                if (bugCnt == 1 || bugCnt == 2) newLayout |= (1 << bit)
            }
        }

        newLayoutArray.push(newLayout)
    }

    if (newLayoutArray[0] != 0) {
        newLayoutArray.unshift(0)
        ++offset
    }

    if (newLayoutArray[newLayoutArray.length - 1] != 0) {
        newLayoutArray.push(0)
    }

    return [newLayoutArray, offset]
}

function surroundingBits(bit, level)
{
    let bits = []

    let tu = bit < 5
    let ru = (bit % 5) == (5 - 1)
    let bu = bit >= 5 * (5 - 1)
    let lu = (bit % 5) == 0

    let td = bit == 17
    let rd = bit == 11
    let bd = bit == 7
    let ld = bit == 13

    if (tu) {
        bits.push([7, level - 1])
    } else if (td) {
        bits.push([20, level + 1])
        bits.push([21, level + 1])
        bits.push([22, level + 1])
        bits.push([23, level + 1])
        bits.push([24, level + 1])
    } else {
        bits.push([bit - 5, level])
    }

    if (lu) {
        bits.push([11, level - 1])
    } else if (ld) {
        bits.push([4, level + 1])
        bits.push([9, level + 1])
        bits.push([14, level + 1])
        bits.push([19, level + 1])
        bits.push([24, level + 1])
    } else {
        bits.push([bit - 1, level])
    }

    if (ru) {
        bits.push([13, level - 1])
    } else if (rd) {
        bits.push([0, level + 1])
        bits.push([5, level + 1])
        bits.push([10, level + 1])
        bits.push([15, level + 1])
        bits.push([20, level + 1])
    } else {
        bits.push([bit + 1, level])
    }

    if (bu) {
        bits.push([17, level - 1])
    } else if (bd) {
        bits.push([0, level + 1])
        bits.push([1, level + 1])
        bits.push([2, level + 1])
        bits.push([3, level + 1])
        bits.push([4, level + 1])
    } else {
        bits.push([bit + 5, level])
    }

    return bits
}

function bitify(input)
{
    let bit = 0
    let layout = 0

    for (let l of input) {
        for (let c of l) {
            if (c == '#') layout += 1 << bit
            bit++
        }
    }

    return layout
}

function unbitify(layout, offset)
{
    let level = 0 - offset
    for (let l of layout) {
        if (l != 0) {
            console.log(`Level ${level}`)
            unbitifyLevel(l)
        }
        ++level
    }
}

function unbitifyLevel(layout)
{
    let line = ''

    for (let bit = 0; bit < 5 * 5; bit++) {
        line += (layout & (1 << bit) ? '#' : '.')
        if ((bit % 5) == (5 - 1)) {
            console.log(line)
            line = ''
        }
    }
}

function countBits(layout)
{
    let bits = 0

    for (let l of layout) {
        bits += bitCount(l)
    }

    return bits
}

function bitCount (n) {
    n = n - ((n >> 1) & 0x55555555)
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
  }
  
function getInput(num)
{
    let input

    switch (num) {
    case 0:
        input =[
            '#####',
            '.#.#.',
            '.#..#',
            '....#',
            '..###'
        ]
        break

    case 1:
        input = [
            '....#',
            '#..#.',
            '#..##',
            '..#..',
            '#....'
        ]
    }

    input = input.map(l => l.split(''))

    return input
}