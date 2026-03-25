import { JsonCodes } from "../utils/constants"
import { Metadata } from "../metadata/metadata"
import { ConvertResult, ConvertState } from "./types"
import { skipWhitespace } from "./utils"

export function convertObject(ctx: ConvertState): ConvertResult<object> {
    let { bytes, index, metadata } = ctx

    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.CURLY_OPEN)
        throw new Error(`fail parseObject open not found ${index}  ${ctx.depth}`)

    index++

    const meta = (metadata as Metadata).value as Metadata[]
    const [fields, i] = toFields(meta, bytes, index)
    const result = (metadata as Metadata).creator(fields)

    index = i

    if (bytes[index] !== JsonCodes.CURLY_CLOSE)
        throw new Error("fail parseObject close not found")

    return {
        value: result,
        nextIndex: index
    }
}

const fieldResult = new Array<any>(16)
function toFields(fields: Metadata[], bytes: Uint8Array<ArrayBuffer>, index: number): [any[], number] {
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

        // const parseResult = ctx.convert({
        //     ...ctx,
        //     metadata: field,
        //     index
        // })

        // index = parseResult.nextIndex

        while (bytes[index] !== JsonCodes.CURLY_CLOSE && bytes[index] !== JsonCodes.COMMA) {
            index++
        }

        if (bytes[index] === JsonCodes.COMMA) {
            index++
        }

        fieldResult[i] = field.defaultValue
    }

    return [fieldResult, index]
}