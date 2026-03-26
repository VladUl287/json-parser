import { Bench } from 'tinybench'
import { toMetadata } from '../src/metadata/metadata'
import { deserialize } from '../src/json'

const suite = new Bench({ name: 'deserialization', warmupIterations: 200 })

const obj = {
    id: 343543534,
    order: 343543534,
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
    phone13: 343543534
}

const value = JSON.stringify(obj, null, 4)
const valueBytes = new TextEncoder().encode(value)
const metadata = toMetadata(obj)

suite
    .add('deserialize', () => deserialize(valueBytes, metadata))
    .add('JSON.parse', () => JSON.parse(value))

suite.run().then(() => {
    console.log(suite.name)
    console.table(suite.table())
})
