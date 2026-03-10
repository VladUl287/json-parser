import { createCache } from "./cache/cache"
import { parseNumber } from "./converters/number"
import { parseObject } from "./converters/object"
import { parseString } from "./converters/string"
import { Converter, ConvertResult, ConvertState } from "./converters/types"
import { toMetadata, Metadata, TypeName } from "./metadata/metadata"
import { error, Result } from "./utils/result"
import { JsonOptions } from "./options/types"
import { addOptions } from "./options"

export function parseValue(ctx: ConvertState): Result<ConvertResult<unknown>, string> {
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
    converters: new Map<TypeName, Converter<unknown>>([
        ["number", parseNumber],
        ["string", parseString],
        ["object", parseObject]
    ]),
    maxDepth: 64,
    allowTrailingCommas: false,
    fieldCaseInsensitive: false,
    allowDuplicateProperties: false
})

export function deserialize<T>(json: string, object: T, options?: JsonOptions): T {
    options = addOptions(defaultOptions, options)

    const metadata = metadataCache.getOrAdd(object, (obj) => toMetadata(obj))

    const bytes = options.encoder.encode(json)

    const result = parseValue({
        bytes,
        metadata: metadata,
        options: options,
        index: 0,
        depth: 0
    })
    return result.getOrElse(undefined)[0] as T
}
