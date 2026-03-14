import { JsonCodes } from "../utils/constants"
import { Result, success } from "../utils/result"
import { ConvertResult, ConvertState } from "./types"
import { skipWhitespace } from "./utils"

export function convertNumber({ bytes, index, options }: ConvertState): Result<ConvertResult<number>, string> {
    index = skipWhitespace(bytes, index)

    let j = index
    while (bytes[j] !== JsonCodes.CURLY_CLOSE && bytes[j] !== JsonCodes.COMMA) {
        j++
    }

    const numberString = options.decoder.decode(bytes.slice(index, j))
    return success({
        value: Number(numberString),
        nextIndex: j
    })
}

const POS_POW10 = [1]
for (let i = 1; i <= 308; i++) {
    POS_POW10[i] = POS_POW10[i - 1] * 10
}

export function parseNumberF64(bytes: Uint8Array): number | undefined {
    let i = 0

    const PLUS = 43
    const MINUS = 45

    let isNegative = false
    if (bytes[i] === MINUS) {
        isNegative = true
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

    let mantissa = 0n
    let scale = 0
    let digitsCount = 0
    let maxDigitsCount = 19
    let numberOfTrailingZeros = 0
    let isDecimal = false
    let isNonZero = false

    while (i < bytes.length) {
        const byte = bytes[i]

        if (isDigit(byte)) {
            if (byte !== ZERO || isNonZero) {
                if (digitsCount < maxDigitsCount) {
                    mantissa = mantissa * 10n + BigInt(byte - 48)
                }

                if (!isDecimal) {
                    scale++
                }

                if (digitsCount < maxDigitsCount) {
                    numberOfTrailingZeros += byte === ZERO ? 1 : 0
                }

                isNonZero = true
                digitsCount++
            }
            else if (isDecimal) {
                scale--
            }
        }
        else if (byte === DOT) {
            isDecimal = true
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

    if (digitsCount <= 19) {
        const positiveExponent = Math.max(0, scale)
        const integerDigitsPresent = Math.min(positiveExponent, digitsCount)
        const fractionalDigitsPresent = digitsCount - integerDigitsPresent

        const exponent = scale - integerDigitsPresent - fractionalDigitsPresent
        const fastExponent = Math.abs(exponent)

        const MAX_SAFE_EXPONENT = 308

        if (mantissa <= Number.MAX_SAFE_INTEGER && fastExponent <= MAX_SAFE_EXPONENT) {
            const expScale = POS_POW10[fastExponent]

            let result = Number(mantissa)
            if (fractionalDigitsPresent != 0) {
                result /= expScale
            }
            else {
                result *= expScale
            }

            if (isNegative)
                return -result

            return result
        }

    }

    //slow path
    return undefined
}
