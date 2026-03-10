import { createCache } from "../cache"
import { parseNubmer } from "./converters/number"
import { parseObject } from "./converters/object"
import { parseString } from "./converters/string"
import { Converter, ConverterResult, ParseContext } from "./converters/types"
import { JsonOptions} from "./types"
import { toMetadata, Metadata, TypeName } from "../metadata"
import { error, success } from "../result"

export function parseValue(ctx: ParseContext): ConverterResult {
    const { metadata, options, depth } = ctx

    if (depth > options.maxDepth)
        return error(`Max depth hit ${options.maxDepth}`)

    const converter = options.converters.get((metadata as Metadata).type)
    if (!converter)
        return error(`Converter not found for type ${(metadata as Metadata).type}`)

    return converter({
        ...ctx,
        depth: depth + 1
    })
}

const metadataCache = createCache<unknown, Metadata>()

const defaultOptions: JsonOptions = Object.freeze({
    encoder: new TextEncoder(),
    decoder: new TextDecoder('utf-8', {
        fatal: true
    }),
    converters: new Map<TypeName, Converter>([
        ["number", parseNubmer],
        ["string", parseString],
        ["object", parseObject]
    ]),
    maxDepth: 64,
    allowTrailingCommas: false,
    fieldCaseInsensitive: false,
    allowDuplicateProperties: false
})

export function deserialize<T>(json: string, object: T, options?: JsonOptions): T {
    const jsonOptions: JsonOptions = {
        ...defaultOptions,
        ...Object.fromEntries(
            Object.entries(options ?? {}).filter(([_, value]) => Boolean(value))
        ),
        converters: new Map<TypeName, Converter>([
            ...defaultOptions.converters,
            ...(options?.converters ?? [])
        ])
    }

    const metadata = metadataCache.getOrAdd(object, (obj) => toMetadata(obj))

    const bytes = jsonOptions.encoder.encode(json)

    const result = parseValue({
        bytes,
        metadata: metadata,
        options: jsonOptions,
        index: 0,
        depth: 0
    })
    return result.getOrElse(undefined)[0] as T
}
