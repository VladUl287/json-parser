import { convertNumber } from "./converters/number"
import { convertObject } from "./converters/object"
import { convertString } from "./converters/string"
import { Converter, ConvertResult, ConvertState } from "./converters/types"
import { Metadata, TypeName } from "./metadata/metadata"
import { error, Result } from "./utils/result"
import { JsonOptions } from "./options/types"
import { mergerOptions } from "./options"

const defaultOptions: JsonOptions = Object.freeze({
    encoder: new TextEncoder(),
    decoder: new TextDecoder('utf-8', {
        fatal: true
    }),
    converters: new Map<TypeName, Converter<unknown>>([
        ["number", convertNumber],
        ["string", convertString],
        ["object", convertObject]
    ]),
    maxDepth: 64,
    allowTrailingCommas: false,
    fieldCaseInsensitive: false,
    allowDuplicateProperties: false
})

let opt = null
export function deserialize<T>(json: Uint8Array<ArrayBuffer>, metadata: Metadata, options?: JsonOptions): T {
    opt ??= mergerOptions(defaultOptions, options)

    const result = convert({
        bytes: json,
        metadata: metadata,
        options: opt,
        convert: convert,
        index: 0,
        depth: 0
    })

    return result.getOrElse(undefined).value as T
}

function convert<T>(ctx: ConvertState): Result<ConvertResult<T>, string> {
    const { metadata, options, depth } = ctx

    if (depth > options.maxDepth)
        return error(`Max depth hit ${options.maxDepth}`)

    const converter = options.converters.get((metadata as Metadata).type)
    if (!converter)
        return error(`Converter not found for type ${(metadata as Metadata).type}`)

    return converter({
        ...ctx,
        depth: depth + 1
    }) as Result<ConvertResult<T>, string>
}