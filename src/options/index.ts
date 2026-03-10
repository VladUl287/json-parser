import { TypeName } from "../metadata/metadata";
import { Converter } from "../converters/types";
import { JsonOptions } from "./types";

export function mergerOptions(base: JsonOptions, additional?: JsonOptions): JsonOptions {
    return {
        ...base,
        ...Object.fromEntries(
            Object.entries(additional ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: new Map<TypeName, Converter<unknown>>([
            ...base.converters,
            ...(additional?.converters ?? [])
        ])
    }
}