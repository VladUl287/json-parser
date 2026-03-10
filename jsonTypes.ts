import { Converter } from "./json/converters/types"
import { TypeName } from "./metadata"

export type JsonOptions = {
    encoder?: TextEncoder
    decoder?: TextDecoder
    converters?: Map<TypeName, Converter>
    maxDepth?: number
    allowTrailingCommas?: boolean,
    fieldCaseInsensitive?: boolean
    allowDuplicateProperties?: boolean
}
