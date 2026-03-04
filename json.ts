export function deserialize<T>(json: string, metadata: T): T {
    const encoder = new TextEncoder()
    const jsonBytes = encoder.encode(json)

    console.log(jsonBytes)

    let position = 0

    const TAB = () => 9
    const NEW_LINE = () => 10
    const LINE_END = () => 13
    const SPACE = () => 32
    const SEPARATOR = () => 58 //:

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

    const parseValue = (
        type: "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function",
        bytes: Uint8Array<ArrayBuffer>,
        offset: number): any => {

        switch (type) {
            case "number":
                return bytes[offset] - 48
            default:
                return null
        }
    }

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

        result[field.name] = parseValue(field.type, jsonBytes, position)

        skipWhitespace()
    })

    return result as T
}