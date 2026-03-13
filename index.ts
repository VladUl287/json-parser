import { parseNumberF64 } from "./src/converters/number"

const numbers = ["15", "15.43", "15.47e3", "15.49e-3", "0.12", "-1", "-0.16", "-15.41e-3"]

numbers.forEach(n => {
    console.log(Number(n), "|", parseNumberF64(new TextEncoder().encode(n)))
    console.log('------------------------------------------')
})

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