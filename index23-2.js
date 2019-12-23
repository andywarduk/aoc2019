const fs = require('fs')
const path = require('path')
const wt = require('worker_threads')
const IntCode = require('./IntCode')

if (wt.isMainThread) {
    // Main thread

    main()

} else {
    // Worker
    try {
        const input = fs.readFileSync(path.join(__dirname, 'input23.txt'), {encoding: 'utf8'})

        const mem = input.split(',').map(x => {
            return parseInt(x)
        })

        run(mem, wt.workerData)

    } catch (e) {
        wt.parentPort.postMessage({
            type: 'error',
            e
        })

    }
}

async function main()
{
    const worker = []
    let natPacket = null
    let lastNatY = 0

    function sendNatPacket()
    {
        // All idle?
        if (natPacket != null && worker.find(w => w.queue > 0) === undefined) {
            if (natPacket.y == lastNatY) {
                message(lastNatY)
                process.exit(0)
            } else {
                message(`Nat Y = ${natPacket.y}`)
                lastNatY = natPacket.y
                ++worker[0].queue
                worker[0].worker.postMessage(natPacket)
                natPacket = null
            }
        }
    }

    for (let nic = 0; nic < 50; nic++) {
        worker[nic] = {
            worker: new wt.Worker(__filename, {
                workerData: {
                    nic
                }
            }),
            online: false,
            queue: 0,
            msgQueue: []
        }

        worker[nic].worker.on('message', (msg) => {
            switch (msg.type) {
            case 'code':
                message(`${msg.fromAddr} -> ${msg.toAddr} (x ${msg.x} y ${msg.y})`)
                if (msg.toAddr == 255) {
                    natPacket = msg
                    sendNatPacket()
                } else {
                    if (worker[msg.toAddr].online) {
                        worker[msg.toAddr].worker.postMessage(msg)
                    } else {
                        worker[msg.toAddr].msgQueue.push(msg)
                    }
                    ++worker[msg.toAddr].queue
                    message(` + ${msg.toAddr} queue ${worker[msg.toAddr].queue}`)
                }
                break
            case 'msg':
                message(msg.msg)
                break
            case 'dequeue':
                --worker[nic].queue
                message(` - ${nic} queue ${worker[nic].queue}`)
                sendNatPacket()
                break
            default:
                message(msg)
            }
        })

        worker[nic].worker.on('online', () => {
            worker[nic].online = true

            if (worker[nic].msgQueue.length > 0) {
                for (let m of worker[nic].msgQueue) {
                    worker[nic].worker.postMessage(m)
                }
                worker[nic].msgQueue = []
            }
        })

    }

    await Promise.all(worker)
}

function message(msg)
{
    if (wt.isMainThread) {
        console.log(msg)
    } else {
        wt.parentPort.postMessage({
            type: 'msg',
            msg
        })
    }
}

function run(mem, data)
{
    const addr = data.nic
    let sentAddr = false
    const msgQueue = []
    let inMsgStage = 0
    let outMsgElem = 0
    let outMsg

    wt.parentPort.on('message', (msg) => {
        msgQueue.push(msg)
    })

    setImmediate(() => exec(0))

    function exec(pc)
    {
        let res = IntCode.exec(false, mem, () => {
            let res

            if (!sentAddr) {
                res = addr
                sentAddr = true

            } else {
                switch (inMsgStage) {
                case 0:
                    // Poll for in message
                    res = 'input'
                    inMsgStage = 1

                    break

                case 1:
                    // Got in message?
                    if (msgQueue.length > 0) {
                        // Yes - send X
                        res = msgQueue[0].x
                        inMsgStage = 2
                    } else {
                        // No - return -1 and re-poll next time
                        res = -1
                        inMsgStage = 0
                    }

                    break

                case 2:
                    // Send Y
                    res = msgQueue[0].y
                    inMsgStage = 0
                    msgQueue.shift()
                    wt.parentPort.postMessage({
                        type: 'dequeue'
                    })

                }

            }

            return res

        }, (val) => {
            switch (outMsgElem) {
            case 0:
                outMsg = {
                    type: 'code',
                    fromAddr: addr,
                    toAddr: val
                }
                ++outMsgElem

                break

            case 1:
                outMsg.x = val
                ++outMsgElem

                break

            case 2:
                outMsg.y = val
                outMsgElem = 0
                wt.parentPort.postMessage(outMsg)

                break

            }

        }, pc)
            
        if (res.stopReason == 'input') {
            setImmediate(() => exec(res.lastPc))
        }
    }
}