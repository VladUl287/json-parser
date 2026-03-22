import { JsonCodes } from "../utils/constants"

const isWhitespace = (byte: number) =>
    byte === JsonCodes.SPACE || byte === JsonCodes.NEW_LINE ||
    byte === JsonCodes.TAB || byte === JsonCodes.CARRIAGE_RETURN

export function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    while (i < bytes.length && isWhitespace(bytes[i]))
        i++
    return i
}
