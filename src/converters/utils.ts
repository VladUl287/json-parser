import { JsonCodes } from "../utils/constants"

const isWhitespaceBitMap = new Uint8Array(256)
isWhitespaceBitMap[JsonCodes.SPACE] = 1
isWhitespaceBitMap[JsonCodes.NEW_LINE] = 1
isWhitespaceBitMap[JsonCodes.TAB] = 1
isWhitespaceBitMap[JsonCodes.CARRIAGE_RETURN] = 1

export const isWhitespace = (byte: number) => isWhitespaceBitMap[byte]

export function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    while (i < bytes.length && isWhitespace(bytes[i]))
        i++
    return i
}
