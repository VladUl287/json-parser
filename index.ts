import { deserialize } from "./json"
import { parseUTF8BytesToNumber } from "./types"

let obj = { id: 1.23e-40 }

let value = JSON.stringify(obj)

console.log(value)
console.log(JSON.parse(value))

let deserialized = deserialize(value, obj)

console.log(deserialized)

const testCases = [
    "123",
    "-456",
    "+789",
    "123.456",
    "-0.123",
    ".789",
    "123.",
    "1.23e-4",
    "-5.67E+10",
    "2.99792458e8"
];

testCases.forEach(str => {
    const bytes = new TextEncoder().encode(str)
    const result = parseUTF8BytesToNumber(bytes, 0, bytes.length)
    console.log(`${str} -> ${result} (${typeof result})`)
});