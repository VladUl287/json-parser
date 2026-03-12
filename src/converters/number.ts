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
    let i = 0

    let sign = 1
    if (bytes[i] === 45) { // '-'
        sign = -1
    } else if (bytes[i] === 43) { // '+'
        i++
    }

    let mantissa = 0n
    let exponent = 0

    const safeIntegerLimit = 1n << 53n //2^53

    while (i < bytes.length && bytes[i] >= 48 && bytes[i] <= 57) {
        if (mantissa < safeIntegerLimit) {
            const digit = bytes[i] - 48
            mantissa = mantissa * 10n + BigInt(digit)
        }
        else {
            exponent++
        }
        i++;
    }

    if (i < bytes.length && bytes[i] === 46) { // '.'
        i++

        while (i < bytes.length && bytes[i] >= 48 && bytes[i] <= 57) {
            if (mantissa < safeIntegerLimit) {
                const digit = bytes[i] - 48
                mantissa = mantissa * 10n + BigInt(digit)
                exponent--
            }
            i++
        }
    }

    // if (bytes[i] === 69 || bytes[i] === 101) { // 'e' or 'E'
    //     i++
    //     continue
    // }

    console.log(mantissa, exponent, Math.pow(10, exponent))
    return Number(mantissa) * Math.pow(10, exponent)
}

export function parseUTF8BytesToNumber(uint8Array: Uint8Array, start: number, end: number): number {
    let i = start
    let result = 0
    let isNegative = false
    let isFloat = false
    let hasExponent = false
    let exponentIsNegative = false
    let decimalPlaces = 0

    const PLUS = () => 43
    const MINUS = () => 45
    const DOT = () => 46
    const EXPONENT = () => 69
    const EXPONENT_LOWER = () => 101

    if (uint8Array[i] === MINUS()) {
        isNegative = true
        i++
    }
    else if (uint8Array[i] === PLUS()) {
        i++
    }

    while (i < end) {
        const byte = uint8Array[i]

        if (byte === DOT()) {
            if (isFloat)
                throw new Error('Multiple decimal points')

            isFloat = true
            i++
            continue
        }

        if (byte === EXPONENT() || byte === EXPONENT_LOWER()) {
            if (hasExponent)
                throw new Error('Multiple exponents')

            hasExponent = true
            i++

            if (i < end) {
                if (uint8Array[i] === MINUS()) {
                    exponentIsNegative = true
                    i++
                }
                else if (uint8Array[i] === PLUS()) {
                    i++
                }
            }

            break
        }

        if (byte < 48 || byte > 57) { // ASCII '0' to '9' are 48-57
            throw new Error('Non-digit character found')
        }

        const digit = byte - 48
        result = result * 10 + digit

        if (isFloat) {
            decimalPlaces++
        }

        i++
    }

    let exponent = 0
    if (hasExponent) {
        while (i < end) {
            const byte = uint8Array[i]

            if (byte < 48 || byte > 57) {
                throw new Error(`Non-digit in exponent: ${String.fromCharCode(byte)}`)
            }

            exponent = exponent * 10 + (byte - 48)
            i++
        }

        if (exponentIsNegative) {
            exponent = -exponent;
        }

        result = result * Math.pow(10, exponent)
    }

    if (isFloat && decimalPlaces > 0) {
        result = result / Math.pow(10, decimalPlaces)
    }

    if (isNegative) {
        result = -result
    }

    return result
}