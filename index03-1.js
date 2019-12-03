const fs = require('fs')
const path = require('path')

const fileCnt = fs.readFileSync(path.join(__dirname, 'input03.txt'), {encoding: 'utf8'})

console.log(calcIntersection('R8,U5,L5,D3\nU7,R6,D4,L4\n'))
console.log(calcIntersection('R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83'))
console.log(calcIntersection('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7'))
console.log(calcIntersection(fileCnt))


function calcIntersection(fileCnt)
{
    const fileLines = fileCnt.split('\n')

    const vertLines = []
    const horizLines = []

    let minDist = -1
    let wireNo = 0

    for (let line of fileLines) {
        let x = 0
        let y = 0
        let yadd
        let xadd

        ++wireNo

        const dirs = line.split(",")

        dirs.forEach((dir) => {
            const segLen = parseInt(dir.substring(1))

            switch(dir[0]) {
            case 'U':
                yadd = 1
                break
            case 'D':
                yadd = -1
                break
            case 'L':
                xadd = -1
                break
            case 'R':
                xadd = 1
                break
            }

            let line
            let lineEnd

            switch(dir[0]){
            case 'U':
            case 'D':
                lineEnd = y + (segLen * yadd)
                line = {
                    wireNo,
                    x,
                    y1: Math.min(y, lineEnd),
                    y2: Math.max(y, lineEnd)
                }
                vertLines.push(line)
                horizIntersect(line)
                y = lineEnd
                break
            case 'L':
            case 'R':
                lineEnd = x + (segLen * xadd)
                line = {
                    wireNo,
                    y,
                    x1: Math.min(x, lineEnd),
                    x2: Math.max(y, lineEnd)
                }
                horizLines.push(line)
                vertIntersect(line)
                x = lineEnd
                break
            }
        })
    }

    return minDist

    function horizIntersect(line)
    {
        for (let hl of horizLines) {
            if (hl.wireNo != line.wireNo && hl.y >= line.y1 && hl.y <= line.y2 && line.x >= hl.x1 && line.x <= hl.x2) {
                intersection(line.x, hl.y)
            }
        }
    }

    function vertIntersect(line)
    {
        for (let vl of vertLines) {
            if (vl.wireNo != line.wireNo && vl.x >= line.x1 && vl.x <= line.x2 && line.y >= vl.y1 && line.y <= vl.y2) {
                intersection(vl.x, line.y)
            }
        }
    }

    function intersection(x, y)
    {

        if (x != 0 || y != 0) {
            const dist = manhattanDist(x, y)
            // console.log(`Intersect at ${x},${y} (dist ${dist})`)
            if (minDist == -1 || dist < minDist) {
                minDist = dist
            }
        }
    }

    function manhattanDist(x, y)
    {
        return Math.abs(x) + Math.abs(y)
    }

}