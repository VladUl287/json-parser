export function equals(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    const length = Math.min(a.length - aI, b.length - bI)
    if (length <= 0) return true
    if (length < 4) return equals_loop(a, b, aI, bI)
    if (length < 8) return equals_simd_4(a, b, aI, bI)
    return equals_simd_8(a, b, aI, bI)
}

export function equals_loop(a: Uint8Array, b: Uint8Array, aI: number, bI: number): boolean {
    while (aI < b.length) {
        if (a[aI] !== b[bI])
            return false
        aI++
        bI++
    }
    return true
}

export function equals_simd_4(aArr: Uint8Array, bArr: Uint8Array, aI: number, bI: number) {
    while (aI < bArr.length - 4) {
        const a = aArr[aI]
        const b = aArr[aI + 1]
        const c = aArr[aI + 2]
        const d = aArr[aI + 3]

        const aa = bArr[bI]
        const bb = bArr[bI + 1]
        const cc = bArr[bI + 2]
        const dd = bArr[bI + 3]

        if (a !== aa || b !== bb || c !== cc || d !== dd)
            return false

        aI += 4
        bI += 4
    }
    return equals_loop(aArr, bArr, aI, bI)
}

export function equals_simd_8(aArr: Uint8Array, bArr: Uint8Array, aI: number, bI: number): boolean {
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

        if (a !== aa || b !== bb || c !== cc || d !== dd || e !== ee || f !== ff || g !== gg || x !== xx)
            return false

        aI += 8
        bI += 8
    }
    return equals_simd_4(aArr, bArr, aI, bI)
}