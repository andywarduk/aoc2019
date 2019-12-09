module.exports.exec = (debug, mem, input, output, pc = 0) =>
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
                setMem(a, input())
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
