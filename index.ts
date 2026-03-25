import { deserialize } from "./src/json"
import { toMetadata } from "./src/metadata/metadata"

const obj = {
    id: 15,
    order: 1244,
    phone: 343543534,
    phone1: 343543534,
    phone2: 343543534,
    phone3: 343543534,
    phone4: 343543534,
    phone5: 343543534,
    phone6: 343543534,
    phone7: 343543534,
    phone8: 343543534,
    phone9: 343543534,
    phone10: 343543534,
    phone11: 343543534,
    phone12: 343543534,
    phone13: 343543534,
    // phone: {
    //     code: 7
    // },
}

const metadata = toMetadata(obj)

const value = JSON.stringify(obj, null, 4)

const deserialized = deserialize(new TextEncoder().encode(value), metadata)

console.log(deserialized)