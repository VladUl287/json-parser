import { JsonCodes } from "../utils/constants"
import { Metadata } from "../metadata/metadata"
import { ConvertResult, ConvertState } from "./types"
import { skipWhitespace } from "./utils"

const tempFieldArray = new Uint8Array(8)
export function convertObject(ctx: ConvertState): ConvertResult<object> {
    let { bytes, index, options, metadata } = ctx

    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.CURLY_OPEN)
        return {
            error: `fail parseObject open not found ${index}  ${ctx.depth}`
        }

    index++

    function toFields(fields: Metadata[]): any[] {
        const result = new Array<any>(fields.length)

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i]

            index = skipWhitespace(bytes, index)

            if (bytes[index] !== JsonCodes.DOUBLE_QUOTE)
                throw new Error(`not start of property ${index}`)
            index++

            let j = 0
            const fieldName = field.nameBytes
            while (j < fieldName.length) {
                if (bytes[index] !== fieldName[j])
                    throw new Error(`not correct property ${field.name}`)

                index++
                j++
            }
            index++

            if (bytes[index] !== JsonCodes.COLON)
                throw new Error(`not end of property`)
            index++

            index = skipWhitespace(bytes, index)

            const parseResult = ctx.convert({
                ...ctx,
                metadata: field,
                index
            })

            index = parseResult.nextIndex

            if (bytes[index] === JsonCodes.COMMA) {
                index++
            }

            result[i] = parseResult.value
        }

        if (bytes[index - 1] === JsonCodes.COMMA && !options.allowTrailingCommas) {
            throw new Error("trailing comma")
        }

        return result
    }

    const fields = toFields((metadata as Metadata).value as Metadata[])
    const result = (metadata as Metadata).creator(fields)

    if (bytes[index] !== JsonCodes.CURLY_CLOSE)
        return {
            error: "fail parseObject close not found"
        }

    index = skipWhitespace(bytes, index)

    return {
        value: result,
        nextIndex: index
    }
}
