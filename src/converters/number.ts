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
