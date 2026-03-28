import { createNameEquality } from '../src/metadata/metadata'
import { equals, equals_loop } from '../src/utils/array'
import { add, complete, cycle, suite } from 'benny'

const stringSmall = new TextEncoder().encode("phone")
const smallBytes = new Uint8Array([...stringSmall])
const stringDefault = new TextEncoder().encode("phoneNumber")
const defaultBytes = new Uint8Array([...stringDefault])
const stringBig = new TextEncoder().encode("phoneNumberphoneNumberphoneNumberphoneNumber")
const bigBytes = new Uint8Array([...stringBig])

const equality_codegen_small = createNameEquality(stringSmall.length)
const equality_codegen_default = createNameEquality(stringDefault.length)
const equality_codegen_big = createNameEquality(stringBig.length)

suite(
    'array_equal',

    add('equality_codegen_small', () => equality_codegen_small(smallBytes, stringSmall, 0)),
    add('equals', () => equals(smallBytes, stringSmall, 0, 0)),
    add('loop_small', () => equals_loop(smallBytes, stringSmall, 0, 0)),

    add('equality_codegen_default', () => equality_codegen_default(defaultBytes, stringDefault, 0)),
    add('equals_default', () => equals(defaultBytes, stringDefault, 0, 0)),
    add('loop_default', () => equals_loop(defaultBytes, stringDefault, 0, 0)),

    add('equality_codegen_big', () => equality_codegen_big(bigBytes, stringBig, 0)),
    add('equals_big', () => equals(bigBytes, stringBig, 0, 0)),
    add('loop_big', () => equals_loop(bigBytes, stringBig, 0, 0)),

    cycle(),
    complete(),
)
