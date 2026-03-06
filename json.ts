import { createCache } from "./cache"
import { toMetadata, Metadata, TypeName } from "./metadata"

const TAB = () => 9 //\t
const NEW_LINE = () => 10 //\n
const LINE_END = () => 13 //\r
const SPACE = () => 32
const QUOTE = () => 34 //"
const COMMA = () => 44
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
    bytes: Uint8Array<ArrayBuffer>, metadata: Metadata, encoder: TextEncoder,
    start: number) {
    let i = start

    if (bytes[i] !== OPEN())
        return ["fail parseObject", -1]

    i++

    i = skipWhitespace(bytes, i)

    metadata.fields.forEach((field) => {
        i = skipWhitespace(bytes, i)

        if (bytes[i] !== QUOTE()) {
            throw new Error("not start of field")
        }
        i++

        let fieldName = encoder.encode(field.name)

        const fieldEndPosition = i + fieldName.length

        let j = 0
        while (i < fieldEndPosition) {
            if (bytes[i] !== fieldName[j]) {
                throw new Error(`wrong field with separator '${i} ${j}'`)
            }

            i++
            j++
        }

        i++

        if (bytes[i] !== SEPARATOR()) {
            throw new Error(`wrong field with separator '${field.name}'`)
        }

        i = skipWhitespace(bytes, ++i)

        const [value, index] = parseValue(field.type, bytes, field.value, i)

        // output[field.name] = value
        // i = index
    })

    i = skipWhitespace(bytes, i)

    if (bytes[i] !== CLOSE())
        return ["fail parseObject 2", -1]

    // return [output, i]
}

function* gen1(): Iterable<readonly [PropertyKey, any]> {
    yield ["field1", 1]
    yield ["field2", 2]
}

export function parseValue(
    type: TypeName, bytes: Uint8Array<ArrayBuffer>, metadata: Metadata, start: number) {

    let a = gen1()
    Object.fromEntries(a)

    let i = skipWhitespace(bytes, start)

    switch (type) {
        case "number":
            let j = i
            while (bytes[j] !== CLOSE() && bytes[j] !== COMMA()) {
                j++
            }
            const str = new TextDecoder().decode(bytes.slice(i, j))
            return [Number(str), j + 1]
        case "array":
            return parseArray(bytes, metadata, new TextEncoder(), i)
        case "object":
            return parseObject(bytes, metadata, new TextEncoder(), i)
        default:
            return null
    }
}

export type Converter = {
    type: TypeName
    convert: (bytes: Uint8Array<ArrayBuffer>, metadata: Metadata, index: number, options: JsonOptions) => unknown
}

export type JsonOptions = {
    encoder?: TextEncoder
    converters?: Converter[]
    maxDepth?: number
    allowTrailingCommas?: boolean,
    fieldCaseInsensitive?: boolean
    allowDuplicateProperties?: boolean
    commentHandling?: string
}

const metadataCache = createCache<unknown, Metadata>()

export function deserialize<T>(json: string, object: T, options?: JsonOptions): T {
    const encoder = options?.encoder ?? new TextEncoder()
    const bytes = encoder.encode(json)

    const metadata = metadataCache.getOrAdd(object, () => toMetadata(object))

    const [value, _] = parseValue(metadata.type, bytes, metadata, 0)

    return value as T
}