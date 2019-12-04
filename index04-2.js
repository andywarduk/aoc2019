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
            // Make sure that this found digit only occurs twice
            for (let cn2 = 0; cn2 < 6; cn2++) {
                if (cn2 != cn && cn2 != cn - 1 && ps[cn2] == ps[cn]) {
                    valid = false
                    break
                }
            }
            if (valid) break
        }
    }
    if (!valid) continue

    // console.log(ps)

    ++validCnt
}

console.log(validCnt)