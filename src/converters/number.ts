import { JsonCodes } from "../utils/constants"
import { ConvertMeta, ConvertResult, ConvertState } from "./types"
import { skipWhitespace } from "./utils"

export function convertNumber(
    ctx: ConvertState, metadata: ConvertMeta, index: number, depth: number): ConvertResult<number> {
    const bytes = ctx.bytes

    index = skipWhitespace(bytes, index)

    let j = index
    while (bytes[j] !== JsonCodes.CURLY_CLOSE && bytes[j] !== JsonCodes.COMMA) {
        j++
    }

    const number = parseNumberF64(bytes.subarray(index, j))

    return {
        value: number,
        nextIndex: j
    }
}

const decoder = new TextDecoder('utf-8', { fatal: true })
const POS_POW10 = [1]
for (let i = 1; i <= 308; i++) {
    POS_POW10[i] = POS_POW10[i - 1] * 10
}

const MAX_SAFE_DIGITS_COUNT = 15

export function parseNumberF64(bytes: Uint8Array): number {
    if (bytes.length <= MAX_SAFE_DIGITS_COUNT) {
        let i = 0

        const PLUS = 43
        const MINUS = 45

        const STATE_NEGATIVE = 0x01  // bit 0
        const STATE_NONZERO = 0x02  // bit 1
        const STATE_DECIMAL = 0x04  // bit 2

        let state = 0

        if (bytes[i] === MINUS) {
            state ^= STATE_NEGATIVE
            i++
        }
        else if (bytes[i] === PLUS) {
            i++
        }

        const isDigit = (byte: number) => byte >= 48 && byte <= 57

        const ZERO = 48
        const DOT = 46
        const EXPONENT = 69
        const EXPONENT_UPPER = 101

        let mantissa = 0
        let digitsCount = 0
        let scale = 0
        let numberOfTrailingZeros = 0

        while (i < bytes.length && digitsCount <= MAX_SAFE_DIGITS_COUNT) {
            const byte = bytes[i]

            if (isDigit(byte)) {
                if (byte !== ZERO || (state & STATE_NONZERO)) {
                    mantissa = mantissa * 10 + (byte & 0x0F)

                    numberOfTrailingZeros += byte === ZERO ? 1 : 0

                    if ((state & STATE_DECIMAL) === 0) {
                        scale++
                    }

                    state |= STATE_NONZERO
                    digitsCount++
                }
                else if (state & STATE_DECIMAL) {
                    scale--
                }
            }
            else if (byte === DOT) {
                state |= STATE_DECIMAL
            }
            else if (byte === EXPONENT || byte === EXPONENT_UPPER) {
                i++

                let signExp = 1
                if (bytes[i] === MINUS) {
                    signExp = -1
                    i++
                }
                else if (bytes[i] === PLUS) {
                    i++
                }

                let exponent = 0
                while (isDigit(bytes[i])) {
                    exponent = exponent * 10 + (bytes[i] - 48)
                    i++
                }

                exponent *= signExp
                scale += exponent
                break
            }

            i++
        }

        const positiveExponent = Math.max(0, scale)
        const integerDigitsPresent = Math.min(positiveExponent, digitsCount)
        const fractionalDigitsPresent = digitsCount - integerDigitsPresent

        if (digitsCount <= MAX_SAFE_DIGITS_COUNT) {
            const exponent = scale - integerDigitsPresent - fractionalDigitsPresent
            const fastExponent = Math.abs(exponent)

            const MAX_SAFE_EXPONENT = 308

            if (fastExponent <= MAX_SAFE_EXPONENT) {
                const expScale = POS_POW10[fastExponent]

                if (fractionalDigitsPresent !== 0) {
                    mantissa /= expScale
                }
                else {
                    mantissa *= expScale
                }

                if (state & STATE_NEGATIVE)
                    return -mantissa

                return mantissa
            }
        }
    }

    return Number(decoder.decode(bytes))
}
