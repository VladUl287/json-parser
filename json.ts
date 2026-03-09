import { createCache } from "./cache"
import { JsonCodes } from "./jsonConstants"
import { Converter, JsonOptions, DeserializeContext } from "./jsonTypes"
import { toMetadata, Metadata, TypeName } from "./metadata"
import { error, Result, success } from "./result"

function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    const { SPACE, TAB, NEW_LINE, CARRIAGE_RETURN } = JsonCodes

    let byte = bytes[i]
    while (byte === SPACE || byte === TAB || byte === NEW_LINE || byte === CARRIAGE_RETURN) {
        byte = bytes[++i]
    }
    return i
}

function parseObject(ctx: DeserializeContext): Result<[unknown, number], string> {
    let { bytes, index, options, metadata } = ctx

    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.CURLY_OPEN)
        return error(`fail parseObject open not found ${index}  ${ctx.depth}`)
    index++

    function* getFields(fields: Metadata[]): Iterable<readonly [PropertyKey, any]> {
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

            yield [field.name, resultValue[0]]
        }
    }

    const fields = getFields((metadata as Metadata).value as Metadata[])
    const result = Object.fromEntries(fields)

    if (bytes[index] !== JsonCodes.CURLY_CLOSE)
        return error("fail parseObject close not found")

    index = skipWhitespace(bytes, index)

    return success([result, index])
}

export function parseValue(ctx: DeserializeContext): Result<[unknown, number], string> {
    const { metadata, options, depth } = ctx

    if (depth > options.maxDepth)
        return error(`Max depth hit ${options.maxDepth}`)

    const converter = options.converters.get((metadata as Metadata).type)

    if (!converter)
        return error(`Converter not found for type ${(metadata as Metadata).type}`)

    return converter({
        ...ctx,
        depth: depth + 1
    })
}

let parseNubmer: Converter = ({ bytes, metadata, index, options }) => {
    index = skipWhitespace(bytes, index)

    let j = index
    while (bytes[j] !== JsonCodes.CURLY_CLOSE && bytes[j] !== JsonCodes.COMMA) {
        j++
    }

    const str = new TextDecoder().decode(bytes.slice(index, j))
    const indexAfterValue = bytes[j] === JsonCodes.COMMA ? j + 1 : j

    return success([Number(str), indexAfterValue])
}

function parseString({ bytes, index, options, metadata }: DeserializeContext): Result<[unknown, number], string> {
    index = skipWhitespace(bytes, index)

    if (bytes[index] !== JsonCodes.DOUBLE_QUOTE)
        return error("not quote")
    index++

    let start = index
    while (bytes[index] !== JsonCodes.DOUBLE_QUOTE) {
        index++
    }

    const decoder = new TextDecoder()
    const result = decoder.decode(bytes.slice(start, index))
    index++

    const indexAfterValue = bytes[index] === JsonCodes.COMMA ? index + 1 : index
    return success([result, indexAfterValue])
}

const metadataCache = createCache<unknown, Metadata>()

const defaultOptions: JsonOptions = Object.freeze({
    encoder: new TextEncoder(),
    converters: new Map<TypeName, Converter>([
        ["number", parseNubmer],
        ["string", parseString],
        ["object", parseObject]
    ]),
    maxDepth: 64,
    allowTrailingCommas: false,
    fieldCaseInsensitive: false,
    allowDuplicateProperties: false
})

export function deserialize<T>(json: string, object: T, options?: JsonOptions): T {
    const jsonOptions: JsonOptions = {
        ...defaultOptions,
        ...Object.fromEntries(
            Object.entries(options ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: new Map<TypeName, Converter>([
            ...defaultOptions.converters,
            ...(options?.converters ?? [])
        ])
    }

    const metadata = metadataCache.getOrAdd(object, (obj) => toMetadata(obj))

    const bytes = jsonOptions.encoder.encode(json)

    console.log(bytes, '\n\n')

    const result = parseValue({
        bytes,
        metadata: metadata,
        options: jsonOptions,
        index: 0,
        depth: 0
    })
    return result.getOrElse(undefined)[0] as T
}