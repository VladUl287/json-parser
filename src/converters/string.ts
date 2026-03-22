import { JsonCodes } from "../utils/constants"
import { ConvertResult, ConvertState } from "./types"
import { skipWhitespace } from "./utils"

export function convertString({ bytes, index, options }: ConvertState): ConvertResult<string> {
    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.DOUBLE_QUOTE)
        return { error: "not quote" }
    index++

    let start = index
    while (bytes[index] !== JsonCodes.DOUBLE_QUOTE) {
        index++
    }

    const stringValue = options.decoder.decode(bytes.slice(start, index))
    index++

    return {
        value: stringValue,
        nextIndex: index
    }
}
