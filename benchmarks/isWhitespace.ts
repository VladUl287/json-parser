import Benchmark from 'benchmark'
import { formatBenchmarkResults } from './utils'
import { JsonCodes } from '../src/utils/constants'

const suite = new Benchmark.Suite()

const bytes = new TextEncoder().encode("          _")

const isWhitespaceOr = (byte: number) =>
    byte === JsonCodes.SPACE || byte === JsonCodes.NEW_LINE ||
    byte === JsonCodes.TAB || byte === JsonCodes.CARRIAGE_RETURN

const isWhitespaceBitMap = new Uint8Array(256)
isWhitespaceBitMap[JsonCodes.SPACE] = 1
isWhitespaceBitMap[JsonCodes.NEW_LINE] = 1
isWhitespaceBitMap[JsonCodes.TAB] = 1
isWhitespaceBitMap[JsonCodes.CARRIAGE_RETURN] = 1

const isWhitespaceMap = (byte: number) => isWhitespaceBitMap[byte]

const WS_BITMASK =
    (1 << JsonCodes.SPACE) | (1 << JsonCodes.NEW_LINE) |
    (1 << JsonCodes.TAB) | (1 << JsonCodes.CARRIAGE_RETURN)

const isWhitespaceMask = (byte: number) => (WS_BITMASK >> byte) & 1

suite
    .add('or', () => {
        let i = 0
        while (isWhitespaceOr(bytes[i])) i++
        return i
    })
    .add('bitmap', () => {
        let i = 0
        while (isWhitespaceMap(bytes[i])) i++
        return i
    })
    .add('bitmask', () => {
        let i = 0
        while (isWhitespaceMask(bytes[i])) i++
        return i
    })
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
