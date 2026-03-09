import { Metadata, TypeName } from "./metadata"
import { Result } from "./result"

export type Converter = (ctx: DeserializeContext) => Result<[unknown, number], string>

export type JsonOptions = {
    encoder?: TextEncoder
    converters?: Map<TypeName, Converter>
    maxDepth?: number
    allowTrailingCommas?: boolean,
    fieldCaseInsensitive?: boolean
    allowDuplicateProperties?: boolean
}

export type DeserializeContext = {
    bytes: Uint8Array<ArrayBuffer>
    metadata: Metadata | Metadata[]
    options: JsonOptions
    index: number
    depth: number
}
