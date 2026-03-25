import Benchmark from 'benchmark'
import { formatBenchmarkResults } from './utils'

const suite = new Benchmark.Suite()

const stringSmall = new TextEncoder().encode("phone")
const smallBytes = new Uint8Array([...stringSmall])
const stringDefault = new TextEncoder().encode("phoneNumber")
const defaultBytes = new Uint8Array([...stringDefault])
const stringBig = new TextEncoder().encode("phoneNumberphoneNumberphoneNumberphoneNumber")
const bigBytes = new Uint8Array([...stringBig])

suite
    .add('simd_small', () => simd_loop(smallBytes, stringSmall))
    .add('loop_small', () => loop(smallBytes, stringSmall))
    .add('simd_default', () => simd_loop(defaultBytes, stringDefault))
    .add('loop_default', () => loop(defaultBytes, stringDefault))
    .add('simd_big', () => simd_loop(bigBytes, stringBig))
    .add('loop_big', () => loop(bigBytes, stringBig))
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .on('complete', function () {
        formatBenchmarkResults(this)
    })
    .run({ 'async': true })

function loop(a: Uint8Array, b: Uint8Array) {
    let j = 0
    let index = 0
    while (j < b.length) {
        if (a[index] !== b[j]) throw new Error(`not equal`)
        index++
        j++
    }
    return index + j
}

function simd_loop(aArr: Uint8Array, bArr: Uint8Array) {
    let j = 0
    let index = 0
    while (j < bArr.length - 4) {
        const a = aArr[index]
        const b = aArr[index + 1]
        const c = aArr[index + 2]
        const d = aArr[index + 3]

        const aa = bArr[j]
        const bb = bArr[j + 1]
        const cc = bArr[j + 2]
        const dd = bArr[j + 3]

        if (a != aa || b != bb || c != cc || d != dd)
            throw new Error(`not correct property`)

        index += 4
        j += 4
    }
    while (j < bArr.length) {
        if (aArr[index] !== bArr[j]) throw new Error(`not equal`)
        index++
        j++
    }
    return index + j
}