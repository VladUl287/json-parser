type TypeName =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"

export function parse(type: TypeName, bytes: Uint8Array<ArrayBuffer>, start: number, end: number): any {
    switch (type) {
        case "number":
            function parseUTF8BytesToNumber(uint8Array: Uint8Array, start: number, end: number): number {
                let result = 0

                for (let i = start; i < end; i++) {
                    const byte = uint8Array[i]

                    if (byte < 48 || byte > 57) { // ASCII '0' to '9' are 48-57
                        throw new Error('Non-digit character found');
                    }

                    const digit = byte - 48
                    result = result * 10 + digit
                }

                return result
            }

            return parseUTF8BytesToNumber(bytes, start, end)
        default:
            return null
    }
}