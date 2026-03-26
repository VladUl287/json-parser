import { Bench } from 'tinybench'
import { equals, equals_loop } from '../src/utils/array'

const suite = new Bench({ name: 'array_equal', warmupIterations: 200 })

const stringSmall = new TextEncoder().encode("phone")
const smallBytes = new Uint8Array([...stringSmall])
const stringDefault = new TextEncoder().encode("phoneNumber")
const defaultBytes = new Uint8Array([...stringDefault])
const stringBig = new TextEncoder().encode("phoneNumberphoneNumberphoneNumberphoneNumber")
const bigBytes = new Uint8Array([...stringBig])

suite
    .add('equals_small', () => equals(smallBytes, stringSmall, 0, 0))
    .add('loop_small', () => equals_loop(smallBytes, stringSmall, 0, 0))
    .add('equals_default', () => equals(defaultBytes, stringDefault, 0, 0))
    .add('loop_default', () => equals_loop(defaultBytes, stringDefault, 0, 0))
    .add('equals_big', () => equals(bigBytes, stringBig, 0, 0))
    .add('loop_big', () => equals_loop(bigBytes, stringBig, 0, 0))

suite.run().then(() => {
    console.log(suite.name)
    console.table(suite.table())
})
