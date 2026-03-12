import { parseNumberF64, parseUTF8BytesToNumber } from "./src/converters/number"
import { deserialize } from "./src/json"
import { toMetadata } from "./src/metadata/metadata"

const bytes = new TextEncoder().encode("15.45")
console.log(bytes)
console.log(parseNumberF64(bytes.subarray(0, bytes.length)))
console.log(parseUTF8BytesToNumber(bytes, 0, bytes.length))

console.log(JSON.parse("{\"id\": 15.45}"))

// let obj = {
//     id: 15,
//     order: 1244,
//     phone: {
//         country: "ru",
//         code: 7
//     },
//     // points: [1, 2],
//     // points: [{ id: 1, names: ["test", "test1"] }],
//     // createdAt: new Date(),
//     // updatedAt: new Date(),
// }

// const metadata = toMetadata(obj)

// console.log(JSON.stringify(metadata, null, 4), '\n\n')

// const value = JSON.stringify(obj, null, 4)

// console.log(value, '\n\n')

// const deserialized = deserialize(value, metadata)

// console.log(deserialized)