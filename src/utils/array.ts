export function equals(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    const length = Math.min(a.length - aI, b.length - bI)
    if (length <= 0) return true

    let i = 0

    while (i + 4 <= length) {
        const aVal = a[aI + i] | (a[aI + i + 1] << 8) | (a[aI + i + 2] << 16) | (a[aI + i + 3] << 24)
        const bVal = b[bI + i] | (b[bI + i + 1] << 8) | (b[bI + i + 2] << 16) | (b[bI + i + 3] << 24)
        if (aVal !== bVal)
            return false
        i += 4
    }

    while (i < length) {
        if (a[aI + i] !== b[bI + i])
            return false
        i++
    }

    return true
}

export function equals_loop(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    const length = Math.min(a.length - aI, b.length - bI)
    if (length <= 0) return true

    let i = 0
    while (i < length) {
        if (a[aI + i] !== b[bI + i])
            return false
        i++
    }
    
    return true
}