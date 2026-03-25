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
    .add('equals_small', () => equals(smallBytes, stringSmall))
    .add('simd_small_8', () => equals_simd_8(smallBytes, stringSmall, 0))
    .add('simd_small', () => equals_simd_4(smallBytes, stringSmall, 0))
    .add('loop_small', () => equals_loop(smallBytes, stringSmall, 0))
    .add('equals_default', () => equals(defaultBytes, defaultBytes))
    .add('simd_default_8', () => equals_simd_8(defaultBytes, stringDefault, 0))
    .add('simd_default', () => equals_simd_4(defaultBytes, stringDefault, 0))
    .add('loop_default', () => equals_loop(defaultBytes, stringDefault, 0))
    .add('equals_big', () => equals(bigBytes, bigBytes))
    .add('simd_big_8', () => equals_simd_8(bigBytes, stringBig, 0))
    .add('simd_big', () => equals_simd_4(bigBytes, stringBig, 0))
    .add('loop_big', () => equals_loop(bigBytes, stringBig, 0))
    .on('cycle', function (event) { console.log(String(event.target)) })
    .on('complete', function () { formatBenchmarkResults(this) })
    .run({ 'async': true })

function equals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false
    if (a.length < 4) return equals_loop(a, b, 0)
    if (a.length < 8) return equals_simd_4(a, b, 0)
    return equals_simd_8(a, b, 0)
}

function equals_loop(a: Uint8Array, b: Uint8Array, start: number): boolean {
    let j = start
    let index = start
    while (j < b.length) {
        if (a[index] !== b[j])
            return false
        index++
        j++
    }
    return true
}

function equals_simd_4(aArr: Uint8Array, bArr: Uint8Array, start: number) {
    let j = start
    let index = start
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
            return false

        index += 4
        j += 4
    }
    return equals_loop(aArr, bArr, j)
}

function equals_simd_8(aArr: Uint8Array, bArr: Uint8Array, start: number): boolean {
    let j = start
    let index = start
    while (j < bArr.length - 8) {
        const a = aArr[index]
        const b = aArr[index + 1]
        const c = aArr[index + 2]
        const d = aArr[index + 3]
        const e = aArr[index + 4]
        const f = aArr[index + 5]
        const g = aArr[index + 6]
        const x = aArr[index + 7]

        const aa = bArr[j]
        const bb = bArr[j + 1]
        const cc = bArr[j + 2]
        const dd = bArr[j + 3]
        const ee = bArr[j + 4]
        const ff = bArr[j + 5]
        const gg = bArr[j + 6]
        const xx = bArr[j + 7]

        if (a != aa || b != bb || c != cc || d != dd || e != ee || f != ff || g != gg || x != xx)
            return false

        index += 8
        j += 8
    }
    return equals_simd_4(aArr, bArr, j)
}