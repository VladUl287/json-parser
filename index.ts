import { parseNumberF64 } from "./src/converters/number"

const numbers = [
    "15", "15.43", "15.47e3", "15.49e-3", "0.12", "-1", "-0.16", "-15.41e-3",
    "15767556.4234557e-3"
]

numbers.forEach(n => {
    const bytes = new TextEncoder().encode(n)
    const decoder = new TextDecoder()

    const runs = 10000

    let start = performance.now()
    let result = 0
    for (let i = 0; i < runs; i++) {
        result += Number(decoder.decode(bytes))
    }
    let end = performance.now()
    console.log(`Execution time for decoder: ${end - start} ms. Result ${result}`)
    
    const elapsedFirst = end - start

    start = performance.now()
    result = 0
    for (let i = 0; i < runs; i++) {
        result += parseNumberF64(bytes)
    }
    end = performance.now()
    console.log(`Execution time for alghoritm: ${end - start} ms. Result ${result}`)

    const elapseSecond = end - start

    console.log('Diff:', elapsedFirst - elapseSecond, '------------------------------------------\n')
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