import Benchmark from 'benchmark'
import { parseNumberF64 } from '../src/converters/number'
import { formatBenchmarkResults } from './utils'

const suite = new Benchmark.Suite()

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const parseBytes = [
    // Basic numbers
    0,
    1,
    -1,
    3.14,
    -3.14,

    // Scientific notation
    1e-10,
    1e10,
    1.23e-5,

    // Common math constants
    Math.PI,
    Math.E,
    // Math.SQRT2,
    Math.LN2,

    // Fractions that cause floating point precision issues
    0.1,
    0.2,
    0.3,
    1 / 3,
    2 / 3,
    // 1 / 7,

    // Powers of 2
    2,
    4,
    8,
    16,
    32,
    64,
    128,
    256,
    512,
    1024,

    // Powers of 10
    10,
    100,
    1000,
    10000,
    100000,

    // Numbers with exact binary representation
    0.5,
    0.25,
    0.125,
    0.0625,
    0.03125,

    // Random values
    42.195,
    98.6,
    212.0,
    -40.0,
    273.15,

    // Large integers
    9007199254740991,
    // 9007199254740992,

    // Small numbers near zero
    1e-15,
    1e-16,
    1e-17,
    1e-18,

    // Mixed
    123456.789,
    -987654.321,
    0.000001,
    1000000,
    1.23456789,
].map(c => encoder.encode(c.toString()))

suite
    .add('decoder', function () {
        let result = 0
        for (let i = 0; i < parseBytes.length; i++) {
            result += Number(decoder.decode(parseBytes[i]))
        }
        return result
    })
    .add('parseNumberF64', function () {
        let result = 0
        for (let i = 0; i < parseBytes.length; i++) {
            result += parseNumberF64(parseBytes[i])
        }
        return result
    })
    // .on('cycle', function (event) {
    //     console.log(String(event.target));
    // })
    // .on('complete', function () {
    //     console.log('Fastest is ' + this.filter('fastest').map('name'));
    // })
    .on('complete', function () {
        formatBenchmarkResults(this)
    })
    .run({ 'async': true })
