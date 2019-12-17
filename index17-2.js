const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

// Load program
const input = fs.readFileSync(path.join(__dirname, 'input17.txt'), {encoding: 'utf8'})

const mem = input.split(',').map(x => {
    return parseInt(x)
})

run(mem)

function run(mem)
{
    let gotMap = false
    const map = []
    let curLine =''
    let codeString = null
    let fnTable = []
    let inputNo = 0
    let charNo = 0

    mem[0] = 2

    IntCode.exec(false, mem, () => {
        let val

        switch(inputNo) {
        case 0:
            if (codeString == null) {
                // Calculate route programs
                calcRoute()
            }

            val = sendString(codeString)

            break

        case 1:
            val = sendString(fnTable[0])

            break

        case 2:
            val = sendString(fnTable[1])

            break

        case 3:
            val = sendString(fnTable[2])

            break
            
        case 4:
            val = sendString('n')

            break

        default:
            console.error("Unexpected input")
            process.exit()

        }

        return val
    }, (val) => {
        if (val == 0x0a) {
            if (!gotMap) {
                if (curLine == '') {
                    gotMap = true
                } else {
                    map.push(curLine)
                }
            }
            console.log(curLine)
            curLine = ''
        } else if (val < 0x80) {
            curLine += String.fromCharCode(val)
        } else {
            console.log(val)
        }
    })

    function sendString(string)
    {
        let val

        if (charNo >= string.length) {
            val = '\n'.charCodeAt(0)
            ++inputNo
            charNo = 0
        } else {
            val = string.charCodeAt(charNo)
            ++charNo
        }

        return val
    }

    function calcRoute()
    {
        let rx
        let ry
        let rDir
        let code = []

        // Find robot
        for (let y = 1; y < map.length - 1; y++) {
            for (let x = 1; x < map.length - 1; x++) {
                if (map[y][x] == '^' || map[y][x] == '<' || map[y][x] == '>' || map[y][x] == 'v') {
                    rx = x
                    ry = y
                    rDir = map[y][x]
                    break
                }
            }
        }

        // Walk the scaffold
        while(turn()) {
            fwd()
        }
        
        // Compress the program
        compress()

        function turn()
        {
            let newDir = ' '
            if (ry > 0 && map[ry - 1][rx] == '#' && rDir != 'v') newDir = '^'
            else if (ry < map.length - 1 && map[ry + 1][rx] == '#' && rDir != '^') newDir = 'v'
            else if (rx > 0 && map[ry][rx - 1] == '#' && rDir != '>') newDir = '<'
            else if (rx < map[ry].length && map[ry][rx + 1] == '#' && rDir != '<') newDir = '>'

            if (newDir == ' ') return false

            switch(rDir) {
            case '^':
                switch(newDir) {
                case '<':
                    emit('L')
                    break
                case '>':
                    emit('R')
                    break
                default:
                    console.error("Unexpected dir change")
                    process.exit()
                }
                break
            case '>':
                switch(newDir) {
                case 'v':
                    emit('R')
                    break
                case '^':
                    emit('L')
                    break
                default:
                    console.error("Unexpected dir change")
                    process.exit()
                }
                break
            case 'v':
                switch(newDir) {
                case '<':
                    emit('R')
                    break
                case '>':
                    emit('L')
                    break
                default:
                    console.error("Unexpected dir change")
                    process.exit()
                }
                break
            case '<':
                switch(newDir) {
                case '^':
                    emit('R')
                    break
                case 'v':
                    emit('L')
                    break
                default:
                    console.error("Unexpected dir change")
                    process.exit()
                }
                break
            }

            rDir = newDir

            return true
        }

        function fwd()
        {
            let xAdd = 0
            let yAdd = 0
            let dist = 0
            let finished = false

            switch(rDir) {
            case '^':
                yAdd = -1
                break
            case '>':
                xAdd = 1
                break
            case 'v':
                yAdd = 1
                break
            case '<':
                xAdd = -1
                break
            }

            while (!finished) {
                let newX = rx + xAdd
                let newY = ry + yAdd

                if (newX < 0) finished = true
                else if (newY < 0) finished = true
                else if (newY >= map.length) finished = true
                else if (newX >= map[newY].length) finished = true
                else if (map[newY][newX] != '#') finished = true
                else {
                    rx = newX
                    ry = newY
                    ++dist
                }
            }

            emit(dist)
        }

        function emit(codeElem)
        {
            code.push(codeElem)
        }

        function compress()
        {
            let cmpTable = []

            console.log(`Uncompressed code: ${codeToString(code)}`)

            // Get frequent sequences
            for (let cmpLen = 2; cmpLen <= Math.ceil(code.length / 2); cmpLen++) {
                scanCode(cmpLen)
            }

            // Sort in to length (desc), matches (desc), position (asc)
            cmpTable = cmpTable.sort((a, b) => {
                let res

                res = b.string.length - a.string.length
                if (res != 0) return res

                res = b.matches - a.matches
                if (res != 0) return res

                res = a.positions[0] - b.positions[0]
                return res
            })

            let found = false
            for (let cmpA = 0; !found && cmpA < cmpTable.length; cmpA++) {
                for (let cmpB = cmpA + 1; !found && cmpB < cmpTable.length; cmpB++) {
                    for (let cmpC = cmpB + 1; !found && cmpC < cmpTable.length; cmpC++) {
                        if (compressSeq(cmpA, cmpB, cmpC)) found = true
                    }
                }
            }

            if (!found) {
                console.error("No comrpession found")
                process.exit()
            }

            // Display code
            console.log(`Code: ${codeString} (length ${codeString.length})`)
            for (let fn of fnTable) {
                console.log(`   ${fn} (length ${fn.length})`)
            }

            function cmpArray(a1, a2) 
            {
                if (a1.length != a2.length) return false

                for (let chk = 0; chk < a1.length; chk++) {
                    if (a1[chk] != a2[chk]) {
                        return false
                    }
                }

                return true
            }

            function scanCode(cmpLen)
            {
                let lookCode

                for (let origPos = 0; origPos < code.length; origPos += 2) {
                    lookCode = code.slice(origPos, origPos + cmpLen) 
                    
                    let codeString = codeToString(lookCode)

                    if (codeString.length > 20) continue

                    if (cmpTable.find((e) => e.string == codeString)) continue

                    let matches = 0
                    let matchPos = []

                    for (let mPos = 0; mPos < code.length; mPos += 2) {
                        if (mPos < origPos || mPos >= origPos + cmpLen) {
                            const codeSlice = code.slice(mPos, mPos + cmpLen)
                            if (cmpArray(codeSlice, lookCode)) {
                                ++matches
                                matchPos.push(mPos)
                            }
                        }
                    }

                    if (matches > 1) {
                        cmpTable.push({
                            pattern: [...lookCode],
                            string: codeString,
                            matches,
                            positions: [...matchPos]
                        })
                    }
                }
            }

            function codeToString(code)
            {
                let string = ''

                for (let c of code) {
                    let addStr

                    if (typeof c == "number") addStr = '' + c
                    else addStr = c

                    if (string == '') string = addStr
                    else string += `,${addStr}`
                }

                return string
            }

            function compressSeq(s1, s2, s3)
            {
                let valid = false
                const workCode = [...code]

                compressSeqNo(s1, String.fromCharCode(0x40 + 1))
                compressSeqNo(s2, String.fromCharCode(0x40 + 2))
                compressSeqNo(s3, String.fromCharCode(0x40 + 3))

                const workCodeString = codeToString(workCode)

                if (workCodeString.length <= 20) {
                    console.log(`${s1},${s2},${s3} => ${workCodeString.length}`)
                    codeString = workCodeString
                    fnTable.push(cmpTable[s1].string)
                    fnTable.push(cmpTable[s2].string)
                    fnTable.push(cmpTable[s3].string)
                    valid = true
                }

                return valid

                function compressSeqNo(s, fnCode)
                {
                    const cmpEnt = cmpTable[s]
                    const seq = cmpEnt.pattern
                    const cmpLen = seq.length

                    for (let p = 0; p <= code.length - cmpLen; p++) {
                        if (cmpArray(workCode.slice(p, p + cmpLen), seq)) {
                            workCode.splice(p, cmpLen, fnCode)
                        }
                    }
                }
            }

        }

    }

}