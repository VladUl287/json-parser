import { deserialize } from "./json"

let obj = { id: 15, number: 2, phone: { number: 1, country: "ru" } }

let value = JSON.stringify(obj)

console.log(value)
console.log(JSON.parse(value))

let deserialized = deserialize(value, obj)

console.log(deserialized)