const fs = require('fs')
const path = require('path')

const reactions = loadFile('input14.txt')

/*
const reactions = loadInput([
    '9 ORE => 2 A',
    '8 ORE => 3 B',
    '7 ORE => 5 C',
    '3 A, 4 B => 1 AB',
    '5 B, 7 C => 1 BC',
    '4 C, 1 A => 1 CA',
    '2 AB, 3 BC, 4 CA => 1 FUEL'
])
*/

console.log(calcQty('FUEL', 1, 'ORE', {}))


function calcQty(material, qty, finalRaw, inv)
{
    let reaction = reactions[material]
    let invQty = 0
    let rawQty
    let rawTot = 0
    let multiplier

    if (!inv[material]) {
        inv[material] = {
            qty: 0
        }
    } else {
        invQty = inv[material].qty
    }

    multiplier = Math.ceil((qty - invQty) / reaction.resQty)

    if (multiplier > 0) {
        for (let raw of reaction.raw) {
            if (raw[0] == finalRaw) {
                rawQty = raw[1] * multiplier
            } else {
                rawQty = calcQty(raw[0], raw[1] * multiplier, finalRaw, inv)
            }

            console.log(`${rawQty} ${raw[0]} required for ${qty} ${material}`)

            rawTot += rawQty
        }
    }

    let qtyMade = reaction.resQty * multiplier
    inv[material].qty += qtyMade - qty

    return rawTot
}

function loadFile(file)
{
    const input = fs.readFileSync(path.join(__dirname, file), {encoding: 'utf8'})
    const lines = input.split('\n')

    return loadInput(lines)
}

function loadInput(lines)
{
    const reactions = {}

    for (let line of lines) {
        if (line == '') continue

        // Split raw materails vs result
        const lrSplit = line.split('=>')
        const rawList = lrSplit[0].split(',')
        const res = lrSplit[1].trim().split(' ')

        const entry ={
            resQty: parseInt(res[0]),
            raw: []
        }

        for (let rawItem of rawList) {
            const raw = rawItem.trim().split(' ')
            entry.raw.push([raw[1], parseInt(raw[0])])
        }

        reactions[res[1]] = entry
    }

    return reactions
}
