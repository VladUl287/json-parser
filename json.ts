import { createCache } from "./cache"
import { toMetadata, Metadata, TypeName, MetadataField } from "./metadata"
import { error, Result, success } from "./result"

const TAB = () => 9 //\t
const NEW_LINE = () => 10 //\n
const LINE_END = () => 13 //\r
const SPACE = () => 32
const QUOTE = () => 34 //"
const COMMA = () => 44 //,
const SEPARATOR = () => 58 //:
const OPEN = () => 123 //{
const CLOSE = () => 125 //}
const BRANCE_OPEN = () => 91 //[
const BRANCE_CLOSE = () => 93 //]

function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    let byte = bytes[i]
    while (byte === SPACE() || byte === TAB() || byte === NEW_LINE() || byte === LINE_END()) {
        byte = bytes[i++]
    }
    return i
}

function parseObject(ctx: ParseContext): Result<[unknown, number], string> {

    let { bytes, index, options, metadata } = ctx

    index = skipWhitespace(bytes, index)

    if (bytes[index] !== OPEN())
        return error("fail parseObject open not found")
    index++

    function* getFields(fields: MetadataField[]): Iterable<readonly [PropertyKey, any]> {
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i]

            index = skipWhitespace(bytes, index)

            console.log(index)

            if (bytes[index] !== QUOTE())
                throw new Error(`not start of property`)
            index++

            const fieldName = options.encoder.encode(field.name)
            let j = 0
            while (j < fieldName.length) {
                if (bytes[index] !== fieldName[j])
                    throw new Error(`not correct property`)

                index++
                j++
            }
            index++

            if (bytes[index] !== SEPARATOR())
                throw new Error(`not end of property`)
            index++

            index = skipWhitespace(bytes, index)

            const parseResult = parseValue({ ...ctx, index })
            console.log('parseResult:', parseResult)

            const resultValue = parseResult.getOrElse(null)

            index = resultValue[1]

            yield [field.name, resultValue[0]]
        }
    }

    const fields = getFields((metadata as Metadata).fields)
    const result = Object.fromEntries(fields)

    if (bytes[index] !== CLOSE())
        return error("fail parseObject close not found")

    index = skipWhitespace(bytes, index)

    return success([result, index])
}

type ParseContext = {
    bytes: Uint8Array<ArrayBuffer>
    metadata: Metadata | MetadataField
    options: JsonOptions
    index: number
    depth: number
}

export function parseValue(ctx: ParseContext): Result<[unknown, number], string> {
    const { metadata, options, depth } = ctx

    if (depth > options.maxDepth)
        return error(`Max depth hit ${options.maxDepth}`)

    const converter = options.converters.get(metadata.type)

    if (!converter)
        return error(`Converter not found for type ${metadata.type}`)

    return converter({
        ...ctx,
        depth: depth + 1
    })
}

let parseNubmer: Converter = ({ bytes, metadata, index, options }) => {
    index = skipWhitespace(bytes, index)

    let j = index
    while (bytes[j] !== CLOSE() && bytes[j] !== COMMA()) {
        j++
    }

    const str = new TextDecoder().decode(bytes.slice(index, j))
    const indexAfterValue = bytes[j] === COMMA() ? j + 1 : j

    return success([Number(str), indexAfterValue])
}

export type Converter = (ctx: ParseContext) => Result<[unknown, number], string>

export type JsonOptions = {
    encoder?: TextEncoder
    converters?: Map<TypeName, Converter>
    maxDepth?: number
    allowTrailingCommas?: boolean,
    fieldCaseInsensitive?: boolean
    allowDuplicateProperties?: boolean
}

const metadataCache = createCache<unknown, Metadata>()

const defaultOptions: JsonOptions = Object.freeze({
    encoder: new TextEncoder(),
    converters: new Map<TypeName, Converter>([
        ["number", parseNubmer],
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

    const bytes = jsonOptions.encoder.encode(json)

    const metadata = metadataCache.getOrAdd(object, (obj) => toMetadata(obj))

    console.log(bytes, metadata, jsonOptions)

    let result = parseValue({
        bytes,
        metadata: metadata,
        options: jsonOptions,
        index: 0,
        depth: 0
    })
    return result.getOrElse(undefined)[0] as T
}