const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input13.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

runGame(mem)

function runGame(mem)
{
    let debug = false

    const screen = []
    let inputNo = 0
    let x
    let y
    let ballX = 0
    let ballY = 0
    let batX = 0
    let batY = 0
    let batDesiredX = -1
    let score = 0
    let track = null

    // Put in some quarters!
    mem[0] = 2

    // Execute
    IntCode.exec(false, mem, () => {
        // Move bat if rquired
        if (batDesiredX >= 0 && batX < batDesiredX) return 1
        if (batDesiredX >= 0 && batX > batDesiredX) return -1
        return 0

    }, (val) => {
        switch(inputNo) {
        case 0: // Screen X
            x = val
            break
        case 1: // Screen Y
            y = val
            break
        case 2: // Type / Score
            if (x == -1 && y == 0) {
                // Got score
                score = val
            } else {
                // Got type
                if (!screen[y]) screen[y] = []

                screen[y][x] = val

                if (val == 4) {
                    // Ball
                    ballMoved(x, y)
                } else if (val == 3) {
                    // Bat
                    batY = y
                    batX = x
                }
            }
            break
        }

        ++inputNo
        if (inputNo == 3) inputNo = 0
    })

    // Finished execution
    console.log(`Final score: ${score}`)


    function copyScreen(screen)
    {
        const copy = []

        // Copy the screen
        for (const line of screen) {
            copy.push([...line])
        }

        return copy
    }

    function calcBallMovement(x, y, xAdd, yAdd)
    {
        const upScrn = copyScreen(screen)

        if (debug) console.log('=================== Calculating movement =======================')

        function bounce()
        {
            let bounced = true
            const a = upScrn[y + yAdd][x]
            const b = upScrn[y + yAdd][x + xAdd]
            const c = upScrn[y][x + xAdd]

            let newXAdd = xAdd
            let newYAdd = yAdd

            if (debug) console.log(`${a} ${b} ${c}`)

            // Colliding?
            if (a <=0 && b <= 0 && c <= 0) {
                // Not colliding
                bounced = false
            } else {
                // Colliding
                if (a <= 0 && b > 0 && c <= 0) {
                    // Diagonal bounce type 1
                    newXAdd = -xAdd
                    newYAdd = -yAdd
                    if (upScrn[y + yAdd][x + xAdd] == 2) upScrn[y + yAdd][x + xAdd] = -2
                }
                else if (a > 0 && c > 0) {
                    // Diagonal bounce type 2
                    newXAdd = -xAdd
                    newYAdd = -yAdd
                    if (upScrn[y + yAdd][x] == 2) upScrn[y + yAdd][x] = -2
                    if (upScrn[y][x + xAdd] == 2) upScrn[y][x + xAdd] = -2
                } else if (a > 0 && c <= 0) {
                    // Vertical bounce
                    newYAdd = -yAdd
                    if (upScrn[y + yAdd][x] == 2) upScrn[y + yAdd][x] = -2
                } else if (a <= 0 && c > 0) {
                    // Horizontal bounce
                    newXAdd = -xAdd
                    if (upScrn[y][x + xAdd] == 2) upScrn[y][x + xAdd] = -2
                } else {
                    console.log("Unknown bounce")
                    process.exit()
                }
            }

            // Change direction
            xAdd = newXAdd
            yAdd = newYAdd

            return bounced
        }

        // Move the ball until it reaches the bat
        track = []
        do {
            while(bounce());

            // Move ball
            upScrn[y][x] = -4
            x += xAdd
            y += yAdd
            upScrn[y][x] = 4

            if (debug) {
                drawScreen(upScrn)
                console.log(`Traj ${xAdd},${yAdd}`)
                track.push({x, y, board: copyScreen(upScrn)})
            } else {
                track.push({x, y})
            }
        } while (y != batY - 1)

        batDesiredX = x

        if (debug) {
            console.log(`Want bat at ${x}`)
            console.log('=================== Finished =======================')
        }
    }

    function ballMoved(x, y)
    {
        if (track && track.length > 0) {
            // Check predictions
            if (track[0].x != x || track[0].y != y) {
                console.log("Track error. Actual:")
                drawScreen(screen)
                if (debug) {
                    console.log("Predicted:")
                    drawScreen(track[0].board)
                }
                process.exit()
            }
            track.shift()
        }

        if (ballX != 0 && ballY != 0 && batY != 0) {
            let xAdd = x - ballX
            let yAdd = y - ballY

            if (y == batY - 2) {
                calcBallMovement(x, y, xAdd, yAdd)
            }
        }
        ballX = x
        ballY = y

        if (debug) {
            console.log(`Score: ${score}`)
            drawScreen(screen)
        }
    }

    function drawScreen(screen)
    {
        for (let line of screen) {
            if (line) {
                let outLine = ''
                for (let col of line) {
                    if (col === undefined) {
                        outLine += '?'
                    } else {
                        switch(col) {
                        case -2:
                            outLine += '+'
                            break
                        case -4:
                            outLine += '*'
                            break
                        case 0:
                            outLine += ' '
                            break
                        case 1:
                            outLine += 'W'
                            break
                        case 2:
                            outLine += '#'
                            break
                        case 3:
                            outLine += '-'
                            break
                        case 4:
                            outLine += 'O'
                            break
                        }
                    }
                }
                console.log(outLine)
            }
        }
    }

}