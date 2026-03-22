import { deserialize } from "./src/json"
import { toMetadata } from "./src/metadata/metadata"

const obj = {
    id: 15,
    order: 1244,
    phone: 343543534
    // phone: {
    //     code: 7
    // },
}

const metadata = toMetadata(obj)

const value = JSON.stringify(obj, null, 4)

const deserialized = deserialize(new TextEncoder().encode(value), metadata)

// console.log(deserialized)