import { TypeName } from "../../metadata";
import { Converter } from "../converters/types";
import { JsonOptions } from "./types";

export function addOptions(dest: JsonOptions, options?: JsonOptions): JsonOptions {
    return {
        ...dest,
        ...Object.fromEntries(
            Object.entries(options ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: new Map<TypeName, Converter>([
            ...dest.converters,
            ...(options?.converters ?? [])
        ])
    }
}