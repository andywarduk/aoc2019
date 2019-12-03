const fs = require('fs')
const path = require('path')

const fileCnt = fs.readFileSync(path.join(__dirname, 'input03.txt'), {encoding: 'utf8'})

console.log(calcIntersectionDist('R8,U5,L5,D3\nU7,R6,D4,L4\n'))
console.log(calcIntersectionDist('R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83'))
console.log(calcIntersectionDist('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7'))
console.log(calcIntersectionDist(fileCnt))


function calcIntersectionDist(fileCnt)
{
    const fileLines = fileCnt.split('\n')

    const vertLines = []
    const horizLines = []

    let minSteps = -1
    let wireNo = 0

    for (let line of fileLines) {
        let x = 0
        let y = 0
        let wireDist = 0
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

            line = {
                wireNo,
                x,
                y,
                wireDist
            }

            switch(dir[0]){
            case 'U':
            case 'D':
                lineEnd = y + (segLen * yadd)
                line = {
                    ...line,
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
                    ...line,
                    x1: Math.min(x, lineEnd),
                    x2: Math.max(x, lineEnd)
                }
                horizLines.push(line)
                vertIntersect(line)
                x = lineEnd
                break

            }

            wireDist += segLen
        })
    }

    return minSteps

    function horizIntersect(line)
    {
        for (let hl of horizLines) {
            if (hl.wireNo != line.wireNo && hl.y >= line.y1 && hl.y <= line.y2 && line.x >= hl.x1 && line.x <= hl.x2) {
                intersection(line.x, hl.y, hl, line)
            }
        }
    }

    function vertIntersect(line)
    {
        for (let vl of vertLines) {
            if (vl.wireNo != line.wireNo && vl.x >= line.x1 && vl.x <= line.x2 && line.y >= vl.y1 && line.y <= vl.y2) {
                intersection(vl.x, line.y, vl, line)
            }
        }
    }

    function intersection(x, y, firstLine, secondLine)
    {

        if (x != 0 || y != 0) {
            const steps1 = firstLine.wireDist + manhattanDist(firstLine.x, firstLine.y, x, y)
            const steps2 = secondLine.wireDist + manhattanDist(secondLine.x, secondLine.y, x, y)
            const steps = steps1 + steps2
            if (steps < minSteps || minSteps == -1) minSteps = steps
            // console.log(`Intersect at ${x},${y} (steps ${steps1} + ${steps2})`)
        }
    }

    function manhattanDist(x1, y1, x2, y2)
    {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2)
    }

}