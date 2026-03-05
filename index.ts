import { deserialize } from "./json"
import { toMetadata } from "./metadata"

let obj = { id: 15, numbers: [{ value: "test" }], phone: { number: 1, country: "ru" } }

let value = JSON.stringify(obj)

console.log(JSON.stringify(toMetadata(obj)))

// let deserialized = deserialize(value, obj)

// console.log(deserialized)