import { TypeName } from "../metadata/metadata";
import { Converter } from "../converters/types";
import { JsonOptions } from "./types";

export function addOptions(dest: JsonOptions, options?: JsonOptions): JsonOptions {
    return {
        ...dest,
        ...Object.fromEntries(
            Object.entries(options ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: new Map<TypeName, Converter<unknown>>([
            ...dest.converters,
            ...(options?.converters ?? [])
        ])
    }
}