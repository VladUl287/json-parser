export type TypeName =
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "object"
    | "array"
    | "date"
    | "map"
    | "set"
    | "undefined"
    | "function"

export type Metadata = {
    readonly type: TypeName
    readonly name?: string,
    readonly value?: Metadata | Metadata[]
    readonly defaultValue?: unknown
}

function getType(value: unknown): TypeName {
    if (Array.isArray(value))
        return "array"

    if (value instanceof Date)
        return "date"

    if (value instanceof Map) 
        return "map"

    if (value instanceof Set) 
        return "set"

    return typeof value
}

export function toMetadata(object: unknown): Metadata | undefined {
    return {
        defaultValue: object,
        type: getType(object),
        value: toValue(object)
    }

    function toValue(object: unknown): Metadata | Metadata[] {
        if (typeof object !== "object" || object instanceof Date)
            return

        if (Array.isArray(object))
            return {
                type: getType(object[0]),
                value: toValue(object[0])
            }

        return Object.keys(object)
            .map((key): Metadata => ({
                name: key,
                type: getType(object[key]),
                value: toValue(object[key]),
                defaultValue: object[key]
            }))
    }
}
