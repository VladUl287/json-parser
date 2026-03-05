export type TypeName =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "array"
    | "function"
    | "date"

export type TypeMetadata = {
    name: string,
    type: TypeName
    optional?: boolean
    nullable?: boolean
    value?: TypeMetadata[]
    description?: string
    defaultValue?: unknown
}

function getType(value: unknown): TypeName {
    if (Array.isArray(value))
        return "array"

    if (value instanceof Date)
        return "date"

    return typeof value
}

export function toMetadata<T>(object: T): TypeMetadata[] | undefined {
    if (typeof object !== "object")
        return

    if (Array.isArray(object))
        return toMetadata(object[0])

    return Object.keys(object)
        .map(key => ({
            name: key,
            type: getType(object[key as keyof T]),
            value: toMetadata(object[key as keyof T])
        }))
}

export function toObject(metadata: TypeMetadata[]): object {
    return Object.fromEntries(
        metadata.map(field => {
            let defaultValue: any;

            switch (field.type) {
                case 'string':
                    defaultValue = ''
                    break
                case 'number':
                    defaultValue = 0
                    break
                case 'boolean':
                    defaultValue = false
                    break
                case 'array':
                    defaultValue = field.value
                        ? field.value.map(() => toObject(field.value || []))
                        : []
                    break
                case 'object':
                    defaultValue = field.value
                        ? toObject(field.value)
                        : {}
                    break
                case 'undefined':
                    defaultValue = undefined
                    break
                case 'date':
                    defaultValue = new Date()
                    break
                default:
                    defaultValue = null
            }

            if (field.nullable) defaultValue = null
            if (field.optional && field.type !== 'array' && field.type !== 'object') {
                defaultValue = undefined
            }

            return [field.name, defaultValue]
        })
    )
}

export function parseValue(type: TypeName, bytes: Uint8Array<ArrayBuffer>): any {
    switch (type) {
        case "number":
            const str = new TextDecoder().decode(bytes)
            return Number(str)
        default:
            return null
    }
}

export function parseUTF8BytesToNumber(uint8Array: Uint8Array, start: number, end: number): number {
    let i = start
    let result = 0
    let isNegative = false
    let isFloat = false
    let hasExponent = false
    let exponentIsNegative = false
    let decimalPlaces = 0

    const PLUS = () => 43
    const MINUS = () => 45
    const DOT = () => 46
    const EXPONENT = () => 69
    const EXPONENT_LOWER = () => 101

    if (uint8Array[i] === MINUS()) {
        isNegative = true
        i++
    }
    else if (uint8Array[i] === PLUS()) {
        i++
    }

    while (i < end) {
        const byte = uint8Array[i]

        if (byte === DOT()) {
            if (isFloat)
                throw new Error('Multiple decimal points')

            isFloat = true
            i++
            continue
        }

        if (byte === EXPONENT() || byte === EXPONENT_LOWER()) {
            if (hasExponent)
                throw new Error('Multiple exponents')

            hasExponent = true
            i++

            if (i < end) {
                if (uint8Array[i] === MINUS()) {
                    exponentIsNegative = true
                    i++
                }
                else if (uint8Array[i] === PLUS()) {
                    i++
                }
            }

            break
        }

        if (byte < 48 || byte > 57) { // ASCII '0' to '9' are 48-57
            throw new Error('Non-digit character found')
        }

        const digit = byte - 48
        result = result * 10 + digit

        if (isFloat) {
            decimalPlaces++
        }

        i++
    }

    let exponent = 0
    if (hasExponent) {
        while (i < end) {
            const byte = uint8Array[i]

            if (byte < 48 || byte > 57) {
                throw new Error(`Non-digit in exponent: ${String.fromCharCode(byte)}`)
            }

            exponent = exponent * 10 + (byte - 48)
            i++
        }

        if (exponentIsNegative) {
            exponent = -exponent;
        }

        result = result * Math.pow(10, exponent)
    }

    if (isFloat && decimalPlaces > 0) {
        result = result / Math.pow(10, decimalPlaces)
    }

    if (isNegative) {
        result = -result
    }

    return result
}