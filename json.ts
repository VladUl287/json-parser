import { parseValue as parseValue } from "./types"

const TAB = () => 9 //\t
const NEW_LINE = () => 10 //\n
const LINE_END = () => 13 //\r
const SPACE = () => 32
const QUOTE = () => 34 //"
const COMMA = () => 44
const SEPARATOR = () => 58 //:
const OPEN = () => 123 //{
const CLOSE = () => 125 //}

let skipWhitespace = (jsonBytes: Uint8Array<ArrayBuffer>, position: number): number => {
    let byte = jsonBytes[position]
    while (byte === SPACE() || byte === TAB() || byte === NEW_LINE() || byte === LINE_END()) {
        byte = jsonBytes[position++]
    }
    return position
}

export function deserialize<T>(json: string, metadata: T): T {
    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(json)

    console.log(jsonBytes)

    let position = 0

    const fields = Object.keys(metadata)
        .map(key => ({
            name: key,
            type: typeof metadata[key as keyof T]
        }))

    position++ //{

    const result = JSON.parse(JSON.stringify(metadata))

    fields.forEach((field) => {
        position = skipWhitespace(jsonBytes, position)

        position++ //"

        let fieldBytes = encoder.encode(field.name)

        if (jsonBytes[position + fieldBytes.length + 1] !== SEPARATOR()) {
            console.error(`wrong field with separator '${field.name}' - ${jsonBytes[position + fieldBytes.length + 1]}`)
            return
        }

        let fieldNamePosition = 0
        while (jsonBytes[position] === fieldBytes[fieldNamePosition] && fieldNamePosition < fieldBytes.length) {
            fieldNamePosition++
            position++
        }

        if (fieldNamePosition !== fieldBytes.length) {
            console.error("wrong field")
            return
        }

        position++ //"
        position++ //:
        position = skipWhitespace(jsonBytes, position)

        let valueEndPosition = position
        let valueEndByte = jsonBytes[valueEndPosition]
        while (valueEndByte !== CLOSE() && valueEndByte !== COMMA()) {
            valueEndByte = jsonBytes[valueEndPosition++]
        }
        
        result[field.name] = parseValue(field.type, jsonBytes.slice(position, valueEndPosition - 1))

        position = valueEndPosition

        position = skipWhitespace(jsonBytes, position)
    })

    return result as T
}