/*
const input = getInput(1)

let layout = bitify(input)

console.log("Initial:")
unbitify(layout, 5)

console.log("Step 1:")
layout = step(layout)
unbitify(layout, 5)

console.log("Step 2:")
layout = step(layout)
unbitify(layout, 5)

console.log("Step 3:")
layout = step(layout)
unbitify(layout, 5)

console.log("Step 4:")
layout = step(layout)
unbitify(layout, 5)
*/

/*
const input = getInput(1)

run(input)
*/

const input = getInput(0)

run(input)

function run(input)
{
    let layout = bitify(input)
    const layouts = []
    let dupFound = false

    while(!dupFound) {
        layouts.push(layout)
        layout = step(layout)
        if (layouts.indexOf(layout) != -1) {
            console.log(layout)
            dupFound = true
        }
    }
}

function step(layout)
{
    let newLayout = 0

    for (let bit = 0; bit < 25; bit++) {
        const bits = surroundingBits(bit, 5)
        let bugCnt = 0

        for (let sb of bits) {
            if (layout & (1 << sb)) ++bugCnt
        }

        if (layout & (1 << bit)) {
            // Currently infested - still infested unless 1 adjacent bug
            if (bugCnt == 1) newLayout |= (1 << bit)
        } else {
            // Curently empty - infested if 1 or 2 adjacent bugs
            if (bugCnt == 1 || bugCnt == 2) newLayout |= (1 << bit)
        }
    }

    return newLayout
}

function surroundingBits(bit, stride)
{
    let bits = []
    let t = bit < stride
    let r = (bit % stride) == (stride - 1)
    let b = bit >= stride * (stride - 1)
    let l = (bit % stride) == 0

    if (!t) {
        // if (!l) bits.push(bit - (stride + 1))
        bits.push(bit - stride)
        // if (!r) bits.push(bit - (stride - 1))
    }
    if (!l) bits.push(bit - 1)
    if (!r) bits.push(bit + 1)
    if (!b) {
        // if (!l) bits.push(bit + (stride - 1))
        bits.push(bit + stride)
        // if (!r) bits.push(bit + (stride + 1))
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

function unbitify(layout, stride)
{
    let line = ''

    for (let bit = 0; bit < stride * stride; bit++) {
        line += (layout & (1 << bit) ? '#' : '.')
        if ((bit % stride) == (stride - 1)) {
            console.log(line)
            line = ''
        }
    }
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