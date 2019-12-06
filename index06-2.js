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
K)L
K)YOU
I)SAN`

console.log(calcTransfers(example))
*/

const file = fs.readFileSync(path.join(__dirname, 'input06.txt'), {encoding: 'utf8'})

console.log(calcTransfers(file))


function calcTransfers(file)
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

    function getPath(item)
    {
        function walkPath(node, depth)
        {
            for (let child in node) {
                if (child == item) {
                    return [child]
                }
                const subtree = walkPath(objects[child], depth + 1)
                if (subtree) {
                    subtree.push(child)
                    return subtree
                }
            }
            return null
        }

        const tree = walkPath(root, 0)
        tree.push("COM")

        return tree
    }

    const you = getPath('YOU')
    const san = getPath('SAN')

    function findRoot()
    {
        for (let i of you) {
            if (san.includes(i)) return i
        }
    }

    const orbitRoot = findRoot()

    return (you.indexOf(orbitRoot) - 1) + (san.indexOf(orbitRoot) - 1)
}
