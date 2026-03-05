import { deserialize } from "./json"

let obj = { id: 1.23e-40 }

let value = JSON.stringify(obj)

console.log(value)
console.log(JSON.parse(value))

let deserialized = deserialize(value, obj)

console.log(deserialized)