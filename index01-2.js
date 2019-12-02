const fs = require('fs')
const readline = require('readline')

function calcFuel(mass)
{
    let fuel = Math.floor(mass / 3) - 2

    if (fuel > 0) {
        let fuelFuel = calcFuel(fuel)
        fuel += fuelFuel
    } else {
        fuel = 0
    }

    return fuel
}

async function processLineByLine(file) {
    const fileStream = fs.createReadStream(file);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let totalFuel = 0
    for await (const line of rl) {
        const mass = parseInt(line)
        totalFuel += calcFuel(mass)
    }

    console.log(totalFuel)
}

processLineByLine('input01.txt')
