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

    for (let nic = 0; nic < 50; nic++) {
        worker[nic] = {
            worker: new wt.Worker(__filename, {
                workerData: {
                    nic
                }
            }),
            online: false,
            msgQueue: []
        }

        worker[nic].worker.on('message', (msg) => {
            switch (msg.type) {
            case 'code':
                if (msg.toAddr == 255) {
                    console.log(msg)
                } else {
                    console.log(`${msg.fromAddr} -> ${msg.toAddr} (x ${msg.x} y ${msg.y})`)
                    if (worker[msg.toAddr].online) {
                        worker[msg.toAddr].worker.postMessage(msg)
                    } else {
                        worker[msg.toAddr].msgQueue.push(msg)
                    }
                }
                break
            case 'msg':
                console.log(msg.msg)
                break
            default:
                console.log(msg)
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
    let inInMsg = false
    let outMsgElem = 0
    let outMsg

    wt.parentPort.on('message', (msg) => {
        msgQueue.push(msg)
    })

    message(`Thread ${addr} running`)

    setImmediate(() => exec(0))

    function exec(pc)
    {
        // message(`${addr} exec from ${pc}`)

        let res = IntCode.exec(false, mem, () => {
            let res

            if (!sentAddr) {
                res = addr
                sentAddr = true

            } else {
                if (inInMsg) {
                    res = msgQueue[0].y
                    inInMsg = false
                    msgQueue.shift()
                } else {
                    if (msgQueue.length > 0) {
                        res = msgQueue[0].x
                        inInMsg = true
                    } else {
                        res = [-1, 'interrupt']
                    }
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
    
        if (res.stopReason == 'interrupt') {
            setImmediate(() => exec(res.pc))
        }
    }
}