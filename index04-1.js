const rangeLo = 272091
const rangeHi = 815432

let validCnt = 0
for (let p = rangeLo; p <= rangeHi; p++){
    let valid = true

    // Convert to string
    const ps = p.toString()

    // Make sure digits increase
    let last = '0'
    for (let cn = 0; cn < 6; cn++) {
        if (ps[cn] < last) {
            valid = false
            break
        }
        last = ps[cn]
    }
    if (!valid) continue

    // Make sure at least one digit is doubled
    valid = false
    for (let cn = 1; cn < 6; cn++) {
        if (ps[cn] == ps[cn - 1]) {
            valid = true
            break
        }
    }
    if (!valid) continue

    // console.log(ps)

    ++validCnt
}

console.log(validCnt)