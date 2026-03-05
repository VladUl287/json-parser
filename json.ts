import { createCache } from "./cache"
import { parseValue as parseValue, toMetadata, toObject, TypeMetadata } from "./metadata"

const TAB = () => 9 //\t
const NEW_LINE = () => 10 //\n
const LINE_END = () => 13 //\r
const SPACE = () => 32
const QUOTE = () => 34 //"
const COMMA = () => 44
const SEPARATOR = () => 58 //:
const OPEN = () => 123 //{
const CLOSE = () => 125 //}

function skipWhitespace(bytes: Uint8Array<ArrayBuffer>, i: number): number {
    let byte = bytes[i]
    while (byte === SPACE() || byte === TAB() || byte === NEW_LINE() || byte === LINE_END()) {
        byte = bytes[i++]
    }
    return i
}

const metadataCache = createCache<unknown, TypeMetadata>()

function parseObject(bytes: Uint8Array<ArrayBuffer>, metadata: TypeMetadata, output: object, encoder: TextEncoder) {
    let i = 0

    if (bytes[i] !== OPEN())
        return "fail"

    i++

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

        j = i
        while (bytes[j] !== CLOSE() && bytes[j] !== COMMA()) {
            j++
        }

        output[field.name] = parseValue(field.type, bytes, i, j)

        i = j + 1
        i = skipWhitespace(bytes, i)
    })
}

export function deserialize<T>(json: string, object: T): T {
    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(json)

    const metadata = metadataCache.getOrAdd(object, () => toMetadata(object))

    const output = toObject(metadata)

    parseObject(jsonBytes, metadata, output, encoder)

    return output as T
}