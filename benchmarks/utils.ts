export function formatBenchmarkResults(suite) {
    const results = []
    let fastest = null

    suite.forEach((bench) => {
        if (bench.stats) {
            const mean = bench.stats.mean * 1000 // Convert to milliseconds
            const error = bench.stats.moe * 1000 // Margin of error
            const ops = Math.round(1 / (bench.stats.mean))

            results.push({
                name: bench.name,
                mean: mean,
                error: error,
                ops: ops,
                stdDev: bench.stats.deviation * 1000,
                samples: bench.stats.sample.length
            })

            if (!fastest || mean < fastest.mean) {
                fastest = { name: bench.name, mean: mean }
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
        const ratio = r.mean / fastest.mean
        const marker = r.name === fastest.name ? '*' : ' '

        console.log(
            marker + ' ' + r.name.padEnd(23) +
            (r.mean.toFixed(3) + ' ms').padEnd(15) +
            ('±' + r.error.toFixed(3) + ' ms').padEnd(15) +
            r.stdDev.toFixed(3).padEnd(15) +
            r.ops.toLocaleString().padEnd(15)
        )
    })

    console.log('-'.repeat(80))
    console.log(`* Fastest: ${fastest.name} (${(fastest.mean).toFixed(3)} ms)`)

    // Ratio comparison
    console.log('\nRatio Comparison:')
    results.forEach(r => {
        const ratio = Number((r.mean / fastest.mean).toFixed(2))
        const bar = '█'.repeat(Math.round(ratio * 10))
        console.log(`${r.name.padEnd(25)} ${ratio}x ${bar}`)
    })

    return results
}