const fs = require('fs')
const readline = require('readline')

async function processLineByLine(file) {
    const fileStream = fs.createReadStream(file);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let totalFuel = 0
    for await (const line of rl) {
        mass = parseInt(line)
        fuel = Math.floor(mass / 3) - 2
        totalFuel += fuel
    }

    console.log(totalFuel)
}

processLineByLine('input01.txt')
