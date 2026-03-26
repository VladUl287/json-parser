import Benchmark from 'benchmark'
import { formatBenchmarkResults } from './utils'
import { equals, equals_bitwise, equals_loop } from '../src/utils/array'

const suite = new Benchmark.Suite()

const stringSmall = new TextEncoder().encode("phone")
const smallBytes = new Uint8Array([...stringSmall])
const stringDefault = new TextEncoder().encode("phoneNumber")
const defaultBytes = new Uint8Array([...stringDefault])
const stringBig = new TextEncoder().encode("phoneNumberphoneNumberphoneNumberphoneNumber")
const bigBytes = new Uint8Array([...stringBig])

suite
    .add('equals_small', () => equals(smallBytes, stringSmall, 0, 0))
    .add('equals_bitwise', () => equals_bitwise(smallBytes, stringSmall, 0, 0))
    .add('loop_small', () => equals_loop(smallBytes, stringSmall, 0, 0))
    .add('equals_default', () => equals(defaultBytes, stringDefault, 0, 0))
    .add('equals_bitwise', () => equals_bitwise(defaultBytes, stringDefault, 0, 0))
    .add('loop_default', () => equals_loop(defaultBytes, stringDefault, 0, 0))
    .add('equals_big', () => equals(bigBytes, bigBytes, 0, 0))
    .add('equals_bitwise', () => equals_bitwise(bigBytes, stringBig, 0, 0))
    .add('loop_big', () => equals_loop(bigBytes, stringBig, 0, 0))
    .on('cycle', function (event) {
        console.log(String(event.target))
    }
    )
    .on('complete', function () {
        formatBenchmarkResults(this)
    })
    .run({ 'async': true })
