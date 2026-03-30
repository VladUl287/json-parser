import { JsonOptions } from "./types";

export function mergerOptions(base: JsonOptions, additional?: JsonOptions): JsonOptions {
    return {
        ...base,
        ...Object.fromEntries(
            Object.entries(additional ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: {
            ...base.converters,
            ...(additional?.converters ?? {})
        }
    }
}