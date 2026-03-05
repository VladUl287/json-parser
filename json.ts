import { parseValue as parseValue } from "./types"

export function deserialize<T>(json: string, metadata: T): T {
    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(json)

    console.log(jsonBytes)

    let position = 0

    const TAB = () => 9 //\t
    const NEW_LINE = () => 10 //\n
    const LINE_END = () => 13 //\r
    const SPACE = () => 32
    const QUOTE = () => 34 //"
    const SEPARATOR = () => 58 //:
    const OPEN = () => 123 //{
    const CLOSE = () => 125 //}

    let skipWhitespace = () => {
        let byte = jsonBytes[position]
        while (byte === SPACE() || byte === TAB() || byte === NEW_LINE() || byte === LINE_END()) {
            byte = jsonBytes[position++]
        }
    }

    const fields = Object.keys(metadata)
        .map(key => ({
            name: key,
            type: typeof metadata[key as keyof T]
        }))

    position++ //{

    const result = JSON.parse(JSON.stringify(metadata))

    fields.forEach(field => {
        skipWhitespace()

        position++ //"

        let fieldBytes = encoder.encode(field.name)

        if (jsonBytes[position + fieldBytes.length + 1] !== SEPARATOR()) {
            console.error("wrong field with separator")
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
        skipWhitespace()

        let valueEndPosition = position
        while (jsonBytes[valueEndPosition] !== CLOSE()) {
            valueEndPosition++
        }

        result[field.name] = parseValue(field.type, jsonBytes.slice(position, valueEndPosition))

        position = valueEndPosition

        skipWhitespace()
    })

    return result as T
}