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

function parseArray(
    bytes: Uint8Array<ArrayBuffer>, metadata: Metadata, encoder: TextEncoder,
    start: number) {
    let i = start

    if (bytes[i] !== BRANCE_OPEN())
        return "fail parseArray"

    i = skipWhitespace(bytes, i)

    while (bytes[i] !== BRANCE_CLOSE()) {

        i++
    }
}

function parseObject(
    bytes: Uint8Array<ArrayBuffer>, metadata: Metadata, index: number, options: JsonOptions): Result<[unknown, number], string> {

    if (bytes[index] !== OPEN())
        return error("fail parseObject")
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

            const parseResult = parseValue(bytes, field ?? field.value, index, options)
            const resultValue = parseResult.getOrElse(null)

            index = resultValue[1]

            yield [field.name, resultValue[0]]
        }
    }

    const fields = getFields(metadata.fields)
    const result = Object.fromEntries(fields)

    if (bytes[index] !== CLOSE())
        return error("fail parseObject")

    index = skipWhitespace(bytes, index)

    return success([result, index])
}

export function parseValue(
    bytes: Uint8Array<ArrayBuffer>, metadata: Metadata | MetadataField, index: number, options: JsonOptions):
    Result<[unknown, number], string> {

    let converter = options.converters.get(metadata.type)
    if (!converter)
        return error(`Converter not found for type ${metadata.type}`)

    index = skipWhitespace(bytes, index)

    return converter(bytes, metadata, index, options)
}

let parseNubmer: Converter = (bytes, metadata, index, options) => {
    let j = index
    while (bytes[j] !== CLOSE() && bytes[j] !== COMMA()) {
        j++
    }
    const str = new TextDecoder().decode(bytes.slice(index, j))
    const indexAfterValue = bytes[j] === COMMA() ? j + 1 : j
    return success([Number(str), indexAfterValue])
}

export type Converter =
    (bytes: Uint8Array<ArrayBuffer>, metadata: Metadata | MetadataField, index: number, options: JsonOptions) =>
        Result<[unknown, number], string>

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

    console.log(bytes, metadata)

    let result = parseValue(bytes, metadata, 0, jsonOptions)
    return result.getOrElse(undefined)[0] as T
}