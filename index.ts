import { parseNumberF64 } from "./src/converters/number"

const encoder = new TextEncoder()
const decoder = new TextDecoder()
// console.log(1 / 7, parseNumberF64(encoder.encode((1 / 7).toString())))
console.log("90071992.54740992", parseNumberF64(encoder.encode("9007199254740992"), decoder))

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