/*
const ex1 = [
    {x: -1, y: 0,   z: 2},
    {x: 2,  y: -10, z: -7},
    {x: 4,  y: -8,  z: 8},
    {x: 3,  y: 5,   z: -1}
]

play(ex1, 10, true)
*/


const moons = [
    {x: -8,  y: -18, z: 6},
    {x: -11, y: -14, z: 4},
    {x: 8,   y: -3,  z: -10},
    {x: -2,  y: -16, z: 1}
]

play(moons, 1000, false)


function play(moons, steps, debug) 
{
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

    for (let m = 0; m < 4; m++) {
        moons[m].vx = 0
        moons[m].vy = 0
        moons[m].vz = 0
    }

    for (let s = 0; s < steps; s++) {
        // Apply gravity
        for (let m1 = 0; m1 < 4; m1++) {
            for (let m2 = m1 + 1; m2 < 4; m2++) {
                compare(moons[m1], moons[m2], "x", "vx")
                compare(moons[m1], moons[m2], "y", "vy")
                compare(moons[m1], moons[m2], "z", "vz")
            }
        }

        // Apply velocity
        for (let m = 0; m < 4; m++) {
            moons[m].x += moons[m].vx
            moons[m].y += moons[m].vy
            moons[m].z += moons[m].vz
        }

        if (debug) {
            console.log(`Step ${s + 1}`)
            for (let m = 0; m < 4; m++) {
                console.log(`pos=<x=${moons[m].x}, y=${moons[m].y}, z=${moons[m].z}>, vel=<x=${moons[m].vx}, y=${moons[m].vy}, z=${moons[m].vz}>`)
            }
        }
    }

    let eTotal = 0

    for (let m = 0; m < 4; m++) {
        const mPot = Math.abs(moons[m].x) + Math.abs(moons[m].y) + Math.abs(moons[m].z)
        const mKin = Math.abs(moons[m].vx) + Math.abs(moons[m].vy) + Math.abs(moons[m].vz)
        const mTot = mPot * mKin

        eTotal += mTot

        if (debug) {
            console.log(`pot: ${mPot}, kin: ${mKin}, total: ${mTot}`)
        }
    }

    console.log(eTotal)
}