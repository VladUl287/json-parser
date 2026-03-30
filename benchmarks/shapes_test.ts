import { add, complete, cycle, suite } from 'benny'

const map = new Map<string, object>()
const obj = {}

const fields = new Array(1000).fill(0).map((_, index) => [`field${index}`, `test${index}`])
fields.push(["keykeykey", "value"])
const objPredefined = Object.fromEntries(fields)

Object.keys(objPredefined).forEach(key => {
    obj[key] = objPredefined[key]
    map.set(key, objPredefined[key])
})

const key = "keykeykey"

suite(
    'shapes_test',

    add('map', () => map.get(key)),
    add('obj', () => obj[key]),
    add('objPredefined', () => objPredefined[key]),

    cycle(),
    complete(),
)
