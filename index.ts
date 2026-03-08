import { deserialize } from "./json"
import { toMetadata } from "./metadata"

let obj = { 
    id: 15, 
    order: 1244,
    points: [{ id: 1, names: ["test", "test1"] }],
    createdAt: new Date(),
    updatedAt: new Date(),
}

let value = JSON.stringify(obj)

let deserialized = deserialize(value, obj)

console.log(deserialized)