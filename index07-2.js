const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input07.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

// Examples
/*
console.log(tryPhases([3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,
    27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5], [9,8,7,6,5]))
console.log(tryPhases([3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,
    -5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,
    53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10], [9,7,8,5,6]))
*/

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

    generatePhasesLevel([], [5, 6, 7, 8, 9])

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
    let ampMem = []
    let inputNo = []
    let pc =[]

    for (let i = 0; i < 5; i++){
        ampMem[i] = [...mem]
        inputNo[i] = 0
        pc[i] = 0
    }

    function getInput()
    {
        switch(++inputNo[curAmp]) {
        case 1:
            return phases[curAmp]
        default:
            // console.log(`${curAmp} getting input`)
            return signal
        }
    }

    function setOutput(val)
    {
        // console.log(`${curAmp} sending output`)
        signal = val

        return false
    }

    let signal = 0
    let curAmp
    let finished = false

    while(!finished) {
        for (curAmp = 0; curAmp < 5; curAmp++) {
            // Execute
            const res = IntCode.exec(false, ampMem[curAmp], getInput, setOutput, pc[curAmp])

            pc[curAmp] = res.pc

            switch(res.stopReason) {
            case 'output':
                // Ok
                break
            case 'halt':
                // Finished
                if (curAmp == 4) finished = true
                break
            default:
                // Other
                finished = true
                break
            }
        }
    }

    return signal
}
