const fs = require('fs')
const path = require('path')
const IntCode = require('./IntCode')

const input = fs.readFileSync(path.join(__dirname, 'input23.txt'), {encoding: 'utf8'})

const prog = input.split(',').map(x => {
    return parseInt(x)
})

run(prog)

function run(prog)
{
    let natMsg = null
    let lastNatY = 0
    const threads = []
    let finished = false

    for (let i = 0; i < 50; i++) {
        threads[i] = {
            sentAddr: false,
            inMsg: false,
            mem: [...prog],
            pc: 0,
            queue: [],
            outMsgElem: 0,
            outMsg: null,
            idleCnt: 0
        }
    }

    while (!finished) {
        for (let i = 0; i < 50; i++) {
            const thread = threads[i]

            let res = IntCode.exec(false, thread.mem, () => {
                let res

                if (!thread.sentAddr) {
                    // Send address
                    res = i
                    thread.sentAddr = true

                } else if (thread.inMsg) {
                    // Send Y
                    res = thread.queue[0].y
                    thread.queue.shift()
                    thread.inMsg = false

                } else if (thread.queue.length > 0) {
                    // Got in message
                    res = thread.queue[0].x
                    thread.inMsg = true
                    thread.idleCnt = 0

                } else if (thread.idleCnt == 0) {
                    // First idle
                    res = -1
                    ++thread.idleCnt
                
                } else {
                    // Second idle
                    res = 'idle'
                    thread.idleCnt = 0

                }

                return res

            }, (val) => {
                switch (thread.outMsgElem) {
                case 0:
                    thread.outMsg = {
                        to: val
                    }
                    ++thread.outMsgElem

                    break

                case 1:
                    thread.outMsg.x = val
                    ++thread.outMsgElem

                    break

                case 2:
                    thread.outMsg.y = val
                    thread.outMsgElem = 0
                    if (thread.outMsg.to == 255) {
                        natMsg = thread.outMsg
                    } else {
                        // console.log(`${i} -> ${thread.outMsg.to}`)
                        threads[thread.outMsg.to].queue.push(thread.outMsg)
                    }

                    break

                }

            }, thread.pc)
        
            if (res.stopReason == 'idle') {
                thread.pc = res.lastPc
            } else {
                console.error(res)
                process.exit(1)
            }
        }


        if (threads.find(t => t.queue.length > 0) === undefined) {
            // All idle
            if (natMsg != null) {
                if (lastNatY == natMsg.y) {
                    console.log(lastNatY)
                    finished = true
                } else {
                    // console.log(natMsg)
                    lastNatY = natMsg.y
                    threads[0].queue.push(natMsg)
                    natMsg = null
                }
            }
        }

    }

}
