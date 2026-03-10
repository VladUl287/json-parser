import { parseValue } from "../serailizer"
import { JsonCodes } from "../utils/constants"
import { Metadata } from "../../metadata"
import { error, success } from "../../result"
import { ConverterResult, ParseContext } from "./types"
import { skipWhitespace } from "./utils"

export function parseObject(ctx: ParseContext): ConverterResult {
    let { bytes, index, options, metadata } = ctx

    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.CURLY_OPEN)
        return error(`fail parseObject open not found ${index}  ${ctx.depth}`)
    index++

    function* toFields(fields: Metadata[]): Iterable<readonly [PropertyKey, any]> {
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i]

            index = skipWhitespace(bytes, index)

            if (bytes[index] !== JsonCodes.DOUBLE_QUOTE)
                throw new Error(`not start of property ${index}`)
            index++

            const fieldName = options.encoder.encode(field.name)
            let j = 0
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

            const parseResult = parseValue({
                ...ctx,
                metadata: field,
                index
            })
            const resultValue = parseResult.getOrElse(null)

            index = resultValue[1]

            if (bytes[index] === JsonCodes.COMMA) {
                if (fields.length - 1 === i && !options.allowTrailingCommas) {
                    throw new Error("trailing comma")
                }
                index++
            }

            yield [field.name, resultValue[0]]
        }
    }

    const fields = toFields((metadata as Metadata).value as Metadata[])
    const result = Object.fromEntries(fields)

    if (bytes[index] !== JsonCodes.CURLY_CLOSE)
        return error("fail parseObject close not found")

    index = skipWhitespace(bytes, index)

    return success([result, index])
}
