import { deserialize } from "./src/json"
import { toMetadata } from "./src/metadata/metadata"

let obj = {
    id: 15,
    order: 1244,
    phone: {
        country: "ru",
        code: 7
    },
    // points: [1, 2],
    // points: [{ id: 1, names: ["test", "test1"] }],
    // createdAt: new Date(),
    // updatedAt: new Date(),
}

const metadata = toMetadata(obj)

console.log(JSON.stringify(metadata, null, 4), '\n\n')

const value = JSON.stringify(obj, null, 4)

console.log(value, '\n\n')

const deserialized = deserialize(value, obj)

console.log(deserialized)