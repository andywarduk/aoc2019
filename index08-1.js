const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input08.txt'), {encoding: 'utf8'})

const width = 25
const height = 6
const layers = (input.length - 1) / (width * height)

const counts = []
let c = 0
for (let l = 0; l < layers; l++) {
    counts[l] = [0, 0, 0]
    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const num = parseInt(input.substr(c,1))
            ++counts[l][num]
            ++c
        }
    }
}

let low = null
let lowCnt = -1
for (let l = 0; l < layers; l++) {
    if (lowCnt == -1 || counts[l][0] < lowCnt) {
        lowCnt = counts[l][0]
        low = counts[l]
    }
}

console.log(low[1] * low[2])