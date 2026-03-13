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

export function parseNumberF64(bytes: Uint8Array): number | undefined {
    let isDigits = false
    let isNegative = false
    let isDecimal = false
    let isExponent = false
    let isNotZero = false

    let i = 0
    let mantissa = 0n

    if (bytes[i] === 45 || bytes[i] === 43) { // '-' or '+'
        isNegative = true
        i++
    }

    let digitsCount = 0
    let scale = 0
    let maxDigitsCount = 19
    let numberOfTrailingZeros = 0
    let hasNonZeroTail = false
    let isExponentNegative = false

    while (i < bytes.length) {
        const byte = bytes[i]

        if (byte >= 48 && byte <= 57) {
            isDigits = true

            if (byte !== 48 || isNotZero) {
                if (digitsCount < maxDigitsCount) {
                    mantissa = mantissa * 10n + BigInt(byte - 48)
                }
                else if (byte != 48) {
                    hasNonZeroTail = true
                }

                if (!isDecimal) {
                    scale++
                }

                if (digitsCount < maxDigitsCount) {
                    if (byte === 48) {
                        numberOfTrailingZeros++
                    }
                    else {
                        numberOfTrailingZeros = 0
                    }
                }

                digitsCount++
                isNotZero = true
            }
            else if (isDecimal) {
                scale--
            }
        }

        else if (byte === 46) { // '.'
            isDecimal = true
        }

        else if (byte === 69 || byte === 101) {
            isExponent = true
            break
        }

        i++
    }

    if (isDigits) {
        if (isExponent) {
            i++

            if (bytes[i] === 45) { // '-'
                isExponentNegative = true
                i++
            }

            if (bytes[i] >= 48 && bytes[i] <= 57) {
                let exponent = 0

                while (bytes[i] >= 48 && bytes[i] <= 57) {
                    exponent = exponent * 10 + (bytes[i] - 48)
                    i++
                }

                if (isExponentNegative) {
                    exponent = -exponent
                }

                scale += exponent
            }
        }
    }

    let positiveExponent = Math.max(0, scale)
    let integerDigitsPresent = Math.min(positiveExponent, digitsCount)
    let fractionalDigitsPresent = digitsCount - integerDigitsPresent

    if (digitsCount <= 19) {
        let exponent = scale - integerDigitsPresent - fractionalDigitsPresent
        let fastExponent = Math.abs(exponent)

        let _mantisa = Number(mantissa)
        let _scale = Math.pow(10, fastExponent)

        if (fractionalDigitsPresent != 0) {
            _mantisa /= _scale
        }
        else {
            _mantisa *= _scale
        }

        return _mantisa
    }

    //slow path
    return undefined
}
