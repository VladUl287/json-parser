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
    .add('equals_small', () => equals(smallBytes, stringSmall, 0, 0))
    .add('simd_small_8', () => equals_simd_8(smallBytes, stringSmall, 0, 0))
    .add('simd_small', () => equals_simd_4(smallBytes, stringSmall, 0, 0))
    .add('loop_small', () => equals_loop(smallBytes, stringSmall, 0, 0))
    .add('equals_default', () => equals(defaultBytes, defaultBytes, 0, 0))
    .add('simd_default_8', () => equals_simd_8(defaultBytes, stringDefault, 0, 0))
    .add('simd_default', () => equals_simd_4(defaultBytes, stringDefault, 0, 0))
    .add('loop_default', () => equals_loop(defaultBytes, stringDefault, 0, 0))
    .add('equals_big', () => equals(bigBytes, bigBytes, 0, 0))
    .add('simd_big_8', () => equals_simd_8(bigBytes, stringBig, 0, 0))
    .add('simd_big', () => equals_simd_4(bigBytes, stringBig, 0, 0))
    .add('loop_big', () => equals_loop(bigBytes, stringBig, 0, 0))
    .on('cycle', function (event) {
        console.log(String(event.target))
    }
    )
    .on('complete', function () {
        formatBenchmarkResults(this)
    })
    .run({ 'async': true })

function equals(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    if (a.length !== b.length) return false
    if (a.length < 4) return equals_loop(a, b, aI, bI)
    if (a.length < 8) return equals_simd_4(a, b, aI, bI)
    return equals_simd_8(a, b, aI, bI)
}

function equals_loop(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    while (aI < b.length) {
        if (a[aI] != b[bI])
            return false
        aI++
        bI++
    }
    return true
}

function equals_simd_4(aArr: Uint8Array, bArr: Uint8Array, aI: number, bI: number) {
    while (aI < bArr.length - 4) {
        const a = aArr[aI]
        const b = aArr[aI + 1]
        const c = aArr[aI + 2]
        const d = aArr[aI + 3]

        const aa = bArr[bI]
        const bb = bArr[bI + 1]
        const cc = bArr[bI + 2]
        const dd = bArr[bI + 3]

        if (a != aa || b != bb || c != cc || d != dd)
            return false

        aI += 4
        bI += 4
    }
    return equals_loop(aArr, bArr, aI, bI)
}

function equals_simd_8(aArr: Uint8Array, bArr: Uint8Array, aI: number, bI: number): boolean {
    while (aI < bArr.length - 8) {
        const a = aArr[aI]
        const b = aArr[aI + 1]
        const c = aArr[aI + 2]
        const d = aArr[aI + 3]
        const e = aArr[aI + 4]
        const f = aArr[aI + 5]
        const g = aArr[aI + 6]
        const x = aArr[aI + 7]

        const aa = bArr[bI]
        const bb = bArr[bI + 1]
        const cc = bArr[bI + 2]
        const dd = bArr[bI + 3]
        const ee = bArr[bI + 4]
        const ff = bArr[bI + 5]
        const gg = bArr[bI + 6]
        const xx = bArr[bI + 7]

        if (a != aa || b != bb || c != cc || d != dd || e != ee || f != ff || g != gg || x != xx)
            return false

        aI += 8
        bI += 8
    }
    return equals_simd_4(aArr, bArr, aI, bI)
}