/*
const ex1 = [
    {x: -1, y: 0,   z: 2},
    {x: 2,  y: -10, z: -7},
    {x: 4,  y: -8,  z: 8},
    {x: 3,  y: 5,   z: -1}
]

calcRepeat(ex1)
*/

const moons = [
    {x: -8,  y: -18, z: 6},
    {x: -11, y: -14, z: 4},
    {x: 8,   y: -3,  z: -10},
    {x: -2,  y: -16, z: 1}
]

calcRepeat(moons)


function compare(m1, m2, pProp, vProp)
{
    const v1 = m1[pProp]
    const v2 = m2[pProp]
    let adj = 0

    if (v1 > v2) adj = 1
    else if (v1 < v2) adj = -1

    m1[vProp] -= adj
    m2[vProp] += adj
}

function findRepeat(moons, pProp, vProp)
{
    const states = {}

    function addKey(s)
    {
        let key = ''

        for (let m = 0; m < 4; m++) {
            key = `${key}|${moons[m][pProp]}|${moons[m][vProp]}`
        }

        if (states.hasOwnProperty(key)) {
            console.log(`Found ${pProp} repeat at ${states[key]}`)
            return false
        }
        
        states[key] = s

        return true
    }

    for (let m = 0; m < 4; m++) {
        moons[m][vProp] = 0
    }

    let s = 0

    addKey(s)

    let finished = false
    while(!finished) {
        ++s

        // Apply gravity
        for (let m1 = 0; m1 < 4; m1++) {
            for (let m2 = m1 + 1; m2 < 4; m2++) {
                compare(moons[m1], moons[m2], pProp, vProp)
            }
        }

        // Apply velocity
        for (let m = 0; m < 4; m++) {
            moons[m][pProp] += moons[m][vProp]
        }

        // Had this position + velocity before?
        if (!addKey()) finished = true
    }

    return s
}

function gcd(a, b)
{
    if (b == 0) return a
    return gcd(b, a % b)
}

function lcm3(a, b, c)
{
    return lcm2(lcm2(a, b), c)
}

function lcm2(a, b) {
    return (a * b) / gcd(a, b)
}

function calcRepeat(moons) 
{
    const xRep = findRepeat(moons, "x", "vx")
    const yRep = findRepeat(moons, "y", "vy")
    const zRep = findRepeat(moons, "z", "vz")

    console.log(`x reps: ${xRep}`)
    console.log(`y reps: ${yRep}`)
    console.log(`z reps: ${zRep}`)

    const repLcm = lcm3(xRep, yRep, zRep)
    console.log(`LCM: ${repLcm}`)
}
