import { JsonCodes } from "../utils/constants"

const whitespace = new Set([JsonCodes.SPACE, JsonCodes.TAB, JsonCodes.NEW_LINE, JsonCodes.CARRIAGE_RETURN])

export function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    while (i < bytes.length && whitespace.has(bytes[i]))
        i++
    return i
}
