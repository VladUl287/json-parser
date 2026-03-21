import Benchmark from 'benchmark'
import { formatBenchmarkResults } from './utils'
import { toMetadata } from '../src/metadata/metadata'
import { deserialize } from '../src/json'

const suite = new Benchmark.Suite()

const obj = {
    id: 15,
    order: 1244,
    phone: 343543534
    // phone: {
    //     code: 7
    // },
}

const value = JSON.stringify(obj, null, 4)
const valueBytes = new TextEncoder().encode(value)
const metadata = toMetadata(obj)

suite
    .add('custom', () => deserialize(valueBytes, metadata))
    .add('native', () => JSON.parse(value))
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
