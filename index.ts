import { deserialize } from "./json"
import { toMetadata } from "./metadata"

let obj = { 
    id: 15, 
    number: 1244,
    // numbers: [{ value: "test" }], 
    // phone: { number: 1, country: "ru" } 
}

let value = JSON.stringify(obj)

let deserialized = deserialize(value, obj)

console.log(deserialized)