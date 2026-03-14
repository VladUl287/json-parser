function formatTime(nanoseconds) {
    const units = [
        { threshold: 1, unit: 'ns', divisor: 1, precision: 0 },
        { threshold: 1000, unit: 'µs', divisor: 1000, precision: 2 },
        { threshold: 1000 * 1000, unit: 'ms', divisor: 1000 * 1000, precision: 2 },
        { threshold: 1000 * 1000 * 1000, unit: 's', divisor: 1000 * 1000 * 1000, precision: 2 }
    ];

    for (let i = units.length - 1; i >= 0; i--) {
        if (nanoseconds >= units[i].threshold) {
            const value = nanoseconds / units[i].divisor;
            return `${value.toFixed(units[i].precision)} ${units[i].unit}`;
        }
    }

    return `${nanoseconds.toFixed(0)} ns`;
}

export function formatBenchmarkResults(suite) {
    const results = []
    let fastest = null

    suite.forEach((bench) => {
        if (bench.stats) {
            const meanNs = bench.stats.mean * 1e9
            const errorNs = bench.stats.moe * 1e9
            const stdDevNs = bench.stats.deviation * 1e9
            const medianNs = bench.stats.median * 1e9

            results.push({
                name: bench.name,
                mean: meanNs,
                error: errorNs,
                stdDev: stdDevNs,
                median: medianNs,
                ops: Math.round(1 / bench.stats.mean)
            });

            if (!fastest || meanNs < fastest.mean) {
                fastest = { name: bench.name, mean: meanNs }
            }
        }
    })

    // Sort by mean (fastest first)
    results.sort((a, b) => a.mean - b.mean)

    // Print table
    console.log('\n' + '='.repeat(80))
    console.log('Benchmark Results')
    console.log('='.repeat(80))

    // Header
    console.log(
        'Method'.padEnd(25) +
        'Mean'.padEnd(15) +
        'Error'.padEnd(15) +
        'StdDev'.padEnd(15) +
        'Ops/sec'.padEnd(15)
    )
    console.log('-'.repeat(80))

    // Rows
    results.forEach(r => {
        const marker = r.name === fastest.name ? '*' : ' '

        console.log(
            marker + ' ' + r.name.padEnd(23) +
            formatTime(r.mean).padEnd(15) +
            formatTime(r.error).padEnd(15) +
            formatTime(r.stdDev).padEnd(15) +
            r.ops.toLocaleString().padEnd(15)
        )
    })

    console.log('-'.repeat(80))
    console.log(`* Fastest: ${fastest.name} (${formatTime(fastest.mean)})`)

    // Ratio comparison
    console.log('\nRatio Comparison:')
    results.forEach(r => {
        const ratio = Number((r.mean / fastest.mean).toFixed(2))
        const bar = '█'.repeat(Math.round(ratio * 10))
        console.log(`${r.name.padEnd(25)} ${ratio}x ${bar}`)
    })

    return results
}