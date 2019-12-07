const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input07.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

// Examples
// console.log(tryPhases([3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0], [4,3,2,1,0]))
// console.log(tryPhases([3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0], [0,1,2,3,4]))
// console.log(tryPhases([3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0],[1,0,4,3,2]))

findOptimalPhases(mem)

function generatePhases()
{
    function generatePhasesLevel(phases, choices)
    {
        if(choices.length == 1) {
            const result = [...phases, choices[0]]
            phaseCombinations.push(result)
        } else {
            for (let i = 0; i < choices.length; i++) {
                const newChoices = [...choices]
                newChoices.splice(i, 1)
                generatePhasesLevel([...phases, choices[i]], newChoices)
            }
        }
    }

    const phaseCombinations = []

    generatePhasesLevel([], [0, 1, 2, 3, 4])

    return phaseCombinations
}

function findOptimalPhases(mem)
{
    const phaseCombinations = generatePhases()

    let maxPower = 0

    for (let phases of phaseCombinations) {
        const power = tryPhases(mem, phases)
        if (power > maxPower) {
            maxPower = power
        }
    }

    console.log(maxPower)
}

function tryPhases(mem, phases)
{
    function getInput()
    {
        switch(++inputCnt) {
        case 1:
            return phases[curAmp]
        case 2:
            return signal
        }
    }

    function setOutput(val)
    {
        signal = val
    }

    let signal = 0
    let inputCnt
    let curAmp

    for (curAmp = 0; curAmp < 5; curAmp++) {
        // Execute
        inputCnt = 0
        IntCode.exec(false, [...mem], getInput, setOutput)
    }

    return signal
}
