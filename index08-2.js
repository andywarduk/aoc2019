const fs = require('fs')
const path = require('path')

const input = fs.readFileSync(path.join(__dirname, 'input08.txt'), {encoding: 'utf8'})

const width = 25
const height = 6
const layers = (input.length - 1) / (width * height)

const image = []
for (let h = 0; h < height; h++) {
    const line = []
    for (let w = 0; w < width; w++) {
        line.push('.')
    }
    image.push(line)
}

let c = 0
for (let l = 0; l < layers; l++) {
    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const px = parseInt(input.substr(c,1))
            if (px != 2 && image[h][w] == '.') {
                image[h][w] = (px == 0 ? ' ' : 'O')
            }
            ++c
        }
    }
}

for (let h = 0; h < height; h++) {
    console.log(image[h].join(''))
}
