import { JsonCodes } from "../../jsonConstants"
import { error, success } from "../../result"
import { ConverterResult, ParseContext } from "./types"
import { skipWhitespace } from "./utils"

export function parseString({ bytes, index, options }: ParseContext): ConverterResult {
    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.DOUBLE_QUOTE)
        return error("not quote")
    index++

    let start = index
    while (bytes[index] !== JsonCodes.DOUBLE_QUOTE) {
        index++
    }

    const stringValue = options.decoder.decode(bytes.slice(start, index))
    index++

    return success([stringValue, index])
}
