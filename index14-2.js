const fs = require('fs')
const path = require('path')

const reactions = loadFile('input14.txt')

// Calculate for 1 trillion ore
fuelFromOre(1000000000000)


function fuelFromOre(oreQty)
{
    // Estimate the FUEL to ORE ratio
    const ratio = estimateRatio('FUEL', 1, 'ORE')

    console.log(`Estimated ORE per FUEL: ${ratio}`)

    // Try and make the full ratio
    // then loop decreasing the amount required until the qty can be satisfied
    for (let makeQty = Math.ceil(oreQty / ratio); makeQty > 0; makeQty--) {
        // Initialise inventory
        let inv = {
            'ORE': oreQty
        }

        console.log(`Trying to make ${makeQty}...`)

        // Try and make the quantity
        if (make(makeQty, 'FUEL', 'ORE', inv)) {
            console.log(`Made ${makeQty} FUEL`)
            break
        }
    }
}

function estimateRatio(material, qty, finalRaw)
{
    let reaction = reactions[material]
    let rawQty
    let rawTot = 0
    let multiplier

    multiplier = qty / reaction.resQty

    for (let raw of reaction.raw) {
        if (raw[0] == finalRaw) {
            rawQty = raw[1] * multiplier
        } else {
            rawQty = estimateRatio(raw[0], raw[1] * multiplier, finalRaw)
        }

        rawTot += rawQty
    }

    return rawTot
}

function make(qty, material, rawMaterial, inv)
{
    if (!inv[material]) inv[material] = 0

    if (inv[material] < qty) {
        if (material == rawMaterial) {
            console.log(`Wanted ${qty} raw material but only got ${inv[material]}`)
            return false
        }

        const reaction = reactions[material]

        let makeUnits = Math.ceil((qty -  inv[material]) / reaction.resQty)

        for (let raw of reaction.raw) {
            if (!make(raw[1] * makeUnits, raw[0], rawMaterial, inv)) return false
        }

        inv[material] += makeUnits * reaction.resQty
    }

    // Got enough
    inv[material] -= qty

    return true
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
