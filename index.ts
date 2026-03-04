import { deserialize } from "./json"

let obj = { id: 5 }

let value = JSON.stringify(obj)

console.log(value)

let deserialized = deserialize(value, obj)

console.log(deserialized)