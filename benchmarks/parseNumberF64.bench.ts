import Benchmark from 'benchmark'
import { parseNumberF64 } from '../src/converters/number'
import { formatBenchmarkResults } from './utils'

const suite = new Benchmark.Suite()

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const integerFastpath = encoder.encode("12345465344565")
const floatFastpath = encoder.encode("1234546.5344565")
const integerMidpath = encoder.encode("9007199254740992")
const floatMidpath = encoder.encode("90071992.54740992")
const integerSlowpath = encoder.encode("1123456789123456789123456789")
const floatSlowPathNum = encoder.encode("1.123456789123456789123456789")
suite
    // .add('integerFastpath', () => parseNumberF64(integerFastpath, decoder))
    // .add('integerFastpathDecoder', () => Number(decoder.decode(integerFastpath)))
    // .add('floatFastpath', () => parseNumberF64(floatFastpath, decoder))
    // .add('floatFastpathDecoder', () => Number(decoder.decode(floatFastpath)))
    .add('integerMidpath', () => parseNumberF64(integerMidpath, decoder))
    .add('integerMidpathDecoder', () => Number(decoder.decode(integerMidpath)))
    // .add('floatMidpath', () => parseNumberF64(floatMidpath, decoder))
    // .add('floatMidpathDecoder', () => Number(decoder.decode(floatMidpath)))
    // .add('integerSlowpath', () => parseNumberF64(integerSlowpath, decoder))
    // .add('integerSlowpathDecoder', () => Number(decoder.decode(integerSlowpath)))
    // .add('floatSlowpath', () => parseNumberF64(floatSlowPathNum, decoder))
    // .add('floatSlowpathDecoder', () => Number(decoder.decode(floatSlowPathNum)))
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
