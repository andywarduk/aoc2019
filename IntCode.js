function executeIntCode(debug, mem, input, output, pc = 0)
{
    let stopReason = 'error'
    let running = true
    let relBase = 0
    let maxMem = mem.length - 1

    function extendMem(newLen) {
        for (let i = mem.length; i <= newLen; i++) {
            mem[i] = 0
        }

        if (debug){
            console.log(`maxMem ${maxMem} => ${newLen}`)
        }

        maxMem = newLen
    }

    function getMem(addr) {
        if (addr < 0) throw new Error(`Accessing address ${addr}, which is out of range`)
        if (addr > maxMem) {
            extendMem(addr)
        }
        return mem[addr]
    }

    function setMem(addr, value) {
        if (addr < 0) throw new Error(`Writing address ${addr}, which is out of range `)
        if (addr > maxMem) {
            extendMem(addr)
        }
        mem[addr] = value
    }

    const opcodes = {
        1: { // Addition
            name: 'add',
            args: 'rrw',
            fn: (a, b, c) => {
                setMem(c, a + b)
            }
        },
        2: { // Multiplication
            name: 'mul',
            args: 'rrw',
            fn: (a, b, c) => {
                setMem(c, a * b)
            }
        },
        3: { // Get input
            name: 'in',
            args: 'w',
            fn: (a) => {
                const val = input()
                if (typeof(val) == 'number') {
                    setMem(a, input())
                } else if (typeof(val) == 'string') {
                    running = false
                    stopReason = val
                } else {
                    throw new Error(`input return type '${typeof val}' not supported`)
                }
            }
        },
        4: { // Print output
            name: 'out',
            args: 'r',
            fn: (a) => {
                if (output(a) === false) {
                    running = false
                    stopReason = 'output'
                }
            }
        },
        5: { // Jump if true
            name: 'jt',
            args: 'rr',
            fn: (a, b) => {
                if (a != 0) pc = b
            }
        },
        6: { // Jump if false
            name: 'jf',
            args: 'rr',
            fn: (a, b) => {
                if (a == 0) pc = b
            }
        },
        7: { // Less than
            name: 'lt',
            args: 'rrw',
            fn: (a, b, c) => {
                if (a < b) setMem(c, 1)
                else setMem(c, 0)
            }
        },
        8: { // Equals
            name: 'eq',
            args: 'rrw',
            fn: (a, b, c) => {
                if (a == b) setMem(c, 1)
                else setMem(c, 0)
            }
        },
        9: { // Adjust relative base
            name: 'arb',
            args: 'r',
            fn: (a) => {
                relBase += a
            }
        },
        99: { // Halt
            name: 'hlt',
            args: '',
            fn: () => {
                running = false
                stopReason = 'halt'
            }
        }
    }

    while(running) {
        let disas = `${pc}: `

        // Get instruction
        let instruction = getMem(pc).toString().padStart(8, '0')

        // Extract opcode
        let op = parseInt(instruction.substring(6))
        let opDef = opcodes[op]

        if (!opDef) {
            throw new Error(`Invalid opcode ${op} at ${pc}`)
        }

        pc++

        if (debug) {
            disas += opDef.name
        }

        // Get args
        const args = []
        let argModePos = 5
        for(let i = 0; i < opDef.args.length; i++) {
            // Fetch the arg
            let arg = getMem(pc)
            pc++

            // Get addressing mode
            const argMode = opDef.args[i]
            const addrMode = instruction.substr(argModePos, 1)
            --argModePos

            switch (argMode) {
            case 'r':
                // Read arg - check the mode
                switch (addrMode) {
                case '0':
                    // Read from memory
                    if(debug) {
                        disas += ` ${argMode}[${arg}]`
                    }
                    arg = getMem(arg)
                    break
                case '1':
                    // Immediate value
                    if(debug) {
                        disas += ` ${arg}`
                    }
                    break
                case '2':
                    // Relative
                    if(debug) {
                        disas += ` ${argMode}[${relBase} + ${arg} = ${relBase + arg}]`
                    }
                    arg = getMem(relBase + arg)
                    break
                default:
                    throw new Error(`Invalid addressing mode on read: ${addrMode}`)
                }
                break

            case 'w':
                // Written arg - check the mode
                switch (addrMode) {
                case '0':
                    // Written to memory
                    if(debug) {
                        disas += ` ${argMode}[${arg}]`
                    }
                    break
                case '2':
                    // Relative
                    if(debug) {
                        disas += ` ${argMode}[${relBase} + ${arg} = ${relBase + arg}]`
                    }
                    arg = relBase + arg
                    break
                default:
                    throw new Error(`Invalid addressing mode on write: ${addrMode}`)
                }
                break

            default:
                throw new Error(`Invalid arg mode ${argMode}`)

            }

            // Add the arg
            args.push(arg)
        }

        if (debug){
            console.log(disas)
        }

        // Call the function
        opDef.fn(...args)
    }

    return {
        pc,
        stopReason
    }
}

if (require.main === module) {
    // Running as a script - do some tests
    testIntCode()

} else {
    // Required as a module
    module.exports.exec = executeIntCode

}

function assertEqual(expected, actual)
{
    if (actual != expected) throw new Error(`${actual} != ${expected}`)
}

function assertArrayEquals(expected, actual)
{
    let same = false

    if (actual.length == expected.length) {
        same = true
        for(let i = 0; i < actual.length; i++) {
            if (actual[i] != expected[i]) {
                same = false
                break
            }
        }
    }

    if (!same) throw new Error(`${actual} != ${expected}`)
}

function testIntCode()
{
    let mem
    let res
    let prog
    let cnt

    console.log("Running tests...")

    mem = [1,9,10,3,2,3,11,0,99,30,40,50]
    res = executeIntCode(false, mem, () => 0, console.log)
    assertEqual(9, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([3500,9,10,70,2,3,11,0,99,30,40,50], mem)

    mem = [1,0,0,0,99]
    res = executeIntCode(false, mem, () => 0, console.log)
    assertEqual(5, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([2,0,0,0,99], mem)

    mem = [2,3,0,3,99]
    res = executeIntCode(false, mem, () => 0, console.log)
    assertEqual(5, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([2,3,0,6,99], mem)

    mem = [2,4,4,5,99,0]
    res = executeIntCode(false, mem, () => 0, console.log)
    assertEqual(5, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([2,4,4,5,99,9801], mem)

    mem = [1,1,1,4,99,5,6,0,99]
    res = executeIntCode(false, mem, () => 0, console.log)
    assertEqual(9, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([30,1,1,4,2,5,6,0,99], mem)

    // Output the input
    mem = [3,0,4,0,99]
    res = executeIntCode(false, mem, () => 123, (x) => assertEqual(123, x))
    assertEqual(5, res.pc)
    assertEqual('halt', res.stopReason)
    assertArrayEquals([123,0,4,0,99], mem)

    // Output 1 if input equals 8, 0 otherwise (position mode)
    mem = [3,9,8,9,10,9,4,9,99,-1,8]
    res = executeIntCode(false, mem, () => 8, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    mem = [3,9,8,9,10,9,4,9,99,-1,8]
    res = executeIntCode(false, mem, () => 7, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)
    
    // Output 1 if input < 8, else 0 (position mode)
    mem = [3,9,7,9,10,9,4,9,99,-1,8]
    res = executeIntCode(false, mem, () => 8, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)

    mem = [3,9,7,9,10,9,4,9,99,-1,8]
    res = executeIntCode(false, mem, () => 7, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    // Output 1 if input equals 8, 0 otherwise (immediate mode)
    mem = [3,3,1108,-1,8,3,4,3,99]
    res = executeIntCode(false, mem, () => 8, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    mem = [3,3,1108,-1,8,3,4,3,99]
    res = executeIntCode(false, mem, () => 7, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)

    // Output 1 if input < 8, else 0 (position mode)
    mem = [3,3,1107,-1,8,3,4,3,99]
    res = executeIntCode(false, mem, () => 8, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)

    mem = [3,3,1107,-1,8,3,4,3,99]
    res = executeIntCode(false, mem, () => 7, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    // Jump tests that take an input, then output 0 if the input was zero or 1 if the input was non-zero
    // Position mode
    mem = [3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9]
    res = executeIntCode(false, mem, () => 0, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)

    mem = [3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9]
    res = executeIntCode(false, mem, () => 999, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    // Immediate mode
    mem = [3,3,1105,-1,9,1101,0,0,12,4,12,99,1]
    res = executeIntCode(false, mem, () => 0, (x) => assertEqual(0, x))
    assertEqual('halt', res.stopReason)

    mem = [3,3,1105,-1,9,1101,0,0,12,4,12,99,1]
    res = executeIntCode(false, mem, () => 999, (x) => assertEqual(1, x))
    assertEqual('halt', res.stopReason)

    // Output 999 if input < 8, 1000 if input = 8, 1001 if input > 8
    prog = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
        1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
        999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99]

    res = executeIntCode(false, [...prog], () => 7, (x) => assertEqual(999, x))
    assertEqual('halt', res.stopReason)

    res = executeIntCode(false, [...prog], () => 8, (x) => assertEqual(1000, x))
    assertEqual('halt', res.stopReason)

    res = executeIntCode(false, [...prog], () => 9, (x) => assertEqual(1001, x))
    assertEqual('halt', res.stopReason)
    
    // Program which copies itself as output
    prog = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99]
    cnt = 0
    res = executeIntCode(false, [...prog], () => 0, (x) => assertEqual(prog[cnt++], x))
    assertEqual('halt', res.stopReason)
    assertEqual(prog.length, cnt)

    // Output large number
    mem = [1102,34915192,34915192,7,4,7,99,0]
    res = executeIntCode(false, mem, () => 0, (x) => assertEqual(34915192 * 34915192, x))
    assertEqual('halt', res.stopReason)

    // Output large number
    mem = [104,1125899906842624,99]
    res = executeIntCode(false, mem, () => 0, (x) => assertEqual(1125899906842624, x))
    assertEqual('halt', res.stopReason)

    console.log("Tests finished")
}