const fs = require('fs')
const path = require('path')
const PNG = require('pngjs').PNG

const border = 4

const fileCnt = fs.readFileSync(path.join(__dirname, 'input03.txt'), {encoding: 'utf8'})

process('R8,U5,L5,D3\nU7,R6,D4,L4\n', 'output03-ex1.png')
process('R75,D30,R83,U83,L12,D49,R71,U7,L72\nU62,R66,U55,R34,D71,R55,D58,R83', 'output03-ex2.png')
process('R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51\nU98,R91,D20,R16,D67,R40,U7,R15,U6,R7', 'output03-ex3.png')
process(fileCnt, 'output03.png')

console.log("finished")

function process(fileCnt, outFile)
{
    const fileLines = fileCnt.split('\n')

    const lines = []
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0
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
                xadd = 0
                yadd = -1 * segLen
                break
            case 'D':
                xadd = 0
                yadd = 1 * segLen
                break
            case 'L':
                xadd = -1 * segLen
                yadd = 0
                break
            case 'R':
                xadd = 1 * segLen
                yadd = 0
                break
            default:
                xadd = 0
                yadd = 0
            }

            if (xadd != 0 || yadd != 0) {
                const line = {
                    wireNo,
                    x1: Math.min(x, x + xadd),
                    y1: Math.min(y, y + yadd),
                    x2: Math.max(x, x + xadd),
                    y2: Math.max(y, y + yadd)
                }

                minX = Math.min(minX, line.x1)
                maxX = Math.max(maxX, line.x2)
                minY = Math.min(minY, line.y1)
                maxY = Math.max(maxY, line.y2)

                lines.push(line)

                x += xadd
                y += yadd
            }
        })
    }

    const png = new PNG({
        width: (maxX - minX) + (border * 2),
        height: (maxY - minY) + (border * 2),
        filterType: -1
    })

    const xOffset = -minX + border
    const yOffset = -minY + border

    const colours = [
        {r: 255, g: 255, b: 255},
        {r: 255, g:   0, b:   0},
        {r:   0, g: 255, b:   0}
    ]

    function drawPixel(x, y, colour) {
        var idx = (png.width * (y + yOffset) + (x + xOffset)) << 2;
        png.data[idx    ] |= colour.r;
        png.data[idx + 1] |= colour.g;
        png.data[idx + 2] |= colour.b;
        png.data[idx + 3] = 255;
    }

    for (let i = -border + 1; i < border; i++) {
        drawPixel(i, -i, colours[0])
        drawPixel(i, +i, colours[0])
    }

    for (let line of lines) {
        if (line.x1 == line.x2) {
            // Vertical
            for (let y = line.y1; y <= line.y2; y ++) {
                drawPixel(line.x1, y, colours[line.wireNo])
            }
        } else {
            // Horizontal
            for (let x = line.x1; x <= line.x2; x ++) {
                drawPixel(x, line.y1, colours[line.wireNo])
            }
        }
    }

    drawPixel(0, 0, colours[0])

    console.log(`Writing ${outFile}...`)
    const buffer = PNG.sync.write(png)
    fs.writeFileSync(outFile, buffer)
}