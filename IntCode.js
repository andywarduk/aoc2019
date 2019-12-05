module.exports.exec = (debug, mem, input, output) =>
{
    let running = true

    const opcodes = {
        1: { // Addition
            name: 'add',
            args: 'rrw',
            fn: (a, b, c) => {
                mem[c] = a + b
            }
        },
        2: { // Multiplication
            name: 'mul',
            args: 'rrw',
            fn: (a, b, c) => {
                mem[c] = a * b
            }
        },
        3: { // Get input
            name: 'in',
            args: 'w',
            fn: (a) => {
                mem[a] = input()
            }
        },
        4: { // Print output
            name: 'out',
            args: 'r',
            fn: (a) => {
                output(a)
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
                if (a < b) mem[c] = 1
                else mem[c] = 0
            }
        },
        8: { // Equals
            name: 'eq',
            args: 'rrw',
            fn: (a, b, c) => {
                if (a == b) mem[c] = 1
                else mem[c] = 0
            }
        },
        99: { // Halt
            name: 'hlt',
            args: '',
            fn: () => {
                running = false
            }
        }
    }

    let pc = 0

    while(running) {
        let disas = `${pc}: `

        // Get instruction
        let instruction = mem[pc].toString().padStart(8, '0')

        // Extract opcode
        let op = parseInt(instruction.substring(6))
        let opDef = opcodes[op]

        if (!opDef) {
            console.log(`Invalid opcode ${op} at ${pc}`)
            break
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
            let arg = mem[pc]
            pc++

            switch (opDef.args[i]) {
            case 'r':
                // Read arg - check the mode
                if (instruction.substr(argModePos, 1) == '0') {
                    // Read from memory
                    if(debug) {
                        disas += ` [${arg}]`
                    }
                    arg = mem[arg]
                } else{
                    // Immediate value
                    if(debug) {
                        disas += ` ${arg}`
                    }
                }
                break

            case 'w':
                // Written to memory
                if(debug) {
                    disas += ` [${arg}]`
                }
                break

            default:
                console.log(`Invalid addressing mode ${opDef.args[i]}`)
                break
            }

            // Add the arg
            args.push(arg)

            // Move to next addressing mode
            --argModePos
        }

        if (debug){
            console.log(disas)
        }

        // Call the function
        opDef.fn(...args)
    }
}
