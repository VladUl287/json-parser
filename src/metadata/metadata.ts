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

type NameEquality = (name: Uint8Array, value: Uint8Array, offset: number) => boolean

export type Metadata = {
    readonly type: TypeName
    readonly name?: {
        raw: string,
        bytes: Uint8Array<ArrayBuffer>
        equal: NameEquality
    }
    readonly value?: Metadata | Metadata[]
    readonly defaultValue?: unknown
    readonly creator?: (props: any[]) => object
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

export function createObjectBuilder(propertyNames: [string, any][]): (props: [string, any][]) => object {
    const assignments = propertyNames
        .map((prop, index) => `${prop[0]}: props[${index}]`)
        .join(',')

    const body = `return {${assignments}}`

    return new Function("props", body) as (props: any[]) => object
}

const cacheNameEqualFunc = new Map<number, NameEquality>()
export function createNameEquality(count: number): NameEquality {
    const MAX_NAME_LENGTH_THRESHOLD = 25
    if (count > MAX_NAME_LENGTH_THRESHOLD)
        return equals_stricts

    const func = cacheNameEqualFunc.get(count)
    if (func)
        return func

    const conditions = new Array(count)
        .fill(0)
        .map((_, i) => `name[${i}]===value[offset+${i}]`)
        .join("&&")

    const result = new Function("name", "value", "offset", "return " + conditions) as NameEquality
    cacheNameEqualFunc.set(count, result)
    return result
}

function equals_stricts(name: Uint8Array, value: Uint8Array, offset: number): boolean {
    const length = name.length

    let i = 0

    while (i + 4 < length) {
        const a1 = name[i]
        const b1 = name[i + 1]
        const c1 = name[i + 2]
        const d1 = name[i + 3]

        const aa = value[offset + i]
        const bb = value[offset + i + 1]
        const cc = value[offset + i + 2]
        const dd = value[offset + i + 3]

        if (a1 !== aa || b1 !== bb || c1 !== cc || d1 !== dd)
            return false

        i += 4
    }

    while (i < length) {
        if (name[i] !== value[offset + i])
            return false
        i++
    }

    return true
}

const encoder = new TextEncoder()
export function toMetadata(object: unknown): Metadata {
    const value = toValue(object)
    const creator = createObjectBuilder((value as Metadata[]).map(c => {
        return [c.name.raw, c.defaultValue]
    }))

    return {
        defaultValue: object,
        type: getType(object),
        value: toValue(object),
        creator: creator
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
            .map((key): Metadata => {
                const keyBytes = encoder.encode(key)
                return {
                    name: {
                        raw: key,
                        bytes: keyBytes,
                        equal: createNameEquality(keyBytes.length)
                    },
                    type: getType(object[key]),
                    value: toValue(object[key]),
                    defaultValue: object[key]
                }
            })
    }
}
