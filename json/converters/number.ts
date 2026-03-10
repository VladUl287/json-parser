import { JsonCodes } from "../utils/constants"
import { success } from "../../result"
import { ConverterResult, ParseContext } from "./types"
import { skipWhitespace } from "./utils"

export function parseNubmer({ bytes, index, options }: ParseContext): ConverterResult {
    index = skipWhitespace(bytes, index)

    let j = index
    while (bytes[j] !== JsonCodes.CURLY_CLOSE && bytes[j] !== JsonCodes.COMMA) {
        j++
    }

    const numberString = options.decoder.decode(bytes.slice(index, j))
    return success([Number(numberString), j])
}
