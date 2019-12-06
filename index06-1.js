const fs = require('fs')
const path = require('path')

/*
const example = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`

console.log(calcOrbits(example))
*/

const file = fs.readFileSync(path.join(__dirname, 'input06.txt'), {encoding: 'utf8'})

console.log(calcOrbits(file))


function calcOrbits(file)
{
    const input = file.split("\n")

    // Build the object tree
    const objects = {}
    let root = null
    for (let line of input) {
        if (line == "") continue

        let [inObj, outObj] = line.split(")")
        if (!objects[outObj]) {
            objects[outObj] = {}
        }

        if (!objects[inObj]) {
            objects[inObj] = {}
        }

        objects[inObj][outObj] = objects[outObj]

        if (inObj == "COM") root = objects[inObj]
    }

    function walk(node, depth)
    {
        totOrbits += depth
        for (let child in node) {
            walk(objects[child], depth + 1)
        }
    }

    let totOrbits = 0
    walk(root, 0)

    return totOrbits
}
